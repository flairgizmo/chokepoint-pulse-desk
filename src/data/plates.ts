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

const STORY = (file: string, credit: string, alt: string): Plate => ({
  src: `/visuals/stories/${file}`,
  credit,
  alt,
})

export const PLATES = {
  hero: STILL('hero.jpg', 'Canary Wharf from Limehouse — Wikimedia Commons', 'Canary Wharf towers at night across the dock'),
  ucl: TOPIC('ucl.jpg', 'Wilkins Building, UCL — Wikimedia Commons', 'The Wilkins Building portico at University College London'),
  fiber: TOPIC('fiber.jpg', 'Illuminated optical fiber, Hustvedt — Wikimedia Commons', 'A clear optical-fiber cable carrying a laser from one connector to the other'),
  cable: TOPIC('cable.jpg', 'Port Darwin cable landing, 1871 — State Library of South Australia / Wikimedia', 'The 1871 Port Darwin landing of the Australia–Java telegraph cable'),
  canary: TOPIC('canary.jpg', 'Canary Wharf from Limehouse — Wikimedia Commons', 'Canary Wharf towers seen from Limehouse'),
  city: TOPIC('city.jpg', 'City of London from City Hall — Wikimedia Commons', 'The City of London skyline from City Hall'),
  library: TOPIC('library.jpg', 'British Museum Reading Room — Wikimedia Commons', 'The British Museum Reading Room'),
  exchange: TOPIC('exchange.jpg', 'New York Stock Exchange — Wikimedia Commons', 'The New York Stock Exchange facade on Wall Street'),
  datacenter: TOPIC('datacenter.jpg', 'CERN data centre — Wikimedia Commons', 'Server racks on the floor of the CERN data centre'),
  payments: TOPIC('payments.jpg', 'Bank of England, Threadneedle Street — Wikimedia Commons', 'The Bank of England on Threadneedle Street'),
  sterling: STILL('sterling.jpg', 'Bank of England, Threadneedle Street — Wikimedia Commons', 'The Bank of England on Threadneedle Street'),
  gateway: STILL('gateway.jpg', 'CERN data centre — Wikimedia Commons', 'Server racks on the floor of the CERN data centre'),
  history: STILL('history.jpg', 'British Museum Reading Room — Wikimedia Commons', 'The British Museum Reading Room'),
  future: STILL('future.jpg', 'City of London at dusk — Wikimedia Commons', 'Glass towers on the Thames at dusk'),
  london: CITY('london.jpg', 'Bank of England, Threadneedle Street', 'The Bank of England on Threadneedle Street'),
  geneva: CITY('geneva.jpg', 'Palace of Nations, Geneva — Wikimedia Commons', 'The Palace of Nations in Geneva'),
  basel: CITY('basel.jpg', 'Bank for International Settlements, Basel — Wikimedia Commons', 'The BIS tower in Basel'),
  boston: CITY('boston.jpg', 'MIT Killian Court — Wikimedia Commons', 'Killian Court at MIT'),
  cambridge: CITY('cambridge.jpg', 'MIT Building 10 — Wikimedia Commons', 'The Maclaurin Buildings and Great Dome at MIT'),
  brussels: CITY('brussels.jpg', 'Berlaymont, Brussels — Wikimedia Commons', 'The Berlaymont building in Brussels'),
  washington: CITY('washington.jpg', 'Eccles Building, Federal Reserve Board — Wikimedia Commons', 'The Eccles Building of the Federal Reserve Board'),
  paris: CITY('paris.jpg', 'La Défense, Paris — Wikimedia Commons', 'The La Défense skyline in Paris'),
  newyork: CITY('new-york.jpg', 'Federal Reserve Bank of New York — Wikimedia Commons', 'The Federal Reserve Bank of New York'),
  miami: CITY('miami.jpg', 'Miami Beach Convention Center — Wikimedia Commons', 'The Miami Beach Convention Center'),
  frankfurt: CITY('frankfurt.jpg', 'European Central Bank, Frankfurt — Wikimedia Commons', 'The ECB tower on the Main at dawn'),
  zurich: CITY('zurich.jpg', 'Swiss National Bank, Zurich — Wikimedia Commons', 'The Swiss National Bank in Zurich'),
  lisbon: CITY('lisbon.jpg', 'Instituto Superior Técnico, Lisbon — Wikimedia Commons', 'Instituto Superior Técnico at sunset'),
  singapore: CITY('singapore.jpg', 'Monetary Authority of Singapore — Wikimedia Commons', 'The Monetary Authority of Singapore'),
  tokyo: CITY('tokyo.jpg', 'Bank of Japan — Wikimedia Commons', 'The Bank of Japan headquarters'),
  hongkong: CITY('hong-kong.jpg', 'Central, Hong Kong — Wikimedia Commons', 'Hong Kong Island from Tsim Sha Tsui at night'),
  sydney: CITY('sydney.jpg', 'Reserve Bank of Australia, Sydney — Wikimedia Commons', 'The Reserve Bank of Australia building'),
  royal: STORY('exchange.jpg', 'Royal Exchange, London — Wikimedia Commons', 'The portico of the Royal Exchange in the City of London'),
  bisTower: STORY('bis.jpg', 'Bank for International Settlements, Basel — Wikimedia Commons', 'The BIS tower in Basel'),
  boeFacade: STORY('boe.jpg', 'Bank of England, Threadneedle Street — Wikimedia Commons', 'The Bank of England facade on Threadneedle Street'),
  canaryDay: STORY('canary.jpg', 'Canary Wharf from the Thames — Wikimedia Commons', 'Canary Wharf towers seen from the river'),
  cityDay: STORY('city.jpg', 'City of London — Wikimedia Commons', 'The City of London skyline'),
  radio: TOPIC('radio.jpg', 'BBC Broadcasting House — Wikimedia Commons', 'BBC Broadcasting House on Portland Place'),
  newsroom: TOPIC('newsroom.jpg', 'Reuters building, Canary Wharf — Wikimedia Commons', 'The Reuters building at Canary Wharf'),
  patentsHall: TOPIC('patents-hall.jpg', 'Science Museum, London — Wikimedia Commons', 'The Science Museum on Exhibition Road'),
} as const

