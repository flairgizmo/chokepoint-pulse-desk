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
import { type City } from '../data/cities';
import { GROUP_LABEL, PEOPLE, type Person, type PersonGroup } from '../data/people';
import { GLOSSARY } from '../data/glossary';
import { featuredNote, notesForEra, notesFromDesk, noteById, type NoteEra, type NotePost } from '../data/notes';
import { episodesInOrder, episodeById, episodeByN } from '../data/podcast';
import { CALENDAR, GBTD_BANKS, MONEY_LAYERS, OFFICIAL_VOICES, SATP_STAGES, THIS_MONTH } from '../data/timeline';
import type { MarketPrint } from '../modules/markets';
import type { NewsRiver } from '../modules/news';
import { esc, extLink, fmtMoney, fmtPct, fmtQty } from './html';
import { markFor } from '../data/marks';
import { playerMarkup, relatedEpisodeCard } from './player';
import { diagramFigure } from './diagrams';
import { overledgerRoster } from './pages';

export { renderHome, renderTechnology, renderStory, renderStack, renderPatents, renderInstitutions } from './pages';

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
  return `<header class="page-hero enterprise-hero">
    ${diagramFigure(`${k}-${title}`, bed ?? 'page', k)}
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

export function visualBed(id: VisualId, cls = 'visual-bed'): string {
  const src = `/visuals/stills/${id}.jpg`;
  return `<img class="${esc(cls)}" src="${esc(src)}" alt="" width="1920" height="1080" decoding="async" />`;
}

export function constellation(): string {
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
  return `<button type="button" class="quote-card" data-stage="quote" data-stage-id="${esc(q.id)}">
    <span class="qmark" aria-hidden="true">“</span>
    <p>${esc(q.text)}</p>
    <footer>
      <strong>${esc(q.who)}</strong>
      <span>${esc(q.role)}</span>
      ${q.note ? `<p class="note">${esc(q.note)}</p>` : ''}
    </footer>
  </button>`;
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

export function stackVisual(): string {
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

export function layerBands(): string {
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

export function storyArt(id: string, era: NoteEra): string {
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
  const teaser = n.body.length > 140 ? `${n.body.slice(0, 140).trim()}…` : n.body;
  return `<button type="button" class="note-card news-card${featured ? ' is-feature' : ''}" data-era="${esc(n.era)}" data-stage="news" data-stage-id="${esc(n.id)}" data-title="${esc(n.title)}" data-url="${esc(n.href ?? '')}" data-source="${esc(n.source)}" data-published="${esc(n.dateLabel)}" data-lane="Official">
    ${diagramFigure(n.id, 'news', n.era)}
    <p class="kicker">${esc(n.kicker)} · ${esc(n.era)}</p>
    <h3>${esc(n.title)}</h3>
    <p>${esc(teaser)}</p>
    <span class="text-link">Open the briefing →</span>
  </button>`;
}

export function eraStrip(): string {
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

export function featuredStory(): string {
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

export function latestStrip(): string {
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

export function podcastTease(): string {
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

export function notesReel(): string {
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

export function renderProgrammes(): string {
  const extra = `
    <div class="cohort-marks">
      ${kicker('The six commercial banks named by UK Finance')}
      <ul class="wordmarks">${GBTD_BANKS.map((b) => wordmarkLi(b, '/programmes#gbtd')).join('')}</ul>
    </div>
    <details class="reveal chapter cockpit" id="gbtd" open>
      <summary>${kicker('Active · GBTD — London')}<h2>Live tokenised sterling deposits</h2></summary>
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
    'Programme cockpit',
    'Where Quant is already',
    'Status, owner, institutions, related tech. GBTD is live commercial-bank sterling. Murex is a named integration. Rosalind concluded. The 2026 Bank of England lab is a simulated RT2. Upcoming items can be mentioned from the news ingest — never auto-filed as timeline fact.',
    'in the room.',
  )}
    ${quoteRail('programmes', 24)}
    ${filterBox('prog-search', 'Search programmes, banks, labs…', '')}
    <div class="chapter-stack" id="prog-grid">${extra}${chapters}</div>
    ${renderThisMonth()}
    ${renderCalendar()}
    ${dykBlock()}`;
}

export function renderCbdc(): string {
  const models = [
    {
      id: 'wholesale',
      title: 'Wholesale CBDC / RTGS',
      body: 'A central-bank liability for institutions, typically sitting next to RTGS. Isolated chains cannot give you finality in the central bank’s book. Overledger’s claim is to talk to that book, not to replace it. The Synchronisation Lab is simulated RT2 — adjacency, labelled as such.',
    },
    {
      id: 'retail',
      title: 'Retail CBDC',
      body: 'A central-bank liability intended for the public. Project Rosalind tested APIs for such an ecosystem and concluded in 2023. No live UK retail CBDC exists. GBTD is not this object.',
    },
    {
      id: 'tcbm',
      title: 'Tokenised commercial-bank money',
      body: 'A commercial bank’s IOU, represented as a token. GBTD is the live UK specimen with six named banks. Quant is the technology partner. SATP is how an asset is supposed to leave one network and arrive in exactly one other — useful the day a wholesale CBDC and a tokenised deposit need to meet.',
    },
  ]
    .map(
      (m) => `<li>
        ${diagramFigure(`cbdc-${m.id}`, 'cbdc', m.title)}
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.body)}</p>
      </li>`,
    )
    .join('');
  return `${pageHero(
    'Liability test',
    'What a CBDC rail needs that isolated chains do not.',
    'Issuance, wholesale finality, and a way for commercial-bank tokens to meet that finality without becoming a new money. Overledger, SATP and identity sit as adjacency — never as a fake central-bank endorsement.',
    '',
  )}
  ${quoteRail('cbdc')}
  ${diagramFigure('cbdc-map', 'cbdc', 'Issuance → wholesale → retail')}
  <ol class="liability-cards">
    <li data-kind="cbdc"><span class="n">01</span><div><h3>CBDC</h3><p><b>Who owes it.</b> A central bank.</p><p><b>Example.</b> A digital pound, if issued, would sit here.</p><p><b>On this map.</b> The Bank of England Synchronisation Lab is adjacent experimentation on wholesale rails.</p></div></li>
    <li data-kind="deposit"><span class="n">02</span><div><h3>Tokenised deposit</h3><p><b>Who owes it.</b> A commercial bank.</p><p><b>Example.</b> GBTD tokens between ${GBTD_BANKS.join(', ')}.</p><p><b>On this map.</b> The live UK Finance pilot. Quant is the named technology partner (Overledger + PayScript), not the issuer.</p></div></li>
    <li data-kind="stable"><span class="n">03</span><div><h3>Stablecoin / crypto</h3><p><b>Who owes it.</b> Usually a private issuer or protocol.</p><p><b>Example.</b> x402 agent payments can use tokens; Quant’s thesis is to settle them in bank money.</p><p><b>On this map.</b> Layer 3 in Verdian’s architecture. Do not read a city pin as a coin listing.</p></div></li>
  </ol>
  <section class="cbdc-models">
    ${kicker('Three models')}
    <h2 class="display">Issuance, wholesale, tokenised deposits.</h2>
    <ol class="model-grid">${models}</ol>
  </section>
  <div class="chapter-stack">${chaptersFor('cbdc').map((c) => chapterCard(c)).join('')}</div>
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
    'Standards desk',
    'Treat the treaty as product.',
    'IETF SATP and the rooms Quant has actually touched. Status chips, editors, dates. The day SATP is an RFC, a bank can implement a gateway-to-gateway transfer without buying a brand. Adjacent ISO, INATBA and MIT work only where sourced.',
    '',
  )}
  ${quoteRail('standards')}
  <section class="treaty-table">
    ${kicker('Treaty table')}
    <ul class="treaty-row">
      <li><span class="chip">draft</span><strong>IETF SATP Core</strong><em>Hargreaves, Hardjono, Belchior, Ramakrishna, Chiriac · Facer co-chair</em></li>
      <li><span class="chip">referenced</span><strong>ISO/TS 23516:2026</strong><em>Verdian convenes WG7 · project 82098</em></li>
      <li><span class="chip">adopted</span><strong>ISO/TC 307</strong><em>Proposed 2015</em></li>
      <li><span class="chip">referenced</span><strong>ODAP 2020</strong><em>Maiden name of the SATP shape</em></li>
    </ul>
  </section>
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
    'The names on the papers,',
    'Official Quant portraits where they exist. A face or a quote opens that person’s story on this desk. Initials as a monogram when no defensible official picture is on file. Open original is secondary.',
    'and in the rooms.',
  )}
  <div class="toolbar filter-bar">
    <input type="search" id="people-search" placeholder="Search names, roles, rooms…" />
  </div>
  ${peopleRail()}${overledgerRoster()}${quoteRail('people')}${blocks}${dykBlock()}`;
}

function peopleRail(): string {
  const faces = PEOPLE.filter((p) => p.photo)
    .map(
      (p) => `<button type="button" class="people-tile" data-stage="person" data-stage-id="${esc(p.id)}">
        <img src="${esc(p.photo ?? '')}" alt="${esc(p.name)}" width="160" height="160" />
        <span><strong>${esc(p.name)}</strong><em>${esc(p.role)}</em></span>
      </button>`,
    )
    .join('');
  return `<nav class="people-rail" aria-label="Official portraits">
    ${kicker('On the record')}
    <h2 class="display">The faces Quant published.</h2>
    <p class="lede-sm">Studio-grade crops of official portraits. Click a face for the story on this desk.</p>
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
    ? `<p class="person-cta">${extLink(officialHref, 'Open original')}</p>`
    : p.id === 'lovesey'
      ? '<p class="tiny">Monogram only — Quant has not published a portrait.</p>'
      : '';
  const photo = p.photo
    ? `<img class="avatar avatar-photo avatar-${esc(p.group)}" src="${esc(p.photo)}" alt="${esc(p.name)}" width="160" height="160" />`
    : `<div class="avatar avatar-mono avatar-${esc(p.group)}" aria-hidden="true">${esc(p.initials)}</div>`;
  const face = `<button type="button" class="person-face" data-stage="person" data-stage-id="${esc(p.id)}" aria-label="${esc(p.name)} story">${photo}</button>`;
  return `<article class="person group-${esc(p.group)}" id="${esc(p.id)}" data-q="${esc(`${p.name} ${p.role} ${p.bio}`)}">
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
  <div class="paper-grid" id="research-grid">${list || '<p class="empty-note">Nothing in this library matches. Try SATP, Tasca, or adjacency.</p>'}</div>
  ${dykBlock()}`;
}

