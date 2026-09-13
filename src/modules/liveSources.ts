/** Official and public live endpoints. No keys. Do not invent extra URLs. */

export const DESK_UA = 'Mozilla/5.0 (compatible; QntDesk/2.1; +https://qntdesk.com)';

export const GNEWS_URL =
  'https://news.google.com/rss/search?q=%22Quant+Network%22+OR+Overledger+OR+QNT&hl=en-GB&gl=GB&ceid=GB:en';

/** WordPress site feed. Trailing slash required — `/feed` 403s. */
export const QUANT_FEED = 'https://quant.network/feed/';

export const OVERLEDGER_CHANGELOG = 'https://docs.overledger.dev/changelog.rss';

export const SATP_ATOM = 'https://datatracker.ietf.org/group/satp/documents/feed/';

/** GBTD / tokenised-deposit query — avoids a bare QNT ticker that pulls Quantinuum. */
export const GNEWS_GBTD =
  'https://news.google.com/rss/search?q=%22tokenised+deposits%22+OR+GBTD+%22UK+Finance%22+OR+Overledger&hl=en-GB&gl=GB&ceid=GB:en';

export const BOE_NEWS_RSS = 'https://www.bankofengland.co.uk/rss/news';

export const IETF_BLOG_RSS = 'https://www.ietf.org/blog/feed/';

/** SATP / IETF gateway protocol — avoids a bare QNT ticker. */
export const GNEWS_SATP =
  'https://news.google.com/rss/search?q=%22Secure+Asset+Transfer+Protocol%22+OR+SATP+IETF+Overledger&hl=en-GB&gl=GB&ceid=GB:en';

/** Synchronisation Lab / tokenised sterling — BoE language without a ticker. */
export const GNEWS_SYNC =
  'https://news.google.com/rss/search?q=%22Synchronisation+Lab%22+OR+%22tokenised+sterling%22+OR+%22tokenized+sterling%22&hl=en-GB&gl=GB&ceid=GB:en';

export const COINGECKO_QNT =
  'https://api.coingecko.com/api/v3/coins/quant-network?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=true';

export const COINBASE_TICKER = 'https://api.exchange.coinbase.com/products/QNT-USD/ticker';
export const COINBASE_STATS = 'https://api.exchange.coinbase.com/products/QNT-USD/stats';
export const KRAKEN_QNT = 'https://api.kraken.com/0/public/Ticker?pair=QNTUSD';
export const BINANCE_QNT = 'https://api.binance.com/api/v3/ticker/24hr?symbol=QNTUSDT';

export const XAI_CHAT = 'https://api.x.ai/v1/chat/completions';
