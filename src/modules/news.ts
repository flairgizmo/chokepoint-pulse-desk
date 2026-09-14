import { fetchText } from './liveHttp';
import {
  BOE_NEWS_RSS,
  GNEWS_GBTD,
  GNEWS_SATP,
  GNEWS_SYNC,
  GNEWS_URL,
  IETF_BLOG_RSS,
  OVERLEDGER_CHANGELOG,
  QUANT_FEED,
  SATP_ATOM,
} from './liveSources';

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

const CACHE_KEY = 'qntdesk.news.v5';
const RE =
  /\b(quant network|overledger|qnt\b|gilbert verdian|gbtd|payscript|quantnet|tokenised sterling|tokenized sterling|tokenised deposit|tokenized deposit|trusted node|satp|synchronisation lab)\b/i;

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
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
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

function headlineId(url: string, title: string): string {
  return url.slice(-24) || title.slice(0, 24);
}

function publishedIso(pub: string): string | null {
  const ts = pub ? Date.parse(pub) : NaN;
  return Number.isFinite(ts) ? new Date(ts).toISOString() : null;
}

function isQntTickerCollision(title: string, source: string): boolean {
  const hay = `${title} ${source}`;
  if (/\bquant network\b/i.test(hay) || /\boverledger\b/i.test(title)) return false;
  if (/\bquantinuum\b/i.test(hay)) return true;
  if (/\b(coinmarketcap|coingecko|binance|kraken)\b/i.test(hay) && /\bqnt\b/i.test(title)) return false;
  if (/\bqnt\b/i.test(title) && /\b(bold|blze|gbts|rgti|ionq|qbts)\b/i.test(title)) return true;
  if (/\bqnt stocks?\b/i.test(title) && /\b(surge|rally|jump|soar|roundup)\b/i.test(title)) return true;
  if (/\bqnt stock quote\b/i.test(title) && !/\b(crypto|token|coin)\b/i.test(hay)) return true;
  return false;
}

function isFxWidgetNoise(title: string): boolean {
  return /\bconvert\s+[\d.,]+\s+(qnt|\w+)\b/i.test(title) && /\bto\b/i.test(title);
}

export function dedupeHeadlines(items: Headline[]): Headline[] {
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

export function parseNamedRss(
  xml: string,
  forced?: { source?: string; lane?: NewsLane; requireMatch?: boolean },
): Headline[] {
  const items: Headline[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
  for (const raw of blocks) {
    const title = xmlTag(raw, 'title');
    const url = xmlTag(raw, 'link');
    const source = forced?.source || xmlTag(raw, 'source') || 'RSS';
    const pub = xmlTag(raw, 'pubDate');
    if (!title || !url) continue;
    if (isQntTickerCollision(title, source)) continue;
    if (isFxWidgetNoise(title)) continue;
    if (forced?.requireMatch !== false && !RE.test(`${title} ${source}`)) continue;
    items.push({
      id: headlineId(url, title),
      title,
      url,
      source,
      published: publishedIso(pub),
      lane: forced?.lane ?? laneFor(title, source),
    });
  }
  return dedupeHeadlines(items);
}

export function parseGoogleNewsRss(xml: string): Headline[] {
  return parseNamedRss(xml);
}

export function parseAtomFeed(
  xml: string,
  forced: { source: string; lane: NewsLane; linkBase?: string },
): Headline[] {
  const items: Headline[] = [];
  const blocks = xml.match(/<entry>([\s\S]*?)<\/entry>/gi) ?? [];
  for (const raw of blocks) {
    const title = xmlTag(raw, 'title');
    const href = raw.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? '';
    const url = href.startsWith('http') ? href : `${forced.linkBase ?? ''}${href}`;
    const pub = xmlTag(raw, 'updated') || xmlTag(raw, 'published');
    if (!title || !url) continue;
    if (isQntTickerCollision(title, forced.source)) continue;
    items.push({
      id: headlineId(url, title),
      title,
      url,
      source: forced.source,
      published: publishedIso(pub),
      lane: forced.lane,
    });
  }
  return dedupeHeadlines(items);
}

export async function fetchGoogleNewsXml(signal?: AbortSignal): Promise<string> {
  return fetchText(GNEWS_URL, signal);
}

export async function fetchNewsRiver(signal?: AbortSignal): Promise<NewsRiver> {
  const last = cached();
  const settled = await Promise.allSettled([
    fetchText(GNEWS_URL, signal).then((xml) => parseGoogleNewsRss(xml)),
    fetchText(QUANT_FEED, signal).then((xml) =>
      parseNamedRss(xml, { source: 'Quant', lane: 'Official', requireMatch: false }),
    ),
    fetchText(OVERLEDGER_CHANGELOG, signal).then((xml) =>
      parseNamedRss(xml, { source: 'Overledger docs', lane: 'Industry', requireMatch: false }),
    ),
    fetchText(SATP_ATOM, signal).then((xml) =>
      parseAtomFeed(xml, {
        source: 'IETF SATP',
        lane: 'Industry',
        linkBase: 'https://datatracker.ietf.org',
      }),
    ),
    fetchText(GNEWS_GBTD, signal).then((xml) => parseGoogleNewsRss(xml)),
    fetchText(BOE_NEWS_RSS, signal).then((xml) =>
      parseNamedRss(xml, { source: 'Bank of England', lane: 'Industry', requireMatch: true }),
    ),
    fetchText(IETF_BLOG_RSS, signal).then((xml) =>
      parseNamedRss(xml, { source: 'IETF', lane: 'Industry', requireMatch: true }),
    ),
    fetchText(GNEWS_SATP, signal).then((xml) => parseGoogleNewsRss(xml)),
    fetchText(GNEWS_SYNC, signal).then((xml) => parseGoogleNewsRss(xml)),
  ]);
  const items = dedupeHeadlines(settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))).slice(0, 40);
  const failed = settled.filter((r) => r.status === 'rejected').length;
  if (!items.length) {
    if (last?.items.length) {
      return { ...last, status: 'degraded', error: 'Using last-good headlines' };
    }
    return {
      status: 'degraded',
      items: [],
      updated: new Date().toISOString(),
      error:
        'News feed blocked or empty. No invented headlines. Official voices and this month’s sourced notes stay visible.',
    };
  }
  const river: NewsRiver = {
    status: failed ? 'degraded' : 'live',
    items,
    updated: new Date().toISOString(),
    error: failed ? `${failed} live source${failed === 1 ? '' : 's'} timed out` : undefined,
  };
  store(river);
  return river;
}

export async function fetchNews(signal?: AbortSignal): Promise<NewsRiver> {
  const last = cached();
  try {
    const proxied = await fetch('/api/news', {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (proxied.ok) {
      const river = (await proxied.json()) as NewsRiver;
      if (Array.isArray(river.items)) {
        store(river);
        return river;
      }
    }
  } catch {
    /* fall through */
  }
  try {
    const res = await fetch('/api/gnews', {
      signal,
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    if (!xml.includes('<item')) throw new Error('Empty RSS');
    const river: NewsRiver = {
      status: 'live',
      items: parseGoogleNewsRss(xml).slice(0, 24),
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
        'News feed blocked or empty. No invented headlines. Official voices and this month’s sourced notes stay visible.',
    };
  }
}
