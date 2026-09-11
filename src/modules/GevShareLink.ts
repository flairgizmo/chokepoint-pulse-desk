/**
 * GevShareLink — encodes URL hashes compatible with God's Eye View
 * `src/sharelink.js` (ShareLinkManager._buildHashParams) and
 * `src/data/layerState.js` (v2 `l` / `lo` layer handoff).
 *
 * Format:
 * #v=&lat=&lon=&alt=&heading=&pitch=&style=&bloom=&bi=&bv=&sharpen=&si=&hud=&hv=&dm=&dd=&da=&kf=&ko=&cr=&map=&l=&lo=
 *
 * Style URL names: normal, crt, nvg, flir, anime, noir, snow
 * Layer tokens follow full GEV LAYER_STATE_REGISTRY order; Pulse emits a subset (a/e/f/m/s/t…).
 */

export type GevStyleUrl =
  | 'normal'
  | 'crt'
  | 'nvg'
  | 'flir'
  | 'anime'
  | 'noir'
  | 'snow';

export type GevMapStack = 'photoreal' | 'satellite' | 'osm' | string;

/** Layer ids Pulse Desk can hand off into GEV v2 `l`. */
export type GevLayerId =
  | 'ais'
  | 'flights'
  | 'earthquakes'
  | 'satellites'
  | 'military'
  | 'traffic';

export interface GevShareState {
  lat: number;
  lon: number;
  alt?: number;
  heading?: number;
  pitch?: number;
  roll?: number;
  style?: GevStyleUrl;
  bloom?: boolean;
  sharpen?: boolean;
  bloomIntensity?: number;
  bloomVersion?: number;
  sharpenIntensity?: number;
  hud?: string;
  hudVisible?: boolean;
  detectionMode?: string;
  detectionDensity?: number;
  detectionAllocation?: string;
  detectionFadePct?: number;
  detectionOutsideOpacityPct?: number;
  celestialRing?: boolean;
  scopeEnabled?: boolean;
  scopeFeatherPct?: number;
  map?: GevMapStack;
  /** Share schema version GEV writes as `v` */
  version?: number;
  /**
   * Enabled GEV overlay layers → hash `l` (tokens joined by `.` in registry order).
   * Emitting `l` forces `v=2`.
   */
  enabledLayers?: GevLayerId[];
  /**
   * Optional flights tracking ICAO24 → `lo=f.t.<id>` when flights are enabled.
   * Must match /^[0-9a-z~_-]{1,16}$/ after lowercasing; invalid ids are omitted.
   */
  flightTrackingId?: string | null;
}

export interface GevBuildOptions {
  /** Base URL without hash. Default: http://localhost:4173 */
  baseUrl?: string;
  /** Include v=2 (GEV current). Default true. */
  includeVersion?: boolean;
  /** Include scope fields sc/scf. Default true for GEV parity. */
  includeScope?: boolean;
}

const DEFAULT_BASE = 'http://localhost:4173';

const STYLE_URLS: readonly GevStyleUrl[] = [
  'normal',
  'crt',
  'nvg',
  'flir',
  'anime',
  'noir',
  'snow',
] as const;

/** GEV layer registry tokens we emit (subset of full a,b,c,e,f,… order). */
const LAYER_ID_TO_TOKEN: Record<GevLayerId, string> = {
  ais: 'a',
  earthquakes: 'e',
  flights: 'f',
  military: 'm',
  satellites: 's',
  traffic: 't',
};

const LAYER_TOKEN_TO_ID: Record<string, GevLayerId> = {
  a: 'ais',
  e: 'earthquakes',
  f: 'flights',
  m: 'military',
  s: 'satellites',
  t: 'traffic',
};

/**
 * Canonical GEV LAYER_STATE_REGISTRY order (full token stream from upstream).
 * Only tokens present in LAYER_ID_TO_TOKEN are ever emitted from Pulse Desk;
 * unknown neighbors stay in the order list so multi-layer joins stay GEV-correct.
 */
const LAYER_REGISTRY_ORDER: readonly string[] = [
  'a', // ais-live-vessels
  'b', // bikeshare
  'c', // cctv
  'e', // earthquakes
  'f', // flights
  'q', // local-dams
  'd', // local-datacenters
  'w', // local-firms
  'm', // military
  'g', // military-awareness
  'i', // military-installations
  'r', // radio
  'x', // rocket-launches
  's', // satellites
  'u', // telegeography-submarine-cables
  't', // traffic
] as const;

/** GEV option value grammar for `lo` triples. */
const LO_VALUE_RE = /^[0-9a-z~_-]{1,16}$/;

