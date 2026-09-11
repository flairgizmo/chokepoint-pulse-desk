import sourcesJson from './sources.json';
import chaptersJson from './chapters.json';
import libraryJson from './library.json';
import dykJson from './dyk.json';

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

export const chapters = chaptersJson as Chapter[];
export const papers = libraryJson as Paper[];
export const didYouKnow = dykJson as DidYouKnow[];

export function sourceUrl(key: string): string {
  return sources[key] ?? key;
}

export function chaptersFor(page: string): Chapter[] {
  return chapters.filter((c) => c.page === page);
}

export function paperById(id: string): Paper | undefined {
  return papers.find((p) => p.id === id);
}

export const QNT_CONTRACT = '0x4a220E6096B25EADb88358cb44068A3248254675';
export const QNT_BURN_TX =
  '0x763f32a09916193139e03bd0c97967c7c9eb9e085d677e3940d8b726ea4c8605';