function paperCard(p: Paper): string {
  const verify = p.id === 'synchro' ? '<span class="chip">needs verification</span>' : '';
  return `<article class="paper" id="${esc(p.id)}">
    ${diagramFigure(p.id, 'paper', p.year)}
    <span class="year-num">${esc(p.year === 'n.d.' ? 'adjacency' : p.year)}</span>
    <p class="kicker">${esc(p.kind)} ${verify}</p>
    <h2>${esc(p.title)}</h2>
    <p class="meta">${esc(p.venue)}${p.authors.length ? ` · ${esc(p.authors.join(', '))}` : ''}</p>
    <details class="paper-more">
      <summary>Abstract</summary>
      <p>${esc(p.lede)}</p>
    </details>
    <button type="button" class="text-link" data-stage="paper" data-stage-id="${esc(p.id)}">Read on this desk →</button>
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
        .map(
          (t) => `<article class="term" id="${esc(t.id)}">
            <button type="button" data-stage="term" data-stage-id="${esc(t.id)}">
              <h2>${esc(t.term)}</h2>
              <p>${esc(t.body)}</p>
              ${t.analogy ? `<p class="stage-analogy"><strong>In one analogy.</strong> ${esc(t.analogy)}</p>` : ''}
            </button>
          </article>`,
        )
        .join('');
      return `<section class="letter"><h3>${esc(L)}</h3>${items}</section>`;
    })
    .join('');
  return `${pageHero('Language', 'The language of', 'Overledger, GBTD, SATP, QuantNet, a tokenised deposit, a CBDC — different objects, one story. Search. Each term opens a definition stage.', 'programmable money.')}
    <div class="toolbar">
      <input type="search" id="gloss-search" placeholder="Search the terms" value="${esc(filter)}" />
      <p class="mono subtle">${terms.length} terms</p>
    </div>
    ${groups || '<p class="empty-note">No term on this desk matches. Try SATP, GBTD, or Herstatt.</p>'}`;
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
    'Research presentation, not advice. Overledger licences settle in QNT — that is why it trades. Live quotes from Coinbase, Kraken or Binance; market cap, supply and venues from CoinGecko. As-of timestamps on every print. Utility token, not equity.',
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
              <button type="button" data-stage="news" data-stage-id="${esc(h.id)}" data-title="${esc(h.title)}" data-url="${esc(h.url)}" data-source="${esc(h.source)}" data-published="${esc(h.published ?? '')}" data-lane="${esc(h.lane)}">${esc(h.title)}</button>
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
      `<p class="empty-note">${esc(river?.error ?? 'The river is quiet. This month’s sourced filings stay on the desk.')}</p>`,
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
    <h2 class="display">Sourced filings. <span class="display-mute">The desk when the river is quiet.</span></h2>
    <div class="notes-index">${cards}</div>
  </section>`;
}

export function renderNews(river?: NewsRiver, filter = ''): string {
  const list = newsListMarkup(river, filter);
  return `${pageHero(
    'Wire',
    'Quant, as the story',
    'Official Quant, Overledger docs, IETF SATP, quality news and filings — newest first. A headline opens a briefing on this desk. Open original is secondary. When the river is quiet, the month’s sourced filings stay pinned.',
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

export function renderLiveRail(): string {
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
