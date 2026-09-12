import { fetchJson } from './liveHttp';
import { BINANCE_QNT, COINBASE_STATS, COINBASE_TICKER, COINGECKO_QNT, KRAKEN_QNT } from './liveSources';

export type FeedStatus = 'live' | 'degraded' | 'EXAMPLE' | 'loading';

export interface MarketPrint {
  status: FeedStatus;
  venue: string;
  priceUsd: number | null;
  change24h: number | null;
  volume24h: number | null;
  high24h: number | null;
  low24h: number | null;
  marketCap: number | null;
  circulating: number | null;
  totalSupply: number | null;
  ath: number | null;
  atl: number | null;
  sparkline: number[];
  tickers: Array<{ name: string; volume: number }>;
  updated: string | null;
  error?: string;
}

const CACHE_KEY = 'qntdesk.markets.v2';
const LAST_GOOD_MS = 30 * 60_000;

function readCache(): MarketPrint | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; print: MarketPrint };
    if (Date.now() - parsed.at > LAST_GOOD_MS) return parsed.print;
    return parsed.print;
  } catch {
    return null;
  }
}

function writeCache(print: MarketPrint): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), print }));
  } catch {
    /* ignore quota */
  }
}

interface VenueQuote {
  venue: string;
  price: number;
  change24h: number | null;
  volume: number | null;
  high: number | null;
  low: number | null;
}

async function fromCoinbase(signal?: AbortSignal): Promise<VenueQuote> {
  const ticker = (await fetchJson(COINBASE_TICKER, signal)) as { price?: string; volume?: string };
  const stats = (await fetchJson(COINBASE_STATS, signal)) as {
    open?: string;
    high?: string;
    low?: string;
    volume?: string;
  };
  const price = Number(ticker.price);
  const open = Number(stats.open);
  const change = Number.isFinite(price) && Number.isFinite(open) && open
    ? ((price - open) / open) * 100
    : null;
  return {
    venue: 'Coinbase',
    price,
    change24h: change,
    volume: Number(stats.volume) || Number(ticker.volume) || null,
    high: Number(stats.high) || null,
    low: Number(stats.low) || null,
  };
}

async function fromKraken(signal?: AbortSignal): Promise<VenueQuote> {
  const data = (await fetchJson(
    KRAKEN_QNT,
    signal,
  )) as { result?: Record<string, { c: string[]; o: string; h: string[]; l: string[]; v: string[] }> };
  const row = data.result ? Object.values(data.result)[0] : undefined;
  if (!row) throw new Error('Kraken empty');
  const price = Number(row.c?.[0]);
  const open = Number(row.o);
  const change = Number.isFinite(price) && Number.isFinite(open) && open
    ? ((price - open) / open) * 100
    : null;
  return {
    venue: 'Kraken',
    price,
    change24h: change,
    volume: Number(row.v?.[1]) || null,
    high: Number(row.h?.[1]) || null,
    low: Number(row.l?.[1]) || null,
  };
}

async function fromBinance(signal?: AbortSignal): Promise<VenueQuote> {
  const data = (await fetchJson(
    BINANCE_QNT,
    signal,
  )) as {
    lastPrice?: string;
    priceChangePercent?: string;
    quoteVolume?: string;
    highPrice?: string;
    lowPrice?: string;
  };
  return {
    venue: 'Binance',
    price: Number(data.lastPrice),
    change24h: Number(data.priceChangePercent),
    volume: Number(data.quoteVolume) || null,
    high: Number(data.highPrice) || null,
    low: Number(data.lowPrice) || null,
  };
}

async function firstVenue(signal?: AbortSignal): Promise<VenueQuote> {
  const errors: string[] = [];
  for (const fn of [fromCoinbase, fromKraken, fromBinance]) {
    try {
      const q = await fn(signal);
      if (Number.isFinite(q.price) && q.price > 0) return q;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  throw new Error(errors.join('; ') || 'No venue');
}

export async function fetchMarketsDirect(signal?: AbortSignal): Promise<MarketPrint> {
  const cached = readCache();
  try {
    const [quote, gecko] = await Promise.allSettled([
      firstVenue(signal),
      fetchJson(COINGECKO_QNT, signal),
    ]);

    if (quote.status === 'rejected' && gecko.status === 'rejected') {
      if (cached?.priceUsd) {
        return { ...cached, status: 'degraded', error: 'Using last-good print' };
      }
      return {
        status: 'degraded',
        venue: 'none',
        priceUsd: null,
        change24h: null,
        volume24h: null,
        high24h: null,
        low24h: null,
        marketCap: null,
        circulating: null,
        totalSupply: null,
        ath: null,
        atl: null,
        sparkline: [],
        tickers: [],
        updated: new Date().toISOString(),
        error: 'Markets unreachable — no invented price.',
      };
    }

    const q = quote.status === 'fulfilled' ? quote.value : null;
    const g =
      gecko.status === 'fulfilled'
        ? (gecko.value as {
            market_data?: {
              current_price?: { usd?: number };
              price_change_percentage_24h?: number;
              total_volume?: { usd?: number };
              high_24h?: { usd?: number };
              low_24h?: { usd?: number };
              market_cap?: { usd?: number };
              circulating_supply?: number;
              total_supply?: number;
              ath?: { usd?: number };
              atl?: { usd?: number };
              sparkline_7d?: { price?: number[] };
            };
            tickers?: Array<{ market?: { name?: string }; converted_volume?: { usd?: number } }>;
          })
        : null;
    const md = g?.market_data;
    const tickers = (g?.tickers ?? [])
      .map((t) => ({
        name: t.market?.name ?? 'Venue',
        volume: t.converted_volume?.usd ?? 0,
      }))
      .filter((t) => t.volume > 0)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    const print: MarketPrint = {
      status: 'live',
      venue: q?.venue ?? 'CoinGecko',
      priceUsd: q?.price ?? md?.current_price?.usd ?? null,
      change24h: q?.change24h ?? md?.price_change_percentage_24h ?? null,
      volume24h: md?.total_volume?.usd ?? q?.volume ?? null,
      high24h: q?.high ?? md?.high_24h?.usd ?? null,
      low24h: q?.low ?? md?.low_24h?.usd ?? null,
      marketCap: md?.market_cap?.usd ?? null,
      circulating: md?.circulating_supply ?? null,
      totalSupply: md?.total_supply ?? null,
      ath: md?.ath?.usd ?? null,
      atl: md?.atl?.usd ?? null,
      sparkline: md?.sparkline_7d?.price ?? [],
      tickers,
      updated: new Date().toISOString(),
    };
    writeCache(print);
    return print;
  } catch (err) {
    if (cached?.priceUsd) {
      return { ...cached, status: 'degraded', error: 'Using last-good print' };
    }
    return {
      status: 'degraded',
      venue: 'none',
      priceUsd: null,
      change24h: null,
      volume24h: null,
      high24h: null,
      low24h: null,
      marketCap: null,
      circulating: null,
      totalSupply: null,
      ath: null,
      atl: null,
      sparkline: [],
      tickers: [],
      updated: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function fetchMarkets(signal?: AbortSignal): Promise<MarketPrint> {
  try {
    const res = await fetch('/api/markets', {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const print = (await res.json()) as MarketPrint;
      if (print && (print.priceUsd != null || print.status)) {
        writeCache(print);
        return print;
      }
    }
  } catch {
    /* same-origin proxy down — fall through to public REST */
  }
  return fetchMarketsDirect(signal);
}

export function staleCache(): MarketPrint | null {
  return readCache();
}
