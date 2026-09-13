/** Cinema gallery — featured still on a dusk set, neighbours in cover-flow. */

import * as THREE from 'three';
import { addCinemaSet, addUnrealLook, applyPlateMap, plateMaterial } from './cinemaSet';
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
        ctx.drawImage(img, x + (pw - dw) / 2, y + (ph - dh) * (portrait ? 0.22 : 0.18), dw, dh);
        ctx.restore();
      }
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
    return mountFilm3D(next, slides, filmBackdrop(set), probe.lite, set);
  } catch {
    return null;
  }
}

function looksCutout(img: HTMLImageElement): boolean {
  const s = document.createElement('canvas');
  s.width = 8;
  s.height = 8;
  const probe = s.getContext('2d', { willReadFrequently: true });
  if (!probe || !img.naturalWidth) return false;
  probe.drawImage(img, 0, 0, 8, 8);
  const d = probe.getImageData(0, 0, 8, 8).data;
  let bright = 0;
  for (const i of [0, 7, 56, 63]) {
    const o = i * 4;
    if (d[o] > 200 && d[o + 1] > 200 && d[o + 2] > 200) bright += 1;
  }
  return bright >= 3;
}

function punchStudioWhite(img: HTMLImageElement, dw: number, dh: number): HTMLCanvasElement {
  const tmp = document.createElement('canvas');
  tmp.width = Math.max(1, Math.round(dw));
  tmp.height = Math.max(1, Math.round(dh));
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!tctx) return tmp;
  tctx.drawImage(img, 0, 0, tmp.width, tmp.height);
  const data = tctx.getImageData(0, 0, tmp.width, tmp.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    if (r > 228 && g > 228 && b > 228) {
      px[i + 3] = 0;
    } else if (r > 200 && g > 200 && b > 200) {
      const t = (Math.min(r, g, b) - 200) / 28;
      px[i + 3] = Math.round(px[i + 3] * (1 - t));
    }
  }
  tctx.putImageData(data, 0, 0);
  return tmp;
}

function drawPortrait(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
  ctx.fillStyle = '#101828';
  ctx.fillRect(0, 0, w, h);
  const scale = Math.min((w * 0.88) / img.naturalWidth, (h * 0.8) / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const cut = punchStudioWhite(img, dw, dh);
  ctx.drawImage(cut, (w - dw) / 2, (h - dh) * 0.2);
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
  const tex = new THREE.CanvasTexture(c);
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
        ctx.drawImage(img, (w - dw) / 2, (h - dh) * faceBias, dw, dh);
      }
    }
    ctx.fillStyle = 'rgba(7, 11, 20, 0.55)';
    ctx.fillRect(0, h - 92, w, 92);
    ctx.fillStyle = '#EAF1FF';
    ctx.font = `700 ${portrait ? 34 : 40}px Outfit, IBM Plex Sans, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(title, 28, h - 34);
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
  renderer.toneMappingExposure = lite ? 1.1 : 1.22;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  addCinemaSet(scene, lite, backdrop);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.08, 40);
  const group = new THREE.Group();
  scene.add(group);
  const composer = addUnrealLook(renderer, scene, camera, lite);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plates: THREE.Mesh[] = [];
  const mid = (slides.length - 1) / 2;
  const featuredBase = set.startsWith('city:') ? 0 : mid;
  let featured = featuredBase;

  slides.forEach((slide) => {
    const mat = plateMaterial(lite);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(portrait ? 1.02 : 2.12, portrait ? 1.36 : 1.18, 0.05),
      mat,
    );
    mesh.userData.slide = slide;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(portrait ? 1.0 : 2.0, portrait ? 1.3 : 1.16, 0.03),
      new THREE.MeshBasicMaterial({ color: 0x05070c }),
    );
    frame.position.z = -0.03;
    mesh.add(frame);
    group.add(mesh);
    plates.push(mesh);
    plateTexture(slide.src, slide.title, portrait, (tex) => applyPlateMap(mat, tex));
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
      mesh.position.set(d * (portrait ? 1.18 : 1.68), -0.08 - mag * 0.02, mag * 0.42);
      mesh.rotation.set(-0.06, -d * 0.18, 0);
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
    composer?.setSize(w, h);
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
    camera.position.setFromSphericalCoords(lite ? 3.85 : 3.45, ax, ay);
    camera.lookAt(0, -0.02, 0.12);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  const onMove = (ev: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    ty = nx * 0.22;
    tx = 1.18 + ny * 0.1;
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
