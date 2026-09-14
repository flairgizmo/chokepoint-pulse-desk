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
const FACE = 512;

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
  px: 'rgba(36, 22, 16, 0.16)',
  nx: 'rgba(28, 18, 14, 0.22)',
  py: 'rgba(18, 16, 20, 0.42)',
  ny: 'rgba(8, 8, 12, 0.55)',
  pz: 'rgba(36, 24, 16, 0.1)',
  nz: 'rgba(24, 18, 16, 0.18)',
};

function paintDuskFace(kind: CubeFace, canvas = document.createElement('canvas')): HTMLCanvasElement {
  canvas.width = FACE;
  canvas.height = FACE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const g = ctx.createLinearGradient(0, 0, kind === 'px' || kind === 'nx' ? FACE : 0, FACE);
  if (kind === 'py') {
    g.addColorStop(0, '#c4b8a8');
    g.addColorStop(1, '#3d342c');
  } else if (kind === 'ny') {
    g.addColorStop(0, '#0b1220');
    g.addColorStop(1, '#02060f');
  } else if (kind === 'pz' || kind === 'px') {
    g.addColorStop(0, '#3a2a1c');
    g.addColorStop(0.42, '#e0b56a');
    g.addColorStop(1, '#100c0a');
  } else {
    g.addColorStop(0, '#2a2218');
    g.addColorStop(0.55, '#c4a888');
    g.addColorStop(1, '#100c0a');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FACE, FACE);
  ctx.fillStyle = 'rgba(255, 228, 176, 0.42)';
  for (let i = 0; i < 48; i++) {
    ctx.fillRect((i * 53) % FACE, 300 + ((i * 23) % 180), 3, 3);
  }
  return canvas;
}

function stampCanaryFace(ctx: CanvasRenderingContext2D, img: HTMLImageElement, kind: CubeFace): void {
  const size = ctx.canvas.width;
  const [fx, fy, fw, fh] = CANARY_CROP[kind];
  const sx = fx * img.width;
  const sy = fy * img.height;
  const sw = Math.max(1, fw * img.width);
  const sh = Math.max(1, fh * img.height);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  ctx.fillStyle = CANARY_WASH[kind];
  ctx.fillRect(0, 0, size, size);
  if (kind === 'py' || kind === 'ny') return;
  ctx.fillStyle = 'rgba(255, 228, 176, 0.38)';
  for (let i = 0; i < 28; i++) {
    ctx.fillRect((i * 53) % size, 280 + ((i * 23) % 160), 2, 2);
  }
}

export const CANARY_STILL = '/visuals/topics/canary.jpg';

type CubePack = {
  faces: HTMLCanvasElement[];
  env: THREE.CubeTexture;
  started: boolean;
  ready: boolean;
  img: HTMLImageElement | null;
  waiters: Array<() => void>;
};

const packs = new Map<string, CubePack>();
let canaryImg: HTMLImageElement | null = null;

export function visionStill(): HTMLImageElement | null {
  return canaryImg;
}

function ensurePack(src: string): CubePack {
  const hit = packs.get(src);
  if (hit) return hit;
  const faces = CUBE_FACES.map((kind) => paintDuskFace(kind));
  const env = new THREE.CubeTexture(faces);
  env.colorSpace = THREE.SRGBColorSpace;
  env.needsUpdate = true;
  const pack: CubePack = { faces, env, started: false, ready: false, img: null, waiters: [] };
  packs.set(src, pack);
  stampPhotoOntoPack(src, pack);
  return pack;
}

function stampPhotoOntoPack(src: string, pack: CubePack): void {
  if (pack.started || typeof Image === 'undefined') return;
  pack.started = true;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    pack.img = img;
    if (src === CANARY_STILL) canaryImg = img;
    CUBE_FACES.forEach((kind, i) => {
      const ctx = pack.faces[i]?.getContext('2d');
      if (ctx) stampCanaryFace(ctx, img, kind);
    });
    pack.env.needsUpdate = true;
    pack.ready = true;
    const queued = pack.waiters.splice(0);
    for (const fn of queued) fn();
  };
  img.src = src;
}

/** Run after that still is stamped onto its cube, or immediately if it already is. */
export function onPhotoEnv(src: string, cb: () => void): void {
  const pack = ensurePack(src);
  if (pack.ready) cb();
  else pack.waiters.push(cb);
}

export function onDuskPhoto(cb: () => void): void {
  onPhotoEnv(CANARY_STILL, cb);
}

/** Vision cube for a still. Painted sync fallback; photograph stamped after load. */
export function duskCubeMap(src = CANARY_STILL): THREE.CubeTexture {
  return ensurePack(src).env;
}

