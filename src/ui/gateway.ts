/** Filmic WebGL upgrade for the sterling corridor. 2D paints first from gateway2d. */

import * as THREE from 'three';
import { addCinemaHaze, addUnrealLook, applyPlateMap, cinemaChrome, cinemaFloorMap, climbUserData, duskWall, hardenCanvasTex, makeCinemaPlate, makeFloorContact, makeFloorPool, onDuskPhoto, visionStill } from './cinemaSet';
import { probeWebGL } from './webgl';
import {
  BANKS,
  CARD_STILL,
  MARK,
  type NodeId,
  bankXYZ,
  mountGateway2D,
  paintHint,
  remountCanvas,
} from './gateway2d';

const CARD_W = 768;
const CARD_H = 512;

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
): void {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function containDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

type GlassCut = 'crown' | 'pav' | 'table';

const TABLE_Y = 0.42;
const EQ_Y = 0.18;
const BOT_Y = -0.24;

type CutMat = THREE.MeshPhongMaterial | THREE.MeshPhysicalMaterial;
type GlassLane = 0 | 1;

type GlassGrade = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  brightness: number;
  contrast: number;
  saturate: number;
  multiply: number;
};

/** Two shared Canary crops — not a per-facet quilt. Lane A is the bright window; B is the dusk kite. */
function glassGrade(cut: GlassCut, lane: GlassLane, heart = false): GlassGrade {
  const base =
    cut === 'table'
      ? { sx: 0.2, sy: 0.28, sw: 0.5, sh: 0.28, brightness: 1.08, contrast: 1.12, saturate: 0.62, multiply: 0.03 }
      : cut === 'crown'
        ? lane === 0
          ? { sx: 0.16, sy: 0.2, sw: 0.6, sh: 0.5, brightness: 0.88, contrast: 1.16, saturate: 0.84, multiply: 0.1 }
          : { sx: 0.34, sy: 0.28, sw: 0.52, sh: 0.46, brightness: 0.7, contrast: 1.2, saturate: 0.74, multiply: 0.18 }
        : lane === 0
          ? { sx: 0.22, sy: 0.4, sw: 0.5, sh: 0.38, brightness: 0.7, contrast: 1.2, saturate: 0.72, multiply: 0.2 }
          : { sx: 0.4, sy: 0.44, sw: 0.44, sh: 0.34, brightness: 0.56, contrast: 1.22, saturate: 0.64, multiply: 0.28 };
  if (!heart) return base;
  return {
    ...base,
    brightness: Math.min(1.18, base.brightness + 0.28),
    multiply: Math.max(0.03, base.multiply * 0.28),
    saturate: Math.min(1, base.saturate + 0.1),
  };
}

