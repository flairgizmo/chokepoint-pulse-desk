# API registry

Every live feed is proxied on the server. The browser never holds provider keys.

| Provider | Endpoint | Auth | TTL | Fallback | Note |
|---|---|---|---|---|---|
| CoinGecko | `https://api.coingecko.com/api/v3/coins/quant-network` | none | last-good cache | blank / last-good | Public REST. Not official Quant. Never invent a price. |
| Coinbase / Kraken / Binance | public tickers | none | short | next venue | Live QNT-USD print on Markets. |
| Google News RSS | `/api/gnews` (dev middleware or Netlify rewrite) | none | ~60s | empty river | Headlines that name Quant Network, Overledger or QNT only. |
| Ask Grok | `POST /api/chat` | optional `XAI_API_KEY` | n/a | local encyclopedia brain | User-initiated. Does not invent prices, headlines or faces. |

QNT contract (verify yourself): `0x4a220E6096B25EADb88358cb44068A3248254675`.

Three.js globe textures are public NASA / Blue Marble style assets loaded by the client. Overlays are sourced programme arcs — not live SWIFT.
