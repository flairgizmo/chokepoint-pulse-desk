/** Film-stage stills for inner pages. Markup only — no Three.js. */

import { CITIES } from '../data/cities';
import { plateFor, PLATES } from '../data/plates';
import { esc } from './html';

export type FilmSlide = {
  id: string;
  title: string;
  src: string;
  stageKind: string;
  stageId: string;
};

export const FILM_SETS: Record<string, FilmSlide[]> = {
  story: [
    { id: 'iso-2015', title: 'ISO 2015', src: PLATES.geneva.src, stageKind: 'event', stageId: 'iso-2015' },
    { id: 'whitepaper-2018', title: 'WHITEPAPER', src: PLATES.ucl.src, stageKind: 'event', stageId: 'whitepaper-2018' },
    { id: 'gbtd-2025', title: 'GBTD LIVE', src: PLATES.canary.src, stageKind: 'event', stageId: 'gbtd-2025' },
    { id: 'boe-lab-2026', title: 'SYNC LAB', src: PLATES.boeFacade.src, stageKind: 'event', stageId: 'boe-lab-2026' },
    { id: 'murex-2026', title: 'MUREX', src: PLATES.paris.src, stageKind: 'event', stageId: 'murex-2026' },
  ],
  programmes: [
    { id: 'gbtd', title: 'GBTD', src: PLATES.canary.src, stageKind: 'programme', stageId: 'gbtd' },
    { id: 'murex', title: 'MUREX', src: PLATES.paris.src, stageKind: 'programme', stageId: 'murex' },
    { id: 'sync-lab', title: 'SYNC LAB', src: PLATES.boeFacade.src, stageKind: 'programme', stageId: 'sync-lab' },
    { id: 'oracle', title: 'ORACLE', src: PLATES.washington.src, stageKind: 'programme', stageId: 'oracle' },
    { id: 'basel', title: 'ROSALIND', src: PLATES.bisTower.src, stageKind: 'programme', stageId: 'basel' },
  ],
  research: [
    { id: 'overledger-2018', title: '2018 PAPER', src: PLATES.ucl.src, stageKind: 'paper', stageId: 'overledger-2018' },
    { id: 'satp-core', title: 'SATP CORE', src: PLATES.geneva.src, stageKind: 'paper', stageId: 'satp-core' },
    { id: 'patent-us', title: 'US PATENT', src: PLATES.patentsHall.src, stageKind: 'paper', stageId: 'patent-us' },
    { id: 'gbtd-ukf', title: 'UK FINANCE', src: PLATES.canary.src, stageKind: 'paper', stageId: 'gbtd-ukf' },
    { id: 'three-layer', title: 'THREE LAYER', src: PLATES.payments.src, stageKind: 'paper', stageId: 'three-layer' },
  ],
  vision: [
    { id: 'vision', title: 'UCL 2018', src: PLATES.ucl.src, stageKind: 'chapter', stageId: 'thesis' },
    { id: 'philosophy', title: 'FIBER', src: PLATES.fiber.src, stageKind: 'chapter', stageId: 'philosophy' },
    { id: 'gbtd', title: 'STERLING', src: PLATES.canary.src, stageKind: 'programme', stageId: 'gbtd' },
    { id: 'satp', title: 'SATP', src: PLATES.geneva.src, stageKind: 'satp', stageId: '3' },
    { id: 'liability', title: 'LIABILITY', src: PLATES.payments.src, stageKind: 'money', stageId: 'tcbm' },
  ],
  stack: [
    { id: 'apps', title: 'FLOW APPS', src: PLATES.city.src, stageKind: 'tech', stageId: 'quant-connect' },
    { id: 'script', title: 'PAYSCRIPT', src: PLATES.payments.src, stageKind: 'tech', stageId: 'payscript' },
    { id: 'fiber', title: 'FIBER', src: PLATES.fiber.src, stageKind: 'chapter', stageId: 'philosophy' },
    { id: 'gate', title: 'OVERLEDGER', src: PLATES.datacenter.src, stageKind: 'tech', stageId: 'overledger' },
    { id: 'ledgers', title: 'RAILS', src: PLATES.cable.src, stageKind: 'tech', stageId: 'connectors' },
  ],
  technology: [
    { id: 'overledger', title: 'OVERLEDGER', src: PLATES.ucl.src, stageKind: 'tech', stageId: 'overledger' },
    { id: 'satp', title: 'SATP', src: PLATES.geneva.src, stageKind: 'tech', stageId: 'satp' },
    { id: 'fusion', title: 'FUSION', src: PLATES.cityDay.src, stageKind: 'tech', stageId: 'fusion' },
    { id: 'payscript', title: 'PAYSCRIPT', src: PLATES.payments.src, stageKind: 'tech', stageId: 'payscript' },
    { id: 'connectors', title: 'RAILS', src: PLATES.cable.src, stageKind: 'tech', stageId: 'connectors' },
  ],
  patents: [
    { id: 'patent-us', title: 'US ORDERING', src: PLATES.patentsHall.src, stageKind: 'patent', stageId: 'patent-us' },
    { id: 'patent-app', title: 'APPLICATION', src: PLATES.library.src, stageKind: 'patent', stageId: 'patent-app' },
    { id: 'patent-jp', title: 'JAPAN NOTE', src: PLATES.tokyo.src, stageKind: 'patent', stageId: 'patent-jp' },
    { id: 'ucl', title: 'UCL FILE', src: PLATES.ucl.src, stageKind: 'event', stageId: 'whitepaper-2018' },
    { id: 'fusion', title: 'FUSION', src: PLATES.cityDay.src, stageKind: 'tech', stageId: 'fusion' },
  ],
  institutions: [
    { id: 'ietf', title: 'IETF', src: PLATES.geneva.src, stageKind: 'institution', stageId: 'ietf' },
    { id: 'bis', title: 'BIS', src: PLATES.bisTower.src, stageKind: 'institution', stageId: 'bis' },
    { id: 'boe', title: 'BANK OF ENGLAND', src: PLATES.boeFacade.src, stageKind: 'institution', stageId: 'boe' },
    { id: 'ucl', title: 'UCL', src: PLATES.ucl.src, stageKind: 'institution', stageId: 'ucl' },
    { id: 'uk-finance', title: 'UK FINANCE', src: PLATES.canary.src, stageKind: 'institution', stageId: 'uk-finance' },
  ],
  people: [
    { id: 'verdian', title: 'VERDIAN', src: '/people/verdian.jpg', stageKind: 'person', stageId: 'verdian' },
    { id: 'tasca', title: 'TASCA', src: '/people/tasca.jpg', stageKind: 'person', stageId: 'tasca' },
    { id: 'facer', title: 'FACER', src: '/people/facer.png', stageKind: 'person', stageId: 'facer' },
    { id: 'hargreaves', title: 'HARGREAVES', src: '/people/hargreaves.jpg', stageKind: 'person', stageId: 'hargreaves' },
    { id: 'baugh', title: 'BAUGH', src: '/people/baugh.png', stageKind: 'person', stageId: 'baugh' },
  ],
  cbdc: [
    { id: 'wholesale', title: 'WHOLESALE', src: PLATES.sterling.src, stageKind: 'money', stageId: 'wholesale' },
    { id: 'retail', title: 'RETAIL', src: PLATES.london.src, stageKind: 'money', stageId: 'retail' },
    { id: 'tcbm', title: 'TOKENISED', src: PLATES.canary.src, stageKind: 'money', stageId: 'tcbm' },
    { id: 'rosalind', title: 'ROSALIND', src: PLATES.boeFacade.src, stageKind: 'programme', stageId: 'basel' },
    { id: 'sync-lab', title: 'SYNC LAB', src: PLATES.bisTower.src, stageKind: 'programme', stageId: 'sync-lab' },
  ],
  standards: [
    { id: 'satp-0', title: 'VERIFY', src: PLATES.geneva.src, stageKind: 'satp', stageId: '0' },
    { id: 'satp-1', title: 'INITIATE', src: PLATES.library.src, stageKind: 'satp', stageId: '1' },
    { id: 'satp-2', title: 'LOCK', src: PLATES.datacenter.src, stageKind: 'satp', stageId: '2' },
    { id: 'satp-3', title: '2PC', src: PLATES.fiber.src, stageKind: 'satp', stageId: '3' },
    { id: 'iso', title: 'ISO 23516', src: PLATES.ucl.src, stageKind: 'chapter', stageId: 'iso' },
  ],
  glossary: [
    { id: 'overledger', title: 'OVERLEDGER', src: PLATES.ucl.src, stageKind: 'term', stageId: 'overledger' },
    { id: 'gbtd', title: 'GBTD', src: PLATES.canary.src, stageKind: 'term', stageId: 'gbtd' },
    { id: 'satp', title: 'SATP', src: PLATES.geneva.src, stageKind: 'term', stageId: 'satp' },
    { id: 'quantnet', title: 'QUANTNET', src: PLATES.city.src, stageKind: 'term', stageId: 'quantnet' },
    { id: 'cbdc', title: 'CBDC', src: PLATES.zurich.src, stageKind: 'term', stageId: 'cbdc' },
  ],
  news: [
    { id: 'official', title: 'OFFICIAL', src: PLATES.canary.src, stageKind: 'event', stageId: 'ukf-2026' },
    { id: 'wire', title: 'WIRE', src: PLATES.newsroom.src, stageKind: 'event', stageId: 'sibos-2026' },
    { id: 'radio', title: 'VOICES', src: PLATES.radio.src, stageKind: 'event', stageId: 'three-layer-2026' },
    { id: 'exchange', title: 'MARKETS', src: PLATES.exchange.src, stageKind: 'event', stageId: 'burn-2018' },
    { id: 'ucl', title: 'RECORD', src: PLATES.ucl.src, stageKind: 'event', stageId: 'whitepaper-2018' },
  ],
  markets: [
    { id: 'qnt', title: 'QNT', src: PLATES.exchange.src, stageKind: 'event', stageId: 'burn-2018' },
    { id: 'nyse', title: 'NEW YORK', src: PLATES.newyork.src, stageKind: 'city', stageId: 'new-york' },
    { id: 'canary', title: 'CANARY', src: PLATES.canary.src, stageKind: 'event', stageId: 'gbtd-2025' },
    { id: 'city', title: 'CITY', src: PLATES.city.src, stageKind: 'city', stageId: 'london' },
    { id: 'fiber', title: 'LICENCE', src: PLATES.fiber.src, stageKind: 'tech', stageId: 'overledger' },
  ],
  donate: [
    { id: 'fiber', title: 'RESEARCH', src: PLATES.fiber.src, stageKind: 'chapter', stageId: 'thesis' },
    { id: 'library', title: 'LIBRARY', src: PLATES.library.src, stageKind: 'paper', stageId: 'overledger-2018' },
    { id: 'ucl', title: 'UCL', src: PLATES.ucl.src, stageKind: 'event', stageId: 'whitepaper-2018' },
    { id: 'radio', title: 'PODCAST', src: PLATES.radio.src, stageKind: 'event', stageId: 'whitepaper-2018' },
    { id: 'canary', title: 'DESK', src: PLATES.canary.src, stageKind: 'programme', stageId: 'gbtd' },
  ],
  podcast: [
    { id: 'radio', title: 'SERIES', src: PLATES.radio.src, stageKind: 'event', stageId: 'whitepaper-2018' },
    { id: 'ucl', title: 'EP 01', src: PLATES.ucl.src, stageKind: 'event', stageId: 'whitepaper-2018' },
    { id: 'canary', title: 'STERLING', src: PLATES.canary.src, stageKind: 'event', stageId: 'gbtd-2025' },
    { id: 'geneva', title: 'SATP', src: PLATES.geneva.src, stageKind: 'event', stageId: 'odap-2020' },
    { id: 'payments', title: 'MONEY', src: PLATES.payments.src, stageKind: 'event', stageId: 'three-layer-2026' },
  ],
  notes: [
    { id: 'history', title: 'HISTORY', src: PLATES.history.src, stageKind: 'chapter', stageId: 'thesis' },
    { id: 'present', title: 'PRESENT', src: PLATES.canary.src, stageKind: 'event', stageId: 'gbtd-2025' },
    { id: 'future', title: 'AHEAD', src: PLATES.future.src, stageKind: 'chapter', stageId: 'future' },
    { id: 'library', title: 'LIBRARY', src: PLATES.library.src, stageKind: 'paper', stageId: 'overledger-2018' },
    { id: 'wire', title: 'WIRE', src: PLATES.newsroom.src, stageKind: 'event', stageId: 'ukf-2026' },
  ],
};

