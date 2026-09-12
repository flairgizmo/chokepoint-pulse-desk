import {
  chaptersFor,
  chaptersNewestFirst,
  didYouKnow,
  featuredPapers,
  paperById,
  paperRegions,
  papersNewestFirst,
  type PaperRegion,
  quotesFor,
  quotesForPerson,
  sourceUrl,
  sources,
  QNT_CONTRACT,
  QNT_BURN_TX,
  type Chapter,
  type Paper,
  type Quote,
} from '../data/catalog';
import { CITIES, type City } from '../data/cities';
import { GROUP_LABEL, PEOPLE, type Person, type PersonGroup } from '../data/people';
import { GLOSSARY } from '../data/glossary';
import { featuredNote, notesForEra, notesFromDesk, noteById, type NoteEra, type NotePost } from '../data/notes';
import { episodesInOrder, episodeById, episodeByN } from '../data/podcast';
import { CALENDAR, GBTD_BANKS, MONEY_LAYERS, OFFICIAL_VOICES, SATP_STAGES, THIS_MONTH, TIMELINE } from '../data/timeline';
import type { MarketPrint } from '../modules/markets';
import type { NewsRiver } from '../modules/news';
import { esc, extLink, fmtMoney, fmtPct, fmtQty } from './html';
import { markFor } from '../data/marks';
import { playerMarkup, relatedEpisodeCard } from './player';

export const DISCLAIMER =
  'Educational research. Names, marks and documents belong to their owners. Nothing here is financial advice. Crypto is volatile.';

export function kicker(text: string): string {
  return `<p class="kicker"><i class="section-dot" aria-hidden="true"></i>${esc(text)}</p>`;
}

function displayTitle(title: string, mute = ''): string {
  if (!mute) return esc(title);
  return `${esc(title)} <span class="display-mute">${esc(mute)}</span>`;
}

type VisualId = 'hero' | 'history' | 'gateway' | 'sterling' | 'future' | 'london';

export function pageHero(k: string, title: string, lede: string, mute = '', bed?: VisualId): string {
  return `<header class="page-hero">
    ${bed ? `<div class="page-stage">${visualBed(bed, 'page-bed')}</div>` : ''}
    ${kicker(k)}
    <div class="hero-split">
      <h1 class="display">${displayTitle(title, mute)}</h1>
      <p class="lede">${esc(lede)}</p>
    </div>
  </header>`;
}

function pill(href: string, label: string, hover: string, kind: 'primary' | 'ghost' = 'primary'): string {
  return `<a class="btn btn-${kind}" href="${esc(href)}"><span class="btn-swap"><span>${esc(label)}</span><span>${esc(hover)}</span></span><span class="btn-arrow" aria-hidden="true">↗</span></a>`;
}

function visualBed(id: VisualId, cls = 'visual-bed'): string {
  const src = `/visuals/stills/${id}.jpg`;
  return `<img class="${esc(cls)}" src="${esc(src)}" alt="" width="1920" height="1080" decoding="async" />`;
}

function constellation(): string {
  const nodes: Array<[string, string, string]> = [
    ['Overledger', sources.overledger, 'Gateway OS'],
    ['PayScript', sources.payscript, 'Programmability'],
    ['GBTD', sources.gbtdUkFinance, 'UK Finance'],
    ['SATP', sources.satpCore, 'IETF draft'],
    ['2018 paper', sources.whitepaperUcl, 'UCL Discovery'],
    ['Fusion', sources.fusionMainnet, 'Layer 2.5'],
    ['x402', sources.x402Org, 'Linux Foundation'],
    ['Quant', sources.about, 'quant.network'],
    ['Docs', 'https://docs.overledger.dev/', 'Developer hub'],
    ['@quantnetwork', 'https://x.com/quantnetwork', 'Official'],
    ['@OverledgerDev', 'https://x.com/OverledgerDev', 'Builders'],
    ['@gverdian', 'https://x.com/gverdian', 'Founder'],
  ];
  return `<section class="constellation">
    ${kicker('Open the sources')}
    <div class="section-head">
      <h2 class="display">The network, as links.</h2>
      <p class="lede-sm">Official pages, the 2018 paper, and the rooms this story actually sits in.</p>
    </div>
    <ul class="constellation-grid">${nodes
      .map(
        ([label, href, sub]) =>
          `<li><a href="${esc(href)}" target="_blank" rel="noopener noreferrer"><strong>${esc(label)}</strong><span>${esc(sub)}</span></a></li>`,
      )
      .join('')}</ul>
  </section>`;
}

function filmRail(): string {
  const films: Array<{ title: string; href: string; who: string; kind: string; thumb?: string }> = [
    {
      title: 'Hyperledger in Depth',
      href: sources.hyperledgerRileyYt,
      who: 'Dr Luke Riley · LF Decentralized Trust',
      kind: 'YouTube',
      thumb: 'https://i.ytimg.com/vi/IfXSET1rEOE/hqdefault.jpg',
    },
    {
      title: 'Joining Forces for Standardisation',
      href: sources.belchiorInatbaYt,
      who: 'INATBA interoperability session, 2024',
      kind: 'YouTube',
      thumb: 'https://i.ytimg.com/vi/IoBPkzz37vw/hqdefault.jpg',
    },
    {
      title: 'Hyperledger Cacti workshop',
      href: sources.cactiWorkshopYt,
      who: 'LF Decentralized Trust · blockchain interoperability',
      kind: 'YouTube',
      thumb: 'https://i.ytimg.com/vi/TM-dnP2yzRM/hqdefault.jpg',
    },
    {
      title: 'Formalizing interoperability',
      href: sources.formalizingInteropYt,
      who: 'Rafael Belchior and Dhinakaran Vinayagamurthy',
      kind: 'YouTube',
      thumb: 'https://i.ytimg.com/vi/PMoEGHOr9-U/hqdefault.jpg',
    },
    {
      title: 'An hour with Quant Network',
      href: sources.hyperledgerRileyTalk,
      who: 'LF Decentralized Trust webinar page',
      kind: 'Talk',
    },
    {
      title: 'Overledger platform',
      href: sources.overledger,
      who: 'Official product page',
      kind: 'quant.network',
    },
    {
      title: 'GBTD — UK Finance',
      href: sources.gbtdUkFinance,
      who: 'Live tokenised sterling deposits',
      kind: 'Press',
    },
    {
      title: '2018 whitepaper',
      href: sources.whitepaperUcl,
      who: 'Verdian, Tasca, Paterson, Mondelli',
      kind: 'UCL',
    },
    {
      title: 'SATP Core',
      href: sources.satpCore,
      who: 'IETF draft — not a Quant SKU',
      kind: 'Standards',
    },
    {
      title: 'IFGS 2026 panel',
      href: sources.ifgs2026,
      who: 'UK multi-money ecosystem — Quant’s note',
      kind: 'Event',
    },
    {
      title: 'Sibos 2025',
      href: sources.sibos2025,
      who: 'Quant on the industry floor',
      kind: 'Event',
    },
    {
      title: 'Three-layer digital money',
      href: sources.threeLayer,
      who: 'Gilbert Verdian · 23 April 2026',
      kind: 'Essay',
    },
  ];
  return `<section class="film-rail">
    ${kicker('Watch and read')}
    <div class="section-head">
      <h2 class="display">Interviews, conferences, the original pages.</h2>
      <p class="lede-sm">Publisher thumbnails. Official rooms. Click through and you leave for the source.</p>
    </div>
    <ul class="film-grid">${films
      .map(
        (f) => `<li>
          <a class="film-card${f.thumb ? ' has-thumb' : ''}" href="${esc(f.href)}" target="_blank" rel="noopener noreferrer">
            <img src="${esc(f.thumb ?? '/visuals/stills/gateway.jpg')}" alt="" width="480" height="270" loading="lazy" />
            <div>
              <p class="kicker">${esc(f.kind)}</p>
              <strong>${esc(f.title)}</strong>
              <span>${esc(f.who)}</span>
            </div>
          </a>
        </li>`,
      )
      .join('')}</ul>
  </section>`;
}

function chapterCard(c: Chapter): string {
  return chapterReveal(c, false);
}

