import { quotesFor } from '../data/catalog';
import { INSTITUTIONS } from '../data/institutions';
import { bankDisplay, markFor } from '../data/marks';
import { OVERLEDGER_BUILDERS, PEOPLE } from '../data/people';
import { PATENTS } from '../data/patents';
import { STORY, storyChronological, type StoryTheme } from '../data/story';
import { TECH } from '../data/tech';
import { GBTD_BANKS } from '../data/timeline';
import { photoFigure, plateFor, type VisualId } from '../data/plates';
import { diagramFigure } from './diagrams';
import { esc } from './html';
import { chipsFromIds } from './relate';
import { relatedButtons } from './stage';

function kicker(text: string): string {
  return `<p class="kicker"><i class="section-dot" aria-hidden="true"></i>${esc(text)}</p>`;
}

function pill(href: string, label: string, hover: string, kind: 'primary' | 'ghost' = 'primary'): string {
  return `<a class="btn btn-${kind}" href="${esc(href)}"><span class="btn-swap"><span>${esc(label)}</span><span>${esc(hover)}</span></span><span class="btn-arrow" aria-hidden="true">↗</span></a>`;
}

export function heroPlate(k: string, title: string, mute = '', bed?: VisualId): string {
  const plate = plateFor(k, bed, title, mute);
  return `<figure class="hero-plate">
    <img class="hero-still" src="${esc(plate.src)}" alt="${esc(plate.alt)}" width="1920" height="820" decoding="async" />
    <span class="hero-wash" aria-hidden="true"></span>
    <figcaption>${esc(plate.credit)}</figcaption>
  </figure>`;
}

function hero(k: string, title: string, lede: string, seed: string): string {
  return `<header class="page-hero enterprise-hero cinema-hero">
    ${heroPlate(k, title, seed)}
    ${kicker(k)}
    <div class="hero-split">
      <h1 class="display">${title}</h1>
      <p class="lede">${esc(lede)}</p>
    </div>
  </header>`;
}

export function renderHome(): string {
  const banks = GBTD_BANKS.map((b) => {
    const mark = markFor(b);
    const caption = bankDisplay(b);
    return `<li class="wordmark">${mark ? `<img class="wm-logo" src="${esc(mark)}" alt="" width="160" height="48" />` : ''}<span class="wordmark-caption">${esc(caption)}</span></li>`;
  }).join('');
  return `
    <section class="masthead masthead-lockup" data-proof="hero">
      <div class="hero-stage">
        <canvas id="gateway" class="gateway-stage" role="img" aria-label="Sterling corridor: six UK commercial banks around an Overledger plane."></canvas>
        <p class="tess-hint" data-gateway-hint>Six commercial banks. One gateway plane.</p>
      </div>
      ${kicker('QntDesk · independent brief')}
      <div class="hero-split">
        <h1 class="display">Overledger is how ledgers speak without becoming one chain.</h1>
        <div>
          <p class="lede">A bank architect’s brief on Quant Network: the gateway OS, the standards rooms, the sterling that is already live, and the people who signed the papers. Independent research. Not Quant’s corporate site.</p>
          <div class="cta-row">
            ${pill('/technology', 'Enter the stack', 'Product theatre')}
            ${pill('/story', 'Walk the timeline', 'Scored history', 'ghost')}
          </div>
        </div>
      </div>
    </section>

    <section class="proof-row">
      ${kicker('Three proofs')}
      <div class="proof-grid">
        <button type="button" class="proof-chip" data-stage="proof" data-stage-id="interop">
          ${diagramFigure('home-interop', 'proof', 'Interop')}
          <strong>Interoperability</strong>
          <span>Overledger maps one request onto more than one ledger. 2018 whitepaper, UCL Discovery.</span>
        </button>
        <button type="button" class="proof-chip" data-stage="proof" data-stage-id="standards">
          ${diagramFigure('home-standards', 'proof', 'Standards')}
          <strong>Standards</strong>
          <span>IETF SATP and ISO/TC 307. Rooms with names.</span>
        </button>
        <button type="button" class="proof-chip" data-stage="proof" data-stage-id="institutions">
          ${diagramFigure('home-institutions', 'proof', 'Rooms')}
          <strong>Institutions</strong>
          <span>Who they still sit with — current, historical, adjacency.</span>
        </button>
      </div>
    </section>

    <section class="pulse-strip">
      ${kicker('Pulse')}
      <div class="section-head">
        <h2 class="display">The wire, as headlines.</h2>
        <a class="text-link" href="/news">News desk →</a>
      </div>
      <ul class="pulse-list" data-home-pulse><li class="empty-note">Headlines load when the ingest answers.</li></ul>
    </section>

    <section class="strip">
      ${kicker('GBTD cohort — the six commercial banks named by UK Finance')}
      <ul class="wordmarks">${banks}</ul>
    </section>

  `;
}