function cityFilmSlides(id: string): FilmSlide[] {
  const lead = CITIES.find((c) => c.id === id) ?? CITIES[0];
  const rest = CITIES.filter((c) => c.id !== lead.id).slice(0, 4);
  return [lead, ...rest].map((c) => ({
    id: c.id,
    title: c.name.toUpperCase(),
    src: c.photo ?? `/visuals/cities/${c.id}.jpg`,
    stageKind: 'city',
    stageId: c.id,
  }));
}

export const FILM_BACKDROPS: Record<string, string> = {
  story: PLATES.history.src,
  programmes: PLATES.canary.src,
  research: PLATES.library.src,
  vision: PLATES.ucl.src,
  technology: PLATES.fiber.src,
  stack: PLATES.canary.src,
  patents: PLATES.patentsHall.src,
  institutions: PLATES.royal.src,
  people: PLATES.canary.src,
  cbdc: PLATES.sterling.src,
  standards: PLATES.geneva.src,
  glossary: PLATES.library.src,
  news: PLATES.newsroom.src,
  markets: PLATES.exchange.src,
  donate: PLATES.fiber.src,
  podcast: PLATES.radio.src,
  notes: PLATES.history.src,
};

export function filmSetSlides(set: string): FilmSlide[] {
  if (set.startsWith('city:')) return cityFilmSlides(set.slice(5));
  return FILM_SETS[set] ?? [];
}

