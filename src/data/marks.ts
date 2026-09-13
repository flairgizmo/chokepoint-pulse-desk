/** Official institution marks, filed locally for identification. Not the QntDesk lockup. */

export const INSTITUTION_MARKS: Record<string, string> = {
  Barclays: '/marks/barclays.svg',
  HSBC: '/marks/hsbc.svg',
  'Lloyds Bank': '/marks/lloyds.svg',
  NatWest: '/marks/natwest.svg',
  Nationwide: '/marks/nationwide.png',
  Santander: '/marks/santander.svg',
  Quant: '/marks/quant.svg',
  'UK Finance': '/marks/ukfinance.png',
  'Bank of England': '/marks/boe.png',
  BIS: '/marks/bis.svg',
  IETF: '/marks/ietf.svg',
  'Linux Foundation': '/marks/linuxfoundation.svg',
  Oracle: '/marks/oracle.svg',
  Murex: '/marks/murex.svg',
  UCL: '/marks/ucl.png',
  Hyperledger: '/marks/hyperledger.png',
};

/** UK Finance’s 26 September 2025 press writes Lloyds Banking Group. The public mark is the Lloyds wordmark. */
const MARK_ALIASES: Record<string, string> = {
  'Lloyds Banking Group': 'Lloyds Bank',
  Lloyds: 'Lloyds Bank',
  'Natwest Group': 'NatWest',
  Natwest: 'NatWest',
  'Santander UK': 'Santander',
};

const DISPLAY_NAME: Record<string, string> = {
  'Lloyds Bank': 'Lloyds Banking Group',
  Lloyds: 'Lloyds Banking Group',
};

export function markFor(label: string): string | undefined {
  return INSTITUTION_MARKS[label] ?? INSTITUTION_MARKS[MARK_ALIASES[label] ?? ''];
}

export function bankDisplay(label: string): string {
  return DISPLAY_NAME[label] ?? label;
}
