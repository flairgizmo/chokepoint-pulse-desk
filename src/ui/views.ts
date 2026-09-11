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
import { CALENDAR, GBTD_BANKS, MONEY_LAYERS, OFFICIAL_VOICES, SATP_STAGES, THIS_MONTH, TIMELINE } from '../data/timeline';
import type { MarketPrint } from '../modules/markets';
import type { NewsRiver } from '../modules/news';
import { esc, extLink, fmtMoney, fmtPct, fmtQty } from './html';

export const DISCLAIMER =
  'QntDesk is an independent educational reference. It is not affiliated with, endorsed by, or part of Quant Network Ltd, Overledger, UK Finance, the Bank of England, the BIS, Oracle, Murex, Dentsu Soken, EY, Linklaters, LACChain, the Linux Foundation, or any person, bank, or standard body named on these pages. Names, marks and documents belong to their owners and are cited for commentary and research. Nothing here is financial advice, investment advice, an official statement, or a claim of employment or partnership. Crypto is volatile.';

export function kicker(text: string): string {
  return `<p class="kicker"><i class="section-dot" aria-hidden="true"></i>${esc(text)}</p>`;
}

function displayTitle(title: string, mute = ''): string {
  if (!mute) return esc(title);
  return `${esc(title)} <span class="display-mute">${esc(mute)}</span>`;
}

export function pageHero(k: string, title: string, lede: string, mute = ''): string {
  return `<header class="page-hero">
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

function chapterCard(c: Chapter): string {
  return `<article class="chapter" id="${esc(c.id)}">
    ${kicker(c.kicker)}
    <h2>${esc(c.title)}</h2>
    <p>${esc(c.body)}</p>
  </article>`;
}

function quoteCard(q: Quote): string {
  return `<blockquote class="quote-card">
    <p>${esc(q.text)}</p>
    <footer>
      <strong>${esc(q.who)}</strong>
      <span>${esc(q.role)}</span>
      ${extLink(sourceUrl(q.href), 'Source')}
      ${q.note ? `<p class="note">${esc(q.note)}</p>` : ''}
    </footer>
  </blockquote>`;
}

function quoteRail(page?: string, limit = 8): string {
  const list = quotesFor(page).slice(0, limit);
  if (!list.length) return '';
  return `<section class="quote-rail">
    ${kicker('In their words')}
    <h2 class="display">Sourced lines. <span class="display-mute">Not invented dialogue.</span></h2>
    <div class="quote-grid">${list.map(quoteCard).join('')}</div>
  </section>`;
}

function filterBox(id: string, placeholder: string, value: string, extra = ''): string {
  return `<div class="toolbar filter-bar">
    <input type="search" id="${esc(id)}" placeholder="${esc(placeholder)}" value="${esc(value)}" />
    ${extra}
  </div>`;
}

function sparklineSvg(values: number[]): string {
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
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Seven-day CoinGecko sparkline"><polyline fill="none" stroke="${up ? '#0f7a4a' : '#c62828'}" stroke-width="3" points="${pts}"/></svg>`;
}

function dykBlock(): string {
  const items = didYouKnow.slice(0, 4);
  const list = items
    .map(
      (d) => `<li class="dyk-card">
        <p class="kicker">${esc(d.category)}</p>
        <p class="dyk-q">${esc(d.q)}</p>
        <p>${esc(d.a)}</p>
        <a class="text-link" href="${esc(d.to || '/')}">${esc(d.cta || 'Open')} →</a>
      </li>`,
    )
    .join('');
  return `<section class="dyk">
    ${kicker('Did you know')}
    <h2 class="display">The future of money, <span class="display-mute">as a question.</span></h2>
    <ul class="dyk-list">${list}</ul>
  </section>`;
}

