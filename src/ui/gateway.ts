/** Sterling corridor — six GBTD issuers around one Overledger plane. Filmic WebGL; 2D if WebGL fails. */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

type NodeId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const BANKS: Array<{ id: NodeId; name: string; short: string; note: string }> = [
  {
    id: 0,
    name: 'Barclays',
    short: 'BARC',
    note: 'Named GBTD issuer, 26 September 2025. Quant’s write-up of a remortgage lock-and-release sits with this name.',
  },
  {
    id: 1,
    name: 'HSBC',
    short: 'HSBC',
    note: 'Named GBTD issuer. Quant’s write-up of an Orion delivery-versus-payment sits with this name.',
  },
  {
    id: 2,
    name: 'Lloyds Banking Group',
    short: 'LLOY',
    note: 'UK Finance’s press uses Lloyds Banking Group. The public wordmark is Lloyds. Retail P2P lock-and-release is the Quant write-up.',
  },
  {
    id: 3,
    name: 'NatWest',
    short: 'NWB',
    note: 'Named GBTD issuer. Sat on the June 2026 Digital Innovation Summit panel, in Quant’s own note.',
  },
  {
    id: 4,
    name: 'Nationwide',
    short: 'NWID',
    note: 'Named GBTD issuer. Commercial-bank sterling. Quant is the technology partner, not the issuer.',
  },
  {
    id: 5,
    name: 'Santander',
    short: 'SAN',
    note: 'Named GBTD issuer. UK Finance’s press also writes Santander UK in some bylines. Same issuing bank.',
  },
];

const MARK: Record<string, string> = {
  Barclays: '/marks/barclays.svg',
  HSBC: '/marks/hsbc.svg',
  'Lloyds Banking Group': '/marks/lloyds.svg',
  NatWest: '/marks/natwest.svg',
  Nationwide: '/marks/nationwide.svg',
  Santander: '/marks/santander.svg',
};

const GATE: { id: NodeId; name: string; note: string } = {
  id: 6,
  name: 'Overledger',
  note: 'Gateway OS. Maps a lock-and-release across the six books. Not a seventh chain. Whitepaper, UCL Discovery, 2018.',
};

const RTGS: { id: NodeId; name: string; note: string } = {
  id: 7,
  name: 'Simulated RT2',
  note: 'Bank of England Synchronisation Lab, February 2026. Simulated RT2. Not live RTGS. Not a Quant endorsement.',
};

function bankXYZ(i: number, pulse: number): [number, number, number] {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
  const r = 1.18 + pulse;
  return [Math.cos(a) * r, 0.04 + Math.sin(a) * 0.04, Math.sin(a) * r];
}

function paintHint(canvas: HTMLCanvasElement, selected: NodeId | null, hover: NodeId | null): void {
  const hint = canvas.parentElement?.querySelector<HTMLElement>('[data-gateway-hint]');
  if (!hint) return;
  const node =
    selected != null
      ? [...BANKS, GATE, RTGS].find((n) => n.id === selected)
      : hover != null
        ? [...BANKS, GATE, RTGS].find((n) => n.id === hover)
        : null;
  hint.textContent = node
    ? `${node.name} — ${node.note}`
    : 'Six commercial banks. One gateway plane. A lock leaves one book and a release lands in another. Click a node.';
}

function logoCanvas(img: HTMLImageElement | null, short: string, on = false): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 220;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  ctx.clearRect(0, 0, 512, 220);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(8, 8, 496, 204, 28);
  else ctx.rect(8, 8, 496, 204);
  ctx.fill();
  ctx.strokeStyle = on ? '#1557FF' : 'rgba(11, 31, 92, 0.16)';
  ctx.lineWidth = on ? 8 : 3;
  ctx.stroke();
  if (img?.complete && img.naturalWidth) {
    const maxW = 420;
    const maxH = 120;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (512 - dw) / 2, (220 - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = '#0B1F5C';
    ctx.font = '700 64px Outfit, IBM Plex Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(short, 256, 110);
  }
  return c;
}

