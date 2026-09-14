import {
  chaptersFor,
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
import type { Headline, NewsRiver } from '../modules/news';
import { esc, extLink, fmtMoney, fmtPct, fmtQty } from './html';
import { bankDisplay, markFor } from '../data/marks';
import { playerMarkup, relatedEpisodeCard } from './player';
import { photoFigure, plateFor, PLATES, type VisualId } from '../data/plates';
import { diagramFigure, posterFrame } from './diagrams';
import { heroPlate, overledgerRoster } from './pages';
import { FILM_SETS, filmStageMarkup, stillStrip } from './filmSets';
import { PROGRAMMES } from '../data/programmes';
import { rememberHeadline } from './newsCache';

export { renderTechnology, renderStory, renderStack, renderPatents, renderInstitutions } from './pages';

export const DISCLAIMER =
  'Educational research. Names, marks and documents belong to their owners. Nothing here is financial advice. Crypto is volatile.';

export function kicker(text: string): string {
  return `<p class="kicker"><i class="section-dot" aria-hidden="true"></i>${esc(text)}</p>`;
}

function displayTitle(title: string, mute = ''): string {
  if (!mute) return esc(title);
  return `${esc(title)} <span class="display-mute">${esc(mute)}</span>`;
}

export function pageHero(k: string, title: string, lede: string, mute = '', bed?: VisualId, film?: string): string {
  const skipPlate = Boolean(film) && film !== 'vision';
  return `<header class="page-hero enterprise-hero cinema-hero">
    ${film ? filmStageMarkup(film, title) : ''}
    ${skipPlate ? '' : heroPlate(k, title, mute, bed)}
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

function cinemaDiagram(stillKey: string, svg: string, alt: string): string {
  const plate = plateFor(stillKey);
  return `<figure class="cinema-diagram">
    <img class="cinema-diagram-still" src="${esc(plate.src)}" alt="" width="1600" height="720" decoding="async" />
    <span class="hero-wash" aria-hidden="true"></span>
    <img class="cinema-diagram-svg" src="${esc(svg)}" alt="${esc(alt)}" width="640" height="360" />
    <figcaption>${esc(plate.credit)}</figcaption>
  </figure>`;
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
      <h2 class="display">The original pages. Not a recap.</h2>
      <p class="lede-sm">If a sentence matters, it has a door. The 2018 paper. The IETF drafts. The bank rooms. The original, not a recap.</p>
    </div>
    <ul class="constellation-grid">${nodes
      .map(
        ([label, href, sub]) =>
          `<li><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${posterFrame(
            photoFigure(plateFor(`door-${label}`), 'constellation-still'),
            `<strong>${esc(label)}</strong><span>${esc(sub)}</span>`,
          )}</a></li>`,
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
      <p class="lede-sm">Each card opens a briefing. The original is one click further.</p>
    </div>
    <ul class="film-grid">${films
      .map(
        (f) => `<li>
          <button type="button" class="film-card${f.thumb ? ' has-thumb' : ''}" data-stage="source" data-stage-id="${esc(f.title)}" data-title="${esc(f.title)}" data-url="${esc(f.href)}" data-source="${esc(f.who)}">
            ${posterFrame(
              f.thumb
                ? `<figure class="beat-figure photo-plate cinema-frame"><img class="film-bed" src="${esc(f.thumb)}" alt="" width="640" height="360" loading="lazy" decoding="async" /></figure>`
                : diagramFigure(`film-${f.title}`, 'source', f.kind),
              `<p class="kicker">${esc(f.kind)}</p><strong>${esc(f.title)}</strong>`,
            )}
            <span>${esc(f.who)}</span>
          </button>
        </li>`,
      )
      .join('')}</ul>
  </section>`;
}

function chapterCard(c: Chapter): string {
  return chapterReveal(c, false);
}

function chapterReveal(c: Chapter, open = false): string {
  return `<details class="reveal chapter cinema-chapter" id="${esc(c.id)}"${open ? ' open' : ''}>
    <summary>
      ${posterFrame(
        diagramFigure(c.id, 'chapter', c.kicker),
        `${kicker(c.kicker)}<h2>${esc(c.title)}</h2>`,
      )}
    </summary>
    <div class="reveal-body">${essayParas(c.body)}</div>
  </details>`;
}

function quoteCard(q: Quote): string {
  return `<button type="button" class="quote-card" data-stage="quote" data-stage-id="${esc(q.id)}">
    ${posterFrame(
      photoFigure(plateFor(q.id), 'quote-still'),
      `<span class="qmark" aria-hidden="true">“</span>
    <p>${esc(q.text)}</p>
    <footer>
      <strong>${esc(q.who)}</strong>
      <span>${esc(q.role)}</span>
      ${q.note ? `<p class="note">${esc(q.note)}</p>` : ''}
    </footer>`,
    )}
  </button>`;
}

function quoteRail(page?: string, limit = 6): string {
  const list = quotesFor(page).slice(0, limit);
  if (!list.length) return '';
  const [first, ...rest] = list;
  return `<section class="quote-rail">
    ${kicker('In their words')}
    <h2 class="display">In their own words. Titles attached.</h2>
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
    <h2 class="display">One gate. The books stay themselves.</h2>
    <ol class="stack-rungs cinema-rungs">${rungs
      .map(
        ([id, title, body]) =>
          `<li data-rung="${esc(id)}">${posterFrame(
            diagramFigure(`stack-${id}`, 'stack', title),
            `<strong>${esc(title)}</strong><span>${esc(body)}</span>`,
          )}</li>`,
      )
      .join('')}</ol>
  </section>`;
}

export function layerBands(): string {
  const layerStills = [PLATES.payments, PLATES.canary, PLATES.city, PLATES.datacenter] as const;
  return `<ol class="layer-bands">${MONEY_LAYERS.map(
    (l, i) =>
      `<li data-band="${esc(l.n)}">${posterFrame(
        photoFigure(layerStills[i] ?? PLATES.canary, 'layer-still'),
        `<span class="n">${esc(l.n)}</span><h3>${esc(l.title)}</h3><p>${esc(l.body)}</p>`,
      )}</li>`,
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
  const caption = bankDisplay(label);
  const mark = markFor(label);
  const tile = mark
    ? `<img class="wm-logo" src="${esc(mark)}" alt="${esc(caption)}" width="160" height="48" />`
    : `<span class="wm" aria-hidden="true">${esc(caption[0] ?? '?')}</span>`;
  return `<li class="wordmark"><a class="wordmark-link" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${tile}<span class="wordmark-caption">${esc(caption)}</span></a></li>`;
}

function fold(title: string, inner: string, open = false): string {
  return `<details class="fold"${open ? ' open' : ''}><summary>${esc(title)}</summary><div class="fold-body">${inner}</div></details>`;
}

export function storyArt(id: string, era: NoteEra): string {
  const named: Record<string, string> = {
    'trusted-node': '/visuals/stories/city.jpg',
    gbtd: '/visuals/topics/canary.jpg',
    'not-cbdc': '/visuals/stories/boe.jpg',
    overledger: '/visuals/topics/datacenter.jpg',
    satp: '/visuals/stories/bis.jpg',
  };
  if (named[id]) return named[id];
  const beds: Record<NoteEra, string[]> = {
    history: ['/visuals/topics/library.jpg', '/visuals/stories/exchange.jpg', '/visuals/cities/london.jpg'],
    present: ['/visuals/stories/boe.jpg', '/visuals/topics/payments.jpg', '/visuals/stories/city.jpg', '/visuals/stories/canary.jpg'],
    future: ['/visuals/topics/canary.jpg', '/visuals/stories/bis.jpg', '/visuals/topics/datacenter.jpg'],
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
  const stroke = up ? '#00D4AA' : '#ff6b7a';
  const fill = up ? 'rgba(0,212,170,0.18)' : 'rgba(255,107,122,0.16)';
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Seven-day CoinGecko sparkline"><polygon fill="${fill}" points="${pts} ${w},${h} 0,${h}"/><polyline fill="none" stroke="${stroke}" stroke-width="3" points="${pts}"/></svg>`;
}

function dykPlate(category: string) {
  if (category === 'CBDC') return PLATES.payments;
  if (category === 'AI agents') return PLATES.datacenter;
  if (category === 'Technology') return PLATES.city;
  if (category === 'Research') return PLATES.ucl;
  if (category === 'Standards') return PLATES.geneva;
  if (category === 'Vision') return PLATES.future;
  if (category === 'Programmes') return PLATES.canary;
  return PLATES.ucl;
}

function dykBlock(): string {
  const items = didYouKnow.slice(0, 4);
  const list = items
    .map(
      (d) => `<li class="dyk-card">
        <p class="kicker">${esc(d.category)}</p>
        <details>
          <summary class="dyk-q">${posterFrame(photoFigure(dykPlate(d.category), 'dyk-still'), `<span class="dyk-q-label">${esc(d.q)}</span>`)}</summary>
          <p>${esc(d.a)}</p>
        </details>
        <a class="text-link" href="${esc(d.to || '/')}">${esc(d.cta || 'Open')} →</a>
      </li>`,
    )
    .join('');
  return `<section class="dyk">
    ${kicker('Did you know')}
    <h2 class="display">Facts that sit beside the record.</h2>
    <ul class="dyk-list">${list}</ul>
    <p><a class="text-link" href="/news">The official wire →</a></p>
  </section>`;
}

function noteCard(n: NotePost, featured = false): string {
  const teaser = n.body.length > 140 ? `${n.body.slice(0, 140).trim()}…` : n.body;
  return `<button type="button" class="note-card news-card${featured ? ' is-feature' : ''}" data-era="${esc(n.era)}" data-stage="news" data-stage-id="${esc(n.id)}" data-title="${esc(n.title)}" data-url="${esc(n.href ?? '')}" data-source="${esc(n.source)}" data-published="${esc(n.dateLabel)}" data-lane="Official">
    ${posterFrame(
      diagramFigure(n.id, 'news', n.era),
      `<p class="kicker">${esc(n.kicker)} · ${esc(n.era)}</p><h3>${esc(n.title)}</h3><p>${esc(teaser)}</p><span class="text-link">Open the briefing →</span>`,
    )}
  </button>`;
}

export function eraStrip(): string {
  return `<section class="era-strip" id="eras">
    ${kicker('History · Present · Future')}
    <h2 class="display">Three chapters. <span class="display-mute">One network of networks.</span></h2>
    <ol class="era-grid">
      <li data-era="history">
        ${posterFrame(
          diagramFigure('era-history', 'event', '2015–2023'),
          `<p class="kicker">History</p>
        <h3>2015–2023</h3>
        <p>First the committee, then the operating system. Verdian puts blockchain on the ISO agenda. The 2018 whitepaper files Overledger as a gateway — not a twelfth chain. Unsold QNT is burned. LACChain is announced with IDB Lab. Rosalind, a BIS × Bank of England API lab, concludes in 2023. Experiments. Then the record stops calling them experiments.</p>
        <a class="text-link" href="/news">The wire →</a>`,
        )}
      </li>
      <li data-era="present">
        ${posterFrame(
          diagramFigure('era-present', 'programme', '2024–2026'),
          `<p class="kicker">Present</p>
        <h3>2024–2026</h3>
        <p>UK Finance’s RLN phase, then the sentence that makes the thesis concrete. On 26 September 2025 Quant is named technology partner for live tokenised sterling with ${GBTD_BANKS.map(bankDisplay).join(', ')}. 2026 adds Dentsu Soken, the Synchronisation Lab, Murex MX.3, ISO/TS 23516, and Sibos Miami stand DISL51.</p>
        <a class="text-link" href="/programmes">Named rooms →</a>`,
        )}
      </li>
      <li data-era="future">
        ${posterFrame(
          diagramFigure('era-future', 'cbdc', 'Still ahead'),
          `<p class="kicker">Future</p>
        <h3>Still ahead</h3>
        <p>The Economic Secretary’s 8 September 2026 speech at UK Finance names a DIGIT gilt in Q1 2027. The speech does not name Quant. What Quant does publish is simpler: programmable bank money is how deposits and agent payments are supposed to settle — once the rails can talk.</p>
        <a class="text-link" href="/vision">The thesis →</a>`,
        )}
      </li>
    </ol>
  </section>`;
}

export function featuredStory(): string {
  const n = featuredNote();
  return `<section class="featured-note">
    ${kicker('Featured news')}
    ${posterFrame(
      diagramFigure('featured-trusted-node', 'news', 'This month'),
      `<p class="kicker">On the record</p>
      <h2 class="display">What most coverage skips.</h2>
      <div class="cta-row">
        ${pill('/news', 'Open the news', 'Official wire')}
        ${pill('/podcast', 'Start the series', 'From the beginning', 'ghost')}
      </div>`,
    )}
    <p>Six UK commercial banks already issue tokenised sterling on a live UK Finance pilot. Overledger and PayScript are the named technology. QNT licences that network. The interesting part is not another ticker chart. It is the order: the 2018 paper, the IETF drafts, the bank names. Latest first. A title on every quote.</p>
    <div class="featured-grid">
      ${noteCard(n, true)}
    </div>
  </section>`;
}

export function latestStrip(): string {
  const month = [...THIS_MONTH].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title)).slice(0, 3)
    .map((n) => {
      const stamp = dateStamp(n.date);
      return `<li class="month-card">
        ${posterFrame(
          photoFigure(plateFor(n.id, n.source, n.title), 'month-still'),
          `<time datetime="${esc(n.date)}"><span class="day">${esc(stamp.day)}</span><span class="rest">${esc(stamp.rest)}</span></time>
        <p class="mono">${esc(n.source)}</p>
        <h3>${esc(n.title)}</h3>`,
        )}
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
      <h2 class="display">Scroll the record. <span class="display-mute">A card is a filing.</span></h2>
      <a class="text-link" href="/news">The wire →</a>
    </div>
    <div class="notes-reel" tabindex="0">${cards}</div>
  </section>`;
}

function essayOrder(): string {
  return `<section class="essay-order" aria-labelledby="essay-order-title">
    ${kicker('In order')}
    <h2 class="display" id="essay-order-title">Technology arrived before trust. Then the question changed.</h2>
    ${posterFrame(
      photoFigure(plateFor('canary', 'gbtd'), 'essay-order-still'),
      '<p class="kicker">In order</p><h2>Technology arrived before trust.</h2>',
    )}
    <div class="essay-flow">
      <p>We’ve gotten used to seeing a new rail arrive before anyone can trust it.</p>
      <p>It happened with the internet. First the thrill of being connected. Then the patches: passwords everywhere, data moving without a clear owner. The network won anyway. We filled it with workarounds.</p>
      <p>Digital finance is having the same argument. Only this time the payload is not a photo. It is a pound, a contract, a market.</p>
      <p>Blockchains arrived as the next big thing: decentralised, transparent, programmable. On paper, perfect. In the rooms that actually issue sterling, something else was missing.</p>
      <p><strong>Shared rules. Clear liability. A way for systems that were never born to talk to actually talk.</strong></p>
      <p>For years the industry assumed the technology was enough — as if code alone could convince a bank, a supervisor, a treasurer. It did not work that way. Institutions watched. They ran labs. They mostly stayed on the sidelines. Not because they failed to understand a chain. Because a bank cannot put customer deposits on a jungle of wallets, bridges and gas tokens.</p>
      <p>Meanwhile the objects got real. Tokenised deposits. On-chain collateral. Cross-border payments that settle in minutes instead of days. Public networks became too large to ignore.</p>
      <p>The question changed. It is no longer whether finance will use these networks. It is how. With which rules. On top of what kind of infrastructure.</p>
      <p>There are moments when a field is full of power and poor in simplicity. Personal computers in the 1980s were like that, until the question stopped being “how fast” and became “how easy”. Smartphones were like that, until a thousand keyboards collapsed into a gesture.</p>
      <p>If there is a moment like that in this sector, it will not come from another chain. It will come from coordination. From order. From a layer you stop noticing.</p>
      <p><strong>Overledger was filed that way in 2018. Not a blockchain. An operating system for applications that have to live on more than one book.</strong></p>
      <p>Think of the ledgers as an archipelago. Ethereum on one island. Hyperledger Fabric on another. Corda with its own grammar. A bank core that will not be rewritten. Every time you try to connect them with a one-off bridge, the workaround looks temporary from day one.</p>
      <p>A gateway OS is the softer transition the enterprise world will actually buy. No leap into the void. No twelfth settlement chain. The books stay themselves. The application stops caring which wire settled.</p>
      <p>Then the example that makes the sentence concrete.</p>
      <p>On 26 September 2025, UK Finance named Quant as technology partner for live tokenised sterling deposits. The issuers are commercial banks: ${GBTD_BANKS.map(bankDisplay).join(', ')}. They owe the holder. Overledger and PayScript are the named foundation. GBTD is not a CBDC.</p>
      <p>Standards ran in parallel — the way the internet became permanent. HTTP, TCP/IP, TLS: nobody asks who wrote them anymore. Verdian proposed the ISO blockchain committee. Hargreaves is a named author of IETF SATP, the gateway protocol for moving an asset from one network to exactly one other. Facer co-chairs the working group. SATP is not a Quant SKU. The product is already in a production pilot while those drafts mature.</p>
      <p>That is the story, in order. The problem. The operating system. The sterling. The treaty. The people who signed the papers.</p>
    </div>
  </section>`;
}

function homeFaces(): string {
  const faces = PEOPLE.filter((p) => p.photo)
    .slice(0, 8)
    .map(peoplePoster)
    .join('');
  return `<section class="people-rail home-faces" aria-label="Official portraits">
    ${kicker('The people')}
    <div class="section-head">
      <h2 class="display">The faces on the record. Not stock stills.</h2>
      <a class="text-link" href="/people">Everyone →</a>
    </div>
    <p class="lede-sm">Official portraits Quant or the person published. Click a face for the filing. Two names still sit as initials: Quant has not published Chris Lovesey or Colin Paterson.</p>
    <div class="people-tiles">${faces}</div>
  </section>`;
}

export function renderHome(): string {
  const banks = GBTD_BANKS.map((b) => wordmarkLi(b, '/programmes#gbtd')).join('');
  const beatStage: Record<string, string> = {
    '2015': 'iso-2015',
    '2018': 'whitepaper-2018',
    '2021': 'lacchain-2021',
    '2023': 'rosalind-2023',
    '2024': 'rln-2024',
    '2025': 'gbtd-2025',
    '2026': 'dentsu-2026',
  };
  const beats = [...TIMELINE]
    .reverse()
    .map((t) => {
      const sid = beatStage[t.year];
      const still = photoFigure(plateFor(sid, t.year, t.title), 'beat-still');
      const inner = `${posterFrame(
        still,
        `<span class="year">${esc(t.year)}</span><h3>${esc(t.title)}</h3>`,
      )}<p>${esc(t.body)}</p>`;
      return `<li class="beat">${
        sid
          ? `<button type="button" data-stage="event" data-stage-id="${esc(sid)}">${inner}</button>`
          : inner
      }</li>`;
    })
    .join('');
  const essays = ['philosophy', 'future', 'era']
    .map((id) => chaptersFor('vision').find((c) => c.id === id))
    .filter((c): c is Chapter => Boolean(c))
    .map((c) => {
      const teaser = c.body.length > 210 ? `${c.body.slice(0, 210).trim()}…` : c.body;
      return `<article class="panel essay-card">
        ${posterFrame(
          diagramFigure(`essay-${c.id}`, 'page', c.kicker),
          `${kicker(c.kicker)}<h3 class="display">${esc(c.title)}</h3><p>${esc(teaser)}</p>`,
        )}
        <button type="button" class="text-link" data-stage="chapter" data-stage-id="${esc(c.id)}">Read the argument →</button>
      </article>`;
    })
    .join('');
  return `
    <section class="masthead masthead-lockup" data-proof="hero">
      <div class="hero-stage cinema-stage">
        <span class="cinema-letterbox cinema-letterbox-top" aria-hidden="true"></span>
        <span class="cinema-grain" aria-hidden="true"></span>
        <canvas id="gateway" class="gateway-stage" role="img" aria-label="Sterling corridor: six UK commercial banks around an Overledger plane. Click a bank. Drag to orbit."></canvas>
        <span class="cinema-letterbox cinema-letterbox-bottom" aria-hidden="true"></span>
        <p class="tess-hint" data-gateway-hint>Six commercial banks. One gateway plane. Click a node.</p>
      </div>
      ${kicker('QntDesk · independent research')}
      <div class="hero-split">
        <h1 class="display">The ledgers were never the hard part. <span class="display-mute">Making them talk is.</span></h1>
        <div>
          <p class="lede">We’ve gotten used to seeing a new rail arrive before anyone can trust it. Overledger was filed in 2018 as the operating system for that problem — not another chain. Then six UK banks put live tokenised sterling on it. The public record, in order. Independent research. Not Quant’s corporate site.</p>
          <div class="cta-row">
            ${pill('/technology', 'See how the gate works', 'Product theatre')}
            ${pill('/story', 'Walk the timeline', 'Scored history', 'ghost')}
            ${pill('/podcast', 'Start the series', 'Twenty conversations')}
          </div>
        </div>
      </div>
    </section>

    ${essayOrder()}

    <section class="proof-row">
      ${kicker('Three proofs')}
      <div class="proof-grid">
        <button type="button" class="proof-chip" data-stage="proof" data-stage-id="interop">
          ${posterFrame(
            diagramFigure('home-interop', 'proof', 'Interop'),
            '<strong>Interoperability</strong><span>One request. More than one book. Overledger maps; it does not replace. 2018 whitepaper, UCL Discovery.</span>',
          )}
        </button>
        <button type="button" class="proof-chip" data-stage="proof" data-stage-id="standards">
          ${posterFrame(
            diagramFigure('home-standards', 'proof', 'Standards'),
            '<strong>Standards</strong><span>ISO for the rooms that regulate. IETF SATP for the rooms that implement. Quant authors; not Quant SKUs.</span>',
          )}
        </button>
        <button type="button" class="proof-chip" data-stage="proof" data-stage-id="institutions">
          ${posterFrame(
            diagramFigure('home-institutions', 'proof', 'Rooms'),
            '<strong>Institutions</strong><span>UK Finance convenes. Six commercial banks issue the sterling. Quant supplies the technology.</span>',
          )}
        </button>
      </div>
    </section>

    <section class="pulse-strip">
      ${kicker('Pulse')}
      <div class="section-head">
        <h2 class="display">The wire, as headlines.</h2>
        <a class="text-link" href="/news">The wire →</a>
      </div>
      <ul class="pulse-list" data-home-pulse><li class="empty-note">Headlines load when the ingest answers.</li></ul>
    </section>

    ${renderLiveRail()}

    ${stackVisual()}

    <section class="earth-hero cinema-earth">
      <span class="cinema-letterbox cinema-letterbox-top" aria-hidden="true"></span>
      <span class="cinema-grain" aria-hidden="true"></span>
      <div class="earth-stage" id="earth-stage" tabindex="0" aria-label="Interactive 3D Earth. Drag to orbit, scroll to zoom, double-click to fly in, click a city."></div>
      <span class="cinema-letterbox cinema-letterbox-bottom" aria-hidden="true"></span>
      <div class="earth-hud">
        <div class="hud-card">
          <p class="kicker"><i class="section-dot" aria-hidden="true"></i>Earth · orbit</p>
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
            <label><input type="checkbox" data-globe-opt="spin" checked /> Auto-spin</label>
            <label><input type="checkbox" data-globe-opt="labels" /> City labels</label>
            <label><input type="checkbox" data-globe-opt="day" checked /> Daylight</label>
            <label><input type="checkbox" data-globe-opt="night" checked /> Night</label>
            <label><input type="checkbox" data-globe-opt="routes" /> Settlement routes</label>
            <label><input type="checkbox" data-globe-opt="corridors" /> Token corridors</label>
            <label><input type="checkbox" data-globe-opt="activity" /> Activity</label>
          </fieldset>
        </details>
        <div class="hud-city" id="city-hover" hidden></div>
        <p class="isr-line mono" id="isr-line">ORBIT · sourced programme corridors</p>
      </div>
    </section>

    <section class="strip partner-strip">
      ${kicker('GBTD cohort — names as UK Finance printed them, 26 September 2025')}
      <ul class="wordmarks wordmarks-banks">${banks}</ul>
      <p class="cohort-note">Captions follow the press list: Barclays, HSBC, Lloyds Banking Group, NatWest, Nationwide, Santander. Marks are each bank’s public wordmark. Quant, EY and Linklaters are named as support, not as issuers.</p>
      ${kicker('Institutions around that cohort')}
      <ul class="wordmarks wordmarks-inst muted">
        ${wordmarkLi('Quant', sources.about)}
        ${wordmarkLi('UK Finance', sources.ukFinanceHome)}
        ${wordmarkLi('Bank of England', sources.boeHome)}
        ${wordmarkLi('BIS', sources.bisHome)}
        ${wordmarkLi('IETF', sources.satpCore)}
        ${wordmarkLi('Linux Foundation', sources.linuxX402)}
        ${wordmarkLi('Oracle', sources.oracleBlog)}
        ${wordmarkLi('Murex', sources.murexNews)}
        ${wordmarkLi('EY', sources.ukFinanceRln)}
        ${wordmarkLi('Linklaters', sources.linklatersGbtd)}
        ${wordmarkLi('Dentsu Soken', sources.dentsuSoken)}
      </ul>
    </section>

    ${homeFaces()}

    ${latestStrip()}

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
      <h2 class="display">From ISO in 2015 <span class="display-mute">to live sterling in 2025.</span></h2>
      <ol class="timeline">${beats}</ol>
      <p><a class="text-link" href="/story">Open the scored rail →</a></p>
    </section>

    ${renderThisMonth(true)}${renderCalendar(true)}${renderVoices()}
    <section class="triptych hex">
      <article class="panel">${posterFrame(diagramFigure('home-thesis', 'page', 'Thesis'), `${kicker('Thesis')}<h2 class="display">A gateway OS</h2>`)}<p>Overledger connects DLT domains and legacy cores without minting a native settlement chain. The 2018 whitepaper’s problem is single-ledger dependency. Tasca called interoperability a risky necessity. Verdian incorporated a company to ship the gate.</p><a class="text-link" href="/vision">Vision →</a></article>
      <article class="panel">${posterFrame(diagramFigure('home-satp', 'page', 'SATP'), `${kicker('SATP')}<h2 class="display">How an asset leaves one network</h2>`)}<p>Secure Asset Transfer Protocol is IETF work. Quant authors appear on the drafts; Facer is a co-chair. Stage 3 is burn-and-mint under two-phase commit, so the asset exists in one network when the transfer ends. SATP is not a Quant SKU.</p><a class="text-link" href="/standards">Standards →</a></article>
      <article class="panel">${posterFrame(diagramFigure('home-gbtd', 'page', 'GBTD'), `${kicker('GBTD')}<h2 class="display">Live sterling, programmed</h2>`)}<p>On 26 September 2025 UK Finance selected Quant as technology partner for tokenised deposits with six commercial banks. The banks owe the holder. Overledger and PayScript are the named foundation. GBTD is not a CBDC.</p><a class="text-link" href="/cbdc">The distinction →</a></article>
      <article class="panel">${posterFrame(diagramFigure('home-tokenomics', 'page', 'QNT'), `${kicker('Tokenomics')}<h2 class="display">Why QNT exists</h2>`)}<p>QNT is an ERC-20 at 0x4a220E6096B25EADb88358cb44068A3248254675. Unsold allocation was burned in 2018. Overledger licences settle in it. Live circulating comes from CoinGecko. Utility token, not equity in Quant Network.</p><a class="text-link" href="/markets#tokenomics">Markets →</a></article>
      <article class="panel">${posterFrame(diagramFigure('home-stack', 'page', 'Stack'), `${kicker('Stack')}<h2 class="display">Overledger, Fusion, PayScript</h2>`)}<p>Gateway OS, Layer 2.5 rollup (Fusion mainnet, 2 June 2026), programmability on the deposit. Oracle and Murex are named vendors sitting on that stack, not on a new chain.</p><a class="text-link" href="/technology">The stack →</a></article>
      <article class="panel">${posterFrame(diagramFigure('home-programmes', 'page', 'Rooms'), `${kicker('Programmes')}<h2 class="display">Rooms already on the record</h2>`)}<p>LACChain, 2021. Rosalind, concluded 2023. GBTD, 2025. Dentsu Soken, Murex MX.3, and the Bank of England Synchronisation Lab in 2026. Each date has a source.</p><a class="text-link" href="/programmes">Programmes →</a></article>
    </section>

    ${constellation()}${featuredStory()}${notesReel()}${podcastTease()}${quoteRail('home', 10)}${eraStrip()}${dykBlock()}
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
  return `${pageHero(k, title, lede, mute, bed, FILM_SETS[page] ? page : undefined)}${quoteRail(page)}${extra}<div class="chapter-stack cinema-room">${body}</div>${dykBlock()}`;
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
            ${posterFrame(
              diagramFigure(`essay-${c.id}`, 'chapter', c.kicker),
              `${kicker(c.kicker)}<h3 class="display">${esc(c.title)}</h3><p>${esc(teaser)}</p><p class="tiny">Click to open the essay</p>`,
            )}
          </div>
          <div class="flip-face flip-back">
            ${kicker(c.kicker)}
            <h3>${esc(c.title)}</h3>
            ${essayParas(c.body)}
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
      <article class="panel">${posterFrame(diagramFigure('vision-2018', 'page', '2018'), '<h3>The 2018 problem</h3>')}<p>The UCL Discovery abstract states the problem as single-ledger dependency: applications bound to one DLT cannot execute across others without a layer above those books.</p></article>
      <article class="panel">${posterFrame(diagramFigure('vision-gate', 'page', 'Gateway'), '<h3>What Overledger is</h3>')}<p>A gateway operating system for multi-ledger applications. Fabric, Ethereum, Corda, or a bank core remain the settlement domains. The gate maps the request. It does not replace the book.</p></article>
    </div>
    <section class="vision-deck">
      ${kicker('Three essays')}
      <h2 class="display">Three essays from the record.</h2>
      <div class="flip-grid">${flips}</div>
    </section>`;
  return `${pageHero(
    'Vision',
    'A network of networks —',
    'The ledgers already exist. The missing piece is how they talk. The 2018 whitepaper calls Overledger a technology for multi-ledger applications. The live programme is UK Finance’s tokenised sterling. The next public dates sit in IETF SATP, ISO/TS 23516:2026, and the Bank of England Synchronisation Lab — simulated RT2, not a live digital pound.',
    'the operating system, not another chain.',
    'future',
    'vision',
  )}${stillStrip('vision', 'Photographs in the argument')}${quoteRail('vision')}${extra}<div class="chapter-stack cinema-room">${rest.map((c) => chapterCard(c)).join('')}</div>${dykBlock()}`;
}

export function renderProgrammes(): string {
  const cards = PROGRAMMES.map((p) => {
    const marks = p.institutions
      .map((name) => {
        const mark = markFor(name);
        const caption = bankDisplay(name);
        return mark
          ? `<span class="prog-mark"><img class="wm-logo" src="${esc(mark)}" alt="${esc(caption)}" width="128" height="52" /><em>${esc(caption)}</em></span>`
          : `<span class="wordmark-label">${esc(caption)}</span>`;
      })
      .join('');
    return `<article class="prog-card" id="${esc(p.id)}" data-status="${esc(p.status)}" data-q="${esc(`${p.title} ${p.body} ${p.owner}`)}">
      <button type="button" data-stage="programme" data-stage-id="${esc(p.id)}">
        ${posterFrame(
          diagramFigure(p.id, 'programme', p.status),
          `<p class="kicker"><span class="chip status-${esc(p.status)}">${esc(p.status)}</span> ${esc(p.kicker)}</p>
        <h2>${esc(p.title)}</h2>
        <p class="lede-sm">${esc(p.owner)}</p>
        <p class="mono subtle">Next: ${esc(p.milestone)}</p>`,
        )}
        <p class="prog-tech">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</p>
        <div class="prog-marks">${marks}</div>
      </button>
      <details class="card-more"><summary>Filing</summary><p>${esc(p.body)}</p></details>
      <p class="prog-mentions" data-prog-mentions="${esc(p.id)}" hidden></p>
    </article>`;
  }).join('');
  return `${pageHero(
    'Programme cockpit',
    'Where the gate is already',
    'Look at the rooms. Then the slogans. GBTD is live commercial-bank sterling. Murex is a named integration. Rosalind concluded. The 2026 Bank of England lab is a simulated RT2. A mention on the wire can light a chip. It is never added as a timeline fact without a source.',
    'in the room.',
    undefined,
    'programmes',
  )}
    ${stillStrip('programmes', 'Photographs of the rooms')}
    <div class="cohort-marks">
      ${kicker('The six commercial banks named by UK Finance, 26 September 2025')}
      <ul class="wordmarks">${GBTD_BANKS.map((b) => wordmarkLi(b, '/programmes#gbtd')).join('')}</ul>
      <p class="cohort-note">UK Finance’s press: Barclays, HSBC, Lloyds Banking Group, NatWest, Nationwide, and Santander, with support from Quant, EY and Linklaters. The GBTD programme page fetched 13 September 2026 also lists Monzo as a seventh participant and states GBTD was accepted into the Bank of England Synchronisation Lab. No join date is printed. ${extLink(sources.ukFinanceRln, 'Programme page')}</p>
    </div>
    ${quoteRail('programmes', 24)}
    <div class="toolbar filter-bar">
      <input type="search" id="prog-search" placeholder="Search programmes, banks, labs…" />
      <div class="chip-row" id="prog-status">
        <button type="button" class="chip is-on" data-prog-status="all">All</button>
        <button type="button" class="chip" data-prog-status="active">Active</button>
        <button type="button" class="chip" data-prog-status="incubating">Incubating</button>
        <button type="button" class="chip" data-prog-status="completed">Completed</button>
        <button type="button" class="chip" data-prog-status="upcoming">Upcoming</button>
      </div>
    </div>
    <p class="empty-note" id="prog-empty" hidden>No programme matches. Try GBTD, Murex, or Sibos.</p>
    <div class="prog-grid" id="prog-grid">${cards}</div>
    ${fold('This month and the calendar', `${renderThisMonth()}${renderCalendar()}`)}
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
      (m) => `<li class="cbdc-model">
        <button type="button" data-stage="money" data-stage-id="${esc(m.id)}">
          ${posterFrame(
            diagramFigure(`cbdc-${m.id}`, 'cbdc', m.title),
            `<h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>`,
          )}
        </button>
      </li>`,
    )
    .join('');
  return `${pageHero(
    'Liability test',
    'Who owes the pound — and which rail settles it.',
    'A CBDC, a tokenised deposit and a stablecoin are not the same object. Isolated chains cannot give you that sorting. Overledger, SATP and identity sit as adjacency — never as a fake central-bank endorsement.',
    '',
    undefined,
    'cbdc',
  )}
  ${stillStrip('cbdc', 'Photographs of the liabilities')}
  ${quoteRail('cbdc')}
  ${cinemaDiagram('liability', '/visuals/plates/liability-line.svg', 'Three liabilities: central-bank, commercial-bank deposit, private stablecoin')}
  <ol class="liability-cards">
    <li data-kind="cbdc">${posterFrame(photoFigure(PLATES.payments, 'liability-still'), '<span class="n">01</span><h3>CBDC</h3>')}<div><p><b>Who owes it.</b> A central bank.</p><p><b>Example.</b> A digital pound, if issued, would sit here.</p><p><b>On this map.</b> The Bank of England Synchronisation Lab is adjacent experimentation on wholesale rails.</p></div></li>
    <li data-kind="deposit">${posterFrame(photoFigure(PLATES.canary, 'liability-still'), '<span class="n">02</span><h3>Tokenised deposit</h3>')}<div><p><b>Who owes it.</b> A commercial bank.</p><p><b>Example.</b> GBTD tokens between ${GBTD_BANKS.map(bankDisplay).join(', ')}.</p><p><b>On this map.</b> The live UK Finance pilot. Quant is the named technology partner (Overledger + PayScript), not the issuer.</p></div></li>
    <li data-kind="stable">${posterFrame(photoFigure(PLATES.exchange, 'liability-still'), '<span class="n">03</span><h3>Stablecoin / crypto</h3>')}<div><p><b>Who owes it.</b> Usually a private issuer or protocol.</p><p><b>Example.</b> x402 agent payments can use tokens; Quant’s thesis is to settle them in bank money.</p><p><b>On this map.</b> Layer 3 in Verdian’s architecture. Do not read a city pin as a coin listing.</p></div></li>
  </ol>
  <section class="cbdc-models">
    ${kicker('Three models')}
    <h2 class="display">Issuance, wholesale, tokenised deposits.</h2>
    <ol class="model-grid">${models}</ol>
  </section>
  <div class="chapter-stack cinema-room">${chaptersFor('cbdc').map((c) => chapterCard(c)).join('')}</div>
  ${dykBlock()}`;
}

export function renderStandards(): string {
  const satpStills = [PLATES.geneva, PLATES.fiber, PLATES.canary, PLATES.ucl] as const;
  const stages = SATP_STAGES.map(
    (s) => `<li class="stage" data-satp-n="${esc(s.n)}">
      <button type="button" class="stage-btn" data-stage="satp" data-stage-id="${esc(s.n)}">
        ${posterFrame(
          photoFigure(satpStills[Number(s.n)] ?? PLATES.geneva, 'satp-still'),
          `<span class="n">${esc(s.n)}</span><span class="satp-title">${esc(s.title)}</span>`,
        )}
      </button>
      <p class="stage-body"><span>${esc(s.body)}</span><span class="mono subtle">${esc(s.tags)}</span></p>
    </li>`,
  ).join('');
  return `${pageHero(
    'Standards',
    'This is how a rail becomes permanent.',
    'HTTP, TCP/IP, TLS — nobody asks who wrote them anymore. IETF SATP and ISO are that kind of work. Status chips, editors, dates. The day SATP is an RFC, a bank can implement a gateway-to-gateway transfer without buying a brand. Adjacent rooms only where sourced.',
    '',
    undefined,
    'standards',
  )}
  ${stillStrip('standards', 'Photographs of the treaty')}
  ${quoteRail('standards')}
  ${cinemaDiagram('standards', '/visuals/plates/satp-stages.svg', 'SATP stages 0 verify, 1 init, 2 lock, 3 two-phase commit')}
  <section class="treaty-table">
    ${kicker('Treaty table')}
    <div class="treaty-stage">
      ${posterFrame(
        photoFigure(plateFor('standards', 'geneva'), 'treaty-still'),
        '<p class="kicker">Treaty table</p><h2>IETF SATP and ISO</h2>',
      )}
      <ul class="treaty-row">
        <li><button type="button" data-stage="satp" data-stage-id="3">${posterFrame(photoFigure(PLATES.fiber, 'treaty-still'), '<span class="chip">draft</span><strong>IETF SATP Core</strong><em>Hargreaves, Hardjono, Belchior, Ramakrishna, Chiriac · Facer co-chair</em>')}</button></li>
        <li><button type="button" data-stage="chapter" data-stage-id="iso">${posterFrame(photoFigure(PLATES.brussels, 'treaty-still'), '<span class="chip">referenced</span><strong>ISO/TS 23516:2026</strong><em>Verdian convenes WG7 · project 82098</em>')}</button></li>
        <li><button type="button" data-stage="event" data-stage-id="iso-2015">${posterFrame(photoFigure(PLATES.zurich, 'treaty-still'), '<span class="chip">adopted</span><strong>ISO/TC 307</strong><em>Proposed 2015</em>')}</button></li>
        <li><button type="button" data-stage="event" data-stage-id="odap-2020">${posterFrame(photoFigure(PLATES.royal, 'treaty-still'), '<span class="chip">referenced</span><strong>ODAP 2020</strong><em>Maiden name of the SATP shape</em>')}</button></li>
      </ul>
    </div>
  </section>
  <section class="satp-lab" id="satp-method">
    ${kicker('Verify, initiate, lock, then 2PC')}
    <h2 class="display">SATP’s two-phase commit sits inside stage 3 — not instead of the stages.</h2>
    <ol class="stages">${stages}</ol>
    <ul class="acid">
      <li>${posterFrame(photoFigure(PLATES.canary, 'acid-still'), '<strong>Atomicity</strong><span>The transfer commits on both networks or fails with no state change.</span>')}</li>
      <li>${posterFrame(photoFigure(PLATES.geneva, 'acid-still'), '<strong>Consistency</strong><span>When it ends, the asset lives in exactly one network.</span>')}</li>
      <li>${posterFrame(photoFigure(PLATES.fiber, 'acid-still'), '<strong>Isolation</strong><span>Origin state is not modified by anyone else while locked.</span>')}</li>
      <li>${posterFrame(photoFigure(PLATES.ucl, 'acid-still'), '<strong>Durability</strong><span>Once committed, a gateway crash does not undo it.</span>')}</li>
    </ul>
  </section>
  <div class="chapter-stack cinema-room">${chaptersFor('standards').map(chapterCard).join('')}</div>
  ${dykBlock()}`;
}

export function renderPeople(): string {
  const groups: PersonGroup[] = ['c-suite', 'heads', 'founders', 'board'];
  const blocks = groups
    .map((g) => {
      const people = PEOPLE.filter((p) => p.group === g).map(personCard).join('');
      return `<section class="people-group cinema-room"><p class="lede-sm">${esc(GROUP_LABEL[g])}</p>${people}</section>`;
    })
    .join('');
  return `${pageHero(
    'People',
    'The names on the papers —',
    'Verdian left Vocalink to build a gateway OS. The others wrote the taxonomy, the ordering claim, the SATP drafts. Their professional portraits fill the frame. A monogram means Quant has not published a face.',
    'and in the rooms.',
    undefined,
    'people',
  )}
  <div class="toolbar filter-bar">
    <input type="search" id="people-search" placeholder="Search names, roles, rooms…" />
  </div>
  ${peopleRail()}${overledgerRoster()}${quoteRail('people')}${fold('Full records by role', blocks, true)}${dykBlock()}`;
}

function peoplePoster(p: Person): string {
  const face = p.photo
    ? `<img class="people-face" src="${esc(p.photo)}" alt="${esc(p.name)}" width="640" height="800" decoding="async" />`
    : `<span class="people-mono" aria-hidden="true">${esc(p.initials)}</span>`;
  return `<button type="button" class="people-tile cinema-poster${p.photo ? '' : ' is-mono'}" data-stage="person" data-stage-id="${esc(p.id)}">
    <span class="people-still-wrap cinema-frame">
      <span class="cinema-letterbox cinema-letterbox-top" aria-hidden="true"></span>
      <span class="cinema-grain" aria-hidden="true"></span>
      ${face}
      <span class="people-wash" aria-hidden="true"></span>
      <span class="people-credit"><strong>${esc(p.name)}</strong><em>${esc(p.role)}</em></span>
      <span class="cinema-letterbox cinema-letterbox-bottom" aria-hidden="true"></span>
    </span>
  </button>`;
}

function peopleRail(): string {
  const faces = PEOPLE.map(peoplePoster).join('');
  return `<nav class="people-rail" aria-label="Official portraits">
    ${kicker('On the record')}
    <h2 class="display">Their professional portraits. The whole picture.</h2>
    <p class="lede-sm">Quant people pages, Tasca’s site, Mondelli’s published GitHub identity. Chris Lovesey and Colin Paterson stay as initials until an official portrait is published. We do not invent faces.</p>
    <div class="people-tiles">${faces}</div>
  </nav>`;
}

function personCard(p: Person): string {
  const spoken = quotesForPerson(p.id)
    .slice(0, 2)
    .map(
      (q) => `<button type="button" class="quote-inline" data-stage="quote" data-stage-id="${esc(q.id)}">
        ${posterFrame(
          photoFigure(plateFor(q.id), 'quote-still'),
          `<p>“${esc(q.text)}”</p>
        <footer>${esc(q.role)}${q.note ? `<p class="note">${esc(q.note)}</p>` : ''}</footer>`,
        )}
      </button>`,
    )
    .join('');
  const officialHref = p.href ? sourceUrl(p.href) : '';
  const official = officialHref
    ? `<p class="person-cta">${extLink(officialHref, 'Open original')}</p>`
    : p.id === 'lovesey'
      ? '<p class="tiny">Monogram only — Quant has not published a portrait.</p>'
      : '';
  const photo = p.photo
    ? `<img class="people-face" src="${esc(p.photo)}" alt="${esc(p.name)}" width="320" height="400" />`
    : `<span class="people-mono" aria-hidden="true">${esc(p.initials)}</span>`;
  const face = `<button type="button" class="person-face" data-stage="person" data-stage-id="${esc(p.id)}" aria-label="${esc(p.name)} story">
    <span class="person-still cinema-frame">
      <span class="cinema-letterbox cinema-letterbox-top" aria-hidden="true"></span>
      <span class="cinema-grain" aria-hidden="true"></span>
      ${photo}
      <span class="people-wash" aria-hidden="true"></span>
      <span class="people-credit"><strong>${esc(p.name)}</strong><span class="people-credit-role">${esc(p.role)}</span></span>
      <span class="cinema-letterbox cinema-letterbox-bottom" aria-hidden="true"></span>
    </span>
  </button>`;
  return `<article class="person group-${esc(p.group)}" id="${esc(p.id)}" data-q="${esc(`${p.name} ${p.role} ${p.bio}`)}">
    ${face}
    <div>
      <h2>${esc(p.name)}</h2>
      <p class="role">${esc(p.role)}${p.current ? '' : ' · <span class="chip">left / documentary</span>'}</p>
      <details class="person-more">
        <summary>Record</summary>
        <p>${esc(p.bio)}</p>
        ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
        ${official}
        ${spoken ? `<div class="person-quotes">${spoken}</div>` : ''}
      </details>
    </div>
  </article>`;
}

const RESEARCH_LANES: Array<{ id: string; title: string; lede: string }> = [
  { id: 'primary', title: 'Primary sources', lede: 'Whitepapers, official-sector announcements, and company filings that start the record.' },
  { id: 'standards', title: 'Standards drafts', lede: 'IETF SATP and ISO documents. A draft is not a Quant product SKU.' },
  { id: 'patent', title: 'Patents', lede: 'Sequence and method claims. A grant is not a deployment.' },
  { id: 'book', title: 'Books', lede: 'Long-form work cited on the record.' },
  { id: 'survey', title: 'Surveys', lede: 'Taxonomies that place the gateway among other interoperability options.' },
  { id: 'note', title: 'Briefs', lede: 'Sourced notes. A brief is not a press-release copy.' },
];

export function renderResearch(filter = '', region = 'ALL'): string {
  const q = filter.trim().toLowerCase();
  const featured = featuredPapers();
  const all = papersNewestFirst().filter((p) => {
    if (region !== 'ALL' && !paperRegions(p).includes(region as PaperRegion)) {
      return false;
    }
    if (!q) return true;
    return `${p.title} ${p.venue} ${p.authors.join(' ')} ${p.lede} ${p.year}`.toLowerCase().includes(q);
  });
  const lanes = RESEARCH_LANES.map((lane) => {
    const items = all.filter((p) => p.kind === lane.id);
    if (!items.length) return '';
    return `<section class="research-lane cinema-room" data-lane="${esc(lane.id)}">
      <div class="lane-head">
        ${posterFrame(
          diagramFigure(`lane-${lane.id}`, `paper-${lane.id}`, lane.title),
          `${kicker(lane.id)}<h2 class="display">${esc(lane.title)}</h2><p class="lede-sm">${esc(lane.lede)}</p><p class="mono subtle">${items.length} in this lane</p>`,
        )}
      </div>
      <div class="paper-grid">${items.map(paperCard).join('')}</div>
    </section>`;
  }).join('');
  const regionChips = ['ALL', 'UK', 'US', 'EU', 'Standards', 'Patents', 'INTL']
    .map((r) => `<button type="button" class="chip${r === region ? ' is-on' : ''}" data-region="${esc(r)}">${esc(r)}</button>`)
    .join('');
  const kindChips = ['ALL', ...RESEARCH_LANES.map((l) => l.id)]
    .map((k) => `<button type="button" class="chip${k === 'ALL' ? ' is-on' : ''}" data-kind="${esc(k)}">${esc(k === 'ALL' ? 'All kinds' : k)}</button>`)
    .join('');
  return `${pageHero(
    'Library',
    'Forty-eight documents —',
    'Read the filings. Not the recap. Primary sources, standards drafts, patents, books, surveys, briefs. Filter by region or kind without leaving the page. Open original is secondary: UCL, IETF, ACM, Quant, the patent offices.',
    'grouped by what they are.',
    'london',
    'research',
  )}
    ${stillStrip('research', 'Photographs in the library')}
  ${quoteRail('research')}
  <div class="toolbar filter-bar">
    <input type="search" id="lib-search" placeholder="Search titles, authors, venues" value="${esc(filter)}" />
    <p class="mono subtle">${papersNewestFirst().length} documents</p>
  </div>
  <div class="chip-row" id="research-regions">${regionChips}</div>
  <div class="chip-row" id="research-kinds">${kindChips}</div>
  <section class="block">
    ${kicker('Start here')}
    <div class="paper-grid">${featured.map(paperCard).join('')}</div>
  </section>
  <div id="research-grid">${lanes}</div>
  <p class="empty-note" id="research-empty" ${all.length ? 'hidden' : ''}>Nothing in this library matches. Try SATP, Tasca, or GBTD.</p>
  ${dykBlock()}`;
}

function paperCard(p: Paper): string {
  const verify = p.id === 'synchro' ? '<span class="chip">needs verification</span>' : '';
  return `<article class="paper" id="${esc(p.id)}" data-kind="${esc(p.kind)}" data-region="${esc(paperRegions(p).join(' '))}">
    ${posterFrame(
      diagramFigure(p.id, `paper-${p.kind}`, p.year),
      `<span class="year-num">${esc(p.year)}</span><p class="kicker">${esc(p.kind)} ${verify}</p><h2>${esc(p.title)}</h2><p class="meta">${esc(p.venue)}${p.authors.length ? ` · ${esc(p.authors.join(', '))}` : ''}</p>`,
    )}
    <details class="paper-more">
      <summary>What the document says</summary>
      ${essayParas(p.lede)}
    </details>
    <button type="button" class="text-link" data-stage="paper" data-stage-id="${esc(p.id)}">Read the filing →</button>
  </article>`;
}

export function renderRead(id: string): string {
  const p = paperById(id);
  if (!p) return renderNotFound();
  const href = sources[p.hrefKey];
  return `${pageHero(p.kind, p.title, p.lede, '', undefined, 'research')}
    <article class="chapter city-essay cinema-room">
      ${posterFrame(
        photoFigure(plateFor(p.id, p.kind, p.title), 'city-essay-still'),
        `<p class="kicker">${esc(p.kind)} · ${esc(p.year)}</p><h2>${esc(p.title)}</h2>`,
      )}
      <p class="meta">${esc(p.venue)} · ${esc(p.year)}${p.authors.length ? ` · ${esc(p.authors.join(', '))}` : ''}</p>
      ${essayParas(p.lede)}
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
              ${posterFrame(
                photoFigure(plateFor(t.id, t.term), 'term-still'),
                `<h2>${esc(t.term)}</h2><p>${esc(t.body)}</p>`,
              )}
            </button>
          </article>`,
        )
        .join('');
      return `<section class="letter"><h3>${esc(L)}</h3>${items}</section>`;
    })
    .join('');
  return `${pageHero('Language', 'Say the objects by their names.', 'Overledger, GBTD, SATP, QuantNet, a tokenised deposit, a CBDC — different objects, one story. Search. Each term opens a definition. Mixing them up is how the sector stayed noisy.', '', undefined, 'glossary')}
    ${stillStrip('glossary', 'Photographs of the objects')}
    <div class="toolbar">
      <input type="search" id="gloss-search" placeholder="Search the terms" value="${esc(filter)}" />
      <p class="mono subtle">${terms.length} terms</p>
    </div>
    ${groups || '<p class="empty-note">No term matches. Try SATP, GBTD, or Herstatt.</p>'}`;
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
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="#1a2a44" stroke-width="12"/>
    <circle class="supply-ring-arc" cx="60" cy="60" r="${r}" fill="none" stroke="#1557FF" stroke-width="12" stroke-linecap="round" stroke-dasharray="${dash.toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 60 60)"/>
    <text x="60" y="56" text-anchor="middle" fill="#eaf1ff" font-size="18" font-family="Outfit, sans-serif" font-weight="700">${pct ? `${pct.toFixed(1)}%` : '—'}</text>
    <text x="60" y="74" text-anchor="middle" fill="#8aa3c8" font-size="8">circulating</text>
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
    'QNT licences the network.',
    'Research presentation. Not advice. Overledger licences settle in QNT — that is why it trades. Live quotes from Coinbase, Kraken or Binance. Market cap, supply and venues from CoinGecko. As-of timestamps on every print. Utility token, not equity in Quant Network.',
    'Not the story. The meter.',
    undefined,
    'markets',
  )}
  ${stillStrip('markets', 'Photographs of the meter')}
  ${quoteRail('markets')}
  <section class="tape cinema-tape" data-mk data-proof="ticker">
    ${posterFrame(
      photoFigure(plateFor('markets', 'qnt'), 'markets-still'),
      `<div class="tape-head">${chip}<span class="mono subtle" data-mk-meta>Updated ${esc(p?.updated ?? '—')} · ${esc(p?.venue ?? '')}</span></div>
    <p class="stat" data-mk-price>${p?.priceUsd != null ? fmtMoney(p.priceUsd) : '—'}</p>
    <p class="${up ? 'up' : 'down'}" data-mk-change>${change} 24h</p>`,
    )}
    <div class="stats">
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
    ${posterFrame(
      photoFigure(PLATES.exchange, 'token-board-still'),
      `${kicker('How much is out there')}<h2>Circulating against total, from CoinGecko</h2>`,
    )}
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
    <h2 class="display">Why QNT exists.</h2>
    <div class="tokencards">
      <details class="tokencard" open>
        <summary>${posterFrame(photoFigure(PLATES.fiber, 'token-still'), '<span class="tokencard-label"><span class="n">01</span> Utility</span>')}</summary>
        <p>Overledger licences settle in QNT. That is the product reason the token trades. It is the utility token of Quant Network, distinct from equity in Quant Network Ltd.</p>
      </details>
      <details class="tokencard">
        <summary>${posterFrame(photoFigure(PLATES.exchange, 'token-still'), '<span class="tokencard-label"><span class="n">02</span> Scarcity</span>')}</summary>
        <p>On 14 September 2018 Quant sent the unsold allocation to the contract itself. Their post records total supply 14,612,493.080826178 QNT. Bitstamp’s MiCA whitepaper cites a post-burn maximum of 14,881,364. Both figures sit on the record. Today’s circulating print is CoinGecko’s.</p>
      </details>
      <details class="tokencard">
        <summary>${posterFrame(photoFigure(PLATES.canary, 'token-still'), '<span class="tokencard-label"><span class="n">03</span> Licence lock</span>')}</summary>
        <p>Bitstamp’s MiCA filing (13 May 2026) records that licences can lock QNT for the term of the licence. Locked tokens are not a claim that a holder never sells. They are a contractual term on a utility token.</p>
      </details>
      <details class="tokencard">
        <summary>${posterFrame(photoFigure(PLATES.datacenter, 'token-still'), '<span class="tokencard-label"><span class="n">04</span> The contract</span>')}</summary>
        <p>ERC-20 on Ethereum. ${esc(QNT_CONTRACT)}. Check it on Etherscan before you send anything. Burn transaction ${extLink(sources.qntBurnTx, '0x763f32a0…')}.</p>
      </details>
    </div>
    <p class="source-row">${extLink(sources.qntEtherscan, 'Etherscan')} ${extLink(sources.qntBurnTweet, 'Burn tweet')} ${extLink(sources.micaBitstamp, 'Bitstamp MiCA')} ${extLink(sources.treasuryPdf.startsWith('http') ? sources.treasuryPdf : sources.overledger, 'Treasury note')}</p>
  </section>
  <section class="chapter venue-board">
    ${posterFrame(
      photoFigure(PLATES.fiber, 'venue-still'),
      `${kicker('Where the volume is')}<h2>Each cell is a CoinGecko venue, scaled to the busiest one.</h2>`,
    )}
    <ul class="bars" data-mk-bars>${bars}</ul>
  </section>`;
}

export function headlinePosterButton(h: Headline, withLane = false): string {
  rememberHeadline({
    id: h.id,
    title: h.title,
    url: h.url,
    source: h.source,
    published: h.published ?? '',
    lane: h.lane,
  });
  const copy = withLane
    ? `<span class="kicker">${esc(h.lane)}</span><strong>${esc(h.title)}</strong>`
    : `<strong>${esc(h.title)}</strong>`;
  return `<button type="button" data-stage="news" data-stage-id="${esc(h.id)}" data-title="${esc(h.title)}" data-url="${esc(h.url)}" data-source="${esc(h.source)}" data-published="${esc(h.published ?? '')}" data-lane="${esc(h.lane)}">
    ${posterFrame(
      photoFigure(plateFor(h.id), 'headline-still'),
      copy,
    )}
  </button>`;
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
              ${headlinePosterButton(h)}
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
      `<p class="empty-note">${esc(river?.error ?? 'No live headlines yet. This month’s sourced notes stay on the page.')}</p>`,
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
    <h2 class="display">Sourced notes. <span class="display-mute">When the wire is quiet, these stay visible.</span></h2>
    <div class="notes-index">${cards}</div>
  </section>`;
}

export function renderNews(river?: NewsRiver, filter = ''): string {
  const list = newsListMarkup(river, filter);
  return `${pageHero(
    'Wire',
    'The story, as it unfolds.',
    'Official Quant, Overledger docs, IETF SATP, quality news and filings — newest first. Each headline is a briefing you can stay with. Quiet weeks keep this month’s sourced notes on the page.',
    '',
    undefined,
    'news',
  )}
  ${stillStrip('news', 'Photographs on the wire')}
  ${filterBox('news-filter', 'Search headlines…', filter)}
  <section class="wire cinema-wire">
    <div class="tape-head"><span class="chip ${(river?.status ?? 'loading').toLowerCase()}" data-news-status>${esc(river?.status ?? 'loading')}</span><span class="mono subtle" data-news-count>${list.count} matching headlines</span></div>
    <ul class="headlines" data-news-list>${list.html}</ul>
  </section>
  ${sourcedNews()}${renderThisMonth()}${renderCalendar()}${renderVoices()}`;
}

function renderCalendar(compact = false): string {
  const items = CALENDAR.map((e) => {
    const stamp = dateStamp(e.when);
    return `<li class="cal-card">
      <button type="button" data-stage="source" data-stage-id="${esc(e.id)}" data-title="${esc(e.title)}" data-url="${esc(sourceUrl(e.href))}" data-source="${esc(e.hrefLabel)}">
      ${posterFrame(
        photoFigure(plateFor(e.id, e.where, e.title), 'cal-still'),
        `<time datetime="${esc(e.when)}"><span class="day">${esc(stamp.day)}</span><span class="rest">${esc(stamp.rest)}</span></time>
      <p class="mono">${esc(e.where)}</p>
      <h3>${esc(e.title)}</h3>`,
      )}
      ${compact ? '' : `<p>${esc(e.body)}</p>`}
      </button>
    </li>`;
  }).join('');
  return `<section class="calendar">
    ${kicker('Upcoming')}
    <h2 class="display">Miami is <span class="display-mute">next</span></h2>
    <p>Quant at Sibos, stand DISL51, with Murex on stage — posted from @quantnetwork. DIGIT gilt is the Treasury, speaking at the UK Finance launch on 8 September. The speech does not name Quant; it sits in the same week as the UK Finance filing.</p>
    <ul class="cal-grid">${items}</ul>
  </section>`;
}

function renderThisMonth(compact = false): string {
  const items = THIS_MONTH.map((n) => {
    const stamp = dateStamp(n.date);
    return `<li class="month-card">
      <button type="button" data-stage="source" data-stage-id="${esc(n.id)}" data-title="${esc(n.title)}" data-url="${esc(sourceUrl(n.href))}" data-source="${esc(n.source)}">
      ${posterFrame(
        photoFigure(plateFor(n.id, n.lane, n.title), 'month-still'),
        `<time datetime="${esc(n.date)}"><span class="day">${esc(stamp.day)}</span><span class="rest">${esc(stamp.rest)}</span></time>
      <p class="mono">${esc(n.source)} · ${esc(n.lane)}</p>
      <h3>${esc(n.title)}</h3>`,
      )}
      ${compact ? '' : `<p>${esc(n.body)}</p>`}
      </button>
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
    (v) => `<article class="voice cinema-voice">
      ${posterFrame(
        photoFigure(plateFor(v.handle, v.name), 'voice-still'),
        `<h3>${esc(v.name)} <span class="mono">${esc(v.handle)}</span></h3><p>${esc(v.blurb)}</p>`,
      )}
      ${extLink(v.href, v.handle)}
    </article>`,
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
      ${posterFrame(
        photoFigure(plateFor('markets', 'qnt'), 'markets-still'),
        `${kicker('Live QNT')}<p class="stat" data-home-price>—</p><p class="subtle" data-home-meta>Live print · Coinbase, Kraken or Binance · CoinGecko supply</p>`,
      )}
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
    'The live pages are News, Programmes, Research and the twenty-part podcast.',
    'with the record.',
    undefined,
    'news',
  )}
  ${stillStrip('news', 'Photographs on the map')}
  <p class="masthead" style="padding-top:0">${pill('/news', 'Open the news', 'Official wire')} ${pill('/podcast', 'Start the series', 'From the beginning', 'ghost')}</p>`;
}

function essayParas(text: string): string {
  return text
    .split(/(?<=\.)\s+(?=[A-Z“"])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `<p>${esc(s)}</p>`)
    .join('');
}

export function renderCity(city: City): string {
  const neighbors = CITIES.filter((c) => c.id !== city.id)
    .slice(0, 4)
    .map(
      (c) => `<a class="city-neighbor" href="/${esc(c.id)}">
        ${posterFrame(
          `<span class="city-neighbor-still cinema-frame">
          <span class="cinema-letterbox cinema-letterbox-top" aria-hidden="true"></span>
          <span class="cinema-grain" aria-hidden="true"></span>
          <img src="${esc(c.photo ?? `/visuals/cities/${c.id}.jpg`)}" alt="${esc(c.name)}" width="720" height="405" decoding="async" />
        </span>`,
          `<span>${esc(c.name)}</span>`,
        )}
      </a>`,
    )
    .join('');
  return `${pageHero(city.id, city.name, city.lede, city.kicker, undefined, `city:${city.id}`)}
    <p class="mono subtle coord-block">${city.lat.toFixed(4)}, ${city.lon.toFixed(4)} · ${esc(city.country)}</p>
    <article class="chapter city-essay cinema-room">
      ${posterFrame(
        photoFigure(plateFor(city.id, city.name), 'city-essay-still'),
        `<p class="kicker">${esc(city.country)}</p><h2>${esc(city.name)}</h2>`,
      )}
      ${essayParas(city.body)}
      <p><button type="button" class="text-link" data-stage="city" data-stage-id="${esc(city.id)}">Open the briefing →</button> · <a class="text-link" href="${esc(city.href)}">Related chapter →</a></p>
    </article>
    <section class="city-neighbors" aria-label="Other rooms on the map">
      ${kicker('Other rooms')}
      <h2 class="display">The same story, in another postcode.</h2>
      <div class="city-neighbor-grid">${neighbors}</div>
    </section>
    <p><a class="text-link" href="/">← Earth</a></p>`;
}

export function renderDonate(): string {
  return `${pageHero(
    'Support',
    'Optional. The pages stay free.',
    'If you want the filings to stay online, these are the only published addresses. Donations buy no tokens and no yield. Nothing in a DM. Nothing that looks like this page.',
    '',
    undefined,
    'donate',
  )}
  ${stillStrip('donate', 'Photographs of the desk')}
  <article class="chapter city-essay cinema-room">
    ${posterFrame(
      photoFigure(plateFor('donate', 'support'), 'city-essay-still'),
      '<p class="kicker">Support</p><h2>The only published addresses</h2>',
    )}
    <p>QNT token contract for verification only — a separate address from the published recipients: ${extLink(sources.qntEtherscan, QNT_CONTRACT)}. Copy into a wallet you already control. A seed is never requested.</p>
    <p>Published recipients:</p>
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
  return `${pageHero('404', 'This page is not', 'Try News, Podcast, Vision, Programmes, Research or Markets.', 'on the map.', undefined, 'news')}
  ${stillStrip('news', 'Photographs on the map')}
  <article class="chapter city-essay cinema-room">
    ${posterFrame(
      photoFigure(plateFor('news', '404'), 'city-essay-still'),
      '<p class="kicker">404</p><h2>This page is not on the map.</h2>',
    )}
    <p>This URL is not on the desk. The live rooms are News, Podcast, Vision, Programmes, Research and Markets.</p>
  </article>
  <p class="masthead" style="padding-top:0">${pill('/', 'Earth', 'Back')} ${pill('/news', 'Open the news', 'Official wire', 'ghost')}</p>`;
}

