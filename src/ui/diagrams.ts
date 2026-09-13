import { photoFigure, plateFor } from '../data/plates';
import { esc } from './html';

const PHOTO_KINDS = new Set([
  'page',
  'proof',
  'chapter',
  'programme',
  'cbdc',
  'money',
  'event',
  'institution',
  'paper',
  'paper-primary',
  'paper-standards',
  'paper-book',
  'paper-survey',
  'paper-note',
  'news',
  'source',
  'stack',
  'tech',
]);

/** Kind-specific instrument objects. One seed, one beat — never a reused photograph. */

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
    { a: '#1557FF', b: '#0B1F5C', c: '#3D4A63' },
    { a: '#00A878', b: '#1557FF', c: '#0B1220' },
    { a: '#C45C00', b: '#1557FF', c: '#0B1F5C' },
    { a: '#3B2DFF', b: '#00A878', c: '#14203A' },
    { a: '#E23B2C', b: '#0B1F5C', c: '#3D4A63' },
    { a: '#0B1F5C', b: '#1557FF', c: '#00A878' },
  ];
  return palettes[hash(seed) % palettes.length];
}

function frame(uid: string, p: { a: string; b: string }, inner: string, title: string): string {
  const label = title
    ? `<text x="18" y="228" fill="#0B1F5C" font-size="11" font-family="Outfit, IBM Plex Sans, sans-serif" letter-spacing="1.8">${esc(title.slice(0, 42).toUpperCase())}</text>`
    : '';
  return `<svg class="beat-diagram stage-object" viewBox="0 0 320 240" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${p.b}" stop-opacity="0.28"/>
        <stop offset="1" stop-color="${p.a}" stop-opacity="0.08"/>
      </linearGradient>
    </defs>
    <rect width="320" height="240" fill="#ffffff"/>
    <rect x="8" y="8" width="304" height="224" rx="2" fill="none" stroke="rgba(11,31,92,0.14)" stroke-width="1"/>
    <rect x="12" y="12" width="296" height="216" fill="url(#${uid}g)"/>
    ${inner}
    ${label}
  </svg>`;
}

function personMotif(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const lanes = 3 + (h % 3);
  const bars = Array.from({ length: lanes }, (_, i) => {
    const y = 48 + i * 36;
    const w = 70 + ((h >> (i + 2)) % 90);
    return `<rect x="96" y="${y}" width="${w}" height="10" rx="1" fill="${i % 2 ? p.a : p.b}" opacity="${(0.35 + i * 0.12).toFixed(2)}"/>`;
  }).join('');
  const initials = esc((title || '·').slice(0, 3));
  return frame(
    uid,
    p,
    `<rect x="28" y="40" width="52" height="64" rx="2" fill="none" stroke="${p.a}" stroke-width="1.4"/>
     <text x="54" y="78" text-anchor="middle" fill="${p.c}" font-size="16" font-family="IBM Plex Sans, sans-serif" font-weight="600">${initials}</text>
     ${bars}
     <path d="M28 168 H292" stroke="rgba(11,31,92,0.14)" />
     <circle cx="${220 + (h % 40)}" cy="168" r="4" fill="${p.a}"/>`,
    title,
  );
}

function quoteObject(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<text x="28" y="92" fill="${p.a}" font-size="72" font-family="Source Serif 4, Georgia, serif">“</text>
     <rect x="88" y="64" width="196" height="3" fill="${p.b}" opacity="0.7"/>
     <rect x="88" y="80" width="160" height="2" fill="${p.c}" opacity="0.45"/>
     <rect x="88" y="94" width="128" height="2" fill="${p.c}" opacity="0.3"/>
     <text x="88" y="150" fill="${p.c}" font-size="11" font-family="IBM Plex Mono, monospace">${esc((title || 'LINE').slice(0, 22))}</text>`,
    title,
  );
}

function newsFrame(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const cols = 4 + (h % 3);
  const gutter = 8;
  const w = (268 - gutter * (cols - 1)) / cols;
  const cells = Array.from({ length: cols * 2 }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = 26 + c * (w + gutter);
    const y = 40 + r * 68;
    const hh = 28 + ((h >> i) % 24);
    return `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${hh}" fill="${i % 2 ? p.a : p.b}" opacity="${(0.18 + (i % 4) * 0.1).toFixed(2)}"/>`;
  }).join('');
  return frame(uid, p, `${cells}<rect x="26" y="186" width="80" height="6" fill="${p.a}"/>`, title);
}

