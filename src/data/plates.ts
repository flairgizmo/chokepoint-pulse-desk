/**
 * Real photographs for Vision, pages, essays, and proofs.
 * Wikimedia / official stills — never generated faces, never decorative stock that
 * contradicts the sentence.
 */

export type Plate = { src: string; credit: string; alt: string }

const STILL = (file: string, credit: string, alt: string): Plate => ({
  src: `/visuals/stills/${file}`,
  credit,
  alt,
})

const TOPIC = (file: string, credit: string, alt: string): Plate => ({
  src: `/visuals/topics/${file}`,
  credit,
  alt,
})

const CITY = (file: string, credit: string, alt: string): Plate => ({
  src: `/visuals/cities/${file}`,
  credit,
  alt,
})

export const PLATES = {
  hero: STILL('hero.jpg', 'Canary Wharf, Wikimedia Commons', 'Canary Wharf towers over the dock'),
  ucl: TOPIC('ucl.jpg', 'Wilkins Building, UCL — Wikimedia Commons', 'The Wilkins Building portico at University College London'),
  fiber: TOPIC('fiber.jpg', 'Optical fiber bundle — Wikimedia Commons', 'A bundle of optical fiber catching light'),
  cable: TOPIC('cable.jpg', 'Port Darwin cable landing, 1871 — State Library of South Australia / Wikimedia', 'The 1871 Port Darwin landing of the Australia–Java telegraph cable'),
  canary: TOPIC('canary.jpg', 'Canary Wharf from Limehouse — Wikimedia Commons', 'Canary Wharf towers seen from Limehouse'),
  city: TOPIC('city.jpg', 'City of London from City Hall — Wikimedia Commons', 'The City of London skyline from City Hall'),
  library: TOPIC('library.jpg', 'British Museum Reading Room — Wikimedia Commons', 'The British Museum Reading Room'),
  exchange: TOPIC('exchange.jpg', 'New York Stock Exchange — Wikimedia Commons', 'The New York Stock Exchange facade on Wall Street'),
  datacenter: TOPIC('datacenter.jpg', 'CERN data centre — Wikimedia Commons', 'Server racks on the floor of the CERN data centre'),
  payments: TOPIC('payments.jpg', 'Bank of England, Threadneedle Street — Wikimedia Commons', 'The Bank of England on Threadneedle Street'),
  sterling: STILL('sterling.jpg', 'Bank of England, Threadneedle Street', 'The Bank of England on Threadneedle Street'),
  gateway: STILL('gateway.jpg', 'Canary Wharf towers', 'Canary Wharf office towers'),
  history: STILL('history.jpg', 'British Museum Great Court', 'The British Museum Great Court roof'),
  future: STILL('future.jpg', 'Canary Wharf at dusk', 'Canary Wharf at dusk'),
  london: CITY('london.jpg', 'Bank of England, Threadneedle Street', 'The Bank of England on Threadneedle Street'),
  geneva: CITY('geneva.jpg', 'Palace of Nations, Geneva — Wikimedia Commons', 'The Palace of Nations in Geneva'),
  basel: CITY('basel.jpg', 'Basel skyline — Wikimedia Commons', 'Basel on the Rhine'),
  boston: CITY('boston.jpg', 'Boston skyline — Wikimedia Commons', 'Boston skyline'),
  cambridge: CITY('cambridge.jpg', 'Cambridge, Massachusetts — Wikimedia Commons', 'Cambridge, Massachusetts'),
  brussels: CITY('brussels.jpg', 'Brussels — Wikimedia Commons', 'Brussels'),
  washington: CITY('washington.jpg', 'Washington, D.C. — Wikimedia Commons', 'Washington, D.C.'),
} as const

