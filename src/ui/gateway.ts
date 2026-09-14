/** Filmic WebGL upgrade for the sterling corridor. 2D paints first from gateway2d. */

import * as THREE from 'three';
import { addCinemaHaze, addPracticals, addUnrealLook, applyPlateMap, cinemaChrome, cinemaFloorMap, climbUserData, duskCubeMap, duskWall, hardenCanvasTex, makeCinemaPlate, makeFloorContact, makeFloorPool, onDuskPhoto, type PlateFaceMat, visionStill } from './cinemaSet';
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
/** Thin brilliant girdle — waist area at rest, not a chrome torus. */
const GIRDLE_H = 0.068;
const GIRDLE_TOP = EQ_Y + GIRDLE_H * 0.5;
const GIRDLE_BOT = EQ_Y - GIRDLE_H * 0.5;

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
          ? { sx: 0.28, sy: 0.14, sw: 0.22, sh: 0.32, brightness: 1.24, contrast: 1.38, saturate: 0.82, multiply: 0.1 }
          : { sx: 0.46, sy: 0.16, sw: 0.2, sh: 0.3, brightness: 0.96, contrast: 1.4, saturate: 0.74, multiply: 0.16 }
        : lane === 0
          ? { sx: 0.34, sy: 0.2, sw: 0.18, sh: 0.26, brightness: 1.06, contrast: 1.32, saturate: 0.78, multiply: 0.1 }
          : { sx: 0.52, sy: 0.22, sw: 0.16, sh: 0.24, brightness: 0.84, contrast: 1.36, saturate: 0.7, multiply: 0.14 };
  if (!heart) return base;
  return {
    ...base,
    brightness: Math.min(1.32, base.brightness + 0.4),
    multiply: Math.max(0.02, base.multiply * 0.16),
    saturate: Math.min(1, base.saturate + 0.12),
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
  ctx.fillStyle = '#100c0a';
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
      ? 'rgba(242, 235, 224, 0.28)'
      : `rgba(36, 22, 16, ${grade.multiply})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, on ? '#f4f7fb' : lane === 0 ? '#c4b4a0' : '#8e8074');
    g.addColorStop(1, '#100c0a');
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
      ctx.fillStyle = lane === 0 ? 'rgba(16, 10, 8, 0.06)' : 'rgba(16, 10, 8, 0.18)';
      ctx.fillRect(x0, 0, bw, h);
    }
    ctx.fillStyle = lane === 0 ? 'rgba(234, 241, 255, 0.1)' : 'rgba(234, 241, 255, 0.05)';
    ctx.fillRect(x0, 0, 1.25, h);
    ctx.fillStyle = 'rgba(2, 6, 14, 0.52)';
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
    sheen: 0.38,
    sheenColor: new THREE.Color(0xeaf1ff),
    sheenRoughness: 0.18,
    iridescence: 1,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 420],
    clearcoat: 1,
    clearcoatRoughness: 0.035,
    specularIntensity: 1,
    specularColor: new THREE.Color(0xeaf1ff),
    envMapIntensity: 2.55,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.97,
    emissive: opts.on ? 0xeaf1ff : 0x1557ff,
    emissiveIntensity: opts.on ? 0.16 : 0.035,
  });
}

function tableLidTex(photo: HTMLImageElement | null = null): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, 256, 256);
    if (photo?.naturalWidth) {
      ctx.filter = 'contrast(1.18) brightness(0.9) saturate(0.72)';
      ctx.drawImage(
        photo,
        photo.naturalWidth * 0.22,
        photo.naturalHeight * 0.26,
        photo.naturalWidth * 0.48,
        photo.naturalHeight * 0.3,
        0,
        0,
        256,
        256,
      );
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(10, 14, 24, 0.38)';
      ctx.fillRect(0, 0, 256, 256);
      ctx.globalCompositeOperation = 'source-over';
    }
    const rim = ctx.createRadialGradient(128, 128, 88, 128, 128, 128);
    rim.addColorStop(0, 'rgba(234, 241, 255, 0)');
    rim.addColorStop(0.62, 'rgba(210, 228, 248, 0.04)');
    rim.addColorStop(1, 'rgba(210, 228, 248, 0.34)');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, 256, 256);
    const catchL = ctx.createRadialGradient(96, 86, 2, 96, 86, 52);
    catchL.addColorStop(0, 'rgba(255, 236, 210, 0.32)');
    catchL.addColorStop(1, 'rgba(255, 236, 210, 0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = catchL;
    ctx.fillRect(0, 0, 256, 256);
    ctx.globalCompositeOperation = 'source-over';
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
    ctx.strokeStyle = 'rgba(190, 220, 255, 0.22)';
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
    opacity: 0.74,
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
  g.addColorStop(0, 'rgba(234, 241, 255, 0.82)');
  g.addColorStop(0.1, 'rgba(160, 210, 255, 0.55)');
  g.addColorStop(0.26, 'rgba(90, 160, 220, 0.26)');
  g.addColorStop(0.48, 'rgba(255, 214, 160, 0.18)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2;
    const a1 = ((i + 0.38) / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(a0) * 238, 256 + Math.sin(a0) * 238);
    ctx.lineTo(256 + Math.cos(a1) * 238, 256 + Math.sin(a1) * 238);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? 'rgba(234, 241, 255, 0.54)' : 'rgba(255, 196, 128, 0.34)';
    ctx.fill();
  }
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
  tex.wrapT = THREE.RepeatWrapping;
  if (cut === 'table') tex.repeat.set(1, 1);
  else if (heart) tex.repeat.set(2.1, 1.55);
  else if (cut === 'crown') tex.repeat.set(2.4, 1.75);
  else tex.repeat.set(1.9, 1.4);
  return tex;
}

type LiteFire = 'window' | 'mirror' | 'crown' | 'girdle' | 'halo' | 'pav';

/** Hard studio glints on dark ice. Broad cube fresnel was the milky paper hull. */
function liteIcePreamble(): string {
  return `vec3 liteN = normalize(vLiteNormal);
if (!gl_FrontFacing) liteN = -liteN;
vec3 liteV = normalize(vLiteView);
float ndv = clamp(abs(dot(liteN, liteV)), 0.0, 1.0);
float rim = pow(1.0 - ndv, 2.35);
vec3 wN = normalize(vLiteWorldN);
if (!gl_FrontFacing) wN = -wN;
vec3 wV = normalize(vLiteWorldV);
vec3 wR = reflect(-wV, wN);
vec3 envRefl = textureCube(liteEnv, wR).rgb;
envRefl = mix(vec3(dot(envRefl, vec3(0.28, 0.52, 0.2))), envRefl * vec3(0.78, 0.9, 1.12), 0.2);
vec3 keyL = normalize(vec3(2.4, 2.6, 2.2));
vec3 fillL = normalize(vec3(-2.2, 1.8, 2.0));
vec3 backL = normalize(vec3(2.8, 2.1, -0.6));
vec3 coolL = normalize(vec3(-2.0, 1.6, -2.2));
vec3 camL = normalize(wV);
float specKey = pow(max(dot(wR, keyL), 0.0), 30.0);
float specFill = pow(max(dot(wR, fillL), 0.0), 48.0);
float specBack = pow(max(dot(wR, backL), 0.0), 32.0);
float specCool = pow(max(dot(wR, coolL), 0.0), 40.0);
float specCam = pow(max(dot(wR, camL), 0.0), 26.0);
vec3 glint = vec3(1.0, 0.94, 0.86) * specKey * 2.85
  + vec3(1.0, 0.96, 0.88) * specCam * 2.15
  + vec3(0.7, 0.86, 1.0) * specFill * 1.45
  + vec3(0.96, 0.98, 1.0) * specBack * 1.32
  + vec3(0.58, 0.8, 1.0) * specCool * 1.18;
#ifdef USE_COLOR
float kite = clamp(dot(vColor.rgb, vec3(0.3, 0.54, 0.16)), 0.0, 1.0);
#else
float kite = 0.42;
#endif`;
}

