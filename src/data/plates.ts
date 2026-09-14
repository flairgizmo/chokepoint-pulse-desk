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
  hero: STILL('hero.jpg', 'Canary Wharf from Limehouse, June 2016 — Wikimedia Commons', 'Canary Wharf towers at night across the dock'),
  ucl: TOPIC('ucl.jpg', 'Wilkins Building, UCL — Wikimedia Commons', 'The Wilkins Building portico at University College London'),
  fiber: TOPIC('fiber.jpg', 'Illuminated optical fiber, Hustvedt — Wikimedia Commons', 'A clear optical-fiber cable carrying a laser from one connector to the other'),
  cable: TOPIC('cable.jpg', 'Landing of the submarine cable, Port Darwin, 7 November 1871 — State Library of South Australia / Wikimedia', 'The 1871 Port Darwin landing of the Australia–Java telegraph cable'),
  canary: TOPIC('canary.jpg', 'Canary Wharf from Limehouse, June 2016 — Wikimedia Commons', 'Canary Wharf towers at night from Limehouse'),
  city: TOPIC('city.jpg', 'City of London from City Hall — Wikimedia Commons', 'The City of London skyline from City Hall'),
  library: TOPIC('library.jpg', 'British Museum Reading Room — Wikimedia Commons', 'The British Museum Reading Room'),
  exchange: TOPIC('exchange.jpg', 'New York Stock Exchange — Wikimedia Commons', 'The New York Stock Exchange facade on Wall Street'),
  datacenter: TOPIC('datacenter.jpg', 'CERN data centre — Wikimedia Commons', 'Server racks on the floor of the CERN data centre'),
  payments: TOPIC('payments.jpg', 'Bank of England, Threadneedle Street — Wikimedia Commons', 'The Bank of England on Threadneedle Street'),
  sterling: STILL('sterling.jpg', 'Bank of England, Threadneedle Street — Wikimedia Commons', 'The Bank of England on Threadneedle Street'),
  gateway: STILL('gateway.jpg', 'CERN data centre — Wikimedia Commons', 'Server racks on the floor of the CERN data centre'),
  history: STILL('history.jpg', 'British Museum Reading Room — Wikimedia Commons', 'The British Museum Reading Room'),
  future: STILL('future.jpg', 'Canary Wharf from Greenwich at dusk — Wikimedia Commons', 'Canary Wharf towers lit at dusk from Greenwich'),
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
  'overledger-gateway': PLATES.gateway,
  'qnt-utility': PLATES.exchange,
  'six-banks': PLATES.canaryDay,
  'flow-agents': PLATES.city,
  'sibos-trusted': PLATES.frankfurt,
  'future-money': PLATES.future,
  'home-interop': PLATES.fiber,
  'home-standards': PLATES.brussels,
  'home-institutions': PLATES.canaryDay,
  future: PLATES.future,
  'the-future of money': PLATES.payments,
  era: PLATES.geneva,
  present: PLATES.geneva,
  'the-era': PLATES.geneva,
  'the interop era': PLATES.geneva,
  taxonomy: PLATES.boston,
  'the-taxonomy': PLATES.boston,
  layers: PLATES.canary,
  architecture: PLATES.canary,
  'the-layers': PLATES.canary,
  discipline: PLATES.basel,
  'the-discipline': PLATES.basel,
  'not-l1': PLATES.cable,
  connectors: PLATES.frankfurt,
  hyperledger: PLATES.datacenter,
  fusion: PLATES.cityDay,
  'payscript-flow': PLATES.payments,
  satp: PLATES.geneva,
  'satp-ietf': PLATES.geneva,
  'satp-method': PLATES.geneva,
  x402: PLATES.fiber,
  'agents-x402': PLATES.fiber,
  oracle: PLATES.washington,
  'oracle-hyperledger': PLATES.washington,
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
  'patent-us': PLATES.datacenter,
  'patent-app': PLATES.library,
  'patent-jp': PLATES.tokyo,
  'hargreaves-vocalink': PLATES.payments,
  'linux-hyperledger': PLATES.library,
  acm: PLATES.library,
  inatba: PLATES.brussels,
  tokenomics: PLATES.exchange,
  lacchain: PLATES.miami,
  dentsu: PLATES.tokyo,
  sibos: PLATES.frankfurt,
  'sibos-2026': PLATES.miami,
  ey: PLATES.exchange,
  quantnet: PLATES.city,
  panels: PLATES.canaryDay,
  'trusted-node': PLATES.singapore,
  'uk-digital-markets': PLATES.future,
  'the-institutions': PLATES.royal,
  'the-technology': PLATES.fiber,
  technology: PLATES.fiber,
  tech: PLATES.cable,
  stack: PLATES.city,
  money: PLATES.payments,
  cbdc: PLATES.zurich,
  sterling: PLATES.sterling,
  wholesale: PLATES.sterling,
  retail: PLATES.london,
  tcbm: PLATES.canary,
  programme: PLATES.canary,
  programmes: PLATES.royal,
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
  overledger: PLATES.ucl,
  'c-suite': PLATES.ucl,
  heads: PLATES.canaryDay,
  founders: PLATES.library,
  board: PLATES.cityDay,
  verdian: PLATES.ucl,
  hargreaves: PLATES.geneva,
  russ: PLATES.exchange,
  ashton: PLATES.library,
  riley: PLATES.cambridge,
  sentelidis: PLATES.fiber,
  facer: PLATES.brussels,
  chiriac: PLATES.cable,
  rawel: PLATES.canaryDay,
  alves: PLATES.lisbon,
  baugh: PLATES.newsroom,
  tasca: PLATES.boston,
  mondelli: PLATES.lisbon,
  belchior: PLATES.lisbon,
  dietrich: PLATES.newyork,
  smit: PLATES.washington,
  yates: PLATES.london,
  'overledger-network': PLATES.cable,
  'ol-network': PLATES.cable,
  'ol-os': PLATES.datacenter,
  'ol-platform': PLATES.city,
  'overledger-platform': PLATES.datacenter,
  'quant-connect': PLATES.cambridge,
  'quant-connect-term': PLATES.city,
  'token-rails': PLATES.canaryDay,
  identity: PLATES.library,
  payscript: PLATES.payments,
  rln: PLATES.royal,
  murex: PLATES.paris,
  'murex-2026': PLATES.paris,
  apps: PLATES.city,
  script: PLATES.payments,
  ledgers: PLATES.cable,
  gate: PLATES.datacenter,
  '@quantnetwork': PLATES.canary,
  '@overledgerdev': PLATES.fiber,
  '@gverdian': PLATES.ucl,
  'door-overledger': PLATES.gateway,
  'door-payscript': PLATES.payments,
  'door-gbtd': PLATES.canary,
  'door-satp': PLATES.geneva,
  'door-2018 paper': PLATES.ucl,
  'door-fusion': PLATES.cityDay,
  'door-x402': PLATES.fiber,
  'door-quant': PLATES.canaryDay,
  'door-docs': PLATES.datacenter,
  'door-@quantnetwork': PLATES.newsroom,
  'door-@overledgerdev': PLATES.radio,
  'door-@gverdian': PLATES.library,
  'overledger platform': PLATES.datacenter,
  'an hour with quant network': PLATES.cambridge,
  'gbtd — uk finance': PLATES.canary,
  '2018 whitepaper': PLATES.ucl,
  'satp core': PLATES.geneva,
  'ifgs 2026 panel': PLATES.sterling,
  'sibos 2025': PLATES.frankfurt,
  'three-layer digital money': PLATES.payments,
  'satp-wg-2023': PLATES.brussels,
  'ey-2025': PLATES.royal,
  'uk-finance': PLATES.canary,
  barclays: PLATES.city,
  hsbc: PLATES.hongkong,
  lloyds: PLATES.london,
  natwest: PLATES.payments,
  nationwide: PLATES.sterling,
  santander: PLATES.cityDay,
  quant: PLATES.ucl,
  vocalink: PLATES.newsroom,
  linklaters: PLATES.royal,
  'iso-2015': PLATES.geneva,
  'gbtd-2025': PLATES.canary,
  'boe-lab-2026': PLATES.london,
  'patent-app-2020': PLATES.patentsHall,
  'dentsu-2026': PLATES.tokyo,
  'iso-23516-2026': PLATES.zurich,
  'overledger-2018': PLATES.ucl,
  'satp-core': PLATES.geneva,
  'satp-arch': PLATES.datacenter,
  'satp-adapt': PLATES.cable,
  'satp-recovery': PLATES.fiber,
  'satp-views': PLATES.library,
  'satp-use-cases': PLATES.frankfurt,
  'satp-impl': PLATES.gateway,
  'satp-exchange': PLATES.exchange,
  odap: PLATES.royal,
  'odap-rename': PLATES.geneva,
  'mondelli-thesis-2017': PLATES.lisbon,
  'acm-3564532': PLATES.library,
  'belchior-survey': PLATES.brussels,
  'sok-interop': PLATES.cambridge,
  'brief-history': PLATES.history,
  'dlt-options': PLATES.fiber,
  'tasca-enabling': PLATES.boston,
  'tasca-banking': PLATES.exchange,
  'tasca-iov': PLATES.cityDay,
  'flow-apps': PLATES.city,
  'iso-23516': PLATES.geneva,
  'iso-tc307': PLATES.zurich,
  'gbtd-quant': PLATES.canaryDay,
  'rosalind-quant': PLATES.boeFacade,
  'rosalind-bis': PLATES.bisTower,
  'oracle-blog': PLATES.newyork,
  'boe-lab': PLATES.boeFacade,
  'deloitte-token': PLATES.singapore,
  synchro: PLATES.future,
  'verdian-cv': PLATES.canary,
  'riley-hyperledger': PLATES.cambridge,
  'riley-voting': PLATES.brussels,
  'riley-shareholder': PLATES.newsroom,
  'hardjono-design': PLATES.boston,
  'hardjono-tems': PLATES.singapore,
  'hardjono-gateways': PLATES.washington,
  hermes: PLATES.basel,
  'cacti-whitepaper': PLATES.tokyo,
  'ai-agents-delegation': PLATES.fiber,
  'gbtd-ukf': PLATES.canary,
  'three-layer': PLATES.payments,
  'whitepaper-2018': PLATES.ucl,
  'burn-2018': PLATES.exchange,
  'odap-2020': PLATES.royal,
  'ol-network-2021': PLATES.cable,
  'riley-hl-2021': PLATES.cambridge,
  'three-layer-2026': PLATES.payments,
  'x402-2026': PLATES.fiber,
  'ukf-2026': PLATES.canary,
  'ukf-roadmap': PLATES.canary,
  'ukf-report': PLATES.royal,
  'hmt-digit': PLATES.future,
  'digit-2027': PLATES.sterling,
  'sibos-miami-note': PLATES.radio,
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
  'proof-patents': PLATES.patentsHall,
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
  linux: PLATES.fiber,
  '2pc': PLATES.fiber,
  'xa-2pc': PLATES.fiber,
  'digital-pound': PLATES.sterling,
  iso20022: PLATES.brussels,
  iso23516: PLATES.geneva,
  isotc307: PLATES.zurich,
  iso22739: PLATES.library,
  'tokenised-deposit': PLATES.canary,
  'tokenised-cbm': PLATES.canaryDay,
  'wholesale-cbdc': PLATES.sterling,
  'retail-cbdc': PLATES.london,
  target2: PLATES.frankfurt,
  agora: PLATES.basel,
  guardian: PLATES.singapore,
  mbridge: PLATES.hongkong,
  chaps: PLATES.payments,
  cls: PLATES.newyork,
  herstatt: PLATES.frankfurt,
  htlc: PLATES.fiber,
  cacti: PLATES.tokyo,
  fabric: PLATES.datacenter,
  'hash-lock': PLATES.cable,
  'license-lock': PLATES.exchange,
  mcp: PLATES.fiber,
  'multi-dlt': PLATES.cable,
  nostro: PLATES.royal,
  notary: PLATES.library,
  'open-banking': PLATES.city,
  pvp: PLATES.bisTower,
  rt2: PLATES.boeFacade,
  rtgs: PLATES.payments,
  singleness: PLATES.bisTower,
  'singleness-test': PLATES.bisTower,
  stablecoin: PLATES.exchange,
  emoney: PLATES.sterling,
  'faster-payments': PLATES.city,
  fnality: PLATES.basel,
  layer25: PLATES.cityDay,
  correspondent: PLATES.hongkong,
  dvp: PLATES.hongkong,
  synchronisation: PLATES.boeFacade,
  'digit-gilt': PLATES.future,
  synthorus: PLATES.london,
  mica: PLATES.exchange,
  'inatba-term': PLATES.brussels,
  'bsi-dlt': PLATES.city,
  observability: PLATES.datacenter,
  'layer1-money': PLATES.sterling,
  finality: PLATES.payments,
  programmability: PLATES.payments,
  'trusted-operator': PLATES.fiber,
  ust: PLATES.boeFacade,
  'oracle-obp': PLATES.washington,
  besu: PLATES.library,
  'burn-mint': PLATES.datacenter,
  corda: PLATES.cable,
  flow: PLATES.city,
  'not-cbdc': PLATES.canary,
  'http-402': PLATES.fiber,
  'gateway-not-chain': PLATES.ucl,
  'acm-gateway': PLATES.boston,
  'sat-2pc': PLATES.fiber,
  'satp-not-sku': PLATES.geneva,
  'mit-serc': PLATES.cambridge,
  'iso-decade': PLATES.zurich,
  'mcp-flows': PLATES.city,
  'oracle-fabric': PLATES.washington,
  'patent-order': PLATES.patentsHall,
  'tasca-risk': PLATES.boston,
  'rln-to-gbtd': PLATES.royal,
  'boe-lab-not-live': PLATES.boeFacade,
  'rosalind-concluded': PLATES.bisTower,
  'verdian-ciso': PLATES.ucl,
  'tasca-iov-people': PLATES.cityDay,
  'riley-kcl': PLATES.city,
  'belchior-while': PLATES.lisbon,
  'paterson-clock': PLATES.ucl,
  'rosalind-not-policy': PLATES.london,
  'lab-not-pound': PLATES.sterling,
  'fusion-25': PLATES.cityDay,
  'odap-lineage': PLATES.royal,
  'same-year-2018': PLATES.exchange,
  'belchior-284': PLATES.brussels,
  'ucl-whitepaper': PLATES.ucl,
  'gateway-tcpip': PLATES.cable,
  'oracle-named': PLATES.newyork,
  'murex-mx3': PLATES.paris,
  'x402-foundation': PLATES.fiber,
  'facer-cochair': PLATES.brussels,
  'mondelli-inventor': PLATES.lisbon,
  'sentelidis-hot': PLATES.fiber,
  'lovesey-vocalink': PLATES.payments,
  'mondelli-thesis': PLATES.lisbon,
  'lacchain-2021': PLATES.miami,
  'dentsu-tokyo': PLATES.tokyo,
  'sibos-stand-13': PLATES.frankfurt,
  'quantnet-name': PLATES.city,
  'qnt-burn': PLATES.exchange,
  'ey-support': PLATES.royal,
  'payscript-treasury': PLATES.payments,
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

