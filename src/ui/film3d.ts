/** Standing film gallery — five stills in a shallow arc. */

import * as THREE from 'three';
import { filmSetSlides, type FilmSlide } from './filmSets';
import { remountCanvas } from './gateway2d';
import { revealStage } from './stage';
import { probeWebGL } from './webgl';

export type Film3DHandle = {
  dispose: () => void;
};

export function mountFilm2D(canvas: HTMLCanvasElement, slides: FilmSlide[]): () => void {
  canvas.dataset.engine = 'canvas2d';
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;
  const imgs = slides.map((s) => {
    const img = new Image();
    img.src = s.src;
    return img;
  });
  const paint = (): void => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, w, h);
    const n = Math.max(1, slides.length);
    const pw = w * 0.22;
    const ph = h * 0.58;
    slides.forEach((slide, i) => {
      const t = i - (n - 1) / 2;
      const x = w / 2 + t * (pw * 0.92) - pw / 2;
      const y = h * 0.18 + Math.abs(t) * 10;
      ctx.save();
      ctx.fillStyle = '#05070c';
      ctx.fillRect(x - 5, y - 5, pw + 10, ph + 10);
      const img = imgs[i];
      if (img.complete && img.naturalWidth) ctx.drawImage(img, x, y, pw, ph);
      ctx.fillStyle = 'rgba(7, 11, 20, 0.52)';
      ctx.fillRect(x, y + ph - 40, pw, 40);
      ctx.fillStyle = '#EAF1FF';
      ctx.font = '700 14px Outfit, IBM Plex Sans, sans-serif';
      ctx.fillText(slide.title, x + 12, y + ph - 16);
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

export function upgradeFilm3D(canvas: HTMLCanvasElement): Film3DHandle | null {
  const set = canvas.dataset.filmSet ?? '';
  const slides = filmSetSlides(set);
  if (!slides.length) return null;
  const probe = probeWebGL();
  if (!probe) return null;
  const next = remountCanvas(canvas);
  next.dataset.filmSet = set;
  try {
    return mountFilm3D(next, slides, probe.lite);
  } catch {
    return null;
  }
}

function plateTexture(src: string, title: string, onReady: (tex: THREE.CanvasTexture) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 576;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, 1024, 576);
    ctx.fillStyle = '#EAF1FF';
    ctx.font = '700 34px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(title, 28, 540);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, 1024, 576);
    ctx.fillStyle = 'rgba(7, 11, 20, 0.5)';
    ctx.fillRect(0, 500, 1024, 76);
    ctx.fillStyle = '#EAF1FF';
    ctx.font = '700 34px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(title, 28, 550);
    tex.needsUpdate = true;
    onReady(tex);
  };
  img.src = src;
  return tex;
}

function mountFilm3D(canvas: HTMLCanvasElement, slides: FilmSlide[], lite: boolean): Film3DHandle {
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
  renderer.toneMappingExposure = lite ? 1.08 : 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.08, 40);
  const group = new THREE.Group();
  scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff, lite ? 1 : 0.5));
  const key = new THREE.DirectionalLight(0xfff1dc, lite ? 0.4 : 1.35);
  key.position.set(0.8, 1.6, 2.4);
  scene.add(key);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plates: THREE.Mesh[] = [];
  const mid = (slides.length - 1) / 2;

  slides.forEach((slide, i) => {
    const mat = lite
      ? new THREE.MeshBasicMaterial({ color: 0x1a2438 })
      : new THREE.MeshPhysicalMaterial({
          color: 0x1a2438,
          roughness: 0.3,
          metalness: 0.06,
          clearcoat: 0.35,
        });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.78, 0.04), mat);
    mesh.userData.slide = slide;
    group.add(mesh);
    plates.push(mesh);
    plateTexture(slide.src, slide.title, (tex) => {
      mat.map = tex;
      mat.color = new THREE.Color(0xffffff);
      mat.needsUpdate = true;
    });
    const t = i - mid;
    mesh.position.set(t * 1.56, -Math.abs(t) * 0.02, Math.abs(t) * 0.12);
    mesh.rotation.set(-0.04, -t * 0.08, 0);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let raf = 0;
  let ax = 1.12;
  let ay = 0;
  let tx = 1.12;
  let ty = 0;

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  const pick = (x: number, y: number): FilmSlide | null => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(plates, false)[0];
    return (hit?.object.userData.slide as FilmSlide | undefined) ?? null;
  };

  const tick = (now: number): void => {
    ax += (tx - ax) * 0.08;
    ay += (ty - ay) * 0.08;
    const drift = reduced ? 0 : Math.sin(now / 3800) * 0.04;
    group.rotation.y = drift;
    camera.position.setFromSphericalCoords(lite ? 5.2 : 4.75, ax, ay);
    camera.lookAt(0, 0.02, 0.08);
    renderer.render(scene, camera);
  };

  const onMove = (ev: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    ty = nx * 0.28;
    tx = 1.12 + ny * 0.14;
    canvas.style.cursor = pick(ev.clientX, ev.clientY) ? 'pointer' : 'grab';
  };

  const onClick = (ev: PointerEvent): void => {
    const slide = pick(ev.clientX, ev.clientY);
    if (slide) revealStage(slide.stageKind, slide.stageId);
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
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('click', onClick);
      renderer.dispose();
    },
  };
}
