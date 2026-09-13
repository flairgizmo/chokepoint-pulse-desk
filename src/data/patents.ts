export interface PatentCard {
  id: string;
  number: string;
  title: string;
  filed?: string;
  granted?: string;
  inventors: string[];
  assignee?: string;
  claim: string;
  why: string;
  hrefKey: string;
  related: string[];
}

export const PATENTS: PatentCard[] = [
  {
    id: 'patent-us',
    number: 'US11842335B2',
    title: 'Blockchain communications and ordering',
    granted: '2023',
    inventors: ['Gilbert Verdian', 'Colin Paterson', 'Gaetano Mondelli', 'Paolo Tasca'],
    assignee: 'Quant Network Ltd',
    claim: 'A granted method for chronologically ordering transactions that originate on different blockchains so a multi-ledger application can agree on sequence.',
    why: 'Overledger’s job is to sit above ledgers that do not share a clock. SATP’s lock-and-commit still needs time to mean the same thing on both sides. This patent is the legal sentence of that engineering problem. It is a claim, not a deployment.',
    hrefKey: 'patentUs',
    related: ['overledger', 'satp', 'paterson', 'mondelli'],
  },
  {
    id: 'patent-app',
    number: 'US20200311718A1',
    title: 'Application publication — ordering',
    filed: 'published 2020',
    inventors: ['Gilbert Verdian', 'Colin Paterson', 'Gaetano Mondelli', 'Paolo Tasca'],
    assignee: 'Quant Network Ltd',
    claim: 'The published application that became US11842335B2. Useful for reading the claim set as originally filed, before grant.',
    why: 'The file wrapper is how a standards lawyer checks what was asked for before the grant cleaned the sentence. Same family as the 2023 patent.',
    hrefKey: 'patentApp',
    related: ['patent-us', 'overledger'],
  },
  {
    id: 'patent-jp',
    number: 'JPO acceptance (Quant note, 2026)',
    title: 'Multi-DLT token / Fusion rollup method',
    granted: '2026 (Quant’s published acceptance note)',
    inventors: [],
    assignee: 'Quant (as reported)',
    claim: 'Quant’s news note: Japanese acceptance covering updates across two or more ledgers — the Fusion rollup claim. Read Quant’s page for the company’s wording; no Japanese publication number is printed that is not on that page.',
    why: 'Fusion is marketed as Layer 2.5: one execution environment that can write into more than one ledger. The Japanese filing is how Quant describes protection of that method. A company note, not a USPTO grant.',
    hrefKey: 'patentJp',
    related: ['fusion', 'overledger'],
  },
  {
    id: 'hargreaves-vocalink',
    number: 'Vocalink / Mastercard family',
    title: 'Payments data-processing and international ACH',
    filed: '2018–2019',
    inventors: ['Martin Hargreaves'],
    assignee: 'Vocalink / Mastercard (as cited)',
    claim: 'Two Vocalink-era filings Quant’s people page cites: data-processing / merchant-mandate review, and international ACH with addressing.',
    why: 'Hargreaves arrives at SATP as a payments person. Atomic settlement in stage 3 feels like ACH and mandate rails he had already patented. Rails history, not an Overledger claim.',
    hrefKey: 'hargreavesPatents',
    related: ['hargreaves', 'satp'],
  },
];

export function patentById(id: string): PatentCard | undefined {
  return PATENTS.find((p) => p.id === id);
}
