/** Shared dusk cyclorama, floor, and key lights for film and stack stages. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { canUseBloom } from './webgl';

export function cinemaFloorMap(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, 512, 512);
    const g = ctx.createRadialGradient(256, 256, 12, 256, 256, 248);
    g.addColorStop(0, 'rgba(210, 224, 255, 0.42)');
    g.addColorStop(0.28, 'rgba(21, 87, 255, 0.16)');
    g.addColorStop(0.62, 'rgba(10, 18, 32, 0.55)');
    g.addColorStop(1, 'rgba(7, 11, 20, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(234, 241, 255, 0.08)';
    ctx.lineWidth = 2;
    for (const r of [70, 130, 190, 250]) {
      ctx.beginPath();
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function addCinemaSet(scene: THREE.Scene, lite: boolean, backdropSrc: string): void {
  const tex = new THREE.TextureLoader().load(backdropSrc, (next) => {
    next.colorSpace = THREE.SRGBColorSpace;
    next.needsUpdate = true;
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  scene.background = tex;
  if (!lite) scene.fog = new THREE.Fog(0x0a1220, 8.5, 18);

  const cycMat = new THREE.MeshBasicMaterial({ map: tex });
  const cyc = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), cycMat);
  cyc.position.set(0, 2.05, -7.1);
  scene.add(cyc);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), cycMat);
  left.position.set(-12.2, 1.55, -3.4);
  left.rotation.y = 0.78;
  scene.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), cycMat);
  right.position.set(12.2, 1.55, -3.4);
  right.rotation.y = -0.78;
  scene.add(right);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(6.4, lite ? 48 : 96),
    lite
      ? new THREE.MeshBasicMaterial({ map: cinemaFloorMap(), transparent: true, opacity: 0.94 })
      : new THREE.MeshPhysicalMaterial({
          color: 0x101826,
          roughness: 0.08,
          metalness: 0.55,
          clearcoat: 0.9,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.35,
        }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.62;
  scene.add(floor);

  scene.add(new THREE.AmbientLight(0x9aacc8, lite ? 0.95 : 0.4));
  scene.add(new THREE.HemisphereLight(0xe4edff, 0x0a1220, lite ? 0.88 : 0.52));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 2.15 : 1.95);
  key.position.set(1.8, 2.9, 2.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3b7bff, lite ? 0.85 : 0.95);
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
