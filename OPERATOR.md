# Operator notes

No `.env` in the repo. Platform injects secrets on deploy. **Auth is OFF.**

| Key | Effect if missing |
|---|---|
| `XAI_API_KEY` | Ask Grok uses the local encyclopedia brain / returns an error from the Netlify function |
| `PORT` | Dev server defaults to `8080` |

Never prefix secrets with `VITE_`.

Published independent-desk donation recipients (not Quant Network):

- ETH / QNT ERC-20: `0xFcAD8838195Bdf03dB09999a0E289bf45D6F3FFD`
- BTC: `bc1qgxnzt5d2qdx8zskffejhfjnqxuwtwnn3s3tadz`
- USDT · Solana: `911rhAbnvrVZion9nS7N2BbKxDTWbNRQCELvMR5dXtcw`

QNT token contract for verification only: `0x4a220E6096B25EADb88358cb44068A3248254675`.