function chapterReveal(c: Chapter, open = false): string {
  return `<details class="reveal chapter" id="${esc(c.id)}"${open ? ' open' : ''}>
    <summary>
      ${kicker(c.kicker)}
      <h2>${esc(c.title)}</h2>
    </summary>
    <div class="reveal-body"><p>${esc(c.body)}</p></div>
  </details>`;
}

function quoteCard(q: Quote): string {
  return `<blockquote class="quote-card">
    <span class="qmark" aria-hidden="true">“</span>
    <p>${esc(q.text)}</p>
    <footer>
      <strong>${esc(q.who)}</strong>
      <span>${esc(q.role)}</span>
      ${extLink(sourceUrl(q.href), 'Read the source')}
      ${q.note ? `<p class="note">${esc(q.note)}</p>` : ''}
    </footer>
  </blockquote>`;
}

function quoteRail(page?: string, limit = 6): string {
  const list = quotesFor(page).slice(0, limit);
  if (!list.length) return '';
  const [first, ...rest] = list;
  return `<section class="quote-rail">
    ${kicker('In their words')}
    <h2 class="display">The people building the Internet of Value.</h2>
    ${quoteCard(first).replace('class="quote-card"', 'class="quote-card quote-feature"')}
    ${rest.length ? `<div class="quote-scroll">${rest.map(quoteCard).join('')}</div>` : ''}
  </section>`;
}

function stackVisual(): string {
  const rungs = [
    ['apps', 'Flow Applications', 'MCP-callable workflows. Agents and humans run the same steps.'],
    ['script', 'PayScript', 'Programmability at the account. Named in the GBTD stack.'],
    ['fusion', 'Fusion', 'Layer 2.5 multi-ledger rollup. Trusted Node is who processes it.'],
    ['gate', 'Overledger · QuantNet', 'Gateway OS. The bank-facing name for the same architecture.'],
    ['ledgers', 'Ledgers & rails', 'Fabric, Ethereum, Corda, RTGS, SWIFT, Faster Payments. The gateway maps; it does not replace.'],
  ];
  return `<section class="stack-visual">
    ${kicker('The stack')}
    <h2 class="display">How the products sit. <span class="display-mute">One gate, many ledgers.</span></h2>
    <ol class="stack-rungs">${rungs
      .map(
        ([id, title, body]) =>
          `<li data-rung="${esc(id)}"><strong>${esc(title)}</strong><span>${esc(body)}</span></li>`,
      )
      .join('')}</ol>
  </section>`;
}

function layerBands(): string {
  return `<ol class="layer-bands">${MONEY_LAYERS.map(
    (l) =>
      `<li data-band="${esc(l.n)}"><span class="n">${esc(l.n)}</span><div><h3>${esc(l.title)}</h3><p>${esc(l.body)}</p></div></li>`,
  ).join('')}</ol>`;
}

function dateStamp(iso: string): { day: string; rest: string } {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (day) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { day: String(Number(day[3])), rest: `${months[Number(day[2]) - 1]} ${day[1]}` };
  }
  const quarter = /^(\d{4})-Q(\d)$/.exec(iso);
  if (quarter) return { day: `Q${quarter[2]}`, rest: quarter[1] };
  return { day: iso, rest: '' };
}

function wordmarkLi(label: string, href: string): string {
  const external = href.startsWith('http');
  const mark = markFor(label);
  const tile = mark
    ? `<img class="wm-logo" src="${esc(mark)}" alt="" width="56" height="56" />`
    : `<span class="wm" aria-hidden="true">${esc(label[0] ?? '?')}</span>`;
  return `<li class="wordmark">${tile}<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}</a></li>`;
}

function storyArt(id: string, era: NoteEra): string {
  const named: Record<string, string> = {
    'trusted-node': '/visuals/stories/city.jpg',
    gbtd: '/visuals/stills/sterling.jpg',
    'not-cbdc': '/visuals/stories/boe.jpg',
    overledger: '/visuals/stills/gateway.jpg',
    satp: '/visuals/stories/bis.jpg',
  };
  if (named[id]) return named[id];
  const beds: Record<NoteEra, string[]> = {
    history: ['/visuals/stills/history.jpg', '/visuals/stories/exchange.jpg', '/visuals/stills/london.jpg'],
    present: ['/visuals/stories/boe.jpg', '/visuals/stills/sterling.jpg', '/visuals/stories/city.jpg', '/visuals/stories/canary.jpg'],
    future: ['/visuals/stills/future.jpg', '/visuals/stories/bis.jpg', '/visuals/stills/gateway.jpg'],
  };
  const list = beds[era];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 3)) % 997;
  return list[hash % list.length] ?? '/visuals/stills/london.jpg';
}

function filterBox(id: string, placeholder: string, value: string, extra = ''): string {
  return `<div class="toolbar filter-bar">
    <input type="search" id="${esc(id)}" placeholder="${esc(placeholder)}" value="${esc(value)}" />
    ${extra}
  </div>`;
}

export function sparklineSvg(values: number[]): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 560;
  const h = 120;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const up = values[values.length - 1] >= values[0];
  const stroke = up ? '#0f7a4a' : '#c62828';
  const fill = up ? 'rgba(15,122,74,0.14)' : 'rgba(198,40,40,0.12)';
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Seven-day CoinGecko sparkline"><polygon fill="${fill}" points="${pts} ${w},${h} 0,${h}"/><polyline fill="none" stroke="${stroke}" stroke-width="3" points="${pts}"/></svg>`;
}

function dykBlock(): string {
  const items = didYouKnow.slice(0, 4);
  const list = items
    .map(
      (d) => `<li class="dyk-card">
        <p class="kicker">${esc(d.category)}</p>
        <details>
          <summary class="dyk-q">${esc(d.q)}</summary>
          <p>${esc(d.a)}</p>
        </details>
        <a class="text-link" href="${esc(d.to || '/')}">${esc(d.cta || 'Open')} →</a>
      </li>`,
    )
    .join('');
  return `<section class="dyk">
    ${kicker('Did you know')}
    <h2 class="display">The future of money, <span class="display-mute">as a question.</span></h2>
    <ul class="dyk-list">${list}</ul>
    <p><a class="text-link" href="/news">The official wire →</a></p>
  </section>`;
}

function noteCard(n: NotePost, featured = false): string {
  const href = n.href?.startsWith('http') ? n.href : n.related || '/news';
  const external = href.startsWith('http');
  const teaser = n.body.length > 140 ? `${n.body.slice(0, 140).trim()}…` : n.body;
  return `<a class="note-card news-card${featured ? ' is-feature' : ''}" data-era="${esc(n.era)}" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
    <img class="note-art" src="${esc(storyArt(n.id, n.era))}" alt="" width="720" height="420" loading="lazy" />
    <p class="kicker">${esc(n.kicker)} · ${esc(n.era)}</p>
    <h3>${esc(n.title)}</h3>
    <p>${esc(teaser)}</p>
    <span class="text-link">${external ? 'Open the source' : 'Open the chapter'} →</span>
  </a>`;
}

function eraStrip(): string {
  return `<section class="era-strip" id="eras">
    ${kicker('History · Present · Future')}
    <h2 class="display">Three chapters. <span class="display-mute">One network of networks.</span></h2>
    <ol class="era-grid">
      <li data-era="history">
        ${visualBed('history', 'era-bed')}
        <div class="era-copy">
        <p class="kicker">History</p>
        <h3>2015–2023</h3>
        <p>Verdian proposes ISO/TC 307. The 2018 whitepaper files Overledger as a gateway operating system. Unsold QNT is burned. LACChain is announced with IDB Lab in 2021. Rosalind, a BIS Innovation Hub London and Bank of England API experiment, concludes in 2023.</p>
        <a class="text-link" href="/news">The wire →</a>
        </div>
      </li>
      <li data-era="present">
        ${visualBed('sterling', 'era-bed')}
        <div class="era-copy">
        <p class="kicker">Present</p>
        <h3>2024–2026</h3>
        <p>UK Finance’s RLN phase, then GBTD on 26 September 2025: Quant as technology partner with ${GBTD_BANKS.join(', ')}. 2026 adds Dentsu Soken, the Synchronisation Lab, Murex MX.3, ISO/TS 23516, and Sibos Miami stand DISL51.</p>
        <a class="text-link" href="/programmes">Named rooms →</a>
        </div>
      </li>
      <li data-era="future">
        ${visualBed('future', 'era-bed')}
        <div class="era-copy">
        <p class="kicker">Future</p>
        <h3>Still ahead</h3>
        <p>The Economic Secretary’s 8 September 2026 speech at UK Finance names a DIGIT gilt in Q1 2027. Quant’s published claim is that programmable bank money is how deposits and agent payments settle.</p>
        <a class="text-link" href="/vision">The thesis →</a>
        </div>
      </li>
    </ol>
  </section>`;
}

