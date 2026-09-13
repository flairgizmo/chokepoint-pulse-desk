/** Filmic WebGL upgrade for the sterling corridor. 2D paints first from gateway2d. */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { canUseBloom, probeWebGL } from './webgl';
import {
  BANKS,
  MARK,
  type NodeId,
  bankXYZ,
  mountGateway2D,
  paintHint,
  remountCanvas,
} from './gateway2d';

function logoCanvas(img: HTMLImageElement | null, short: string, on = false): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 768;
  c.height = 220;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.clearRect(0, 0, 768, 220);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(10, 10, 748, 200, 28);
  else ctx.rect(10, 10, 748, 200);
  ctx.fill();
  ctx.strokeStyle = on ? '#1557FF' : 'rgba(11, 31, 92, 0.16)';
  ctx.lineWidth = on ? 8 : 3;
  ctx.stroke();
  if (img?.complete && img.naturalWidth) {
    const maxW = 700;
    const maxH = 96;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (768 - dw) / 2, (220 - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = '#0B1F5C';
    ctx.font = '700 56px Outfit, IBM Plex Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(short, 384, 110);
  }
  return c;
}

function labelSprite(text: string, color = '#EAF1FF'): THREE.Sprite {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = '700 42px Outfit, IBM Plex Sans, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(0.92, 0.23, 1);
  return sprite;
}

