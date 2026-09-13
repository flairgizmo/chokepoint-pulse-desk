/** Filmic WebGL upgrade for the sterling corridor. 2D paints first from gateway2d. */

import * as THREE from 'three';
import { addUnrealLook, cinemaFloorMap, duskSheen, hardenCanvasTex, onDuskPhoto, visionStill } from './cinemaSet';
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

const GLASS_TINT = [
  'rgba(21, 87, 255, 0.36)',
  'rgba(196, 58, 134, 0.32)',
  'rgba(18, 153, 180, 0.34)',
  'rgba(61, 114, 224, 0.34)',
  'rgba(143, 46, 212, 0.3)',
  'rgba(10, 168, 136, 0.32)',
];

type GlassCut = 'crown' | 'bezel' | 'pav' | 'table';

function paintPhotoGlass(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  i: number,
  w: number,
  h: number,
  on = false,
  cut: GlassCut = 'crown',
): void {
  ctx.fillStyle = '#02060f';
  ctx.fillRect(0, 0, w, h);
  if (photo?.naturalWidth) {
    const cols = 4;
    const fx = (i % cols) / cols;
    const fy = ((Math.floor(i / cols) * 3 + i) % 5) / 8;
    const sx = fx * photo.naturalWidth;
    const sy = fy * photo.naturalHeight;
    const sw = Math.max(1, photo.naturalWidth * 0.5);
    const sh = Math.max(1, photo.naturalHeight * 0.62);
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, w, h);
    const bx = ((fx + 0.28) % 1) * photo.naturalWidth;
    const by = ((fy + 0.18) % 0.7) * photo.naturalHeight;
    ctx.save();
    ctx.globalAlpha = cut === 'table' ? 0.26 : cut === 'pav' ? 0.4 : 0.3;
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(photo, bx, by, sw * 0.72, sh * 0.72, 0, h * 0.1, w, h * 0.9);
    ctx.restore();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = on
      ? 'rgba(234, 241, 255, 0.4)'
      : cut === 'pav'
        ? 'rgba(6, 14, 36, 0.52)'
        : cut === 'table'
          ? 'rgba(21, 87, 255, 0.2)'
          : GLASS_TINT[i % GLASS_TINT.length];
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, on ? '#f4f7fb' : '#1557FF');
    g.addColorStop(1, '#02060f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'screen';
  const catchL = ctx.createLinearGradient(0, 0, w * 0.58, h * 0.42);
  catchL.addColorStop(0, cut === 'pav' ? 'rgba(234, 241, 255, 0.16)' : 'rgba(234, 241, 255, 0.36)');
  catchL.addColorStop(0.5, 'rgba(234, 241, 255, 0)');
  ctx.fillStyle = catchL;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.58, 0);
  ctx.lineTo(0, h * 0.4);
  ctx.closePath();
  ctx.fill();
  const fire = ctx.createLinearGradient(w, 0, 0, h);
  fire.addColorStop(0, i % 2 ? 'rgba(255, 72, 168, 0.2)' : 'rgba(60, 230, 255, 0.18)');
  fire.addColorStop(0.38, 'rgba(21, 87, 255, 0)');
  ctx.fillStyle = fire;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = i % 2 ? 'rgba(255, 92, 176, 0.52)' : 'rgba(90, 240, 255, 0.48)';
  ctx.lineWidth = Math.max(3, w / 64);
  ctx.strokeRect(5, 5, w - 10, h - 10);
  ctx.strokeStyle = 'rgba(234, 241, 255, 0.26)';
  ctx.lineWidth = Math.max(2, w / 80);
  ctx.strokeRect(12, 12, w - 24, h - 24);
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

function causticCanvas(photo: HTMLImageElement | null): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.fillStyle = '#02060f';
  ctx.fillRect(0, 0, 512, 512);
  if (photo?.naturalWidth) {
    ctx.globalAlpha = 0.5;
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
  const g = ctx.createRadialGradient(256, 256, 8, 256, 256, 244);
  g.addColorStop(0, 'rgba(234, 241, 255, 0.72)');
  g.addColorStop(0.2, 'rgba(90, 240, 255, 0.34)');
  g.addColorStop(0.48, 'rgba(255, 72, 168, 0.16)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(234, 241, 255, 0.2)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(a) * 220, 256 + Math.sin(a) * 220);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

function facetCanvas(i: number, on = false, photo: HTMLImageElement | null = null): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  paintPhotoGlass(ctx, photo, i, 512, 1024, on, i < 8 ? 'crown' : 'bezel');
  if (i === 0) {
    ctx.fillStyle = 'rgba(244,247,251,0.96)';
    ctx.font = '800 260px Outfit, IBM Plex Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Q', 256, 540);
  }
  return c;
}