export function renderHome(): string {
  const banks = GBTD_BANKS.map((b) => `<li class="wordmark"><a href="/programmes#gbtd">${esc(b)}</a></li>`).join('');
  const beats = TIMELINE.map(
    (t) => `<li class="beat"><span class="year">${esc(t.year)}</span><div><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div></li>`,
  ).join('');
  const essays = ['philosophy', 'future', 'era']
    .map((id) => chaptersFor('vision').find((c) => c.id === id))
    .filter((c): c is Chapter => Boolean(c))
    .map(
      (c) => `<article class="panel">
        ${kicker(c.kicker)}
        <h3 class="display">${esc(c.title)}</h3>
        <p>${esc(c.body)}</p>
        <a class="text-link" href="/vision#${esc(c.id)}">Read →</a>
      </article>`,
    )
    .join('');
  return `
    <section class="masthead">
      ${kicker('The Internet of Value')}
      <div class="hero-split">
        <h1 class="display">Money already moves like software. <span class="display-mute">The scarce layer is the one that lets it talk.</span></h1>
        <div>
          <p class="lede">Overledger sits above the ledgers and bank cores that already settle — Fabric, Ethereum, Faster Payments — the way TCP/IP sat above the wires. UK banks are already programming sterling deposits on it. QNT is the utility token of that network. GBTD is a tokenised-deposit pilot, not a CBDC.</p>
          <div class="cta-row">
            ${pill('/vision', 'Read the thesis', 'The argument')}
            ${pill('/programmes', 'Named programmes', 'See the rooms', 'ghost')}
            ${pill('/people', 'In their words', 'People', 'ghost')}
          </div>
        </div>
      </div>
    </section>

    <section class="earth-hero" data-proof="hero">
      <div class="earth-stage" id="earth-stage" tabindex="0" aria-label="Interactive 3D Earth. Drag to orbit, scroll to zoom, double-click to fly in, click a city."></div>
      <div class="earth-hud">
        <div class="hud-card">
          <p class="kicker"><i class="section-dot" aria-hidden="true"></i>Earth · 3D</p>
          <p class="hud-help">ISR · look-down · stationary by default</p>
          <label class="sr-only" for="city-select">Cities</label>
          <select id="city-select">${CITIES.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select>
        </div>
        <div class="hud-tools">
          <button type="button" data-zoom="-0.4" aria-label="Zoom out">−</button>
          <span id="zoom-readout" class="mono">1.0×</span>
          <button type="button" data-zoom="0.4" aria-label="Zoom in">+</button>
          <button type="button" data-reset-globe aria-label="Reset view">↺</button>
        </div>
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
        <p class="isr-line mono" id="isr-line">Educational look-down · stylised night Earth · sourced corridors, not live SWIFT</p>
      </div>
    </section>

    <p class="congrats"><strong>This month on Quant.</strong> Trusted Node, UK Finance digital markets, Sibos Miami DISL51. Sourced notes — not invented headlines.</p>

    ${renderLiveRail()}
    ${renderThisMonth()}
    ${renderCalendar()}
    ${renderVoices()}

    <section class="strip">
      ${kicker('GBTD cohort — the six commercial banks named by UK Finance')}
      <ul class="wordmarks">${banks}</ul>
      ${kicker('The institutions around that cohort')}
      <ul class="wordmarks muted">
        <li class="wordmark"><a href="/programmes#gbtd">UK Finance</a></li>
        <li class="wordmark"><a href="/cbdc">Bank of England</a></li>
        <li class="wordmark"><a href="/programmes#basel">BIS</a></li>
        <li class="wordmark"><a href="/programmes#murex">Murex</a></li>
      </ul>
    </section>

    <section class="essays">
      ${kicker('Essays')}
      <h2 class="display">Philosophy. The future of money. <span class="display-mute">The interop era.</span></h2>
      <div class="essay-grid">${essays}</div>
    </section>

    <section class="timeline-wrap">
      ${kicker('Then and now')}
      <h2 class="display">A decade of connecting, <span class="display-mute">not replacing.</span></h2>
      <ol class="timeline">${beats}</ol>
    </section>

    <section class="layers-wrap">
      ${kicker('Three layers, one horizontal gate')}
      <h2 class="display">Each band is a different liability. <span class="display-mute">The gate is Overledger.</span></h2>
      <ol class="layers">${MONEY_LAYERS.map((l) => `<li><span class="n">${esc(l.n)}</span><div><h3>${esc(l.title)}</h3><p>${esc(l.body)}</p></div></li>`).join('')}</ol>
    </section>

    <section class="triptych hex">
      <article class="panel">${kicker('Thesis')}<h2 class="display">A gateway OS</h2><p>Multi-DLT and multi-legacy connectivity without forcing a new settlement chain. Tasca called it a risky necessity. Verdian built a company on that sentence.</p><a class="text-link" href="/vision">Vision →</a></article>
      <article class="panel">${kicker('SATP')}<h2 class="display">How assets move between networks</h2><p>Secure Asset Transfer Protocol is IETF work Quant helps write. Stage-3 is burn-and-mint under two-phase commit. Not a product SKU.</p><a class="text-link" href="/standards">Standards →</a></article>
      <article class="panel">${kicker('GBTD')}<h2 class="display">Live sterling, programmed</h2><p>UK Finance selected Quant as technology partner for tokenised deposits with six banks. The banks owe the holder. Overledger runs the rails.</p><a class="text-link" href="/cbdc">The distinction →</a></article>
      <article class="panel">${kicker('Tokenomics')}<h2 class="display">Why QNT exists</h2><p>An ERC-20, burned down in 2018. Overledger licences settle in it. Live price and circulating come from CoinGecko. Utility token, not equity.</p><a class="text-link" href="/markets#tokenomics">Markets →</a></article>
      <article class="panel">${kicker('Stack')}<h2 class="display">Overledger, Fusion, PayScript</h2><p>Gateway OS, multi-ledger rollup, programming layer. Oracle and Murex sit on top of that sentence, not beside a new chain.</p><a class="text-link" href="/technology">The stack →</a></article>
      <article class="panel">${kicker('Programmes')}<h2 class="display">The rooms Quant is already in</h2><p>LACChain in 2021. Rosalind in 2023. GBTD in 2025. Dentsu Soken, Murex, the Bank of England lab in 2026. A chronology of rooms, each one named.</p><a class="text-link" href="/programmes">Programmes →</a></article>
    </section>

    ${quoteRail('home')}
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
  return `${pageHero(k, title, lede, mute)}${quoteRail(page)}${extra}<div class="chapter-stack">${body}</div>${dykBlock()}`;
}

export function renderVision(): string {
  return renderChapterPage(
    'vision',
    'A network of networks,',
    'The Internet of Value is a connectivity problem. Overledger’s claim is to sit above ledgers and core systems the way TCP/IP sat above physical networks — a gateway operating system, not a twelfth blockchain.',
    'Vision',
    `<blockquote class="pull">
      <p>This paper proposes a solution to the problem of single-ledger dependency, by introducing a new technology for the design, deployment and execution of multi-ledger decentralized applications. This technology is called Overledger.</p>
      <footer>Verdian, Tasca, Paterson, Mondelli — Quant Overledger whitepaper v0.1, UCL Discovery abstract. ${extLink(sources.whitepaperUcl, 'Open the record')}</footer>
    </blockquote>
    <div class="compare">
      <article class="panel"><h3>TCP/IP for packets</h3><p>Applications stopped caring which physical network carried the bits. Ethernet, satellite, serial lines — one internet, many wires.</p></article>
      <article class="panel"><h3>Overledger for value</h3><p>Applications should stop caring which ledger, core or rail settles the money. Fabric, Ethereum, Corda, a bank core — one gateway, many domains.</p></article>
    </div>`,
    'not another chain.',
  );
}

export function renderTechnology(): string {
  return renderChapterPage(
    'technology',
    'Overledger is',
    'APIs, mappers and an orchestration fabric that let applications talk to more than one ledger — and to systems that are not ledgers at all. Fusion, PayScript, Flow Applications, MCP agents, x402, Hyperledger Fabric and Oracle sit on top of that sentence, not beside a new chain.',
    'The stack',
    '',
    'the gateway layer.',
  );
}

export function renderProgrammes(): string {
  const extra = `
    <article class="chapter" id="gbtd">
      ${kicker('GBTD — London')}
      <h2>Live tokenised sterling deposits</h2>
      <p>On 26 September 2025 UK Finance selected Quant to provide the technology for live tokenised sterling deposits with ${GBTD_BANKS.join(', ')}. EY and Linklaters support. Overledger and PayScript are named as the foundation. This is commercial-bank money, building on the 2024 RLN phase — not a Bank of England CBDC, and not a Quant-issued token.</p>
      <p class="source-row">${extLink(sources.gbtdUkFinance, 'UK Finance')} ${extLink(sources.gbtdQuant, 'Quant')} ${extLink(sources.gbtdUseCases, 'Three use cases')} ${extLink(sources.linklatersGbtd, 'Linklaters')}</p>
    </article>
    <article class="chapter" id="murex">
      ${kicker('Murex — Paris')}
      <h2>Tokenised deposits inside MX.3</h2>
      <p>On 25 March 2026 Murex and Quant announced a partnership to put tokenised deposits and digital-bond settlement inside MX.3, the cross-asset platform used by more than 300 institutions. Named vendor integration — not a central-bank programme and not a GBTD membership.</p>
      <p class="source-row">${extLink(sources.murexNews, 'Murex newsroom')} ${extLink(sources.murexQuant, 'Quant')}</p>
    </article>
    <article class="chapter" id="oracle">
      ${kicker('Oracle')}
      <h2>Blockchain Platform Digital Assets</h2>
      <p>February 2025. Oracle’s own blog names Overledger as the orchestration layer for cross-ledger, two-phase workflows on a Hyperledger Fabric platform. New York is the markets pin.</p>
      <p class="source-row">${extLink(sources.oracleBlog, 'Oracle blog')} ${extLink(sources.oracleQuant, 'Quant note')}</p>
    </article>
    <article class="chapter" id="basel">
      ${kicker('BIS — Basel')}
      <h2>Bibliography, not a standing office</h2>
      <p>Project Agora, “singleness of money” speeches, and wholesale CBDC research live in Basel. Project Rosalind was a concluded CBDC API experiment run from London. Geography plus citations; not a secret mandate.</p>
      <p class="source-row">${extLink(sources.bisHome, 'BIS')} ${extLink(sources.rosalindBis, 'Rosalind')}</p>
    </article>`;
  const chapters = chaptersNewestFirst('programmes').map(chapterCard).join('');
  return `${pageHero(
    'Named pilots and named labs',
    'Where Quant is already',
    'Newest first. Search the rooms. GBTD is live as a UK tokenised-deposit experiment with Quant as technology partner. Murex is a named Overledger integration. Rosalind was a 2023 BIS × Bank of England API experiment Quant says it supplied as a vendor — concluded. The 2026 Bank of England lab is a simulated RT2.',
    'in the room.',
  )}
    ${quoteRail('programmes')}
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
    'A central-bank digital currency is a liability of the central bank. GBTD tokens are liabilities of commercial banks. Mixing the two is the most common error on this map. AI agents, x402, Hyperledger, Oracle and Linux Foundation software change the rails — not that test.',
    'not a CBDC.',
  )}
  ${quoteRail('cbdc')}
  <div class="table-wrap">
    <table class="liability">
      <thead><tr><th>Kind</th><th>Who owes it</th><th>Example</th><th>On this map</th></tr></thead>
      <tbody>
        <tr><td>CBDC</td><td>Liability of a central bank</td><td>A digital pound, if issued, would sit here.</td><td>BoE Synchronisation Lab is adjacent experimentation — not a live CBDC.</td></tr>
        <tr><td>Tokenised deposit</td><td>Liability of a commercial bank</td><td>GBTD tokens between ${GBTD_BANKS.join(', ')}.</td><td>The live UK Finance pilot. Quant is the named technology partner (Overledger + PayScript), not the issuer.</td></tr>
        <tr><td>Stablecoin / crypto</td><td>Usually a private issuer or protocol</td><td>x402 agent payments can use tokens; Quant’s thesis is to settle them in bank money.</td><td>Layer 3 in Verdian’s architecture. Do not read a city pin as a coin listing.</td></tr>
      </tbody>
    </table>
  </div>
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
    'Officers first, then the heads who ship the stack, then sales, then the founding authors — including those who have since left. Official portraits live on Quant’s public people pages; we link out. Faces are never generated. Sourced quotations sit under the person who said them.',
    'on Overledger.',
  )}${quoteRail('people')}${blocks}${dykBlock()}`;
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
  const portrait = p.href
    ? `<p class="tiny">${extLink(sourceUrl(p.href), 'Official portrait / source')}</p>`
    : p.id === 'lovesey'
      ? '<p class="tiny">Initials only — no generated face.</p>'
      : '';
  return `<article class="person" id="${esc(p.id)}">
    <div class="avatar" aria-hidden="true">${esc(p.initials)}</div>
    <div>
      <h2>${esc(p.name)}</h2>
      <p class="role">${esc(p.role)}${p.current ? '' : ' · <span class="chip">left / documentary</span>'}</p>
      <p>${esc(p.bio)}</p>
      ${p.note ? `<p class="note">${esc(p.note)}</p>` : ''}
      ${portrait}
      ${spoken}
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
    'Newest first. Filter UK, US, EU, standards, patents. Every card opens a reader page in this encyclopedia. From there: the original publisher. 48 documents. We do not invent a forty-ninth.',
    'then the press release.',
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
    <p class="kicker">${esc(p.kind)} · ${esc(p.year)}</p>
    <h2>${esc(p.title)}</h2>
    <p class="meta">${esc(p.venue)}${p.authors.length ? ` · ${esc(p.authors.join(', '))}` : ''}</p>
    <p>${esc(p.lede)}</p>
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
      <p>This encyclopedia cites the publisher. If a sentence cannot survive the PDF, it does not belong on this globe.</p>
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
  return `${pageHero('Language', 'The language of', 'Overledger, GBTD, SATP, QuantNet, a tokenised deposit, a CBDC — different objects, one story. Search the terms.', 'programmable money.')}
    <div class="toolbar">
      <input type="search" id="gloss-search" placeholder="Search the terms" value="${esc(filter)}" />
      <p class="mono subtle">${terms.length} terms</p>
    </div>
    ${groups}`;
}

