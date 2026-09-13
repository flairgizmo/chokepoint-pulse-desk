/** Immediate 2D sterling corridor — no Three.js. The hero paints before WebGL loads. */

export type NodeId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const BANKS: Array<{ id: NodeId; name: string; short: string; note: string }> = [
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

export const MARK: Record<string, string> = {
  Barclays: '/marks/barclays.svg',
  HSBC: '/marks/hsbc.svg',
  'Lloyds Banking Group': '/marks/lloyds.svg',
  NatWest: '/marks/natwest.svg',
  Nationwide: '/marks/nationwide.svg',
  Santander: '/marks/santander.svg',
};

export const GATE: { id: NodeId; name: string; note: string } = {
  id: 6,
  name: 'Overledger',
  note: 'Gateway OS. Maps a lock-and-release across the six books. Not a seventh chain. Whitepaper, UCL Discovery, 2018.',
};

export const RTGS: { id: NodeId; name: string; note: string } = {
  id: 7,
  name: 'Simulated RT2',
  note: 'Bank of England Synchronisation Lab, February 2026. Simulated RT2. Not live RTGS. Not a Quant endorsement.',
};

export function bankXYZ(i: number, pulse: number): [number, number, number] {
  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
  const r = 1.18 + pulse;
  return [Math.cos(a) * r, 0.04 + Math.sin(a) * 0.04, Math.sin(a) * r];
}

export function paintHint(canvas: HTMLCanvasElement, selected: NodeId | null, hover: NodeId | null): void {
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

export function remountCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const next = canvas.cloneNode(false) as HTMLCanvasElement;
  next.id = canvas.id;
  next.className = canvas.className;
  next.setAttribute('role', canvas.getAttribute('role') || 'img');
  const label = canvas.getAttribute('aria-label');
  if (label) next.setAttribute('aria-label', label);
  delete next.dataset.engine;
  canvas.replaceWith(next);
  return next;
}

export function mountGateway2D(canvas: HTMLCanvasElement): () => void {
  canvas.dataset.engine = 'canvas2d';
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
  const backdrop = new Image();
  backdrop.onload = () => {
    plateDirty = true;
    draw(performance.now());
  };
  backdrop.src = '/visuals/topics/canary.jpg';
  const plate = document.createElement('canvas');
  let plateDirty = true;

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
    plateDirty = true;
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

    if (plateDirty || plate.width !== W || plate.height !== H) {
      plate.width = W;
      plate.height = H;
      const pctx = plate.getContext('2d');
      if (pctx) {
        pctx.fillStyle = '#070b14';
        pctx.fillRect(0, 0, W, H);
        if (backdrop.complete && backdrop.naturalWidth) {
          const scale = Math.max(W / backdrop.naturalWidth, H / backdrop.naturalHeight);
          const dw = backdrop.naturalWidth * scale;
          const dh = backdrop.naturalHeight * scale;
          pctx.save();
          pctx.globalAlpha = 0.62;
          pctx.filter = 'saturate(0.85) contrast(1.15) blur(1.2px)';
          pctx.drawImage(backdrop, (W - dw) / 2, (H - dh) / 2 - H * 0.06, dw, dh);
          pctx.restore();
          pctx.filter = 'none';
        }
        const studio = pctx.createRadialGradient(W * 0.5, H * 0.36, 16, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
        studio.addColorStop(0, 'rgba(26, 48, 88, 0.28)');
        studio.addColorStop(0.45, 'rgba(10, 18, 32, 0.72)');
        studio.addColorStop(1, 'rgba(5, 8, 16, 0.92)');
        pctx.fillStyle = studio;
        pctx.fillRect(0, 0, W, H);
      }
      plateDirty = false;
    }
    ctx.drawImage(plate, 0, 0);

    ctx.save();
    ctx.translate(gate[0], gate[1] + H * 0.14);
    ctx.scale(1, 0.26);
    const floor = ctx.createRadialGradient(0, 0, 8, 0, 0, Math.min(W, H) * 0.62);
    floor.addColorStop(0, 'rgba(234, 241, 255, 0.22)');
    floor.addColorStop(0.4, 'rgba(21, 87, 255, 0.16)');
    floor.addColorStop(1, 'rgba(5, 8, 16, 0)');
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(W, H) * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(234, 241, 255, 0.08)';
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
      const spoke = ctx.createLinearGradient(gate[0], gate[1], p[0], p[1]);
      spoke.addColorStop(0, 'rgba(90, 150, 255, 0.72)');
      spoke.addColorStop(1, 'rgba(21, 87, 255, 0.05)');
      ctx.beginPath();
      ctx.moveTo(gate[0], gate[1]);
      ctx.lineTo(p[0], p[1]);
      ctx.strokeStyle = spoke;
      ctx.lineWidth = Math.max(1.6, W / 380);
      ctx.stroke();
    });

    ctx.beginPath();
    hex.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt[0], pt[1]);
      else ctx.lineTo(pt[0], pt[1]);
    });
    ctx.closePath();
    const hexFill = ctx.createLinearGradient(hex[0][0], hex[0][1], hex[3][0], hex[3][1]);
    hexFill.addColorStop(0, selected === 6 || hover === 6 ? '#7EB0FF' : '#3B7BFF');
    hexFill.addColorStop(0.55, '#1557FF');
    hexFill.addColorStop(1, '#061433');
    ctx.shadowColor = 'rgba(61, 140, 255, 0.7)';
    ctx.shadowBlur = 42;
    ctx.fillStyle = hexFill;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#EAF1FF';
    ctx.lineWidth = selected === 6 || hover === 6 ? Math.max(2.8, W / 190) : Math.max(1.8, W / 260);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(gate[0], gate[1]);
    ctx.lineTo(rt2[0], rt2[1]);
    ctx.strokeStyle = 'rgba(234, 241, 255, 0.28)';
    ctx.setLineDash([6, 7]);
    ctx.lineWidth = Math.max(1.2, W / 420);
    ctx.stroke();
    ctx.setLineDash([]);

    const onRt = selected === 7 || hover === 7;
    ctx.beginPath();
    ctx.arc(rt2[0], rt2[1], Math.max(16, W / 42), 0, Math.PI * 2);
    ctx.fillStyle = onRt ? 'rgba(0, 168, 120, 0.18)' : 'rgba(0, 168, 120, 0.08)';
    ctx.fill();
    ctx.strokeStyle = onRt ? '#00A878' : 'rgba(234, 241, 255, 0.55)';
    ctx.lineWidth = onRt ? 2.4 : 1.5;
    ctx.stroke();
    ctx.fillStyle = '#EAF1FF';
    ctx.font = `600 ${Math.max(9, W / 72)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SIM RT2', rt2[0], rt2[1]);

    banks.forEach(({ bank, p }, i) => {
      const on = selected === bank.id || hover === bank.id;
      const rw = Math.max(86, W / 8.2);
      const rh = Math.max(36, W / 22);
      ctx.shadowColor = on ? 'rgba(21, 87, 255, 0.38)' : 'rgba(11, 31, 92, 0.16)';
      ctx.shadowBlur = on ? 28 : 18;
      ctx.shadowOffsetY = 8;
      roundRect(p[0] - rw / 2, p[1] - rh / 2, rw, rh, 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
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

    ctx.fillStyle = '#FFFFFF';
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
    ctx.fillStyle = '#EAF1FF';
    ctx.font = `600 ${Math.max(8, W / 80)}px "IBM Plex Mono", ui-monospace, monospace`;
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
  draw(performance.now());
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