function featuredStory(): string {
  const n = featuredNote();
  return `<section class="featured-note">
    ${kicker('Featured news')}
    <img class="visual-bed" src="/visuals/stories/city.jpg" alt="" width="1920" height="1080" decoding="async" />
    <div class="featured-grid">
      ${noteCard(n, true)}
      <div class="featured-aside">
        <p class="kicker">Why this desk exists</p>
        <h2 class="display">A correspondent’s map of Quant. <span class="display-mute">The rooms, named.</span></h2>
        <p>The Internet of Value is already a banking story: six UK banks programming sterling deposits on Overledger. QNT is the utility token of that network. Read it as a magazine would — latest first, names and titles on every quote.</p>
        <div class="cta-row">
          ${pill('/news', 'Open the news', 'Official wire')}
          ${pill('/podcast', 'Start the series', 'From the beginning', 'ghost')}
        </div>
      </div>
    </div>
  </section>`;
}

function latestStrip(): string {
  const month = [...THIS_MONTH].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title)).slice(0, 3)
    .map((n) => {
      const stamp = dateStamp(n.date);
      return `<li class="month-card">
        <time datetime="${esc(n.date)}"><span class="day">${esc(stamp.day)}</span><span class="rest">${esc(stamp.rest)}</span></time>
        <p class="mono">${esc(n.source)}</p>
        <h3>${esc(n.title)}</h3>
        ${extLink(sourceUrl(n.href), 'Open the source')}
      </li>`;
    })
    .join('');
  const first = episodeByN(1);
  return `<section class="latest-strip">
    ${kicker('Latest')}
    <div class="section-head">
      <h2 class="display">On the record this month.</h2>
      <a class="text-link" href="/news">The wire →</a>
    </div>
    <ul class="month-cards">${month}</ul>
    ${first ? relatedEpisodeCard(first.id) : ''}
  </section>`;
}

function podcastTease(): string {
  const cards = episodesInOrder()
    .slice(0, 4)
    .map((e) => relatedEpisodeCard(e.id))
    .join('');
  return `<section class="pod-home">
    ${kicker('Podcast')}
    <div class="section-head">
      <h2 class="display">Twenty conversations. The Quant story, from the beginning.</h2>
      <a class="text-link" href="/podcast">Start the series →</a>
    </div>
    <div class="pod-tease-grid">${cards}</div>
  </section>`;
}

function notesReel(): string {
  const featuredId = featuredNote().id;
  const cards = notesFromDesk()
    .filter((n) => n.id !== featuredId)
    .slice(0, 10)
    .map((n) => noteCard(n))
    .join('');
  return `<section class="notes-strip">
    ${kicker('News')}
    <div class="section-head">
      <h2 class="display">Scroll the record. <span class="display-mute">Each card opens the source.</span></h2>
      <a class="text-link" href="/news">The wire →</a>
    </div>
    <div class="notes-reel" tabindex="0">${cards}</div>
  </section>`;
}

export function renderHome(): string {
  const banks = GBTD_BANKS.map((b) => wordmarkLi(b, '/programmes#gbtd')).join('');
  const beats = [...TIMELINE].reverse().map(
    (t) => `<li class="beat"><span class="year">${esc(t.year)}</span><div><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div></li>`,
  ).join('');
  const essays = ['philosophy', 'future', 'era']
    .map((id) => chaptersFor('vision').find((c) => c.id === id))
    .filter((c): c is Chapter => Boolean(c))
    .map((c) => {
      const teaser = c.body.length > 210 ? `${c.body.slice(0, 210).trim()}…` : c.body;
      return `<article class="panel essay-card">
        ${kicker(c.kicker)}
        <h3 class="display">${esc(c.title)}</h3>
        <p>${esc(teaser)}</p>
        <a class="text-link" href="/vision#${esc(c.id)}">Read →</a>
      </article>`;
    })
    .join('');
  return `
    <section class="masthead masthead-lockup">
      <div class="hero-stage">
        ${visualBed('hero', 'hero-bed')}
        <canvas id="gateway" class="gateway-stage" role="img" aria-label="Interactive three-layer digital money lattice. Drag to orbit. Click a layer."></canvas>
        <p class="tess-hint" data-gateway-hint>Drag to orbit the three layers. Click a ring. Overledger is the lattice.</p>
      </div>
      ${kicker('The Internet of Value')}
      <div class="hero-split">
        <h1 class="display">The future of Quant is already in the banks. <span class="display-mute">The history is why it works.</span></h1>
        <div>
          <p class="lede">Overledger is the gateway that lets money talk. QNT is the utility token of that network. GBTD is live tokenised sterling with Barclays, HSBC, Lloyds, NatWest, Nationwide and Santander. The rooms are named. The sterling is live. James Hale and Amelia Crowe walk the decade in twenty conversations.</p>
          <div class="cta-row">
            ${pill('/news', 'Open the news', 'Official wire')}
            ${pill('/podcast', 'Start the series', 'From the beginning')}
            ${pill('/vision', 'Read the thesis', 'The argument', 'ghost')}
          </div>
        </div>
      </div>
    </section>

    ${constellation()}
    ${filmRail()}
    ${latestStrip()}
    ${featuredStory()}
    ${notesReel()}
    ${podcastTease()}
    ${quoteRail('home', 10)}
    ${eraStrip()}

    <section class="earth-hero" data-proof="hero">
      <div class="earth-stage" id="earth-stage" tabindex="0" aria-label="Interactive 3D Earth. Drag to orbit, scroll to zoom, double-click to fly in, click a city."></div>
      <div class="earth-hud">
        <div class="hud-card">
          <p class="kicker"><i class="section-dot" aria-hidden="true"></i>Earth · look-down</p>
          <p class="hud-help">Military-style ISR · scroll to zoom · double-click to drop altitude</p>
          <label class="sr-only" for="city-select">Cities</label>
          <select id="city-select">${CITIES.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select>
        </div>
        <div class="hud-tools">
          <button type="button" data-zoom="-0.4" aria-label="Zoom out">−</button>
          <span id="zoom-readout" class="mono">1.0×</span>
          <button type="button" data-zoom="0.4" aria-label="Zoom in">+</button>
          <button type="button" data-reset-globe aria-label="Reset view">↺</button>
        </div>
        <details class="hud-more">
          <summary>Overlays</summary>
          <fieldset class="hud-toggles">
            <legend class="sr-only">Globe overlays</legend>
            <label><input type="checkbox" data-globe-opt="spin" /> Slow rotate</label>
            <label><input type="checkbox" data-globe-opt="labels" checked /> City labels</label>
            <label><input type="checkbox" data-globe-opt="day" checked /> Day marble</label>
            <label><input type="checkbox" data-globe-opt="night" checked /> Night lights</label>
            <label><input type="checkbox" data-globe-opt="routes" checked /> Settlement routes</label>
            <label><input type="checkbox" data-globe-opt="corridors" checked /> Token corridors</label>
            <label><input type="checkbox" data-globe-opt="activity" checked /> Activity</label>
          </fieldset>
          <ul class="kind-legend">
            ${['Headquarters', 'Banking', 'Lab', 'Standards', 'Research', 'Markets'].map((k) => `<li data-kind="${esc(k)}">${esc(k)}</li>`).join('')}
          </ul>
        </details>
        <div class="hud-city" id="city-hover" hidden></div>
        <p class="isr-line mono" id="isr-line">LOOK-DOWN · sourced programme corridors</p>
      </div>
    </section>

    ${renderLiveRail()}

    <section class="strip">
      ${kicker('GBTD cohort — the six commercial banks named by UK Finance')}
      <ul class="wordmarks">${banks}</ul>
      ${kicker('The institutions around that cohort')}
      <ul class="wordmarks muted">
        ${wordmarkLi('Quant', sources.about)}
        ${wordmarkLi('UK Finance', sources.ukFinanceHome)}
        ${wordmarkLi('Bank of England', sources.boeHome)}
        ${wordmarkLi('BIS', sources.bisHome)}
        ${wordmarkLi('IETF', sources.satpCore)}
        ${wordmarkLi('Linux Foundation', sources.linuxX402)}
        ${wordmarkLi('Oracle', sources.oracleBlog)}
        ${wordmarkLi('Murex', sources.murexNews)}
      </ul>
    </section>

    <section class="essays">
      ${kicker('Essays')}
      <h2 class="display">Philosophy. The future of money. <span class="display-mute">The interop era.</span></h2>
      <div class="essay-grid">${essays}</div>
    </section>

    <section class="layers-wrap">
      ${kicker('Three layers, one horizontal gate')}
      <h2 class="display">Each band is a different liability. <span class="display-mute">The gate is Overledger.</span></h2>
      ${layerBands()}
    </section>

    <section class="timeline-wrap">
      ${kicker('Then and now')}
      <h2 class="display">A decade of connecting, <span class="display-mute">not replacing.</span></h2>
      <ol class="timeline">${beats}</ol>
    </section>

    ${renderThisMonth(true)}
    ${renderCalendar(true)}
    ${renderVoices()}

    <section class="triptych hex">
      <article class="panel"><span class="panel-n">01</span>${kicker('Thesis')}<h2 class="display">A gateway OS</h2><p>Multi-DLT and multi-legacy connectivity without forcing a new settlement chain. Tasca called it a risky necessity. Verdian built a company on that sentence.</p><a class="text-link" href="/vision">Vision →</a></article>
      <article class="panel"><span class="panel-n">02</span>${kicker('SATP')}<h2 class="display">How assets move between networks</h2><p>Secure Asset Transfer Protocol is IETF work Quant helps write. Stage three is burn-and-mint under two-phase commit — the asset in one place when the transfer ends.</p><a class="text-link" href="/standards">Standards →</a></article>
      <article class="panel"><span class="panel-n">03</span>${kicker('GBTD')}<h2 class="display">Live sterling, programmed</h2><p>UK Finance selected Quant as technology partner for tokenised deposits with six banks. The banks owe the holder. Overledger runs the rails.</p><a class="text-link" href="/cbdc">The distinction →</a></article>
      <article class="panel"><span class="panel-n">04</span>${kicker('Tokenomics')}<h2 class="display">Why QNT exists</h2><p>An ERC-20, burned down in 2018. Overledger licences settle in it. Live price and circulating come from CoinGecko. Utility token, not equity.</p><a class="text-link" href="/markets#tokenomics">Markets →</a></article>
      <article class="panel"><span class="panel-n">05</span>${kicker('Stack')}<h2 class="display">Overledger, Fusion, PayScript</h2><p>Gateway OS, multi-ledger rollup, programming layer. Oracle and Murex sit on top of that sentence, not beside a new chain.</p><a class="text-link" href="/technology">The stack →</a></article>
      <article class="panel"><span class="panel-n">06</span>${kicker('Programmes')}<h2 class="display">The rooms Quant is already in</h2><p>LACChain in 2021. Rosalind in 2023. GBTD in 2025. Dentsu Soken, Murex, the Bank of England lab in 2026. A chronology of rooms, each one named.</p><a class="text-link" href="/programmes">Programmes →</a></article>
    </section>

    ${dykBlock()}
  `;
}

