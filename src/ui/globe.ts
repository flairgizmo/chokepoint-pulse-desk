import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { applyPhotoEnv, duskWall, hardenCanvasTex } from './cinemaSet';
import { canUseBloom, probeWebGL } from './webgl';
import { latLonToVec, vecToLatLon } from './latlon';
import {
  CITIES,
  SETTLEMENT_ROUTES,
  TOKEN_CORRIDORS,
  cityById,
  type City,
} from '../data/cities';

export { latLonToVec, vecToLatLon } from './latlon';

export interface GlobeHud {
  lat: number;
  lon: number;
  altitudeKm: number;
  zoom: number;
  hoverId?: string;
}

export interface GlobeOverlays {
  routes: boolean;
  corridors: boolean;
  activity: boolean;
  labels: boolean;
  night: boolean;
  day: boolean;
  spin: boolean;
}

interface GlobeOptions {
  onCity: (id: string) => void;
  onHud: (hud: GlobeHud) => void;
}

const DAY_TEX = '/visuals/earth/day.jpg';
const NIGHT_TEX = '/visuals/earth/night.jpg';
const BUMP_TEX = 'https://unpkg.com/three-globe@2.44.1/example/img/earth-topology.png';
const WATER_TEX = 'https://unpkg.com/three-globe@2.44.1/example/img/earth-water.png';
const Y_AXIS = new THREE.Vector3(0, 1, 0);

const dayStill = new Image();
dayStill.crossOrigin = 'anonymous';
dayStill.decoding = 'async';
dayStill.src = DAY_TEX;

function dayStillReady(): boolean {
  return Boolean(dayStill.complete && dayStill.naturalWidth);
}

function makeLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = '600 26px Outfit, "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(7, 11, 20, 0.82)';
    const w = Math.min(240, ctx.measureText(text).width + 24);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') ctx.roundRect(8, 14, w, 36, 6);
    else ctx.rect(8, 14, w, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(234, 241, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#eaf1ff';
    ctx.fillText(text, 20, 40);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.42, 0.105, 1);
  sprite.center.set(0, 0.5);
  return sprite;
}

function greatCircle(a: THREE.Vector3, b: THREE.Vector3, n = 64): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const aa = a.clone().normalize();
  const bb = b.clone().normalize();
  const omega = Math.acos(THREE.MathUtils.clamp(aa.dot(bb), -1, 1));
  const r = a.length();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const lift = Math.sin(t * Math.PI) * 0.055;
    let dir: THREE.Vector3;
    if (omega < 1e-5) dir = aa.clone();
    else {
      const so = Math.sin(omega);
      dir = aa
        .clone()
        .multiplyScalar(Math.sin((1 - t) * omega) / so)
        .add(bb.clone().multiplyScalar(Math.sin(t * omega) / so));
    }
    out.push(dir.normalize().multiplyScalar(r * (1.02 + lift)));
  }
  return out;
}

/** Oceans from the raw NASA still — not a full-sphere overlay, not a baked terminator. */
function oceanMask(
  img: HTMLImageElement,
  w: number,
  h: number,
  rgb: [number, number, number],
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return c;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const p = data.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i];
    const g = p[i + 1];
    const b = p[i + 2];
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    const ocean = (b > r + 6 && b >= g - 4 && lum < 96 && Math.max(r, g, b) < 130)
      || (b > r + 10 && b > g + 4 && lum < 150 && r < 90);
    p[i] = rgb[0];
    p[i + 1] = rgb[1];
    p[i + 2] = rgb[2];
    p[i + 3] = ocean ? 255 : 0;
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