export function renderStory(): string {
  const themes: StoryTheme[] = ['product', 'standard', 'institution', 'people', 'market', 'cbdc'];
  const chips = ['all', ...themes]
    .map((t) => `<button type="button" class="chip${t === 'all' ? ' is-on' : ''}" data-story-theme="${t}">${esc(t)}</button>`)
    .join('');
  const nodes = storyChronological()
    .map(
      (e) => `<li class="story-node" data-year="${e.year}" data-decade="${Math.floor(e.year / 10) * 10}" data-theme="${esc(e.theme)}" data-q="${esc(`${e.title} ${e.body} ${e.date}`)}">
        <button type="button" class="story-hit" data-stage="event" data-stage-id="${esc(e.id)}">
          ${diagramFigure(e.id, 'event', e.date)}
          <span class="mono">${esc(e.date)}</span>
          <h3>${esc(e.title)}</h3>
          <p>${esc(e.stake)}</p>
        </button>
      </li>`,
    )
    .join('');
  return `${hero('Story / Timeline', 'History as a scored film.', 'Search and filter. Quiet months collapse — there are no empty holes. Each node opens a stage with the stake, the filing, and the source.', 'story-hero')}
    <div class="toolbar filter-bar">
      <input type="search" id="story-search" placeholder="Search the rail…" />
      <div class="chip-row" id="story-themes">${chips}</div>
      <label class="density">Density
        <select id="story-density">
          <option value="decade">Decade</option>
          <option value="year" selected>Year</option>
          <option value="month">Month</option>
        </select>
      </label>
    </div>
    <p class="notes-count mono subtle" data-story-count>${STORY.length} events on the rail</p>
    <p class="story-suggest" data-story-suggest hidden></p>
    <ol class="story-rail" id="story-rail">${nodes}</ol>
    <p class="empty-note" id="story-empty" hidden>No event on this rail matches. Try 2018, SATP, or GBTD.</p>
    <p class="subtle story-keys">j and k move the visible rail. Each node opens a stage — object, filing, source.</p>`;
}

