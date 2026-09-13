/** Shared dusk cyclorama, floor, and key lights for film and stack stages. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { canUseBloom } from './webgl';

type CubeFace = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz';

const CUBE_FACES: CubeFace[] = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

/** Unique Canary crops so each cube face reflects a different slice of the still. */
const CANARY_CROP: Record<CubeFace, readonly [number, number, number, number]> = {
  px: [0.52, 0.1, 0.48, 0.7],
  nx: [0.0, 0.12, 0.46, 0.68],
  py: [0.2, 0.0, 0.6, 0.36],
  ny: [0.12, 0.58, 0.76, 0.42],
  pz: [0.24, 0.14, 0.52, 0.68],
  nz: [0.42, 0.22, 0.48, 0.6],
};

const CANARY_WASH: Record<CubeFace, string> = {
  px: 'rgba(10, 22, 48, 0.28)',
  nx: 'rgba(8, 16, 36, 0.36)',
  py: 'rgba(8, 14, 28, 0.58)',
  ny: 'rgba(2, 6, 15, 0.64)',
  pz: 'rgba(12, 24, 52, 0.22)',
  nz: 'rgba(6, 18, 44, 0.34)',
};

function paintDuskFace(kind: CubeFace, canvas = document.createElement('canvas')): HTMLCanvasElement {
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const g = ctx.createLinearGradient(0, 0, kind === 'px' || kind === 'nx' ? 256 : 0, 256);
  if (kind === 'py') {
    g.addColorStop(0, '#8aa3c8');
    g.addColorStop(1, '#2a3d5c');
  } else if (kind === 'ny') {
    g.addColorStop(0, '#0b1220');
    g.addColorStop(1, '#02060f');
  } else if (kind === 'pz' || kind === 'px') {
    g.addColorStop(0, '#1a3a6a');
    g.addColorStop(0.42, '#e0b56a');
    g.addColorStop(1, '#061018');
  } else {
    g.addColorStop(0, '#0d2248');
    g.addColorStop(0.55, '#1557FF');
    g.addColorStop(1, '#02060f');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(255, 228, 176, 0.42)';
  for (let i = 0; i < 48; i++) {
    ctx.fillRect((i * 53) % 256, 150 + ((i * 23) % 90), 2, 2);
  }
  return canvas;
}

function stampCanaryFace(ctx: CanvasRenderingContext2D, img: HTMLImageElement, kind: CubeFace): void {
  const [fx, fy, fw, fh] = CANARY_CROP[kind];
  const sx = fx * img.width;
  const sy = fy * img.height;
  const sw = Math.max(1, fw * img.width);
  const sh = Math.max(1, fh * img.height);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 256, 256);
  ctx.fillStyle = CANARY_WASH[kind];
  ctx.fillRect(0, 0, 256, 256);
  if (kind === 'py' || kind === 'ny') return;
  ctx.fillStyle = 'rgba(255, 228, 176, 0.46)';
  for (let i = 0; i < 36; i++) {
    ctx.fillRect((i * 53) % 256, 142 + ((i * 23) % 78), 2, 2);
  }
}

const duskFaces = CUBE_FACES.map((kind) => paintDuskFace(kind));
let duskEnv: THREE.CubeTexture | null = null;
let canaryStampStarted = false;

/** Stamp the live Canary still onto the painted cube. Painted faces stay if the JPEG fails. */
function stampCanaryOntoDusk(): void {
  if (canaryStampStarted || typeof Image === 'undefined') return;
  canaryStampStarted = true;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    CUBE_FACES.forEach((kind, i) => {
      const ctx = duskFaces[i]?.getContext('2d');
      if (ctx) stampCanaryFace(ctx, img, kind);
    });
    if (duskEnv) duskEnv.needsUpdate = true;
  };
  img.src = '/visuals/topics/canary.jpg';
}

/** Canary-dusk cube. Painted sync fallback; Vision photograph stamped after load. No PMREM. */
export function duskCubeMap(): THREE.CubeTexture {
  if (duskEnv) return duskEnv;
  duskEnv = new THREE.CubeTexture(duskFaces);
  duskEnv.colorSpace = THREE.SRGBColorSpace;
  duskEnv.needsUpdate = true;
  stampCanaryOntoDusk();
  return duskEnv;
}

export function hardenCanvasTex(tex: THREE.CanvasTexture): THREE.CanvasTexture {
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

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
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
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

  const cycMat = duskSheen({ map: tex, reflectivity: 0.16 });
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
      ? duskSheen({ map: cinemaFloorMap(), reflectivity: 0.48, transparent: true, opacity: 0.94 })
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

  scene.add(new THREE.AmbientLight(0x9aacc8, lite ? 0.7 : 0.4));
  scene.add(new THREE.HemisphereLight(0xe4edff, 0x0a1220, lite ? 0.68 : 0.52));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 2.15 : 1.95);
  key.position.set(1.8, 2.9, 2.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3b7bff, lite ? 0.85 : 0.95);
  rim.position.set(-2.4, 1.3, -1.6);
  scene.add(rim);
}

export function duskSheen(opts: {
  color?: number;
  map?: THREE.Texture | null;
  reflectivity?: number;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
  combine?: THREE.Combine;
}): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: opts.color ?? 0xffffff,
    map: opts.map ?? null,
    envMap: duskCubeMap(),
    reflectivity: opts.reflectivity ?? 0.36,
    combine: opts.combine ?? THREE.MixOperation,
    side: opts.side ?? THREE.FrontSide,
    transparent: opts.transparent,
    opacity: opts.opacity,
  });
}

export function plateMaterial(
  lite: boolean,
): THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial {
  return lite
    ? duskSheen({ color: 0x1a2438, reflectivity: 0.55 })
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
