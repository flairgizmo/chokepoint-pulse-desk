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

export function markFor(label: string): string | undefined {
  return INSTITUTION_MARKS[label];
}