function paintPhotoGlass(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  w: number,
  h: number,
  on = false,
  cut: GlassCut = 'crown',
  lane: GlassLane = 0,
  heart = false,
): void {
  const grade = glassGrade(cut, lane, heart);
  ctx.fillStyle = '#02060f';
  ctx.fillRect(0, 0, w, h);
  if (photo?.naturalWidth) {
    const sx = photo.naturalWidth * grade.sx;
    const sy = photo.naturalHeight * grade.sy;
    const sw = Math.max(1, photo.naturalWidth * grade.sw);
    const sh = Math.max(1, photo.naturalHeight * grade.sh);
    ctx.filter = `contrast(${grade.contrast}) brightness(${grade.brightness}) saturate(${grade.saturate})`;
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, w, h);
    ctx.filter = 'none';
    ctx.save();
    ctx.globalAlpha = cut === 'pav' ? 0.46 : cut === 'table' ? 0.22 : lane === 0 ? 0.18 : 0.24;
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, w, h);
    ctx.restore();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = on
      ? 'rgba(234, 241, 255, 0.35)'
      : `rgba(6, 16, 40, ${grade.multiply})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, on ? '#f4f7fb' : lane === 0 ? '#8eb0ff' : '#1557FF');
    g.addColorStop(1, '#02060f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  if (cut === 'table') {
    if (!heart) {
      ctx.globalCompositeOperation = 'screen';
      const catchL = ctx.createRadialGradient(w * 0.34, h * 0.28, 2, w * 0.34, h * 0.28, w * 0.16);
      catchL.addColorStop(0, 'rgba(255, 236, 210, 0.28)');
      catchL.addColorStop(1, 'rgba(234, 241, 255, 0)');
      ctx.fillStyle = catchL;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  } else {
    scoreCut(ctx, w, h, 16, lane);
  }
}

function scoreCut(ctx: CanvasRenderingContext2D, w: number, h: number, sides: number, lane: GlassLane = 0): void {
  const bw = w / sides;
  for (let i = 0; i < sides; i++) {
    const x0 = i * bw;
    if (i % 2) {
      ctx.fillStyle = lane === 0 ? 'rgba(2, 6, 14, 0.12)' : 'rgba(2, 6, 14, 0.28)';
      ctx.fillRect(x0, 0, bw, h);
    }
    ctx.fillStyle = lane === 0 ? 'rgba(234, 241, 255, 0.1)' : 'rgba(234, 241, 255, 0.05)';
    ctx.fillRect(x0, 0, 1.25, h);
    ctx.fillStyle = 'rgba(2, 6, 14, 0.36)';
    ctx.fillRect(x0 + bw - 1.25, 0, 1.25, h);
  }
  ctx.globalCompositeOperation = 'screen';
  const fire = ctx.createLinearGradient(w * 0.1, h * 0.08, w * 0.86, h * 0.94);
  if (lane === 0) {
    fire.addColorStop(0, 'rgba(255, 236, 210, 0)');
    fire.addColorStop(0.48, 'rgba(255, 236, 210, 0.18)');
    fire.addColorStop(0.52, 'rgba(200, 220, 255, 0.28)');
    fire.addColorStop(1, 'rgba(255, 236, 210, 0)');
  } else {
    fire.addColorStop(0, 'rgba(140, 170, 220, 0)');
    fire.addColorStop(0.5, 'rgba(170, 200, 255, 0.1)');
    fire.addColorStop(1, 'rgba(140, 170, 220, 0)');
  }
  ctx.fillStyle = fire;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = lane === 0 ? 'rgba(255, 214, 140, 0.2)' : 'rgba(170, 200, 255, 0.1)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(w * 0.08, h * 0.1);
  ctx.lineTo(w * 0.92, h * 0.9);
  ctx.stroke();
  ctx.strokeStyle = lane === 0 ? 'rgba(140, 200, 255, 0.18)' : 'rgba(255, 176, 210, 0.08)';
  ctx.beginPath();
  ctx.moveTo(w * 0.9, h * 0.08);
  ctx.lineTo(w * 0.1, h * 0.92);
  ctx.stroke();
  for (let i = 0; i < sides; i++) {
    const cx = (i + 0.38) * bw;
    const cy = 36 + (i % 5) * 78;
    const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, lane === 0 ? 28 : 18);
    g.addColorStop(0, i % 3 === 0 ? 'rgba(255, 236, 210, 0.36)' : 'rgba(170, 200, 255, 0.18)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 28, cy - 28, 56, 56);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function diamondPhysical(
  map: THREE.Texture | null,
  opts: { on?: boolean; transmission?: number; thickness?: number } = {},
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map,
    color: 0xffffff,
    metalness: 0,
    roughness: 0.04,
    transmission: opts.transmission ?? 0.74,
    ior: 2.417,
    thickness: opts.thickness ?? 0.55,
    attenuationColor: new THREE.Color(0x8ec4ff),
    attenuationDistance: 0.82,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 420],
    clearcoat: 1,
    clearcoatRoughness: 0.035,
    specularIntensity: 1,
    specularColor: new THREE.Color(0xeaf1ff),
    envMapIntensity: 2.15,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.97,
    emissive: opts.on ? 0xeaf1ff : 0x1557ff,
    emissiveIntensity: opts.on ? 0.16 : 0.035,
  });
}

function iceCatchTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    const catchL = ctx.createRadialGradient(92, 78, 2, 92, 78, 72);
    catchL.addColorStop(0, 'rgba(255, 236, 210, 0.7)');
    catchL.addColorStop(0.22, 'rgba(234, 241, 255, 0.12)');
    catchL.addColorStop(1, 'rgba(234, 241, 255, 0)');
    ctx.fillStyle = catchL;
    ctx.fillRect(0, 0, 256, 256);
    const rim = ctx.createRadialGradient(128, 128, 92, 128, 128, 127);
    rim.addColorStop(0, 'rgba(234, 241, 255, 0)');
    rim.addColorStop(0.72, 'rgba(234, 241, 255, 0.04)');
    rim.addColorStop(1, 'rgba(234, 241, 255, 0.42)');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Mapped culet catch — not a CAD sphere. Fits inside the pavilion cone. */
function culetFireTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    const warm = ctx.createRadialGradient(122, 134, 2, 128, 128, 92);
    warm.addColorStop(0, 'rgba(255, 236, 210, 0.78)');
    warm.addColorStop(0.2, 'rgba(255, 196, 120, 0.42)');
    warm.addColorStop(0.48, 'rgba(255, 168, 88, 0.12)');
    warm.addColorStop(1, 'rgba(255, 168, 88, 0)');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, 256, 256);
    const cool = ctx.createRadialGradient(150, 112, 1, 150, 112, 52);
    cool.addColorStop(0, 'rgba(180, 220, 255, 0.58)');
    cool.addColorStop(0.46, 'rgba(140, 190, 255, 0.16)');
    cool.addColorStop(1, 'rgba(140, 190, 255, 0)');
    ctx.fillStyle = cool;
    ctx.fillRect(0, 0, 256, 256);
    const mag = ctx.createRadialGradient(104, 146, 1, 104, 146, 36);
    mag.addColorStop(0, 'rgba(255, 176, 210, 0.32)');
    mag.addColorStop(1, 'rgba(255, 176, 210, 0)');
    ctx.fillStyle = mag;
    ctx.fillRect(0, 0, 256, 256);
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255, 220, 160, 0.42)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(48, 128);
    ctx.lineTo(208, 128);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(170, 210, 255, 0.34)';
    ctx.beginPath();
    ctx.moveTo(128, 44);
    ctx.lineTo(128, 212);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 190, 210, 0.22)';
    ctx.beginPath();
    ctx.moveTo(72, 72);
    ctx.lineTo(184, 184);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function fireSprite(tint: number, x: number, y: number, z: number, scale: number): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map: culetFireTex(),
    color: tint,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  mat.toneMapped = false;
  const spark = new THREE.Sprite(mat);
  spark.position.set(x, y, z);
  spark.scale.set(scale, scale, 1);
  spark.userData.nodeId = 6;
  spark.renderOrder = 3;
  return spark;
}

function causticCanvas(photo: HTMLImageElement | null): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.fillStyle = '#02060f';
  ctx.fillRect(0, 0, 512, 512);
  if (photo?.naturalWidth) {
    ctx.globalAlpha = 0.72;
    ctx.drawImage(
      photo,
      photo.naturalWidth * 0.26,
      photo.naturalHeight * 0.18,
      photo.naturalWidth * 0.5,
      photo.naturalHeight * 0.5,
      0,
      0,
      512,
      512,
    );
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(256, 256, 6, 256, 256, 248);
  g.addColorStop(0, 'rgba(234, 241, 255, 0.7)');
  g.addColorStop(0.12, 'rgba(90, 240, 255, 0.56)');
  g.addColorStop(0.28, 'rgba(255, 72, 168, 0.34)');
  g.addColorStop(0.5, 'rgba(255, 196, 72, 0.16)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  if (photo?.naturalWidth) {
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.beginPath();
    ctx.moveTo(256, 46);
    ctx.lineTo(404, 210);
    ctx.lineTo(348, 430);
    ctx.lineTo(164, 430);
    ctx.lineTo(108, 210);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      photo,
      photo.naturalWidth * 0.34,
      photo.naturalHeight * 0.22,
      photo.naturalWidth * 0.36,
      photo.naturalHeight * 0.36,
      64,
      64,
      384,
      384,
    );
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

function glassCanvas(
  photo: HTMLImageElement | null,
  on: boolean,
  cut: GlassCut,
  lane: GlassLane = 0,
  heart = false,
): HTMLCanvasElement {
  const wrap = cut === 'crown';
  const c = document.createElement('canvas');
  c.width = wrap ? 1024 : 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  paintPhotoGlass(ctx, photo, c.width, c.height, on, cut, lane, heart);
  return c;
}

function glassTex(
  photo: HTMLImageElement | null,
  on: boolean,
  cut: GlassCut,
  lane: GlassLane = 0,
  heart = false,
): THREE.CanvasTexture {
  const tex = hardenCanvasTex(new THREE.CanvasTexture(glassCanvas(photo, on, cut, lane, heart)));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function attachLiteFire(mat: THREE.MeshBasicMaterial): void {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vLiteNormal;
varying vec3 vLiteView;`,
      )
      .replace(
        '#include <project_vertex>',
        `#include <beginnormal_vertex>
#include <defaultnormal_vertex>
#include <project_vertex>
vLiteNormal = normalize(transformedNormal);
vLiteView = normalize(-mvPosition.xyz);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vLiteNormal;
varying vec3 vLiteView;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
vec3 liteN = normalize(vLiteNormal);
if (!gl_FrontFacing) liteN = -liteN;
float liteFacing = clamp(abs(dot(liteN, normalize(vLiteView))), 0.0, 1.0);
float liteFres = pow(1.0 - liteFacing, 1.55);
diffuseColor.rgb += vec3(1.0, 0.9, 0.72) * liteFres * 0.36;
diffuseColor.rgb += vec3(0.52, 0.76, 1.0) * liteFres * liteFres * 0.24;`,
      );
  };
  mat.customProgramCacheKey = () => 'qd-lite-fire-1';
}

