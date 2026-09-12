import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  OVERLEDGER_CHANGELOG,
  QUANT_FEED,
  SATP_ATOM,
} from '../src/modules/liveSources';
import { parseAtomFeed, parseGoogleNewsRss, parseNamedRss } from '../src/modules/news';

describe('Live source URLs', () => {
  it('keeps the official Quant feed with a trailing slash', () => {
    expect(QUANT_FEED).toBe('https://quant.network/feed/');
    expect(OVERLEDGER_CHANGELOG).toContain('docs.overledger.dev');
    expect(SATP_ATOM).toContain('datatracker.ietf.org/group/satp');
  });
});

describe('Official and standards parsers', () => {
  it('files a Quant perspective without requiring the words Quant Network in the title', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>The Trusted Node Program: Who's processing your transaction?</title>
          <link>https://quant.network/perspectives/the-trusted-node-program/</link>
          <pubDate>Thu, 10 Sep 2026 13:51:32 +0000</pubDate>
        </item>
      </channel></rss>`;
    const items = parseNamedRss(xml, { source: 'Quant', lane: 'Official', requireMatch: false });
    expect(items).toHaveLength(1);
    expect(items[0].lane).toBe('Official');
    expect(items[0].source).toBe('Quant');
    expect(items[0].title).toContain("Who's processing");
  });

  it('decodes numeric entities and drops convert-widget spam', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>The Trusted Node Program: Who&#8217;s processing your transaction?</title>
          <link>https://quant.network/perspectives/x</link>
          <source>Quant Network</source>
        </item>
        <item>
          <title>Convert 5 QNT (QNT) to CHF (Swiss Franc) - Bybit</title>
          <link>https://example.com/fx</link>
          <source>Bybit</source>
        </item>
      </channel></rss>`;
    const items = parseGoogleNewsRss(xml);
    expect(items).toHaveLength(1);
    expect(items[0].title).toMatch(/Who.s processing/);
    expect(items[0].title).not.toContain('&#8217;');
  });

  it('resolves relative IETF SATP Atom links', () => {
    const xml = `<?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>Secure Asset Transfer Protocol (SATP) Core</title>
          <link href="/doc/draft-ietf-satp-core/"/>
          <updated>2026-09-03T02:01:10Z</updated>
        </entry>
      </feed>`;
    const items = parseAtomFeed(xml, {
      source: 'IETF SATP',
      lane: 'Industry',
      linkBase: 'https://datatracker.ietf.org',
    });
    expect(items).toHaveLength(1);
    expect(items[0].url).toBe('https://datatracker.ietf.org/doc/draft-ietf-satp-core/');
    expect(items[0].source).toBe('IETF SATP');
  });
});

describe('Brand mark', () => {
  it('ships a cobalt-and-mint SVG mark plus a raster logo', () => {
    const svg = readFileSync('public/brand/qntdesk-mark.svg', 'utf8');
    expect(svg).toContain('#2F5BFF');
    expect(svg).toContain('#00D4AA');
    expect(existsSync('public/brand/qntdesk-logo.png')).toBe(true);
    expect(existsSync('public/brand/qntdesk-og.png')).toBe(true);
    expect(existsSync('public/brand/grok-mark.svg')).toBe(true);
  });
});
