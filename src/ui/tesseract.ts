/** Interactive 4D tesseract — the QntDesk mark, drawn live. */

export function mountTesseract(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let ax = 0.42;
  let ay = 0.31;
  let aw = 0.18;
  let spin = reduced ? 0 : 0.004;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const verts: Array<[number, number, number, number]> = [];
  for (let i = 0; i < 16; i += 1) {
    verts.push([
      i & 1 ? 1 : -1,
      i & 2 ? 1 : -1,
      i & 4 ? 1 : -1,
      i & 8 ? 1 : -1,
    ]);
  }
  const edges: Array<[number, number]> = [];
  for (let a = 0; a < 16; a += 1) {
    for (let b = a + 1; b < 16; b += 1) {
      let d = 0;
      for (let k = 0; k < 4; k += 1) if (verts[a][k] !== verts[b][k]) d += 1;
      if (d === 1) edges.push([a, b]);
    }
  }

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
  };

  const project = (v: [number, number, number, number]): [number, number] => {
    let [x, y, z, w] = v;
    const cx = Math.cos(ax);
    const sx = Math.sin(ax);
    const cy = Math.cos(ay);
    const sy = Math.sin(ay);
    const cw = Math.cos(aw);
    const sw = Math.sin(aw);
    let y2 = y * cx - z * sx;
    let z2 = y * sx + z * cx;
    y = y2;
    z = z2;
    let x2 = x * cy - z * sy;
    z2 = x * sy + z * cy;
    x = x2;
    z = z2;
    x2 = x * cw - w * sw;
    const w2 = x * sw + w * cw;
    x = x2;
    w = w2;
    const k = 1.55 / (3.15 - w);
    return [x * k, y * k];
  };

  const draw = (): void => {
    const { width: W, height: H } = canvas;
    ctx.clearRect(0, 0, W, H);
    const scale = Math.min(W, H) * 0.28;
    const pts = verts.map((v) => {
      const [x, y] = project(v);
      return [W / 2 + x * scale, H / 2 + y * scale] as [number, number];
    });
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(77, 180, 255, 0.55)';
    ctx.shadowBlur = Math.max(8, W / 90);
    for (let i = 0; i < edges.length; i += 1) {
      const [a, b] = edges[i];
      const g = ctx.createLinearGradient(pts[a][0], pts[a][1], pts[b][0], pts[b][1]);
      g.addColorStop(0, 'rgba(77, 180, 255, 0.92)');
      g.addColorStop(1, 'rgba(140, 90, 255, 0.92)');
      ctx.strokeStyle = g;
      ctx.lineWidth = Math.max(1.4, W / 380);
      ctx.beginPath();
      ctx.moveTo(pts[a][0], pts[a][1]);
      ctx.lineTo(pts[b][0], pts[b][1]);
      ctx.stroke();
    }
    ctx.shadowBlur = Math.max(10, W / 70);
    ctx.fillStyle = '#9ee7ff';
    for (const [x, y] of pts) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2.4, W / 260), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };

  const tick = (): void => {
    if (spin) {
      ay += spin;
      aw += spin * 0.7;
    }
    draw();
    raf = requestAnimationFrame(tick);
  };

  const onDown = (ev: PointerEvent): void => {
    dragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev: PointerEvent): void => {
    if (!dragging) return;
    ay += (ev.clientX - lastX) * 0.008;
    ax += (ev.clientY - lastY) * 0.008;
    lastX = ev.clientX;
    lastY = ev.clientY;
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onClick = (): void => {
    if (reduced) return;
    spin = spin ? 0 : 0.01;
  };

  resize();
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