function glassMat(
  tex: THREE.Texture,
  lite: boolean,
  opts: {
    on?: boolean;
    transmission?: number;
    thickness?: number;
    shade?: boolean;
    tint?: number;
    vertexColors?: boolean;
    window?: number;
  } = {},
): CutMat | THREE.MeshBasicMaterial {
  if (lite) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color: opts.tint ?? (opts.shade === false ? 0x5a6c88 : 0x93a6c0),
      side: THREE.DoubleSide,
      vertexColors: Boolean(opts.vertexColors),
      transparent: opts.window != null,
      opacity: opts.window ?? 1,
      depthWrite: opts.window == null || opts.window > 0.84,
    });
    mat.toneMapped = false;
    if (opts.window != null) attachLiteFire(mat);
    return mat;
  }
  return diamondPhysical(tex, opts);
}

const KEY_DIR = new THREE.Vector3(2.4, 3.2, 2.1).normalize();
const RIM_DIR = new THREE.Vector3(-2.8, 1.2, -2.4).normalize();
/** Rest camera → jewel, rotated into crystal space so the −0.34 lean still keys the fire. */
const VIEW_DIR = new THREE.Vector3(
  -(3.48 * Math.sin(1.24) * Math.sin(0.72)),
  0.38 - 3.48 * Math.cos(1.24),
  -(3.48 * Math.sin(1.24) * Math.cos(0.72)),
)
  .applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.34)
  .normalize();

/** Spectral kite fire for lite MeshBasic. Outward Lambert, not |dot| — that painted every kite the same. */
function facetFire(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number,
): THREE.Color {
  const n = new THREE.Vector3(bx - ax, by - ay, bz - az)
    .cross(new THREE.Vector3(cx - ax, cy - ay, cz - az))
    .normalize();
  const mid = new THREE.Vector3((ax + bx + cx) / 3, (ay + by + cy) / 3, (az + bz + cz) / 3);
  if (n.dot(mid) < 0) n.negate();
  const key = Math.max(0, n.dot(KEY_DIR));
  const rim = Math.max(0, n.dot(RIM_DIR));
  const facing = Math.max(0, n.dot(VIEW_DIR));
  const fres = (1 - facing) ** 1.55;
  const shade = Math.min(1, 0.46 + key * 0.48 + rim * 0.16);
  return new THREE.Color(
    Math.min(1, shade + key * 0.08 + fres * 0.04),
    shade,
    Math.min(1, shade - key * 0.06 + rim * 0.1 + fres * 0.06),
  );
}

function wrapU(x: number, z: number): number {
  return (Math.atan2(x, z) / (Math.PI * 2) + 0.875) % 1;
}

function wrapV(y: number, band: 'crown' | 'pav' = 'crown'): number {
  if (band === 'pav') return Math.min(1, Math.max(0, (y - BOT_Y) / (EQ_Y - BOT_Y)));
  return Math.min(1, Math.max(0, (y - EQ_Y) / (TABLE_Y - EQ_Y)));
}

function seamUv(us: number[]): number[] {
  const min = Math.min(...us);
  const max = Math.max(...us);
  if (max - min <= 0.5) return us;
  return us.map((u) => (u < 0.5 ? u + 1 : u));
}

function tableFan(r: number, sides: number): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  for (let i = 0; i < sides; i++) {
    const a0 = (i / sides) * Math.PI * 2;
    const a1 = ((i + 1) / sides) * Math.PI * 2;
    pos.push(0, 0, 0, Math.cos(a0) * r, 0, Math.sin(a0) * r, Math.cos(a1) * r, 0, Math.sin(a1) * r);
    uv.push(
      0.5,
      0.5,
      0.5 + Math.cos(a0) * 0.5,
      0.5 + Math.sin(a0) * 0.5,
      0.5 + Math.cos(a1) * 0.5,
      0.5 + Math.sin(a1) * 0.5,
    );
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

function triGeo(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number,
  band: 'crown' | 'pav' = 'crown',
): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([ax, ay, az, bx, by, bz, cx, cy, cz], 3));
  const us = seamUv([wrapU(ax, az), wrapU(bx, bz), wrapU(cx, cz)]);
  g.setAttribute(
    'uv',
    new THREE.Float32BufferAttribute(
      [us[0], wrapV(ay, band), us[1], wrapV(by, band), us[2], wrapV(cy, band)],
      2,
    ),
  );
  const fire = facetFire(ax, ay, az, bx, by, bz, cx, cy, cz);
  g.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(
      [fire.r, fire.g, fire.b, fire.r, fire.g, fire.b, fire.r, fire.g, fire.b],
      3,
    ),
  );
  g.computeVertexNormals();
  return g;
}

