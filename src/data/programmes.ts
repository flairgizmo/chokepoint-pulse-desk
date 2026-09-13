import { chaptersFor } from './catalog';

export type ProgStatus = 'active' | 'incubating' | 'completed' | 'upcoming';

export interface Programme {
  id: string;
  status: ProgStatus;
  owner: string;
  institutions: string[];
  tech: string[];
  milestone: string;
  keywords: string[];
  hrefKey?: string;
  title: string;
  kicker: string;
  body: string;
}

const EXTRA: Programme[] = [
  {
    id: 'gbtd',
    status: 'active',
    owner: 'UK Finance convenor · Quant technology partner',
    institutions: ['UK Finance', 'Barclays', 'HSBC', 'Lloyds Bank', 'NatWest', 'Nationwide', 'Santander', 'EY', 'Linklaters'],
    tech: ['overledger', 'payscript', 'quantnet'],
    milestone: 'Live tokenised sterling into mid-2026. Use cases: Lloyds P2P, Barclays remortgage, HSBC Orion DvP.',
    keywords: ['gbtd', 'tokenised deposit', 'tokenized deposit', 'great british', 'uk finance'],
    hrefKey: 'gbtdUkFinance',
    title: 'Live tokenised sterling deposits',
    kicker: 'Active · GBTD — London',
    body: 'On 26 September 2025 UK Finance selected Quant to provide the technology for live tokenised sterling deposits with Barclays, HSBC, Lloyds Bank, NatWest, Nationwide and Santander. EY and Linklaters support. Overledger and PayScript are named as the foundation. The six banks issue the deposits — commercial-bank sterling, building on the 2024 RLN phase. Quant does not issue the tokens. GBTD is not a CBDC.',
  },
  {
    id: 'rln',
    status: 'completed',
    owner: 'UK Finance industry phase',
    institutions: ['UK Finance'],
    tech: ['overledger'],
    milestone: 'Dress rehearsal closed. GBTD sits on this phase.',
    keywords: ['rln', 'regulated liability'],
    hrefKey: 'gbtdUkFinance',
    title: 'Regulated Liability Network — 2024 phase',
    kicker: 'Completed · 2024',
    body: 'The Regulated Liability Network phase is the industry rehearsal for shared records of regulated liabilities across institutions. Same problem GBTD later names: singleness of commercial-bank money. Not a CBDC. The dress rehearsal the live pilot sits on.',
  },
  {
    id: 'murex',
    status: 'active',
    owner: 'Murex × Quant',
    institutions: ['Murex'],
    tech: ['overledger', 'quant-connect'],
    milestone: 'Named MX.3 integration, 25 March 2026.',
    keywords: ['murex', 'mx.3'],
    hrefKey: 'murexNews',
    title: 'Tokenised deposits inside MX.3',
    kicker: 'Active · Murex — Paris',
    body: 'On 25 March 2026 Murex and Quant announced a partnership to put tokenised deposits and digital-bond settlement inside MX.3, the cross-asset platform used by more than 300 institutions. Named vendor integration: programmable markets inside a platform the industry already runs.',
  },
  {
    id: 'oracle',
    status: 'active',
    owner: 'Oracle blog · named vendor',
    institutions: ['Oracle'],
    tech: ['overledger', 'connectors'],
    milestone: 'February 2025 blog names Overledger for XA/2PC on Fabric.',
    keywords: ['oracle', 'blockchain platform'],
    hrefKey: 'oracleBlog',
    title: 'Blockchain Platform Digital Assets',
    kicker: 'Active · Oracle',
    body: 'February 2025. Oracle’s own blog names Overledger as the orchestration layer for cross-ledger, two-phase workflows on a Hyperledger Fabric platform. New York is the markets pin. Named vendor integration — not a central-bank mandate.',
  },
  {
    id: 'basel',
    status: 'completed',
    owner: 'BIS Innovation Hub London × Bank of England',
    institutions: ['BIS', 'Bank of England'],
    tech: ['overledger'],
    milestone: 'Rosalind concluded 2023. Bibliography remains.',
    keywords: ['rosalind', 'bis innovation'],
    hrefKey: 'rosalindBis',
    title: 'Project Rosalind — concluded API experiment',
    kicker: 'Completed · BIS — Basel / London',
    body: 'Project Agora, “singleness of money” speeches, and wholesale CBDC research live in Basel. Project Rosalind was a concluded CBDC API experiment run from London. Quant says it was a vendor, with UST. Geography plus citations — not a standing Basel mandate.',
  },
  {
    id: 'sync-lab',
    status: 'incubating',
    owner: 'Quant as Synchronisation Operator — Quant’s claim',
    institutions: ['Bank of England'],
    tech: ['quantnet', 'overledger'],
    milestone: 'February 2026 lab. Simulated RT2. Not a live RTGS hook-up.',
    keywords: ['synchronisation lab', 'synchronization lab', 'rt2'],
    hrefKey: 'boeLab',
    title: 'Synchronisation Lab — simulated RT2',
    kicker: 'Incubating · adjacency',
    body: 'February 2026: Quant selected for the Bank of England’s Synchronisation Lab, a simulated RT2 environment. Quant’s press note treats selection as participation rather than endorsement or a live deployment. Distinct from GBTD. Distinct from the desk’s Synchro / Synthorus research note. Adjacency, labelled as such.',
  },
];

