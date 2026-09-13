/** Exploded film stack — five stills in perspective. HTML rungs stay for the record. */

import * as THREE from 'three';
import { addCinemaSet, addUnrealLook, applyPlateMap, climbUserData, dimCinemaPlate, hardenCanvasTex, makeCinemaPlate, makeFloorContact } from './cinemaSet';
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
  const bed = new Image();
  bed.src = '/visuals/topics/canary.jpg';
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
      ctx.filter = 'brightness(0.55) saturate(0.92)';
      ctx.drawImage(bed, 0, 0, w, h);
      ctx.filter = 'none';
    }
    imgs.forEach((img, i) => {
      const pw = w * 0.58;
      const ph = h * 0.155;
      const x = w * 0.14 + i * (w * 0.045);
      const y = h * 0.05 + i * (h * 0.165);
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.46)';
      ctx.beginPath();
      ctx.ellipse(pw / 2, ph + 12, pw * 0.42, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#05070c';
      ctx.fillRect(-6, -6, pw + 12, ph + 12);
      if (img.complete && img.naturalWidth) {
        ctx.filter = 'saturate(0.88) contrast(1.06) brightness(0.72)';
        ctx.drawImage(img, 0, 0, pw, ph);
        ctx.filter = 'none';
      }
      ctx.fillStyle = 'rgba(7, 11, 20, 0.58)';
      ctx.fillRect(0, ph - 22, pw, 22);
      ctx.fillStyle = 'rgba(234, 241, 255, 0.82)';
      ctx.font = '700 12px Outfit, IBM Plex Sans, sans-serif';
      ctx.fillText(STACK_SLABS[i].title, 10, ph - 8);
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
    const scale = Math.max(1280 / img.naturalWidth, 720 / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.filter = 'saturate(0.88) contrast(1.06) brightness(0.72)';
    ctx.drawImage(img, (1280 - dw) / 2, (720 - dh) / 2, dw, dh);
    ctx.filter = 'none';
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, 1280, 28);
    ctx.fillRect(0, 692, 1280, 28);
    ctx.fillStyle = 'rgba(7, 11, 20, 0.58)';
    ctx.fillRect(0, 662, 1280, 30);
    ctx.fillStyle = 'rgba(234, 241, 255, 0.82)';
    ctx.font = '700 18px Outfit, IBM Plex Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 22, 678);
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
  renderer.toneMappingExposure = lite ? 1.28 : 1.38;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  addCinemaSet(scene, lite, '/visuals/topics/canary.jpg');
  const camera = new THREE.PerspectiveCamera(28, 1, 0.08, 40);
  const group = new THREE.Group();
  scene.add(group);
  const composer = addUnrealLook(renderer, scene, camera, lite, '/visuals/topics/canary.jpg');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slabs: THREE.Group[] = [];
  let isolated: string | null = null;

  const puddles: THREE.Mesh[] = [];
  STACK_SLABS.forEach((layer) => {
    const plate = makeCinemaPlate(2.36, 1.12, lite, '/visuals/topics/canary.jpg');
    plate.root.userData.layerId = layer.id;
    plate.root.userData.stage = layer.stage;
    plate.face.userData.layerId = layer.id;
    group.add(plate.root);
    slabs.push(plate.root);
    const puddle = makeFloorContact(2.55, 1.42);
    scene.add(puddle);
    puddles.push(puddle);
    plateTexture(layer.src, layer.title, (tex) => applyPlateMap(plate.mat, tex));
  });

  const place = (now: number): void => {
    const drift = reduced ? 0 : Math.sin(now / 4200) * 0.04;
    const mid = (slabs.length - 1) / 2;
    slabs.forEach((mesh, i) => {
      const dim = isolated != null && mesh.userData.layerId !== isolated;
      const t = i - mid;
      mesh.position.set(t * 0.28 + 0.06 + drift, 1.55 - i * 0.48, -0.12 + i * 0.05);
      mesh.rotation.set(-Math.PI / 2 + 0.22, -0.1, 0);
      mesh.scale.setScalar(dim ? 0.92 : 1);
      dimCinemaPlate(mesh, dim);
      const puddle = puddles[i];
      puddle.position.x = mesh.position.x;
      puddle.position.z = mesh.position.z;
      puddle.scale.setScalar(dim ? 0.72 : 1);
      (puddle.material as THREE.MeshBasicMaterial).opacity = dim ? 0.16 : 0.7;
    });
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let raf = 0;
  let ax = 0.68;
  let ay = 0.36;
  let tx = 0.68;
  let ty = 0.36;

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
    camera.position.setFromSphericalCoords(lite ? 4.88 : 4.72, ax, ay);
    camera.lookAt(0.04, 0.58, 0.04);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const onMove = (ev: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    ty = 0.36 + nx * 0.2;
    tx = 0.68 + ny * 0.1;
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
