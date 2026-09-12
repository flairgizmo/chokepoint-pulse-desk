# QntDesk — agent contract

Independent encyclopedia and protocol magazine about Quant Network, Overledger, and programmable money. **Not official Quant.**

This is a vanilla Vite + TypeScript SPA (no React, no TanStack, no Cesium, no auth). Preview the site on **`0.0.0.0:8080`** via `npm run dev` / `startup.sh`. Leave the dev server running after edits.

## Auth and accounts

**OFF.** Do not add sign-in, wallets, SIWE, seed-phrase prompts, or per-user storage. A visitor is a reader.

## Facts this desk refuses to blur

- Overledger is a **gateway OS**, not a blockchain. Whitepaper 2018 (Verdian / Tasca / Paterson / Mondelli), UCL Discovery.
- **GBTD is not a CBDC.** Live tokenised sterling deposits. Liabilities of Barclays, HSBC, Lloyds, NatWest, Nationwide, Santander. Quant is technology partner (Overledger + PayScript). Selected 26 September 2025.
- SATP is **IETF**, not a Quant SKU. Two-phase commit sits **inside stage 3**.
- QNT ERC-20 `0x4a220E6096B25EADb88358cb44068A3248254675` — **utility, not equity**. Keep both post-burn supply figures (Quant post vs Bitstamp MiCA). Live circulating from CoinGecko only.
- Rosalind 2023 concluded. Synchronisation Lab Feb 2026 is simulated RT2 — not a digital pound.
- Fusion = Layer 2.5. PayScript = programmability. Flow Applications = MCP-callable workflows. x402 = Linux Foundation; Quant is a general member.
- DIGIT gilt Q1 2027 is from an HMT speech — **the speech does not name Quant**.
- Faces are never generated. Bank marks are letter tiles, not copied logos.
- `/notes` is built from existing Did-you-know items and sourced September notes. **Do not invent a post.**
- `/desk` and `/ops` stay retired.

## Voice

Professional research blogger: history, present, and the published future of programmable money. Promote the Internet of Value and QNT as **utility**. Never “buy QNT”. Never invent prices, headlines, awards, or mandates.

## Environment

No committed `.env`. Optional server keys (`XAI_API_KEY`) stay off `VITE_`. Bind HTTP to `0.0.0.0:$PORT` (default 8080).