function patentClaim(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const steps = ['LEDGER A', 'ORDER', 'LEDGER B'];
  const boxes = steps
    .map((s, i) => {
      const x = 28 + i * 94;
      const y = 70 + ((h >> i) % 12);
      return `<g>
        <rect x="${x}" y="${y}" width="78" height="52" fill="none" stroke="${i === 1 ? p.a : p.b}" stroke-width="1.4"/>
        <text x="${x + 39}" y="${y + 32}" text-anchor="middle" fill="${p.c}" font-size="9" font-family="IBM Plex Mono, monospace">${s}</text>
      </g>`;
    })
    .join('');
  return frame(
    uid,
    p,
    `${boxes}<path d="M106 96 H122 M200 96 H216" stroke="${p.a}" stroke-width="1.4" marker-end="none"/>
     <text x="28" y="50" fill="${p.a}" font-size="10" font-family="IBM Plex Mono, monospace">CLAIM SEQUENCE</text>`,
    title,
  );
}

function satpLock(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  const labels = ['0 VERIFY', '1 INIT', '2 LOCK', '3 2PC'];
  const nodes = labels
    .map((s, i) => {
      const x = 36 + i * 70;
      return `<g>
        <circle cx="${x}" cy="110" r="16" fill="none" stroke="${i === 3 ? p.a : p.b}" stroke-width="1.5"/>
        <text x="${x}" y="148" text-anchor="middle" fill="${p.c}" font-size="8" font-family="IBM Plex Mono, monospace">${s}</text>
      </g>`;
    })
    .join('');
  return frame(
    uid,
    p,
    `<path d="M52 110 H246" stroke="${p.a}" stroke-width="1.2" stroke-dasharray="4 6"/>${nodes}`,
    title,
  );
}

function techExplode(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const layers = 5;
  const bits = Array.from({ length: layers }, (_, i) => {
    const y = 46 + i * 28;
    const inset = 18 + i * 10 + (h % 8);
    return `<rect x="${inset}" y="${y}" width="${284 - inset * 2}" height="18" fill="none" stroke="${i % 2 ? p.a : p.b}" stroke-width="1.2" opacity="${(0.95 - i * 0.12).toFixed(2)}"/>`;
  }).join('');
  return frame(uid, p, bits, title);
}

function yearRoom(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const year = (title.match(/\d{4}/) || ['YEAR'])[0];
  return frame(
    uid,
    p,
    `<path d="M70 180 L70 70 L160 40 L250 70 L250 180 Z" fill="none" stroke="${p.b}" stroke-width="1.3"/>
     <path d="M70 70 L160 98 L250 70" fill="none" stroke="${p.a}" stroke-width="1.3"/>
     <path d="M160 98 V180" stroke="${p.c}" stroke-width="1" opacity="0.5"/>
     <rect x="${100 + (h % 20)}" y="120" width="28" height="36" fill="${p.a}" opacity="0.25"/>
     <text x="160" y="168" text-anchor="middle" fill="${p.c}" font-size="20" font-family="IBM Plex Sans, sans-serif" font-weight="600">${esc(year)}</text>`,
    title,
  );
}

function institutionNode(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const n = 5 + (h % 3);
  const dots = Array.from({ length: n }, (_, i) => {
    const a = ((h / 13 + i * (360 / n)) * Math.PI) / 180;
    const r = 48 + (i % 2) * 22;
    const x = 160 + Math.cos(a) * r;
    const y = 112 + Math.sin(a) * (r * 0.72);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 0 ? 6 : 3.5}" fill="${i % 2 ? p.a : p.b}"/>
            <line x1="160" y1="112" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${p.c}" stroke-opacity="0.25"/>`;
  }).join('');
  return frame(uid, p, `<circle cx="160" cy="112" r="8" fill="${p.a}"/>${dots}`, title);
}