const KEY_TO_PLATE: Record<string, Plate> = {
  thesis: PLATES.ucl,
  vision: PLATES.ucl,
  'the-thesis': PLATES.ucl,
  philosophy: PLATES.fiber,
  'internet-of-value': PLATES.fiber,
  future: PLATES.future,
  'the-future of money': PLATES.payments,
  era: PLATES.geneva,
  'the-era': PLATES.geneva,
  'the interop era': PLATES.geneva,
  taxonomy: PLATES.boston,
  'the-taxonomy': PLATES.boston,
  layers: PLATES.canary,
  architecture: PLATES.canary,
  'the-layers': PLATES.canary,
  discipline: PLATES.basel,
  'the-discipline': PLATES.basel,
  'not-l1': PLATES.datacenter,
  connectors: PLATES.cable,
  hyperledger: PLATES.datacenter,
  fusion: PLATES.datacenter,
  'payscript-flow': PLATES.payments,
  satp: PLATES.geneva,
  'satp-ietf': PLATES.geneva,
  'satp-method': PLATES.geneva,
  x402: PLATES.datacenter,
  'agents-x402': PLATES.datacenter,
  oracle: PLATES.datacenter,
  'oracle-hyperledger': PLATES.datacenter,
  liability: PLATES.payments,
  'liability test': PLATES.payments,
  gbtd: PLATES.canary,
  atomic: PLATES.geneva,
  treasury: PLATES.payments,
  rosalind: PLATES.london,
  boe: PLATES.london,
  'bank-of-england': PLATES.london,
  ecb: PLATES.brussels,
  'mit-ethics': PLATES.cambridge,
  mit: PLATES.cambridge,
  iso: PLATES.geneva,
  patents: PLATES.datacenter,
  patent: PLATES.datacenter,
  'linux-hyperledger': PLATES.datacenter,
  acm: PLATES.library,
  inatba: PLATES.brussels,
  tokenomics: PLATES.exchange,
  lacchain: PLATES.washington,
  dentsu: PLATES.city,
  sibos: PLATES.city,
  'sibos-2026': PLATES.city,
  ey: PLATES.city,
  quantnet: PLATES.datacenter,
  panels: PLATES.city,
  'trusted-node': PLATES.datacenter,
  'uk-digital-markets': PLATES.canary,
  'the-institutions': PLATES.city,
  'the-technology': PLATES.datacenter,
  technology: PLATES.datacenter,
  tech: PLATES.datacenter,
  stack: PLATES.datacenter,
  money: PLATES.payments,
  cbdc: PLATES.sterling,
  sterling: PLATES.sterling,
  wholesale: PLATES.sterling,
  retail: PLATES.london,
  tcbm: PLATES.canary,
  programme: PLATES.canary,
  programmes: PLATES.canary,
  'programme cockpit': PLATES.canary,
  research: PLATES.library,
  library: PLATES.library,
  papers: PLATES.library,
  paper: PLATES.library,
  primary: PLATES.ucl,
  standards: PLATES.geneva,
  book: PLATES.library,
  survey: PLATES.library,
  note: PLATES.library,
  people: PLATES.ucl,
  person: PLATES.ucl,
  cities: PLATES.city,
  city: PLATES.city,
  headquarters: PLATES.canary,
  banking: PLATES.city,
  lab: PLATES.london,
  markets: PLATES.exchange,
  market: PLATES.exchange,
  qnt: PLATES.exchange,
  news: PLATES.library,
  wire: PLATES.library,
  history: PLATES.history,
  quote: PLATES.history,
  quotes: PLATES.history,
  glossary: PLATES.library,
  language: PLATES.library,
  donate: PLATES.fiber,
  support: PLATES.fiber,
  about: PLATES.ucl,
  overledger: PLATES.datacenter,
  'overledger-network': PLATES.datacenter,
  'overledger-platform': PLATES.datacenter,
  'quant-connect': PLATES.fiber,
  'token-rails': PLATES.payments,
  identity: PLATES.library,
  payscript: PLATES.payments,
  rln: PLATES.payments,
  murex: PLATES.city,
  'sync-lab': PLATES.london,
  ietf: PLATES.datacenter,
  swift: PLATES.brussels,
  bis: PLATES.basel,
  'canary-wharf': PLATES.canary,
  'city-of-london': PLATES.city,
  ucl: PLATES.ucl,
  interop: PLATES.ucl,
  interoperability: PLATES.ucl,
  institutions: PLATES.city,
  rooms: PLATES.city,
  podcast: PLATES.library,
  story: PLATES.history,
  'story / timeline': PLATES.history,
  'proof-whitepaper': PLATES.ucl,
  'proof-banks': PLATES.canary,
  'proof-rosalind': PLATES.london,
  'proof-patents': PLATES.datacenter,
  'proof-iso': PLATES.geneva,
  'proof-interop': PLATES.ucl,
  'proof-standards': PLATES.geneva,
  'proof-institutions': PLATES.city,
  gateway: PLATES.gateway,
  london: PLATES.london,
  hero: PLATES.hero,
  moved: PLATES.city,
  '404': PLATES.city,
}

const PREFIXES = [
  'essay-',
  'cbdc-',
  'home-',
  'lane-',
  'film-',
  'proof-',
  'money-',
  'stack-',
  'era-',
  'featured-',
]

function lookup(raw: string): Plate | undefined {
  const key = raw.toLowerCase().trim()
  if (KEY_TO_PLATE[key]) return KEY_TO_PLATE[key]
  for (const prefix of PREFIXES) {
    if (key.startsWith(prefix)) {
      const rest = key.slice(prefix.length)
      if (KEY_TO_PLATE[rest]) return KEY_TO_PLATE[rest]
    }
  }
  return undefined
}

export function plateFor(...keys: Array<string | undefined | null>): Plate {
  for (const key of keys) {
    if (!key) continue
    const hit = lookup(key)
    if (hit) return hit
    const tokens = key
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2)
    for (const token of tokens) {
      const tok = lookup(token)
      if (tok) return tok
    }
  }
  return PLATES.hero
}

export function photoFigure(plate: Plate, extraClass = ''): string {
  return `<figure class="photo-plate ${extraClass}">
    <img src="${plate.src}" alt="${plate.alt}" width="1280" height="720" loading="lazy" decoding="async" />
    <figcaption>${plate.credit}</figcaption>
  </figure>`
}

export function photoImg(plate: Plate, className = 'stage-photo'): string {
  return `<img class="${className}" src="${plate.src}" alt="${plate.alt}" width="1280" height="720" loading="lazy" decoding="async" />`
}
