import { esc } from './html';

/** Deterministic unique SVG per narrative beat. Never reuse a photograph as filler. */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function palette(seed: string): { a: string; b: string; c: string } {
  const palettes = [
    { a: '#7ee0c8', b: '#8b7cff', c: '#d8d2c4' },
    { a: '#8b7cff', b: '#7ee0c8', c: '#e4ddd0' },
    { a: '#c9b48a', b: '#7ee0c8', c: '#9aa3b5' },
    { a: '#7ea7ff', b: '#8b7cff', c: '#d8d2c4' },
    { a: '#7ee0c8', b: '#c9b48a', c: '#8b7cff' },
    { a: '#9aa3b5', b: '#7ee0c8', c: '#8b7cff' },
  ];
  return palettes[hash(seed) % palettes.length];
}

export function diagramSvg(seed: string, kind: string, title = ''): string {
  const h = hash(`${kind}:${seed}`);
  const p = palette(`${kind}:${seed}`);
  const uid = `d${h.toString(16)}`;
  const rot = (h % 28) - 14;
  const gap = 18 + (h % 16);
  const n = 4 + (h % 5);
  const rings = Array.from({ length: n }, (_, i) => {
    const r = 22 + i * (10 + (h % 5));
    const op = (0.22 + i * 0.1).toFixed(2);
    return `<circle cx="160" cy="100" r="${r}" fill="none" stroke="${i % 2 ? p.a : p.b}" stroke-opacity="${op}" stroke-width="${i === n - 1 ? 2.2 : 1.1}"/>`;
  }).join('');
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = ((h / 17 + i * (360 / n)) * Math.PI) / 180;
    const r = 34 + (i % 3) * 18;
    const x = 160 + Math.cos(a) * r;
    const y = 100 + Math.sin(a) * (r * 0.62);
    return `<rect x="${(x - 5).toFixed(1)}" y="${(y - 5).toFixed(1)}" width="10" height="10" rx="2" fill="${i % 2 ? p.a : p.b}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }).join('');
  const path = `M ${40 + (h % 20)} ${150 - (h % 30)} C ${90 + gap} ${30 + (h % 40)}, ${180} ${20 + (h % 50)}, ${280 - (h % 24)} ${40 + (h % 70)}`;
  const label = title ? `<text x="20" y="188" fill="#d8d2c4" font-size="11" font-family="IBM Plex Sans, sans-serif" letter-spacing="1.6">${esc(title.toUpperCase())}</text>` : '';
  return `<svg class="beat-diagram" viewBox="0 0 320 200" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${p.b}" stop-opacity="0.35"/>
        <stop offset="1" stop-color="${p.a}" stop-opacity="0.12"/>
      </linearGradient>
      <filter id="${uid}f"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <rect width="320" height="200" fill="#12151a"/>
    <rect x="8" y="8" width="304" height="184" rx="16" fill="url(#${uid}g)"/>
    <ellipse cx="210" cy="54" rx="70" ry="28" fill="${p.a}" opacity="0.12" filter="url(#${uid}f)"/>
    <g transform="translate(0 0)">${rings}${nodes}</g>
    <path d="${path}" fill="none" stroke="${p.a}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="${path}" fill="none" stroke="${p.c}" stroke-width="0.6" stroke-dasharray="3 7"/>
    ${label}
  </svg>`;
}

export function diagramFigure(seed: string, kind: string, title: string): string {
  return `<figure class="beat-figure" data-beat="${esc(seed)}">${diagramSvg(seed, kind, title)}</figure>`;
}