function hexShape(r: number): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
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
  renderer.toneMappingExposure = lite ? 1.18 : 1.28;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  if (!lite) {
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Lights-only path if RoomEnvironment stalls.
    }
  }
  if (!lite) scene.fog = new THREE.Fog(0x0a1220, 7.4, 14);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 40);
  const group = new THREE.Group();
  scene.add(group);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.4, lite ? 48 : 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x1b2a44,
      roughness: 0.05,
      metalness: 0.58,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      transparent: true,
      opacity: lite ? 0.22 : 0.52,
      envMapIntensity: lite ? 0.85 : 1.45,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.3;
  scene.add(floor);

  const backdropTex = new THREE.TextureLoader().load('/visuals/topics/canary.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
  });
  backdropTex.colorSpace = THREE.SRGBColorSpace;
  scene.background = backdropTex;
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 14.2),
    new THREE.MeshBasicMaterial({ map: backdropTex, color: 0xffffff, depthWrite: false }),
  );
  backdrop.position.set(0, 1.35, -5.4);
  scene.add(backdrop);

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

  const hex = new THREE.Mesh(
    new THREE.ExtrudeGeometry(hexShape(0.44), {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.012,
      bevelSegments: lite ? 1 : 2,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x3b7bff,
      metalness: 0.72,
      roughness: 0.1,
      iridescence: 1,
      iridescenceIOR: 1.34,
      clearcoat: 1,
      clearcoatRoughness: 0.045,
      emissive: 0x1557ff,
      emissiveIntensity: 0.48,
      envMapIntensity: 1.55,
    }),
  );
  hex.rotation.x = -Math.PI / 2;
  hex.position.y = -0.03;
  hex.userData.nodeId = 6;
  group.add(hex);

  const gateLabel = labelSprite('OVERLEDGER', '#FFFFFF');
  gateLabel.position.set(0, 0.16, 0);
  group.add(gateLabel);

  const rt2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.028, lite ? 8 : 16, lite ? 24 : 48),
    new THREE.MeshPhysicalMaterial({
      color: 0x00a878,
      metalness: 0.35,
      roughness: 0.22,
      emissive: 0x00a878,
      emissiveIntensity: 0.55,
      clearcoat: 0.7,
    }),
  );
  rt2.rotation.x = Math.PI / 2;
  rt2.position.y = 0.86;
  rt2.userData.nodeId = 7;
  group.add(rt2);
  const rt2Disk = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, lite ? 24 : 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.08,
      transparent: true,
      opacity: 0.92,
    }),
  );
  rt2Disk.rotation.x = -Math.PI / 2;
  rt2Disk.position.y = 0.86;
  rt2Disk.userData.nodeId = 7;
  group.add(rt2Disk);
  const rt2Label = labelSprite('SIM RT2', '#EAF1FF');
  rt2Label.position.set(0, 0.86, 0);
  rt2Label.scale.set(0.62, 0.16, 1);
  group.add(rt2Label);

  const logos = BANKS.map((b) => {
    const img = new Image();
    img.src = MARK[b.name];
    return img;
  });
  const cards: THREE.Mesh[] = [];
  const cardMats: THREE.MeshPhysicalMaterial[] = [];
  BANKS.forEach((bank, i) => {
    const tex = new THREE.CanvasTexture(logoCanvas(null, bank.short, false));
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshPhysicalMaterial({
      map: tex,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.85,
      clearcoatRoughness: 0.18,
      transparent: true,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.34, 0.05), mat);
    const [x, y, z] = bankXYZ(i, 0);
    mesh.position.set(x, y + 0.18, z);
    mesh.userData.nodeId = bank.id;
    group.add(mesh);
    cards.push(mesh);
    cardMats.push(mat);
    logos[i].onload = () => {
      const next = new THREE.CanvasTexture(logoCanvas(logos[i], bank.short, false));
      next.colorSpace = THREE.SRGBColorSpace;
      mat.map?.dispose();
      mat.map = next;
      mat.needsUpdate = true;
    };
    const spoke = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(x, y + 0.02, z)]),
      new THREE.LineBasicMaterial({ color: 0x1557ff, transparent: true, opacity: 0.35 }),
    );
    group.add(spoke);
  });

  const stem = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.04, 0), new THREE.Vector3(0, 0.84, 0)]),
    new THREE.LineDashedMaterial({ color: 0x0b1f5c, dashSize: 0.06, gapSize: 0.04, transparent: true, opacity: 0.35 }),
  );
  stem.computeLineDistances();
  group.add(stem);

  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, lite ? 12 : 24, lite ? 12 : 24),
    new THREE.MeshPhysicalMaterial({
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

  const pickables: THREE.Object3D[] = [hex, rt2, rt2Disk, ...cards];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const restAx = lite ? 1.26 : 1.12;
  const restAy = lite ? 0.16 : 0.38;
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
  let composer: EffectComposer | null = null;

  if (canUseBloom(renderer)) {
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(8, 8), 0.48, 0.5, 0.78));
      composer.addPass(new OutputPass());
    } catch {
      composer = null;
    }
  }

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

  const paintCards = (): void => {
    BANKS.forEach((bank, i) => {
      const on = selected === bank.id || hover === bank.id;
      const next = new THREE.CanvasTexture(logoCanvas(logos[i], bank.short, on));
      next.colorSpace = THREE.SRGBColorSpace;
      cardMats[i].map?.dispose();
      cardMats[i].map = next;
      cardMats[i].emissive = new THREE.Color(on ? 0x1557ff : 0x000000);
      cardMats[i].emissiveIntensity = on ? 0.12 : 0;
      cardMats[i].needsUpdate = true;
    });
    const hexMat = hex.material as THREE.MeshPhysicalMaterial;
    hexMat.emissiveIntensity = selected === 6 || hover === 6 ? 0.42 : 0.22;
    const rtMat = rt2.material as THREE.MeshPhysicalMaterial;
    rtMat.emissiveIntensity = selected === 7 || hover === 7 ? 0.95 : 0.55;
  };

  const tick = (now: number): void => {
    const pulse = reduced ? 0 : Math.sin(((now - t0) / 6200) * Math.PI * 2) * 0.022;
    const travel = reduced ? 0.35 : ((now - t0) / 6200) % 1;
    BANKS.forEach((_, i) => {
      const [x, y, z] = bankXYZ(i, pulse);
      cards[i].position.set(x, y + 0.18, z);
      cards[i].lookAt(0, y + 0.18, 0);
      cards[i].rotateY(Math.PI);
    });
    hex.rotation.z = reduced ? 0 : now / 18000;
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
    camera.position.setFromSphericalCoords(lite ? 4.05 : 3.55, ax, ay);
    camera.lookAt(0, lite ? 0.2 : 0.12, 0);
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
  if (lite && performance.now() - first > 2500) {
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