/** Hardware IBL from a Vision cube. Software GL stays fail-closed. RoomEnvironment is fallback only. */
export function applyPhotoEnv(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  lite: boolean,
  src = CANARY_STILL,
): void {
  if (lite) return;
  let gen: THREE.PMREMGenerator | null = null;
  const bake = (): void => {
    try {
      gen ??= new THREE.PMREMGenerator(renderer);
      const cube = duskCubeMap(src);
      cube.needsUpdate = true;
      scene.environment = gen.fromCubemap(cube).texture;
    } catch {
      try {
        gen ??= new THREE.PMREMGenerator(renderer);
        scene.environment = gen.fromScene(new RoomEnvironment(), 0.04).texture;
      } catch {
        // Lights-only path if both IBL routes stall.
      }
    }
  };
  bake();
  onPhotoEnv(src, bake);
}

export function hardenCanvasTex(tex: THREE.CanvasTexture): THREE.CanvasTexture {
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/** Keep bright Vision stills on dusk plates. Official portraits skip this. */
export function printGradeStill(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  x = 0,
  y = 0,
): void {
  let avg = 110;
  try {
    const img = ctx.getImageData(x, y, Math.max(1, w), Math.max(1, h));
    let acc = 0;
    let n = 0;
    for (let i = 0; i < img.data.length; i += 32) {
      acc += (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;
      n += 1;
    }
    if (n) avg = acc / n;
  } catch {
    avg = 110;
  }
  const t = Math.min(1, Math.max(0, (avg - 70) / 130));
  ctx.save();
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgba(16, 20, 32, ${(0.14 + t * 0.32).toFixed(3)})`;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = `rgba(255, 188, 130, ${(0.04 + t * 0.05).toFixed(3)})`;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/** 35mm gate on a landscape still. Side sprockets, frame lines, title in the gate. */
export function stampFilmGate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  portrait = false,
): void {
  ctx.save();
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-over';
  const rail = Math.round(w * (portrait ? 0.048 : 0.072));
  const bar = Math.max(8, Math.round(h * 0.02));
  ctx.fillStyle = '#080b10';
  ctx.fillRect(0, 0, w, bar);
  ctx.fillRect(0, h - bar, w, bar);
  ctx.fillRect(0, 0, rail, h);
  ctx.fillRect(w - rail, 0, rail, h);
  const holeW = Math.max(6, Math.round(rail * 0.5));
  const holeH = Math.max(7, Math.round(h * (portrait ? 0.03 : 0.042)));
  const step = Math.round(h * (portrait ? 0.068 : 0.072));
  const rx = Math.max(1, Math.round(holeW * 0.2));
  ctx.fillStyle = '#04060a';
  ctx.strokeStyle = 'rgba(234, 241, 255, 0.14)';
  ctx.lineWidth = 1;
  for (let y = step * 0.35; y < h - holeH; y += step) {
    for (const x of [Math.round((rail - holeW) / 2), w - rail + Math.round((rail - holeW) / 2)]) {
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, holeW, holeH, rx);
      else ctx.rect(x, y, holeW, holeH);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.strokeStyle = 'rgba(234, 241, 255, 0.16)';
  ctx.beginPath();
  ctx.moveTo(rail, bar);
  ctx.lineTo(w - rail, bar);
  ctx.moveTo(rail, h - bar);
  ctx.lineTo(w - rail, h - bar);
  ctx.stroke();
  if (title) {
    const titleH = Math.round(h * (portrait ? 0.07 : 0.086));
    ctx.fillStyle = 'rgba(8, 11, 16, 0.72)';
    ctx.fillRect(rail, h - bar - titleH, w - rail * 2, titleH);
    ctx.fillStyle = 'rgba(234, 241, 255, 0.92)';
    ctx.font = `700 ${Math.max(16, Math.round(h * (portrait ? 0.03 : 0.04)))}px Outfit, IBM Plex Sans, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, rail + Math.round(w * 0.02), h - bar - titleH / 2);
  }
  ctx.restore();
}

