/** Cinema gallery — featured still on a dusk set, neighbours in cover-flow. */

import * as THREE from 'three';
import { addCinemaSet, addUnrealLook, applyPlateMap, climbUserData, DUSK_STILL_FILTER, hardenCanvasTex, makeCinemaPlate, makeFloorContact, printGradeStill, stampFilmGate } from './cinemaSet';
import { filmBackdrop, filmSetSlides, type FilmSlide } from './filmSets';
import { looksCutout, punchStudioWhite } from './faces';
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
      ctx.filter = 'brightness(0.58) saturate(0.95)';
      ctx.drawImage(bed, 0, 0, w, h);
      ctx.filter = 'none';
    }
    const n = Math.max(1, slides.length);
    const mid = (canvas.dataset.filmSet ?? '').startsWith('city:') ? 0 : (n - 1) / 2;
    slides.forEach((slide, i) => {
      const d = i - mid;
      const mag = Math.abs(d);
      const scale = mag === 0 ? 1 : mag === 1 ? 0.62 : 0.42;
      const portrait = (canvas.dataset.filmSet ?? '') === 'people';
      const pw = w * (portrait ? 0.22 : 0.42) * scale;
      const ph = h * (portrait ? 0.78 : 0.72) * scale;
      const x = w / 2 + d * (w * (portrait ? 0.16 : 0.22)) - pw / 2;
      const y = h * 0.12 + mag * 18;
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(x + pw / 2, y + ph + 14, pw * 0.44, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#05070c';
      ctx.fillRect(x - 6, y - 6, pw + 12, ph + 12);
      const img = imgs[i];
      if (img.complete && img.naturalWidth) {
        const scaleImg = portrait
          ? Math.min(pw / img.naturalWidth, ph / img.naturalHeight)
          : Math.max(pw / img.naturalWidth, ph / img.naturalHeight);
        const dw = img.naturalWidth * scaleImg;
        const dh = img.naturalHeight * scaleImg;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, pw, ph);
        ctx.clip();
        if (!portrait) ctx.filter = DUSK_STILL_FILTER;
        ctx.drawImage(img, x + (pw - dw) / 2, y + (ph - dh) * (portrait ? 0.22 : 0.18), dw, dh);
        ctx.filter = 'none';
        if (!portrait) printGradeStill(ctx, pw, ph, x, y);
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(7, 11, 20, 0.55)';
      ctx.fillRect(x, y + ph - 28, pw, 28);
      ctx.fillStyle = 'rgba(234, 241, 255, 0.82)';
      ctx.font = '600 12px Outfit, IBM Plex Sans, sans-serif';
      ctx.fillText(slide.title, x + 12, y + ph - 10);
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

export function upgradeFilm3D(canvas: HTMLCanvasElement): Film3DHandle | null {
  const set = canvas.dataset.filmSet ?? '';
  const slides = filmSetSlides(set);
  if (!slides.length) return null;
  const probe = probeWebGL();
  if (!probe) return null;
  const next = remountCanvas(canvas);
  next.dataset.filmSet = set;
  try {
    return mountFilm3D(next, slides, filmBackdrop(set), probe.lite, set);
  } catch {
    return null;
  }
}

function drawPortrait(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
  ctx.fillStyle = '#101828';
  ctx.fillRect(0, 0, w, h);
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.18;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const cut = punchStudioWhite(img, dw, dh);
  ctx.drawImage(cut, (w - dw) / 2, (h - dh) * 0.22);
}

function plateTexture(
  src: string,
  title: string,
  portrait: boolean,
  onReady: (tex: THREE.CanvasTexture) => void,
): THREE.CanvasTexture {
  const w = portrait ? 720 : 1280;
  const h = portrait ? 960 : 720;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);
  }
  const tex = hardenCanvasTex(new THREE.CanvasTexture(c));
  tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    if (!ctx) return;
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);
    if (img.naturalWidth && img.naturalHeight) {
      if (portrait || looksCutout(img)) {
        drawPortrait(ctx, img, w, h);
      } else {
        const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        const faceBias = img.naturalHeight >= img.naturalWidth ? 0.16 : 0.42;
        ctx.filter = DUSK_STILL_FILTER;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) * faceBias, dw, dh);
        ctx.filter = 'none';
        printGradeStill(ctx, w, h);
      }
    }
    stampFilmGate(ctx, w, h, title, portrait);
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
  set = '',
): Film3DHandle {
  const portrait = set === 'people';
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
  renderer.toneMappingExposure = lite ? 1.22 : 1.3;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  addCinemaSet(scene, lite, backdrop);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.08, 40);
  const group = new THREE.Group();
  scene.add(group);
  const composer = addUnrealLook(renderer, scene, camera, lite, backdrop);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plates: THREE.Group[] = [];
  const mid = (slides.length - 1) / 2;
  const featuredBase = set.startsWith('city:') ? 0 : mid;
  let featured = featuredBase;

  const puddles: THREE.Mesh[] = [];
  slides.forEach((slide) => {
    const plate = makeCinemaPlate(portrait ? 1.02 : 2.12, portrait ? 1.36 : 1.18, lite, backdrop, 0.1);
    plate.root.userData.slide = slide;
    plate.face.userData.slide = slide;
    group.add(plate.root);
    plates.push(plate.root);
    const puddle = makeFloorContact(portrait ? 1.18 : 2.42, portrait ? 1.42 : 1.36);
    scene.add(puddle);
    puddles.push(puddle);
    plateTexture(slide.src, slide.title, portrait, (tex) => applyPlateMap(plate.mat, tex));
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let raf = 0;
  let ax = 1.24;
  let ay = 0;
  let tx = 1.24;
  let ty = 0;

  const layout = (): void => {
    plates.forEach((mesh, i) => {
      const d = i - featured;
      const mag = Math.abs(d);
      const scale = mag === 0 ? 1 : mag === 1 ? 0.7 : 0.46;
      mesh.position.set(d * (portrait ? 1.18 : 1.68), 0.16 - mag * 0.02, mag * 0.42);
      mesh.rotation.set(-0.08, -0.28 - d * 0.12, 0.01);
      mesh.scale.setScalar(scale);
      const puddle = puddles[i];
      puddle.position.x = mesh.position.x;
      puddle.position.y = mesh.position.y - (portrait ? 0.72 : 0.64) * scale;
      puddle.position.z = mesh.position.z + 0.04;
      puddle.scale.setScalar(scale);
      (puddle.material as THREE.MeshBasicMaterial).opacity = mag === 0 ? 0.88 : 0.4;
    });
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

  const pick = (x: number, y: number): FilmSlide | null => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(plates, true)[0];
    return hit ? climbUserData<FilmSlide>(hit.object, 'slide') ?? null : null;
  };

  const tick = (now: number): void => {
    ax += (tx - ax) * 0.08;
    ay += (ty - ay) * 0.08;
    layout();
    group.rotation.y = reduced ? 0 : Math.sin(now / 4200) * 0.035;
    camera.position.setFromSphericalCoords(lite ? 3.52 : 3.32, ax, ay);
    camera.lookAt(0.04, 0.08, 0.12);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const onMove = (ev: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    ty = nx * 0.22;
    tx = 1.24 + ny * 0.1;
    featured = Math.max(0, Math.min(slides.length - 1, featuredBase + nx * 2.2));
    canvas.style.cursor = pick(ev.clientX, ev.clientY) ? 'pointer' : 'grab';
  };

  const onClick = (ev: PointerEvent): void => {
    const slide = pick(ev.clientX, ev.clientY);
    if (slide) revealStage(slide.stageKind, slide.stageId);
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
