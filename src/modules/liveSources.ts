/** Official and public live endpoints. No keys. Do not invent extra URLs. */

export const DESK_UA = 'Mozilla/5.0 (compatible; QntDesk/2.1; +https://qntdesk.com)';

export const GNEWS_URL =
  'https://news.google.com/rss/search?q=%22Quant+Network%22+OR+Overledger+OR+QNT&hl=en-GB&gl=GB&ceid=GB:en';

/** WordPress site feed. Trailing slash required — `/feed` 403s. */
export const QUANT_FEED = 'https://quant.network/feed/';

export const OVERLEDGER_CHANGELOG = 'https://docs.overledger.dev/changelog.rss';

export const SATP_ATOM = 'https://datatracker.ietf.org/group/satp/documents/feed/';

export const COINGECKO_QNT =
  'https://api.coingecko.com/api/v3/coins/quant-network?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=true';

export const COINBASE_TICKER = 'https://api.exchange.coinbase.com/products/QNT-USD/ticker';
export const COINBASE_STATS = 'https://api.exchange.coinbase.com/products/QNT-USD/stats';
export const KRAKEN_QNT = 'https://api.kraken.com/0/public/Ticker?pair=QNTUSD';
export const BINANCE_QNT = 'https://api.binance.com/api/v3/ticker/24hr?symbol=QNTUSDT';

export const XAI_CHAT = 'https://api.x.ai/v1/chat/completions';