export function renderPodcast(): string {
  const first = episodeByN(1);
  if (!first) return renderNotFound();
  return `${pageHero(
    'Podcast',
    'Twenty conversations. Start at the beginning.',
    'We’ve gotten used to hearing the sector as slogans. Hale and Crowe walk it in order instead: ISO, the 2018 paper, SATP, QNT, then the six banks that already issue tokenised sterling. Quotes keep their titles. Dates stay on the page.',
    '',
    undefined,
    'podcast',
  )}${stillStrip('podcast', 'Photographs of the series')}${playerMarkup(first)}${filmRail()}`;
}

export function renderEpisode(id: string): string {
  const ep = episodeById(id);
  if (!ep) return renderNotFound();
  return `${pageHero(
    `Episode ${String(ep.n).padStart(2, '0')}`,
    ep.title,
    ep.lede,
    '',
    undefined,
    'podcast',
  )}${stillStrip('podcast', 'Photographs of this episode')}${playerMarkup(ep)}
  <article class="chapter city-essay cinema-room">
    ${posterFrame(
      photoFigure(plateFor('podcast', ep.id, ep.title), 'city-essay-still'),
      `<p class="kicker">Episode ${String(ep.n).padStart(2, '0')}</p><h2>${esc(ep.title)}</h2>`,
    )}
    ${essayParas(ep.lede)}
  </article>`;
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
    'Field notes, in the order they landed.',
    'Did-you-know items and September 2026 filings, latest first. History, the live rooms, and what is still ahead — from the record. Each card opens a briefing you can stay with.',
    '',
    'history',
    'notes',
  )}
  ${stillStrip('notes', 'Photographs in the notes')}
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
    ${pageHero(n.kicker, n.title, `${n.source}. ${n.era[0].toUpperCase()}${n.era.slice(1)} of the Internet of Value.`, '', bed, 'notes')}
    <article class="chapter city-essay note-body cinema-room">
      ${posterFrame(
        photoFigure(plateFor(n.id, n.era, n.title), 'city-essay-still'),
        `<p class="kicker">${esc(n.kicker)} · ${esc(n.dateLabel)}</p><h2>${esc(n.title)}</h2>`,
      )}
      <p class="mono subtle">${esc(n.dateLabel)} · ${esc(n.era)} · ${esc(n.source)}</p>
      ${essayParas(n.body)}
      <p class="source-row">${source}</p>
      <p><a class="text-link" href="/news">← The wire</a></p>
    </article>
    ${related ? `<section class="notes-related">${kicker('Same era')}<div class="notes-index">${related}</div></section>` : ''}
  </article>`;
}
