import sourcesJson from './sources.json';
import chaptersJson from './chapters.json';
import libraryJson from './library.json';
import dykJson from './dyk.json';
import quotesJson from './quotes.json';

export const sources = sourcesJson as Record<string, string>;

export interface Chapter {
  id: string;
  kicker: string;
  title: string;
  body: string;
  page: string;
}

export interface Paper {
  id: string;
  title: string;
  year: string;
  venue: string;
  kind: string;
  hrefKey: string;
  authors: string[];
  lede: string;
}

export interface DidYouKnow {
  id: string;
  category: string;
  q: string;
  a: string;
  cta: string;
  to: string;
}

export interface Quote {
  id: string;
  who: string;
  role: string;
  text: string;
  href: string;
  page: string;
  also?: string[];
  personId?: string;
  note?: string;
}

export type PaperRegion = 'UK' | 'US' | 'EU' | 'Standards' | 'Patents' | 'INTL';

export const chapters = chaptersJson as Chapter[];
export const papers = libraryJson as Paper[];
export const didYouKnow = dykJson as DidYouKnow[];
export const quotes = quotesJson as Quote[];

export function sourceUrl(key: string): string {
  return sources[key] ?? key;
}

export function chaptersFor(page: string): Chapter[] {
  return chapters.filter((c) => c.page === page);
}

export function paperById(id: string): Paper | undefined {
  return papers.find((p) => p.id === id);
}

const FEATURED_PAPER_IDS = [
  'overledger-2018',
  'acm-3564532',
  'tasca-iov',
  'dlt-options',
  'three-layer',
  'satp-core',
];

export function featuredPapers(): Paper[] {
  return FEATURED_PAPER_IDS.map((id) => paperById(id)).filter((p): p is Paper => Boolean(p));
}

export function quotesFor(page?: string): Quote[] {
  if (!page) return quotes;
  return quotes.filter((q) => q.page === page || q.also?.includes(page));
}

export function quotesForPerson(personId: string): Quote[] {
  return quotes.filter((q) => q.personId === personId);
}

/** Latest-first key from a paper year string such as "2018", "2018–2019", "ongoing". */
export function paperYearKey(p: Paper): number {
  if (/ongoing/i.test(p.year)) return 2026.9;
  const nums = p.year.match(/\d{4}/g);
  return nums ? Number(nums[nums.length - 1]) : 0;
}

export function papersNewestFirst(list = papers): Paper[] {
  return [...list].sort((a, b) => paperYearKey(b) - paperYearKey(a) || a.title.localeCompare(b.title));
}

export function paperRegions(p: Paper): PaperRegion[] {
  const hay = `${p.venue} ${p.kind} ${p.authors.join(' ')} ${p.title}`.toLowerCase();
  const out = new Set<PaperRegion>();
  if (p.kind === 'patent' || /patent|uspto|jpo/.test(hay)) out.add('Patents');
  if (p.kind === 'standards' || /\bietf\b|\biso\b|satp|odap/.test(hay)) out.add('Standards');
  if (/ucl|uk finance|bank of england|london|kings|king’s|quant|vocalink|bitstamp/.test(hay)) out.add('UK');
  if (/mit|uspto|ieee|oracle|arxiv|techrixv|aam as|aamas|deloitte/.test(hay)) out.add('US');
  if (/polito|politecnico|t[eé]cnico|lisboa|inatba|frontiers|springer|ecb|geneva/.test(hay)) out.add('EU');
  if (!out.size) out.add('INTL');
  return [...out];
}

export const CHAPTER_WHEN: Record<string, string> = {
  'trusted-node': '2026-09-10',
  'uk-digital-markets': '2026-09-08',
  'sibos-2026': '2026-09-28',
  panels: '2026-06-30',
  dentsu: '2026-01-14',
  murex: '2026-03-25',
  quantnet: '2026-04-23',
  boe: '2026-02-01',
  'sibos': '2025-09-29',
  ey: '2025-10-06',
  gbtd: '2025-09-26',
  oracle: '2025-02-12',
  'oracle-hyperledger': '2025-02-12',
  'agents-x402': '2026-07-01',
  x402: '2026-07-01',
  'payscript-flow': '2026-05-01',
  fusion: '2026-01-01',
  rosalind: '2023-06-01',
  lacchain: '2021-02-01',
  thesis: '2018-01-01',
  philosophy: '2020-01-01',
  'not-l1': '2018-01-01',
  patents: '2023-01-01',
  iso: '2026-01-01',
  'satp-ietf': '2023-01-01',
  'mit-ethics': '2025-01-01',
};

export function chapterWhen(c: Chapter): string {
  return CHAPTER_WHEN[c.id] ?? '2018-01-01';
}

export function chaptersNewestFirst(page: string): Chapter[] {
  return [...chaptersFor(page)].sort((a, b) => chapterWhen(b).localeCompare(chapterWhen(a)));
}

export const QNT_CONTRACT = '0x4a220E6096B25EADb88358cb44068A3248254675';
export const QNT_BURN_TX =
  '0x763f32a09916193139e03bd0c97967c7c9eb9e085d677e3940d8b726ea4c8605';
