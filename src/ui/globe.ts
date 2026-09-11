import * as THREE from 'three';
import {
  CITIES,
  SETTLEMENT_ROUTES,
  TOKEN_CORRIDORS,
  cityById,
  type City,
} from '../data/cities';

export interface GlobeHud {
  lat: number;
  lon: number;
  altitudeKm: number;
  zoom: number;
}

export interface GlobeOverlays {
  routes: boolean;
  corridors: boolean;
  activity: boolean;
  labels: boolean;
  night: boolean;
  spin: boolean;
}

interface GlobeOptions {
  onCity: (id: string) => void;
  onHud: (hud: GlobeHud) => void;
}

function makeLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = '600 28px "Inter Tight", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(17, 17, 17, 0.78)';
    const w = Math.min(240, ctx.measureText(text).width + 24);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') ctx.roundRect(8, 14, w, 36, 8);
    else ctx.rect(8, 14, w, 36);
    ctx.fill();
    ctx.fillStyle = '#eef3f6';
    ctx.fillText(text, 20, 40);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.42, 0.105, 1);
  sprite.center.set(0, 0.5);
  return sprite;
}

function latLonToVec(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3().setFromSphericalCoords(r, phi, theta);
}

function greatCircle(a: THREE.Vector3, b: THREE.Vector3, n = 48): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const aa = a.clone().normalize();
  const bb = b.clone().normalize();
  const r = a.length();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push(new THREE.Vector3().lerpVectors(aa, bb, t).normalize().multiplyScalar(r * 1.018));
  }
  return out;
}

export class EarthGlobe {
  private root: HTMLElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private earth: THREE.Object3D | null = null;
  private frame = 0;
  private disposed = false;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private startX = 0;
  private startY = 0;
  private rotY = 0.35;
  private rotX = 0.42;
  private distance = 4.2;
  private overlays: GlobeOverlays = {
    routes: true,
    corridors: true,
    activity: true,
    labels: true,
    night: true,
    spin: false,
  };
  private routeLines: THREE.Line[] = [];
  private corridorLines: THREE.Line[] = [];
  private pulse: THREE.Mesh | null = null;
  private pinMeshes: THREE.Mesh[] = [];
  private labelSprites: THREE.Sprite[] = [];
  private globeMesh: THREE.Mesh | null = null;
  private nightTex: THREE.Texture | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private opts: GlobeOptions;
  private reduced: boolean;

  constructor(root: HTMLElement, opts: GlobeOptions) {
    this.root = root;
    this.opts = opts;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mount();
  }

  setOverlays(next: Partial<GlobeOverlays>): void {
    this.overlays = { ...this.overlays, ...next };
    for (const l of this.routeLines) l.visible = this.overlays.routes;
    for (const l of this.corridorLines) l.visible = this.overlays.corridors;
    if (this.pulse) this.pulse.visible = this.overlays.activity;
    for (const s of this.labelSprites) s.visible = this.overlays.labels;
    this.applyNight();
  }

  focusCity(id: string): void {
    const city = cityById(id);
    if (!city) return;
    this.rotY = THREE.MathUtils.degToRad(-city.lon) + Math.PI;
    this.rotX = THREE.MathUtils.degToRad(city.lat) * 0.65;
    this.distance = 2.6;
  }

  zoomBy(delta: number): void {
    this.distance = THREE.MathUtils.clamp(this.distance + delta, 1.7, 7.5);
  }

  reset(): void {
    this.rotY = 0.35;
    this.rotX = 0.42;
    this.distance = 4.2;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.renderer?.dispose();
    this.root.replaceChildren();
  }

  private mount(): void {
    const canvas = document.createElement('canvas');
    canvas.className = 'earth-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    this.root.appendChild(canvas);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      this.root.innerHTML =
        '<p class="earth-fallback">WebGL could not start. The encyclopedia still reads without the globe.</p>';
      return;
    }
    this.renderer = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    this.scene = scene;
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    this.camera = camera;

