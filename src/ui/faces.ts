/** Official published portraits only. Punch studio-white fields; never invent a face. */

export function looksCutout(img: HTMLImageElement): boolean {
  const s = document.createElement('canvas');
  s.width = 8;
  s.height = 8;
  const probe = s.getContext('2d', { willReadFrequently: true });
  if (!probe || !img.naturalWidth) return false;
  probe.drawImage(img, 0, 0, 8, 8);
  const d = probe.getImageData(0, 0, 8, 8).data;
  let bright = 0;
  for (const i of [0, 7, 56, 63]) {
    const o = i * 4;
    if (d[o] > 200 && d[o + 1] > 200 && d[o + 2] > 200) bright += 1;
  }
  return bright >= 3;
}

export function punchStudioWhite(img: HTMLImageElement, dw: number, dh: number): HTMLCanvasElement {
  const tmp = document.createElement('canvas');
  tmp.width = Math.max(1, Math.round(dw));
  tmp.height = Math.max(1, Math.round(dh));
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!tctx) return tmp;
  tctx.drawImage(img, 0, 0, tmp.width, tmp.height);
  const data = tctx.getImageData(0, 0, tmp.width, tmp.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    if (r > 228 && g > 228 && b > 228) {
      px[i + 3] = 0;
    } else if (r > 200 && g > 200 && b > 200) {
      const t = (Math.min(r, g, b) - 200) / 28;
      px[i + 3] = Math.round(px[i + 3] * (1 - t));
    }
  }
  tctx.putImageData(data, 0, 0);
  return tmp;
}

function punchFaceImg(img: HTMLImageElement): void {
  if (img.dataset.punched === '1' || !img.naturalWidth) return;
  if (!looksCutout(img)) {
    img.dataset.punched = '1';
    return;
  }
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const cut = punchStudioWhite(img, w, h);
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(cut, 0, 0);
  img.dataset.punched = '1';
  img.src = out.toDataURL('image/jpeg', 0.92);
}

/** Composite studio-white official crops onto dusk. Markup src stays the published file until load. */
export function hydrateFaces(root: ParentNode): void {
  root.querySelectorAll<HTMLImageElement>('img.people-face').forEach((img) => {
    const run = (): void => punchFaceImg(img);
    if (img.complete && img.naturalWidth) run();
    else img.addEventListener('load', run, { once: true });
  });
}