/** Cover-draw a Vision still, then print-grade it for a 3D plate. */
export function printGradeImage(photo: HTMLImageElement, w = 1280, h = 720): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);
    if (photo.naturalWidth) {
      const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
      const dw = photo.naturalWidth * scale;
      const dh = photo.naturalHeight * scale;
      ctx.filter = 'saturate(0.9) contrast(1.12) brightness(0.8)';
      ctx.drawImage(photo, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.filter = 'none';
      printGradeStill(ctx, w, h);
      stampFilmGate(ctx, w, h, '');
    }
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function photoFor(src: string): HTMLImageElement | null {
  return packs.get(src)?.img ?? (src === CANARY_STILL ? canaryImg : null);
}

export function cinemaFloorMap(photo: HTMLImageElement | null = visionStill()): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, 512, 512);
    if (photo?.naturalWidth) {
      ctx.filter = 'saturate(0.88) brightness(0.42)';
      ctx.drawImage(
        photo,
        photo.naturalWidth * 0.18,
        photo.naturalHeight * 0.42,
        photo.naturalWidth * 0.64,
        photo.naturalHeight * 0.42,
        0,
        0,
        512,
        512,
      );
      ctx.filter = 'none';
    }
    const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 248);
    g.addColorStop(0, 'rgba(242, 228, 204, 0.2)');
    g.addColorStop(0.22, 'rgba(180, 150, 110, 0.08)');
    g.addColorStop(0.48, 'rgba(22, 18, 16, 0.36)');
    g.addColorStop(0.72, 'rgba(10, 12, 16, 0.72)');
    g.addColorStop(1, 'rgba(7, 11, 20, 0.94)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(232, 212, 180, 0.06)';
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
  scene.background = new THREE.Color(0x070b14);
  if (!lite) scene.fog = new THREE.Fog(0x0a1220, 8.5, 18);

  const cycMat = duskWall(tex, 0x3f5168);
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

  const floorMat = lite
    ? new THREE.MeshBasicMaterial({
        map: cinemaFloorMap(photoFor(backdropSrc)),
        transparent: true,
        opacity: 0.96,
      })
    : new THREE.MeshPhysicalMaterial({
        map: cinemaFloorMap(photoFor(backdropSrc)),
        color: 0xffffff,
        roughness: 0.06,
        metalness: 0.42,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.9,
        envMapIntensity: 1.65,
      });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6.4, lite ? 48 : 96), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.62;
  scene.add(floor);
  scene.add(makeFloorPool(-0.605));
  onPhotoEnv(backdropSrc, () => {
    const prev = floorMat.map;
    floorMat.map = cinemaFloorMap(photoFor(backdropSrc) ?? visionStill());
    floorMat.needsUpdate = true;
    prev?.dispose();
  });

  scene.add(new THREE.AmbientLight(0x9aacc8, lite ? 0.7 : 0.4));
  scene.add(new THREE.HemisphereLight(0xe4edff, 0x0a1220, lite ? 0.68 : 0.52));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 2.15 : 1.95);
  key.position.set(1.8, 2.9, 2.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3b7bff, lite ? 0.85 : 0.95);
  rim.position.set(-2.4, 1.3, -1.6);
  scene.add(rim);
  addCinemaHaze(scene);
  addPracticals(scene);
}

let contactMap: THREE.CanvasTexture | null = null;

function floorContactMap(): THREE.CanvasTexture {
  if (contactMap) return contactMap;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 124);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
    g.addColorStop(0.32, 'rgba(0, 0, 0, 0.42)');
    g.addColorStop(0.68, 'rgba(0, 0, 0, 0.12)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  contactMap = hardenCanvasTex(new THREE.CanvasTexture(c));
  return contactMap;
}

/** Soft oval on the stage floor. A plane behind a camera-facing plate never reads. */
export function makeFloorContact(w = 2.6, d = 1.55, y = -0.608): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({
      map: floorContactMap(),
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.renderOrder = 2;
  return mesh;
}

/** Additive warm/cyan pool just above a floor plane. */
export function makeFloorPool(y = -0.605, size = 5.4): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(128, 148, 8, 128, 128, 122);
    g.addColorStop(0, 'rgba(255, 214, 148, 0.5)');
    g.addColorStop(0.38, 'rgba(90, 150, 255, 0.16)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: hardenCanvasTex(new THREE.CanvasTexture(c)),
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.renderOrder = 1;
  return mesh;
}

function addPracticals(scene: THREE.Scene): void {
  const bulbs: Array<readonly [number, number, number, number]> = [
    [2.85, 1.82, -2.15, 0xffc56a],
    [-3.05, 1.48, -2.35, 0x6aa8ff],
    [0.15, 2.35, -3.15, 0xeaf1ff],
  ];
  for (const [x, y, z, color] of bulbs) {
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }),
    );
    lamp.position.set(x, y, z);
    scene.add(lamp);
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 10),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    glow.position.set(x, y, z);
    scene.add(glow);
  }
}

