/**
 * Live public tickers — keyless only.
 * USGS Earthquake Hazards Program (public domain).
 * Optional adsb.lol point queries (ODbL) — degrade honestly if blocked/CORS/fail.
 */

export type FeedStatus = 'live' | 'degraded' | 'EXAMPLE';

export interface FeedMeta {
  id: string;
  label: string;
  status: FeedStatus;
  sourceUrl: string;
  attribution: string;
  commercialOk: boolean | 'unknown';
  lastUpdated: string | null;
  error?: string;
}

export interface QuakeItem {
  id: string;
  mag: number | null;
  place: string;
  time: number;
  lat: number;
  lon: number;
  depthKm: number | null;
  url: string;
}

export interface QuakeFeedResult extends FeedMeta {
  items: QuakeItem[];
}

export interface AircraftItem {
  icao: string;
  callsign: string | null;
  lat: number;
  lon: number;
  altFt: number | null;
  gsKt: number | null;
}

export interface AircraftFeedResult extends FeedMeta {
  regionId: string;
  items: AircraftItem[];
  note?: string;
}

const USGS_4_5_DAY =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';
const USGS_SIGNIFICANT_DAY =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson';

export class LiveFeeds {
  static readonly USGS_SOURCE = USGS_4_5_DAY;
  static readonly USGS_SIGNIFICANT = USGS_SIGNIFICANT_DAY;

  /** Fetch USGS M4.5+ day feed; fall back to significant_day; never invent events. */
  static async fetchEarthquakes(signal?: AbortSignal): Promise<QuakeFeedResult> {
    const started = new Date().toISOString();
    try {
      const primary = await LiveFeeds.fetchUsgs(USGS_4_5_DAY, signal);
      if (primary.items.length > 0 || primary.status === 'live') {
        return primary;
      }
    } catch (err) {
      // try significant
      try {
        const fallback = await LiveFeeds.fetchUsgs(USGS_SIGNIFICANT_DAY, signal);
        fallback.error = `Primary 4.5_day failed: ${LiveFeeds.errMsg(err)}`;
        return fallback;
      } catch (err2) {
        return {
          id: 'usgs-quakes',
          label: 'USGS Earthquakes (M4.5+ day)',
          status: 'degraded',
          sourceUrl: USGS_4_5_DAY,
          attribution: 'Credit: U.S. Geological Survey',
          commercialOk: true,
          lastUpdated: started,
          items: [],
          error: LiveFeeds.errMsg(err2),
        };
      }
    }

    // empty but successful
    return {
      id: 'usgs-quakes',
      label: 'USGS Earthquakes (M4.5+ day)',
      status: 'live',
      sourceUrl: USGS_4_5_DAY,
      attribution: 'Credit: U.S. Geological Survey',
      commercialOk: true,
      lastUpdated: new Date().toISOString(),
      items: [],
    };
  }

  private static async fetchUsgs(
    url: string,
    signal?: AbortSignal,
  ): Promise<QuakeFeedResult> {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    const data = (await res.json()) as {
      metadata?: { generated?: number; title?: string; url?: string };
      features?: Array<{
        id: string;
        properties: {
          mag: number | null;
          place: string;
          time: number;
          url: string;
        };
        geometry: { coordinates: [number, number, number] };
      }>;
    };

    const items: QuakeItem[] = (data.features ?? []).slice(0, 12).map((f) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place ?? 'Unknown',
      time: f.properties.time,
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      depthKm: f.geometry.coordinates[2] ?? null,
      url: f.properties.url,
    }));

    const generated = data.metadata?.generated
      ? new Date(data.metadata.generated).toISOString()
      : new Date().toISOString();

    return {
      id: 'usgs-quakes',
      label: url.includes('significant')
        ? 'USGS Significant (day)'
        : 'USGS Earthquakes (M4.5+ day)',
      status: 'live',
      sourceUrl: url,
      attribution: 'Credit: U.S. Geological Survey',
      commercialOk: true,
      lastUpdated: generated,
      items,
    };
  }

  /**
   * Optional keyless aircraft probe via adsb.lol point API.
   * CORS may block browser calls — status becomes degraded/EXAMPLE, never fake planes.
   */
  static async fetchAircraftNear(
    regionId: string,
    lat: number,
    lon: number,
    radiusNm = 100,
    signal?: AbortSignal,
  ): Promise<AircraftFeedResult> {
    const sourceUrl = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${radiusNm}`;
    const metaBase = {
      id: `adsb-${regionId}`,
      label: `Aircraft near ${regionId}`,
      sourceUrl,
      attribution: '© adsb.lol contributors (ODbL 1.0)',
      commercialOk: true as const,
      regionId,
    };

    try {
      const res = await fetch(sourceUrl, {
        signal,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        return {
          ...metaBase,
          status: 'degraded',
          lastUpdated: new Date().toISOString(),
          items: [],
          error: `HTTP ${res.status}`,
          note: 'adsb.lol responded with an error. No aircraft invented.',
        };
      }
      const data = (await res.json()) as {
        ac?: Array<{
          hex?: string;
          flight?: string;
          lat?: number;
          lon?: number;
          alt_baro?: number | string;
          gs?: number;
        }>;
      };
      const items: AircraftItem[] = (data.ac ?? [])
        .filter((a) => typeof a.lat === 'number' && typeof a.lon === 'number')
        .slice(0, 8)
        .map((a) => ({
          icao: (a.hex ?? '????').toUpperCase(),
          callsign: a.flight?.trim() || null,
          lat: a.lat as number,
          lon: a.lon as number,
          altFt:
            typeof a.alt_baro === 'number'
              ? a.alt_baro
              : a.alt_baro === 'ground'
                ? 0
                : null,
          gsKt: typeof a.gs === 'number' ? a.gs : null,
        }));

      return {
        ...metaBase,
        status: 'live',
        lastUpdated: new Date().toISOString(),
        items,
      };
    } catch (err) {
      return {
        ...metaBase,
        status: 'EXAMPLE',
        lastUpdated: new Date().toISOString(),
        items: [],
        error: LiveFeeds.errMsg(err),
        note:
          'Browser CORS or network blocked adsb.lol. Chip marked EXAMPLE — zero invented tracks. Open source URL directly or proxy later.',
      };
    }
  }

  private static errMsg(err: unknown): string {
    if (err instanceof Error) return err.message;
    return String(err);
  }
}