export function renderMarkets(print?: MarketPrint): string {
  const p = print;
  const chip = p ? `<span class="chip ${p.status.toLowerCase()}">${esc(p.status)}</span>` : `<span class="chip degraded">loading</span>`;
  const change = p?.change24h != null ? fmtPct(p.change24h) : '—';
  const up = (p?.change24h ?? 0) >= 0;
  const circ = p?.circulating ?? null;
  const total = p?.totalSupply ?? null;
  const pct = circ && total ? Math.min(100, (circ / total) * 100) : 0;
  const maxVol = Math.max(...(p?.tickers.map((t) => t.volume) ?? [1]), 1);
  const bars =
    p?.tickers.length
      ? p.tickers
          .map(
            (t) => `<li class="bar"><span>${esc(t.name)}</span><i style="--w:${(t.volume / maxVol) * 100}%"></i><em>${fmtMoney(t.volume, 0)}</em></li>`,
          )
          .join('')
      : '<p class="empty-note">Venue volumes will appear when CoinGecko lists them.</p>';
  return `${pageHero(
    'QNT',
    'QNT — the token of',
    'Overledger licences settle in QNT. That is why it trades. Live quotes from Coinbase, Kraken or Binance; market cap, supply and venues from CoinGecko. The Ethereum contract is below — check it yourself before you send anything.',
    'a network of networks.',
  )}
  ${quoteRail('markets')}
  <section class="tape" data-proof="ticker">
    <div class="tape-head">${chip}<span class="mono subtle">Updated ${esc(p?.updated ?? '—')} · ${esc(p?.venue ?? '')}</span></div>
    <div class="stats">
      <div><p class="kicker">Price</p><p class="stat">${p?.priceUsd != null ? fmtMoney(p.priceUsd) : '—'}</p><p class="${up ? 'up' : 'down'}">${change} 24h</p></div>
      <div><p class="kicker">Volume 24h</p><p class="stat">${p?.volume24h != null ? fmtMoney(p.volume24h, 0) : '—'}</p></div>
      <div><p class="kicker">Market cap</p><p class="stat">${p?.marketCap != null ? fmtMoney(p.marketCap, 0) : '—'}</p></div>
      <div><p class="kicker">24h high / low</p><p class="stat">${p?.high24h != null ? fmtMoney(p.high24h) : '—'} <span class="subtle">/</span> ${p?.low24h != null ? fmtMoney(p.low24h) : '—'}</p></div>
      <div><p class="kicker">Circulating</p><p class="stat">${circ != null ? fmtQty(circ) : '—'}</p></div>
      <div><p class="kicker">Total supply</p><p class="stat">${total != null ? fmtQty(total) : '—'}</p></div>
    </div>
    <p class="mono contract">Contract ${extLink(sources.qntEtherscan, QNT_CONTRACT)}</p>
    ${p?.error ? `<p class="note">${esc(p.error)}</p>` : ''}
    ${sparklineSvg(p?.sparkline ?? [])}
  </section>
  <section class="chapter">
    ${kicker('How much is out there')}
    <h2>Circulating against total, from CoinGecko</h2>
    <div class="scarcity"><i style="width:${pct}%"></i></div>
    <p class="mono subtle">${pct ? `${pct.toFixed(1)}% circulating` : 'Supply figures will appear when CoinGecko answers.'} · ATH ${p?.ath != null ? fmtMoney(p.ath) : '—'} · ATL ${p?.atl != null ? fmtMoney(p.atl) : '—'}</p>
  </section>
  <section class="chapter">
    ${kicker('Where the volume is')}
    <h2>Each cell is a CoinGecko venue, scaled to the busiest one.</h2>
    <ul class="bars">${bars}</ul>
  </section>
  <article class="chapter" id="tokenomics">
    ${kicker('Tokenomics')}
    <h2>QNT — the utility layer of Overledger</h2>
    <p>QNT is an ERC-20 on Ethereum. Contract ${esc(QNT_CONTRACT)}. Quant’s 14 September 2018 burn sent unsold tokens to the contract itself (${extLink(sources.qntBurnTx, 'tx 0x763f32a0…')}). Their own post: total supply 14,612,493.080826178 QNT; public 9,964,259.03181537; company 4,648,234.049010808. Bitstamp’s MiCA whitepaper (13 May 2026) records a TGE split of 68.19% market / 31.81% company, an initialised contract of 45,467,000, and a post-burn maximum they cite as 14,881,364. Those two supply figures do not match; both sit on the record, and today’s circulating and price come from CoinGecko. Licences can lock QNT for the term of the licence (MiCA filing). It is the utility token of Quant Network, distinct from equity in Quant Network Ltd.</p>
    <p class="source-row">${extLink(sources.qntEtherscan, 'Etherscan')} ${extLink(sources.qntBurnTweet, 'Burn tweet')} ${extLink(sources.micaBitstamp, 'Bitstamp MiCA')} ${extLink(sources.treasuryPdf.startsWith('http') ? sources.treasuryPdf : sources.overledger, 'Treasury note')}</p>
  </article>`;
}