    const group = new THREE.Group();
    this.earth = group;
    scene.add(group);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 48),
      new THREE.MeshStandardMaterial({
        color: 0x0b2a32,
        roughness: 0.72,
        metalness: 0.08,
        emissive: 0x031016,
      }),
    );
    this.globeMesh = globe;
    group.add(globe);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      'https://unpkg.com/three-globe@2.44.1/example/img/earth-night.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this.nightTex = tex;
        this.applyNight();
      },
      undefined,
      () => {
        /* stylised fallback already on the mesh */
      },
    );

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.045, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2451e6,
        transparent: true,
        opacity: 0.09,
        side: THREE.BackSide,
      }),
    );
    group.add(atmosphere);

    scene.add(new THREE.AmbientLight(0x88a0b0, 0.55));
    const key = new THREE.DirectionalLight(0xe8f4ff, 1.35);
    key.position.set(-2.4, 1.1, 2.8);
    scene.add(key);

    for (const city of CITIES) {
      const pos = latLonToVec(city.lat, city.lon, 1.02);
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(city.kind === 'Headquarters' ? 0.018 : 0.012, 12, 12),
        new THREE.MeshBasicMaterial({ color: kindColor(city.kind) }),
      );
      pin.position.copy(pos);
      pin.userData.cityId = city.id;
      group.add(pin);
      this.pinMeshes.push(pin);
      const label = makeLabelSprite(city.name);
      label.position.copy(latLonToVec(city.lat, city.lon, 1.08));
      label.userData.cityId = city.id;
      group.add(label);
      this.labelSprites.push(label);
    }

    const london = CITIES.find((c) => c.id === 'london')!;
    this.pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x1ec9b0, transparent: true, opacity: 0.35 }),
    );
    this.pulse.position.copy(latLonToVec(london.lat, london.lon, 1.03));
    group.add(this.pulse);

    this.routeLines = SETTLEMENT_ROUTES.map(([a, b]) =>
      this.addArc(cityById(a)!, cityById(b)!, 0x4a6a78, 0.35),
    );
    this.corridorLines = TOKEN_CORRIDORS.map(([a, b]) =>
      this.addArc(cityById(a)!, cityById(b)!, 0x1ec9b0, 0.7),
    );

    const onResize = () => this.resize();
    window.addEventListener('resize', onResize);

    canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.startX = e.clientX;
      this.startY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.rotY += dx * 0.005;
      this.rotX = THREE.MathUtils.clamp(this.rotX + dy * 0.004, -1.15, 1.15);
    });
    const endDrag = (e: PointerEvent) => {
      if (!this.dragging) return;
      this.dragging = false;
      if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) < 6) {
        this.pick();
      }
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointerleave', () => {
      this.dragging = false;
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomBy(e.deltaY * 0.002);
      },
      { passive: false },
    );
    canvas.addEventListener('dblclick', () => {
      this.distance = THREE.MathUtils.clamp(this.distance - 1.1, 1.7, 7.5);
    });

    this.resize();
    const loop = () => {
      if (this.disposed) return;
      this.frame = requestAnimationFrame(loop);
      this.tick();
    };
    loop();
  }

  private addArc(a: City, b: City, color: number, opacity: number): THREE.Line {
    const pts = greatCircle(latLonToVec(a.lat, a.lon, 1), latLonToVec(b.lat, b.lon, 1));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    );
    this.earth?.add(line);
    return line;
  }

  private pick(): void {
    if (!this.camera || !this.earth) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pinMeshes);
    const id = hits[0]?.object.userData.cityId as string | undefined;
    if (id) this.opts.onCity(id);
  }

  private resize(): void {
    if (!this.renderer || !this.camera) return;
    const { width, height } = this.root.getBoundingClientRect();
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private tick(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.earth) return;
    if (!this.reduced && !this.dragging && this.overlays.spin) {
      this.rotY += 0.0012;
    }
    this.earth.rotation.y = this.rotY;
    this.earth.rotation.x = this.rotX * 0.15;
    this.camera.position.set(0, this.rotX * 0.35, this.distance);
    this.camera.lookAt(0, 0, 0);
    if (this.pulse && this.overlays.activity && !this.reduced) {
      const s = 1 + Math.sin(performance.now() / 420) * 0.55;
      this.pulse.scale.setScalar(s);
    }
    this.renderer.render(this.scene, this.camera);

    const altitudeKm = Math.round((this.distance - 1.05) * 6371);
    const lat = THREE.MathUtils.radToDeg(this.rotX);
    const lon = THREE.MathUtils.radToDeg(-this.rotY);
    this.opts.onHud({
      lat,
      lon,
      altitudeKm: Math.max(40, altitudeKm),
      zoom: Number((4.2 / this.distance).toFixed(1)),
    });
  }

  private applyNight(): void {
    const mat = this.globeMesh?.material as THREE.MeshStandardMaterial | undefined;
    if (!mat) return;
    if (this.overlays.night && this.nightTex) {
      mat.map = this.nightTex;
      mat.emissiveMap = this.nightTex;
      mat.color = new THREE.Color(0xffffff);
      mat.emissive = new THREE.Color(0x334455);
    } else {
      mat.map = null;
      mat.emissiveMap = null;
      mat.color = new THREE.Color(0x0b2a32);
      mat.emissive = new THREE.Color(0x031016);
    }
    mat.needsUpdate = true;
  }
}

function kindColor(kind: City['kind']): number {
  switch (kind) {
    case 'Headquarters':
      return 0x1ec9b0;
    case 'Banking':
      return 0xd4b483;
    case 'Lab':
      return 0x7ab0ff;
    case 'Standards':
      return 0xc4a8ff;
    case 'Research':
      return 0x9ad7c2;
    default:
      return 0xe8edf2;
  }
}