function logoCanvas(
  img: HTMLImageElement | null,
  short: string,
  name: string,
  on = false,
  still?: HTMLImageElement | null,
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = CARD_W;
  c.height = CARD_H;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  if (still?.complete && still.naturalWidth) {
    ctx.filter = 'saturate(0.88) contrast(1.2) brightness(0.48)';
    coverDraw(ctx, still, CARD_W, CARD_H);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  }
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, CARD_W, 18);
  ctx.fillRect(0, CARD_H - 18, CARD_W, 18);
  ctx.fillStyle = on ? 'rgba(7, 11, 20, 0.4)' : 'rgba(7, 11, 20, 0.58)';
  ctx.fillRect(0, CARD_H - 72, CARD_W, 54);
  const bw = 156;
  const bh = 34;
  const bx = 20;
  const by = CARD_H - 62;
  ctx.fillStyle = on ? '#ffffff' : '#f4f7fb';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(bx, by, bw, bh, 10);
  else ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.strokeStyle = on ? '#1557FF' : 'rgba(11, 31, 92, 0.16)';
  ctx.lineWidth = on ? 2 : 1;
  ctx.stroke();
  const wide = Boolean(img && img.naturalWidth / Math.max(1, img.naturalHeight) > 6);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (img?.complete && img.naturalWidth && img.naturalHeight && !wide) {
    containDraw(ctx, img, bx + 10, by + 6, bw - 20, bh - 12);
  } else {
    ctx.fillStyle = '#0B1F5C';
    ctx.font = '700 16px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(wide ? 'Lloyds' : short, bx + bw / 2, by + bh / 2);
  }
  const label = name === 'Lloyds Banking Group' ? 'Lloyds' : name;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(234, 241, 255, 0.82)';
  ctx.font = '700 22px Outfit, IBM Plex Sans, sans-serif';
  ctx.fillText(label, bx + bw + 14, CARD_H - 44);
  return c;
}

function sitIssuerStill(card: THREE.Group, x: number, z: number): void {
  card.position.set(x, -0.304, z);
  card.lookAt(0, 0.28, 5);
  card.rotateX(-1.46);
}

function labelSprite(text: string, color = '#EAF1FF'): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 768, 128);
    ctx.font = '700 48px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 384, 64);
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(text.length > 8 ? 1.28 : 0.86, 0.2, 1);
  return sprite;
}

export function mountGateway(canvas: HTMLCanvasElement): () => void {
  return mountGateway2D(canvas);
}

/** Swap the live 2D corridor for WebGL. Software GL is allowed without bloom. */
export function upgradeGateway3D(canvas: HTMLCanvasElement): (() => void) | null {
  const probe = probeWebGL();
  if (!probe) return null;
  const next = remountCanvas(canvas);
  try {
    return mountGateway3D(next, { lite: probe.lite });
  } catch {
    return mountGateway2D(next);
  }
}

