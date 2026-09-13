/** Quant Q / Overledger lattice — instrument, not mascot. */

type LayerId = 0 | 1 | 2;

const NOTES: Array<{ id: LayerId; name: string; note: string }> = [
  { id: 0, name: 'Outer ledger', note: 'One disciplined ring. A domain Overledger can map onto — Fabric, Ethereum, a bank core.' },
  { id: 1, name: 'Inner ledger', note: 'A second book. The gate’s job is that both books can be true at once, then settle as one.' },
  { id: 2, name: 'Light path', note: 'The Q tail. A single instruction walking from application to settlement without minting a new chain.' },
];

export function mountGateway(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hint = canvas.parentElement?.querySelector<HTMLElement>('[data-gateway-hint]');
  let raf = 0;
  const restAx = 1.08;
  const restAy = 0.28;
  const orbit = (12 * Math.PI) / 180;
  let ax = restAx;
  let ay = restAy;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let selected: LayerId | null = 2;
  let hover: LayerId | null = null;
  const t0 = performance.now();
  let parx = 0;
  let pary = 0;

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
    const k = 2.05 / (3.2 - z1);
    const { width: W, height: H } = canvas;
    const scale = Math.min(W, H) * 0.44;
    return [W / 2 + x1 * k * scale + parx, H * 0.5 + y1 * k * scale + pary, z1];
  };

  const paintHint = (): void => {
    if (!hint) return;
    const layer = selected != null ? NOTES[selected] : hover != null ? NOTES[hover] : null;
    hint.textContent = layer
      ? `${layer.name} — ${layer.note}`
      : 'Orbit the Q. A lattice of ledgers, one light path. Overledger is the instrument.';
  };

  const ring = (y: number, r: number, n: number, tilt = 0): Array<[number, number, number]> => {
    const pts: Array<[number, number, number]> = [];
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2 + tilt;
      pts.push([Math.cos(a) * r, y + Math.sin(a) * 0.08, Math.sin(a) * r]);
    }
    return pts;
  };

  const draw = (now: number): void => {
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);
    const pulse = reduced ? 0 : Math.sin(((now - t0) / 8000) * Math.PI * 2) * 0.018;
    const travel = reduced ? 0.35 : ((now - t0) / 8000) % 1;

    const outer = ring(-0.08, 1.12 + pulse, 22);
    const mid = ring(0.02, 0.86 + pulse * 0.4, 16, 0.22);
    const inner = ring(0.1, 0.58 + pulse * 0.5, 14, 0.4);
    const po = outer.map(([x, y, z]) => project(x, y, z));
    const pm = mid.map(([x, y, z]) => project(x, y, z));
    const pi = inner.map(([x, y, z]) => project(x, y, z));

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < 12; i += 1) {
      const a = po[i * 2 % po.length];
      const b = pm[i % pm.length];
      const c = pi[i % pi.length];
      ctx.strokeStyle = 'rgba(126, 224, 200, 0.28)';
      ctx.lineWidth = Math.max(1, W / 560);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.stroke();
    }

    const strokeRing = (pts: Array<[number, number, number]>, color: string, on: boolean): void => {
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      });
      ctx.closePath();
      ctx.strokeStyle = on ? color : `${color}99`;
      ctx.lineWidth = on ? Math.max(2.4, W / 220) : Math.max(1.4, W / 320);
      ctx.shadowColor = on ? color : 'transparent';
      ctx.shadowBlur = on ? 16 : 0;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = on ? `${color}18` : `${color}0c`;
      ctx.fill();
    };

    strokeRing(po, '#8b7cff', selected === 0 || hover === 0);
    strokeRing(pm, '#c9b48a', false);
    strokeRing(pi, '#7ee0c8', selected === 1 || hover === 1);

    const tail = [
      project(0.85, 0.55, 0.15),
      project(1.05, 0.82, 0.05),
      project(1.22, 1.05, -0.05),
    ];
    ctx.beginPath();
    ctx.moveTo(tail[0][0], tail[0][1]);
    ctx.lineTo(tail[1][0], tail[1][1]);
    ctx.lineTo(tail[2][0], tail[2][1]);
    ctx.strokeStyle = selected === 2 || hover === 2 ? '#e8e4dc' : 'rgba(232,228,220,0.55)';
    ctx.lineWidth = Math.max(2.2, W / 260);
    ctx.stroke();

    const pathPts = [...po.slice(0, 12), tail[0], tail[1], tail[2]];
    const idx = Math.min(pathPts.length - 1, Math.floor(travel * (pathPts.length - 1)));
    const bead = pathPts[idx];
    ctx.fillStyle = '#7ee0c8';
    ctx.shadowColor = '#7ee0c8';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(bead[0], bead[1], Math.max(3.4, W / 200), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const core = project(0, 0, 0);
    ctx.fillStyle = '#e8e4dc';
    ctx.font = `600 ${Math.max(28, W / 22)}px "IBM Plex Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Q', core[0], core[1] + 2);
  };

  const pick = (clientX: number, clientY: number): LayerId | null => {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    if (x > 0.62 && y > 0.58) return 2;
    if (Math.hypot(x - 0.5, y - 0.5) < 0.18) return 1;
    if (Math.hypot(x - 0.5, y - 0.5) < 0.36) return 0;
    return null;
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
      ay = restAy + nx * 2 * orbit;
      ax = restAx + ny * 2 * orbit;
      if (reduced) {
        parx = nx * 12;
        pary = ny * 8;
      }
    }
    paintHint();
    if (!dragging) return;
    ay = Math.max(restAy - orbit, Math.min(restAy + orbit, ay + (ev.clientX - lastX) * 0.007));
    ax = Math.max(restAx - orbit, Math.min(restAx + orbit, ax + (ev.clientY - lastY) * 0.006));
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
