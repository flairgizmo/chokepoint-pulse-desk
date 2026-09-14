/** Perspective film plate for page heroes. The JPEG still paints first. */

import * as THREE from 'three';
import { addCinemaFloor, addCinemaHaze, addPracticals, addUnrealLook, applyPlateMap, duskWall, makeCinemaPlate, makeFloorContact, makeFloorPool, printGradeImage } from './cinemaSet';
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
  renderer.toneMappingExposure = 1.22;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b14);
  scene.fog = probe.lite ? new THREE.Fog(0x070b14, 14, 32) : new THREE.Fog(0x0a1220, 8.5, 18);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.08, 20);
  camera.position.set(0.62, 0.28, 2.42);

  const tex = new THREE.TextureLoader().load(src, (next) => {
    next.colorSpace = THREE.SRGBColorSpace;
    next.needsUpdate = true;
  });
  tex.colorSpace = THREE.SRGBColorSpace;

  const cyc = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 3.4), duskWall(tex, 0x243044));
  cyc.position.set(0, 0.2, -1.45);
  scene.add(cyc);
  addCinemaHaze(scene);
  addPracticals(scene);
  addCinemaFloor(scene, probe.lite, src, 2.9, -0.57);
  scene.add(makeFloorContact(2.9, 1.55, -0.56));
  const pool = makeFloorPool(-0.555, 2.8);
  (pool.material as THREE.MeshBasicMaterial).opacity = 0.28;
  scene.add(pool);

  const plate = makeCinemaPlate(2.28, 1.18, probe.lite, src, 0.1, false, true);
  plate.root.position.set(0.04, 0.16, 0);
  plate.root.rotation.set(-0.08, -0.3, 0.012);
  scene.add(plate.root);
  const still = new Image();
  still.onload = () => applyPlateMap(plate.mat, printGradeImage(still));
  still.src = src;

  scene.add(new THREE.AmbientLight(0x9aacc8, probe.lite ? 0.22 : 0.55));
  if (probe.lite) scene.add(new THREE.HemisphereLight(0xe4edff, 0x0a1220, 0.18));
  const key = new THREE.DirectionalLight(0xfff1dc, probe.lite ? 1.38 : 1.35);
  key.position.set(0.55, 0.7, 1.8);
  scene.add(key);
  if (probe.lite) {
    const rim = new THREE.DirectionalLight(0x3b7bff, 0.64);
    rim.position.set(-1.6, 0.45, -0.9);
    scene.add(rim);
    const bounce = new THREE.DirectionalLight(0xffc56a, 0.28);
    bounce.position.set(0.12, -1.45, 0.95);
    scene.add(bounce);
  }
  const composer = addUnrealLook(renderer, scene, camera, probe.lite, src);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let disposed = false;
  let parx = 0;
  let pary = 0;
  let tx = 0;
  let ty = 0;

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
    parx += (tx - parx) * 0.08;
    pary += (ty - pary) * 0.08;
    const idle = reduced ? 0 : Math.sin(now / 3800) * 0.025;
    plate.root.rotation.y = -0.3 + parx * 0.14 + idle;
    plate.root.rotation.x = -0.08 - pary * 0.07;
    if (!reduced) plate.root.position.z = Math.sin(now / 4200) * 0.02;
    camera.position.x = 0.62 + parx * 0.08;
    camera.position.y = 0.28 - pary * 0.06;
    camera.lookAt(0.04, 0.08, 0);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  figure.addEventListener('pointermove', onMove);
  window.addEventListener('resize', resize);
  resize();
  const first = performance.now();
  tick(first);
  if (probe.lite && performance.now() - first > 8000) {
    dispose();
    return null;
  }
  if (!reduced) raf = requestAnimationFrame(function loop(now: number) {
    tick(now);
    if (!disposed) raf = requestAnimationFrame(loop);
  });
  return dispose;
}