export class GevShareLink {
  static readonly DEFAULT_BASE_URL = DEFAULT_BASE;
  static readonly STYLE_URL_NAMES = STYLE_URLS;
  static readonly LAYER_ID_TO_TOKEN = LAYER_ID_TO_TOKEN;
  static readonly LAYER_REGISTRY_ORDER = LAYER_REGISTRY_ORDER;

  /** Normalize / validate a style URL name; unknown → normal. */
  static normalizeStyle(style: string | undefined | null): GevStyleUrl {
    if (!style) return 'normal';
    const lower = style.toLowerCase();
    // Accept GEV internal names as aliases
    const aliases: Record<string, GevStyleUrl> = {
      normal: 'normal',
      crt: 'crt',
      retro: 'crt',
      nvg: 'nvg',
      surveillance: 'nvg',
      flir: 'flir',
      thermal: 'flir',
      anime: 'anime',
      noir: 'noir',
      snow: 'snow',
    };
    return aliases[lower] ?? 'normal';
  }

  /** Map layer ids → registry tokens in canonical order (deduped). */
  static encodeLayerTokens(layers: readonly GevLayerId[]): string {
    const wanted = new Set<string>();
    for (const id of layers) {
      const token = LAYER_ID_TO_TOKEN[id];
      if (token) wanted.add(token);
    }
    return LAYER_REGISTRY_ORDER.filter((t) => wanted.has(t)).join('.');
  }

  /**
   * Normalize a flights tracking id for `lo=f.t.<id>`.
   * Returns null if missing/invalid (prefer omit from lo rather than truncate).
   */
  static normalizeFlightTrackingId(
    id: string | null | undefined,
  ): string | null {
    if (id == null) return null;
    const normalized = String(id).trim().toLowerCase();
    if (!normalized || !LO_VALUE_RE.test(normalized)) return null;
    return normalized;
  }

  /** Build URLSearchParams for the hash (without leading #). */
  static encodeParams(
    state: GevShareState,
    options: GevBuildOptions = {},
  ): URLSearchParams {
    const includeVersion = options.includeVersion !== false;
    const includeScope = options.includeScope !== false;

    const lat = GevShareLink.assertFinite(state.lat, 'lat');
    const lon = GevShareLink.assertFinite(state.lon, 'lon');
    const alt = Math.round(GevShareLink.finiteOr(state.alt, 800));
    const heading = Math.round(GevShareLink.finiteOr(state.heading, 0));
    const pitch = Math.round(GevShareLink.finiteOr(state.pitch, -35));
    const roll = Math.round(GevShareLink.finiteOr(state.roll, 0));
    const style = GevShareLink.normalizeStyle(state.style);

    const layerTokens =
      state.enabledLayers && state.enabledLayers.length > 0
        ? GevShareLink.encodeLayerTokens(state.enabledLayers)
        : '';
    const emitLayers = layerTokens.length > 0;

    const params = new URLSearchParams();
    if (includeVersion || emitLayers) {
      // Emitting `l` requires v=2 for GEV layer decode
      params.set('v', String(emitLayers ? 2 : (state.version ?? 2)));
    }
    params.set('lat', lat.toFixed(4));
    params.set('lon', lon.toFixed(4));
    params.set('alt', String(alt));
    params.set('heading', String(heading));
    params.set('pitch', String(pitch));
    params.set('roll', String(roll));
    params.set('style', style);
    params.set('bloom', state.bloom ? '1' : '0');
    params.set('sharpen', state.sharpen ? '1' : '0');
    params.set('bi', String(Math.round(GevShareLink.finiteOr(state.bloomIntensity, 50))));
    params.set('bv', String(Math.round(GevShareLink.finiteOr(state.bloomVersion, 2))));
    params.set('si', String(Math.round(GevShareLink.finiteOr(state.sharpenIntensity, 49))));
    params.set('hud', state.hud ?? 'tactical');
    params.set('hv', state.hudVisible ? '1' : '0');
    params.set('dm', (state.detectionMode ?? 'OFF').toUpperCase());
    params.set('dd', String(Math.round(GevShareLink.finiteOr(state.detectionDensity, 50))));
    params.set(
      'da',
      (state.detectionAllocation ?? 'elastic').toLowerCase(),
    );
    params.set('kf', String(Math.round(GevShareLink.finiteOr(state.detectionFadePct, 16))));
    params.set(
      'ko',
      String(Math.round(GevShareLink.finiteOr(state.detectionOutsideOpacityPct, 1))),
    );
    params.set('cr', state.celestialRing ? '1' : '0');
    if (includeScope) {
      params.set('sc', state.scopeEnabled === false ? '0' : '1');
      params.set(
        'scf',
        String(Math.round(GevShareLink.finiteOr(state.scopeFeatherPct, 11))),
      );
    }
    params.set('map', state.map ?? 'photoreal');

    if (emitLayers) {
      params.set('l', layerTokens);
      const flightsOn = layerTokens.split('.').includes('f');
      const trackingId = GevShareLink.normalizeFlightTrackingId(
        state.flightTrackingId,
      );
      if (flightsOn && trackingId) {
        params.set('lo', `f.t.${trackingId}`);
      }
    }

    return params;
  }