export function renderChapterPage(
  page: string,
  title: string,
  lede: string,
  k: string,
  extra = '',
  mute = '',
): string {
  const body = chaptersFor(page).map(chapterCard).join('');
  const bed: VisualId = page === 'vision' ? 'future' : page === 'technology' ? 'gateway' : page === 'cbdc' ? 'sterling' : 'london';
  return `${pageHero(k, title, lede, mute, bed)}${quoteRail(page)}${extra}<div class="chapter-stack">${body}</div>${dykBlock()}`;
}

export function renderVision(): string {
  const all = chaptersFor('vision');
  const featuredIds = new Set(['philosophy', 'future', 'era']);
  const featured = all.filter((c) => featuredIds.has(c.id));
  const rest = all.filter((c) => !featuredIds.has(c.id));
  const flips = featured
    .map((c, i) => {
      const teaser = c.body.length > 160 ? `${c.body.slice(0, 160).trim()}…` : c.body;
      return `<article class="flip-card" style="--d:${i}">
        <div class="flip-inner">
          <div class="flip-face">
            ${kicker(c.kicker)}
            <h3 class="display">${esc(c.title)}</h3>
            <p>${esc(teaser)}</p>
            <p class="tiny">Click to open the essay</p>
          </div>
          <div class="flip-face flip-back">
            ${kicker(c.kicker)}
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.body)}</p>
          </div>
        </div>
      </article>`;
    })
    .join('');
  const extra = `<blockquote class="pull">
      <p>This paper proposes a solution to the problem of single-ledger dependency, by introducing a new technology for the design, deployment and execution of multi-ledger decentralized applications. This technology is called Overledger.</p>
      <footer>Verdian, Tasca, Paterson, Mondelli — Quant Overledger whitepaper v0.1, UCL Discovery abstract. ${extLink(sources.whitepaperUcl, 'Open the record')}</footer>
    </blockquote>
    <div class="compare">
      <article class="panel"><h3>TCP/IP for packets</h3><p>Applications stopped caring which physical network carried the bits. Ethernet, satellite, serial lines — one internet, many wires.</p></article>
      <article class="panel"><h3>Overledger for value</h3><p>Applications should stop caring which ledger, core or rail settles the money. Fabric, Ethereum, Corda, a bank core — one gateway, many domains.</p></article>
    </div>
    <section class="vision-deck">
      ${kicker('Three essays')}
      <h2 class="display">Turn a card. <span class="display-mute">The argument is underneath.</span></h2>
      <div class="flip-grid">${flips}</div>
    </section>`;
  return `${pageHero(
    'Vision',
    'A network of networks,',
    'The Internet of Value is a connectivity problem. Overledger sits above ledgers and core systems the way TCP/IP sat above physical networks — a gateway operating system. The history is in the 2018 whitepaper. The present is live sterling deposits. The future is being written in the standards rooms and the banks.',
    'the gateway OS.',
    'future',
  )}${quoteRail('vision')}${extra}<div class="chapter-stack">${rest.map((c) => chapterCard(c)).join('')}</div>${dykBlock()}`;
}

export function renderTechnology(): string {
  return renderChapterPage(
    'technology',
    'Overledger is',
    'APIs, mappers and an orchestration fabric that let applications talk to more than one ledger — and to systems that are not ledgers at all. Fusion, PayScript, Flow Applications, MCP agents, x402, Hyperledger Fabric and Oracle sit on top of that sentence, not beside a new chain.',
    'The stack',
    stackVisual(),
    'the gateway layer.',
  );
}

