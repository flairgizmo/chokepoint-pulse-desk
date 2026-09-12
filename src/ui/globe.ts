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
  hoverId?: string;
}

export interface GlobeOverlays {
  routes: boolean;
  corridors: boolean;
  activity: boolean;
  labels: boolean;
  night: boolean;
  day: boolean;
  spin: boolean;
}

interface GlobeOptions {
  onCity: (id: string) => void;
  onHud: (hud: GlobeHud) => void;
}

const DAY_TEX = 'https://unpkg.com/three-globe@2.44.1/example/img/earth-blue-marble.jpg';
const NIGHT_TEX = 'https://unpkg.com/three-globe@2.44.1/example/img/earth-night.jpg';
const BUMP_TEX = 'https://unpkg.com/three-globe@2.44.1/example/img/earth-topology.png';

function makeLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = '600 28px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(11, 16, 22, 0.82)';
    const w = Math.min(240, ctx.measureText(text).width + 24);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') ctx.roundRect(8, 14, w, 36, 8);
    else ctx.rect(8, 14, w, 36);
    ctx.fill();
    ctx.fillStyle = '#f3f1ea';
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

function greatCircle(a: THREE.Vector3, b: THREE.Vector3, n = 64): THREE.Vector3[] {
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

function stars(): THREE.Points {
  const count = 1800;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(14 + Math.random() * 10);
    pos[i * 3] = v.x;
    pos[i * 3 + 1] = v.y;
    pos[i * 3 + 2] = v.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0xc9d4e4, size: 0.035, transparent: true, opacity: 0.85 }),
  );
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
  private distance = 3.4;
  private overlays: GlobeOverlays = {
    routes: true,
    corridors: true,
    activity: true,
    labels: true,
    night: true,
    day: true,
    spin: false,
  };
  private routeLines: THREE.Line[] = [];
  private corridorLines: THREE.Line[] = [];
  private pulse: THREE.Mesh | null = null;
  private pinMeshes: THREE.Object3D[] = [];
  private labelSprites: THREE.Sprite[] = [];
  private globeMesh: THREE.Mesh | null = null;
  private lightsMesh: THREE.Mesh | null = null;
  private dayTex: THREE.Texture | null = null;
  private nightTex: THREE.Texture | null = null;
  private sun: THREE.DirectionalLight | null = null;
  private hoverId: string | undefined;
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
    this.applyMaps();
  }

  focusCity(id: string): void {
    const city = cityById(id);
    if (!city) return;
    this.rotY = THREE.MathUtils.degToRad(-city.lon) + Math.PI;
    this.rotX = THREE.MathUtils.degToRad(city.lat) * 0.65;
    this.distance = 1.42;
  }

  zoomBy(delta: number): void {
    const step = this.distance < 1.8 ? delta * 0.55 : delta;
    this.distance = THREE.MathUtils.clamp(this.distance + step, 1.12, 8.2);
  }

  reset(): void {
    this.rotY = 0.35;
    this.rotX = 0.42;
    this.distance = 3.4;
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    this.scene = scene;
    scene.add(stars());
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
    this.camera = camera;

    const group = new THREE.Group();
    this.earth = group;
    scene.add(group);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 128, 96),
      new THREE.MeshStandardMaterial({
        color: 0x0b2a32,
        roughness: 0.62,
        metalness: 0.12,
        emissive: 0x031016,
      }),
    );
    this.globeMesh = globe;
    group.add(globe);
    group.add(this.graticule());

    const lights = new THREE.Mesh(
      new THREE.SphereGeometry(1.004, 128, 96),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.lightsMesh = lights;
    group.add(lights);

    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.07, 96, 72),
      new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0x4c7cff) } },
        vertexShader:
          'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader:
          'varying vec3 vN; uniform vec3 color; void main(){ float f = pow(1.0 - abs(vN.z), 2.35); gl_FragColor = vec4(color, f * 0.42); }',
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    );
    group.add(atmo);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const ignore = (): void => undefined;
    loader.load(
      DAY_TEX,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this.dayTex = tex;
        this.applyMaps();
      },
      undefined,
      ignore,
    );
    loader.load(
      NIGHT_TEX,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this.nightTex = tex;
        this.applyMaps();
      },
      undefined,
      ignore,
    );
    loader.load(
      BUMP_TEX,
      (tex) => {
        const mat = this.globeMesh?.material as THREE.MeshStandardMaterial | undefined;
        if (!mat) return;
        mat.bumpMap = tex;
        mat.bumpScale = 0.04;
        mat.needsUpdate = true;
      },
      undefined,
      ignore,
    );

    scene.add(new THREE.AmbientLight(0x6b7c8c, 0.32));
    const key = new THREE.DirectionalLight(0xfff4e5, 1.85);
    key.position.set(-2.6, 1.2, 2.4);
    this.sun = key;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x2451e6, 0.35);
    rim.position.set(3.2, -0.4, -2.2);
    scene.add(rim);

    for (const city of CITIES) {
      const pos = latLonToVec(city.lat, city.lon, 1.012);
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(city.kind === 'Headquarters' ? 0.016 : 0.011, 14, 14),
        new THREE.MeshStandardMaterial({
          color: kindColor(city.kind),
          emissive: kindColor(city.kind),
          emissiveIntensity: 0.55,
          roughness: 0.35,
        }),
      );
      pin.position.copy(pos);
      pin.userData.cityId = city.id;
      group.add(pin);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0024, 0.0024, 0.06, 6),
        new THREE.MeshBasicMaterial({ color: kindColor(city.kind) }),
      );
      stem.position.copy(latLonToVec(city.lat, city.lon, 1.04));
      stem.lookAt(0, 0, 0);
      stem.rotateX(Math.PI / 2);
      stem.userData.cityId = city.id;
      group.add(stem);
      this.pinMeshes.push(pin, stem);
      const label = makeLabelSprite(`${city.name} · ${city.kind}`);
      label.position.copy(latLonToVec(city.lat, city.lon, 1.09));
      label.userData.cityId = city.id;
      group.add(label);
      this.labelSprites.push(label);
    }

    const london = CITIES.find((c) => c.id === 'london')!;
    this.pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x1ec9b0, transparent: true, opacity: 0.32 }),
    );
    this.pulse.position.copy(latLonToVec(london.lat, london.lon, 1.03));
    group.add(this.pulse);

    this.routeLines = SETTLEMENT_ROUTES.map(([a, b]) =>
      this.addArc(cityById(a)!, cityById(b)!, 0x8aa0b4, 0.32),
    );
    this.corridorLines = TOKEN_CORRIDORS.map(([a, b]) =>
      this.addArc(cityById(a)!, cityById(b)!, 0x1ec9b0, 0.72),
    );

    window.addEventListener('resize', () => this.resize());
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
      this.pickHover();
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
      if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) < 6) this.pick();
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointerleave', () => {
      this.dragging = false;
      this.hoverId = undefined;
    });
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomBy(e.deltaY * 0.0016);
      },
      { passive: false },
    );
    canvas.addEventListener('dblclick', () => {
      this.distance = THREE.MathUtils.clamp(this.distance - 0.85, 1.12, 8.2);
    });

    this.resize();
    const loop = () => {
      if (this.disposed) return;
      this.frame = requestAnimationFrame(loop);
      this.tick();
    };
    loop();
  }

  private graticule(): THREE.LineSegments {
    const pts: THREE.Vector3[] = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lon = -180; lon < 180; lon += 6) {
        pts.push(latLonToVec(lat, lon, 1.012), latLonToVec(lat, lon + 6, 1.012));
      }
    }
    for (let lon = -180; lon < 180; lon += 15) {
      for (let lat = -80; lat < 80; lat += 6) {
        pts.push(latLonToVec(lat, lon, 1.012), latLonToVec(lat + 6, lon, 1.012));
      }
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({ color: 0x8eb4ff, transparent: true, opacity: 0.16 }),
    );
  }

  private addArc(a: City, b: City, color: number, opacity: number): THREE.Line {
    const pts = greatCircle(latLonToVec(a.lat, a.lon, 1), latLonToVec(b.lat, b.lon, 1));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    this.earth?.add(line);
    return line;
  }

  private pick(): void {
    if (!this.camera) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pinMeshes, false);
    const id = hits[0]?.object.userData.cityId as string | undefined;
    if (id) this.opts.onCity(id);
  }

  private pickHover(): void {
    if (!this.camera) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pinMeshes, false);
    this.hoverId = hits[0]?.object.userData.cityId as string | undefined;
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
    if (!this.reduced && !this.dragging && this.overlays.spin) this.rotY += 0.001;
    this.earth.rotation.y = this.rotY;
    this.earth.rotation.x = this.rotX * 0.12;
    this.camera.position.set(0, this.rotX * 0.32, this.distance);
    this.camera.lookAt(0, 0, 0);
    if (this.sun) {
      const t = this.overlays.day ? 1.85 : 0.35;
      this.sun.intensity = t;
    }
    if (this.pulse && this.overlays.activity && !this.reduced) {
      const s = 1 + Math.sin(performance.now() / 420) * 0.55;
      this.pulse.scale.setScalar(s);
    }
    this.renderer.render(this.scene, this.camera);
    const altitudeKm = Math.round((this.distance - 1.05) * 6371);
    this.opts.onHud({
      lat: THREE.MathUtils.radToDeg(this.rotX),
      lon: THREE.MathUtils.radToDeg(-this.rotY),
      altitudeKm: Math.max(40, altitudeKm),
      zoom: Number((3.4 / this.distance).toFixed(1)),
      hoverId: this.hoverId,
    });
  }

  private applyMaps(): void {
    const mat = this.globeMesh?.material as THREE.MeshStandardMaterial | undefined;
    if (mat) {
      if (this.overlays.day && this.dayTex) {
        mat.map = this.dayTex;
        mat.color = new THREE.Color(0xffffff);
        mat.emissive = new THREE.Color(0x0a1218);
      } else {
        mat.map = this.overlays.night && this.nightTex ? this.nightTex : null;
        mat.color = new THREE.Color(this.nightTex && this.overlays.night ? 0xffffff : 0x0b2a32);
        mat.emissive = new THREE.Color(0x071018);
      }
      mat.needsUpdate = true;
    }
    if (this.lightsMesh) {
      const lm = this.lightsMesh.material as THREE.MeshBasicMaterial;
      if (this.overlays.night && this.nightTex) {
        lm.map = this.nightTex;
        this.lightsMesh.visible = true;
        lm.opacity = this.overlays.day ? 0.72 : 1;
        lm.needsUpdate = true;
      } else {
        this.lightsMesh.visible = false;
      }
    }
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
