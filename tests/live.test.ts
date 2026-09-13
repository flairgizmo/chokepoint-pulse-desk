import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  OVERLEDGER_CHANGELOG,
  QUANT_FEED,
  SATP_ATOM,
  GNEWS_GBTD,
  GNEWS_SATP,
  GNEWS_SYNC,
  BOE_NEWS_RSS,
} from '../src/modules/liveSources';
import { parseAtomFeed, parseGoogleNewsRss, parseNamedRss } from '../src/modules/news';
import { renderHome, renderPeople, renderNews, renderTechnology, renderProgrammes, renderStandards, renderCbdc } from '../src/ui/views';
import { renderStory } from '../src/ui/pages';
import { chatMarkup } from '../src/ui/chat';
import { PROGRAMMES } from '../src/data/programmes';

describe('Live source URLs', () => {
  it('keeps the official Quant feed with a trailing slash', () => {
    expect(QUANT_FEED).toBe('https://quant.network/feed/');
    expect(OVERLEDGER_CHANGELOG).toContain('docs.overledger.dev');
    expect(SATP_ATOM).toContain('datatracker.ietf.org/group/satp');
    expect(GNEWS_GBTD).toContain('tokenised');
    expect(GNEWS_SATP).toContain('SATP');
    expect(GNEWS_SYNC).toContain('Synchronisation');
    expect(BOE_NEWS_RSS).toContain('bankofengland.co.uk');
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
  it('ships the bright Q mark, icon, motion beds, and lockup', () => {
    const svg = readFileSync('public/brand/qntdesk-mark.svg', 'utf8');
    expect(svg).toContain('#2F5BFF');
    expect(svg).toContain('#00D4AA');
    expect(svg).toContain('#EAF1FF');
    expect(existsSync('public/brand/qntdesk-lockup.jpg')).toBe(true);
    expect(existsSync('public/brand/qntdesk-icon.png')).toBe(true);
    expect(existsSync('public/brand/qntdesk-logo.png')).toBe(true);
    expect(existsSync('public/brand/qntdesk-og.jpg')).toBe(true);
    expect(existsSync('public/visuals/beds/hero.mp4')).toBe(true);
    expect(existsSync('public/visuals/beds/gateway.mp4')).toBe(true);
    expect(existsSync('public/visuals/stills/sterling.jpg')).toBe(true);
    expect(existsSync('public/people/verdian.jpg')).toBe(true);
    expect(existsSync('public/people/hargreaves.jpg')).toBe(true);
    expect(existsSync('public/people/riley.jpg')).toBe(true);
    expect(existsSync('public/people/yates.jpg')).toBe(true);
    expect(existsSync('public/people/ashton.jpg')).toBe(true);
    expect(existsSync('public/people/sentelidis.jpg')).toBe(true);
    expect(existsSync('public/people/chiriac.jpg')).toBe(true);
    expect(existsSync('public/people/rawel.jpg')).toBe(true);
    expect(existsSync('public/people/alves.jpg')).toBe(true);
    expect(existsSync('public/visuals/cities/london.jpg')).toBe(true);
    expect(existsSync('public/visuals/cities/paris.jpg')).toBe(true);
    expect(existsSync('public/visuals/cities/new-york.jpg')).toBe(true);
    expect(existsSync('public/marks/nationwide.svg')).toBe(true);
    expect(existsSync('public/marks/ukfinance.svg')).toBe(true);
    expect(existsSync('public/marks/linklaters.svg')).toBe(true);
  });
});

describe('Public desk', () => {
  it('puts the interactive Q mark and official bank marks on the home page', () => {
    const html = renderHome();
    expect(html).toContain('id="gateway"');
    expect(html).toContain('/marks/barclays.svg');
    expect(html).not.toContain('Nothing invented');
    expect(html).not.toContain('five minutes each');
    expect(html).toContain('data-home-pulse');
    expect(html).toContain('data-stage="proof"');
    expect(html).toContain('Lloyds Banking Group');
    expect(html).toContain('/marks/lloyds.svg');
    expect(html).toContain('/marks/nationwide.svg');
    expect(html).toContain('/marks/ukfinance.svg');
    expect(html).toContain('/marks/ey.svg');
    expect(html).not.toContain('This chip is a stage');
    expect(html).not.toContain('The scarce resource is not another chain');
    expect(html).not.toContain('Orbit the Q');
    expect(html).toContain('layer-still');
    expect(html).toContain('/visuals/topics/payments.jpg');
    expect(html).toContain('/visuals/topics/canary.jpg');
  });

  it('opens people and news as in-site stages, with original as secondary', () => {
    const people = renderPeople();
    expect(people).toContain('/people/verdian.jpg');
    expect(people).toContain('https://quant.network/people/gilbert-verdian/');
    expect(people).toContain('people-rail');
    expect(people).toContain('/people/tasca.jpg');
    expect(people).toContain('/people/ashton.jpg');
    expect(people).toContain('/people/sentelidis.jpg');
    expect(people).toContain('Builders of the interoperability layer');
    expect(people).not.toContain('Highest-resolution stills from Quant’s own media library');
    expect(people).not.toContain('People who worked on Overledger');
    const news = renderNews();
    expect(people).toContain('Open original');
    expect(news).toContain('briefing');
    expect(news).not.toContain('Click a headline and you leave for the source');
    expect(news).not.toContain('Ctrl+K');
    expect(renderTechnology()).toContain('Overledger Platform / API');
    expect(renderStory()).toContain('story-rail');
    expect(renderStory()).toContain('data-story-theme');
    expect(renderProgrammes()).toContain('Programme cockpit');
    expect(renderProgrammes()).toContain('data-stage="programme"');
    expect(PROGRAMMES.some((p) => p.id === 'gbtd' && p.status === 'active')).toBe(true);
    expect(renderStandards()).toContain('data-stage="satp"');
    expect(renderStandards()).not.toMatch(/data-stage="[0-3]"/);
    expect(renderCbdc()).toContain('data-stage="money"');
    expect(renderCbdc()).toContain('cbdc-model');
    const grok = chatMarkup();
    expect(grok).toContain('aria-label="Ask Grok"');
    expect(grok).toContain('sr-only');
    expect(`${renderPeople()}${renderNews()}${renderProgrammes()}`).not.toContain('leave for the source');
  });
});
