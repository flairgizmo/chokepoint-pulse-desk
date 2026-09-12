/** Three-layer digital money, with Overledger as the connecting lattice. */

type LayerId = 0 | 1 | 2;

const LAYERS: Array<{ id: LayerId; name: string; note: string; color: string }> = [
  {
    id: 0,
    name: 'Wholesale · RTGS',
    note: 'Layer 1 — central-bank money and finality. The Synchronisation Lab sits here.',
    color: '#7C5CFF',
  },
  {
    id: 1,
    name: 'Commercial deposits',
    note: 'Layer 2 — GBTD. Six UK banks. The banks owe the holder. Overledger runs the rails.',
    color: '#1550FF',
  },
  {
    id: 2,
    name: 'Tokens · agents',
    note: 'Layer 3 — programmable instructions, x402, Flow. The gate maps; it does not replace.',
    color: '#00C9A7',
  },
];

export function mountGateway(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hint = canvas.parentElement?.querySelector<HTMLElement>('[data-gateway-hint]');
  let raf = 0;
  let ax = 0.62;
  let ay = 0.18;
  let spin = reduced ? 0 : 0.0042;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let selected: LayerId | null = 1;
  let hover: LayerId | null = null;
  const t0 = performance.now();

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    const k = 2.15 / (3.35 - z1);
    const { width: W, height: H } = canvas;
    const scale = Math.min(W, H) * 0.34;
    return [W / 2 + x1 * k * scale, H * 0.52 + y1 * k * scale, z1];
  };

  const ring = (y: number, r: number, n: number): Array<[number, number, number]> => {
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    return pts;
  };

  const paintHint = (): void => {
    if (!hint) return;
    const layer = selected != null ? LAYERS[selected] : hover != null ? LAYERS[hover] : null;
    hint.textContent = layer
      ? `${layer.name} — ${layer.note}`
      : 'Drag to orbit the three layers. Click a ring. Overledger is the lattice.';
  };

  const draw = (now: number): void => {
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);
    const pulse = reduced ? 0 : Math.sin((now - t0) / 700) * 0.04;

    const layers = [
      { id: 0 as LayerId, y: -0.78, r: 1.05 + pulse },
      { id: 1 as LayerId, y: 0.02, r: 0.92 + pulse * 0.6 },
      { id: 2 as LayerId, y: 0.78, r: 0.72 + pulse * 0.4 },
    ];

    const projected = layers.map((L) => ({
      ...L,
      pts: ring(L.y, L.r, 14).map(([x, y, z]) => project(x, y, z)),
    }));

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < 14; i += 1) {
      const a = projected[0].pts[i];
      const b = projected[1].pts[i];
      const c = projected[2].pts[i];
      const g = ctx.createLinearGradient(a[0], a[1], c[0], c[1]);
      g.addColorStop(0, 'rgba(124, 92, 255, 0.35)');
      g.addColorStop(0.5, 'rgba(21, 80, 255, 0.55)');
      g.addColorStop(1, 'rgba(0, 201, 167, 0.45)');
      ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(1, W / 520);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.stroke();
    }

    for (const L of projected) {
      const on = selected === L.id || hover === L.id;
      const meta = LAYERS[L.id];
      ctx.beginPath();
      L.pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      });
      ctx.closePath();
      ctx.strokeStyle = on ? meta.color : `${meta.color}cc`;
      ctx.lineWidth = on ? Math.max(2.6, W / 240) : Math.max(1.6, W / 340);
      ctx.shadowColor = on ? meta.color : 'transparent';
      ctx.shadowBlur = on ? 18 : 0;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = on ? `${meta.color}22` : `${meta.color}10`;
      ctx.fill();
      for (const p of L.pts) {
        ctx.beginPath();
        ctx.fillStyle = meta.color;
        ctx.arc(p[0], p[1], on ? Math.max(3.2, W / 220) : Math.max(2.1, W / 280), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const core = project(0, 0.02, 0);
    const cg = ctx.createRadialGradient(core[0], core[1], 2, core[0], core[1], Math.min(W, H) * 0.12);
    cg.addColorStop(0, 'rgba(255,255,255,0.95)');
    cg.addColorStop(0.35, 'rgba(21,80,255,0.55)');
    cg.addColorStop(1, 'rgba(21,80,255,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(core[0], core[1], Math.min(W, H) * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#04101f';
    ctx.font = `600 ${Math.max(11, W / 62)}px "IBM Plex Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Overledger', core[0], core[1] + 4);
  };

  const pick = (clientX: number, clientY: number): LayerId | null => {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const bands: Array<[LayerId, number]> = [
      [0, canvas.height * 0.28],
      [1, canvas.height * 0.52],
      [2, canvas.height * 0.72],
    ];
    let best: LayerId | null = null;
    let dist = 1e9;
    for (const [id, cy] of bands) {
      const d = Math.abs(y - cy);
      if (d < dist && d < canvas.height * 0.16 && x > canvas.width * 0.12 && x < canvas.width * 0.88) {
        dist = d;
        best = id;
      }
    }
    return best;
  };

  const tick = (): void => {
    if (spin) ay += spin;
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
    paintHint();
    if (!dragging) return;
    ay += (ev.clientX - lastX) * 0.007;
    ax = Math.max(0.2, Math.min(1.25, ax + (ev.clientY - lastY) * 0.006));
    lastX = ev.clientX;
    lastY = ev.clientY;
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onClick = (ev: PointerEvent): void => {
    const hit = pick(ev.clientX, ev.clientY);
    if (hit != null) selected = hit;
    paintHint();
  };

  resize();
  paintHint();
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('click', onClick);
  raf = requestAnimationFrame(tick);

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
