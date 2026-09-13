/** Cinema gallery — featured still on a dusk set, neighbours in cover-flow. */

import * as THREE from 'three';
import { addCinemaSet, applyPlateMap, plateMaterial } from './cinemaSet';
import { filmBackdrop, filmSetSlides, type FilmSlide } from './filmSets';
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
  const bed = new Image();
  bed.src = filmBackdrop(canvas.dataset.filmSet ?? '');
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
    if (bed.complete && bed.naturalWidth) {
      ctx.filter = 'brightness(0.38) saturate(0.85)';
      ctx.drawImage(bed, 0, 0, w, h);
      ctx.filter = 'none';
    }
    const n = Math.max(1, slides.length);
    const mid = (n - 1) / 2;
    slides.forEach((slide, i) => {
      const d = i - mid;
      const mag = Math.abs(d);
      const scale = mag === 0 ? 1 : mag === 1 ? 0.62 : 0.42;
      const pw = w * 0.42 * scale;
      const ph = h * 0.72 * scale;
      const x = w / 2 + d * (w * 0.22) - pw / 2;
      const y = h * 0.14 + mag * 18;
      ctx.save();
      ctx.fillStyle = '#05070c';
      ctx.fillRect(x - 6, y - 6, pw + 12, ph + 12);
      const img = imgs[i];
      if (img.complete && img.naturalWidth) ctx.drawImage(img, x, y, pw, ph);
      ctx.fillStyle = 'rgba(7, 11, 20, 0.55)';
      ctx.fillRect(x, y + ph - 38, pw, 38);
      ctx.fillStyle = '#EAF1FF';
      ctx.font = '700 15px Outfit, IBM Plex Sans, sans-serif';
      ctx.fillText(slide.title, x + 14, y + ph - 14);
      ctx.restore();
    });
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

export function upgradeFilm3D(canvas: HTMLCanvasElement): Film3DHandle | null {
  const set = canvas.dataset.filmSet ?? '';
  const slides = filmSetSlides(set);
  if (!slides.length) return null;
  const probe = probeWebGL();
  if (!probe) return null;
  const next = remountCanvas(canvas);
  next.dataset.filmSet = set;
  try {
    return mountFilm3D(next, slides, filmBackdrop(set), probe.lite);
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
    ctx.font = '700 40px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(title, 36, 680);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    if (!ctx) return;
    if (img.naturalWidth && img.naturalHeight) {
      const scale = Math.max(1280 / img.naturalWidth, 720 / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const faceBias = img.naturalHeight > img.naturalWidth ? 0.18 : 0.5;
      ctx.drawImage(img, (1280 - dw) / 2, (720 - dh) * faceBias, dw, dh);
    }
    ctx.fillStyle = 'rgba(7, 11, 20, 0.52)';
    ctx.fillRect(0, 632, 1280, 88);
    ctx.fillStyle = '#EAF1FF';
    ctx.font = '700 40px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillText(title, 36, 690);
    tex.needsUpdate = true;
    onReady(tex);
  };
  img.src = src;
  return tex;
}

function mountFilm3D(
  canvas: HTMLCanvasElement,
  slides: FilmSlide[],
  backdrop: string,
  lite: boolean,
): Film3DHandle {
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
  renderer.toneMappingExposure = lite ? 1.1 : 1.22;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  addCinemaSet(scene, lite, backdrop);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.08, 40);
  const group = new THREE.Group();
  scene.add(group);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plates: THREE.Mesh[] = [];
  const mid = (slides.length - 1) / 2;
  let featured = mid;

  slides.forEach((slide) => {
    const mat = plateMaterial(lite);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.92, 1.08, 0.045), mat);
    mesh.userData.slide = slide;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.16, 0.03),
      new THREE.MeshBasicMaterial({ color: 0x05070c }),
    );
    frame.position.z = -0.03;
    mesh.add(frame);
    group.add(mesh);
    plates.push(mesh);
    plateTexture(slide.src, slide.title, (tex) => applyPlateMap(mat, tex));
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let raf = 0;
  let ax = 1.18;
  let ay = 0;
  let tx = 1.18;
  let ty = 0;

  const layout = (): void => {
    plates.forEach((mesh, i) => {
      const d = i - featured;
      const mag = Math.abs(d);
      const scale = mag === 0 ? 1 : mag === 1 ? 0.7 : 0.46;
      mesh.position.set(d * 1.58, -0.1 - mag * 0.03, mag * 0.5);
      mesh.rotation.set(-0.08, -d * 0.2, 0);
      mesh.scale.setScalar(scale);
    });
  };

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
    layout();
    group.rotation.y = reduced ? 0 : Math.sin(now / 4200) * 0.035;
    camera.position.setFromSphericalCoords(lite ? 4.15 : 3.75, ax, ay);
    camera.lookAt(0, -0.04, 0.1);
    renderer.render(scene, camera);
  };

  const onMove = (ev: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    ty = nx * 0.22;
    tx = 1.18 + ny * 0.1;
    featured = Math.max(0, Math.min(slides.length - 1, mid + nx * 2.2));
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