function termPlate(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<rect x="36" y="56" width="248" height="120" fill="none" stroke="${p.a}" stroke-width="1.2"/>
     <text x="52" y="88" fill="${p.b}" font-size="10" font-family="IBM Plex Sans, sans-serif" letter-spacing="2">TERM</text>
     <text x="52" y="124" fill="${p.c}" font-size="16" font-family="IBM Plex Sans, sans-serif" font-weight="600">${esc((title || 'WORD').slice(0, 22))}</text>
     <rect x="52" y="142" width="140" height="2" fill="${p.a}"/>`,
    title,
  );
}

function programmeCockpit(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const gauges = Array.from({ length: 3 }, (_, i) => {
    const x = 48 + i * 88;
    const sweep = 40 + ((h >> i) % 80);
    return `<g transform="translate(${x} 88)">
      <circle r="28" fill="none" stroke="rgba(11,31,92,0.12)" stroke-width="6"/>
      <circle r="28" fill="none" stroke="${p.a}" stroke-width="6" stroke-dasharray="${sweep} 180" transform="rotate(-90)"/>
    </g>`;
  }).join('');
  return frame(uid, p, gauges, title);
}

function paperCover(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<rect x="88" y="36" width="144" height="168" fill="#F4F7FB" stroke="${p.b}" stroke-width="1.4"/>
     <rect x="100" y="52" width="120" height="4" fill="${p.a}"/>
     <rect x="100" y="66" width="88" height="3" fill="${p.c}" opacity="0.45"/>
     <rect x="100" y="78" width="104" height="3" fill="${p.c}" opacity="0.3"/>
     <text x="160" y="170" text-anchor="middle" fill="${p.c}" font-size="10" font-family="IBM Plex Mono, monospace">${esc((title || 'PAPER').slice(0, 12))}</text>`,
    title,
  );
}

function paperPrimary(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<rect x="54" y="40" width="212" height="148" fill="#F4F7FB" stroke="${p.a}" stroke-width="1.6"/>
     <path d="M54 40 H266 L248 56 H72 Z" fill="${p.a}" opacity="0.18"/>
     <text x="160" y="118" text-anchor="middle" fill="${p.b}" font-size="13" font-family="Outfit, sans-serif" font-weight="700">PRIMARY</text>
     <text x="160" y="168" text-anchor="middle" fill="${p.c}" font-size="9" font-family="IBM Plex Mono, monospace">${esc((title || 'SOURCE').slice(0, 16))}</text>`,
    title,
  );
}

function paperStandards(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<rect x="36" y="44" width="248" height="152" fill="none" stroke="${p.b}" stroke-width="1.5"/>
     <path d="M36 68 H284" stroke="${p.a}" stroke-width="8"/>
     <text x="48" y="64" fill="#ffffff" font-size="10" font-family="IBM Plex Mono, monospace">IETF / ISO</text>
     <rect x="48" y="88" width="160" height="3" fill="${p.b}"/>
     <rect x="48" y="104" width="200" height="2" fill="${p.c}" opacity="0.4"/>
     <rect x="48" y="118" width="132" height="2" fill="${p.c}" opacity="0.3"/>
     <text x="48" y="168" fill="${p.a}" font-size="10" font-family="IBM Plex Mono, monospace">${esc((title || 'DRAFT').slice(0, 18))}</text>`,
    title,
  );
}

function paperBook(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<path d="M70 50 V190 C120 176 140 176 160 190 C180 176 200 176 250 190 V50 C200 64 180 64 160 50 C140 64 120 64 70 50 Z" fill="none" stroke="${p.a}" stroke-width="1.6"/>
     <path d="M160 50 V190" stroke="${p.b}"/>
     <text x="160" y="124" text-anchor="middle" fill="${p.c}" font-size="11" font-family="Source Serif 4, Georgia, serif">${esc((title || 'BOOK').slice(0, 14))}</text>`,
    title,
  );
}

function paperSurvey(uid: string, p: { a: string; b: string; c: string }, h: number, title: string): string {
  const cells = Array.from({ length: 6 }, (_, i) => {
    const x = 40 + (i % 3) * 86;
    const y = 48 + Math.floor(i / 3) * 72;
    return `<rect x="${x}" y="${y}" width="74" height="58" fill="none" stroke="${i === h % 6 ? p.a : p.b}" stroke-width="1.3"/>`;
  }).join('');
  return frame(uid, p, `${cells}<text x="160" y="220" text-anchor="middle" fill="${p.c}" font-size="9" font-family="IBM Plex Mono, monospace">${esc((title || 'SURVEY').slice(0, 14))}</text>`, title);
}

function paperNote(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<rect x="48" y="46" width="224" height="140" fill="#FFF8F0" stroke="${p.a}" stroke-width="1.3"/>
     <path d="M48 70 H272" stroke="${p.b}" stroke-dasharray="4 5"/>
     <text x="62" y="64" fill="${p.a}" font-size="10" font-family="IBM Plex Mono, monospace">FILED NOTE</text>
     <rect x="62" y="88" width="168" height="3" fill="${p.c}" opacity="0.45"/>
     <rect x="62" y="104" width="140" height="3" fill="${p.c}" opacity="0.3"/>
     <text x="62" y="160" fill="${p.b}" font-size="11" font-family="Outfit, sans-serif">${esc((title || 'NOTE').slice(0, 18))}</text>`,
    title,
  );
}

