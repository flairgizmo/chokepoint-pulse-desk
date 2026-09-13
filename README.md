# QntDesk

Research desk on [Quant Network](https://quant.network), Overledger, programmable money and the Internet of Value.

Latest first: news, programmes, and a twenty-part podcast told in order. Bright magazine desk — drag the network, open the official rooms.

## Surfaces

| Surface | What it holds |
| --- | --- |
| News | Official Quant feed, Overledger docs, IETF SATP, Google News, and sourced filings. A click opens the source. |
| Podcast | Twenty films, in order. James Hale and Amelia Crowe, every episode. |
| Earth | Interactive globe. Sourced city dossiers |
| Vision / Stack / Programmes / CBDC / Standards | Encyclopedia chapters |
| People | Officers and authors. Official Quant portraits where Quant published them |
| Research | 48 documents |
| Markets | Live QNT, circulating float, venue volume. Last-good cache |
| Ask Grok | Live Grok when `XAI_API_KEY` is set; otherwise the sourced desk |

## Facts on the record

- Overledger is a gateway operating system. 2018 whitepaper at UCL Discovery.
- GBTD is tokenised sterling deposits; liabilities of Barclays, HSBC, Lloyds, NatWest, Nationwide and Santander. Quant is technology partner. Selected 26 September 2025.
- SATP is IETF work. Two-phase commit lives inside stage 3.
- QNT ERC-20 `0x4a220E6096B25EADb88358cb44068A3248254675` — utility token. 14 September 2018 burn.
- Project Rosalind concluded in 2023. Synchronisation Lab (Feb 2026) is simulated RT2.

```bash
npm install
cp .env.example .env   # then paste XAI_API_KEY
npm run dev            # 0.0.0.0:8080
npm test
npm run build
```

## Connect Ask Grok

1. Create an xAI API key at [console.x.ai](https://console.x.ai).
2. **Local:** put `XAI_API_KEY=xai-...` in `.env` (never `VITE_`). Restart `npm run dev`.
3. **Netlify:** Site settings → Environment variables → `XAI_API_KEY` (secret) → optional `XAI_MODEL=grok-3-mini` → redeploy.
4. **GitHub Pages:** Pages is static only. Chat stays on the sourced desk unless you put `/api/chat` on Netlify or another host.

The key stays on the server. The browser only calls `/api/chat`.

## Publish the site

This repo is a **static Vite SPA**. It is not a TanStack / Nitro server.

If `qntdesk.com` shows pretty-printed JSON `{"error":true,"status":500,"unhandled":true}`, the domain is still attached to a different Nitro app on Vercel. That crash is Nitro hiding an unhandled server error. It is not this desk.

**Fix the domain:** Vercel → the *Nitro* project → Settings → Domains → remove `qntdesk.com`. Then import **this** GitHub repo as a Vite project (`npm run build`, output `dist`, `vercel.json` already pins the framework). Add `qntdesk.com` on that project. Or [Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/flairgizmo/chokepoint-pulse-desk) and attach the domain there.

Ask Grok: add `XAI_API_KEY` on Netlify (or another `/api/chat` host) and redeploy. GitHub Pages is static only.

MIT — see `LICENSE`.
