# Apify reference brief — QntDesk intake

**Collected:** 13 September 2026 (UTC)  
**Transport:** Apify MCP (`search-actors`, `apify/web-fetch`, `apify/rag-web-browser`, one capped `data_xplorer/google-news-scraper-fast` run)  
**Legal scope:** Public pages and public RSS/Atom only. No login walls, no personal-data harvest, no private APIs. Official images and Lottie files were **read for motif notes only** — redraw as original SVG; never hotlink Quant, UK Finance, IETF, Bloomberg, Reuters, or FT assets as QntDesk brand.

This desk is not Quant Network. Do not invent facts. Failures are listed as failures.

---

## 1. Apify Store — actors worth keeping on the desk

Searches: `news`, `Google News`, `RSS`, `markdown`, `website content crawler`.

### (a) News about Quant Network / Overledger / GBTD / SATP

| Actor | Why it is useful | Caveat |
| --- | --- | --- |
| [`data_xplorer/google-news-scraper-fast`](https://apify.com/data_xplorer/google-news-scraper-fast) | Highest monthly use among Google News actors found (473); structured title / source / date / URL | **QNT ticker collision.** A 30-day GB:en run for `"Quant Network" OR Overledger -Quantinuum` returned **one** item (CryptoSlate QNT price). |
| [`easyapi/google-news-scraper`](https://apify.com/easyapi/google-news-scraper) | Most total users (2,539) | Same ticker-collision risk if the query includes bare `QNT` |
| [`crawlerbros/google-news-scraper`](https://apify.com/crawlerbros/google-news-scraper) | `siteFilter` + `excludeWords` — useful to keep `site:quant.network` / `site:ukfinance.org.uk` / `site:datatracker.ietf.org` | Community actor |
| [`automation-lab/google-news-scraper`](https://apify.com/automation-lab/google-news-scraper) | HTTP-only keyword scrape | No browser |

**Desk rule already in `src/modules/liveSources.ts`:** the live Google News RSS query is `"Quant Network" OR Overledger OR QNT`. The 13 Sep 2026 fetch of that feed was **dominated by Quantinuum (Nasdaq: QNT)** — CHIPS funding, IPO, quantum-computing copy. Treat bare `QNT` as unsafe for industry headlines.

### (b) Official pages as markdown

| Actor | Why |
| --- | --- |
| [`apify/web-fetch`](https://apify.com/apify/web-fetch) | **Used.** One URL → markdown/HTML/text. JS render + anti-bot. Best for known official URLs. |
| [`apify/rag-web-browser`](https://apify.com/apify/rag-web-browser) | **Used.** Google search + scrape top N as markdown, or fetch a URL. |
| [`apify/website-content-crawler`](https://apify.com/apify/website-content-crawler) | Official Apify crawler (156k users). Markdown for RAG. Use only with `maxCrawlPages` capped and `respectRobotsTxtFile`. |
| [`apify/url-to-markdown`](https://apify.com/apify/url-to-markdown) | Official, cheap HTTP or browser convert |
| [`macheta/justhtml-link-to-markdown`](https://apify.com/macheta/justhtml-link-to-markdown) | Free actor; platform compute only |

Overledger docs already advertise an official markdown path: [https://docs.overledger.dev/llms.txt](https://docs.overledger.dev/llms.txt) and “append `.md` to any documentation page URL”. Prefer that over crawling ReadMe.

### (c) Google News RSS / web news

| Actor | Why |
| --- | --- |
| [`apify/web-fetch`](https://apify.com/apify/web-fetch) on a public RSS/Atom URL | **Used** on Google News RSS, `https://quant.network/feed/`, and IETF SATP Atom. Cheapest legal path. |
| [`automation-lab/rss-feed-reader`](https://apify.com/automation-lab/rss-feed-reader) | RSS 2 / Atom / RSS 1 → JSON (title, link, pubDate) |
| [`santamaria-automations/rss-feed-reader`](https://apify.com/santamaria-automations/rss-feed-reader) | Multi-feed, low start fee |
| [`viralanalyzer/rss-news-intelligence`](https://apify.com/viralanalyzer/rss-news-intelligence) | RSS **and** Google News queries in one actor |

Existing desk feeds (already wired, do not invent extras):

- `https://quant.network/feed/`
- `https://docs.overledger.dev/changelog.rss`
- `https://datatracker.ietf.org/group/satp/documents/feed/`
- `https://news.google.com/rss/search?q=%22Quant+Network%22+OR+Overledger+OR+QNT&hl=en-GB&gl=GB&ceid=GB:en`

---

## 2. Run log (what actually succeeded or failed)

| Target | Actor | HTTP / status | Note |
| --- | --- | --- | --- |
| [https://quant.network/](https://quant.network/) | web-fetch markdown + HTML | 200 | Cookie banner + marketing homepage. Hero + Lottie + Vimeo present in HTML. |
| [https://quant.network/overledger-platform](https://quant.network/overledger-platform) | web-fetch | 200 | Canonical loaded without trailing slash. |
| [https://docs.overledger.dev/](https://docs.overledger.dev/) | web-fetch | 200 | Thin hub (Tutorials / Integrations / Use Cases) + official SVG/PNG on ReadMe CDN. |
| [https://docs.overledger.dev/docs/start-here](https://docs.overledger.dev/docs/start-here) | web-fetch | 200 | Twelve-chapter manual; Fusion / Firewall / MCP named. |
| [https://www.ukfinance.org.uk/](https://www.ukfinance.org.uk/) | web-fetch | 200 | No GBTD card on the homepage that day. Digital-markets report dated 08.09.26. |
| [https://www.ukfinance.org.uk/news-and-insight/press-release/uk-finance-announces-live-pilot-phase-deliver-tokenised-sterling](https://www.ukfinance.org.uk/news-and-insight/press-release/uk-finance-announces-live-pilot-phase-deliver-tokenised-sterling) | web-fetch | 200 | **26 Sep 2025** six-firm list (no Monzo). |
| [https://www.ukfinance.org.uk/regulated-liability-network](https://www.ukfinance.org.uk/regulated-liability-network) | web-fetch | 200 | **GBTD programme page.** Title “Tokenised sterling deposits”. **Adds Monzo as 7th participant.** Also states GBTD accepted into the Bank of England Synchronisation Lab. |
| [https://datatracker.ietf.org/group/satp/about/](https://datatracker.ietf.org/group/satp/about/) | web-fetch | 200 | WG Active; chairs Claire + Wes Hardaker. |
| [https://datatracker.ietf.org/group/satp/documents/feed/](https://datatracker.ietf.org/group/satp/documents/feed/) | web-fetch | 200 `text/xml` | Flattened to markdown; shepherd write-ups + usecases-10 (2–3 Sep 2026). |
| [https://quant.network/news/](https://quant.network/news/) | web-fetch | 200 | Full listing; 282 unique dated cards parsed. |
| [https://quant.network/feed/](https://quant.network/feed/) | web-fetch | 200 | Latest item 10 Sep 2026 Trusted Node. Tags stripped. |
| Google News RSS (desk query) | web-fetch | 200 | **Failed as structured RSS.** Tags stripped; **Quantinuum (QNT)** dominates. |
| `data_xplorer/google-news-scraper-fast` 30d GB | call-actor | SUCCEEDED | **1 item only** — CryptoSlate QNT price, 8 Sep 2026. |
| rag-web-browser Quant/Overledger/GBTD/SATP | rag-web-browser | 4 scraped, **1 failed** | r/QuantNetwork **HTTP 500**. Survivors: CMC-AI, quant.network, news listing, X. |
| [https://quant.network/press-releases/quant-selected-to-participate-in-the-bank-of-englands-synchronisation-lab/](https://quant.network/press-releases/quant-selected-to-participate-in-the-bank-of-englands-synchronisation-lab/) | web-fetch | 200 | 13 Feb 2026. Simulated RT2; not BoE endorsement. |
| Quant Lottie `DigitalCurrencyIntelligence.json` | web-fetch raw | 200 | Motif colour extracted (below). |
| Bloomberg Terminal + Research pages | rag-web-browser / web-fetch | 200 | Redirected to `professional.bloomberg.com`. |
| Reuters Agency About | rag-web-browser | 200 | Landed on [https://reutersagency.com/about/](https://reutersagency.com/about/). |
| [https://aboutus.ft.com/what-we-do](https://aboutus.ft.com/what-we-do) | web-fetch | **404** | Recovered via [https://aboutus.ft.com/](https://aboutus.ft.com/) (200). |
| Disruption Banking Fusion piece | rag-web-browser | 200 | Canonical URL recovered (below). |

---

## 3. Recent public headlines (8–15)

Prefer official and standards URLs. Industry wires are labelled. Dates are as printed on the fetched page or feed.

| # | Date | Title | Source | URL | Lane |
| --- | --- | --- | --- | --- | --- |
| 1 | 10 Sep 2026 | The Trusted Node Program: Who’s processing your transaction? | Quant Perspectives | [quant.network/perspectives/the-trusted-node-program-whos-processing-your-transaction/](https://quant.network/perspectives/the-trusted-node-program-whos-processing-your-transaction/) | Official |
| 2 | 19 Aug 2026 | Collateral without borders: The case for Fusion in capital markets | Quant Perspectives | [quant.network/perspectives/collateral-without-borders-the-case-for-fusion-in-capital-markets/](https://quant.network/perspectives/collateral-without-borders-the-case-for-fusion-in-capital-markets/) | Official |
| 3 | 30 Jul 2026 | Quant Fusion: The missing layer for tokenised money | Quant Perspectives | [quant.network/perspectives/quant-fusion-the-missing-layer-for-tokenised-money/](https://quant.network/perspectives/quant-fusion-the-missing-layer-for-tokenised-money/) | Official |
| 4 | 30 Jul 2026 | Inside the Bank of England’s Synchronisation Lab: Treasury rebalancing use case | Quant Perspectives | [quant.network/perspectives/inside-the-bank-of-englands-synchronisation-lab-treasury-rebalancing-use-case/](https://quant.network/perspectives/inside-the-bank-of-englands-synchronisation-lab-treasury-rebalancing-use-case/) | Official |
| 5 | 2 Jul 2026 | How Quant is connecting agentic AI payments to the banking system | Quant News | [quant.network/news/how-quant-is-connecting-agentic-ai-payments-to-the-banking-system/](https://quant.network/news/how-quant-is-connecting-agentic-ai-payments-to-the-banking-system/) | Official |
| 6 | 30 Jun 2026 | Five key takeaways from the GBTD panel at the UK Finance Digital Innovation Summit | Quant News | [quant.network/news/five-key-takeaways-from-the-gbtd-panel-at-the-uk-finance-digital-innovation-summit/](https://quant.network/news/five-key-takeaways-from-the-gbtd-panel-at-the-uk-finance-digital-innovation-summit/) | Official |
| 7 | 2 Jun 2026 | A new category of infrastructure: the Fusion Rollup is live on mainnet | Quant News | [quant.network/news/a-new-category-of-infrastructure-the-fusion-rollup-is-live-on-mainnet/](https://quant.network/news/a-new-category-of-infrastructure-the-fusion-rollup-is-live-on-mainnet/) | Official |
| 8 | 3 Jun 2026 | Quant’s Fusion Rollup Goes Live, Unifying 74 Blockchains for Institutions | Disruption Banking | [disruptionbanking.com/2026/06/03/quants-fusion-rollup-goes-live-unifying-74-blockchains-for-institutions/](https://www.disruptionbanking.com/2026/06/03/quants-fusion-rollup-goes-live-unifying-74-blockchains-for-institutions/) | Industry |
| 9 | 6 May 2026 | Three things we learned at the Investment Association’s Synchronisation Lab webinar | Quant News | [quant.network/news/three-things-we-learned-at-the-investment-associations-synchronisation-lab-webinar/](https://quant.network/news/three-things-we-learned-at-the-investment-associations-synchronisation-lab-webinar/) | Official |
| 10 | 13 Feb 2026 | Quant selected to participate in the Bank of England’s Synchronisation Lab | Quant Press | [quant.network/press-releases/quant-selected-to-participate-in-the-bank-of-englands-synchronisation-lab/](https://quant.network/press-releases/quant-selected-to-participate-in-the-bank-of-englands-synchronisation-lab/) | Official |
| 11 | 26 Sep 2025 | UK Finance announces live pilot phase to deliver tokenised sterling deposits | UK Finance | [ukfinance.org.uk/…/uk-finance-announces-live-pilot-phase-deliver-tokenised-sterling](https://www.ukfinance.org.uk/news-and-insight/press-release/uk-finance-announces-live-pilot-phase-deliver-tokenised-sterling) | Official-sector |
| 12 | 8 Sep 2026 | UK Finance sets out roadmap to accelerate digital market adoption | UK Finance | [ukfinance.org.uk/…/uk-finance-sets-out-roadmap-accelerate-digital-market-adoption](https://www.ukfinance.org.uk/news-and-insight/press-release/uk-finance-sets-out-roadmap-accelerate-digital-market-adoption) | Official-sector |
| 13 | 2 Sep 2026 | New version available: `draft-ietf-satp-usecases-10` | IETF SATP Atom | [datatracker.ietf.org/doc/draft-ietf-satp-usecases/](https://datatracker.ietf.org/doc/draft-ietf-satp-usecases/) | Standards |
| 14 | 2–3 Sep 2026 | SATP-core IETF WG state → Waiting for WG Chair Go-Ahead; shepherd write-ups posted | IETF SATP Atom | [datatracker.ietf.org/doc/draft-ietf-satp-core/](https://datatracker.ietf.org/doc/draft-ietf-satp-core/) | Standards |
| 15 | 8 Sep 2026 | Quant price today, QNT to USD chart, marketcap and volume | CryptoSlate via Google News actor | [cryptoslate.com](https://cryptoslate.com) listing via Google News | Markets — ticker only |

**Not used as Quant Network news:** Quantinuum CHIPS / IPO / Nasdaq:QNT items that filled the Google News RSS. **Not used:** CoinMarketCap “CMC-AI” latest-updates page (rag-web-browser hit; not a primary filing).

**Undated programme-page update (no byline date on the fetched HTML):** UK Finance’s GBTD page now says Monzo is the 7th participant and that GBTD was accepted into the Bank of England Synchronisation Lab. Source: [Tokenised sterling deposits](https://www.ukfinance.org.uk/regulated-liability-network). Do not invent a join date.

---

## 4. Visual motifs to redraw (official pages only)

Do **not** hotlink these files. They are motif descriptions for original SVG.

1. **Quant coral / vermillion engine line — RGB `255, 84, 42` (`#FF542A`).** Extracted from the public homepage Lottie `Digital Currencies v01` (`DigitalCurrencyIntelligence.json`, 675×575). Every sampled fill/stroke in that composition used this one RGB. Use as a *redrawn* programmable-money stroke, not as a lifted path.

2. **Split hero: type left, dark-grey photo well right.** Homepage HTML (`dgra-bg`, `gray-bg`, `roundbordertoaddl`) puts the H1 “The Infrastructure of Money” on a light field and a rounded dark well holding `homepage-hero-2025.jpg`. Motif: a heavy photograph docked in a charcoal capsule, not a full-bleed splash.

3. **Gradient display lines (`gradienttext`) on stacked ragged headlines.** Official lines to echo in original type, not to copy as a logo: “Money is now fit for our digital age.” / “Quant PayScript® — Introducing the language of money.” PayScript is marked with a **superscript ®**.

4. **Lottie infrastructure plates, not photography.** Two more public Lotties sit beside body copy: `Infrastructure-v3.json` and `CentralBanksFinancialInstitutions.json`. Motif: thin animated diagrams of rails / institutions, not 3D coin porn. Plus a Vimeo embed titled **“Quant Bridge Animation”** (`player.vimeo.com/video/1086747791`). Redraw as a two-bank span, never re-host the file.

5. **London aerial closer.** CTA band uses `london-areal.jpg` (2022/03) under white type (`fwhite`) — a high, cool, slightly hazy city plate. Motif: one real city as the closer, not a globe stock loop.

6. **Three-column “Who we serve” with hairline rules.** Corporates / Banks / Capital Markets sit in a `column-lines line-amount-3` grid with vertical and horizontal rules. Motif: three equal shafts, not cards with drop shadows.

7. **Overledger docs — line-art “motionary” illustrations on ReadMe.** Hub SVGs (do not hotlink): `motionary-developers.svg`, `puzzle-600px.svg`, `interoperability-solved.svg`, plus `currencies-01.png`. Motif: pale paper, ink-line puzzles and currency glyphs. Docs copy organises the product as a **twelve-chapter manual** with a path table — a motif for the library IA, not a visual skin.

8. **UK Finance — Getty / campaign banners + certification footer.** Homepage and GBTD pages use wide cropped photography (`page_banner` / `teaser`) and a footer row of small institutional marks (Cyber Essentials Plus, Living Wage, Race at Work, Women in Finance, BSI ISO/IEC 27001, Social Mobility Pledge, Disability Confident, Skills Compact, CPD). Motif: **trade-body seriousness** — photo crop + date stamp `DD.MM.YY` (homepage) or `26 Sep 2025` (press). Do not copy the marks.

9. **IETF Datatracker — institutional table, not a brand system.** SATP About is a white page, skip-link, navy text links, and a **definition table** (WG / Acronym / Area / State / Charter / Personnel / Mailing list). Motif: a specification card. Charter language to keep in diagrams: gateway-to-gateway transfer, ACID, one valid network at a time.

10. **Cookie / consent slab.** Quant’s first paint is a legal overlay (Decline / Accept) before the story. Not a brand motif to celebrate — a reminder the official site is a marketing CMS, not a research desk.

---

## 5. Official bank / cohort naming (exact strings)

### UK Finance press release, 26 September 2025

> Participating firms currently include **Barclays, HSBC, Lloyds Banking Group, NatWest, Nationwide, and Santander**, with support from **Quant, EY and Linklaters**.

Quote bylines on the **same** page (do not collapse):

| Printed name in byline | Spoken / body form in the quote |
| --- | --- |
| **Lloyds** — Peter Left, Head of Digital Markets and Innovation at Lloyds | “**Lloyds** is pleased…” |
| **Barclays** — Ryan Hayward, Barclays, Head of Digital Assets | — |
| **HSBC** — John O’Neill, Group Head of Digital Assets & Currencies at HSBC | — |
| **Nationwide** — Isabel Pitt, Deputy Payments Director at Nationwide | “As a **mutual**…” |
| **Natwest Group** — Lee McNabb, Payments and Digital Assets Lead, Natwest Group | Note spelling **Natwest** in the byline vs **NatWest** in the firm list |
| **Santander UK** — Paul Horlock, Chief Payments Officer at Santander UK | “**Santander UK** supports the GBTD pilot…” |

The press list says **Lloyds Banking Group**. The quote says **Lloyds**. It does **not** say “Lloyds Bank”. QntDesk’s current `GBTD_BANKS` entry `Lloyds Bank` is a desk convention, not the UK Finance list string.

### UK Finance GBTD programme page (fetched 13 Sep 2026)

Title on the page: **“Tokenised sterling deposits”**  
Kicker: **“Delivering tokenised sterling deposits - the Great British Tokenised Deposit initiative”**

> Participating firms currently include **Barclays, HSBC, Lloyds Banking Group, Monzo, NatWest, Nationwide, and Santander**, with support from **Quant, EY and Linklaters**.

Also printed on that page, as headings/body (not dated):

- **“Monzo become 7th GBTD participant’”** (apostrophe as on the page)
- “We are delighted to announce that **Monzo** has joined the GBTD project as its **7th participant**.”
- **“GBTD part of the BoE Synchronisation Lab”** — “the Great British Tokenised Deposits (GBTD) project has been accepted to be part of the Bank of England’s Synchronisation Lab work this year.”

**Desk action:** the live encyclopedia still lists six issuers and omits Monzo. File Monzo only from this UK Finance page (or a later dated press note). Do not invent a join date.

### Quant homepage (fetched 13 Sep 2026)

> We’ve worked on the **digital pound, digital euro, UK RLN and Great British Tokenised Deposits (GBTD)**.

That is Quant’s own adjacency sentence. It is **not** a Bank of England endorsement of GBTD, and it is **not** a claim that GBTD is a digital pound.

### Quant Synchronisation Lab press, 13 February 2026

Exact caution printed by Quant:

> Participation in the Synchronisation Lab involves experimentation and technical validation within a **non-live** environment. It does **not** represent approval, endorsement, or adoption by the Bank of England, nor does it imply any role in determining future RTGS policy or design.

Use-case name on that page: **“synchronised multi-bank treasury rebalancing for corporate liquidity optimisation”** via **Quant Flow** and **PayScript®**, against a **simulated RT2**.

### IETF SATP About (fetched 13 Sep 2026)

- WG name: **Secure Asset Transfer Protocol**
- Acronym: **satp**
- Area: Applications and Real-Time **(art)**
- State: **Active**
- Chairs (as printed): **Claire**, **Wes Hardaker**
- Charter milestone table: SATP Architecture, SATP Core, SATP Use-Cases — target **2026-11-30** for IETF approval of the three documents.

Shepherd write-up in the Atom feed names **Quant Network** as one implementation instance alongside IBM / Hyperledger Cacti. That is a shepherd sentence, not an RFC.

---

## 6. How Bloomberg / Reuters / FT-style desks structure a library

From rag-web-browser / web-fetch of **public marketing pages only** (not a Terminal, Reuters Connect, or FT.com subscriber library). Paywalls and login products were not entered.

### Bloomberg Professional — Terminal + Research

Sources: [Bloomberg Terminal](https://professional.bloomberg.com/products/bloomberg-terminal/), [Research Solutions](https://professional.bloomberg.com/products/bloomberg-terminal/research/).

Observed IA:

- **One pane, many functions** — the public pitch is a single integrated workspace: data, news, research, analytics, execution, collaboration.
- **Named product tiles** on the Terminal page: Research, News, Access, Charts, Collaboration Tools, Education, Portfolio Analytics.
- **Research is a suite, not a blog.** Sub-brands: Bloomberg Intelligence, BloombergNEF, Bloomberg Economics, BQuant Desktop, Bloomberg Index Research, Research Management Solutions, Regulatory Intelligence.
- **Consume / manage / create / share** in one environment; AI (ASKB) is presented as a layer **on** existing workflows, not a replacement library.
- **Insights rail** is typed (`Article` / `Report`) and **categorised** (Regional Analysis, Regulation, Technology, Commodities, Data) with a “View all Insights” index.
- **Launchpad** language: customised workspace, alerts, monitors — i.e. the library is a *console*, not a chronological magazine.

Implication for QntDesk: keep **lanes** (Official / Industry / Markets / Standards), a **typed card** (press, perspective, draft, report), and a **category** that is not the publisher’s logo.

### Reuters Agency — About

Source: [reutersagency.com/about/](https://reutersagency.com/about/).

Observed IA:

- **Wire, not a magazine.** “Live. First. Fast.” Counts (journalists, countries, languages, stories, pictures, video) sit above narrative.
- **Trust Principles** as a first-class object, separate from product SKUs.
- **Content types** named: breaking news, comprehensive reports, multimedia, authenticated content, ready-to-publish, verified UGC, live video.
- **Delivery is a product:** API integrations, topical/regional **feeds**, **Reuters Connect** as the workflow surface.
- **Coverage desks** as browse facets (Sports, Technology, Events) — a small number of deep wells, not a tag cloud.

Implication: official SATP/UK Finance/Quant filings should enter the river as **wire copy** (title, source, timestamp, canonical URL). Long encyclopaedia essays stay on `/research` and `/programmes`.

### Financial Times — About Us

Failed URL: `https://aboutus.ft.com/what-we-do` → **404**. Recovered: [aboutus.ft.com](https://aboutus.ft.com/).

Observed IA (four shafts, not a feed):

- **Company** — the Group, journalist count, FT Specialist, JVs.
- **Services** — news and analysis **plus** “leadership services that put our content and expertise to practical use.”
- **Careers**
- **News** — announcements / communications (the *house* newsroom, distinct from ft.com).

Implication: separate **house filings** (this brief, ACTIVE_THESIS) from **the public river**. FT’s public about-page does not expose the subscriber research library; do not pretend we saw Lex, FT Alphaville, or FT Professional stacks.

---

## 7. What this brief does *not* authorise

- Hotlinking Quant / UK Finance / IETF / Bloomberg / Reuters / FT images, Lottie, or wordmarks.
- Treating GBTD as a CBDC, or the Synchronisation Lab as live RTGS.
- Treating SATP as a Quant SKU.
- Filing Quantinuum (Nasdaq: QNT) as Quant Network news.
- Adding **Monzo** to `GBTD_BANKS` without a dated source beyond the undated programme-page sentence (the page itself is enough to *note* the seventh name; pick a product rule before changing the wordmark row).

---

## Sources

- [Quant homepage](https://quant.network/) (13 Sep 2026)
- [Quant Overledger platform](https://quant.network/overledger-platform) (13 Sep 2026)
- [Quant news listing](https://quant.network/news/) (13 Sep 2026)
- [Quant WordPress feed](https://quant.network/feed/) (13 Sep 2026)
- [Quant Synchronisation Lab press](https://quant.network/press-releases/quant-selected-to-participate-in-the-bank-of-englands-synchronisation-lab/) (13 Feb 2026)
- [Quant Developer Hub](https://docs.overledger.dev/) (13 Sep 2026)
- [Overledger docs — Start Here](https://docs.overledger.dev/docs/start-here) (13 Sep 2026)
- [UK Finance homepage](https://www.ukfinance.org.uk/) (13 Sep 2026)
- [UK Finance GBTD press release](https://www.ukfinance.org.uk/news-and-insight/press-release/uk-finance-announces-live-pilot-phase-deliver-tokenised-sterling) (26 Sep 2025)
- [UK Finance — Tokenised sterling deposits / RLN](https://www.ukfinance.org.uk/regulated-liability-network) (fetched 13 Sep 2026)
- [UK Finance digital markets press](https://www.ukfinance.org.uk/news-and-insight/press-release/uk-finance-sets-out-roadmap-accelerate-digital-market-adoption) (8 Sep 2026)
- [IETF SATP About](https://datatracker.ietf.org/group/satp/about/) (13 Sep 2026)
- [IETF SATP documents Atom](https://datatracker.ietf.org/group/satp/documents/feed/) (13 Sep 2026)
- [Disruption Banking — Fusion Rollup](https://www.disruptionbanking.com/2026/06/03/quants-fusion-rollup-goes-live-unifying-74-blockchains-for-institutions/) (3 Jun 2026)
- [Bloomberg Terminal](https://professional.bloomberg.com/products/bloomberg-terminal/) (13 Sep 2026)
- [Bloomberg Research Solutions](https://professional.bloomberg.com/products/bloomberg-terminal/research/) (13 Sep 2026)
- [Reuters Agency — About](https://reutersagency.com/about/) (13 Sep 2026)
- [FT About Us](https://aboutus.ft.com/) (13 Sep 2026; `/what-we-do` 404)
- [Google News RSS (desk query)](https://news.google.com/rss/search?q=%22Quant+Network%22+OR+Overledger+OR+QNT&hl=en-GB&gl=GB&ceid=GB:en) (13 Sep 2026; flattened; Quantinuum-heavy)
- Apify Store cards: [web-fetch](https://apify.com/apify/web-fetch), [rag-web-browser](https://apify.com/apify/rag-web-browser), [website-content-crawler](https://apify.com/apify/website-content-crawler), [google-news-scraper-fast](https://apify.com/data_xplorer/google-news-scraper-fast)
