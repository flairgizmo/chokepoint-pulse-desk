export interface TimelineBeat {
  year: string;
  title: string;
  body: string;
}

export const TIMELINE: TimelineBeat[] = [
  {
    year: '2015',
    title: 'ISO/TC 307 proposed',
    body: 'Verdian puts a blockchain committee in front of ISO. A decade later the interoperability framework is ISO/TS 23516:2026.',
  },
  {
    year: '2018',
    title: 'Whitepaper. Token burn.',
    body: 'Overledger v0.1 at UCL Discovery: a gateway OS, not an L1. On 14 September Quant burns unsold QNT. Their post: total supply 14,612,493.080826178.',
  },
  {
    year: '2021',
    title: 'Overledger Network. LACChain.',
    body: 'Overledger Network launches. Separately, Quant and LACChain (IDB Lab) announce Overledger interoperability and tokenised cross-border payments for Latin America and the Caribbean, dated 1 February 2021.',
  },
  {
    year: '2023',
    title: 'Project Rosalind — concluded',
    body: 'BIS Innovation Hub London × Bank of England retail-CBDC APIs. Quant says it was on the vendor team with UST. The BIS page records a concluded experiment.',
  },
  {
    year: '2024',
    title: 'Regulated Liability Network',
    body: 'UK Finance’s RLN phase. The dress rehearsal GBTD sits on. Same problem: singleness of commercial-bank money across institutions.',
  },
  {
    year: '2025',
    title: 'GBTD. Sibos. QuantNet.',
    body: '26 September: Quant selected as GBTD technology partner with six UK banks. Late September: Sibos Frankfurt, stand 13. QuantNet published as the bank-facing gateway built on that architecture.',
  },
  {
    year: '2026',
    title: 'Dentsu. Murex. Lab. ISO 23516.',
    body: 'January: Dentsu Soken, Tokyo. February: Synchronisation Lab (simulated RT2). March: Murex MX.3. April: three-layer essay. ISO/TS 23516:2026 is the vocabulary the decade was for. Sibos Miami, stand DISL51, 28 September–1 October.',
  },
];

export interface CalendarEvent {
  id: string;
  when: string;
  where: string;
  title: string;
  body: string;
  href: string;
  hrefLabel: string;
}

export interface MonthNote {
  id: string;
  date: string;
  source: string;
  title: string;
  body: string;
  href: string;
  lane: 'Official' | 'Landscape' | 'Event';
}

export const THIS_MONTH: MonthNote[] = [
  {
    id: 'trusted-node',
    date: '2026-09-10',
    source: 'Quant Network',
    title: 'The Trusted Node Program: Who’s processing your transaction?',
    body: 'Official Quant perspective, 10 September 2026. KYC-verified operators and chosen jurisdictions for Fusion; DORA Article 28 is named as the compliance test. A company essay on who processes the transaction.',
    href: 'trustedNode',
    lane: 'Official',
  },
  {
    id: 'ukf-roadmap',
    date: '2026-09-08',
    source: 'UK Finance',
    title: 'UK Finance sets out roadmap to accelerate digital market adoption',
    body: 'UK Finance × Oliver Wyman, 8 September 2026. The report names the Great British Tokenised Deposit as UK innovation — the live pilot Quant is already in.',
    href: 'ukfDigitalMarketsPress',
    lane: 'Landscape',
  },
  {
    id: 'hmt-digit',
    date: '2026-09-08',
    source: 'GOV.UK',
    title: 'Economic Secretary to the Treasury speech at UK Finance',
    body: 'HMT speech at the report launch, 8 September 2026. DIGIT gilt in Q1 2027, wholesale digital markets. Landscape around the same week as the UK Finance note.',
    href: 'hmtUkfSpeech',
    lane: 'Landscape',
  },
  {
    id: 'ukf-report',
    date: '2026-09-07',
    source: 'UK Finance / Oliver Wyman',
    title: 'Building Digital Markets of the Future',
    body: 'Report dated 7 September 2026, published 8 September. Securities tokenisation roadmap. GBTD is cited as evidence the UK can lead while preserving stability.',
    href: 'ukfDigitalMarkets',
    lane: 'Landscape',
  },
  {
    id: 'sibos-miami-note',
    date: '2026-08-05',
    source: 'Quant',
    title: 'Quant at Sibos 2026 Miami — 28 September to 1 October, stand DISL51',
    body: 'Quant’s own Sibos 2026 page, posted from @quantnetwork on 5 August. Discover Stage 28 Sept 10:30 with Murex on programmable settlement. Welcome drinks 29 Sept 16:30–18:30. Conference stage 1 October. The week is still ahead.',
    href: 'sibos2026',
    lane: 'Event',
  },
];