/** Additive dusk shafts. Reads on software GL; hardware bloom picks them up. */
export function addCinemaHaze(scene: THREE.Scene, grade: 'cool' | 'warm' = 'cool'): void {
  const cool = new THREE.MeshBasicMaterial({
    color: grade === 'warm' ? 0xc4a888 : 0x6aa8ff,
    transparent: true,
    opacity: grade === 'warm' ? 0.05 : 0.08,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(20, 11), cool);
  wash.position.set(0, 1.35, -4.4);
  wash.userData.cinemaHaze = true;
  scene.add(wash);
  const warm = cool.clone();
  warm.color.setHex(0xffc56a);
  warm.opacity = 0.08;
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 15), warm);
  shaft.position.set(-2.6, 1.7, -3.5);
  shaft.rotation.z = 0.2;
  shaft.userData.cinemaHaze = true;
  scene.add(shaft);
}

/** Gunmetal bezel that mixes the page still. Pale Mix chrome reads as paper on software GL. */
export function cinemaChrome(
  lite: boolean,
  envSrc?: string,
): THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial {
  return lite
    ? duskSheen({ color: 0x3d4f6c, reflectivity: 0.5, envSrc })
    : new THREE.MeshPhysicalMaterial({
        color: 0x8aa3c8,
        metalness: 0.92,
        roughness: 0.16,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.85,
      });
}

/** Darkened photograph on a wall. No Mix — env on a photo map double-exposes. */
export function duskWall(
  map: THREE.Texture | null = null,
  color = 0x3f5168,
  side: THREE.Side = THREE.FrontSide,
): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ map, color, side });
}

/** Env sheen on unmapped metal only. Do not pass a photograph as `map`. */
export function duskSheen(opts: {
  color?: number;
  map?: THREE.Texture | null;
  reflectivity?: number;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
  combine?: THREE.Combine;
  envSrc?: string;
}): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: opts.color ?? 0xffffff,
    map: opts.map ?? null,
    envMap: opts.map ? null : duskCubeMap(opts.envSrc),
    reflectivity: opts.map ? 0 : (opts.reflectivity ?? 0.36),
    combine: opts.combine ?? THREE.MixOperation,
    side: opts.side ?? THREE.FrontSide,
    transparent: opts.transparent,
    opacity: opts.opacity,
  });
}

export function plateMaterial(
  lite: boolean,
  envSrc?: string,
): THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial {
  void envSrc;
  return lite
    ? new THREE.MeshBasicMaterial({ color: 0x1a2438 })
    : new THREE.MeshPhysicalMaterial({
        color: 0x1a2438,
        roughness: 0.1,
        metalness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        ior: 1.52,
        envMapIntensity: 1.7,
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

export type CinemaPlate = {
  root: THREE.Group;
  face: THREE.Mesh;
  mat: THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial;
};

/** Photograph on the front only. Stock and bezel stay dark so box sides cannot blow out to sky. */
export function makeCinemaPlate(
  w: number,
  h: number,
  lite: boolean,
  envSrc?: string,
  depth = 0.05,
  flush = false,
): CinemaPlate {
  const root = new THREE.Group();
  const mat = plateMaterial(lite, envSrc);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  face.position.z = depth / 2 + 0.003;
  root.add(face);
  const stock = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, depth),
    new THREE.MeshBasicMaterial({ color: 0x05070c }),
  );
  root.add(stock);
  if (!flush) {
    const chrome = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.04, h + 0.06, 0.02),
      cinemaChrome(lite, envSrc),
    );
    chrome.position.z = -(depth / 2 + 0.015);
    root.add(chrome);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.02, h + 0.03, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x0a1018 }),
    );
    frame.position.z = -(depth / 2 - 0.006);
    root.add(frame);
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)),
      new THREE.LineBasicMaterial({ color: 0xeaf1ff, transparent: true, opacity: 0.14 }),
    );
    edge.position.z = face.position.z + 0.002;
    root.add(edge);
  }
  return { root, face, mat };
}

export function dimCinemaPlate(root: THREE.Object3D, dim: boolean): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    const raw = mesh.material;
    if (!raw || Array.isArray(raw)) return;
    const mat = raw as THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial;
    if (!('opacity' in mat)) return;
    mat.opacity = dim ? 0.28 : 1;
    mat.transparent = dim;
  });
}

export function climbUserData<T>(obj: THREE.Object3D, key: string): T | undefined {
  let node: THREE.Object3D | null = obj;
  while (node) {
    if (node.userData[key] != null) return node.userData[key] as T;
    node = node.parent;
  }
  return undefined;
}

/** Photographic IBL and bloom only on a named hardware GPU. Software GL stays fail-closed. */
export function addUnrealLook(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  lite: boolean,
  envSrc = CANARY_STILL,
): EffectComposer | null {
  applyPhotoEnv(renderer, scene, lite, envSrc);
  if (!canUseBloom(renderer)) return null;
  try {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(8, 8), 0.56, 0.4, 0.72));
    composer.addPass(new OutputPass());
    return composer;
  } catch {
    return null;
  }
}