/** Uniform cinema crush for the NASA day still. Not a terminator — that stays a scene mesh. */
function gradeCinemaDay(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, img.naturalWidth || img.width);
  c.height = Math.max(1, img.naturalHeight || img.height);
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.filter = 'contrast(1.14) saturate(0.9) brightness(0.98)';
  ctx.drawImage(img, 0, 0, c.width, c.height);
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.22;
  ctx.drawImage(oceanMask(img, c.width, c.height, [18, 36, 56]), 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

function cinemaDayTexture(img: HTMLImageElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(gradeCinemaDay(img));
  tex.colorSpace = THREE.SRGBColorSpace;
  return hardenCanvasTex(tex);
}

/** White oceans / black land for the lite spec shell. Derived from the NASA still. */
function waterSpecTex(img: HTMLImageElement): THREE.CanvasTexture {
  const w = Math.min(1024, img.naturalWidth || 1024);
  const h = Math.min(512, img.naturalHeight || 512);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(oceanMask(img, w, h, [255, 255, 255]), 0, 0);
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  return tex;
}

function oceanSpecMat(sunDir: THREE.Vector3): THREE.ShaderMaterial {
  const hold = document.createElement('canvas');
  hold.width = 1;
  hold.height = 1;
  const hctx = hold.getContext('2d');
  if (hctx) {
    hctx.fillStyle = '#000';
    hctx.fillRect(0, 0, 1, 1);
  }
  const holdTex = new THREE.CanvasTexture(hold);
  holdTex.needsUpdate = true;
  return new THREE.ShaderMaterial({
    uniforms: {
      water: { value: holdTex },
      sunDir: { value: sunDir.clone() },
    },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vV;
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wpos = modelMatrix * vec4(position, 1.0);
        vV = cameraPosition - wpos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D water;
      uniform vec3 sunDir;
      varying vec3 vN;
      varying vec3 vV;
      varying vec2 vUv;
      void main(){
        float wet = texture2D(water, vUv).g;
        vec3 n = normalize(vN);
        vec3 v = normalize(vV);
        vec3 l = normalize(sunDir);
        float fres = pow(1.0 - abs(dot(n, v)), 2.4);
        float spec = pow(max(0.0, dot(reflect(-l, n), v)), 42.0);
        float a = wet * (fres * 0.12 + spec * 0.7);
        gl_FragColor = vec4(0.76, 0.88, 1.0, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function nightLightsMat(sunDir: THREE.Vector3): THREE.ShaderMaterial {
  const hold = document.createElement('canvas');
  hold.width = 1;
  hold.height = 1;
  const hctx = hold.getContext('2d');
  if (hctx) {
    hctx.fillStyle = '#000';
    hctx.fillRect(0, 0, 1, 1);
  }
  const holdTex = new THREE.CanvasTexture(hold);
  holdTex.needsUpdate = true;
  return new THREE.ShaderMaterial({
    uniforms: {
      lights: { value: holdTex },
      sunDir: { value: sunDir.clone() },
    },
    vertexShader: `
      varying vec3 vN;
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D lights;
      uniform vec3 sunDir;
      varying vec3 vN;
      varying vec2 vUv;
      void main(){
        float night = smoothstep(0.18, -0.22, dot(normalize(vN), normalize(sunDir)));
        vec3 c = texture2D(lights, vUv).rgb;
        float glow = max(c.r, max(c.g * 0.85, c.b * 0.55));
        float city = smoothstep(0.08, 0.2, glow);
        gl_FragColor = vec4(vec3(1.25, 0.94, 0.62) * city, night * city * 0.95);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function makeDayTex(lite: boolean, img: HTMLImageElement): THREE.Texture {
  const tex = lite ? cinemaDayTexture(img) : new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Navy hold so the first tick is not the teal cue-ball. Replaced when the NASA still arrives. */
function earthHoldTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 4;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, '#0a1422');
    g.addColorStop(0.5, '#122033');
    g.addColorStop(1, '#0a1422');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Painted orbit dome. Not a Vision still — Canary on this sphere reads as a city room. */
function orbitSkyTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return hardenCanvasTex(new THREE.CanvasTexture(c));
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, '#03050c');
  g.addColorStop(0.22, '#070b14');
  g.addColorStop(0.46, '#10182c');
  g.addColorStop(0.5, '#1c2438');
  g.addColorStop(0.54, '#10182c');
  g.addColorStop(0.78, '#070b14');
  g.addColorStop(1, '#03050c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = 'screen';
  const air = ctx.createRadialGradient(c.width * 0.5, c.height * 0.52, 24, c.width * 0.5, c.height * 0.52, 380);
  air.addColorStop(0, 'rgba(158, 196, 238, 0.18)');
  air.addColorStop(0.42, 'rgba(90, 120, 168, 0.08)');
  air.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = air;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = 'source-over';
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Sun-locked dusk wedge. Night is a dusk veil; day stays a clear hole so the still reads. */
function terminatorTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return hardenCanvasTex(new THREE.CanvasTexture(c));
  const g = ctx.createLinearGradient(0, 0, c.width, 0);
  g.addColorStop(0, 'rgba(6, 10, 20, 0.62)');
  g.addColorStop(0.36, 'rgba(8, 14, 28, 0.34)');
  g.addColorStop(0.48, 'rgba(28, 52, 88, 0.1)');
  g.addColorStop(0.56, 'rgba(170, 200, 230, 0.04)');
  g.addColorStop(0.64, 'rgba(255, 255, 255, 0)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const poles = ctx.createLinearGradient(0, 0, 0, c.height);
  poles.addColorStop(0, 'rgba(8, 14, 28, 0.28)');
  poles.addColorStop(0.2, 'rgba(8, 14, 28, 0)');
  poles.addColorStop(0.8, 'rgba(8, 14, 28, 0)');
  poles.addColorStop(1, 'rgba(8, 14, 28, 0.32)');
  ctx.fillStyle = poles;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function stars(count = 1800, opacity = 0.55): THREE.Points {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(14 + Math.random() * 10);
    pos[i * 3] = v.x;
    pos[i * 3 + 1] = v.y;
    pos[i * 3 + 2] = v.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0xe8eef8,
      size: 0.018,
      transparent: true,
      opacity,
      sizeAttenuation: true,
    }),
  );
}

/** Tight sun-locked wet-ocean catch. Scene child — never baked into the day still. */
function sunGlintTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return hardenCanvasTex(new THREE.CanvasTexture(c));
  const g = ctx.createRadialGradient(128, 128, 2, 128, 128, 118);
  g.addColorStop(0, 'rgba(236, 246, 255, 0.9)');
  g.addColorStop(0.08, 'rgba(210, 228, 248, 0.42)');
  g.addColorStop(0.22, 'rgba(180, 200, 255, 0.12)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Broader wet-ocean sheen. Black field + one blob — not a full-sphere day overlay. */
function oceanSheenTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (!ctx) return hardenCanvasTex(new THREE.CanvasTexture(c));
  const g = ctx.createRadialGradient(128, 138, 8, 128, 128, 124);
  g.addColorStop(0, 'rgba(255, 244, 220, 0.72)');
  g.addColorStop(0.22, 'rgba(200, 220, 255, 0.24)');
  g.addColorStop(0.58, 'rgba(140, 170, 210, 0.06)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class EarthGlobe {
  private root: HTMLElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private earth: THREE.Object3D | null = null;
  private frame = 0;
  private disposed = false;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private startX = 0;
  private startY = 0;
  private phi = 1.08;
  private theta = 2.05;
  private earthSpin = 0.42;
  private distance = 2.42;
  private velTheta = 0;
  private velPhi = 0;
  private followId: string | undefined;
  private overlays: GlobeOverlays = {
    routes: false,
    corridors: false,
    activity: false,
    labels: false,
    night: true,
    day: true,
    spin: true,
  };
  private routeLines: THREE.Line[] = [];
  private corridorLines: THREE.Line[] = [];
  private pulse: THREE.Mesh | null = null;
  private pinMeshes: THREE.Object3D[] = [];
  private labelSprites: THREE.Sprite[] = [];
  private globeMesh: THREE.Mesh | null = null;
  private lightsMesh: THREE.Mesh | null = null;
  private composer: EffectComposer | null = null;
  private dayTex: THREE.Texture | null = null;
  private nightTex: THREE.Texture | null = null;
  private terminator: THREE.Mesh | null = null;
  private glint: THREE.Mesh | null = null;
  private sheen: THREE.Mesh | null = null;
  private medSheen: THREE.Mesh | null = null;
  private biscaySheen: THREE.Mesh | null = null;
  private oceanMesh: THREE.Mesh | null = null;
  private sun: THREE.DirectionalLight | null = null;
  private readonly sunDir = new THREE.Vector3(-2.6, 1.2, 2.4).normalize();
  private hoverId: string | undefined;
  private lastHudHover: string | undefined;
  private hudClock = 0;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private opts: GlobeOptions;
  private reduced: boolean;

  constructor(root: HTMLElement, opts: GlobeOptions) {
    this.root = root;
    this.opts = opts;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mount();
  }

  setOverlays(next: Partial<GlobeOverlays>): void {
    this.overlays = { ...this.overlays, ...next };
    for (const l of this.routeLines) l.visible = this.overlays.routes;
    for (const l of this.corridorLines) l.visible = this.overlays.corridors;
    if (this.pulse) this.pulse.visible = this.overlays.activity;
    for (const s of this.labelSprites) s.visible = this.overlays.labels;
    if (this.terminator) this.terminator.visible = this.overlays.day;
    if (this.glint) this.glint.visible = this.overlays.day;
    if (this.sheen) this.sheen.visible = this.overlays.day && !this.lite;
    if (this.medSheen) this.medSheen.visible = this.overlays.day && !this.lite;
    if (this.biscaySheen) this.biscaySheen.visible = this.overlays.day && !this.lite;
    if (this.oceanMesh) this.oceanMesh.visible = this.overlays.day;
    this.applyMaps();
  }

  focusCity(id: string): void {
    const city = cityById(id);
    if (!city) return;
    this.followId = id;
    this.lookAtCity(city);
    this.distance = 1.48;
  }

  zoomBy(delta: number): void {
    const step = this.distance < 1.8 ? delta * 0.55 : delta;
    this.distance = THREE.MathUtils.clamp(this.distance + step, 1.12, 6);
  }

  reset(): void {
    this.followId = 'london';
    this.earthSpin = 0.42;
    this.velTheta = 0;
    this.velPhi = 0;
    this.panX = 0;
    this.distance = 2.42;
    const london = cityById('london');
    if (london) this.lookAtCity(london);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.composer?.dispose();
    this.renderer?.dispose();
    this.root.replaceChildren();
  }

  private lookAtCity(city: City): void {
    if (this.flat) {
      this.panX = ((city.lon + 180) / 360) * this.flatWidth - this.flatWidth / 2;
      return;
    }
    const local = latLonToVec(city.lat, city.lon, 1);
    local.applyAxisAngle(Y_AXIS, this.earthSpin);
    const sph = new THREE.Spherical().setFromVector3(local);
    this.phi = THREE.MathUtils.clamp(sph.phi, 0.18, Math.PI - 0.18);
    this.theta = sph.theta;
  }

  private flat = false;
  private lite = false;
  private flatDay: CanvasImageSource | null = null;
  private flatNight: HTMLImageElement | null = null;
  private panX = 0;
  private flatWidth = 1;

  private mountFlat(canvas: HTMLCanvasElement): void {
    this.flat = true;
    canvas.dataset.engine = 'canvas2d';
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.root.innerHTML =
        '<p class="earth-fallback">The globe could not start. Use the city list beside the map.</p>';
      return;
    }
    const load = (src: string, assign: (img: HTMLImageElement) => void): void => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        assign(img);
      };
      img.src = src;
    };
    load(DAY_TEX, (img) => {
      this.flatDay = this.lite ? gradeCinemaDay(img) : img;
    });
    load(NIGHT_TEX, (img) => {
      this.flatNight = img;
    });
    const resize = (): void => {
      const { width, height } = this.root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      this.flatWidth = canvas.width;
    };
    const project = (lat: number, lon: number): [number, number] => {
      const { width: W, height: H } = canvas;
      const x = ((((lon + 180) / 360) * W - this.panX) % W + W) % W;
      const y = ((90 - lat) / 180) * H;
      return [x, y];
    };
    const tile = (img: CanvasImageSource): void => {
      const { width: W, height: H } = canvas;
      const shift = ((-this.panX % W) + W) % W;
      ctx.drawImage(img, shift - W, 0, W, H);
      ctx.drawImage(img, shift, 0, W, H);
    };
    const arc = (from: City, to: City, color: string, width: number): void => {
      const { width: W } = canvas;
      const [x1, y1] = project(from.lat, from.lon);
      let [x2, y2] = project(to.lat, to.lon);
      if (Math.abs(x2 - x1) > W / 2) x2 += x2 > x1 ? -W : W;
      const copies = [0];
      if (x2 < 0) copies.push(W);
      if (x2 > W) copies.push(-W);
      for (const dx of copies) {
        const ax = x1 + dx;
        const bx = x2 + dx;
        const mx = (ax + bx) / 2;
        const my = Math.min(y1, y2) - Math.abs(bx - ax) * 0.22;
        ctx.beginPath();
        ctx.moveTo(ax, y1);
        ctx.quadraticCurveTo(mx, my, bx, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
      }
    };
    const paint = (): void => {
      const { width: W, height: H } = canvas;
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, W, H);
      const day = this.overlays.day && this.flatDay;
      const night = this.overlays.night && this.flatNight;
      if (day) tile(day);
      else if (!night) {
        ctx.fillStyle = '#0d2233';
        ctx.fillRect(0, H * 0.28, W, H * 0.44);
      }
      if (night) {
        if (day) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.82;
        }
        tile(night);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      const wash = ctx.createLinearGradient(0, 0, 0, H);
      wash.addColorStop(0, 'rgba(5, 8, 16, 0.42)');
      wash.addColorStop(0.45, 'rgba(5, 8, 16, 0.08)');
      wash.addColorStop(1, 'rgba(5, 8, 16, 0.55)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);
      const vignette = ctx.createRadialGradient(W * 0.5, H * 0.48, H * 0.12, W * 0.5, H * 0.5, Math.max(W, H) * 0.68);
      vignette.addColorStop(0, 'rgba(21, 87, 255, 0.04)');
      vignette.addColorStop(1, 'rgba(4, 8, 16, 0.38)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.lineCap = 'round';
      if (this.overlays.routes) {
        for (const [a, b] of SETTLEMENT_ROUTES) {
          const from = cityById(a);
          const to = cityById(b);
          if (from && to) arc(from, to, 'rgba(186, 204, 224, 0.38)', Math.max(1.1, W / 900));
        }
      }
      if (this.overlays.corridors) {
        for (const [a, b] of TOKEN_CORRIDORS) {
          const from = cityById(a);
          const to = cityById(b);
          if (from && to) arc(from, to, 'rgba(142, 176, 255, 0.72)', Math.max(1.6, W / 620));
        }
      }
      ctx.restore();
      for (const city of CITIES) {
        const [x, y] = project(city.lat, city.lon);
        const hq = city.kind === 'Headquarters';
        const hex = `#${kindColor(city.kind).toString(16).padStart(6, '0')}`;
        ctx.beginPath();
        ctx.fillStyle = hq ? 'rgba(232, 212, 176, 0.18)' : 'rgba(196, 210, 228, 0.12)';
        ctx.arc(x, y, hq ? 14 : 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = hex;
        ctx.shadowColor = hex;
        ctx.shadowBlur = hq ? 16 : 10;
        ctx.arc(x, y, hq ? 6 : 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (this.overlays.labels) {
          ctx.font = `600 ${Math.max(11, W / 92)}px Outfit, system-ui, sans-serif`;
          ctx.fillStyle = '#f4f7fb';
          ctx.fillText(city.name, x + 10, y + 4);
        }
      }
    };
    canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.followId = undefined;
      this.lastX = e.clientX;
      this.startX = e.clientX;
      this.startY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.panX -= (e.clientX - this.lastX) * (canvas.width / Math.max(1, canvas.clientWidth));
      this.lastX = e.clientX;
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) < 6) {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * sx;
        const py = (e.clientY - rect.top) * sy;
        let best: string | undefined;
        let dist = 18;
        for (const city of CITIES) {
          const [x, y] = project(city.lat, city.lon);
          const d = Math.hypot(x - px, y - py);
          if (d < dist) {
            dist = d;
            best = city.id;
          }
        }
        if (best) this.opts.onCity(best);
      }
    });
    window.addEventListener('resize', resize);
    resize();
    const loop = () => {
      if (this.disposed) return;
      this.frame = requestAnimationFrame(loop);
      if (!this.reduced && !this.dragging && this.overlays.spin) this.panX += 0.55;
      paint();
    };
    loop();
  }

  private mount(): void {
    const canvas = document.createElement('canvas');
    canvas.className = 'earth-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    this.root.appendChild(canvas);

    const probe = probeWebGL();
    if (!probe) {
      this.lite = true;
      this.mountFlat(canvas);
      return;
    }
    this.lite = probe.lite;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !this.lite,
        alpha: true,
        powerPreference: this.lite ? 'low-power' : 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      this.mountFlat(canvas);
      return;
    }
    this.renderer = renderer;
    canvas.dataset.engine = 'webgl';
    canvas.dataset.profile = this.lite ? 'lite' : 'unreal';
    renderer.setPixelRatio(this.lite ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = this.lite ? 1.2 : 1.28;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    this.scene = scene;
    applyPhotoEnv(renderer, scene, this.lite);
    scene.add(stars(this.lite ? 160 : 900, this.lite ? 0.32 : 0.48));
    scene.background = new THREE.Color(0x070b14);
    const skyMat = duskWall(orbitSkyTex(), 0xffffff, THREE.BackSide);
    skyMat.depthWrite = false;
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(28, 48, 28), skyMat));
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    this.camera = camera;

    const group = new THREE.Group();
    this.earth = group;
    scene.add(group);

    const segs = this.lite ? 48 : 96;
    const rings = this.lite ? 32 : 64;
    this.dayTex = dayStillReady() ? makeDayTex(this.lite, dayStill) : earthHoldTex();
    const globeMat = this.lite
      ? new THREE.MeshBasicMaterial({ color: 0xffffff, map: this.dayTex })
      : new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          map: this.dayTex,
          roughness: 0.28,
          metalness: 0.18,
          emissive: 0x031016,
          clearcoat: 0.85,
          clearcoatRoughness: 0.12,
          ior: 1.33,
          envMapIntensity: 1.4,
        });
    if (!dayStillReady()) {
      const takeDay = (): void => {
        if (this.disposed || !dayStill.naturalWidth) return;
        this.dayTex = makeDayTex(this.lite, dayStill);
        this.paintOcean(dayStill);
        this.applyMaps();
      };
      dayStill.addEventListener('load', takeDay, { once: true });
      if (dayStillReady()) takeDay();
    }
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1, segs, rings), globeMat);
    this.globeMesh = globe;
    group.add(globe);
    if (this.lite) {
      const oceanMat = oceanSpecMat(this.sunDir);
      const ocean = new THREE.Mesh(new THREE.SphereGeometry(1.006, segs, rings), oceanMat);
      ocean.renderOrder = 3;
      group.add(ocean);
      this.oceanMesh = ocean;
      if (dayStillReady()) this.paintOcean(dayStill);
    }
    if (!this.lite) group.add(this.graticule());

    const lights = new THREE.Mesh(
      new THREE.SphereGeometry(1.004, segs, rings),
      this.lite
        ? nightLightsMat(this.sunDir)
        : new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
    );
    this.lightsMesh = lights;
    lights.visible = false;
    lights.renderOrder = 2;
    group.add(lights);

    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.058, this.lite ? 32 : 64, this.lite ? 24 : 48),
      new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0xb9d4ee) } },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vV;
          void main(){
            vN = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vN;
          varying vec3 vV;
          uniform vec3 color;
          void main(){
            float fresnel = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.55);
            gl_FragColor = vec4(color, fresnel * 0.88);
          }`,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    atmo.renderOrder = 3;
    group.add(atmo);
    const limb = new THREE.Mesh(
      new THREE.SphereGeometry(1.003, segs, rings),
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vN;
          varying vec3 vV;
          void main(){
            vN = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vN;
          varying vec3 vV;
          void main(){
            float f = abs(dot(normalize(vN), normalize(vV)));
            float edge = pow(1.0 - f, 1.45);
            gl_FragColor = vec4(0.05, 0.08, 0.14, edge * 0.72);
          }`,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    );
    limb.renderOrder = 5;
    group.add(limb);

    if (this.lite) {
      const term = new THREE.Mesh(
        new THREE.SphereGeometry(1.006, segs, rings),
        new THREE.MeshBasicMaterial({
          map: terminatorTex(),
          color: 0xffffff,
          transparent: true,
          opacity: 1,
          depthWrite: false,
        }),
      );
      term.renderOrder = 1;
      term.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), this.sunDir.clone().negate());
      scene.add(term);
      this.terminator = term;
    }
    const glint = new THREE.Mesh(
      new THREE.PlaneGeometry(this.lite ? 0.14 : 0.28, this.lite ? 0.09 : 0.18),
      new THREE.MeshBasicMaterial({
        map: sunGlintTex(),
        color: 0xffffff,
        transparent: true,
        opacity: this.lite ? 0.52 : 0.92,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    const glintDir = latLonToVec(36, -16, 1).applyAxisAngle(Y_AXIS, this.earthSpin).normalize();
    glint.position.copy(glintDir.multiplyScalar(1.018));
    glint.lookAt(0, 0, 0);
    glint.renderOrder = 4;
    scene.add(glint);
    this.glint = glint;
    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.52),
      new THREE.MeshBasicMaterial({
        map: oceanSheenTex(),
        color: 0xffffff,
        transparent: true,
        opacity: this.lite ? 0.26 : 0.58,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    const sheenDir = latLonToVec(30, -24, 1).applyAxisAngle(Y_AXIS, this.earthSpin).normalize();
    sheen.position.copy(sheenDir.multiplyScalar(1.015));
    sheen.lookAt(0, 0, 0);
    sheen.renderOrder = 4;
    sheen.visible = !this.lite;
    scene.add(sheen);
    this.sheen = sheen;
    const med = new THREE.Mesh(
      new THREE.PlaneGeometry(0.48, 0.3),
      new THREE.MeshBasicMaterial({
        map: oceanSheenTex(),
        color: 0xffffff,
        transparent: true,
        opacity: this.lite ? 0.3 : 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    const medDir = latLonToVec(37, 6, 1).applyAxisAngle(Y_AXIS, this.earthSpin).normalize();
    med.position.copy(medDir.multiplyScalar(1.016));
    med.lookAt(0, 0, 0);
    med.renderOrder = 4;
    med.visible = !this.lite;
    scene.add(med);
    this.medSheen = med;
    const biscay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.34),
      new THREE.MeshBasicMaterial({
        map: oceanSheenTex(),
        color: 0xffffff,
        transparent: true,
        opacity: this.lite ? 0.26 : 0.58,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    const biscayDir = latLonToVec(45, -8, 1).applyAxisAngle(Y_AXIS, this.earthSpin).normalize();
    biscay.position.copy(biscayDir.multiplyScalar(1.016));
    biscay.lookAt(0, 0, 0);
    biscay.renderOrder = 4;
    biscay.visible = !this.lite;
    scene.add(biscay);
    this.biscaySheen = biscay;

    const paintTex = (src: string, assign: (tex: THREE.Texture) => void, cinema = false): void => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const tex = cinema ? cinemaDayTexture(img) : new THREE.Texture(img);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        assign(tex);
        this.applyMaps();
      };
      img.src = src;
    };
    if (dayStillReady()) this.applyMaps();
    paintTex(NIGHT_TEX, (tex) => {
      this.nightTex = tex;
    });
    const loader = new THREE.TextureLoader();
    const ignore = (): void => undefined;
    if (!this.lite) {
      loader.load(
        BUMP_TEX,
        (tex) => {
          const mat = this.globeMesh?.material as THREE.MeshPhysicalMaterial | undefined;
          if (!mat) return;
          mat.bumpMap = tex;
          mat.bumpScale = 0.055;
          mat.needsUpdate = true;
        },
        undefined,
        ignore,
      );
      loader.load(
        WATER_TEX,
        (tex) => {
          tex.colorSpace = THREE.LinearSRGBColorSpace;
          const mat = this.globeMesh?.material as THREE.MeshPhysicalMaterial | undefined;
          if (!mat) return;
          mat.metalnessMap = tex;
          mat.metalness = 0.42;
          mat.roughness = 0.38;
          mat.needsUpdate = true;
        },
        undefined,
        ignore,
      );
    }

    scene.add(new THREE.AmbientLight(0x8ea0b8, this.lite ? 0.62 : 0.36));
    const key = new THREE.DirectionalLight(0xfff4e5, 1.85);
    key.position.set(-2.6, 1.2, 2.4);
    this.sun = key;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x2451e6, 0.35);
    rim.position.set(3.2, -0.4, -2.2);
    scene.add(rim);

    for (const city of CITIES) {
      const pos = latLonToVec(city.lat, city.lon, 1.012);
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(city.kind === 'Headquarters' ? 0.009 : 0.006, this.lite ? 8 : 12, this.lite ? 8 : 12),
        this.lite
          ? new THREE.MeshBasicMaterial({ color: kindColor(city.kind) })
          : new THREE.MeshPhysicalMaterial({
              color: kindColor(city.kind),
              emissive: kindColor(city.kind),
              emissiveIntensity: 0.32,
              roughness: 0.28,
              metalness: 0.42,
              clearcoat: 0.55,
            }),
      );
      pin.position.copy(pos);
      pin.userData.cityId = city.id;
      group.add(pin);
      this.pinMeshes.push(pin);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(this.lite ? 0.0032 : 0.0024, this.lite ? 0.0032 : 0.0024, 0.06, 6),
        new THREE.MeshBasicMaterial({ color: kindColor(city.kind) }),
      );
      stem.position.copy(latLonToVec(city.lat, city.lon, 1.04));
      stem.lookAt(0, 0, 0);
      stem.rotateX(Math.PI / 2);
      stem.userData.cityId = city.id;
      group.add(stem);
      this.pinMeshes.push(stem);
      const label = makeLabelSprite(city.name);
      label.scale.set(0.34, 0.085, 1);
      label.position.copy(latLonToVec(city.lat, city.lon, 1.09));
      label.userData.cityId = city.id;
      group.add(label);
      this.labelSprites.push(label);
    }

    const london = CITIES.find((c) => c.id === 'london')!;
    this.followId = london.id;
    this.lookAtCity(london);
    this.pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe8d4b0, transparent: true, opacity: 0.34 }),
    );
    this.pulse.position.copy(latLonToVec(london.lat, london.lon, 1.03));
    group.add(this.pulse);

    const arcSegs = this.lite ? 32 : 64;
    this.routeLines = SETTLEMENT_ROUTES.map(([a, b]) =>
      this.addArc(cityById(a)!, cityById(b)!, 0x8aa0b4, this.lite ? 0.16 : 0.32, arcSegs),
    );
    this.corridorLines = TOKEN_CORRIDORS.map(([a, b]) =>
      this.addArc(cityById(a)!, cityById(b)!, 0x8eb0ff, this.lite ? 0.38 : 0.7, arcSegs),
    );

    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.followId = undefined;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.startX = e.clientX;
      this.startY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.pickHover();
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.velTheta = -dx * 0.012;
      this.velPhi = dy * 0.009;
      this.theta += this.velTheta;
      this.phi = THREE.MathUtils.clamp(this.phi + this.velPhi, 0.18, Math.PI - 0.18);
    });
    const endDrag = (e: PointerEvent) => {
      if (!this.dragging) return;
      this.dragging = false;
      if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) < 6) this.pick();
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointerleave', () => {
      this.dragging = false;
      this.hoverId = undefined;
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomBy(e.deltaY * 0.0014);
      },
      { passive: false },
    );
    canvas.addEventListener('dblclick', () => {
      this.distance = THREE.MathUtils.clamp(this.distance - 0.85, 1.12, 6);
    });

    if (canUseBloom(renderer)) {
      try {
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(8, 8), 0.42, 0.52, 0.72));
        composer.addPass(new OutputPass());
        this.composer = composer;
      } catch {
        this.composer = null;
      }
    }

    this.resize();
    const first = performance.now();
    this.tick();
    if (this.lite && performance.now() - first > 2500) {
      this.renderer.dispose();
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.composer = null;
      canvas.remove();
      const flat = document.createElement('canvas');
      flat.className = 'earth-canvas';
      flat.setAttribute('aria-hidden', 'true');
      this.root.appendChild(flat);
      this.mountFlat(flat);
      return;
    }
    const loop = () => {
      if (this.disposed) return;
      this.frame = requestAnimationFrame(loop);
      this.tick();
    };
    loop();
  }

  private graticule(): THREE.LineSegments {
    const pts: THREE.Vector3[] = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lon = -180; lon < 180; lon += 6) {
        pts.push(latLonToVec(lat, lon, 1.012), latLonToVec(lat, lon + 6, 1.012));
      }
    }
    for (let lon = -180; lon < 180; lon += 15) {
      for (let lat = -80; lat < 80; lat += 6) {
        pts.push(latLonToVec(lat, lon, 1.012), latLonToVec(lat + 6, lon, 1.012));
      }
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ color: 0x8eb4ff, transparent: true, opacity: 0.16 }),
    );
  }

  private addArc(a: City, b: City, color: number, opacity: number, segs = 64): THREE.Line {
    const pts = greatCircle(latLonToVec(a.lat, a.lon, 1), latLonToVec(b.lat, b.lon, 1), segs);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    this.earth?.add(line);
    return line;
  }

  private pick(): void {
    if (!this.camera) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pinMeshes, false);
    const id = hits[0]?.object.userData.cityId as string | undefined;
    if (id) this.opts.onCity(id);
  }

  private pickHover(): void {
    if (!this.camera) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pinMeshes, false);
    this.hoverId = hits[0]?.object.userData.cityId as string | undefined;
  }

  private resize(): void {
    if (!this.renderer || !this.camera) return;
    const { width, height } = this.root.getBoundingClientRect();
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.composer?.setSize(w, h);
  }

  private facingLatLon(): { lat: number; lon: number } {
    if (!this.camera) return { lat: 0, lon: 0 };
    const world = this.camera.position.clone().normalize();
    world.applyAxisAngle(Y_AXIS, -this.earthSpin);
    return vecToLatLon(world);
  }

  private emitHud(): void {
    const hover = this.hoverId ? cityById(this.hoverId) : undefined;
    const facing = hover ? { lat: hover.lat, lon: hover.lon } : this.facingLatLon();
    const altitudeKm = Math.round((this.distance - 1.05) * 6371);
    this.opts.onHud({
      lat: facing.lat,
      lon: facing.lon,
      altitudeKm: Math.max(40, altitudeKm),
      zoom: Number((2.85 / this.distance).toFixed(1)),
      hoverId: this.hoverId,
    });
  }

  private tick(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.earth) return;
    if (!this.dragging) {
      this.theta += this.velTheta;
      this.phi = THREE.MathUtils.clamp(this.phi + this.velPhi, 0.18, Math.PI - 0.18);
      this.velTheta *= 0.9;
      this.velPhi *= 0.9;
      if (Math.abs(this.velTheta) < 0.00008) this.velTheta = 0;
      if (Math.abs(this.velPhi) < 0.00008) this.velPhi = 0;
    }
    if (!this.reduced && !this.dragging && this.overlays.spin) this.earthSpin += 0.0034;
    this.earth.rotation.set(0, this.earthSpin, 0);
    if (this.followId && !this.dragging) {
      const city = cityById(this.followId);
      if (city) this.lookAtCity(city);
    }
    this.camera.position.setFromSphericalCoords(this.distance, this.phi, this.theta);
    this.camera.lookAt(0, 0, 0);
    if (this.sun) this.sun.intensity = this.overlays.day ? 1.85 : 0.35;
    if (this.pulse && this.overlays.activity && !this.reduced) {
      const s = 1 + Math.sin(performance.now() / 420) * 0.55;
      this.pulse.scale.setScalar(s);
    }
    this.layoutLabels();
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    this.hudClock += 1;
    if (this.hoverId !== this.lastHudHover || this.hudClock % 4 === 0) {
      this.lastHudHover = this.hoverId;
      this.emitHud();
    }
  }

  private layoutLabels(): void {
    if (!this.camera || !this.renderer) return;
    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;
    const placed: Array<{ x: number; y: number }> = [];
    const minDist = 110;
    let shown = 0;
    const cap = 4;
    const rank = (id: string): number => {
      if (id === this.followId || id === this.hoverId) return 0;
      const city = cityById(id);
      return city?.kind === 'Headquarters' ? 1 : 2;
    };
    const sprites = [...this.labelSprites].sort((a, b) => rank(String(a.userData.cityId)) - rank(String(b.userData.cityId)));
    const world = new THREE.Vector3();
    const ndc = new THREE.Vector3();
    for (const sprite of sprites) {
      if (!this.overlays.labels) {
        sprite.visible = false;
        continue;
      }
      sprite.getWorldPosition(world);
      const facing = world.clone().normalize().dot(this.camera.position.clone().normalize());
      if (facing < 0.22) {
        sprite.visible = false;
        continue;
      }
      ndc.copy(world).project(this.camera);
      if (ndc.z > 1 || Math.abs(ndc.x) > 1.08 || Math.abs(ndc.y) > 1.08) {
        sprite.visible = false;
        continue;
      }
      const x = (ndc.x * 0.5 + 0.5) * w;
      const y = (-ndc.y * 0.5 + 0.5) * h;
      const forced = rank(String(sprite.userData.cityId)) < 2;
      const hit = placed.some((p) => Math.hypot(p.x - x, p.y - y) < minDist);
      sprite.visible = forced || (!hit && shown < cap);
      if (sprite.visible) {
        shown += 1;
        placed.push({ x, y });
      }
    }
  }

  private paintOcean(img: HTMLImageElement): void {
    const mat = this.oceanMesh?.material as THREE.ShaderMaterial | undefined;
    if (!mat || !img.naturalWidth) return;
    mat.uniforms.water.value = waterSpecTex(img);
    mat.needsUpdate = true;
  }

  private applyMaps(): void {
    const mat = this.globeMesh?.material as (THREE.MeshStandardMaterial | THREE.MeshBasicMaterial) | undefined;
    if (mat) {
      if (this.overlays.day && this.dayTex) {
        mat.map = this.dayTex;
        mat.color = new THREE.Color(0xffffff);
        if ('emissive' in mat) mat.emissive = new THREE.Color(0x0a1218);
      } else {
        mat.map = this.overlays.night && this.nightTex ? this.nightTex : null;
        mat.color = new THREE.Color(this.nightTex && this.overlays.night ? 0xffffff : 0x0c1828);
        if ('emissive' in mat) mat.emissive = new THREE.Color(0x071018);
      }
      mat.needsUpdate = true;
    }
    if (this.terminator) this.terminator.visible = this.overlays.day;
    if (this.glint) this.glint.visible = this.overlays.day;
    if (this.sheen) this.sheen.visible = this.overlays.day && !this.lite;
    if (this.medSheen) this.medSheen.visible = this.overlays.day && !this.lite;
    if (this.biscaySheen) this.biscaySheen.visible = this.overlays.day && !this.lite;
    if (this.oceanMesh) this.oceanMesh.visible = this.overlays.day;
    if (this.lightsMesh) {
      const showLights = Boolean(this.overlays.night && this.nightTex);
      const shader = this.lightsMesh.material as THREE.ShaderMaterial;
      const basic = this.lightsMesh.material as THREE.MeshBasicMaterial;
      if ('uniforms' in shader && shader.uniforms.lights) {
        if (this.nightTex) shader.uniforms.lights.value = this.nightTex;
        this.lightsMesh.visible = showLights;
        shader.needsUpdate = true;
      } else if (showLights) {
        basic.map = this.nightTex;
        this.lightsMesh.visible = true;
        basic.opacity = this.overlays.day ? 0.72 : 1;
        basic.needsUpdate = true;
      } else {
        this.lightsMesh.visible = false;
      }
    }
  }
}

function kindColor(kind: City['kind']): number {
  switch (kind) {
    case 'Headquarters':
      return 0xc4a070;
    case 'Banking':
      return 0xb89a6e;
    case 'Lab':
      return 0x9eb4d0;
    case 'Standards':
      return 0xb8c4d8;
    case 'Research':
      return 0xa8c0bc;
    default:
      return 0xeaf1ff;
  }
}