export const CALENDAR: CalendarEvent[] = [
  {
    id: 'sibos-2026',
    when: '2026-09-28',
    where: 'Miami Beach Convention Center',
    title: 'Sibos 2026 — Miami, stand DISL51',
    body: 'Discover Stage 28 Sept 10:30 with Murex on programmable settlement. Welcome drinks 29 Sept 16:30–18:30. Conference Stage 4 on 1 October.',
    href: 'sibos2026X',
    hrefLabel: '@quantnetwork',
  },
  {
    id: 'digit-gilt',
    when: '2027-Q1',
    where: 'United Kingdom',
    title: 'DIGIT gilt — wholesale digital markets',
    body: 'Economic Secretary’s 8 September 2026 speech at UK Finance: DIGIT gilt in Q1 2027, wholesale digital markets.',
    href: 'hmtUkfSpeech',
    hrefLabel: 'HMT speech',
  },
];

export const GBTD_BANKS = [
  'Barclays',
  'HSBC',
  'Lloyds Bank',
  'NatWest',
  'Nationwide',
  'Santander',
] as const;

export const OFFICIAL_VOICES = [
  {
    handle: '@quantnetwork',
    name: 'Quant Network',
    href: 'https://x.com/quantnetwork',
    blurb: 'Official company account. Programmes, Sibos, the rooms Quant walks into.',
  },
  {
    handle: '@OverledgerDev',
    name: 'Overledger developers',
    href: 'https://x.com/OverledgerDev',
    blurb: 'Developer account named on Quant’s own profile. Builders of the gateway.',
  },
  {
    handle: '@gverdian',
    name: 'Gilbert Verdian',
    href: 'https://x.com/gverdian',
    blurb: 'Founder and CEO. Quant’s own posts tag this handle. The architecture in the first person.',
  },
] as const;

export const MONEY_LAYERS = [
  {
    n: '01',
    title: 'Wholesale CBDC / RTGS',
    body: 'Central-bank liability. Finality. Synchronisation Lab sits adjacent — experiment, not a digital pound.',
  },
  {
    n: '02',
    title: 'Tokenised deposits',
    body: 'Commercial-bank liability. GBTD lives here. Programmable M1, still a bank IOU.',
  },
  {
    n: '03',
    title: 'Stablecoins & public-chain RWAs',
    body: 'Private or protocol liability. Liquidity and DeFi. Not the subject of the UK pilot.',
  },
  {
    n: '—',
    title: 'Horizontal interoperability',
    body: 'Overledger. Talks to all three and to SWIFT, Faster Payments, Open Banking. Without it the layers silo.',
  },
] as const;

export const SATP_STAGES = [
  {
    n: '0',
    title: 'Pre-transfer verification',
    body: 'Applications share a context-ID. Originator and beneficiary identities may be checked (FATF travel rule). Out of SATP-core scope. Nothing is locked.',
    tags: 'Context-ID · identity / travel-rule checks',
  },
  {
    n: '1',
    title: 'Transfer initiation',
    body: 'Gateways G1 and G2 exchange claims: asset, originator, beneficiary, operators. They agree to commence. Still nothing locked.',
    tags: 'Transfer Proposal · Proposal Receipt · Transfer Commence · ACK Commence',
  },
  {
    n: '2',
    title: 'Lock assertion',
    body: 'Origin gateway G1 signs that the asset is immobilised in NW1. Required because NW1 may be private — G2 cannot read it. G1’s operator takes liability for that assertion.',
    tags: 'Lock-Assertion · Assertion Receipt',
  },
  {
    n: '3',
    title: 'Commitment (2PC)',
    body: 'Classic two-phase commit inside the transfer. Prepare, then burn-and-mint. Atomic: both commit or both abort. Crash recovery is a separate Belchior draft.',
    tags: 'commit-prepare · ack-prepare (mint assertion) · commit-final (burn) · ack-commit-final',
  },
] as const;