export function renderStack(): string {
  const layers = [
    { id: 'apps', title: 'Flow Applications', job: 'MCP-callable workflows. Agents and humans run the same steps.', analogy: 'This layer is the instruction pad — the same ticket a clerk or an agent can stamp.', std: 'MCP is open. Not a Quant product.' },
    { id: 'script', title: 'PayScript', job: 'Programmability at the account. Named in the GBTD stack.', analogy: 'This layer is the standing order that can see another book.', std: 'GBTD commercial-bank money. Not a CBDC script.' },
    { id: 'fusion', title: 'Fusion', job: 'Layer 2.5 multi-ledger rollup. Trusted Node is who processes it.', analogy: 'This layer is the clearing house that posts to more than one book.', std: 'Japanese 2026 claim is Quant’s note. Not a USPTO grant.' },
    { id: 'gate', title: 'Overledger · QuantNet', job: 'Gateway OS. The bank-facing name for the same architecture.', analogy: 'This layer is the correspondent: it speaks every domain and replaces none.', std: 'ACM gateway cell. SATP-implementable. Not SATP.' },
    { id: 'ledgers', title: 'Ledgers & rails', job: 'Fabric, Ethereum, Corda, RTGS, SWIFT, Faster Payments.', analogy: 'This layer is the SWIFT message and the RTGS book — the things the gate maps onto.', std: 'ISO 20022 adjacency via QuantNet’s published claim.' },
  ];
  return `${hero('Stack', 'How the layers compose.', 'Isolate a rung. Dim the rest. Each layer opens a stage with the job and the standards mapping.', 'stack-hero')}
    <section class="stack-exploded" id="stack-exploded">
      ${kicker('Exploded instrument')}
      <div class="stack-tools">
        <button type="button" class="chip is-on" data-stack-all>All layers</button>
        ${layers.map((l) => `<button type="button" class="chip" data-stack-iso="${esc(l.id)}">${esc(l.title)}</button>`).join('')}
      </div>
      <ol class="stack-rungs exploded">${layers
        .map(
          (l) => `<li data-rung="${esc(l.id)}">
            <button type="button" data-stage="tech" data-stage-id="${l.id === 'gate' ? 'overledger' : l.id === 'script' ? 'payscript' : l.id === 'apps' ? 'quant-connect' : l.id === 'ledgers' ? 'connectors' : 'fusion'}">
              ${diagramFigure(`stack-${l.id}`, 'stack', l.title)}
              <strong>${esc(l.title)}</strong>
              <span>${esc(l.job)}</span>
              <small>${esc(l.std)}</small>
            </button>
          </li>`,
        )
        .join('')}</ol>
    </section>`;
}

export function renderTechnology(): string {
  const spine = TECH.map(
    (t) => `<button type="button" class="tech-spine-hit" data-stage="tech" data-stage-id="${esc(t.id)}">${esc(t.name)}</button>`,
  ).join('');
  const chapters = TECH.map(
    (t) => `<article class="tech-chapter" id="${esc(t.id)}" data-q="${esc(`${t.name} ${t.purpose} ${t.does}`)}">
      ${diagramFigure(t.id, 'tech', t.era)}
      <p class="kicker">${esc(t.era)}</p>
      <h2>${esc(t.name)}</h2>
      <p class="lede-sm">${esc(t.purpose)}</p>
      <details class="card-more">
        <summary>Chapter</summary>
        <div class="tech-grid">
          <div><h3>What it does</h3><p>${esc(t.does)}</p></div>
          <div><h3>Why it exists</h3><p>${esc(t.why)}</p></div>
          <div><h3>Standards</h3><p>${esc(t.standards)}</p></div>
          <div><h3>What it is not</h3><p>${esc(t.isNot)}</p></div>
        </div>
        <p class="stage-related">${relatedButtons(chipsFromIds(t.related))}</p>
      </details>
    </article>`,
  ).join('');
  return `${hero('Technology', 'Every layer Quant built or productised.', 'Isolated ledgers were the problem. Overledger is the operating layer. The network, the standards capture, and what that unlocks for tokenised deposits in 2026–27 sit in the chapters below.', 'tech-hero')}
    <p class="lede">Problem of isolated ledgers → Overledger as the operating layer → network effects → standards capture → CBDCs and tokenised deposits as adjacency, not slogans.</p>
    <div class="toolbar filter-bar">
      <input type="search" id="tech-search" placeholder="Search chapters…" />
    </div>
    <nav class="tech-spine" aria-label="Technology chapters">${spine}</nav>
    <div class="tech-stack" id="tech-stack">${chapters}</div>
    <p class="empty-note" id="tech-empty" hidden>No chapter matches. Try SATP, Fusion, or PayScript.</p>`;
}