const META: Record<string, Omit<Programme, 'id' | 'title' | 'kicker' | 'body'>> = {
  lacchain: {
    status: 'completed',
    owner: 'Quant × LACChain / IDB Lab',
    institutions: ['LACChain', 'IDB Lab'],
    tech: ['overledger', 'overledger-network'],
    milestone: 'Announced 1 February 2021.',
    keywords: ['lacchain', 'idb'],
    hrefKey: 'lacchain',
  },
  dentsu: {
    status: 'incubating',
    owner: 'Quant × Dentsu Soken',
    institutions: ['Dentsu Soken'],
    tech: ['overledger', 'quantnet'],
    milestone: 'Announced 14 January 2026. Tokenised yen deposits — go-to-market.',
    keywords: ['dentsu', 'soken', 'yen'],
    hrefKey: 'dentsuSoken',
  },
  sibos: {
    status: 'completed',
    owner: 'Quant on the SWIFT community floor',
    institutions: ['SWIFT'],
    tech: ['overledger'],
    milestone: 'Frankfurt, stand 13, 29 September–2 October 2025.',
    keywords: ['sibos 2025', 'frankfurt'],
    hrefKey: 'sibos2025',
  },
  'sibos-2026': {
    status: 'upcoming',
    owner: 'Quant event page · @quantnetwork',
    institutions: ['SWIFT', 'Murex'],
    tech: ['overledger', 'quantnet'],
    milestone: 'Miami, stand DISL51, 28 September–1 October 2026.',
    keywords: ['sibos', 'miami', 'disl51'],
    hrefKey: 'sibos2026',
  },
  ey: {
    status: 'active',
    owner: 'Supporting firms on GBTD',
    institutions: ['EY', 'Linklaters', 'UK Finance'],
    tech: ['overledger', 'payscript'],
    milestone: 'Kearney ~£4bn is Quant’s report of a convening, not an official UK figure.',
    keywords: ['ey', 'linklaters', 'kearney'],
    hrefKey: 'gbtdUseCases',
  },
  quantnet: {
    status: 'active',
    owner: 'Quant product page',
    institutions: ['UK Finance'],
    tech: ['quantnet', 'overledger'],
    milestone: 'Bank-facing name for the gateway architecture under GBTD / UK RLN.',
    keywords: ['quantnet'],
    hrefKey: 'quantNet',
  },
  panels: {
    status: 'completed',
    owner: 'Quant write-ups of industry rooms',
    institutions: ['UK Finance', 'Barclays', 'Lloyds Bank', 'NatWest'],
    tech: ['payscript', 'overledger'],
    milestone: 'IFGS 28 April 2026 · DIS 30 June 2026 · Sibos 2025.',
    keywords: ['ifgs', 'digital innovation summit'],
    hrefKey: 'ifgs2026',
  },
  'trusted-node': {
    status: 'active',
    owner: 'Quant perspective, 10 September 2026',
    institutions: [],
    tech: ['fusion', 'trusted-node'],
    milestone: 'Essay on KYC-verified Fusion operators and DORA Article 28.',
    keywords: ['trusted node', 'dora'],
    hrefKey: 'trustedNode',
  },
  'uk-digital-markets': {
    status: 'upcoming',
    owner: 'UK Finance × Oliver Wyman · HMT speech',
    institutions: ['UK Finance', 'HM Treasury'],
    tech: ['overledger'],
    milestone: 'DIGIT gilt flagged for Q1 2027. The speech does not name Quant.',
    keywords: ['digital markets', 'digit gilt', 'oliver wyman'],
    hrefKey: 'ukfDigitalMarketsPress',
  },
};

function fromChapter(id: string): Programme | null {
  const ch = chaptersFor('programmes').find((c) => c.id === id);
  const meta = META[id];
  if (!ch || !meta) return null;
  return {
    id,
    title: ch.title,
    kicker: ch.kicker,
    body: ch.body,
    ...meta,
  };
}

export const PROGRAMMES: Programme[] = [
  ...EXTRA,
  ...Object.keys(META)
    .map(fromChapter)
    .filter((p): p is Programme => Boolean(p)),
];

export function programmeById(id: string): Programme | undefined {
  return PROGRAMMES.find((p) => p.id === id);
}

export function matchProgrammes(title: string): Programme[] {
  const hay = title.toLowerCase();
  return PROGRAMMES.filter((p) => p.keywords.some((k) => hay.includes(k.toLowerCase())));
}
