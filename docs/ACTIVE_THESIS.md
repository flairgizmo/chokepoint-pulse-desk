# Active Thesis — Chokepoint Pulse Desk (Situation Brief)

**Updated:** 2026-09-10 (Europe/London)  
**Owner stress-test:** Product Idea Stress Test  
**Build:** Lingxi's Engineer Bot · `/workspace/chokepoint-pulse-desk`

## One-liner

Thin OSINT desk companion for God's Eye View: editorial chokepoint cards that deep-link into GEV share URLs (camera + style + primary layer). GEV is the eye; we ship the pulse. Not a Cesium fork.

## What has to be true

1. GEV hash contract (`sharelink.js` + v2 `layerState.js`) is stable enough to productize against.
2. A desk card that opens the right camera + enables the right overlay is worth more than GEV alone for briefing/share workflows.
3. Honesty chips (`live` / `degraded` / `EXAMPLE`, `commercial_ok`) preserve credibility when feeds fail.

## Bottleneck Belief (current)

**Primary (partially upgraded):** Encode parity for camera/style + primary-layer `l=` is good enough to ship against.  
**Still open:** Live restore against a real GEV instance (`:4173`) — Grade A runtime proof missing (GEV not cloned in this environment).  
**Scoped:** Tracked-target handoff (`lo=f.t.<icao>`) is flights-only when a **live** ICAO exists — never invented. AIS/ship missions are **camera + `l=a` only**; do not promise vessel follow (GEV has no AIS tracking option in `lo`).

## Evidence snapshot

| Claim | Status | Grade |
| --- | --- | --- |
| Camera/style encoder matches upstream GEV | Supported (code review + tests) | B |
| `l=a` (Hormuz/Malacca/Suez/Panama), `l=f` (Taiwan) | Supported (15/15 tests) | B |
| `lo=f.t.<icao>` grammar + omit-invalid | Supported | B |
| Live GEV open restores shot + layer | Unverified here | UNKNOWN |
| Desk WTP / retention | Untested | E |

## Product rules (locked with eng)

- AIS missions: camera + layer-on (`l=a`). No ship-follow promise.
- Flights path: optional `lo=f.t.` only when live ICAO exists.
- Sync Pulse layer token order to full GEV `LAYER_STATE_REGISTRY` when emitting multi-layer payloads.
- Deep-links target local/self-hosted GEV — `maptheworld.ai` is not the app.
- Never invent vessel/aircraft counts; EXAMPLE chip when CORS/degraded.

## Capital allocation

**Days, not weeks.** Continue spike toward: (1) documented live Hormuz restore proof, (2) optional live-ICAO wiring on Taiwan only, (3) registry-order sync. Do not market tracked ship follow or production GEV SaaS until host + restore are real.

## Kill / pivot triggers

- GEV strips or rejects Pulse hashes in live restore → camera-only cards or abandon deep-link thesis.
- No path to a durable GEV host Ali controls → companion is demo-only; capital → zero.
- Operators ignore cards vs raw GEV → wrong JTBD; revisit or kill.

## Stronger adjacent (not this thesis)

Own-licence compliance SaaS, full Planet Tape viral social pack, or forking GEV — different products; do not smuggle in.

## Next falsifier

Open Hormuz URL against real local GEV; confirm camera + AIS layer after restore; screenshot + hash retention. Until then, encode parity ≠ product validation.
