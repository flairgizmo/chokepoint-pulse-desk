export type NewsStatus = 'live' | 'degraded' | 'EXAMPLE' | 'loading';

export interface Headline {
  id: string;
  title: string;
  url: string;
  source: string;
  published: string | null;
}

export interface NewsRiver {
  status: NewsStatus;
  items: Headline[];
  updated: string;
  error?: string;
}

const CACHE_KEY = 'qntdesk.news.v1';
const RE =
  /\b(quant network|overledger|qnt\b|gilbert verdian|gbtd|payscript|quantnet|tokenised sterling|tokenized sterling)\b/i;

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

export async function fetchNews(signal?: AbortSignal): Promise<NewsRiver> {
  const last = cached();
  try {
    const url =
      'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=Blockchain,Regulation,Trading';
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      Data?: Array<{
        id: string;
        title: string;
        url: string;
        source_info?: { name?: string };
        published_on?: number;
        body?: string;
        tags?: string;
        categories?: string;
      }>;
    };
    const items: Headline[] = (data.Data ?? [])
      .filter((d) =>
        RE.test(`${d.title} ${d.body ?? ''} ${d.tags ?? ''} ${d.categories ?? ''}`),
      )
      .slice(0, 24)
      .map((d) => ({
        id: String(d.id),
        title: d.title,
        url: d.url,
        source: d.source_info?.name ?? 'CryptoCompare',
        published: d.published_on
          ? new Date(d.published_on * 1000).toISOString()
          : null,
      }));

    const river: NewsRiver = {
      status: 'live',
      items,
      updated: new Date().toISOString(),
    };
    store(river);
    return river;
  } catch (err) {
    if (last?.items.length) {
      return { ...last, status: 'degraded', error: 'Using last-good headlines' };
    }
    return {
      status: 'degraded',
      items: [],
      updated: new Date().toISOString(),
      error:
        'News feed blocked or empty. No invented headlines. Official voices stay on the page.',
    };
  }
}