function liteFireChunk(kind: LiteFire): string {
  if (kind === 'mirror') {
    return `#include <map_fragment>
vec3 liteN = normalize(vLiteNormal);
if (!gl_FrontFacing) liteN = -liteN;
vec3 liteV = normalize(vLiteView);
float liteFacing = clamp(abs(dot(liteN, liteV)), 0.0, 1.0);
float liteFres = pow(1.0 - liteFacing, 1.35);
if (!gl_FrontFacing) {
  diffuseColor.rgb = vec3(0.05, 0.04, 0.035);
  diffuseColor.a = 0.94;
} else {
vec3 wN = normalize(vLiteWorldN);
vec3 wV = normalize(vLiteWorldV);
vec3 wR = reflect(-wV, wN);
vec3 envRefl = textureCube(liteEnv, wR).rgb;
envRefl = mix(vec3(dot(envRefl, vec3(0.28, 0.52, 0.2))), envRefl * vec3(0.78, 0.9, 1.12), 0.36);
float spec = pow(liteFres, 1.15);
diffuseColor.rgb = mix(diffuseColor.rgb, envRefl, spec * 0.28);
diffuseColor.rgb += envRefl * spec * 0.55;
diffuseColor.rgb += vec3(1.0, 0.92, 0.78) * spec * 0.22;
diffuseColor.a = mix(0.9, 0.96, spec);
}`;
  }
  if (kind === 'halo') {
    return `#include <map_fragment>
vec3 liteN = normalize(vLiteNormal);
if (!gl_FrontFacing) liteN = -liteN;
vec3 liteV = normalize(vLiteView);
float liteFacing = clamp(abs(dot(liteN, liteV)), 0.0, 1.0);
float liteFres = pow(1.0 - liteFacing, 2.15);
vec3 flash = diffuseColor.rgb;
vec3 wN = normalize(vLiteWorldN);
if (!gl_FrontFacing) wN = -wN;
vec3 wV = normalize(vLiteWorldV);
vec3 wR = reflect(-wV, wN);
vec3 envRefl = textureCube(liteEnv, wR).rgb;
envRefl = mix(vec3(dot(envRefl, vec3(0.28, 0.52, 0.2))), envRefl * vec3(0.78, 0.9, 1.12), 0.36);
float kite = clamp(flash.r * 0.7 + flash.b * 0.3, 0.0, 1.0);
diffuseColor.rgb = mix(vec3(0.62, 0.78, 0.96), flash, 0.55) * (0.04 + liteFres * 0.85);
diffuseColor.rgb += envRefl * liteFres * kite * 0.12;
diffuseColor.rgb += vec3(1.0, 0.93, 0.78) * liteFres * liteFres * (0.12 + kite * 0.28);
diffuseColor.a = liteFres * mix(0.04, 0.28, kite);`;
  }
  if (kind === 'pav') {
    return `#include <map_fragment>
${liteIcePreamble()}
vec3 body = mix(vec3(0.012, 0.016, 0.03), vec3(0.1, 0.14, 0.24), kite);
diffuseColor.rgb = body;
diffuseColor.rgb += envRefl * (rim * 0.14 + kite * 0.16);
diffuseColor.rgb += glint * (0.22 + kite * 2.05);
diffuseColor.a = 1.0;`;
  }
  if (kind === 'girdle') {
    return `#include <map_fragment>
${liteIcePreamble()}
vec3 body = mix(vec3(0.028, 0.032, 0.048), vec3(0.2, 0.26, 0.38), kite);
diffuseColor.rgb = body;
diffuseColor.rgb += envRefl * (rim * 0.18 + kite * 0.18);
diffuseColor.rgb += glint * (0.3 + kite * 1.95);
diffuseColor.a = 1.0;`;
  }
  if (kind === 'crown') {
    return `#include <map_fragment>
${liteIcePreamble()}
vec3 body = mix(vec3(0.016, 0.02, 0.036), vec3(0.17, 0.23, 0.36), kite);
diffuseColor.rgb = body;
diffuseColor.rgb += envRefl * (rim * 0.22 + kite * 0.3);
diffuseColor.rgb += glint * (0.34 + kite * 2.65);
diffuseColor.a = 1.0;`;
  }
  return `#include <map_fragment>
vec3 liteN = normalize(vLiteNormal);
if (!gl_FrontFacing) liteN = -liteN;
vec3 liteV = normalize(vLiteView);
float liteFacing = clamp(abs(dot(liteN, liteV)), 0.0, 1.0);
float liteFres = pow(1.0 - liteFacing, 1.55);
float liteSpark = fract(sin(dot(vMapUv, vec2(12.9898, 78.233))) * 43758.5453);
float liteFlash = smoothstep(0.88, 1.0, liteSpark) * liteFres;
vec3 liteT = refract(-liteV, liteN, 0.413);
vec2 iorOff = (dot(liteT, liteT) > 0.001 ? liteT.xy : liteN.xy) * (0.08 + liteFacing * 0.12);
vec4 iorSamp = texture2D(map, vMapUv + iorOff);
vec4 iorBack = texture2D(map, vMapUv - iorOff * 0.55);
diffuseColor.rgb = mix(diffuseColor.rgb, iorSamp.rgb, 0.28 + liteFacing * 0.34);
diffuseColor.rgb = mix(diffuseColor.rgb, iorBack.rgb, 0.12 + liteFres * 0.1);
vec3 wN = normalize(vLiteWorldN);
if (!gl_FrontFacing) wN = -wN;
vec3 wV = normalize(vLiteWorldV);
vec3 wR = reflect(-wV, wN);
vec3 wT = refract(-wV, wN, 0.413);
vec3 envRefl = textureCube(liteEnv, wR).rgb;
envRefl = mix(vec3(dot(envRefl, vec3(0.28, 0.52, 0.2))), envRefl * vec3(0.78, 0.9, 1.12), 0.36);
vec3 envRefr = textureCube(liteEnv, dot(wT, wT) > 0.001 ? wT : wR).rgb;
envRefr = mix(vec3(dot(envRefr, vec3(0.28, 0.52, 0.2))), envRefr * vec3(0.78, 0.9, 1.12), 0.36);
float spec = pow(liteFres, 1.85);
diffuseColor.rgb *= mix(0.8, 1.0, spec);
diffuseColor.rgb += envRefr * liteFacing * 0.05;
diffuseColor.rgb = mix(diffuseColor.rgb, envRefl, spec * 0.42);
diffuseColor.rgb += envRefl * spec * 2.55;
diffuseColor.rgb += vec3(1.0, 0.9, 0.72) * liteFres * 0.74;
diffuseColor.rgb += vec3(0.52, 0.76, 1.0) * liteFres * liteFres * 0.42;
diffuseColor.rgb += vec3(1.0, 0.95, 0.85) * liteFlash * 0.62;
diffuseColor.a *= mix(0.22, 0.96, liteFres);`;
}

