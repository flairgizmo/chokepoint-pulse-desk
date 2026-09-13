/** Shared dusk cyclorama, floor, and key lights for film and stack stages. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { canUseBloom } from './webgl';

export function addCinemaSet(scene: THREE.Scene, lite: boolean, backdropSrc: string): void {
  const tex = new THREE.TextureLoader().load(backdropSrc, (next) => {
    next.colorSpace = THREE.SRGBColorSpace;
    next.needsUpdate = true;
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  scene.background = tex;
  scene.fog = new THREE.Fog(0x070b14, lite ? 9 : 7, lite ? 20 : 16);

  const cyc = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 12),
    new THREE.MeshBasicMaterial({ map: tex, color: 0x6b7a90 }),
  );
  cyc.position.set(0, 1.15, -5.1);
  scene.add(cyc);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5.4, lite ? 32 : 72),
    lite
      ? new THREE.MeshBasicMaterial({ color: 0x0a101c })
      : new THREE.MeshPhysicalMaterial({
          color: 0x101826,
          roughness: 0.1,
          metalness: 0.5,
          clearcoat: 0.85,
          clearcoatRoughness: 0.08,
        }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.72;
  scene.add(floor);

  scene.add(new THREE.AmbientLight(0x8ea0c0, lite ? 0.8 : 0.38));
  scene.add(new THREE.HemisphereLight(0xd4e0f5, 0x0a1220, lite ? 0.72 : 0.5));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 1.55 : 1.95);
  key.position.set(1.8, 2.9, 2.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3b7bff, lite ? 0.55 : 0.95);
  rim.position.set(-2.4, 1.3, -1.6);
  scene.add(rim);
}

export function plateMaterial(
  lite: boolean,
): THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial {
  return lite
    ? new THREE.MeshBasicMaterial({ color: 0x1a2438 })
    : new THREE.MeshPhysicalMaterial({
        color: 0x1a2438,
        roughness: 0.22,
        metalness: 0.1,
        clearcoat: 0.62,
        clearcoatRoughness: 0.22,
        envMapIntensity: 1.15,
      });
}

export function applyPlateMap(
  mat: THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial,
  tex: THREE.Texture,
): void {
  mat.map = tex;
  mat.color = new THREE.Color(0xffffff);
  mat.needsUpdate = true;
}

/** Room IBL and bloom only on a named hardware GPU. Software GL stays fail-closed. */
export function addUnrealLook(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  lite: boolean,
): EffectComposer | null {
  if (!lite) {
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Lights-only path if RoomEnvironment stalls.
    }
  }
  if (!canUseBloom(renderer)) return null;
  try {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(8, 8), 0.4, 0.46, 0.8));
    composer.addPass(new OutputPass());
    return composer;
  } catch {
    return null;
  }
}