/** Category kinds that steal uniqueness when used as plateFor() arguments. */
const GENERIC_PLATE_ARGS = new Set([
  'news',
  'page',
  'chapter',
  'programme',
  'institution',
  'event',
  'source',
  'tech',
  'stack',
  'proof',
  'paper',
  'money',
  'cbdc',
  'primary',
  'history',
  'present',
  'future',
  'podcast',
  'notes',
  'wire',
])

function isGenericPlateArg(raw: string): boolean {
  const key = raw.toLowerCase().trim()
  if (key.startsWith('paper-')) return true
  return GENERIC_PLATE_ARGS.has(key)
}

let stillCycle: Plate[] | undefined

function uniqueStills(): Plate[] {
  if (stillCycle) return stillCycle
  const seen = new Set<string>()
  const out: Plate[] = []
  for (const plate of Object.values(PLATES)) {
    if (seen.has(plate.src)) continue
    seen.add(plate.src)
    out.push(plate)
  }
  stillCycle = out
  return out
}

function hashPlate(seed: string): Plate {
  const cycle = uniqueStills()
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  }
  return cycle[(h >>> 0) % cycle.length]
}

function yearStem(raw: string): string | undefined {
  const match = raw
    .toLowerCase()
    .trim()
    .match(/^([a-z][a-z0-9-]{1,40})-20\d{2}$/)
  return match?.[1]
}

export function plateFor(...keys: Array<string | undefined | null>): Plate {
  const list = keys.map((key) => (key == null ? '' : String(key).trim())).filter(Boolean)
  const specific = list.filter((key) => !isGenericPlateArg(key))
  const ordered = specific.length ? specific : list
  const seed = ordered[0] ?? 'desk'
  for (const key of ordered) {
    const hit = lookup(key)
    if (hit) return hit
    const stem = yearStem(key)
    if (stem && !isGenericPlateArg(stem)) {
      const yearHit = lookup(stem)
      if (yearHit) return yearHit
    }
  }
  return hashPlate(String(seed))
}

export function photoFigure(plate: Plate, extraClass = ''): string {
  return `<figure class="photo-plate cinema-frame ${extraClass}">
    <img src="${plate.src}" alt="${plate.alt}" width="1280" height="720" loading="lazy" decoding="async" />
    <figcaption>${plate.credit}</figcaption>
  </figure>`
}

export function photoImg(plate: Plate, className = 'stage-photo'): string {
  return `<img class="${className}" src="${plate.src}" alt="${plate.alt}" width="1280" height="720" loading="lazy" decoding="async" />`
}
