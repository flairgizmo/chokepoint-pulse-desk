export type NewsStatus = 'live' | 'degraded' | 'EXAMPLE' | 'loading';
export type NewsLane = 'Official' | 'Markets' | 'Industry';

export interface Headline {
  id: string;
  title: string;
  url: string;
  source: string;
  published: string | null;
  lane: NewsLane;
}

export interface NewsRiver {
  status: NewsStatus;
  items: Headline[];
  updated: string;
  error?: string;
}

const CACHE_KEY = 'qntdesk.news.v2';
const RE =
  /\b(quant network|overledger|qnt\b|gilbert verdian|gbtd|payscript|quantnet|tokenised sterling|tokenized sterling|trusted node)\b/i;

const GNEWS_PATH =
  '/api/gnews';

function cached(): NewsRiver | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as NewsRiver;
  } catch {
    return null;
  }
}

function store(river: NewsRiver): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(river));
  } catch {
    /* ignore */
  }
}

function decodeXml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function xmlTag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeXml(m[1]) : '';
}

export function laneFor(title: string, source: string): NewsLane {
  const hay = `${title} ${source}`.toLowerCase();
  if (/\b(quant\.network|quant network perspective|@quantnetwork|overledgerdev)\b/.test(hay)) {
    return 'Official';
  }
  if (/\b(price|forecast|market cap|marketcap|drops|rallies|trading|coinmarketcap|coingecko|binance|coinbase|kraken)\b/.test(hay)) {
    return 'Markets';
  }
  return 'Industry';
}

export function parseGoogleNewsRss(xml: string): Headline[] {
  const items: Headline[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
  for (const raw of blocks) {
    const title = xmlTag(raw, 'title');
    const url = xmlTag(raw, 'link');
    const source = xmlTag(raw, 'source') || 'Google News';
    const pub = xmlTag(raw, 'pubDate');
    if (!title || !url) continue;
    if (/\bquantinuum\b/i.test(`${title} ${source}`) && !/\bquant network\b/i.test(title)) continue;
    if (!RE.test(`${title} ${source}`)) continue;
    const ts = pub ? Date.parse(pub) : NaN;
    items.push({
      id: url.slice(-24) || title.slice(0, 24),
      title,
      url,
      source,
      published: Number.isFinite(ts) ? new Date(ts).toISOString() : null,
      lane: laneFor(title, source),
    });
  }
  const seen = new Set<string>();
  return items
    .filter((h) => {
      const key = h.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const ta = a.published ? Date.parse(a.published) : 0;
      const tb = b.published ? Date.parse(b.published) : 0;
      return tb - ta;
    });
}

export async function fetchNews(signal?: AbortSignal): Promise<NewsRiver> {
  const last = cached();
  try {
    const res = await fetch(GNEWS_PATH, {
      signal,
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (!xml.includes('<item')) throw new Error('Empty RSS');
    const items = parseGoogleNewsRss(xml).slice(0, 24);
    const river: NewsRiver = {
      status: 'live',
      items,
      updated: new Date().toISOString(),
    };
    store(river);
    return river;
  } catch {
    if (last?.items.length) {
      return { ...last, status: 'degraded', error: 'Using last-good headlines' };
    }
    return {
      status: 'degraded',
      items: [],
      updated: new Date().toISOString(),
      error:
        'News feed blocked or empty. No invented headlines. Official voices and this month’s sourced notes stay on the page.',
    };
  }
}
