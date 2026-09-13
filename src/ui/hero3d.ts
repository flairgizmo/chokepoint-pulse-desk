/** Perspective film plate for page heroes. The JPEG still paints first. */

import * as THREE from 'three';
import { addUnrealLook, duskSheen } from './cinemaSet';
import { probeWebGL } from './webgl';

export function upgradeHero3D(figure: HTMLElement): (() => void) | null {
  const img = figure.querySelector<HTMLImageElement>('.hero-still');
  if (!img) return null;
  const probe = probeWebGL();
  if (!probe) return null;
  const src = img.currentSrc || img.src;
  if (!src) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-gl';
  canvas.setAttribute('aria-hidden', 'true');
  img.insertAdjacentElement('afterend', canvas);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !probe.lite,
      alpha: true,
      powerPreference: probe.lite ? 'low-power' : 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    canvas.remove();
    return null;
  }

  canvas.dataset.engine = 'webgl';
  canvas.dataset.profile = probe.lite ? 'lite' : 'unreal';
  renderer.setPixelRatio(probe.lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x070b14, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = probe.lite ? 1.05 : 1.16;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.08, 20);
  camera.position.set(0, 0, 2.05);

  const tex = new THREE.TextureLoader().load(src, (next) => {
    next.colorSpace = THREE.SRGBColorSpace;
    next.needsUpdate = true;
  });
  tex.colorSpace = THREE.SRGBColorSpace;

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(2.42, 1.04, 0.045),
    probe.lite
      ? duskSheen({ map: tex, reflectivity: 0.22 })
      : new THREE.MeshPhysicalMaterial({
          map: tex,
          roughness: 0.3,
          metalness: 0.06,
          clearcoat: 0.35,
          clearcoatRoughness: 0.4,
        }),
  );
  scene.add(plate);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.52, 1.14, 0.03),
    new THREE.MeshBasicMaterial({ color: 0x05070c }),
  );
  frame.position.z = -0.028;
  scene.add(frame);

  scene.add(new THREE.AmbientLight(0xffffff, probe.lite ? 1 : 0.55));
  const key = new THREE.DirectionalLight(0xfff1dc, probe.lite ? 0.35 : 1.35);
  key.position.set(0.55, 0.7, 1.8);
  scene.add(key);
  const composer = addUnrealLook(renderer, scene, camera, probe.lite);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let disposed = false;
  let parx = 0;
  let pary = 0;
  let tx = 0;
  let ty = 0;
  let frames = 0;

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer?.setSize(w, h);
  };

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    figure.removeEventListener('pointermove', onMove);
    window.removeEventListener('resize', resize);
    composer?.dispose();
    renderer.dispose();
    canvas.remove();
  };

  const onMove = (ev: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    tx = (ev.clientX - r.left) / Math.max(1, r.width) - 0.5;
    ty = (ev.clientY - r.top) / Math.max(1, r.height) - 0.5;
  };

  const tick = (now: number): void => {
    if (disposed) return;
    const t0 = performance.now();
    parx += (tx - parx) * 0.08;
    pary += (ty - pary) * 0.08;
    const idle = reduced ? 0 : Math.sin(now / 3800) * 0.03;
    plate.rotation.y = 0.1 + parx * 0.16 + idle;
    plate.rotation.x = -0.05 - pary * 0.09;
    frame.rotation.copy(plate.rotation);
    if (!reduced) plate.position.z = Math.sin(now / 4200) * 0.025;
    camera.position.x = parx * 0.1;
    camera.position.y = -pary * 0.07;
    camera.lookAt(0, 0, 0);
    if (composer) composer.render();
    else renderer.render(scene, camera);
    frames += 1;
    if (frames < 8 && performance.now() - t0 > 2500) {
      dispose();
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  figure.addEventListener('pointermove', onMove);
  window.addEventListener('resize', resize);
  resize();
  raf = requestAnimationFrame(tick);
  return dispose;
}
