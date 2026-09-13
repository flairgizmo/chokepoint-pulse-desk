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

/** Distinct Wikimedia stills — one per issuer, not six copies of Canary. */
export const CARD_STILL = [
  '/visuals/topics/canary.jpg',
  '/visuals/stories/city.jpg',
  '/visuals/topics/payments.jpg',
  '/visuals/topics/city.jpg',
  '/visuals/stills/sterling.jpg',
  '/visuals/stories/canary.jpg',
] as const;

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
  if (canvas.dataset.filmSet) next.dataset.filmSet = canvas.dataset.filmSet;
  canvas.replaceWith(next);
  return next;
}

export function mountGateway2D(canvas: HTMLCanvasElement): () => void {
  canvas.dataset.engine = 'canvas2d';
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  const restAx = 1.24;
  const restAy = 0.44;
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
  const stills = CARD_STILL.map((src) => {
    const img = new Image();
    img.onload = () => draw(performance.now());
    img.src = src;
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
    const k = 2.15 / (3.15 - z1);
    const { width: W, height: H } = canvas;
    const scale = Math.min(W, H) * 0.42;
    return [W / 2 + x1 * k * scale + parx, H * 0.62 + y1 * k * scale + pary, z1];
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
    const rt2 = project(0, -1.12, 0);
    projected.push({ id: 7, x: rt2[0], y: rt2[1], z: rt2[2] });

    if (plateDirty || plate.width !== W || plate.height !== H) {
      plate.width = W;
      plate.height = H;
      const pctx = plate.getContext('2d');
      if (pctx) {
        pctx.fillStyle = '#070b14';
        pctx.fillRect(0, 0, W, H);
        if (backdrop.complete && backdrop.naturalWidth) {
          const scale = Math.max(W / backdrop.naturalWidth, H / backdrop.naturalHeight) * 1.18;
          const dw = backdrop.naturalWidth * scale;
          const dh = backdrop.naturalHeight * scale;
          const dx = (W - dw) / 2;
          const dy = (H - dh) / 2 - H * 0.2;
          pctx.drawImage(backdrop, dx, dy, dw, dh);
          pctx.save();
          pctx.beginPath();
          pctx.rect(0, H * 0.58, W, H * 0.42);
          pctx.clip();
          pctx.translate(0, H * 1.22);
          pctx.scale(1, -0.42);
          pctx.globalAlpha = 0.38;
          pctx.filter = 'blur(1.2px)';
          pctx.drawImage(backdrop, dx, dy, dw, dh);
          pctx.restore();
        }
        const fade = pctx.createLinearGradient(0, 0, 0, H);
        fade.addColorStop(0, 'rgba(6, 10, 20, 0.04)');
        fade.addColorStop(0.32, 'rgba(6, 10, 20, 0.08)');
        fade.addColorStop(0.54, 'rgba(6, 10, 20, 0.28)');
        fade.addColorStop(0.7, 'rgba(6, 10, 20, 0.62)');
        fade.addColorStop(1, 'rgba(6, 10, 20, 0.88)');
        pctx.fillStyle = fade;
        pctx.fillRect(0, 0, W, H);
        const vignette = pctx.createRadialGradient(W * 0.5, H * 0.38, H * 0.1, W * 0.5, H * 0.48, Math.max(W, H) * 0.74);
        vignette.addColorStop(0, 'rgba(21, 87, 255, 0.05)');
        vignette.addColorStop(1, 'rgba(4, 8, 16, 0.38)');
        pctx.fillStyle = vignette;
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

    const onGate = selected === 6 || hover === 6;
    const cx = gate[0];
    const cy = gate[1] - Math.max(28, H * 0.05);
    const crystalW = Math.max(34, W * 0.046);
    const crystalH = Math.max(96, H * 0.28);
    ctx.save();
    ctx.shadowColor = 'rgba(61, 123, 255, 0.7)';
    ctx.shadowBlur = onGate ? 36 : 22;
    ctx.beginPath();
    ctx.moveTo(cx - crystalW, cy);
    ctx.lineTo(cx, cy - crystalH * 0.14);
    ctx.lineTo(cx, cy + crystalH);
    ctx.lineTo(cx - crystalW, cy + crystalH * 0.86);
    ctx.closePath();
    ctx.fillStyle = onGate ? '#1557FF' : '#0d3fd4';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + crystalW, cy);
    ctx.lineTo(cx, cy - crystalH * 0.14);
    ctx.lineTo(cx, cy + crystalH);
    ctx.lineTo(cx + crystalW, cy + crystalH * 0.86);
    ctx.closePath();
    ctx.fillStyle = onGate ? '#9CC4FF' : '#5B93FF';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cx, cy - crystalH * 0.14);
    ctx.lineTo(cx + crystalW, cy);
    ctx.lineTo(cx, cy + crystalH * 0.1);
    ctx.lineTo(cx - crystalW, cy);
    ctx.closePath();
    ctx.fillStyle = '#EAF1FF';
    ctx.globalAlpha = 0.55;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(234, 241, 255, 0.75)';
    ctx.lineWidth = Math.max(1.4, W / 420);
    ctx.beginPath();
    ctx.moveTo(cx - crystalW, cy);
    ctx.lineTo(cx, cy - crystalH * 0.14);
    ctx.lineTo(cx + crystalW, cy);
    ctx.lineTo(cx + crystalW, cy + crystalH * 0.86);
    ctx.lineTo(cx, cy + crystalH);
    ctx.lineTo(cx - crystalW, cy + crystalH * 0.86);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#F4F7FB';
    ctx.font = `800 ${Math.max(22, W / 28)}px Outfit, "IBM Plex Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Q', cx, cy + crystalH * 0.36);
    ctx.restore();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `800 ${Math.max(12, W / 46)}px Outfit, "IBM Plex Sans", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('OVERLEDGER', cx, cy - crystalH * 0.22);

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

    const paintCard = (bank: (typeof BANKS)[number], p: [number, number, number], i: number, reflect = false): void => {
      const on = selected === bank.id || hover === bank.id;
      const depth = 0.82 + Math.max(0, p[2] + 0.55) * 0.22;
      const rw = Math.max(132, W / 6.1) * depth;
      const rh = Math.max(92, W / 9.4) * depth;
      const yaw = (p[0] - W / 2) / Math.max(1, W * 0.62);
      ctx.save();
      if (reflect) {
        ctx.globalAlpha = 0.16;
        ctx.translate(p[0], p[1] + rh * 1.05);
        ctx.scale(1, -0.38);
        ctx.translate(-p[0], -p[1]);
      }
      ctx.translate(p[0], p[1]);
      ctx.transform(1, 0, yaw * 0.18, 0.94 + depth * 0.06, 0, 0);
      if (!reflect) {
        ctx.shadowColor = on ? 'rgba(90, 150, 255, 0.5)' : 'rgba(5, 10, 20, 0.55)';
        ctx.shadowBlur = on ? 28 : 18;
        ctx.shadowOffsetY = 12;
      }
      ctx.fillStyle = '#05070c';
      roundRect(-rw / 2 + 5, -rh / 2 + 8, rw, rh, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      roundRect(-rw / 2, -rh / 2, rw, rh, 12);
      ctx.fillStyle = '#0b1220';
      ctx.fill();
      const still = stills[i];
      if (still?.complete && still.naturalWidth) {
        ctx.save();
        ctx.clip();
        ctx.filter = 'saturate(1.16) contrast(1.1) brightness(0.86)';
        const scale = Math.max(rw / still.naturalWidth, rh / still.naturalHeight);
        const dw = still.naturalWidth * scale;
        const dh = still.naturalHeight * scale;
        ctx.drawImage(still, -dw / 2, -dh / 2, dw, dh);
        ctx.filter = 'none';
        ctx.restore();
        roundRect(-rw / 2, -rh / 2, rw, rh, 12);
      }
      ctx.fillStyle = on ? 'rgba(7, 11, 20, 0.28)' : 'rgba(7, 11, 20, 0.46)';
      ctx.fillRect(-rw / 2, rh / 2 - rh * 0.46, rw, rh * 0.46);
      ctx.strokeStyle = on ? '#1557FF' : 'rgba(234, 241, 255, 0.18)';
      ctx.lineWidth = on ? 2.4 : 1.2;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const logo = logos[i];
      const wide = Boolean(logo && logo.naturalWidth / Math.max(1, logo.naturalHeight) > 6);
      const pw = rw * 0.58;
      const ph = rh * 0.22;
      ctx.fillStyle = on ? '#ffffff' : '#f4f7fb';
      roundRect(-pw / 2, -rh * 0.18, pw, ph, 8);
      ctx.fill();
      if (logo?.complete && logo.naturalWidth && !wide) {
        const maxW = pw - 16;
        const maxH = ph - 10;
        const scale = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight);
        const dw = logo.naturalWidth * scale;
        const dh = logo.naturalHeight * scale;
        ctx.drawImage(logo, -dw / 2, -rh * 0.18 + (ph - dh) / 2, dw, dh);
      } else {
        ctx.fillStyle = '#0B1F5C';
        ctx.font = `800 ${Math.max(13, W / 48)}px Outfit, "IBM Plex Sans", system-ui, sans-serif`;
        ctx.fillText(wide ? 'Lloyds' : bank.short, 0, -rh * 0.18 + ph / 2);
      }
      const label = bank.name === 'Lloyds Banking Group' ? 'Lloyds' : bank.name;
      ctx.fillStyle = '#F4F7FB';
      ctx.font = `800 ${Math.max(13, W / (label.length > 10 ? 48 : 42))}px Outfit, "IBM Plex Sans", system-ui, sans-serif`;
      ctx.fillText(label, 0, rh * 0.22);
      ctx.fillStyle = 'rgba(234, 241, 255, 0.7)';
      ctx.font = `600 ${Math.max(8, W / 78)}px Outfit, "IBM Plex Sans", system-ui, sans-serif`;
      ctx.fillText('GBTD issuer', 0, rh * 0.36);
      ctx.restore();
    };
    const ordered = banks
      .map((row, i) => ({ ...row, i }))
      .sort((a, b) => a.p[2] - b.p[2]);
    ordered.forEach((row) => paintCard(row.bank, row.p, row.i, true));
    ordered.forEach((row) => paintCard(row.bank, row.p, row.i));

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