export function renderProgrammes(): string {
  const extra = `
    <div class="cohort-marks">
      ${kicker('The six commercial banks named by UK Finance')}
      <ul class="wordmarks">${GBTD_BANKS.map((b) => wordmarkLi(b, '/programmes#gbtd')).join('')}</ul>
    </div>
    <details class="reveal chapter" id="gbtd" open>
      <summary>${kicker('GBTD — London')}<h2>Live tokenised sterling deposits</h2></summary>
      <div class="reveal-body">
      <p>On 26 September 2025 UK Finance selected Quant to provide the technology for live tokenised sterling deposits with ${GBTD_BANKS.join(', ')}. EY and Linklaters support. Overledger and PayScript are named as the foundation. The six banks issue the deposits — commercial-bank sterling, building on the 2024 RLN phase.</p>
      <p class="source-row">${extLink(sources.gbtdUkFinance, 'UK Finance')} ${extLink(sources.gbtdQuant, 'Quant')} ${extLink(sources.gbtdUseCases, 'Three use cases')} ${extLink(sources.linklatersGbtd, 'Linklaters')}</p>
      </div>
    </details>
    <details class="reveal chapter" id="murex">
      <summary>${kicker('Murex — Paris')}<h2>Tokenised deposits inside MX.3</h2></summary>
      <div class="reveal-body">
      <p>On 25 March 2026 Murex and Quant announced a partnership to put tokenised deposits and digital-bond settlement inside MX.3, the cross-asset platform used by more than 300 institutions. Named vendor integration: programmable markets inside a platform the industry already runs.</p>
      <p class="source-row">${extLink(sources.murexNews, 'Murex newsroom')} ${extLink(sources.murexQuant, 'Quant')}</p>
      </div>
    </details>
    <details class="reveal chapter" id="oracle">
      <summary>${kicker('Oracle')}<h2>Blockchain Platform Digital Assets</h2></summary>
      <div class="reveal-body">
      <p>February 2025. Oracle’s own blog names Overledger as the orchestration layer for cross-ledger, two-phase workflows on a Hyperledger Fabric platform. New York is the markets pin.</p>
      <p class="source-row">${extLink(sources.oracleBlog, 'Oracle blog')} ${extLink(sources.oracleQuant, 'Quant note')}</p>
      </div>
    </details>
    <details class="reveal chapter" id="basel">
      <summary>${kicker('BIS — Basel')}<h2>Bibliography of the rooms</h2></summary>
      <div class="reveal-body">
      <p>Project Agora, “singleness of money” speeches, and wholesale CBDC research live in Basel. Project Rosalind was a concluded CBDC API experiment run from London. Geography plus citations.</p>
      <p class="source-row">${extLink(sources.bisHome, 'BIS')} ${extLink(sources.rosalindBis, 'Rosalind')}</p>
      </div>
    </details>`;
  const chapters = chaptersNewestFirst('programmes').map(chapterCard).join('');
  return `${pageHero(
    'Named pilots and named labs',
    'Where Quant is already',
    'GBTD is live as a UK tokenised-deposit experiment with Quant as technology partner. Murex is a named Overledger integration. Rosalind was a 2023 BIS × Bank of England API experiment Quant says it supplied as a vendor — concluded. The 2026 Bank of England lab is a simulated RT2.',
    'in the room.',
    'sterling',
  )}
    ${quoteRail('programmes', 24)}
    ${filterBox('prog-search', 'Search programmes, banks, labs…', '')}
    <div class="chapter-stack" id="prog-grid">${extra}${chapters}</div>
    ${renderThisMonth()}
    ${renderCalendar()}
    ${dykBlock()}`;
}

export function renderCbdc(): string {
  return `${pageHero(
    'Liability test',
    'Tokenised deposits are',
    'A central-bank digital currency is a liability of the central bank. GBTD tokens are liabilities of commercial banks. Keep those two lines clean. AI agents, x402, Hyperledger, Oracle and Linux Foundation software change the rails.',
    'commercial-bank money.',
    'sterling',
  )}
  ${quoteRail('cbdc')}
  <ol class="liability-cards">
    <li data-kind="cbdc"><span class="n">01</span><div><h3>CBDC</h3><p><b>Who owes it.</b> A central bank.</p><p><b>Example.</b> A digital pound, if issued, would sit here.</p><p><b>On this map.</b> The Bank of England Synchronisation Lab is adjacent experimentation on wholesale rails.</p></div></li>
    <li data-kind="deposit"><span class="n">02</span><div><h3>Tokenised deposit</h3><p><b>Who owes it.</b> A commercial bank.</p><p><b>Example.</b> GBTD tokens between ${GBTD_BANKS.join(', ')}.</p><p><b>On this map.</b> The live UK Finance pilot. Quant is the named technology partner (Overledger + PayScript), not the issuer.</p></div></li>
    <li data-kind="stable"><span class="n">03</span><div><h3>Stablecoin / crypto</h3><p><b>Who owes it.</b> Usually a private issuer or protocol.</p><p><b>Example.</b> x402 agent payments can use tokens; Quant’s thesis is to settle them in bank money.</p><p><b>On this map.</b> Layer 3 in Verdian’s architecture. Do not read a city pin as a coin listing.</p></div></li>
  </ol>
  <div class="chapter-stack">${chaptersFor('cbdc').map(chapterCard).join('')}</div>
  ${dykBlock()}`;
}

export function renderStandards(): string {
  const stages = SATP_STAGES.map(
    (s) => `<li class="stage" data-stage="${esc(s.n)}">
      <button type="button" class="stage-btn"><span class="n">${esc(s.n)}</span> ${esc(s.title)}</button>
      <div class="stage-body"><p>${esc(s.body)}</p><p class="mono subtle">${esc(s.tags)}</p></div>
    </li>`,
  ).join('');
  return `${pageHero(
    'Standards rooms',
    'Convene the standard,',
    'Geneva, Sydney, Brussels, Cambridge and Boston sit on the globe as rooms where interoperability — and the ethics of agents that move value — is written down. IETF SATP, ISO/TS 23516, MIT SERC and Hardjono’s delegation paper are documents, not campuses.',
    'then connect the rails.',
    'future',
  )}
  ${quoteRail('standards')}
  <section class="satp-lab" id="satp-method">
    ${kicker('Verify, initiate, lock, then 2PC')}
    <h2 class="display">SATP’s two-phase commit sits inside stage 3 — not instead of the stages.</h2>
    <ol class="stages">${stages}</ol>
    <ul class="acid">
      <li><strong>Atomicity</strong> The transfer commits on both networks or fails with no state change.</li>
      <li><strong>Consistency</strong> When it ends, the asset lives in exactly one network.</li>
      <li><strong>Isolation</strong> Origin state is not modified by anyone else while locked.</li>
      <li><strong>Durability</strong> Once committed, a gateway crash does not undo it.</li>
    </ul>
  </section>
  <div class="chapter-stack">${chaptersFor('standards').map(chapterCard).join('')}</div>
  ${dykBlock()}`;
}

export function renderPeople(): string {
  const groups: PersonGroup[] = ['c-suite', 'heads', 'founders', 'board'];
  const blocks = groups
    .map((g) => {
      const people = PEOPLE.filter((p) => p.group === g).map(personCard).join('');
      return `<section class="people-group"><p class="lede-sm">${esc(GROUP_LABEL[g])}</p>${people}</section>`;
    })
    .join('');
  return `${pageHero(
    'People',
    'The names who actually worked',
    'Official portraits where Quant published them. Each face opens that person’s story — Quant’s people page, or their own site. Initials only when no official picture exists. Quotations sit under the person who said them.',
    'on Overledger.',
  )}${peopleRail()}${quoteRail('people')}${blocks}${dykBlock()}`;
}

function peopleRail(): string {
  const faces = PEOPLE.filter((p) => p.photo)
    .map((p) => {
      const href = p.href ? sourceUrl(p.href) : `/people#${p.id}`;
      const external = href.startsWith('http');
      return `<a class="people-tile" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
        <img src="${esc(p.photo ?? '')}" alt="${esc(p.name)}" width="160" height="160" />
        <span><strong>${esc(p.name)}</strong><em>${esc(p.role)}</em></span>
      </a>`;
    })
    .join('');
  return `<nav class="people-rail" aria-label="Official portraits">
    ${kicker('On the record')}
    <h2 class="display">The faces Quant published.</h2>
    <p class="lede-sm">Highest-resolution stills from Quant’s own media library. Click a portrait for the official story.</p>
    <div class="people-tiles">${faces}</div>
  </nav>`;
}

function personCard(p: Person): string {
  const spoken = quotesForPerson(p.id)
    .slice(0, 2)
    .map(
      (q) => `<blockquote class="quote-inline">
        <p>“${esc(q.text)}”</p>
        <footer>${extLink(sourceUrl(q.href), q.role)}${q.note ? `<p class="note">${esc(q.note)}</p>` : ''}</footer>
      </blockquote>`,
    )
    .join('');
  const officialHref = p.href ? sourceUrl(p.href) : '';
  const official = officialHref
    ? `<p class="person-cta">${extLink(officialHref, 'Full official story')}</p>`
    : p.id === 'lovesey'
      ? '<p class="tiny">Initials only — Quant has not published a portrait.</p>'
      : '';
  const photo = p.photo
    ? `<img class="avatar avatar-photo avatar-${esc(p.group)}" src="${esc(p.photo)}" alt="${esc(p.name)}" width="160" height="160" />`
    : `<div class="avatar avatar-${esc(p.group)}" aria-hidden="true">${esc(p.initials)}</div>`;
  const face = officialHref
    ? `<a class="person-face" href="${esc(officialHref)}" target="_blank" rel="noopener noreferrer">${photo}</a>`
    : photo;
  return `<article class="person group-${esc(p.group)}" id="${esc(p.id)}">
    ${face}
    <div>
      <h2>${esc(p.name)}</h2>
      <p class="role">${esc(p.role)}${p.current ? '' : ' · <span class="chip">left / documentary</span>'}</p>
      <p>${esc(p.bio)}</p>
      ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
      ${official}
      ${spoken ? `<details class="person-quotes"><summary>In their words</summary>${spoken}</details>` : ''}
    </div>
  </article>`;
}

