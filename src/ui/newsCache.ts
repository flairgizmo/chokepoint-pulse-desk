export interface CachedHeadline {
  id: string;
  title: string;
  url: string;
  source: string;
  published: string;
  lane: string;
}

const STORE = new Map<string, CachedHeadline>();

export function rememberHeadline(h: CachedHeadline): void {
  if (h.id) STORE.set(h.id, h);
}

export function headlineById(id: string): CachedHeadline | undefined {
  return STORE.get(id);
}

export function rememberMany(items: CachedHeadline[]): void {
  for (const h of items) rememberHeadline(h);
}