export function renderNews(river?: NewsRiver, filter = ''): string {
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
  const items = grouped
    || `<p class="empty-note">${esc(river?.error ?? 'No fresh headlines yet — check back in a minute.')}</p>`;
  return `${pageHero(
    'Wire',
    'Quant, as the story',
    'Live GNews, newest first. Search titles. Headlines that name Quant Network, Overledger or QNT — never invented. Official posts and this month’s sourced notes sit even when the river is empty.',
    'unfolds.',
  )}
  ${filterBox('news-filter', 'Search headlines…', filter)}
  <section class="wire">
    <div class="tape-head"><span class="chip ${(river?.status ?? 'loading').toLowerCase()}">${esc(river?.status ?? 'loading')}</span><span class="mono subtle">${rows.length} matching headlines</span></div>
    <ul class="headlines">${items}</ul>
  </section>
  ${renderThisMonth()}
  ${renderCalendar()}
  ${renderVoices()}`;
}

function renderCalendar(): string {
  const items = CALENDAR.map(
    (e) => `<li class="cal-item">
      <p class="mono">${esc(e.when)} · ${esc(e.where)}</p>
      <h3>${esc(e.title)}</h3>
      <p>${esc(e.body)}</p>
      ${extLink(sourceUrl(e.href), e.hrefLabel)}
    </li>`,
  ).join('');
  return `<section class="calendar">
    ${kicker('Upcoming')}
    <h2 class="display">Miami is <span class="display-mute">next</span></h2>
    <p>Quant at Sibos, stand DISL51, with Murex on stage — posted from @quantnetwork. DIGIT gilt is the Treasury, speaking at the UK Finance launch on 8 September. The speech does not name Quant; it is the same week’s landscape.</p>
    <ul>${items}</ul>
  </section>`;
}

