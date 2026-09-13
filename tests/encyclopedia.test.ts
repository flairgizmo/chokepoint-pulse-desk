import { describe, expect, it } from 'vitest';
import {
  QNT_CONTRACT,
  chapters,
  papers,
  didYouKnow,
  sources,
  quotes,
  paperYearKey,
  papersNewestFirst,
} from '../src/data/catalog';
import { CITIES } from '../src/data/cities';
import { GLOSSARY } from '../src/data/glossary';
import { PEOPLE } from '../src/data/people';
import { featuredNote, notesFromDesk, noteById } from '../src/data/notes';
import { EPISODES, episodesNewestFirst } from '../src/data/podcast';
import { GBTD_BANKS, THIS_MONTH } from '../src/data/timeline';
import { laneFor, parseGoogleNewsRss } from '../src/modules/news';

describe('QntDesk encyclopedia contract', () => {
  it('keeps the QNT ERC-20 address unmodified', () => {
    expect(QNT_CONTRACT).toBe('0x4a220E6096B25EADb88358cb44068A3248254675');
  });

  it('retains sourced chapters, papers, cities, people, glossary and DYK', () => {
    expect(chapters.length).toBeGreaterThanOrEqual(40);
    expect(papers.length).toBe(48);
    expect(CITIES.length).toBe(17);
    expect(CITIES.every((c) => Boolean(c.photo))).toBe(true);
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

  it('files sourced quotations from people and the company', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(40);
    for (const q of quotes) {
      expect(sources[q.href], q.id).toMatch(/^https?:\/\//);
      expect(q.text.trim().length).toBeGreaterThan(8);
    }
    expect(quotes.some((q) => q.who.includes('Verdian'))).toBe(true);
    expect(quotes.some((q) => q.who.includes('Tasca'))).toBe(true);
    expect(quotes.some((q) => q.who.includes('Riley'))).toBe(true);
    expect(quotes.some((q) => q.who.includes('Hargreaves'))).toBe(true);
    expect(quotes.some((q) => q.who.includes('Rawel'))).toBe(true);
    expect(quotes.some((q) => q.who === 'Quant')).toBe(true);
    expect(quotes.some((q) => q.who === 'UK Finance')).toBe(true);
    expect(chapters.find((c) => c.id === 'not-l1')?.body).not.toMatch(/Hmm/);
  });

  it('lists the library newest first', () => {
    const list = papersNewestFirst();
    expect(list).toHaveLength(48);
    expect(paperYearKey(list[0])).toBeGreaterThanOrEqual(paperYearKey(list[list.length - 1]));
  });

  it('keeps September 2026 sourced notes on the record', () => {
    expect(THIS_MONTH.length).toBeGreaterThanOrEqual(5);
    const node = THIS_MONTH.find((n) => n.id === 'trusted-node');
    expect(node?.href).toBe('trustedNode');
    expect(sources.trustedNode).toContain('trusted-node-program');
    expect(sources.ukfDigitalMarketsPress).toContain('ukfinance.org.uk');
    expect(sources.hmtUkfSpeech).toContain('gov.uk');
    expect(chapters.some((c) => c.id === 'trusted-node')).toBe(true);
    expect(chapters.some((c) => c.id === 'uk-digital-markets')).toBe(true);
  });

  it('publishes sourced notes from DYK and this month', () => {
    const notes = notesFromDesk();
    expect(notes.length).toBeGreaterThanOrEqual(40);
    expect(noteById('not-cbdc')?.body.toLowerCase()).toContain('commercial');
    expect(featuredNote().id).toBe('trusted-node');
    expect(notesFromDesk()[0].id).toBe('trusted-node');
    const dated = notesFromDesk().filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n.dateLabel));
    const dates = dated.map((n) => n.dateLabel);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
    expect(notes.every((n) => n.body.trim().length > 20)).toBe(true);
    expect(notes.some((n) => n.era === 'history')).toBe(true);
    expect(notes.some((n) => n.era === 'present')).toBe(true);
    expect(notes.some((n) => n.era === 'future')).toBe(true);
  });

  it('ships a twenty-part podcast with named hosts and sourced quotes', () => {
    expect(EPISODES).toHaveLength(20);
    expect(episodesNewestFirst()[0].n).toBe(20);
    expect(EPISODES.some((e) => /Keep the names on it|Exactly\. Stay with that thread/.test(e.script))).toBe(
      false,
    );
    for (const ep of EPISODES) {
      expect(ep.script.trim().length).toBeGreaterThan(1400);
      expect(ep.hostName.length).toBeGreaterThan(3);
      expect(ep.hostTitle.length).toBeGreaterThan(3);
      expect(ep.quotes.length).toBeGreaterThan(0);
      for (const q of ep.quotes) {
        expect(q.who.trim().length).toBeGreaterThan(2);
        expect(q.role.trim().length).toBeGreaterThan(2);
        expect(q.text.trim().length).toBeGreaterThan(8);
      }
    }
  });
});

describe('Google News RSS parser', () => {
  it('extracts Quant headlines and grades market copy', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>Quant (QNT) Drops 4.47% Amid Broad Crypto Pullback - CoinMarketCap</title>
          <link>https://news.google.com/rss/articles/abc</link>
          <pubDate>Fri, 11 Sep 2026 12:00:00 GMT</pubDate>
          <source url="https://coinmarketcap.com">CoinMarketCap</source>
        </item>
        <item>
          <title>Unrelated soybean futures rally</title>
          <link>https://example.com/soy</link>
          <source>Example</source>
        </item>
        <item>
          <title>Quantinuum (QNT) Stock May Be Too Expensive</title>
          <link>https://example.com/quantinuum</link>
          <source>simplywall.st</source>
        </item>
        <item>
          <title>Overledger is not a twelfth blockchain</title>
          <link>https://example.net/ol</link>
          <source>Industry Desk</source>
        </item>
      </channel></rss>`;
    const items = parseGoogleNewsRss(xml);
    expect(items).toHaveLength(2);
    expect(items[0].lane).toBe('Markets');
    expect(items[1].title).toContain('Overledger');
    expect(laneFor('The Trusted Node Program', 'quant.network')).toBe('Official');
  });
});