function mountGateway3D(canvas: HTMLCanvasElement, opts: { lite?: boolean } = {}): () => void {
  const lite = Boolean(opts.lite);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !lite,
      alpha: true,
      powerPreference: lite ? 'low-power' : 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    throw new Error('webgl-unavailable');
  }

  canvas.dataset.engine = 'webgl';
  canvas.dataset.profile = lite ? 'lite' : 'unreal';
  renderer.setPixelRatio(lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x070b14, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = lite ? 1.06 : 1.34;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  if (!lite) scene.fog = new THREE.Fog(0x0a1220, 7.4, 14);
  const camera = new THREE.PerspectiveCamera(lite ? 32 : 30, 1, 0.05, 40);
  const group = new THREE.Group();
  scene.add(group);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5.2, lite ? 48 : 96),
    lite
      ? new THREE.MeshBasicMaterial({
          map: cinemaFloorMap(),
          transparent: true,
          opacity: 0.94,
        })
      : new THREE.MeshPhysicalMaterial({
          map: cinemaFloorMap(),
          color: 0xffffff,
          roughness: 0.05,
          metalness: 0.4,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          transparent: true,
          opacity: 0.86,
          envMapIntensity: 1.65,
        }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.32;
  scene.add(floor);
  const causticTex = hardenCanvasTex(new THREE.CanvasTexture(causticCanvas(visionStill())));
  causticTex.colorSpace = THREE.SRGBColorSpace;
  const causticMat = new THREE.MeshBasicMaterial({
    map: causticTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const caustic = new THREE.Mesh(new THREE.CircleGeometry(1.22, 48), causticMat);
  caustic.rotation.x = -Math.PI / 2;
  caustic.position.y = -0.31;
  scene.add(caustic);
  const pool = makeFloorPool(-0.315, 2.6);
  (pool.material as THREE.MeshBasicMaterial).opacity = 0.28;
  scene.add(pool);
  const backdropTex = new THREE.TextureLoader().load('/visuals/topics/canary.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
  });
  backdropTex.colorSpace = THREE.SRGBColorSpace;
  scene.background = new THREE.Color(0x070b14);
  const cycMat = duskWall(backdropTex, 0x3f5168);
  cycMat.depthWrite = false;
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(32, 15.2), cycMat);
  backdrop.position.set(0, 1.45, -5.6);
  scene.add(backdrop);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(16, 12.4), cycMat);
  left.position.set(-11.4, 1.25, -2.6);
  left.rotation.y = 0.74;
  scene.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(16, 12.4), cycMat);
  right.position.set(11.4, 1.25, -2.6);
  right.rotation.y = -0.74;
  scene.add(right);
  addCinemaHaze(scene);

  scene.add(new THREE.AmbientLight(0x8ea0c0, lite ? 0.36 : 0.38));
  scene.add(new THREE.HemisphereLight(0xc9d6f0, 0x0a1220, lite ? 0.42 : 0.55));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 0.88 : 2.05);
  key.position.set(2.4, 3.2, 2.1);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3b7bff, 1.15);
  rim.position.set(-2.8, 1.2, -2.4);
  scene.add(rim);
  const fill = new THREE.PointLight(0x6aa8ff, 0.55, 6);
  fill.position.set(0, 0.9, 0);
  scene.add(fill);
  const bounce = new THREE.DirectionalLight(0x9eb4d4, lite ? 0.14 : 0.1);
  bounce.position.set(0.35, -1.15, 1.45);
  scene.add(bounce);
  const culet = new THREE.PointLight(0x8eb0ff, lite ? 0.12 : 0.08, 1.8);
  culet.position.set(0.05, -0.42, 0.28);
  scene.add(culet);

  const crystal = new THREE.Group();
  const crowns: THREE.Mesh[] = [];
  const pavs: THREE.Mesh[] = [];
  const stars: THREE.Mesh[] = [];
  const sparks: THREE.Mesh[] = [];
  const sides = 16;
  const restAyFace = 0.72;
  const face0 = Math.PI / 2 - restAyFace + Math.PI / sides;
  const tableR = 0.36;
  const tableY = TABLE_Y;
  const eqR = 0.56;
  const eqY = EQ_Y;
  const botY = BOT_Y;
  const midR = tableR + (eqR - tableR) * 0.52;
  const midY = tableY + (eqY - tableY) * 0.48;
  const pavR = eqR * 0.42;
  const pavY = eqY + (botY - eqY) * 0.52;
  const photo0 = visionStill();
  const crownA = glassMat(glassTex(photo0, false, 'crown', 0), lite, {
    transmission: 0.7,
    thickness: 0.52,
    tint: 0xd4e2f0,
    vertexColors: lite,
    window: lite ? 0.74 : undefined,
  });
  const crownB = glassMat(glassTex(photo0, false, 'crown', 1), lite, {
    transmission: 0.7,
    thickness: 0.52,
    tint: 0xa4b6cc,
    vertexColors: lite,
    window: lite ? 0.74 : undefined,
  });
  const pavA = glassMat(glassTex(photo0, false, 'pav', 0), lite, {
    transmission: 0.82,
    thickness: 0.7,
    tint: 0x9aacc2,
    vertexColors: lite,
    window: lite ? 0.56 : undefined,
  });
  const pavB = glassMat(glassTex(photo0, false, 'pav', 1), lite, {
    transmission: 0.82,
    thickness: 0.7,
    tint: 0x7a8ca6,
    vertexColors: lite,
    window: lite ? 0.56 : undefined,
  });
  const table = new THREE.Mesh(
    tableFan(tableR, sides),
    lite
      ? (() => {
          const ice = new THREE.MeshBasicMaterial({
            map: iceCatchTex(),
            color: 0xe8f0fa,
            transparent: true,
            opacity: 0.11,
            depthWrite: false,
            side: THREE.DoubleSide,
          });
          ice.toneMapped = false;
          return ice;
        })()
      : glassMat(glassTex(photo0, false, 'table'), lite, {
          transmission: 0.38,
          thickness: 0.28,
          shade: false,
          tint: 0xf2f6fc,
        }),
  );
  table.position.y = tableY;
  table.userData.nodeId = 6;
  crystal.add(table);
  const addCut = (geo: THREE.BufferGeometry, mat: CutMat | THREE.MeshBasicMaterial, list: THREE.Mesh[]): void => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.nodeId = 6;
    crystal.add(mesh);
    list.push(mesh);
  };
  for (let i = 0; i < sides; i++) {
    const a0 = (i / sides) * Math.PI * 2 + face0 - Math.PI / sides;
    const a1 = ((i + 1) / sides) * Math.PI * 2 + face0 - Math.PI / sides;
    const tx0 = Math.cos(a0) * tableR;
    const tz0 = Math.sin(a0) * tableR;
    const tx1 = Math.cos(a1) * tableR;
    const tz1 = Math.sin(a1) * tableR;
    const mx0 = Math.cos(a0) * midR;
    const mz0 = Math.sin(a0) * midR;
    const mx1 = Math.cos(a1) * midR;
    const mz1 = Math.sin(a1) * midR;
    const x0 = Math.cos(a0) * eqR;
    const z0 = Math.sin(a0) * eqR;
    const x1 = Math.cos(a1) * eqR;
    const z1 = Math.sin(a1) * eqR;
    const px0 = Math.cos(a0) * pavR;
    const pz0 = Math.sin(a0) * pavR;
    const px1 = Math.cos(a1) * pavR;
    const pz1 = Math.sin(a1) * pavR;
    const crown = i % 2 ? crownB : crownA;
    const pav = i % 2 ? pavB : pavA;
    addCut(triGeo(mx0, midY, mz0, x0, eqY, z0, x1, eqY, z1, 'crown'), crown, crowns);
    addCut(triGeo(mx0, midY, mz0, x1, eqY, z1, mx1, midY, mz1, 'crown'), crown, crowns);
    addCut(triGeo(tx0, tableY, tz0, mx0, midY, mz0, mx1, midY, mz1, 'crown'), crown, crowns);
    addCut(triGeo(tx0, tableY, tz0, mx1, midY, mz1, tx1, tableY, tz1, 'crown'), crown, crowns);
    addCut(triGeo(x0, eqY, z0, px0, pavY, pz0, px1, pavY, pz1, 'pav'), pav, pavs);
    addCut(triGeo(x0, eqY, z0, px1, pavY, pz1, x1, eqY, z1, 'pav'), pav, pavs);
    addCut(triGeo(px0, pavY, pz0, 0, botY, 0, px1, pavY, pz1, 'pav'), pav, pavs);
    if (!lite) {
      const amid = (a0 + a1) / 2;
      const starR = tableR + (eqR - tableR) * 0.4;
      const starY = tableY + (eqY - tableY) * 0.4;
      const sx = Math.cos(amid) * starR;
      const sz = Math.sin(amid) * starR;
      addCut(triGeo(tx0, tableY, tz0, tx1, tableY, tz1, sx, starY, sz, 'crown'), crownA, stars);
    }
    if (!lite) {
      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 8, 8),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? 0xff5cb0 : 0x5af0ff,
          transparent: true,
          opacity: 0.28,
        }),
      );
      spark.position.set(x0, eqY, z0);
      spark.userData.nodeId = 6;
      crystal.add(spark);
      sparks.push(spark);
    }
  }
  if (!lite) {
    const edgePts: number[] = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const n = ((i + 1) / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const x = Math.cos(a) * eqR;
      const z = Math.sin(a) * eqR;
      const tx = Math.cos(a) * tableR;
      const tz = Math.sin(a) * tableR;
      const mx = Math.cos(a) * midR;
      const mz = Math.sin(a) * midR;
      const px = Math.cos(a) * pavR;
      const pz = Math.sin(a) * pavR;
      edgePts.push(x, eqY, z, Math.cos(n) * eqR, eqY, Math.sin(n) * eqR);
      edgePts.push(tx, tableY, tz, Math.cos(n) * tableR, tableY, Math.sin(n) * tableR);
      edgePts.push(mx, midY, mz, Math.cos(n) * midR, midY, Math.sin(n) * midR);
      edgePts.push(tx, tableY, tz, mx, midY, mz);
      edgePts.push(mx, midY, mz, x, eqY, z);
      edgePts.push(x, eqY, z, px, pavY, pz);
      edgePts.push(px, pavY, pz, 0, botY, 0);
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    crystal.add(
      new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({ color: 0xeaf1ff, transparent: true, opacity: 0.04 }),
      ),
    );
  }
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, lite ? 10 : 16, lite ? 8 : 12),
    lite
      ? new THREE.MeshBasicMaterial({
          map: (table.material as THREE.MeshBasicMaterial).map,
          color: 0xffffff,
          transparent: true,
          opacity: 0.26,
        })
      : diamondPhysical(null, { transmission: 0.88, thickness: 0.42 }),
  );
  core.position.y = 0.22;
  core.userData.nodeId = 6;
  crystal.add(core);
  const heartStamp: Array<CutMat | THREE.MeshBasicMaterial> = [];
  let heartRoot: THREE.Group | null = null;
  let ghostRoot: THREE.Group | null = null;
  let flareRoot: THREE.Group | null = null;
  const culetFires: THREE.Sprite[] = [];
  if (lite) {
    const heartPavA = glassMat(glassTex(photo0, false, 'pav', 0, true), true, {
      tint: 0xffffff,
      vertexColors: true,
    });
    const heartPavB = glassMat(glassTex(photo0, false, 'pav', 1, true), true, {
      tint: 0xffffff,
      vertexColors: true,
    });
    const heart = new THREE.Group();
    heart.scale.setScalar(0.94);
    heart.rotation.set(0.08, 0.28, 0.04);
    heart.position.set(0.016, 0.004, 0.01);
    const addHeart = (geo: THREE.BufferGeometry, mat: CutMat | THREE.MeshBasicMaterial): void => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.nodeId = 6;
      heart.add(mesh);
    };
    for (let i = 0; i < sides; i++) {
      const a0 = (i / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const a1 = ((i + 1) / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const x0 = Math.cos(a0) * eqR;
      const z0 = Math.sin(a0) * eqR;
      const x1 = Math.cos(a1) * eqR;
      const z1 = Math.sin(a1) * eqR;
      const px0 = Math.cos(a0) * pavR;
      const pz0 = Math.sin(a0) * pavR;
      const px1 = Math.cos(a1) * pavR;
      const pz1 = Math.sin(a1) * pavR;
      const pav = i % 2 ? heartPavB : heartPavA;
      addHeart(triGeo(x0, eqY, z0, px0, pavY, pz0, px1, pavY, pz1, 'pav'), pav);
      addHeart(triGeo(x0, eqY, z0, px1, pavY, pz1, x1, eqY, z1, 'pav'), pav);
      addHeart(triGeo(px0, pavY, pz0, 0, botY, 0, px1, pavY, pz1, 'pav'), pav);
    }
    crystal.add(heart);
    heartRoot = heart;
    core.visible = false;
    heartStamp.push(heartPavA, heartPavB);
    const ghost = heart.clone(true);
    ghost.scale.setScalar(0.76);
    ghost.rotation.set(0.16, -0.22, -0.06);
    ghost.position.set(-0.045, 0.01, -0.03);
    ghost.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const src = obj.material;
      if (!(src instanceof THREE.MeshBasicMaterial)) return;
      const mat = src.clone();
      mat.color.setHex(0xffd4b8);
      mat.transparent = true;
      mat.opacity = 0.4;
      mat.depthWrite = false;
      mat.toneMapped = false;
      obj.material = mat;
      heartStamp.push(mat);
    });
    crystal.add(ghost);
    ghostRoot = ghost;
    const flare = heart.clone(true);
    flare.scale.setScalar(0.7);
    flare.rotation.set(-0.1, 0.48, 0.07);
    flare.position.set(0.028, -0.018, -0.024);
    flare.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const src = obj.material;
      if (!(src instanceof THREE.MeshBasicMaterial)) return;
      const mat = src.clone();
      mat.color.setHex(0xb4dcff);
      mat.transparent = true;
      mat.opacity = 0.32;
      mat.depthWrite = false;
      mat.toneMapped = false;
      obj.material = mat;
      heartStamp.push(mat);
    });
    crystal.add(flare);
    flareRoot = flare;
    const fires = [
      fireSprite(0xffffff, 0, BOT_Y + 0.1, 0.02, 0.44),
      fireSprite(0xb4dcff, 0.05, BOT_Y + 0.06, -0.03, 0.26),
      fireSprite(0xffb0d2, -0.04, BOT_Y + 0.08, 0.04, 0.22),
    ];
    fires.forEach((spark) => {
      crystal.add(spark);
      culetFires.push(spark);
    });
  }
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.046, 0.028, sides),
    cinemaChrome(lite),
  );
  crystal.position.y = 0.2;
  crystal.scale.setScalar(1.52);
  base.position.y = -0.24;
  base.userData.nodeId = 6;
  const lean = new THREE.Group();
  lean.rotation.x = -0.34;
  lean.add(crystal);
  lean.add(base);
  group.add(lean);

  const gateLabel = labelSprite('OVERLEDGER', '#EAF1FF');
  gateLabel.position.set(0, -0.22, 0.68);
  gateLabel.scale.set(0.46, 0.08, 1);
  gateLabel.material.opacity = 0.2;
  group.add(gateLabel);

  const rt2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.016, lite ? 8 : 16, lite ? 48 : 72),
    lite
      ? cinemaChrome(true)
      : new THREE.MeshPhysicalMaterial({
          color: 0x3d4f6c,
          metalness: 0.86,
          roughness: 0.18,
          emissive: 0x1557ff,
          emissiveIntensity: 0.18,
          clearcoat: 0.8,
        }),
  );
  rt2.rotation.x = Math.PI / 2;
  rt2.position.y = -0.305;
  rt2.userData.nodeId = 7;
  group.add(rt2);
  const rt2Label = labelSprite('SIM RT2', '#EAF1FF');
  rt2Label.position.set(0, -0.22, 1.02);
  rt2Label.scale.set(0.3, 0.066, 1);
  rt2Label.material.opacity = 0.16;
  group.add(rt2Label);

  const logos = BANKS.map((b) => {
    const img = new Image();
    img.src = MARK[b.name];
    return img;
  });
  const stills = CARD_STILL.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
  const cards: THREE.Group[] = [];
  const cardMats: Array<THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial> = [];
  const puddles: THREE.Mesh[] = [];
  BANKS.forEach((bank, i) => {
    const tex = hardenCanvasTex(new THREE.CanvasTexture(logoCanvas(null, bank.short, bank.name, false, stills[i])));
    tex.colorSpace = THREE.SRGBColorSpace;
    const plate = makeCinemaPlate(0.62, 0.36, lite, undefined, 0.01, true);
    applyPlateMap(plate.mat, tex);
    const [x, , z] = bankXYZ(i, 0);
    sitIssuerStill(plate.root, x, z);
    plate.root.userData.nodeId = bank.id;
    plate.face.userData.nodeId = bank.id;
    group.add(plate.root);
    cards.push(plate.root);
    cardMats.push(plate.mat);
    const puddle = makeFloorContact(0.72, 0.48, -0.318);
    scene.add(puddle);
    puddles.push(puddle);
    const paintOne = (): void => {
      const next = hardenCanvasTex(new THREE.CanvasTexture(logoCanvas(logos[i], bank.short, bank.name, false, stills[i])));
      next.colorSpace = THREE.SRGBColorSpace;
      plate.mat.map?.dispose();
      applyPlateMap(plate.mat, next);
    };
    logos[i].onload = paintOne;
    stills[i].onload = paintOne;
  });

  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, lite ? 12 : 24, lite ? 12 : 24),
    cinemaChrome(lite),
  );
  group.add(bead);
  const pickables: THREE.Object3D[] = [
    ...crowns,
    ...pavs,
    ...stars,
    ...sparks,
    core,
    base,
    rt2,
    ...cards,
    table,
    ...(heartRoot ? [heartRoot] : []),
    ...(ghostRoot ? [ghostRoot] : []),
    ...(flareRoot ? [flareRoot] : []),
  ];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const restAx = lite ? 1.24 : 1.28;
  const restAy = 0.72;
  const orbit = (18 * Math.PI) / 180;
  let ax = restAx;
  let ay = restAy;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let selected: NodeId | null = 6;
  let hover: NodeId | null = null;
  const t0 = performance.now();
  let raf = 0;
  const composer = addUnrealLook(renderer, scene, camera, lite);

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer?.setSize(w, h);
  };

  const pick = (clientX: number, clientY: number): NodeId | null => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, true);
    const id = hits[0] ? climbUserData<NodeId>(hits[0].object, 'nodeId') : undefined;
    return typeof id === 'number' ? id : null;
  };

  let gateLit = false;
  const swapMap = (
    mat: CutMat | THREE.MeshBasicMaterial,
    next: THREE.CanvasTexture,
  ): void => {
    mat.map?.dispose();
    mat.map = next;
    mat.needsUpdate = true;
  };
  const stampJewel = (on: boolean): void => {
    const photo = visionStill();
    const tmat = table.material as CutMat | THREE.MeshBasicMaterial;
    if (lite && tmat instanceof THREE.MeshBasicMaterial) {
      tmat.opacity = on ? 0.16 : 0.11;
      tmat.color.setHex(on ? 0xffffff : 0xe8f0fa);
      tmat.needsUpdate = true;
    } else {
      swapMap(tmat, glassTex(photo, on, 'table'));
    }
    swapMap(crownA, glassTex(photo, on, 'crown', 0));
    swapMap(crownB, glassTex(photo, on, 'crown', 1));
    swapMap(pavA, glassTex(photo, false, 'pav', 0));
    swapMap(pavB, glassTex(photo, false, 'pav', 1));
    if (heartStamp.length >= 2) {
      const kinds = [
        ['pav', 0, on],
        ['pav', 1, on],
      ] as const;
      heartStamp.forEach((mat, i) => {
        const [cut, lane, lit] = kinds[i % 2];
        swapMap(mat, glassTex(photo, lit, cut, lane, true));
      });
    }
    for (const mat of [crownA, crownB]) {
      if (mat instanceof THREE.MeshPhysicalMaterial) {
        mat.emissive.setHex(on ? 0xeaf1ff : 0x1557ff);
        mat.emissiveIntensity = on ? 0.16 : 0.035;
      }
    }
    const nextCaustic = hardenCanvasTex(new THREE.CanvasTexture(causticCanvas(photo)));
    nextCaustic.colorSpace = THREE.SRGBColorSpace;
    causticMat.map?.dispose();
    causticMat.map = nextCaustic;
    causticMat.needsUpdate = true;
    if (floor.material instanceof THREE.MeshPhysicalMaterial || floor.material instanceof THREE.MeshBasicMaterial) {
      const nextFloor = cinemaFloorMap(photo);
      floor.material.map?.dispose();
      floor.material.map = nextFloor;
      floor.material.needsUpdate = true;
    }
  };
  const paintCards = (): void => {
    BANKS.forEach((bank, i) => {
      const on = selected === bank.id || hover === bank.id;
      const next = hardenCanvasTex(new THREE.CanvasTexture(logoCanvas(logos[i], bank.short, bank.name, on, stills[i])));
      next.colorSpace = THREE.SRGBColorSpace;
      cardMats[i].map?.dispose();
      cardMats[i].map = next;
      if (cardMats[i] instanceof THREE.MeshPhysicalMaterial) {
        cardMats[i].emissive = new THREE.Color(on ? 0x1557ff : 0x000000);
        cardMats[i].emissiveIntensity = on ? 0.12 : 0;
      }
      cardMats[i].needsUpdate = true;
    });
    const gateOn = selected === 6 || hover === 6;
    if (gateOn !== gateLit) {
      gateLit = gateOn;
      stampJewel(gateOn);
    }
    if (rt2.material instanceof THREE.MeshPhysicalMaterial) {
      rt2.material.emissiveIntensity = selected === 7 || hover === 7 ? 0.95 : 0.55;
    } else {
      (rt2.material as THREE.MeshBasicMaterial).color.setHex(
        selected === 7 || hover === 7 ? 0x8eb0ff : 0x3d4f6c,
      );
    }
  };
  stills.forEach((img) => {
    if (!img.complete) img.onload = () => paintCards();
  });
  paintCards();
  onDuskPhoto(() => stampJewel(selected === 6 || hover === 6));

  const tick = (now: number): void => {
    const pulse = reduced ? 0 : Math.sin(((now - t0) / 6200) * Math.PI * 2) * 0.022;
    const travel = reduced ? 0.35 : ((now - t0) / 6200) % 1;
    camera.position.setFromSphericalCoords(lite ? 3.48 : 3.36, ax, ay);
    camera.lookAt(0, lite ? 0.38 : 0.4, 0);
    BANKS.forEach((_, i) => {
      const [x, , z] = bankXYZ(i, pulse);
      sitIssuerStill(cards[i], x, z);
      puddles[i].position.x = x;
      puddles[i].position.z = z;
    });
    crystal.rotation.x = 0;
    crystal.rotation.y = reduced ? 0 : Math.sin((now - t0) / 2800) * 0.1;
    if (heartRoot) {
      heartRoot.rotation.y = 0.28 + (reduced ? 0 : Math.sin((now - t0) / 2600) * 0.05);
    }
    if (ghostRoot) {
      ghostRoot.rotation.y = -0.22 + (reduced ? 0 : Math.sin((now - t0) / 2600 + 1.2) * 0.04);
    }
    if (flareRoot) {
      flareRoot.rotation.y = 0.48 + (reduced ? 0 : Math.sin((now - t0) / 2600 + 2.1) * 0.045);
    }
    culetFires.forEach((spark, i) => {
      const fire = spark.material as THREE.SpriteMaterial;
      const beat = reduced ? 0.44 : 0.4 + Math.abs(Math.sin((now - t0) / 1400 + i * 0.9)) * 0.22;
      fire.opacity = beat;
      const base = i === 0 ? 0.4 : i === 1 ? 0.24 : 0.2;
      spark.scale.set(base + beat * 0.08, base + beat * 0.08, 1);
    });
    caustic.rotation.z = reduced ? 0 : (now - t0) / 4200;
    causticMat.opacity = reduced ? 0.2 : 0.16 + Math.abs(Math.sin((now - t0) / 1600)) * 0.14;
    sparks.forEach((mesh, i) => {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const pulse = reduced ? 0.4 : 0.22 + Math.abs(Math.sin((now - t0) / 640 + i * 0.7)) * 0.38;
      mat.opacity = pulse;
      mesh.scale.setScalar(0.55 + pulse * 0.45);
    });
    rt2.rotation.z = 0;
    const from = Math.floor(travel * 6) % 6;
    const to = (from + 1) % 6;
    const local = (travel * 6) % 1;
    const a = cards[from].position;
    const c = cards[to].position;
    const gate = new THREE.Vector3(0, 0.12, 0);
    const beadPos =
      local < 0.5
        ? a.clone().lerp(gate, local * 2)
        : gate.clone().lerp(c, (local - 0.5) * 2);
    bead.position.copy(beadPos);
    gateLabel.lookAt(camera.position);
    rt2Label.lookAt(camera.position);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const loop = (): void => {
    tick(performance.now());
    raf = requestAnimationFrame(loop);
  };

  const onDown = (ev: PointerEvent): void => {
    dragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev: PointerEvent): void => {
    const nextHover = pick(ev.clientX, ev.clientY);
    if (nextHover !== hover) {
      hover = nextHover;
      paintCards();
    }
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    if (!dragging) {
      ay += (restAy + nx * 2 * orbit - ay) * 0.18;
      ax += (restAx + ny * 2 * orbit - ax) * 0.18;
    }
    paintHint(canvas, selected, hover);
    if (!dragging) return;
    ay = Math.max(restAy - orbit, Math.min(restAy + orbit, ay + (ev.clientX - lastX) * 0.012));
    ax = Math.max(restAx - orbit, Math.min(restAx + orbit, ax + (ev.clientY - lastY) * 0.01));
    lastX = ev.clientX;
    lastY = ev.clientY;
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onClick = (ev: PointerEvent): void => {
    const hit = pick(ev.clientX, ev.clientY);
    if (hit != null) {
      selected = hit;
      paintCards();
    }
    paintHint(canvas, selected, hover);
  };

  resize();
  paintHint(canvas, selected, hover);
  paintCards();
  const first = performance.now();
  tick(first);
  if (lite && performance.now() - first > 8000) {
    renderer.dispose();
    throw new Error('software-gl-slow');
  }
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('click', onClick);
  if (!reduced) raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    canvas.removeEventListener('click', onClick);
    composer?.dispose();
    renderer.dispose();
  };
}