function renderThisMonth(): string {
  const items = THIS_MONTH.map(
    (n) => `<li class="month-item">
      <p class="mono">${esc(n.date)} · ${esc(n.source)} · ${esc(n.lane)}</p>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.body)}</p>
      ${extLink(sourceUrl(n.href), 'Open the source')}
    </li>`,
  ).join('');
  return `<section class="calendar month-rail">
    ${kicker('September 2026')}
    <h2 class="display">This month <span class="display-mute">on Quant</span></h2>
    <p>Quant’s Trusted Node essay. UK Finance naming GBTD as UK innovation. Sibos in Miami still ahead. Sourced notes — not invented headlines.</p>
    <ul>${items}</ul>
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
      <p class="subtle" data-home-meta>Print from Coinbase, Kraken or Binance. Never invented.</p>
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

export function renderGone(kind: 'desk' | 'ops'): string {
  const title = kind === 'desk' ? 'The Situation Room has left' : 'How this is built has left';
  return `${pageHero(
    'Retired',
    title,
    'God’s Eye View, the chokepoint desk and the architecture note are no longer part of this encyclopedia. The globe, the papers and the sourced quotations remain.',
    'this map.',
  )}<p class="masthead" style="padding-top:0">${pill('/', 'Return to Earth', 'Back to the map')} ${pill('/news', 'Open the tape', 'Latest first', 'ghost')}</p>`;
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
    'Optional. Buys no tokens, no yield, and no influence over Quant Network. This encyclopedia is not official Quant. Never send funds to an address that appeared in a DM or a lookalike site.',
    'independent.',
  )}
  <article class="chapter">
    <p>QNT token contract for verification only — this is not a donation address: ${extLink(sources.qntEtherscan, QNT_CONTRACT)}. Copy into a wallet you already control. We never ask for a seed.</p>
    <p>Published independent-desk recipients (not Quant Network):</p>
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
  return `${pageHero('404', 'This page is not', 'The encyclopedia still has Vision, Technology, Programmes, CBDC, People, Research and Standards.', 'on the globe.')}<p class="masthead" style="padding-top:0">${pill('/', 'Return to Earth', 'Back to the map')}</p>`;
}