export function renderResearch(filter = '', region = 'ALL'): string {
  const q = filter.trim().toLowerCase();
  const featured = featuredPapers();
  const list = papersNewestFirst()
    .filter((p) => {
      if (region !== 'ALL' && !paperRegions(p).includes(region as PaperRegion)) {
        return false;
      }
      if (!q) return true;
      return `${p.title} ${p.venue} ${p.authors.join(' ')} ${p.lede} ${p.year}`.toLowerCase().includes(q);
    })
    .map(paperCard)
    .join('');
  const chips = ['ALL', 'UK', 'US', 'EU', 'Standards', 'Patents', 'INTL']
    .map((r) => `<button type="button" class="chip${r === region ? ' is-on' : ''}" data-region="${esc(r)}">${esc(r)}</button>`)
    .join('');
  return `${pageHero(
    'Library',
    'Read the papers,',
    'Forty-eight papers from the rooms that built this story. Filter by region or standard. Each card opens the publisher — UCL, IETF, ACM, Quant, the patent offices.',
    'then the press release.',
    'london',
  )}
  ${quoteRail('research')}
  <div class="toolbar filter-bar">
    <input type="search" id="lib-search" placeholder="Search titles, authors, venues" value="${esc(filter)}" />
    <p class="mono subtle">${papersNewestFirst().length} documents</p>
  </div>
  <div class="chip-row" id="research-regions">${chips}</div>
  <section class="block">
    ${kicker('Start here')}
    <div class="paper-grid">${featured.map(paperCard).join('')}</div>
  </section>
  <div class="paper-grid" id="research-grid">${list || '<p>Nothing matches.</p>'}</div>
  ${dykBlock()}`;
}

function paperCard(p: Paper): string {
  const href = p.hrefKey && sources[p.hrefKey]?.startsWith('http')
    ? sources[p.hrefKey]
    : `/read/${p.id}`;
  const external = href.startsWith('http');
  return `<article class="paper">
    <span class="year-num">${esc(p.year)}</span>
    <p class="kicker">${esc(p.kind)}</p>
    <h2>${esc(p.title)}</h2>
    <p class="meta">${esc(p.venue)}${p.authors.length ? ` · ${esc(p.authors.join(', '))}` : ''}</p>
    <details class="paper-more">
      <summary>Abstract</summary>
      <p>${esc(p.lede)}</p>
    </details>
    <a class="${external ? 'ext' : 'text-link'}" href="${esc(href)}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>Open this paper →</a>
  </article>`;
}

export function renderRead(id: string): string {
  const p = paperById(id);
  if (!p) return renderNotFound();
  const href = sources[p.hrefKey];
  return `${pageHero(p.kind, p.title, p.lede)}
    <article class="chapter">
      <p class="meta">${esc(p.venue)} · ${esc(p.year)}${p.authors.length ? ` · ${esc(p.authors.join(', '))}` : ''}</p>
      <p>The original sits with the publisher. Open it if you want the sentence in its first room.</p>
      ${href?.startsWith('http') ? `<p>${extLink(href, 'Open the original')}</p>` : '<p class="note">Held locally on the live QntDesk library when a PDF exists; this build points at the publisher URL when it is public.</p>'}
      <p><a class="text-link" href="/research">← Library</a></p>
    </article>`;
}

export function renderGlossary(filter = ''): string {
  const q = filter.trim().toLowerCase();
  const terms = GLOSSARY.filter((t) =>
    q ? `${t.term} ${t.body}`.toLowerCase().includes(q) : true,
  );
  const letters = [...new Set(terms.map((t) => t.letter))].sort();
  const groups = letters
    .map((L) => {
      const items = terms
        .filter((t) => t.letter === L)
        .map((t) => `<article class="term" id="${esc(t.id)}"><h2>${esc(t.term)}</h2><p>${esc(t.body)}</p></article>`)
        .join('');
      return `<section class="letter"><h3>${esc(L)}</h3>${items}</section>`;
    })
    .join('');
  return `${pageHero('Language', 'The language of', 'Overledger, GBTD, SATP, QuantNet, a tokenised deposit, a CBDC — different objects, one story. Search the terms.', 'programmable money.', 'history')}
    <div class="toolbar">
      <input type="search" id="gloss-search" placeholder="Search the terms" value="${esc(filter)}" />
      <p class="mono subtle">${terms.length} terms</p>
    </div>
    ${groups}`;
}

export function venueBarsHtml(print?: MarketPrint): string {
  const tickers = print?.tickers ?? [];
  if (!tickers.length) return '<p class="empty-note">Venue volumes will appear when CoinGecko lists them.</p>';
  const maxVol = Math.max(...tickers.map((t) => t.volume), 1);
  return tickers
    .map(
      (t) => `<li class="bar"><span>${esc(t.name)}</span><i style="--w:${(t.volume / maxVol) * 100}%"></i><em>${fmtMoney(t.volume, 0)}</em></li>`,
    )
    .join('');
}

function supplyRing(pct: number): string {
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = ((Number.isFinite(pct) ? pct : 0) / 100) * c;
  return `<svg class="supply-ring" viewBox="0 0 120 120" role="img" aria-label="Circulating share of total supply">
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="#dce8ff" stroke-width="12"/>
    <circle class="supply-ring-arc" cx="60" cy="60" r="${r}" fill="none" stroke="#2F5BFF" stroke-width="12" stroke-linecap="round" stroke-dasharray="${dash.toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 60 60)"/>
    <text x="60" y="56" text-anchor="middle" fill="#04101f" font-size="18" font-family="IBM Plex Sans, sans-serif" font-weight="700">${pct ? `${pct.toFixed(1)}%` : '—'}</text>
    <text x="60" y="74" text-anchor="middle" fill="#3d4f6f" font-size="8">circulating</text>
  </svg>`;
}