function pavCanvas(i: number, photo: HTMLImageElement | null = null): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  paintPhotoGlass(ctx, photo, i + 8, 512, 512, false, 'pav');
  return c;
}

function tableCanvas(photo: HTMLImageElement | null = null): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    paintPhotoGlass(ctx, photo, 16, 512, 512, false, 'table');
    ctx.fillStyle = '#0B1F5C';
    ctx.font = '800 236px Outfit, IBM Plex Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Q', 256, 280);
  }
  return c;
}

function facetMaterial(
  i: number,
  on: boolean,
  lite: boolean,
  photo: HTMLImageElement | null = null,
): THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial {
  const tex = hardenCanvasTex(new THREE.CanvasTexture(facetCanvas(i, on, photo)));
  tex.colorSpace = THREE.SRGBColorSpace;
  return lite
    ? duskSheen({
        map: tex,
        reflectivity: 0.28,
        combine: THREE.MixOperation,
        side: THREE.DoubleSide,
      })
    : diamondPhysical(tex, { on, transmission: 0.7, thickness: 0.52 });
}

function quadGeo(
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
): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([ax, ay, az, bx, by, bz, cx, cy, cz, ax, ay, az, cx, cy, cz, dx, dy, dz], 3),
  );
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1], 2));
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
): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([ax, ay, az, bx, by, bz, cx, cy, cz], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0.5, 0, 1, 1, 0, 1], 2));
  g.computeVertexNormals();
  return g;
}