export function renderPatents(): string {
  const cards = PATENTS.map(
    (p) => `<article class="patent-card" id="${esc(p.id)}">
      <button type="button" data-stage="patent" data-stage-id="${esc(p.id)}">
        ${photoFigure(plateFor('patents', p.id), 'patent-still')}
        ${diagramFigure(p.id, 'patent', p.number)}
        <p class="kicker">${esc(p.number)}</p>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.claim)}</p>
        <p class="mono subtle">${esc(p.granted || p.filed || '')}${p.inventors.length ? ` · ${esc(p.inventors.join(', '))}` : ''}</p>
      </button>
    </article>`,
  ).join('');
  return `${hero('Patents', 'The estate, in plain language.', 'Numbers match the public file. A patent is a claim, not a live rail. Each card opens why it matters to Overledger, SATP, or Fusion.', 'patents-hero')}
    <div class="toolbar filter-bar">
      <input type="search" id="patent-search" placeholder="Search numbers, inventors, claims…" />
    </div>
    <div class="patent-grid" id="patent-grid">${cards}</div>
    <p class="empty-note" id="patent-empty" hidden>No filing matches. Try US11842335B2 or Hargreaves.</p>`;
}

export function renderInstitutions(): string {
  const cards = INSTITUTIONS.map((i) => {
    const caption = bankDisplay(i.name);
    const mark = i.mark ? markFor(i.mark) : undefined;
    const logo = mark
      ? `<img class="wm-logo" src="${esc(mark)}" alt="${esc(caption)}" width="128" height="52" />`
      : `<span class="wordmark-label">${esc(caption)} <em>wordmark</em></span>`;
    return `<article class="inst-card" id="${esc(i.id)}" data-status="${esc(i.status)}" data-q="${esc(`${i.name} ${i.body}`)}">
      <button type="button" data-stage="institution" data-stage-id="${esc(i.id)}">
        ${diagramFigure(i.id, 'institution', i.status)}
        <div class="inst-mark">${logo}</div>
        <p class="kicker">${esc(i.role)} · ${esc(i.status)}</p>
        <h2>${esc(caption)}</h2>
        <p class="mono subtle">${esc(i.dates ?? '')}</p>
        <p>${esc(i.body.length > 160 ? `${i.body.slice(0, 160).trim()}…` : i.body)}</p>
      </button>
    </article>`;
  }).join('');
  return `${hero('Institutions & boards', 'Who they still sit with.', 'Current, historical, and adjacency — labelled. Official marks where they are on file. A typeset caption where they are not.', 'inst-hero')}
    <div class="toolbar filter-bar">
      <input type="search" id="inst-search" placeholder="Search institutions…" />
      <div class="chip-row" id="inst-status">
        <button type="button" class="chip is-on" data-inst-status="all">All</button>
        <button type="button" class="chip" data-inst-status="current">Current</button>
        <button type="button" class="chip" data-inst-status="historical">Historical</button>
        <button type="button" class="chip" data-inst-status="adjacency">Adjacency</button>
      </div>
    </div>
    <div class="inst-grid" id="inst-grid">${cards}</div>
    <p class="empty-note" id="inst-empty" hidden>No room matches. Try IETF, Lloyds, or Rosalind.</p>`;
}

export function overledgerRoster(): string {
  const rows = OVERLEDGER_BUILDERS.map((b) => {
    const p = PEOPLE.find((x) => x.id === b.id);
    if (!p) return '';
    return `<li>
      <button type="button" data-stage="person" data-stage-id="${esc(p.id)}">
        <strong>${esc(p.name)}</strong>
        <span>${esc(b.role)}</span>
        <em>${esc(b.era)}</em>
      </button>
    </li>`;
  }).join('');
  return `<section class="ol-roster">
    ${kicker('Overledger architects & operators')}
    <h2 class="display">Builders of the interoperability layer.</h2>
    <p class="lede-sm">People whose work shaped Overledger — role and era, not a leftover caption.</p>
    <ul class="ol-list">${rows}</ul>
  </section>`;
}

export function quoteButton(id: string): string {
  const q = quotesFor().find((x) => x.id === id);
  if (!q) return '';
  return `<button type="button" class="quote-card" data-stage="quote" data-stage-id="${esc(q.id)}">
    <span class="qmark" aria-hidden="true">“</span>
    <p>${esc(q.text)}</p>
    <footer><strong>${esc(q.who)}</strong><span>${esc(q.role)}</span></footer>
  </button>`;
}