export function renderMarkets(print?: MarketPrint): string {
  const p = print;
  const chip = p ? `<span class="chip ${p.status.toLowerCase()}" data-mk-status>${esc(p.status)}</span>` : `<span class="chip degraded" data-mk-status>loading</span>`;
  const change = p?.change24h != null ? fmtPct(p.change24h) : '—';
  const up = (p?.change24h ?? 0) >= 0;
  const circ = p?.circulating ?? null;
  const total = p?.totalSupply ?? null;
  const outside = circ != null && total != null ? Math.max(0, total - circ) : null;
  const pct = circ && total ? Math.min(100, (circ / total) * 100) : 0;
  const bars = venueBarsHtml(p);
  return `${pageHero(
    'QNT',
    'QNT — the token of',
    'Overledger licences settle in QNT. That is why it trades. Live quotes from Coinbase, Kraken or Binance; market cap, supply and venues from CoinGecko. The Ethereum contract is below — check it yourself before you send anything.',
    'a network of networks.',
  )}
  ${quoteRail('markets')}
  <section class="tape" data-mk data-proof="ticker">
    <div class="tape-head">${chip}<span class="mono subtle" data-mk-meta>Updated ${esc(p?.updated ?? '—')} · ${esc(p?.venue ?? '')}</span></div>
    <div class="stats">
      <div><p class="kicker">Price</p><p class="stat" data-mk-price>${p?.priceUsd != null ? fmtMoney(p.priceUsd) : '—'}</p><p class="${up ? 'up' : 'down'}" data-mk-change>${change} 24h</p></div>
      <div><p class="kicker">Volume 24h</p><p class="stat" data-mk-vol>${p?.volume24h != null ? fmtMoney(p.volume24h, 0) : '—'}</p></div>
      <div><p class="kicker">Market cap</p><p class="stat" data-mk-cap>${p?.marketCap != null ? fmtMoney(p.marketCap, 0) : '—'}</p></div>
      <div><p class="kicker">24h high / low</p><p class="stat" data-mk-range>${p?.high24h != null ? fmtMoney(p.high24h) : '—'} <span class="subtle">/</span> ${p?.low24h != null ? fmtMoney(p.low24h) : '—'}</p></div>
      <div><p class="kicker">Circulating</p><p class="stat" data-mk-circ>${circ != null ? fmtQty(circ) : '—'}</p></div>
      <div><p class="kicker">Total supply</p><p class="stat" data-mk-total>${total != null ? fmtQty(total) : '—'}</p></div>
    </div>
    <p class="mono contract">Contract ${extLink(sources.qntEtherscan, QNT_CONTRACT)}</p>
    ${p?.error ? `<p class="note" data-mk-error>${esc(p.error)}</p>` : '<p class="note" data-mk-error hidden></p>'}
    <div data-mk-spark>${sparklineSvg(p?.sparkline ?? [])}</div>
  </section>
  <section class="chapter token-board">
    ${kicker('How much is out there')}
    <h2>Circulating against total, from CoinGecko</h2>
    <div class="token-visual">
      ${supplyRing(pct)}
      <div>
        <div class="scarcity" role="img" aria-label="Circulating share of total supply"><i data-mk-bar style="width:${pct}%"></i></div>
        <ul class="float-grid">
          <li><span class="kicker">Circulating</span><strong data-mk-circ2>${circ != null ? fmtQty(circ) : '—'}</strong><span>CoinGecko live print</span></li>
          <li><span class="kicker">Total</span><strong data-mk-total2>${total != null ? fmtQty(total) : '—'}</strong><span>Reported outstanding</span></li>
          <li><span class="kicker">Outside the float</span><strong data-mk-outside>${outside != null ? fmtQty(outside) : '—'}</strong><span>Total minus circulating</span></li>
        </ul>
        <p class="mono subtle" data-mk-ath>${pct ? `${pct.toFixed(1)}% circulating` : 'Supply figures will appear when CoinGecko answers.'} · ATH ${p?.ath != null ? fmtMoney(p.ath) : '—'} · ATL ${p?.atl != null ? fmtMoney(p.atl) : '—'}</p>
      </div>
    </div>
    <p>The 2018 burn retired the unsold allocation. Bitstamp’s MiCA filing records that licences can lock QNT for the term of the licence. Circulating and price are the live CoinGecko print.</p>
  </section>
  <section class="token-lab" id="tokenomics">
    ${kicker('Tokenomics')}
    <h2 class="display">Why QNT exists. <span class="display-mute">Open a card.</span></h2>
    <div class="tokencards">
      <details class="tokencard" open>
        <summary><span class="n">01</span> Utility</summary>
        <p>Overledger licences settle in QNT. That is the product reason the token trades. It is the utility token of Quant Network, distinct from equity in Quant Network Ltd.</p>
      </details>
      <details class="tokencard">
        <summary><span class="n">02</span> Scarcity</summary>
        <p>On 14 September 2018 Quant sent the unsold allocation to the contract itself. Their post records total supply 14,612,493.080826178 QNT. Bitstamp’s MiCA whitepaper cites a post-burn maximum of 14,881,364. Both figures sit on the record. Today’s circulating print is CoinGecko’s.</p>
      </details>
      <details class="tokencard">
        <summary><span class="n">03</span> Licence lock</summary>
        <p>Bitstamp’s MiCA filing (13 May 2026) records that licences can lock QNT for the term of the licence. Locked tokens are not a claim that a holder never sells. They are a contractual term on a utility token.</p>
      </details>
      <details class="tokencard">
        <summary><span class="n">04</span> The contract</summary>
        <p>ERC-20 on Ethereum. ${esc(QNT_CONTRACT)}. Check it on Etherscan before you send anything. Burn transaction ${extLink(sources.qntBurnTx, '0x763f32a0…')}.</p>
      </details>
    </div>
    <p class="source-row">${extLink(sources.qntEtherscan, 'Etherscan')} ${extLink(sources.qntBurnTweet, 'Burn tweet')} ${extLink(sources.micaBitstamp, 'Bitstamp MiCA')} ${extLink(sources.treasuryPdf.startsWith('http') ? sources.treasuryPdf : sources.overledger, 'Treasury note')}</p>
  </section>
  <section class="chapter">
    ${kicker('Where the volume is')}
    <h2>Each cell is a CoinGecko venue, scaled to the busiest one.</h2>
    <ul class="bars" data-mk-bars>${bars}</ul>
  </section>`;
}

export function newsListMarkup(river?: NewsRiver, filter = ''): { html: string; count: number } {
  const q = filter.trim().toLowerCase();
  const rows = (river?.items ?? [])
    .slice()
    .sort((a, b) => {
      const ta = a.published ? Date.parse(a.published) : 0;
      const tb = b.published ? Date.parse(b.published) : 0;
      return tb - ta;
    })
    .filter((h) => (q ? `${h.title} ${h.source}`.toLowerCase().includes(q) : true));
  const grouped = (['Official', 'Markets', 'Industry'] as const)
    .map((lane) => {
      const laneRows = rows.filter((h) => h.lane === lane);
      if (!laneRows.length) return '';
      return `<li class="headline-lane"><p class="kicker">${esc(lane)}</p><ul>${laneRows
        .map(
          (h) => `<li class="headline">
              <a href="${esc(h.url)}" target="_blank" rel="noopener noreferrer">${esc(h.title)}</a>
              <p class="meta">${esc(h.source)} · ${esc(h.published ? h.published.replace('T', ' ').slice(0, 16) : '—')}</p>
            </li>`,
        )
        .join('')}</ul></li>`;
    })
    .join('');
  return {
    count: rows.length,
    html:
      grouped ||
      `<p class="empty-note">${esc(river?.error ?? 'No fresh headlines yet — check back in a minute.')}</p>`,
  };
}

function sourcedNews(): string {
  const cards = notesFromDesk()
    .filter((n) => n.href?.startsWith('http'))
    .slice(0, 18)
    .map((n) => noteCard(n))
    .join('');
  return `<section class="notes-strip">
    ${kicker('On the record')}
    <h2 class="display">Sourced news. <span class="display-mute">Click through to the filing.</span></h2>
    <div class="notes-index">${cards}</div>
  </section>`;
}

export function renderNews(river?: NewsRiver, filter = ''): string {
  const list = newsListMarkup(river, filter);
  return `${pageHero(
    'Wire',
    'Quant, as the story',
    'Official Quant feed, Overledger docs, IETF SATP, and Google News — newest first. Click a headline and you leave for the source. This month’s sourced filings stay on the page when the river is quiet.',
    'unfolds.',
  )}
  ${filterBox('news-filter', 'Search headlines…', filter)}
  <section class="wire">
    <div class="tape-head"><span class="chip ${(river?.status ?? 'loading').toLowerCase()}" data-news-status>${esc(river?.status ?? 'loading')}</span><span class="mono subtle" data-news-count>${list.count} matching headlines</span></div>
    <ul class="headlines" data-news-list>${list.html}</ul>
  </section>
  ${sourcedNews()}
  ${renderThisMonth()}
  ${renderCalendar()}
  ${renderVoices()}`;
}

function renderCalendar(compact = false): string {
  const items = CALENDAR.map((e) => {
    const stamp = dateStamp(e.when);
    return `<li class="cal-card">
      <time datetime="${esc(e.when)}"><span class="day">${esc(stamp.day)}</span><span class="rest">${esc(stamp.rest)}</span></time>
      <p class="mono">${esc(e.where)}</p>
      <h3>${esc(e.title)}</h3>
      ${compact ? '' : `<p>${esc(e.body)}</p>`}
      ${extLink(sourceUrl(e.href), e.hrefLabel)}
    </li>`;
  }).join('');
  return `<section class="calendar">
    ${kicker('Upcoming')}
    <h2 class="display">Miami is <span class="display-mute">next</span></h2>
    <p>Quant at Sibos, stand DISL51, with Murex on stage — posted from @quantnetwork. DIGIT gilt is the Treasury, speaking at the UK Finance launch on 8 September. The speech does not name Quant; it is the same week’s landscape.</p>
    <ul class="cal-grid">${items}</ul>
  </section>`;
}