const KEY_TO_PLATE: Record<string, Plate> = {
  thesis: PLATES.ucl,
  vision: PLATES.ucl,
  'vision-2018': PLATES.ucl,
  'vision-gate': PLATES.fiber,
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
  rosalind: PLATES.boeFacade,
  boe: PLATES.boeFacade,
  'bank-of-england': PLATES.boeFacade,
  ecb: PLATES.brussels,
  'mit-ethics': PLATES.cambridge,
  mit: PLATES.cambridge,
  iso: PLATES.geneva,
  patents: PLATES.patentsHall,
  patent: PLATES.patentsHall,
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
  'the-institutions': PLATES.royal,
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
  lab: PLATES.bisTower,
  markets: PLATES.exchange,
  market: PLATES.exchange,
  qnt: PLATES.exchange,
  news: PLATES.newsroom,
  wire: PLATES.newsroom,
  history: PLATES.history,
  quote: PLATES.history,
  quotes: PLATES.history,
  glossary: PLATES.library,
  language: PLATES.library,
  donate: PLATES.fiber,
  support: PLATES.fiber,
  official: PLATES.canary,
  industry: PLATES.cityDay,
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
  'sync-lab': PLATES.boeFacade,
  ietf: PLATES.geneva,
  swift: PLATES.brussels,
  bis: PLATES.bisTower,
  'canary-wharf': PLATES.canary,
  'city-of-london': PLATES.city,
  ucl: PLATES.ucl,
  interop: PLATES.ucl,
  interoperability: PLATES.ucl,
  institutions: PLATES.royal,
  rooms: PLATES.royal,
  podcast: PLATES.radio,
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
  geneva: PLATES.geneva,
  basel: PLATES.basel,
  boston: PLATES.boston,
  cambridge: PLATES.cambridge,
  brussels: PLATES.brussels,
  washington: PLATES.washington,
  paris: PLATES.paris,
  'new-york': PLATES.newyork,
  miami: PLATES.miami,
  frankfurt: PLATES.frankfurt,
  zurich: PLATES.zurich,
  lisbon: PLATES.lisbon,
  singapore: PLATES.singapore,
  tokyo: PLATES.tokyo,
  'hong-kong': PLATES.hongkong,
  sydney: PLATES.sydney,
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

export type VisualId = 'hero' | 'history' | 'gateway' | 'sterling' | 'future' | 'london'

const BEDS: VisualId[] = ['hero', 'history', 'gateway', 'sterling', 'future', 'london']

const UNIQUE_CITY = new Set([
  'geneva',
  'basel',
  'boston',
  'cambridge',
  'brussels',
  'washington',
  'paris',
  'new-york',
  'miami',
  'frankfurt',
  'zurich',
  'lisbon',
  'singapore',
  'tokyo',
  'hong-kong',
  'sydney',
])

/** Motion bed for a page hero. Unique city stills stay stills — no mismatched Canary loop. */
export function motionBedFor(...keys: Array<string | undefined | null>): VisualId | undefined {
  const joined = keys.filter(Boolean).join(' ').toLowerCase()
  if (!joined) return 'hero'
  const tokens = joined.split(/[^a-z0-9-]+/).filter(Boolean)
  if (tokens.some((t) => UNIQUE_CITY.has(t))) return undefined
  for (const id of BEDS) {
    if (tokens.includes(id)) return id
  }
  if (/vision|future|philosophy|essay|thesis/.test(joined)) return 'future'
  if (/tech|stack|patent|overledger|gateway|fusion|payscript|quantnet/.test(joined)) return 'gateway'
  if (/cbdc|sterling|money|wholesale|token|gbtd|programme|liability/.test(joined)) return 'sterling'
  if (/\blondon\b|lab|boe|threadneedle/.test(joined)) return 'london'
  if (
    /story|glossary|language|research|library|news|wire|history|quote|people|person|podcast|standard|institution|room/.test(
      joined,
    )
  ) {
    return 'history'
  }
  return 'hero'
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
