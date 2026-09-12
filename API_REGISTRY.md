# API registry

Every live feed is proxied on the server. The browser never holds provider keys.

| Provider | Endpoint | Auth | TTL | Fallback | Note |
|---|---|---|---|---|---|
| Coinbase / Kraken / Binance | `/api/markets` → public QNT-USD tickers | none | ~20s | next venue, then last-good | Live print on Markets. Never invent a price. |
| CoinGecko | `/api/markets` → `coins/quant-network` | none | ~20s | last-good | Circulating, cap, sparkline. Not official Quant. |
| Quant official | `/api/news` → `https://quant.network/feed/` | none | ~45s | other rivers | Trailing slash required. Lane: Official. |
| Overledger docs | `/api/news` → `https://docs.overledger.dev/changelog.rss` | none | ~45s | other rivers | Docs changelog only. Not product telemetry. |
| IETF SATP | `/api/news` → Datatracker Atom | none | ~45s | other rivers | Working-group document events. SATP is IETF, not a Quant SKU. |
| Google News RSS | `/api/news` and `/api/gnews` | none | ~60s | last-good / empty river | Titles that name Quant Network, Overledger or QNT. Quantinuum excluded. |
| Ask Grok | `POST /api/chat` | optional `XAI_API_KEY` | n/a | local encyclopedia | User-initiated. Grounded in the record plus the last live print and official titles. |
| Desk status | `GET /api/status` | none | n/a | `{ grok: false }` | Reports whether live Grok is connected. |

QNT contract (verify yourself): `0x4a220E6096B25EADb88358cb44068A3248254675`.

Three.js globe textures are public NASA / Blue Marble style assets loaded by the client. Overlays are sourced programme arcs — not live SWIFT.

Do not call Overledger Connect, `auth.overledger.dev`, or any OAuth surface from this desk.