export function filmBackdrop(set: string): string {
  if (set.startsWith('city:')) {
    const id = set.slice(5);
    const city = CITIES.find((c) => c.id === id);
    return city?.photo ?? `/visuals/cities/${id}.jpg`;
  }
  return FILM_BACKDROPS[set] ?? FILM_SETS[set]?.[0]?.src ?? PLATES.canary.src;
}

export function filmStageMarkup(set: string, label: string): string {
  if (!set.startsWith('city:') && !FILM_SETS[set]) return '';
  return `<section class="film-stage-wrap cinema-stage" aria-label="${esc(label)}">
    <span class="cinema-letterbox cinema-letterbox-top" aria-hidden="true"></span>
    <span class="cinema-grain" aria-hidden="true"></span>
    <canvas id="film-stage" class="film-stage" data-film-set="${esc(set)}" role="img" aria-label="${esc(label)}"></canvas>
    <span class="cinema-letterbox cinema-letterbox-bottom" aria-hidden="true"></span>
  </section>`;
}

/** First Vision stills from a film set, as a readable strip under the rail. */
export function stillStrip(set: string, label = 'Photographs on this rail', count = 4): string {
  const slides = (FILM_SETS[set] ?? []).slice(0, count);
  if (!slides.length) return '';
  return `<section class="still-strip" aria-label="${esc(label)}">
    ${slides
      .map((s) => {
        const plate = Object.values(PLATES).find((p) => p.src === s.src) ?? plateFor(s.id, s.title, set);
        return `<figure class="photo-plate cinema-frame strip-still">
          <img src="${esc(s.src)}" alt="${esc(plate.alt)}" width="1280" height="720" loading="lazy" decoding="async" />
          <figcaption>${esc(plate.credit)}</figcaption>
        </figure>`;
      })
      .join('')}
  </section>`;
}