function labelSprite(text: string, color = '#0B1F5C'): THREE.Sprite {
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

function remountCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const next = canvas.cloneNode(false) as HTMLCanvasElement;
  next.id = canvas.id;
  next.className = canvas.className;
  next.setAttribute('role', canvas.getAttribute('role') || 'img');
  const label = canvas.getAttribute('aria-label');
  if (label) next.setAttribute('aria-label', label);
  canvas.replaceWith(next);
  return next;
}

export function mountGateway(canvas: HTMLCanvasElement): () => void {
  try {
    return mountGateway3D(canvas);
  } catch {
    return mountGateway2D(remountCanvas(canvas));
  }
}

function mountGateway3D(canvas: HTMLCanvasElement): () => void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    return mountGateway2D(remountCanvas(canvas));
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0xeef2f8, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xeef2f8, 4.2, 9.5);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 40);
  const group = new THREE.Group();
  scene.add(group);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 72),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.04,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
      transparent: true,
      opacity: 0.72,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.28;
  scene.add(floor);

  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  scene.add(new THREE.HemisphereLight(0xf4f7fb, 0xd7deeb, 0.55));
  const key = new THREE.DirectionalLight(0xfff6ea, 1.55);
  key.position.set(2.4, 3.2, 2.1);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x1557ff, 0.55);
  rim.position.set(-2.8, 1.2, -2.4);
  scene.add(rim);
  const fill = new THREE.PointLight(0x00a878, 0.55, 6);
  fill.position.set(0, 0.9, 0);
  scene.add(fill);

  const hex = new THREE.Mesh(
    new THREE.ExtrudeGeometry(hexShape(0.44), {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.012,
      bevelSegments: 2,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x1557ff,
      metalness: 0.62,
      roughness: 0.16,
      iridescence: 1,
      iridescenceIOR: 1.28,
      iridescenceThicknessRange: [120, 420],
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      emissive: 0x0b1f5c,
      emissiveIntensity: 0.22,
    }),
  );
  hex.rotation.x = -Math.PI / 2;
  hex.position.y = -0.03;
  hex.userData.nodeId = 6;
  group.add(hex);

  const gateLabel = labelSprite('OVERLEDGER');
  gateLabel.position.set(0, 0.16, 0);
  group.add(gateLabel);

  const rt2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.028, 16, 48),
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
    new THREE.CircleGeometry(0.18, 32),
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
  const rt2Label = labelSprite('SIM RT2', '#0B1F5C');
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
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.37), mat);
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
    new THREE.SphereGeometry(0.045, 24, 24),
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
  const lockLabel = labelSprite('LOCK', '#0B1220');
  const releaseLabel = labelSprite('RELEASE', '#0B1220');
  lockLabel.scale.set(0.42, 0.11, 1);
  releaseLabel.scale.set(0.52, 0.12, 1);
  group.add(lockLabel);
  group.add(releaseLabel);
  releaseLabel.visible = false;

  const pickables: THREE.Object3D[] = [hex, rt2, rt2Disk, ...cards];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const restAx = 1.12;
  const restAy = 0.38;
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

  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(8, 8), 0.38, 0.42, 0.84);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  } catch {
    composer = null;
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
      cards[i].lookAt(camera.position);
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
    camera.position.setFromSphericalCoords(3.55, ax, ay);
    camera.lookAt(0, 0.12, 0);
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
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('click', onClick);
  if (reduced) tick(performance.now());
  else raf = requestAnimationFrame(loop);

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

function mountGateway2D(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  const restAx = 1.08;
  const restAy = 0.28;
  const orbit = (16 * Math.PI) / 180;
  let ax = restAx;
  let ay = restAy;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let selected: NodeId | null = 6;
  let hover: NodeId | null = null;
  const t0 = performance.now();
  let parx = 0;
  let pary = 0;
  const projected: Array<{ id: NodeId; x: number; y: number; z: number }> = [];
  const logos = BANKS.map((b) => {
    const img = new Image();
    img.onload = () => draw(performance.now());
    img.src = MARK[b.name];
    return img;
  });

  const roundRect = (x: number, y: number, w: number, h: number, r: number): void => {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  };

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
  };

  const project = (x: number, y: number, z: number): [number, number, number] => {
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    let x1 = x * cy + z * sy;
    let z1 = -x * sy + z * cy;
    const y1 = y * cx - z1 * sx;
    z1 = y * sx + z1 * cx;
    const k = 2.05 / (3.2 - z1);
    const { width: W, height: H } = canvas;
    const scale = Math.min(W, H) * 0.42;
    return [W / 2 + x1 * k * scale + parx, H * 0.52 + y1 * k * scale + pary, z1];
  };

  const draw = (now: number): void => {
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);
    const pulse = reduced ? 0 : Math.sin(((now - t0) / 6200) * Math.PI * 2) * 0.022;
    const travel = reduced ? 0.35 : ((now - t0) / 6200) % 1;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    projected.length = 0;

    const banks = BANKS.map((b, i) => {
      const [x, y, z] = bankXYZ(i, pulse);
      const p = project(x, y, z);
      projected.push({ id: b.id, x: p[0], y: p[1], z: p[2] });
      return { bank: b, p };
    });

    const gate = project(0, 0, 0);
    projected.push({ id: 6, x: gate[0], y: gate[1], z: gate[2] });
    const rt2 = project(0, -0.78, 0);
    projected.push({ id: 7, x: rt2[0], y: rt2[1], z: rt2[2] });

    const hex = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      return project(Math.cos(a) * (0.42 + pulse * 0.4), 0, Math.sin(a) * (0.42 + pulse * 0.4));
    });

    ctx.save();
    ctx.strokeStyle = 'rgba(11, 31, 92, 0.06)';
    ctx.lineWidth = 1;
    for (const ring of [0.55, 0.9, 1.25]) {
      const a = project(ring, 0, 0);
      const b = project(0, 0, ring);
      ctx.beginPath();
      ctx.ellipse(gate[0], gate[1] + 8, Math.abs(a[0] - gate[0]), Math.abs(b[1] - gate[1]) * 0.35 + 18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    banks.forEach(({ p }) => {
      ctx.beginPath();
      ctx.moveTo(gate[0], gate[1]);
      ctx.lineTo(p[0], p[1]);
      ctx.strokeStyle = 'rgba(21, 87, 255, 0.28)';
      ctx.lineWidth = Math.max(1.4, W / 420);
      ctx.stroke();
    });

    ctx.beginPath();
    hex.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    });
    ctx.closePath();
    ctx.fillStyle = selected === 6 || hover === 6 ? 'rgba(21, 87, 255, 0.16)' : 'rgba(21, 87, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = selected === 6 || hover === 6 ? '#1557FF' : '#0B1F5C';
    ctx.lineWidth = selected === 6 || hover === 6 ? Math.max(2.6, W / 200) : Math.max(1.8, W / 280);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(gate[0], gate[1]);
    ctx.lineTo(rt2[0], rt2[1]);
    ctx.strokeStyle = 'rgba(11, 31, 92, 0.28)';
    ctx.setLineDash([6, 7]);
    ctx.lineWidth = Math.max(1.2, W / 420);
    ctx.stroke();
    ctx.setLineDash([]);

    const onRt = selected === 7 || hover === 7;
    ctx.beginPath();
    ctx.arc(rt2[0], rt2[1], Math.max(16, W / 42), 0, Math.PI * 2);
    ctx.fillStyle = onRt ? 'rgba(0, 168, 120, 0.18)' : 'rgba(0, 168, 120, 0.08)';
    ctx.fill();
    ctx.strokeStyle = onRt ? '#00A878' : '#0B1F5C';
    ctx.lineWidth = onRt ? 2.4 : 1.5;
    ctx.stroke();
    ctx.fillStyle = '#0B1F5C';
    ctx.font = `600 ${Math.max(9, W / 72)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SIM RT2', rt2[0], rt2[1]);

    banks.forEach(({ bank, p }, i) => {
      const on = selected === bank.id || hover === bank.id;
      const rw = Math.max(86, W / 8.2);
      const rh = Math.max(36, W / 22);
      ctx.shadowColor = on ? 'rgba(21, 87, 255, 0.28)' : 'rgba(11, 31, 92, 0.08)';
      ctx.shadowBlur = on ? 16 : 8;
      roundRect(p[0] - rw / 2, p[1] - rh / 2, rw, rh, 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = on ? '#1557FF' : 'rgba(11, 31, 92, 0.18)';
      ctx.lineWidth = on ? 2.2 : 1.2;
      ctx.stroke();
      const logo = logos[i];
      if (logo?.complete && logo.naturalWidth) {
        const maxW = rw - 18;
        const maxH = rh - 12;
        const scale = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight);
        const dw = logo.naturalWidth * scale;
        const dh = logo.naturalHeight * scale;
        ctx.drawImage(logo, p[0] - dw / 2, p[1] - dh / 2, dw, dh);
      } else {
        ctx.fillStyle = '#0B1F5C';
        ctx.font = `700 ${Math.max(10, W / 58)}px Outfit, "IBM Plex Sans", system-ui, sans-serif`;
        ctx.fillText(bank.short, p[0], p[1]);
      }
    });

    ctx.fillStyle = '#0B1F5C';
    ctx.font = `700 ${Math.max(11, W / 48)}px Outfit, "IBM Plex Sans", system-ui, sans-serif`;
    ctx.fillText('OVERLEDGER', gate[0], gate[1] + 2);

    const from = Math.floor(travel * 6) % 6;
    const to = (from + 1) % 6;
    const local = (travel * 6) % 1;
    const a = banks[from].p;
    const b = gate;
    const c = banks[to].p;
    const bead =
      local < 0.5
        ? [a[0] + (b[0] - a[0]) * (local * 2), a[1] + (b[1] - a[1]) * (local * 2)]
        : [b[0] + (c[0] - b[0]) * ((local - 0.5) * 2), b[1] + (c[1] - b[1]) * ((local - 0.5) * 2)];
    ctx.fillStyle = '#00A878';
    ctx.shadowColor = '#00A878';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(bead[0], bead[1], Math.max(4.2, W / 170), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0B1220';
    ctx.font = `500 ${Math.max(8, W / 80)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.fillText(local < 0.5 ? 'LOCK' : 'RELEASE', bead[0], bead[1] - Math.max(14, W / 50));
  };

  const pick = (clientX: number, clientY: number): NodeId | null => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const x = (clientX - rect.left) * sx;
    const y = (clientY - rect.top) * sy;
    let best: NodeId | null = null;
    let dist = Infinity;
    for (const n of projected) {
      const d = Math.hypot(n.x - x, n.y - y);
      const hit = n.id === 6 ? Math.max(28, canvas.width / 18) : n.id === 7 ? Math.max(22, canvas.width / 24) : Math.max(40, canvas.width / 16);
      if (d < hit && d < dist) {
        dist = d;
        best = n.id;
      }
    }
    return best;
  };

  const tick = (): void => {
    draw(performance.now());
    raf = requestAnimationFrame(tick);
  };

  const onDown = (ev: PointerEvent): void => {
    dragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev: PointerEvent): void => {
    hover = pick(ev.clientX, ev.clientY);
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / rect.width - 0.5;
    const ny = (ev.clientY - rect.top) / rect.height - 0.5;
    if (!dragging) {
      ay += (restAy + nx * 2 * orbit - ay) * 0.22;
      ax += (restAx + ny * 2 * orbit - ax) * 0.22;
      if (reduced) {
        parx = nx * 12;
        pary = ny * 8;
      }
    }
    paintHint(canvas, selected, hover);
    if (!dragging) return;
    ay = Math.max(restAy - orbit, Math.min(restAy + orbit, ay + (ev.clientX - lastX) * 0.018));
    ax = Math.max(restAx - orbit, Math.min(restAx + orbit, ax + (ev.clientY - lastY) * 0.014));
    lastX = ev.clientX;
    lastY = ev.clientY;
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onClick = (ev: PointerEvent): void => {
    const hit = pick(ev.clientX, ev.clientY);
    if (hit != null) selected = hit;
    paintHint(canvas, selected, hover);
  };

  resize();
  paintHint(canvas, selected, hover);
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('click', onClick);
  if (reduced) draw(performance.now());
  else raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    canvas.removeEventListener('click', onClick);
  };
}
