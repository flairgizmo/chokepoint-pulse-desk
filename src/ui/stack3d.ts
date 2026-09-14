/** Exploded film stack — five stills facing the room. HTML rungs stay for the record. */

import * as THREE from 'three';
import { PLATES } from '../data/plates';
import { addCinemaSet, addUnrealLook, applyPlateMap, climbUserData, dimCinemaPlate, DUSK_STILL_FILTER, hardenCanvasTex, makeCinemaPlate, makeFloorContact, printGradeStill, stampFilmGate } from './cinemaSet';
import { remountCanvas } from './gateway2d';
import { revealStage } from './stage';
import { probeWebGL } from './webgl';

export const STACK_SLABS = [
  { id: 'apps', title: 'FLOW APPLICATIONS', src: PLATES.city.src, stage: 'quant-connect' },
  { id: 'script', title: 'PAYSCRIPT', src: PLATES.payments.src, stage: 'payscript' },
  { id: 'fusion', title: 'FUSION', src: PLATES.cityDay.src, stage: 'fusion' },
  { id: 'gate', title: 'OVERLEDGER', src: PLATES.datacenter.src, stage: 'overledger' },
  { id: 'ledgers', title: 'LEDGERS & RAILS', src: PLATES.cable.src, stage: 'connectors' },
] as const;

export type Stack3DHandle = {
  dispose: () => void;
  isolate: (id: string | null) => void;
};

export function mountStack2D(canvas: HTMLCanvasElement): () => void {
  canvas.dataset.engine = 'canvas2d';
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;
  const bed = new Image();
  bed.src = PLATES.canary.src;
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
    if (bed.complete && bed.naturalWidth) {
      ctx.filter = 'brightness(0.42) saturate(0.88)';
      ctx.drawImage(bed, 0, 0, w, h);
      ctx.filter = 'none';
    }
    imgs.forEach((img, i) => {
      const pw = w * 0.42;
      const ph = pw * (9 / 16);
      const x = w * 0.08 + i * (w * 0.1);
      const y = h * 0.14 + i * (h * 0.1);
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(pw / 2, ph + 16, pw * 0.38, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#05070c';
      ctx.fillRect(-8, -8, pw + 16, ph + 16);
      if (img.complete && img.naturalWidth) {
        ctx.filter = DUSK_STILL_FILTER;
        ctx.drawImage(img, 0, 0, pw, ph);
        ctx.filter = 'none';
        printGradeStill(ctx, pw, ph);
      }
      stampFilmGate(ctx, pw, ph, STACK_SLABS[i].title);
      ctx.restore();
    });
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.42, h * 0.12, w * 0.5, h * 0.48, Math.max(w, h) * 0.72);
    vig.addColorStop(0, 'rgba(7, 11, 20, 0)');
    vig.addColorStop(1, 'rgba(7, 11, 20, 0.42)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  };
  bed.onload = paint;
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
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    if (!ctx) return;
    const innerW = 1280;
    const innerH = 648;
    const trim = src.includes('cable.jpg') ? 0.12 : 0.03;
    const sx = img.naturalWidth * trim;
    const sy = img.naturalHeight * trim;
    const sw = img.naturalWidth * (1 - trim * 2);
    const sh = img.naturalHeight * (1 - trim * 2);
    const scale = Math.min(innerW / sw, innerH / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.filter = DUSK_STILL_FILTER;
    ctx.drawImage(img, sx, sy, sw, sh, (innerW - dw) / 2, 40 + (innerH - dh) / 2, dw, dh);
    ctx.filter = 'none';
    printGradeStill(ctx, 1280, 720);
    stampFilmGate(ctx, 1280, 720, title);
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
  renderer.toneMappingExposure = lite ? 1.22 : 1.32;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  addCinemaSet(scene, lite, PLATES.canary.src);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.08, 40);
  const group = new THREE.Group();
  scene.add(group);
  const composer = addUnrealLook(renderer, scene, camera, lite, PLATES.canary.src);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slabs: THREE.Group[] = [];
  let isolated: string | null = null;

  const puddles: THREE.Mesh[] = [];
  STACK_SLABS.forEach((layer) => {
    const plate = makeCinemaPlate(2.08, 1.16, lite, PLATES.canary.src, 0.1);
    plate.root.userData.layerId = layer.id;
    plate.root.userData.stage = layer.stage;
    plate.face.userData.layerId = layer.id;
    group.add(plate.root);
    slabs.push(plate.root);
    const puddle = makeFloorContact(2.02, 1.18);
    scene.add(puddle);
    puddles.push(puddle);
    plateTexture(layer.src, layer.title, (tex) => applyPlateMap(plate.mat, tex));
  });

  const place = (now: number): void => {
    const drift = reduced ? 0 : Math.sin(now / 4800) * 0.03;
    const mid = (slabs.length - 1) / 2;
    slabs.forEach((mesh, i) => {
      const dim = isolated != null && mesh.userData.layerId !== isolated;
      const on = isolated != null && mesh.userData.layerId === isolated;
      const t = i - mid;
      mesh.position.set(t * 0.74 + drift, 0.5 - i * 0.15 + (on ? 0.1 : 0), 0.02 + i * 0.16 + (on ? -0.3 : 0));
      mesh.rotation.set(-0.08, -0.24 - t * 0.04, 0.008);
      mesh.scale.setScalar(on ? 1.06 : dim ? 0.9 : 1);
      dimCinemaPlate(mesh, dim);
      const puddle = puddles[i];
      puddle.position.x = mesh.position.x;
      puddle.position.z = mesh.position.z + 0.04;
      puddle.scale.setScalar(dim ? 0.7 : on ? 1.08 : 1);
      (puddle.material as THREE.MeshBasicMaterial).opacity = dim ? 0.16 : on ? 0.82 : 0.58;
    });
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let raf = 0;
  let ax = 1.22;
  let ay = 0.28;
  let tx = 1.22;
  let ty = 0.28;

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer?.setSize(w, h);
  };

  const pick = (x: number, y: number): (typeof STACK_SLABS)[number] | null => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(slabs, true)[0];
    const id = hit ? climbUserData<string>(hit.object, 'layerId') : undefined;
    return STACK_SLABS.find((l) => l.id === id) ?? null;
  };

  const tick = (now: number): void => {
    ax += (tx - ax) * 0.08;
    ay += (ty - ay) * 0.08;
    place(now);
    group.rotation.y = reduced ? 0 : Math.sin(now / 5200) * 0.03;
    camera.position.setFromSphericalCoords(lite ? 4.62 : 4.48, ax, ay);
    camera.lookAt(0.06, 0.2, 0.28);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const onMove = (ev: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    ty = 0.28 + nx * 0.2;
    tx = 1.22 + ny * 0.08;
    canvas.style.cursor = pick(ev.clientX, ev.clientY) ? 'pointer' : 'grab';
  };

  const onClick = (ev: PointerEvent): void => {
    const layer = pick(ev.clientX, ev.clientY);
    if (layer) revealStage('tech', layer.stage);
  };

  resize();
  const first = performance.now();
  tick(first);
  if (lite && performance.now() - first > 8000) {
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
      composer?.dispose();
      renderer.dispose();
    },
  };
}
