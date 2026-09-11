# Chokepoint Pulse Desk

**Also branded:** Situation Brief

Thin intelligence desk companion for [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view).

> **GEV is the eye; we ship the pulse.**

We own editorial briefing cards + share-link routing. GEV owns the globe.  
This repo does **not** fork or vendor Cesium / God's Eye View.

**UNCLASSIFIED // PUBLIC SOURCES ONLY**

## Quick Start

```bash
cd /workspace/chokepoint-pulse-desk
npm install
npm run dev          # http://localhost:5173
npm test             # GevShareLink encoder unit tests
npm run build        # production build → dist/
```

Optional env:

```bash
# .env
VITE_GEV_BASE=http://localhost:4173
```

## Pair with local God's Eye View

1. In a separate checkout of [gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) (not this repo):

   ```bash
   npm run doctor && npm run dev
   ```

   GEV typically serves at **`http://localhost:4173`**.

2. Run Pulse Desk (`npm run dev`). Mission CTAs open deep-links into that base URL.

3. **Note:** [maptheworld.ai](https://maptheworld.ai) is Bilawal’s Substack — **not** the GEV web app. Deep-links target local GEV.

## What ships (v1)

| Surface | Notes |
| --- | --- |
| Situation Room | Hero + classification banner + attribution |
| 5 mission cards | Hormuz, Malacca, Suez, Panama, Taiwan Strait |
| `GevShareLink` | Hash encoder matching GEV `src/sharelink.js` |
| Live tickers | USGS M4.5+ day GeoJSON (real fetch); optional adsb.lol (honest EXAMPLE/degraded if CORS blocks) |
| Detail view | Ops brief, sensor look, shot notes, ethics, copy-link |

## Share-link format

Encoded hash keys (aligned with GEV `sharelink.js` + v2 `layerState.js`):

`#v=&lat=&lon=&alt=&heading=&pitch=&style=&bloom=&bi=&bv=&sharpen=&si=&hud=&hv=&dm=&dd=&da=&kf=&ko=&cr=&map=&l=&lo=`

Style URL names: `normal`, `crt`, `nvg`, `flir`, `anime`, `noir`, `snow`.

### Layer handoff (Bottleneck Belief / PIST)

Pulse Desk now emits GEV v2 layer params so camera **and** primary overlay are productizable:

| Mission | `primaryLayer` | Hash |
| --- | --- | --- |
| Hormuz, Malacca, Suez, Panama | `ais` | `l=a` |
| Taiwan Strait | `flights` | `l=f` |

- `v=2` is required whenever `l` is present (GEV layer decode).
- Optional tracked-target: `lo=f.t.<icao24>` when a **real** ICAO24 is known and flights are enabled. Invalid ids are omitted (not truncated); desk CTAs do not invent tracks.
- Tokens we map: `a` ais · `f` flights · `e` earthquakes · `s` satellites · `m` military · `t` traffic (joined in registry order).

**Note:** Live GEV restore still needs a local God's Eye View instance on `:4173` (not cloned into this repo).

## Data-source honesty

- **USGS earthquakes** — public domain; `commercial_ok: yes`. Source URL + last-updated stamped in UI.
- **adsb.lol** (optional) — ODbL; keyless today. Browser CORS may block → chip **EXAMPLE** / **degraded**, **zero invented tracks**.
- Static briefing copy is editorial. Live numbers only appear when a feed returns them.
- No API keys required to boot.

## Attribution

- **God's Eye View** — Bilawal Sidhu; GEV source is MIT. Link: https://github.com/bilawalsidhu/gods-eye-view
- **This app (Chokepoint Pulse Desk)** — MIT (see `LICENSE`)

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc --noEmit` + Vite production build |
| `npm test` | Vitest — `GevShareLink` |
| `npm run preview` | Preview production build |
| `npm run proof` | Puppeteer screenshots → `proof/` |

## License

MIT — see `LICENSE`. GEV remains a separate project under its own terms.