function attachLiteFire(
  mat: THREE.MeshBasicMaterial,
  env: THREE.CubeTexture,
  kind: LiteFire = 'window',
): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.liteEnv = { value: env };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vLiteNormal;
varying vec3 vLiteView;
varying vec3 vLiteWorldN;
varying vec3 vLiteWorldV;`,
      )
      .replace(
        '#include <project_vertex>',
        `#include <beginnormal_vertex>
#include <defaultnormal_vertex>
#include <project_vertex>
vLiteNormal = normalize(transformedNormal);
vLiteView = normalize(-mvPosition.xyz);
vLiteWorldN = normalize(mat3(modelMatrix) * objectNormal);
vLiteWorldV = cameraPosition - (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform samplerCube liteEnv;
varying vec3 vLiteNormal;
varying vec3 vLiteView;
varying vec3 vLiteWorldN;
varying vec3 vLiteWorldV;`,
      )
      .replace('#include <map_fragment>', liteFireChunk(kind))
      .replace('#include <color_fragment>', '/* kite lives in ice; color_fragment would crush glint */');
  };
  mat.customProgramCacheKey = () => `qd-lite-fire-54-${kind}`;
}

function iceHaloMat(env: THREE.CubeTexture): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  mat.toneMapped = false;
  attachLiteFire(mat, env, 'halo');
  return mat;
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
    writeDepth?: boolean;
    mirror?: boolean;
    crown?: boolean;
    pav?: boolean;
    girdle?: boolean;
    doubleSide?: boolean;
    env?: THREE.CubeTexture;
  } = {},
): CutMat | THREE.MeshBasicMaterial {
  if (lite) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color: opts.tint ?? (opts.shade === false ? 0x5a6c88 : 0x93a6c0),
      side: opts.doubleSide ? THREE.DoubleSide : opts.window != null ? THREE.FrontSide : THREE.DoubleSide,
      vertexColors: Boolean(opts.vertexColors),
      transparent: opts.window != null,
      opacity: opts.window ?? 1,
      depthWrite: Boolean(opts.writeDepth) || opts.window == null || opts.window > 0.84,
    });
    mat.toneMapped = false;
    if (opts.window != null) {
      const fire: LiteFire = opts.mirror
        ? 'mirror'
        : opts.girdle
          ? 'girdle'
          : opts.pav
            ? 'pav'
            : opts.crown
              ? 'crown'
              : 'window';
      attachLiteFire(mat, opts.env ?? duskCubeMap(), fire);
    }
    return mat;
  }
  return diamondPhysical(tex, opts);
}

const KEY_DIR = new THREE.Vector3(2.4, 3.2, 2.1).normalize();
const RIM_DIR = new THREE.Vector3(-2.8, 1.2, -2.4).normalize();
/** Rest camera → jewel in crystal space. Stone stands upright; restAx supplies the 3/4. */
const VIEW_DIR = new THREE.Vector3(
  -(3.48 * Math.sin(1.24) * Math.sin(0.72)),
  0.42 - 3.48 * Math.cos(1.24),
  -(3.48 * Math.sin(1.24) * Math.cos(0.72)),
).normalize();

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
  /** Adjacent kites still differ; rest 3/4 key is the cut, not a watermelon stripe. */
  const stripe = 0.5 + 0.5 * Math.cos(Math.atan2(n.x, n.z) * 8);
  const shade = Math.min(1, 0.03 + key * 0.7 + facing * 0.2 + rim * 0.14 + stripe * 0.1);
  return new THREE.Color(
    Math.min(1, 0.03 + shade * 0.86 + key * 0.1),
    Math.min(1, 0.028 + shade * 0.68),
    Math.min(1, 0.06 + shade * 0.58 + (1 - stripe) * 0.04),
  );
}

function wrapU(x: number, z: number): number {
  return (Math.atan2(x, z) / (Math.PI * 2) + 0.875) % 1;
}

function wrapV(y: number, band: 'crown' | 'pav' = 'crown'): number {
  if (band === 'pav') return Math.min(1, Math.max(0, (y - BOT_Y) / (GIRDLE_BOT - BOT_Y)));
  return Math.min(1, Math.max(0, (y - GIRDLE_TOP) / (TABLE_Y - GIRDLE_TOP)));
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

/** Lite table is a bezel, not a cap — the window looks through to the pavilion. */
function tableRing(r: number, inner: number, sides: number): THREE.BufferGeometry {
  const g = new THREE.RingGeometry(inner, r, sides);
  g.rotateX(-Math.PI / 2);
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
  const n = new THREE.Vector3(bx - ax, by - ay, bz - az).cross(new THREE.Vector3(cx - ax, cy - ay, cz - az));
  const mid = new THREE.Vector3((ax + bx + cx) / 3, (ay + by + cy) / 3, (az + bz + cz) / 3);
  if (n.dot(mid) < 0) {
    const tx = bx;
    const ty = by;
    const tz = bz;
    bx = cx;
    by = cy;
    bz = cz;
    cx = tx;
    cy = ty;
    cz = tz;
  }
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

type WellLane = 0 | 1 | 2 | 3;

function wellGrade(lane: WellLane): GlassGrade {
  if (lane === 0) return { sx: 0.14, sy: 0.04, sw: 0.32, sh: 0.72, brightness: 1.04, contrast: 1.22, saturate: 0.82, multiply: 0.22 };
  if (lane === 1) return { sx: 0.38, sy: 0.06, sw: 0.3, sh: 0.7, brightness: 0.98, contrast: 1.2, saturate: 0.8, multiply: 0.14 };
  if (lane === 2) return { sx: 0.58, sy: 0.05, sw: 0.3, sh: 0.7, brightness: 0.86, contrast: 1.24, saturate: 0.74, multiply: 0.16 };
  return { sx: 0.24, sy: 0.1, sw: 0.34, sh: 0.68, brightness: 0.94, contrast: 1.18, saturate: 0.78, multiply: 0.14 };
}

function wellCanvas(photo: HTMLImageElement | null, on: boolean, lane: WellLane): HTMLCanvasElement {
  const grade = wellGrade(lane);
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 768;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.fillStyle = '#100c0a';
  ctx.fillRect(0, 0, c.width, c.height);
  if (photo?.naturalWidth) {
    const sx = photo.naturalWidth * grade.sx;
    const sy = photo.naturalHeight * grade.sy;
    const sw = Math.max(1, photo.naturalWidth * grade.sw);
    const sh = Math.max(1, photo.naturalHeight * grade.sh);
    ctx.filter = `contrast(${grade.contrast}) brightness(${grade.brightness}) saturate(${grade.saturate})`;
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, c.width, c.height);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = on ? 'rgba(242, 235, 224, 0.22)' : `rgba(36, 22, 16, ${grade.multiply})`;
    ctx.fillRect(0, 0, c.width, c.height);
    const vig = ctx.createLinearGradient(0, 0, 0, c.height);
    vig.addColorStop(0, 'rgba(12, 16, 28, 0.1)');
    vig.addColorStop(0.16, 'rgba(8, 12, 22, 0.78)');
    vig.addColorStop(0.4, 'rgba(7, 11, 20, 0.9)');
    vig.addColorStop(0.72, 'rgba(5, 8, 16, 0.95)');
    vig.addColorStop(1, 'rgba(5, 8, 14, 0.98)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';
  }
  scoreCut(ctx, c.width, c.height, 16, (lane % 2) as GlassLane);
  return c;
}

function wellTex(photo: HTMLImageElement | null, on: boolean, lane: WellLane = 0): THREE.CanvasTexture {
  const tex = hardenCanvasTex(new THREE.CanvasTexture(wellCanvas(photo, on, lane)));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function wellTri(
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  cz: number,
  ua: number,
  va: number,
  ub: number,
  vb: number,
  uc: number,
  vc: number,
): THREE.BufferGeometry {
  const n = new THREE.Vector3(bx - ax, by - ay, bz - az).cross(new THREE.Vector3(cx - ax, cy - ay, cz - az));
  const mid = new THREE.Vector3((ax + bx + cx) / 3, (ay + by + cy) / 3, (az + bz + cz) / 3);
  if (n.dot(mid) < 0) {
    const tx = bx;
    const ty = by;
    const tz = bz;
    const tu = ub;
    const tv = vb;
    bx = cx;
    by = cy;
    bz = cz;
    ub = uc;
    vb = vc;
    cx = tx;
    cy = ty;
    cz = tz;
    uc = tu;
    vc = tv;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([ax, ay, az, bx, by, bz, cx, cy, cz], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([ua, va, ub, vb, uc, vc], 2));
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
    ctx.filter = 'saturate(0.9) contrast(1.16) brightness(0.66)';
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
    opacity: 0.42,
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
  const cycMat = duskWall(backdropTex, 0x2a221c);
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
  addCinemaHaze(scene, 'warm');
  addPracticals(scene);

  scene.add(new THREE.AmbientLight(0xc4b8a8, lite ? 0.36 : 0.38));
  scene.add(new THREE.HemisphereLight(0xe8ddd0, 0x1a1410, lite ? 0.42 : 0.55));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 0.88 : 2.05);
  key.position.set(2.4, 3.2, 2.1);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc4a888, lite ? 0.42 : 0.7);
  rim.position.set(-2.8, 1.2, -2.4);
  scene.add(rim);
  const fill = new THREE.PointLight(0xc4a888, 0.38, 6);
  fill.position.set(0, 0.9, 0);
  scene.add(fill);
  const bounce = new THREE.DirectionalLight(0xb8a898, lite ? 0.14 : 0.1);
  bounce.position.set(0.35, -1.15, 1.45);
  scene.add(bounce);
  const culet = new THREE.PointLight(0xe8d4b0, lite ? 0.12 : 0.08, 1.8);
  culet.position.set(0.05, -0.42, 0.28);
  scene.add(culet);

  let cubeCam: THREE.CubeCamera | null = null;
  let cubeRT: THREE.WebGLCubeRenderTarget | null = null;
  let roomEnv = duskCubeMap();
  const studio: THREE.Mesh[] = [];
  if (lite) {
    try {
      cubeRT = new THREE.WebGLCubeRenderTarget(128, {
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      });
      cubeRT.texture.colorSpace = THREE.SRGBColorSpace;
      cubeCam = new THREE.CubeCamera(0.15, 16, cubeRT);
      cubeCam.position.set(0, 0.55, 0);
      scene.add(cubeCam);
      roomEnv = cubeRT.texture;
      const booth = (color: number, w: number, h: number, x: number, y: number, z: number): void => {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({
            color,
            toneMapped: false,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        mesh.position.set(x, y, z);
        mesh.lookAt(0, 0.22, 0);
        mesh.visible = false;
        scene.add(mesh);
        studio.push(mesh);
      };
      booth(0xffe8c4, 2.2, 0.32, 2.4, 2.6, 2.2);
      booth(0xb4dcff, 1.8, 0.26, -2.2, 1.8, 2.0);
      booth(0xffffff, 1.4, 0.18, 2.8, 2.1, -0.6);
      booth(0xdce8ff, 1.6, 0.24, -2.0, 1.6, -2.2);
    } catch {
      cubeCam = null;
      cubeRT = null;
    }
  }

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
  const tableInner = tableR * 0.48;
  const eqR = 0.56;
  const eqY = EQ_Y;
  const girdleTop = GIRDLE_TOP;
  const girdleBot = GIRDLE_BOT;
  const botY = BOT_Y;
  const midR = tableR + (eqR - tableR) * 0.52;
  const midY = tableY + (girdleTop - tableY) * 0.48;
  const pavR = eqR * 0.42;
  const pavY = girdleBot + (botY - girdleBot) * 0.52;
  const photo0 = visionStill();
  const crownA = glassMat(glassTex(photo0, false, 'crown', 0), lite, {
    transmission: 0.7,
    thickness: 0.52,
    tint: lite ? 0xffffff : 0xf6f0e8,
    vertexColors: lite,
    window: lite ? 1 : undefined,
    crown: lite,
    env: roomEnv,
  });
  const crownB = glassMat(glassTex(photo0, false, 'crown', 1), lite, {
    transmission: 0.7,
    thickness: 0.52,
    tint: lite ? 0xffffff : 0xe8ddd0,
    vertexColors: lite,
    window: lite ? 1 : undefined,
    crown: lite,
    env: roomEnv,
  });
  const pavA = glassMat(glassTex(photo0, false, 'pav', 0), lite, {
    transmission: 0.82,
    thickness: 0.7,
    tint: lite ? 0xffffff : 0xddd2c0,
    vertexColors: lite,
    window: lite ? 1 : undefined,
    pav: lite,
    env: roomEnv,
  });
  const pavB = glassMat(glassTex(photo0, false, 'pav', 1), lite, {
    transmission: 0.82,
    thickness: 0.7,
    tint: lite ? 0xffffff : 0xc4b8a6,
    vertexColors: lite,
    window: lite ? 1 : undefined,
    pav: lite,
    env: roomEnv,
  });
  const girdleIce = glassMat(glassTex(photo0, false, 'crown', 0), lite, {
    transmission: 0.48,
    thickness: 0.18,
    tint: lite ? 0xffffff : 0xf6f0e8,
    vertexColors: lite,
    window: lite ? 1 : undefined,
    girdle: lite,
    env: roomEnv,
  });
  const table = new THREE.Mesh(
    lite ? tableRing(tableR, tableInner, sides) : tableFan(tableR, sides),
    lite
      ? (() => {
          const mat = new THREE.MeshBasicMaterial({
            map: tableLidTex(photo0),
            color: 0xffffff,
            transparent: true,
            opacity: 0.42,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          mat.toneMapped = false;
          return mat;
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
  table.renderOrder = 2;
  if (lite && table.material instanceof THREE.MeshBasicMaterial) {
    table.material.polygonOffset = true;
    table.material.polygonOffsetFactor = -2;
    table.material.polygonOffsetUnits = -2;
  }
  crystal.add(table);
  const addCut = (
    geo: THREE.BufferGeometry,
    mat: CutMat | THREE.MeshBasicMaterial,
    list: THREE.Mesh[],
    withHalo = true,
  ): void => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.nodeId = 6;
    mesh.renderOrder = list === pavs ? 0 : 1;
    crystal.add(mesh);
    list.push(mesh);
    if (haloMat && withHalo && list !== pavs) {
      const halo = new THREE.Mesh(geo, haloMat);
      halo.userData.nodeId = 6;
      halo.renderOrder = 4;
      haloRoot.add(halo);
    }
  };
  const haloRoot = new THREE.Group();
  haloRoot.scale.setScalar(1.016);
  crystal.add(haloRoot);
  const haloMat = lite ? iceHaloMat(roomEnv) : null;
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
    addCut(triGeo(mx0, midY, mz0, x0, girdleTop, z0, x1, girdleTop, z1, 'crown'), crown, crowns);
    addCut(triGeo(mx0, midY, mz0, x1, girdleTop, z1, mx1, midY, mz1, 'crown'), crown, crowns);
    addCut(triGeo(tx0, tableY, tz0, mx0, midY, mz0, mx1, midY, mz1, 'crown'), crown, crowns, false);
    addCut(triGeo(tx0, tableY, tz0, mx1, midY, mz1, tx1, tableY, tz1, 'crown'), crown, crowns, false);
    addCut(triGeo(x0, girdleTop, z0, x0, girdleBot, z0, x1, girdleBot, z1, 'crown'), girdleIce, crowns);
    addCut(triGeo(x0, girdleTop, z0, x1, girdleBot, z1, x1, girdleTop, z1, 'crown'), girdleIce, crowns);
    addCut(triGeo(x0, girdleBot, z0, px0, pavY, pz0, px1, pavY, pz1, 'pav'), pav, pavs);
    addCut(triGeo(x0, girdleBot, z0, px1, pavY, pz1, x1, girdleBot, z1, 'pav'), pav, pavs);
    addCut(triGeo(px0, pavY, pz0, 0, botY, 0, px1, pavY, pz1, 'pav'), pav, pavs);
    if (!lite) {
      const amid = (a0 + a1) / 2;
      const starR = tableR + (eqR - tableR) * 0.4;
      const starY = tableY + (girdleTop - tableY) * 0.4;
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
      edgePts.push(x, girdleTop, z, Math.cos(n) * eqR, girdleTop, Math.sin(n) * eqR);
      edgePts.push(x, girdleBot, z, Math.cos(n) * eqR, girdleBot, Math.sin(n) * eqR);
      edgePts.push(x, girdleTop, z, x, girdleBot, z);
      edgePts.push(tx, tableY, tz, Math.cos(n) * tableR, tableY, Math.sin(n) * tableR);
      edgePts.push(mx, midY, mz, Math.cos(n) * midR, midY, Math.sin(n) * midR);
      edgePts.push(tx, tableY, tz, mx, midY, mz);
      edgePts.push(mx, midY, mz, x, girdleTop, z);
      edgePts.push(x, girdleBot, z, px, pavY, pz);
      edgePts.push(px, pavY, pz, 0, botY, 0);
    }
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePts, 3));
    crystal.add(
      new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({
          color: 0xeaf1ff,
          transparent: true,
          opacity: 0.08,
        }),
      ),
    );
  }
  const addGirdleLoop = (y: number, opacity: number): void => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      pts.push(new THREE.Vector3(Math.cos(a) * eqR, y, Math.sin(a) * eqR));
    }
    const loop = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: lite ? 0xf6ead6 : 0xeaf1ff,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    );
    loop.renderOrder = 3;
    crystal.add(loop);
  };
  if (!lite) {
    addGirdleLoop(girdleTop, 0.24);
    addGirdleLoop(girdleBot, 0.18);
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
  let wellMats: THREE.MeshBasicMaterial[] = [];
  let wellRoot: THREE.Group | null = null;
  const culetFires: THREE.Sprite[] = [];
  const girdleFires: THREE.Sprite[] = [];
  const crownFires: THREE.Sprite[] = [];
  if (lite) {
    const wraps = [0, 1, 2, 3].map((lane) => {
      const mat = new THREE.MeshBasicMaterial({
        map: wellTex(photo0, false, lane as WellLane),
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthWrite: true,
      });
      mat.toneMapped = false;
      return mat;
    });
    wellMats = wraps;
    wellRoot = new THREE.Group();
    wellRoot.userData.nodeId = 6;
    const wellTopR = tableInner * 0.92;
    const wellTopY = tableY - 0.012;
    const wellMidR = tableR * 0.22;
    const wellMidY = wellTopY + (botY + 0.05 - wellTopY) * 0.48;
    const wellBotR = tableR * 0.08;
    const wellBotY = botY + 0.05;
    const addWell = (geo: THREE.BufferGeometry, mat: THREE.MeshBasicMaterial): void => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.nodeId = 6;
      mesh.renderOrder = 0;
      wellRoot?.add(mesh);
    };
    const kite = (
      ax: number,
      ay: number,
      az: number,
      bx: number,
      by: number,
      bz: number,
      cx: number,
      cy: number,
      cz: number,
      dx: number,
      dy: number,
      dz: number,
      mat: THREE.MeshBasicMaterial,
      v0: number,
      v1: number,
    ): void => {
      addWell(wellTri(ax, ay, az, bx, by, bz, cx, cy, cz, 0, v0, 0, v1, 1, v1), mat);
      addWell(wellTri(ax, ay, az, cx, cy, cz, dx, dy, dz, 0, v0, 1, v1, 1, v0), mat);
    };
    for (let i = 0; i < sides; i++) {
      const a0 = (i / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const a1 = ((i + 1) / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const mat = wraps[i % 4];
      const tx0 = Math.cos(a0) * wellTopR;
      const tz0 = Math.sin(a0) * wellTopR;
      const tx1 = Math.cos(a1) * wellTopR;
      const tz1 = Math.sin(a1) * wellTopR;
      const mx0 = Math.cos(a0) * wellMidR;
      const mz0 = Math.sin(a0) * wellMidR;
      const mx1 = Math.cos(a1) * wellMidR;
      const mz1 = Math.sin(a1) * wellMidR;
      const bx0 = Math.cos(a0) * wellBotR;
      const bz0 = Math.sin(a0) * wellBotR;
      const bx1 = Math.cos(a1) * wellBotR;
      const bz1 = Math.sin(a1) * wellBotR;
      kite(tx0, wellTopY, tz0, mx0, wellMidY, mz0, mx1, wellMidY, mz1, tx1, wellTopY, tz1, mat, 0, 0.5);
      kite(mx0, wellMidY, mz0, bx0, wellBotY, bz0, bx1, wellBotY, bz1, mx1, wellMidY, mz1, mat, 0.5, 1);
    }
    const wellEdge: number[] = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const n = ((i + 1) / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const tx = Math.cos(a) * wellTopR;
      const tz = Math.sin(a) * wellTopR;
      const mx = Math.cos(a) * wellMidR;
      const mz = Math.sin(a) * wellMidR;
      const bx = Math.cos(a) * wellBotR;
      const bz = Math.sin(a) * wellBotR;
      wellEdge.push(tx, wellTopY, tz, Math.cos(n) * wellTopR, wellTopY, Math.sin(n) * wellTopR);
      wellEdge.push(mx, wellMidY, mz, Math.cos(n) * wellMidR, wellMidY, Math.sin(n) * wellMidR);
      wellEdge.push(tx, wellTopY, tz, mx, wellMidY, mz);
      wellEdge.push(mx, wellMidY, mz, bx, wellBotY, bz);
      wellEdge.push(bx, wellBotY, bz, 0, wellBotY, 0);
    }
    const wellEdgeGeo = new THREE.BufferGeometry();
    wellEdgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(wellEdge, 3));
    const wellSeams = new THREE.LineSegments(
      wellEdgeGeo,
      new THREE.LineBasicMaterial({
        color: 0xf2e6d4,
        transparent: true,
        opacity: 0.12,
      }),
    );
    wellSeams.visible = false;
    wellSeams.renderOrder = 1;
    wellRoot?.add(wellSeams);
    const wellFloor = new THREE.Mesh(tableFan(wellBotR, sides), wraps[0]);
    wellFloor.position.y = wellBotY;
    wellFloor.userData.nodeId = 6;
    wellFloor.renderOrder = 0;
    wellRoot.add(wellFloor);
    crystal.add(wellRoot);
    core.visible = false;
    const fires = [
      fireSprite(0xffffff, 0, BOT_Y + 0.08, 0.02, 0.3),
      fireSprite(0xb4dcff, 0.04, BOT_Y + 0.05, -0.02, 0.18),
      fireSprite(0xffe4c4, -0.03, BOT_Y + 0.06, 0.03, 0.16),
    ];
    fires.forEach((spark) => {
      crystal.add(spark);
      culetFires.push(spark);
    });
    const faceA = Math.atan2(Math.cos(0.72), Math.sin(0.72));
    [-0.32, 0, 0.32].forEach((da, i) => {
      const a = faceA + da;
      const spark = fireSprite(
        i === 1 ? 0xffffff : i === 0 ? 0xffe4c4 : 0xb4dcff,
        Math.cos(a) * midR,
        midY + 0.03,
        Math.sin(a) * midR,
        i === 1 ? 0.17 : 0.11,
      );
      spark.material.opacity = i === 1 ? 0.92 : 0.7;
      crystal.add(spark);
      crownFires.push(spark);
    });
    for (let i = 0; i < sides; i += 2) {
      const a = (i / sides) * Math.PI * 2 + face0 - Math.PI / sides;
      const spark = fireSprite(
        i % 4 ? 0xf6ead6 : 0xeaf1ff,
        Math.cos(a) * eqR,
        eqY,
        Math.sin(a) * eqR,
        0.042,
      );
      spark.material.opacity = 0.42;
      crystal.add(spark);
      girdleFires.push(spark);
    }
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
  lean.position.y = 0.28;
  lean.rotation.x = 0;
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
          color: 0x2c281f,
          metalness: 0.86,
          roughness: 0.18,
          emissive: 0xc4a888,
          emissiveIntensity: 0.12,
          clearcoat: 0.8,
        }),
  );
  if (lite && rt2.material instanceof THREE.MeshBasicMaterial) {
    rt2.material.color.setHex(0x2c281f);
    rt2.material.envMap = null;
    rt2.material.reflectivity = 0;
  }
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
  const cardMats: PlateFaceMat[] = [];
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
    new THREE.SphereGeometry(lite ? 0.022 : 0.038, lite ? 12 : 24, lite ? 12 : 24),
    cinemaChrome(lite),
  );
  if (lite && bead.material instanceof THREE.MeshBasicMaterial) {
    bead.material.color.setHex(0x5a4e40);
    bead.material.envMap = null;
    bead.material.reflectivity = 0;
  }
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
    ...(wellRoot ? [wellRoot] : []),
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
  let roomFrames = 0;
  const paintRoom = (): void => {
    if (!cubeCam) return;
    lean.visible = false;
    backdrop.visible = false;
    left.visible = false;
    right.visible = false;
    caustic.visible = false;
    floor.visible = false;
    pool.visible = false;
    const haze: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData.cinemaHaze) {
        obj.visible = false;
        haze.push(obj);
      }
    });
    for (const card of cards) card.visible = false;
    for (const puddle of puddles) puddle.visible = false;
    bead.visible = false;
    rt2.visible = false;
    rt2Label.visible = false;
    for (const card of studio) card.visible = true;
    cubeCam.update(renderer, scene);
    for (const card of studio) card.visible = false;
    bead.visible = true;
    rt2.visible = true;
    rt2Label.visible = true;
    for (const puddle of puddles) puddle.visible = true;
    for (const card of cards) card.visible = true;
    for (const obj of haze) obj.visible = true;
    lean.visible = true;
    backdrop.visible = true;
    left.visible = true;
    right.visible = true;
    caustic.visible = true;
    floor.visible = true;
    pool.visible = true;
  };

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
      swapMap(tmat, tableLidTex(photo));
    } else {
      swapMap(tmat, glassTex(photo, on, 'table'));
    }
    swapMap(crownA, glassTex(photo, on, 'crown', 0));
    swapMap(crownB, glassTex(photo, on, 'crown', 1));
    swapMap(pavA, glassTex(photo, false, 'pav', 0));
    swapMap(pavB, glassTex(photo, false, 'pav', 1));
    wellMats.forEach((mat, i) => swapMap(mat, wellTex(photo, on, (i % 4) as WellLane)));
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
        selected === 7 || hover === 7 ? 0xc4a888 : 0x2c281f,
      );
    }
  };
  stills.forEach((img) => {
    if (!img.complete) img.onload = () => paintCards();
  });
  paintCards();
  onDuskPhoto(() => {
    stampJewel(selected === 6 || hover === 6);
    paintRoom();
  });

  const tick = (now: number): void => {
    const pulse = reduced ? 0 : Math.sin(((now - t0) / 6200) * Math.PI * 2) * 0.022;
    const travel = reduced ? 0.35 : ((now - t0) / 6200) % 1;
    camera.position.setFromSphericalCoords(lite ? 3.48 : 3.36, ax, ay);
    camera.lookAt(0, lite ? 0.42 : 0.44, 0);
    BANKS.forEach((_, i) => {
      const [x, , z] = bankXYZ(i, pulse);
      sitIssuerStill(cards[i], x, z);
      puddles[i].position.x = x;
      puddles[i].position.z = z;
    });
    crystal.rotation.x = 0;
    crystal.rotation.y = reduced ? 0 : Math.sin((now - t0) / 2800) * 0.1;
    culetFires.forEach((spark, i) => {
      const fire = spark.material as THREE.SpriteMaterial;
      const beat = reduced ? 0.52 : 0.5 + Math.abs(Math.sin((now - t0) / 1400 + i * 0.9)) * 0.28;
      fire.opacity = beat;
      const base = i === 0 ? 0.22 : i === 1 ? 0.14 : 0.12;
      spark.scale.set(base + beat * 0.08, base + beat * 0.08, 1);
    });
    girdleFires.forEach((spark, i) => {
      const fire = spark.material as THREE.SpriteMaterial;
      fire.opacity = reduced ? 0.18 : 0.14 + Math.abs(Math.sin((now - t0) / 980 + i * 0.55)) * 0.2;
    });
    crownFires.forEach((spark, i) => {
      const fire = spark.material as THREE.SpriteMaterial;
      const beat = reduced ? 0.48 : 0.42 + Math.abs(Math.sin((now - t0) / 1100 + i * 0.7)) * 0.28;
      fire.opacity = beat;
      const base = i === 1 ? 0.13 : 0.085;
      spark.scale.set(base + beat * 0.04, base + beat * 0.04, 1);
    });
    caustic.rotation.z = reduced ? 0 : (now - t0) / 4200;
    causticMat.opacity = reduced ? 0.36 : 0.34 + Math.abs(Math.sin((now - t0) / 1600)) * 0.26;
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
    roomFrames += 1;
    if (lite && cubeCam && roomFrames > 1 && roomFrames % 6 === 0) paintRoom();
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
    cubeRT?.dispose();
    renderer.dispose();
  };
}