function renderThisMonth(compact = false): string {
  const items = THIS_MONTH.map((n) => {
    const stamp = dateStamp(n.date);
    return `<li class="month-card">
      <time datetime="${esc(n.date)}"><span class="day">${esc(stamp.day)}</span><span class="rest">${esc(stamp.rest)}</span></time>
      <p class="mono">${esc(n.source)} · ${esc(n.lane)}</p>
      <h3>${esc(n.title)}</h3>
      ${compact ? '' : `<p>${esc(n.body)}</p>`}
      ${extLink(sourceUrl(n.href), 'Open the source')}
    </li>`;
  }).join('');
  return `<section class="calendar month-rail">
    ${kicker('September 2026')}
    <h2 class="display">This month <span class="display-mute">on Quant</span></h2>
    <p>Quant’s Trusted Node essay. UK Finance naming GBTD as UK innovation. Sibos in Miami still ahead.</p>
    <ul class="month-cards">${items}</ul>
  </section>`;
}

function renderVoices(): string {
  const voices = OFFICIAL_VOICES.map(
    (v) => `<article class="voice"><h3>${esc(v.name)} <span class="mono">${esc(v.handle)}</span></h3><p>${esc(v.blurb)}</p>${extLink(v.href, v.handle)}</article>`,
  ).join('');
  return `<section class="voices">
    ${kicker('Voices')}
    <h2 class="display">Hear it from the people <span class="display-mute">building it</span></h2>
    <p class="lede">The accounts Quant points to: the company, Overledger developers, and founder Gilbert Verdian. Each card opens the original profile.</p>
    <div class="voice-grid">${voices}</div>
  </section>`;
}

function renderLiveRail(): string {
  return `<section class="live-rail">
    <article class="panel" id="home-tape">
      ${kicker('Live QNT')}
      <p class="stat" data-home-price>—</p>
      <p class="subtle" data-home-meta>Live print · Coinbase, Kraken or Binance · CoinGecko supply</p>
      <a class="text-link" href="/markets">Full market →</a>
    </article>
    <article class="panel live-news-panel">
      ${kicker('On Quant, right now')}
      <p class="subtle" data-home-news-meta>Headlines that name Quant, Overledger or QNT.</p>
      <ul class="headlines compact" data-home-news><li class="empty-note">Headlines load when the wire answers.</li></ul>
      <a class="text-link" href="/news">News →</a>
    </article>
  </section>`;
}

export function renderGone(_kind: 'desk' | 'ops'): string {
  return `${pageHero(
    'Moved',
    'This page now lives',
    'The live desk is News, Programmes, Research and the twenty-part podcast.',
    'with the record.',
  )}<p class="masthead" style="padding-top:0">${pill('/news', 'Open the news', 'Official wire')} ${pill('/podcast', 'Start the series', 'From the beginning', 'ghost')}</p>`;
}

export function renderCity(city: City): string {
  return `${pageHero(city.kind, city.name, city.lede)}
    <p class="mono subtle">${city.lat.toFixed(4)}, ${city.lon.toFixed(4)} · ${esc(city.country)}</p>
    <article class="chapter"><p>${esc(city.body)}</p><p><a class="text-link" href="${esc(city.href)}">Open the related chapter →</a></p></article>
    <p><a class="text-link" href="/">← Earth</a></p>`;
}

export function renderDonate(): string {
  return `${pageHero(
    'Support',
    'Donations keep the desk',
    'Optional. Buys no tokens and no yield. Never send funds to an address that appeared in a DM or a lookalike site.',
    'on the air.',
  )}
  <article class="chapter">
    <p>QNT token contract for verification only — a separate address from the desk recipients: ${extLink(sources.qntEtherscan, QNT_CONTRACT)}. Copy into a wallet you already control. We never ask for a seed.</p>
    <p>Published desk recipients:</p>
    <ul class="donate-list">
      <li><span class="kicker">ETH / QNT ERC-20</span><code>0xFcAD8838195Bdf03dB09999a0E289bf45D6F3FFD</code></li>
      <li><span class="kicker">BTC</span><code>bc1qgxnzt5d2qdx8zskffejhfjnqxuwtwnn3s3tadz</code></li>
      <li><span class="kicker">USDT · Solana</span><code>911rhAbnvrVZion9nS7N2BbKxDTWbNRQCELvMR5dXtcw</code></li>
    </ul>
    <p class="note">Do not send funds to addresses in comments or DMs. Verify the QNT ERC-20 on Etherscan before anything else. Burn tx ${esc(QNT_BURN_TX.slice(0, 18))}…</p>
  </article>`;
}

export function renderOps(): string {
  return renderGone('ops');
}

export function renderNotFound(): string {
  return `${pageHero('404', 'This page is not', 'Try News, Podcast, Vision, Programmes, Research or Markets.', 'on the map.')}<p class="masthead" style="padding-top:0">${pill('/', 'Earth', 'Back')} ${pill('/news', 'Open the news', 'Official wire', 'ghost')}</p>`;
}

export function renderPodcast(): string {
  const first = episodeByN(1);
  if (!first) return renderNotFound();
  return `${pageHero(
    'Podcast',
    'Twenty conversations on Quant,',
    'James Hale and Amelia Crowe tell the Quant story in order — from ISO and the 2018 whitepaper to live sterling. Two voices, every episode. They remember the rooms as they go: the gate, the banks, the standard, the token.',
    'from the beginning.',
  )}${playerMarkup(first)}${filmRail()}`;
}

export function renderEpisode(id: string): string {
  const ep = episodeById(id);
  if (!ep) return renderNotFound();
  return `${pageHero(
    `Episode ${String(ep.n).padStart(2, '0')}`,
    ep.title,
    ep.lede,
    '',
  )}${playerMarkup(ep)}`;
}

export function renderNotes(filter = '', era: NoteEra | 'ALL' = 'ALL'): string {
  const q = filter.trim().toLowerCase();
  const list = notesForEra(era).filter((n) => {
    if (!q) return true;
    return `${n.title} ${n.body} ${n.kicker} ${n.source}`.toLowerCase().includes(q);
  });
  const chips = (['ALL', 'history', 'present', 'future'] as const)
    .map((r) => `<button type="button" class="chip${r === era ? ' is-on' : ''}" data-era="${esc(r)}">${esc(r === 'ALL' ? 'All eras' : r)}</button>`)
    .join('');
  const cards = list.map((n) => noteCard(n)).join('');
  return `${pageHero(
    'News',
    'Field news on Quant,',
    'Did-you-know items and September 2026 filings, latest first. History, the live rooms, and what is still ahead — from the record. Each card opens the source.',
    'history to what is ahead.',
    'history',
  )}
  ${filterBox('notes-search', 'Search news…', filter, `<div class="chips" id="notes-eras">${chips}</div>`)}
  <p class="notes-count mono subtle">${list.length} filings on the record</p>
  <div class="notes-index">${cards || '<p class="empty-note">No filing matches that filter.</p>'}</div>`;
}

export function renderNote(id: string): string {
  const n = noteById(id);
  if (!n) return renderNotFound();
  const related = notesFromDesk()
    .filter((o) => o.id !== n.id && o.era === n.era)
    .slice(0, 3)
    .map((o) => noteCard(o))
    .join('');
  const source = n.href
    ? extLink(n.href, n.href.startsWith('http') ? 'Open the source' : 'Open the related chapter')
    : n.related
      ? `<a class="text-link" href="${esc(n.related)}">Related chapter →</a>`
      : '';
  const bed: VisualId = n.era === 'future' ? 'future' : n.era === 'history' ? 'history' : 'sterling';
  return `<article class="note-page">
    ${pageHero(n.kicker, n.title, `${n.source}. ${n.era[0].toUpperCase()}${n.era.slice(1)} of the Internet of Value.`, '', bed)}
    <div class="chapter note-body">
      <p class="mono subtle">${esc(n.dateLabel)} · ${esc(n.era)} · ${esc(n.source)}</p>
      <p>${esc(n.body)}</p>
      <p class="source-row">${source}</p>
      <p><a class="text-link" href="/news">← The wire</a></p>
    </div>
    ${related ? `<section class="notes-related">${kicker('Same era')}<div class="notes-index">${related}</div></section>` : ''}
  </article>`;
}
