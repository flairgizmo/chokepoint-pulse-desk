import { describe, expect, it } from 'vitest';
import { latLonToVec, vecToLatLon } from '../src/ui/latlon';

describe('Earth lat/lon', () => {
  it('puts Greenwich on the SphereGeometry +X seam, not Central Asia', () => {
    const london = latLonToVec(51.5074, -0.1278, 1);
    expect(london.x).toBeGreaterThan(0.55);
    expect(Math.abs(london.z)).toBeLessThan(0.05);
    const back = vecToLatLon(london);
    expect(back.lat).toBeCloseTo(51.5074, 1);
    expect(back.lon).toBeCloseTo(-0.1278, 1);
  });

  it('keeps New York west of Greenwich and Tokyo east', () => {
    const ny = latLonToVec(40.7128, -74.006, 1);
    const tokyo = latLonToVec(35.6762, 139.6503, 1);
    expect(ny.z).toBeGreaterThan(0.4);
    expect(tokyo.z).toBeLessThan(-0.3);
  });
});
