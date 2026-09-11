import { describe, expect, it } from 'vitest';
import { GevShareLink } from '../src/modules/GevShareLink';
import { MissionBook } from '../src/modules/missions';

describe('GevShareLink', () => {
  it('encodes the core hash keys GEV sharelink.js expects', () => {
    const hash = GevShareLink.encodeHash({
      lat: 26.5667,
      lon: 56.25,
      alt: 42000,
      heading: 215,
      pitch: -42,
      style: 'flir',
      bloom: false,
      sharpen: true,
      hudVisible: true,
      detectionMode: 'OFF',
      map: 'photoreal',
    });

    expect(hash.startsWith('#')).toBe(true);
    const params = new URLSearchParams(hash.slice(1));
    expect(params.get('v')).toBe('2');
    expect(params.get('lat')).toBe('26.5667');
    expect(params.get('lon')).toBe('56.2500');
    expect(params.get('alt')).toBe('42000');
    expect(params.get('heading')).toBe('215');
    expect(params.get('pitch')).toBe('-42');
    expect(params.get('style')).toBe('flir');
    expect(params.get('bloom')).toBe('0');
    expect(params.get('sharpen')).toBe('1');
    expect(params.get('bi')).toBeTruthy();
    expect(params.get('bv')).toBeTruthy();
    expect(params.get('si')).toBeTruthy();
    expect(params.get('hud')).toBe('tactical');
    expect(params.get('hv')).toBe('1');
    expect(params.get('dm')).toBe('OFF');
    expect(params.get('dd')).toBeTruthy();
    expect(params.get('da')).toBe('elastic');
    expect(params.get('kf')).toBeTruthy();
    expect(params.get('ko')).toBeTruthy();
    expect(params.get('cr')).toBe('0');
    expect(params.get('map')).toBe('photoreal');
  });

  it('normalizes GEV internal style names to URL names', () => {
    expect(GevShareLink.normalizeStyle('retro')).toBe('crt');
    expect(GevShareLink.normalizeStyle('surveillance')).toBe('nvg');
    expect(GevShareLink.normalizeStyle('thermal')).toBe('flir');
    expect(GevShareLink.normalizeStyle('unknown')).toBe('normal');
  });

  it('supports all documented style URL names', () => {
    for (const style of GevShareLink.STYLE_URL_NAMES) {
      const params = GevShareLink.encodeParams({ lat: 0, lon: 0, style });
      expect(params.get('style')).toBe(style);
    }
  });

  it('builds configurable base URLs', () => {
    const url = GevShareLink.buildUrl(
      { lat: 1.23, lon: 4.56, alt: 1000 },
      { baseUrl: 'http://localhost:4173' },
    );
    expect(url.startsWith('http://localhost:4173/#')).toBe(true);
    expect(url).toContain('lat=1.2300');
    expect(url).toContain('lon=4.5600');
  });

  it('round-trips parse ↔ encode for camera fields', () => {
    const original = {
      lat: 30.45,
      lon: 32.35,
      alt: 28000,
      heading: 0,
      pitch: -48,
      style: 'nvg' as const,
      bloom: true,
      map: 'photoreal',
    };
    const url = GevShareLink.buildUrl(original);
    const parsed = GevShareLink.parse(url);
    expect(parsed).not.toBeNull();
    expect(parsed!.lat).toBeCloseTo(30.45, 4);
    expect(parsed!.lon).toBeCloseTo(32.35, 4);
    expect(parsed!.alt).toBe(28000);
    expect(parsed!.style).toBe('nvg');
    expect(parsed!.bloom).toBe(true);
  });

  it('rejects non-finite coordinates', () => {
    expect(() =>
      GevShareLink.encodeHash({ lat: Number.NaN, lon: 0 }),
    ).toThrow(/lat/);
  });

  it('emits a valid deep-link for every mission chokepoint', () => {
    for (const mission of MissionBook.all()) {
      const url = MissionBook.gevUrl(mission);
      expect(url).toMatch(/^http:\/\/localhost:4173\/#/);
      const parsed = GevShareLink.parse(url);
      expect(parsed?.lat).toBeCloseTo(mission.camera.lat, 3);
      expect(parsed?.lon).toBeCloseTo(mission.camera.lon, 3);
      expect(parsed?.alt).toBe(mission.camera.alt);
      expect(parsed?.enabledLayers).toEqual([mission.primaryLayer]);
      expect(parsed?.version).toBe(2);
    }
  });

  it('Hormuz URL contains l=a (AIS primary layer)', () => {
    const hormuz = MissionBook.byId('hormuz')!;
    const url = MissionBook.gevUrl(hormuz);
    const params = new URLSearchParams(url.split('#')[1]);
    expect(params.get('v')).toBe('2');
    expect(params.get('l')).toBe('a');
    expect(params.get('lo')).toBeNull();
  });

  it('Taiwan URL contains l=f (flights primary layer)', () => {
    const taiwan = MissionBook.byId('taiwan')!;
    const url = MissionBook.gevUrl(taiwan);
    const params = new URLSearchParams(url.split('#')[1]);
    expect(params.get('v')).toBe('2');
    expect(params.get('l')).toBe('f');
  });

  it('emits lo=f.t.<id> when flightTrackingId set and flights are enabled', () => {
    const params = GevShareLink.encodeParams({
      lat: 24.5,
      lon: 119.5,
      enabledLayers: ['flights'],
      flightTrackingId: 'abcdef',
    });
    expect(params.get('l')).toBe('f');
    expect(params.get('lo')).toBe('f.t.abcdef');
    expect(params.get('v')).toBe('2');
  });

  it('omits lo for invalid tracking id but still encodes l', () => {
    const params = GevShareLink.encodeParams({
      lat: 24.5,
      lon: 119.5,
      enabledLayers: ['flights'],
      flightTrackingId: 'NOT VALID!!!',
    });
    expect(params.get('l')).toBe('f');
    expect(params.get('lo')).toBeNull();
    expect(params.get('v')).toBe('2');
  });

  it('omits lo when tracking id exceeds 16 chars (no truncate)', () => {
    const params = GevShareLink.encodeParams({
      lat: 0,
      lon: 0,
      enabledLayers: ['flights'],
      flightTrackingId: 'abcdefghijklmnopqr',
    });
    expect(params.get('l')).toBe('f');
    expect(params.get('lo')).toBeNull();
  });

  it('does not emit lo when flights layer is not enabled', () => {
    const params = GevShareLink.encodeParams({
      lat: 0,
      lon: 0,
      enabledLayers: ['ais'],
      flightTrackingId: 'abcdef',
    });
    expect(params.get('l')).toBe('a');
    expect(params.get('lo')).toBeNull();
  });

  it('round-trip parse recovers layers and flight tracking', () => {
    const url = GevShareLink.buildUrl({
      lat: 24.5,
      lon: 119.5,
      alt: 65000,
      enabledLayers: ['ais', 'flights'],
      flightTrackingId: 'AbCdEf',
    });
    const parsed = GevShareLink.parse(url);
    expect(parsed).not.toBeNull();
    expect(parsed!.enabledLayers).toEqual(['ais', 'flights']);
    expect(parsed!.flightTrackingId).toBe('abcdef');
    expect(parsed!.version).toBe(2);
    const params = new URLSearchParams(url.split('#')[1]);
    expect(params.get('l')).toBe('a.f');
    expect(params.get('lo')).toBe('f.t.abcdef');
  });

  it('encodes layer tokens in canonical registry order', () => {
    expect(
      GevShareLink.encodeLayerTokens(['traffic', 'ais', 'flights', 'earthquakes']),
    ).toBe('a.e.f.t');
  });
});
