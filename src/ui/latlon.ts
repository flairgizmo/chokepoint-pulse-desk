import { MathUtils, Vector3 } from 'three';

/** Match Three.js SphereGeometry UVs: texture centre (lon 0) sits on +X. */
export function latLonToVec(lat: number, lon: number, r: number): Vector3 {
  const phi = MathUtils.degToRad(90 - lat);
  const theta = MathUtils.degToRad(lon + 180);
  return new Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export function vecToLatLon(v: Vector3): { lat: number; lon: number } {
  const n = v.clone().normalize();
  const lat = 90 - MathUtils.radToDeg(Math.acos(MathUtils.clamp(n.y, -1, 1)));
  let lon = MathUtils.radToDeg(Math.atan2(n.z, -n.x)) - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}