function pavMaterial(
  i: number,
  lite: boolean,
  photo: HTMLImageElement | null = null,
): THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial {
  const tex = hardenCanvasTex(new THREE.CanvasTexture(pavCanvas(i, photo)));
  tex.colorSpace = THREE.SRGBColorSpace;
  return lite
    ? duskSheen({
        map: tex,
        reflectivity: 0.3,
        combine: THREE.MixOperation,
        side: THREE.DoubleSide,
      })
    : diamondPhysical(tex, { transmission: 0.82, thickness: 0.7 });
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
    ctx.filter = 'saturate(1.18) contrast(1.12) brightness(0.86)';
    coverDraw(ctx, still, CARD_W, CARD_H);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CARD_W, CARD_H);
  }
  ctx.fillStyle = on ? 'rgba(7, 11, 20, 0.28)' : 'rgba(7, 11, 20, 0.42)';
  ctx.fillRect(0, CARD_H - 196, CARD_W, 196);
  const bw = 292;
  const bh = 64;
  const bx = (CARD_W - bw) / 2;
  const by = CARD_H - 176;
  ctx.fillStyle = on ? '#ffffff' : '#f4f7fb';
  ctx.shadowColor = 'rgba(7, 11, 20, 0.45)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(bx, by, bw, bh, 14);
  else ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = on ? '#1557FF' : 'rgba(11, 31, 92, 0.18)';
  ctx.lineWidth = on ? 3 : 1.5;
  ctx.stroke();
  const wide = Boolean(img && img.naturalWidth / Math.max(1, img.naturalHeight) > 6);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (img?.complete && img.naturalWidth && img.naturalHeight && !wide) {
    containDraw(ctx, img, bx + 18, by + 12, bw - 36, bh - 24);
  } else {
    ctx.fillStyle = '#0B1F5C';
    ctx.font = '800 28px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(wide ? 'Lloyds' : short, CARD_W / 2, by + bh / 2);
  }
  const label = name === 'Lloyds Banking Group' ? 'Lloyds' : name;
  ctx.fillStyle = '#F4F7FB';
  ctx.font = `800 ${label.length > 10 ? 36 : 44}px Outfit, IBM Plex Sans, sans-serif`;
  ctx.fillText(label, CARD_W / 2, CARD_H - 72);
  ctx.fillStyle = 'rgba(234, 241, 255, 0.72)';
  ctx.font = '600 20px Outfit, IBM Plex Sans, sans-serif';
  ctx.fillText('GBTD issuer', CARD_W / 2, CARD_H - 32);
  return c;
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
  const camera = new THREE.PerspectiveCamera(lite ? 34 : 32, 1, 0.05, 40);
  const group = new THREE.Group();
  scene.add(group);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5.2, lite ? 48 : 96),
    lite
      ? duskSheen({ map: cinemaFloorMap(), reflectivity: 0.42, transparent: true, opacity: 0.94 })
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
  });
  const caustic = new THREE.Mesh(new THREE.CircleGeometry(1.15, 48), causticMat);
  caustic.rotation.x = -Math.PI / 2;
  caustic.position.y = -0.31;
  scene.add(caustic);
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(1.08, 48),
    new THREE.MeshBasicMaterial({
      color: 0x6aa8ff,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  halo.position.set(0, 0.5, -0.58);
  scene.add(halo);

  const backdropTex = new THREE.TextureLoader().load('/visuals/topics/canary.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
  });
  backdropTex.colorSpace = THREE.SRGBColorSpace;
  scene.background = backdropTex;
  const cycMat = duskSheen({ map: backdropTex, reflectivity: 0.14 });
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

  scene.add(new THREE.AmbientLight(0x8ea0c0, lite ? 0.72 : 0.38));
  scene.add(new THREE.HemisphereLight(0xc9d6f0, 0x0a1220, lite ? 0.85 : 0.55));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 2.45 : 2.05);
  key.position.set(2.4, 3.2, 2.1);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3b7bff, 1.15);
  rim.position.set(-2.8, 1.2, -2.4);
  scene.add(rim);
  const fill = new THREE.PointLight(0x00a878, 0.7, 6);
  fill.position.set(0, 0.9, 0);
  scene.add(fill);

  const crystal = new THREE.Group();
  const crowns: THREE.Mesh[] = [];
  const pavs: THREE.Mesh[] = [];
  const stars: THREE.Mesh[] = [];
  const sparks: THREE.Mesh[] = [];
  const sides = 8;
  const restAyFace = 0.5;
  const face0 = Math.PI / 2 - restAyFace + Math.PI / sides;
  const tableR = 0.18;
  const tableY = 0.92;
  const eqR = 0.48;
  const eqY = 0.48;
  const botY = -0.16;
  const midR = tableR + (eqR - tableR) * 0.52;
  const midY = tableY + (eqY - tableY) * 0.48;
  const pavR = eqR * 0.42;
  const pavY = eqY + (botY - eqY) * 0.52;
  const tableTex = hardenCanvasTex(new THREE.CanvasTexture(tableCanvas(visionStill())));
  tableTex.colorSpace = THREE.SRGBColorSpace;
  const table = new THREE.Mesh(
    new THREE.CircleGeometry(tableR, sides),
    lite
      ? duskSheen({
          map: tableTex,
          reflectivity: 0.3,
          combine: THREE.MixOperation,
          side: THREE.DoubleSide,
        })
      : diamondPhysical(tableTex, { transmission: 0.38, thickness: 0.28 }),
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = tableY;
  table.userData.nodeId = 6;
  crystal.add(table);
  const addCut = (geo: THREE.BufferGeometry, mat: THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial, list: THREE.Mesh[]): void => {
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
    const photo = visionStill();
    addCut(quadGeo(mx0, midY, mz0, x0, eqY, z0, x1, eqY, z1, mx1, midY, mz1), facetMaterial(i, false, lite, photo), crowns);
    addCut(quadGeo(tx0, tableY, tz0, mx0, midY, mz0, mx1, midY, mz1, tx1, tableY, tz1), facetMaterial(i + 8, false, lite, photo), crowns);
    addCut(quadGeo(x0, eqY, z0, px0, pavY, pz0, px1, pavY, pz1, x1, eqY, z1), pavMaterial(i, lite, photo), pavs);
    addCut(triGeo(px0, pavY, pz0, 0, botY, 0, px1, pavY, pz1), pavMaterial(i + 8, lite, photo), pavs);
    const amid = (a0 + a1) / 2;
    const starR = tableR + (eqR - tableR) * 0.4;
    const starY = tableY + (eqY - tableY) * 0.4;
    const sx = Math.cos(amid) * starR;
    const sz = Math.sin(amid) * starR;
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute([tx0, tableY, tz0, tx1, tableY, tz1, sx, starY, sz], 3));
    starGeo.computeVertexNormals();
    const star = new THREE.Mesh(
      starGeo,
      new THREE.MeshBasicMaterial({
        color: i % 2 ? 0xff5cb0 : 0x5af0ff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    star.userData.nodeId = 6;
    crystal.add(star);
    stars.push(star);
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 8, 8),
      new THREE.MeshBasicMaterial({
        color: i % 2 ? 0xff5cb0 : 0x5af0ff,
        transparent: true,
        opacity: 0.92,
      }),
    );
    spark.position.set(x0, eqY, z0);
    spark.userData.nodeId = 6;
    crystal.add(spark);
    sparks.push(spark);
  }
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
      new THREE.LineBasicMaterial({ color: 0xeaf1ff, transparent: true, opacity: 0.88 }),
    ),
  );
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, lite ? 12 : 20, lite ? 10 : 16),
    lite
      ? duskSheen({
          color: 0x9cc4ff,
          reflectivity: 0.56,
          transparent: true,
          opacity: 0.58,
        })
      : diamondPhysical(null, { transmission: 0.88, thickness: 0.42 }),
  );
  core.position.y = 0.5;
  core.userData.nodeId = 6;
  crystal.add(core);
  const girdle = new THREE.Mesh(
    new THREE.TorusGeometry(eqR, 0.016, 8, 8),
    lite
      ? duskSheen({
          color: 0xeaf1ff,
          reflectivity: 0.86,
        })
      : new THREE.MeshPhysicalMaterial({
          color: 0xeaf1ff,
          metalness: 0.88,
          roughness: 0.1,
          clearcoat: 1,
          envMapIntensity: 1.65,
        }),
  );
  girdle.rotation.x = Math.PI / 2;
  girdle.position.y = eqY;
  girdle.userData.nodeId = 6;
  crystal.add(girdle);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, 0.04, 8),
    lite
      ? duskSheen({ color: 0xeaf1ff, reflectivity: 0.72 })
      : new THREE.MeshPhysicalMaterial({
          color: 0xeaf1ff,
          metalness: 0.9,
          roughness: 0.12,
          clearcoat: 1,
          envMapIntensity: 1.5,
        }),
  );
  base.position.y = 0.02;
  base.userData.nodeId = 6;
  crystal.scale.setScalar(1.14);
  group.add(base);
  group.add(crystal);

  const gateLabel = labelSprite('OVERLEDGER', '#FFFFFF');
  gateLabel.position.set(0, 1.22, 0.1);
  gateLabel.scale.set(1.18, 0.2, 1);
  group.add(gateLabel);

  const rt2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.028, lite ? 8 : 16, lite ? 24 : 48),
    lite
      ? duskSheen({ color: 0x00d4aa, reflectivity: 0.55 })
      : new THREE.MeshPhysicalMaterial({
          color: 0x00a878,
          metalness: 0.35,
          roughness: 0.22,
          emissive: 0x00a878,
          emissiveIntensity: 0.55,
          clearcoat: 0.7,
        }),
  );
  rt2.rotation.x = Math.PI / 2;
  rt2.position.y = 1.52;
  rt2.userData.nodeId = 7;
  group.add(rt2);
  const rt2Disk = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, lite ? 24 : 32),
    lite
      ? duskSheen({ color: 0xeaf1ff, reflectivity: 0.42, transparent: true, opacity: 0.88 })
      : new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.08,
          transparent: true,
          opacity: 0.92,
        }),
  );
  rt2Disk.rotation.x = -Math.PI / 2;
  rt2Disk.position.y = 1.52;
  rt2Disk.userData.nodeId = 7;
  group.add(rt2Disk);
  const rt2Label = labelSprite('SIM RT2', '#EAF1FF');
  rt2Label.position.set(0, 1.52, 0.12);
  rt2Label.scale.set(0.62, 0.16, 1);
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
  const cards: THREE.Mesh[] = [];
  const cardMats: Array<THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial> = [];
  BANKS.forEach((bank, i) => {
    const tex = hardenCanvasTex(new THREE.CanvasTexture(logoCanvas(null, bank.short, bank.name, false, stills[i])));
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = lite
      ? duskSheen({ map: tex, reflectivity: 0.38 })
      : new THREE.MeshPhysicalMaterial({
          map: tex,
          roughness: 0.22,
          metalness: 0.08,
          clearcoat: 0.85,
          clearcoatRoughness: 0.18,
          transparent: true,
        });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.64, 0.04), mat);
    const [x, y, z] = bankXYZ(i, 0);
    mesh.position.set(x, y + 0.2, z);
    mesh.userData.nodeId = bank.id;
    mesh.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0xeaf1ff, transparent: true, opacity: 0.28 }),
      ),
    );
    group.add(mesh);
    cards.push(mesh);
    cardMats.push(mat);
    const paintOne = (): void => {
      const next = hardenCanvasTex(new THREE.CanvasTexture(logoCanvas(logos[i], bank.short, bank.name, false, stills[i])));
      next.colorSpace = THREE.SRGBColorSpace;
      mat.map?.dispose();
      mat.map = next;
      mat.needsUpdate = true;
    };
    logos[i].onload = paintOne;
    stills[i].onload = paintOne;
    const spoke = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(x, y + 0.02, z)]),
      new THREE.LineBasicMaterial({ color: 0x1557ff, transparent: true, opacity: 0.35 }),
    );
    group.add(spoke);
  });

  const stem = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.86, 0), new THREE.Vector3(0, 1.48, 0)]),
    new THREE.LineDashedMaterial({ color: 0x0b1f5c, dashSize: 0.06, gapSize: 0.04, transparent: true, opacity: 0.35 }),
  );
  stem.computeLineDistances();
  group.add(stem);

  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, lite ? 12 : 24, lite ? 12 : 24),
    lite
      ? duskSheen({ color: 0x00d4aa, reflectivity: 0.62 })
      : new THREE.MeshPhysicalMaterial({
          color: 0x00a878,
          emissive: 0x00a878,
          emissiveIntensity: 1.4,
          roughness: 0.18,
          metalness: 0.35,
          clearcoat: 1,
        }),
  );
  group.add(bead);
  const lockLabel = labelSprite('LOCK', '#EAF1FF');
  const releaseLabel = labelSprite('RELEASE', '#EAF1FF');
  lockLabel.scale.set(0.42, 0.11, 1);
  releaseLabel.scale.set(0.52, 0.12, 1);
  group.add(lockLabel);
  group.add(releaseLabel);
  releaseLabel.visible = false;

  const pickables: THREE.Object3D[] = [...crowns, ...pavs, ...stars, ...sparks, core, base, girdle, rt2, rt2Disk, ...cards];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const restAx = lite ? 1.24 : 1.3;
  const restAy = 0.5;
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
    const hits = raycaster.intersectObjects(pickables, false);
    const id = hits[0]?.object.userData.nodeId;
    return typeof id === 'number' ? (id as NodeId) : null;
  };

  let gateLit = false;
  const stampJewel = (on: boolean): void => {
    const photo = visionStill();
    const ttex = hardenCanvasTex(new THREE.CanvasTexture(tableCanvas(photo)));
    ttex.colorSpace = THREE.SRGBColorSpace;
    const tmat = table.material as THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial;
    tmat.map?.dispose();
    tmat.map = ttex;
    tmat.needsUpdate = true;
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
    crowns.forEach((mesh, i) => {
      const prev = mesh.material as THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial;
      mesh.material = facetMaterial(i, on && i === 0, lite, photo);
      prev.map?.dispose();
      prev.dispose();
    });
    pavs.forEach((mesh, i) => {
      const prev = mesh.material as THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial;
      mesh.material = pavMaterial(i, lite, photo);
      prev.map?.dispose();
      prev.dispose();
    });
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
        selected === 7 || hover === 7 ? 0x3cffc4 : 0x00d4aa,
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
    camera.position.setFromSphericalCoords(lite ? 4.12 : 3.95, ax, ay);
    camera.lookAt(0, lite ? 0.46 : 0.5, 0);
    BANKS.forEach((_, i) => {
      const [x, y, z] = bankXYZ(i, pulse);
      cards[i].position.set(x, y + 0.18, z);
      cards[i].lookAt(camera.position.x, y + 0.28, camera.position.z);
    });
    crystal.rotation.x = 0;
    crystal.rotation.y = reduced ? 0 : Math.sin((now - t0) / 2800) * 0.1;
    causticMat.opacity = reduced ? 0.26 : 0.2 + Math.abs(Math.sin((now - t0) / 1600)) * 0.18;
    halo.scale.setScalar(reduced ? 1 : 1 + Math.sin((now - t0) / 1900) * 0.06);
    stars.forEach((mesh, i) => {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = reduced ? 0.3 : 0.2 + Math.abs(Math.sin((now - t0) / 720 + i)) * 0.45;
    });
    sparks.forEach((mesh, i) => {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const pulse = reduced ? 0.7 : 0.32 + Math.abs(Math.sin((now - t0) / 480 + i * 0.7)) * 0.68;
      mat.opacity = pulse;
      mesh.scale.setScalar(0.65 + pulse * 0.7);
    });
    rt2.rotation.z = reduced ? 0 : now / 2400;
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
    const lockOn = local < 0.5;
    lockLabel.visible = lockOn;
    releaseLabel.visible = !lockOn;
    lockLabel.position.copy(beadPos).add(new THREE.Vector3(0, 0.12, 0));
    releaseLabel.position.copy(beadPos).add(new THREE.Vector3(0, 0.12, 0));
    gateLabel.lookAt(camera.position);
    rt2Label.lookAt(camera.position);
    lockLabel.lookAt(camera.position);
    releaseLabel.lookAt(camera.position);
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