  /** Hash fragment including leading #. */
  static encodeHash(state: GevShareState, options: GevBuildOptions = {}): string {
    return `#${GevShareLink.encodeParams(state, options).toString()}`;
  }

  /** Full deep-link URL. */
  static buildUrl(state: GevShareState, options: GevBuildOptions = {}): string {
    const base = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
    return `${base}/${GevShareLink.encodeHash(state, options)}`;
  }

  /** Parse a GEV share hash or full URL back into state (best-effort). */
  static parse(hashOrUrl: string): GevShareState | null {
    let hash = hashOrUrl.trim();
    try {
      if (hash.includes('://') || hash.startsWith('//')) {
        const u = new URL(hash.startsWith('//') ? `http:${hash}` : hash);
        hash = u.hash;
      }
    } catch {
      // treat as raw hash
    }
    if (hash.startsWith('#')) hash = hash.slice(1);
    if (!hash) return null;

    const params = new URLSearchParams(hash);
    const lat = parseFloat(params.get('lat') ?? '');
    const lon = parseFloat(params.get('lon') ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const num = (key: string, fallback: number) => {
      const v = parseFloat(params.get(key) ?? '');
      return Number.isFinite(v) ? v : fallback;
    };

    const enabledLayers = GevShareLink.parseLayerParam(params.get('l'));
    const flightTrackingId = GevShareLink.parseFlightTrackingFromLo(
      params.get('lo'),
    );

    const state: GevShareState = {
      lat,
      lon,
      alt: num('alt', 800),
      heading: num('heading', 0),
      pitch: num('pitch', -35),
      roll: num('roll', 0),
      style: GevShareLink.normalizeStyle(params.get('style')),
      bloom: params.get('bloom') === '1',
      sharpen: params.get('sharpen') === '1',
      bloomIntensity: num('bi', 50),
      bloomVersion: num('bv', 1),
      sharpenIntensity: num('si', 49),
      hud: params.get('hud') || 'tactical',
      hudVisible: params.get('hv') === '1',
      detectionMode: params.get('dm') || 'OFF',
      detectionDensity: num('dd', 50),
      detectionAllocation: params.get('da') || 'elastic',
      detectionFadePct: num('kf', 16),
      detectionOutsideOpacityPct: num('ko', 5),
      celestialRing: params.get('cr') === '1',
      scopeEnabled: params.has('sc') ? params.get('sc') === '1' : true,
      scopeFeatherPct: num('scf', 35),
      map: params.get('map') || 'photoreal',
      version: num('v', 1),
    };

    if (enabledLayers.length > 0) state.enabledLayers = enabledLayers;
    if (flightTrackingId) state.flightTrackingId = flightTrackingId;

    return state;
  }

  /** Decode `l=a.f.e` → layer ids in registry order. */
  static parseLayerParam(raw: string | null): GevLayerId[] {
    if (!raw) return [];
    const out: GevLayerId[] = [];
    const seen = new Set<GevLayerId>();
    for (const token of raw.split('.')) {
      if (!token) continue;
      const id = LAYER_TOKEN_TO_ID[token];
      if (id && !seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
    // Re-order to registry order for stable round-trips
    const orderIndex = new Map(
      LAYER_REGISTRY_ORDER.map((t, i) => [LAYER_TOKEN_TO_ID[t], i] as const),
    );
    return out.sort(
      (a, b) => (orderIndex.get(a) ?? 99) - (orderIndex.get(b) ?? 99),
    );
  }

  /** Pull flights tracking id from `lo` option triples (`f.t.<icao24>`). */
  static parseFlightTrackingFromLo(raw: string | null): string | null {
    if (!raw) return null;
    for (const triple of raw.split('_')) {
      const parts = triple.split('.');
      if (parts.length !== 3) continue;
      const [owner, option, value] = parts;
      if (owner === 'f' && option === 't') {
        return GevShareLink.normalizeFlightTrackingId(value);
      }
    }
    return null;
  }

  private static assertFinite(n: number, label: string): number {
    if (!Number.isFinite(n)) {
      throw new TypeError(`GevShareLink: ${label} must be a finite number`);
    }
    return n;
  }

  private static finiteOr(n: number | undefined, fallback: number): number {
    return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
  }
}