function moneyFlow(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  const labs = ['ISSUE', 'WHOLESALE', 'RETAIL / TCBM'];
  const nodes = labs
    .map((s, i) => `<g>
      <rect x="${28 + i * 94}" y="88" width="82" height="40" fill="none" stroke="${p.a}" stroke-width="1.2"/>
      <text x="${69 + i * 94}" y="112" text-anchor="middle" fill="${p.c}" font-size="8" font-family="IBM Plex Mono, monospace">${s}</text>
    </g>`)
    .join('');
  return frame(uid, p, `${nodes}<path d="M110 108 H122 M204 108 H216" stroke="${p.b}"/>`, title);
}

function sourceDoor(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<path d="M110 40 V188 H210 V40 Z" fill="none" stroke="${p.b}" stroke-width="1.4"/>
     <path d="M118 48 V180 H202 V48 Z" fill="${p.a}" opacity="0.08"/>
     <circle cx="190" cy="118" r="3" fill="${p.a}"/>`,
    title,
  );
}

function proofMarks(uid: string, p: { a: string; b: string; c: string }, title: string): string {
  return frame(
    uid,
    p,
    `<rect x="32" y="70" width="72" height="72" fill="none" stroke="${p.a}"/>
     <rect x="124" y="54" width="72" height="88" fill="none" stroke="${p.b}"/>
     <rect x="216" y="78" width="72" height="64" fill="none" stroke="${p.c}"/>`,
    title,
  );
}

export function diagramSvg(seed: string, kind: string, title = ''): string {
  const h = hash(`${kind}:${seed}`);
  const p = palette(`${kind}:${seed}`);
  const uid = `d${h.toString(16)}`;
  switch (kind) {
    case 'person':
      return personMotif(uid, p, h, title);
    case 'quote':
      return quoteObject(uid, p, title);
    case 'news':
    case 'source':
      return kind === 'news' ? newsFrame(uid, p, h, title) : sourceDoor(uid, p, title);
    case 'patent':
      return patentClaim(uid, p, h, title);
    case 'satp':
      return satpLock(uid, p, title);
    case 'tech':
    case 'stack':
    case 'chapter':
      return techExplode(uid, p, h, title);
    case 'event':
      return yearRoom(uid, p, h, title);
    case 'institution':
      return institutionNode(uid, p, h, title);
    case 'term':
      return termPlate(uid, p, title);
    case 'programme':
      return programmeCockpit(uid, p, h, title);
    case 'paper':
      return paperCover(uid, p, title);
    case 'paper-primary':
      return paperPrimary(uid, p, title);
    case 'paper-standards':
      return paperStandards(uid, p, title);
    case 'paper-patent':
      return patentClaim(uid, p, h, title);
    case 'paper-book':
      return paperBook(uid, p, title);
    case 'paper-survey':
      return paperSurvey(uid, p, h, title);
    case 'paper-note':
      return paperNote(uid, p, title);
    case 'money':
    case 'cbdc':
      return moneyFlow(uid, p, title);
    case 'proof':
      return proofMarks(uid, p, title);
    default:
      return techExplode(uid, p, h, title);
  }
}

export function diagramFigure(seed: string, kind: string, title: string): string {
  if (PHOTO_KINDS.has(kind) || kind.startsWith('paper-')) {
    const plate = plateFor(seed, kind, title);
    return `<figure class="beat-figure photo-plate cinema-frame" data-beat="${esc(seed)}" data-kind="${esc(kind)}">
      <img src="${plate.src}" alt="${plate.alt}" width="1280" height="720" loading="lazy" decoding="async" />
      <figcaption>${plate.credit}</figcaption>
    </figure>`;
  }
  return `<figure class="beat-figure" data-beat="${esc(seed)}" data-kind="${esc(kind)}">${diagramSvg(seed, kind, title)}</figure>`;
}

export function topicFigure(...keys: Array<string | undefined | null>): string {
  return photoFigure(plateFor(...keys));
}
