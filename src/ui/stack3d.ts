/** Exploded film stack — five stills in perspective. HTML rungs stay for the record. */

import * as THREE from 'three';
import { addCinemaSet, applyPlateMap, plateMaterial } from './cinemaSet';
import { remountCanvas } from './gateway2d';
import { revealStage } from './stage';
import { probeWebGL } from './webgl';

export const STACK_SLABS = [
  { id: 'apps', title: 'FLOW APPLICATIONS', src: '/visuals/topics/fiber.jpg', stage: 'quant-connect' },
  { id: 'script', title: 'PAYSCRIPT', src: '/visuals/topics/payments.jpg', stage: 'payscript' },
  { id: 'fusion', title: 'FUSION', src: '/visuals/stories/city.jpg', stage: 'fusion' },
  { id: 'gate', title: 'OVERLEDGER', src: '/visuals/topics/datacenter.jpg', stage: 'overledger' },
  { id: 'ledgers', title: 'LEDGERS & RAILS', src: '/visuals/topics/cable.jpg', stage: 'connectors' },
] as const;

export type Stack3DHandle = {
  dispose: () => void;
  isolate: (id: string | null) => void;
};

export function mountStack2D(canvas: HTMLCanvasElement): () => void {
  canvas.dataset.engine = 'canvas2d';
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;
  const imgs = STACK_SLABS.map((l) => {
    const img = new Image();
    img.src = l.src;
    return img;
  });
  const paint = (): void => {
    const r = canvas.getBoundingClientRect();
    const dpr = 1;
    const w = Math.max(1, Math.floor(r.width * dpr));
    const h = Math.max(1, Math.floor(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, w, h);
    imgs.forEach((img, i) => {
      const pw = w * 0.58;
      const ph = h * 0.155;
      const x = w * 0.14 + i * (w * 0.045);
      const y = h * 0.05 + i * (h * 0.165);
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#05070c';
      ctx.fillRect(-6, -6, pw + 12, ph + 12);
      if (img.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, pw, ph);
      ctx.fillStyle = 'rgba(7, 11, 20, 0.55)';
      ctx.fillRect(0, ph - 28, pw, 28);
      ctx.fillStyle = '#EAF1FF';
      ctx.font = '700 13px Outfit, IBM Plex Sans, sans-serif';
      ctx.fillText(STACK_SLABS[i].title, 12, ph - 10);
      ctx.restore();
    });
  };
  imgs.forEach((img) => {
    img.onload = paint;
  });
  const onResize = (): void => paint();
  window.addEventListener('resize', onResize);
  paint();
  return () => window.removeEventListener('resize', onResize);
}

export function upgradeStack3D(canvas: HTMLCanvasElement): Stack3DHandle | null {
  const probe = probeWebGL();
  if (!probe) return null;
  const next = remountCanvas(canvas);
  try {
    return mountStack3D(next, probe.lite);
  } catch {
    return null;
  }
}

function plateTexture(src: string, title: string, onReady: (tex: THREE.CanvasTexture) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1280;
  c.height = 720;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#EAF1FF';
    ctx.font = '700 36px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(title, 36, 680);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, 1280, 720);
    ctx.fillStyle = 'rgba(7, 11, 20, 0.48)';
    ctx.fillRect(0, 638, 1280, 82);
    ctx.fillStyle = '#EAF1FF';
    ctx.font = '700 36px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(title, 36, 690);
    tex.needsUpdate = true;
    onReady(tex);
  };
  img.src = src;
  return tex;
}

function mountStack3D(canvas: HTMLCanvasElement, lite: boolean): Stack3DHandle {
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
  renderer.setPixelRatio(lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x070b14, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = lite ? 1.08 : 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  addCinemaSet(scene, lite, '/visuals/topics/datacenter.jpg');
  const camera = new THREE.PerspectiveCamera(30, 1, 0.08, 40);
  const group = new THREE.Group();
  scene.add(group);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slabs: THREE.Mesh[] = [];
  let isolated: string | null = null;

  STACK_SLABS.forEach((layer) => {
    const mat = plateMaterial(lite);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.03, 0.96), mat);
    mesh.userData.layerId = layer.id;
    mesh.userData.stage = layer.stage;
    group.add(mesh);
    slabs.push(mesh);
    plateTexture(layer.src, layer.title, (tex) => applyPlateMap(mat, tex));
  });

  const place = (now: number): void => {
    const drift = reduced ? 0 : Math.sin(now / 4200) * 0.04;
    const mid = (slabs.length - 1) / 2;
    slabs.forEach((mesh, i) => {
      const dim = isolated != null && mesh.userData.layerId !== isolated;
      const t = i - mid;
      mesh.position.set(t * 0.46 + drift, 2.1 - i * 0.74, i * 0.12);
      mesh.rotation.set(0.24, -0.3, 0);
      mesh.scale.setScalar(dim ? 0.92 : 1);
      const mat = mesh.material as THREE.MeshBasicMaterial | THREE.MeshPhysicalMaterial;
      mat.opacity = dim ? 0.28 : 1;
      mat.transparent = dim;
    });
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let raf = 0;
  let ax = 0.56;
  let ay = 0.4;
  let tx = 0.56;
  let ty = 0.4;

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const pick = (x: number, y: number): (typeof STACK_SLABS)[number] | null => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(slabs, false)[0];
    const id = hit?.object.userData.layerId as string | undefined;
    return STACK_SLABS.find((l) => l.id === id) ?? null;
  };

  const tick = (now: number): void => {
    ax += (tx - ax) * 0.08;
    ay += (ty - ay) * 0.08;
    place(now);
    camera.position.setFromSphericalCoords(lite ? 7.15 : 6.45, ax, ay);
    camera.lookAt(0.02, 0.9, 0.2);
    renderer.render(scene, camera);
  };

  const onMove = (ev: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    ty = 0.4 + nx * 0.22;
    tx = 0.56 + ny * 0.1;
    canvas.style.cursor = pick(ev.clientX, ev.clientY) ? 'pointer' : 'grab';
  };

  const onClick = (ev: PointerEvent): void => {
    const layer = pick(ev.clientX, ev.clientY);
    if (layer) revealStage('tech', layer.stage);
  };

  resize();
  const first = performance.now();
  tick(first);
  if (lite && performance.now() - first > 2500) {
    renderer.dispose();
    throw new Error('software-gl-slow');
  }

  const loop = (): void => {
    tick(performance.now());
    raf = requestAnimationFrame(loop);
  };
  if (!reduced) raf = requestAnimationFrame(loop);
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('click', onClick);

  return {
    isolate: (id) => {
      isolated = id;
      if (reduced) tick(performance.now());
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('click', onClick);
      renderer.dispose();
    },
  };
}
