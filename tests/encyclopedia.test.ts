import { describe, expect, it } from 'vitest';
import { QNT_CONTRACT, chapters, papers, didYouKnow } from '../src/data/catalog';
import { CITIES } from '../src/data/cities';
import { GLOSSARY } from '../src/data/glossary';
import { PEOPLE } from '../src/data/people';
import { GBTD_BANKS } from '../src/data/timeline';

describe('QntDesk encyclopedia contract', () => {
  it('keeps the QNT ERC-20 address unmodified', () => {
    expect(QNT_CONTRACT).toBe('0x4a220E6096B25EADb88358cb44068A3248254675');
  });

  it('retains sourced chapters, papers, cities, people, glossary and DYK', () => {
    expect(chapters.length).toBeGreaterThanOrEqual(40);
    expect(papers.length).toBe(48);
    expect(CITIES.length).toBe(17);
    expect(PEOPLE.length).toBeGreaterThanOrEqual(18);
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(60);
    expect(didYouKnow.length).toBeGreaterThanOrEqual(40);
  });

  it('names the six GBTD commercial banks', () => {
    expect([...GBTD_BANKS]).toEqual([
      'Barclays',
      'HSBC',
      'Lloyds Bank',
      'NatWest',
      'Nationwide',
      'Santander',
    ]);
  });

  it('does not treat GBTD copy as a CBDC', () => {
    const gbtd = chapters.find((c) => c.id === 'gbtd');
    expect(gbtd?.body.toLowerCase()).toContain('commercial-bank');
    expect(papers.some((p) => p.id === 'overledger-2018')).toBe(true);
    expect(papers.some((p) => p.id === 'acm-3564532')).toBe(true);
  });
});
