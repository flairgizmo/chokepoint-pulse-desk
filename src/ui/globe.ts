import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { canUseBloom } from './webgl';
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
const WATER_TEX = 'https://unpkg.com/three-globe@2.44.1/example/img/earth-water.png';
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function makeLabelSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = '600 26px Outfit, "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(11, 18, 32, 0.88)';
    const w = Math.min(240, ctx.measureText(text).width + 24);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') ctx.roundRect(8, 14, w, 36, 8);
    else ctx.rect(8, 14, w, 36);
    ctx.fill();
    ctx.fillStyle = '#f4f7fb';
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

function vecToLatLon(v: THREE.Vector3): { lat: number; lon: number } {
  const n = v.clone().normalize();
  const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(n.y, -1, 1)));
  const lon = THREE.MathUtils.radToDeg(Math.atan2(n.x, n.z)) - 180;
  return { lat, lon };
}

function greatCircle(a: THREE.Vector3, b: THREE.Vector3, n = 64): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const aa = a.clone().normalize();
  const bb = b.clone().normalize();
  const omega = Math.acos(THREE.MathUtils.clamp(aa.dot(bb), -1, 1));
  const r = a.length();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const lift = Math.sin(t * Math.PI) * 0.055;
    let dir: THREE.Vector3;
    if (omega < 1e-5) dir = aa.clone();
    else {
      const so = Math.sin(omega);
      dir = aa
        .clone()
        .multiplyScalar(Math.sin((1 - t) * omega) / so)
        .add(bb.clone().multiplyScalar(Math.sin(t * omega) / so));
    }
    out.push(dir.normalize().multiplyScalar(r * (1.02 + lift)));
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
    new THREE.PointsMaterial({ color: 0xe8eef8, size: 0.028, transparent: true, opacity: 0.88, sizeAttenuation: true }),
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
  private phi = 1.08;
  private theta = 2.05;
  private earthSpin = 0.42;
  private distance = 2.85;
  private velTheta = 0;
  private velPhi = 0;
  private followId: string | undefined;
  private overlays: GlobeOverlays = {
    routes: true,
    corridors: true,
    activity: true,
    labels: true,
    night: true,
    day: true,
    spin: true,
  };
  private routeLines: THREE.Line[] = [];
  private corridorLines: THREE.Line[] = [];
  private pulse: THREE.Mesh | null = null;
  private pinMeshes: THREE.Object3D[] = [];
  private labelSprites: THREE.Sprite[] = [];
  private globeMesh: THREE.Mesh | null = null;
  private lightsMesh: THREE.Mesh | null = null;
  private composer: EffectComposer | null = null;
  private dayTex: THREE.Texture | null = null;
  private nightTex: THREE.Texture | null = null;
  private sun: THREE.DirectionalLight | null = null;
  private hoverId: string | undefined;
  private lastHudHover: string | undefined;
  private hudClock = 0;
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
    this.followId = id;
    this.lookAtCity(city);
    this.distance = 1.48;
  }

  zoomBy(delta: number): void {
    const step = this.distance < 1.8 ? delta * 0.55 : delta;
    this.distance = THREE.MathUtils.clamp(this.distance + step, 1.12, 6);
  }

  reset(): void {
    this.followId = undefined;
    this.phi = 1.08;
    this.theta = 2.05;
    this.distance = 2.85;
    this.earthSpin = 0.42;
    this.velTheta = 0;
    this.velPhi = 0;
    this.panX = 0;
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.composer?.dispose();
    this.renderer?.dispose();
    this.root.replaceChildren();
  }

  private lookAtCity(city: City): void {
    if (this.flat) {
      this.panX = ((city.lon + 180) / 360) * this.flatWidth - this.flatWidth / 2;
      return;
    }
    const local = latLonToVec(city.lat, city.lon, 1);
    local.applyAxisAngle(Y_AXIS, this.earthSpin);
    const sph = new THREE.Spherical().setFromVector3(local);
    this.phi = THREE.MathUtils.clamp(sph.phi, 0.18, Math.PI - 0.18);
    this.theta = sph.theta;
  }

  private flat = false;
  private flatImg: HTMLImageElement | null = null;
  private panX = 0;
  private flatWidth = 1;

  private mountFlat(canvas: HTMLCanvasElement): void {
    this.flat = true;
    canvas.dataset.engine = 'canvas2d';
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.root.innerHTML =
        '<p class="earth-fallback">The globe could not start. Use the city list beside the map.</p>';
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.flatImg = img;
    };
    img.src = DAY_TEX;
    const resize = (): void => {
      const { width, height } = this.root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      this.flatWidth = canvas.width;
    };
    const project = (lat: number, lon: number): [number, number] => {
      const { width: W, height: H } = canvas;
      const x = ((((lon + 180) / 360) * W - this.panX) % W + W) % W;
      const y = ((90 - lat) / 180) * H;
      return [x, y];
    };
    const paint = (): void => {
      const { width: W, height: H } = canvas;
      ctx.fillStyle = '#0b1016';
      ctx.fillRect(0, 0, W, H);
      if (this.flatImg) {
        const shift = ((-this.panX % W) + W) % W;
        ctx.drawImage(this.flatImg, shift - W, 0, W, H);
        ctx.drawImage(this.flatImg, shift, 0, W, H);
      } else {
        ctx.fillStyle = '#16324a';
        ctx.fillRect(0, H * 0.28, W, H * 0.44);
      }
      for (const city of CITIES) {
        const [x, y] = project(city.lat, city.lon);
        ctx.beginPath();
        ctx.fillStyle = city.id === 'london' ? '#1ec9b0' : '#d4b483';
        ctx.arc(x, y, city.kind === 'Headquarters' ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
        if (this.overlays.labels) {
          ctx.font = `600 ${Math.max(11, W / 92)}px Outfit, system-ui, sans-serif`;
          ctx.fillStyle = '#f4f7fb';
          ctx.fillText(city.name, x + 8, y + 4);
        }
      }
    };
    canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.followId = undefined;
      this.lastX = e.clientX;
      this.startX = e.clientX;
      this.startY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.panX -= (e.clientX - this.lastX) * (canvas.width / Math.max(1, canvas.clientWidth));
      this.lastX = e.clientX;
    });
    canvas.addEventListener('pointerup', (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) < 6) {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * sx;
        const py = (e.clientY - rect.top) * sy;
        let best: string | undefined;
        let dist = 18;
        for (const city of CITIES) {
          const [x, y] = project(city.lat, city.lon);
          const d = Math.hypot(x - px, y - py);
          if (d < dist) {
            dist = d;
            best = city.id;
          }
        }
        if (best) this.opts.onCity(best);
      }
    });
    window.addEventListener('resize', resize);
    resize();
    const loop = () => {
      if (this.disposed) return;
      this.frame = requestAnimationFrame(loop);
      if (!this.reduced && !this.dragging && this.overlays.spin) this.panX += 0.55;
      paint();
    };
    loop();
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
        failIfMajorPerformanceCaveat: true,
      });
    } catch {
      this.mountFlat(canvas);
      return;
    }
    this.renderer = renderer;
    canvas.dataset.engine = 'webgl';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    this.scene = scene;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.add(stars());
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    this.camera = camera;

    const group = new THREE.Group();
    this.earth = group;
    scene.add(group);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0x0b2a32,
        roughness: 0.38,
        metalness: 0.22,
        emissive: 0x031016,
        clearcoat: 0.42,
        clearcoatRoughness: 0.28,
        envMapIntensity: 1.05,
      }),
    );
    this.globeMesh = globe;
    group.add(globe);
    group.add(this.graticule());

    const lights = new THREE.Mesh(
      new THREE.SphereGeometry(1.004, 96, 64),
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
      new THREE.SphereGeometry(1.09, 64, 48),
      new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0x8ec0ff) } },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vV;
          void main(){
            vN = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vN;
          varying vec3 vV;
          uniform vec3 color;
          void main(){
            float fresnel = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.85);
            gl_FragColor = vec4(color, fresnel * 0.72);
          }`,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
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
        const mat = this.globeMesh?.material as THREE.MeshPhysicalMaterial | undefined;
        if (!mat) return;
        mat.bumpMap = tex;
        mat.bumpScale = 0.055;
        mat.needsUpdate = true;
      },
      undefined,
      ignore,
    );
    loader.load(
      WATER_TEX,
      (tex) => {
        const mat = this.globeMesh?.material as THREE.MeshPhysicalMaterial | undefined;
        if (!mat) return;
        mat.metalnessMap = tex;
        mat.metalness = 0.42;
        mat.roughness = 0.38;
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
        new THREE.SphereGeometry(city.kind === 'Headquarters' ? 0.016 : 0.011, 12, 12),
        new THREE.MeshPhysicalMaterial({
          color: kindColor(city.kind),
          emissive: kindColor(city.kind),
          emissiveIntensity: 0.85,
          roughness: 0.22,
          metalness: 0.35,
          clearcoat: 0.7,
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
      this.followId = undefined;
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
      this.velTheta = -dx * 0.012;
      this.velPhi = dy * 0.009;
      this.theta += this.velTheta;
      this.phi = THREE.MathUtils.clamp(this.phi + this.velPhi, 0.18, Math.PI - 0.18);
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
        this.zoomBy(e.deltaY * 0.0014);
      },
      { passive: false },
    );
    canvas.addEventListener('dblclick', () => {
      this.distance = THREE.MathUtils.clamp(this.distance - 0.85, 1.12, 6);
    });

    if (canUseBloom(renderer)) {
      try {
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(new UnrealBloomPass(new THREE.Vector2(8, 8), 0.42, 0.52, 0.72));
        composer.addPass(new OutputPass());
        this.composer = composer;
      } catch {
        this.composer = null;
      }
    }

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
    this.composer?.setSize(w, h);
  }

  private facingLatLon(): { lat: number; lon: number } {
    if (!this.camera) return { lat: 0, lon: 0 };
    const world = this.camera.position.clone().normalize();
    world.applyAxisAngle(Y_AXIS, -this.earthSpin);
    return vecToLatLon(world);
  }

  private emitHud(): void {
    const hover = this.hoverId ? cityById(this.hoverId) : undefined;
    const facing = hover ? { lat: hover.lat, lon: hover.lon } : this.facingLatLon();
    const altitudeKm = Math.round((this.distance - 1.05) * 6371);
    this.opts.onHud({
      lat: facing.lat,
      lon: facing.lon,
      altitudeKm: Math.max(40, altitudeKm),
      zoom: Number((2.85 / this.distance).toFixed(1)),
      hoverId: this.hoverId,
    });
  }

  private tick(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.earth) return;
    if (!this.dragging) {
      this.theta += this.velTheta;
      this.phi = THREE.MathUtils.clamp(this.phi + this.velPhi, 0.18, Math.PI - 0.18);
      this.velTheta *= 0.9;
      this.velPhi *= 0.9;
      if (Math.abs(this.velTheta) < 0.00008) this.velTheta = 0;
      if (Math.abs(this.velPhi) < 0.00008) this.velPhi = 0;
    }
    if (!this.reduced && !this.dragging && this.overlays.spin && !this.followId) this.earthSpin += 0.0034;
    this.earth.rotation.set(0, this.earthSpin, 0);
    if (this.followId && !this.dragging) {
      const city = cityById(this.followId);
      if (city) this.lookAtCity(city);
    }
    this.camera.position.setFromSphericalCoords(this.distance, this.phi, this.theta);
    this.camera.lookAt(0, 0, 0);
    if (this.sun) this.sun.intensity = this.overlays.day ? 1.85 : 0.35;
    if (this.pulse && this.overlays.activity && !this.reduced) {
      const s = 1 + Math.sin(performance.now() / 420) * 0.55;
      this.pulse.scale.setScalar(s);
    }
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    this.hudClock += 1;
    if (this.hoverId !== this.lastHudHover || this.hudClock % 4 === 0) {
      this.lastHudHover = this.hoverId;
      this.emitHud();
    }
  }

  private applyMaps(): void {
    const mat = this.globeMesh?.material as THREE.MeshPhysicalMaterial | undefined;
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
