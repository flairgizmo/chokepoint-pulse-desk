import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INSTITUTIONS } from '../src/data/institutions';
import { papers } from '../src/data/catalog';
import { motionBedFor, plateFor, PLATES } from '../src/data/plates';
import { STORY } from '../src/data/story';
import { TECH } from '../src/data/tech';
import { searchHitButton, searchMarkup } from '../src/ui/search';
import { diagramFigure, cinemaNavLink } from '../src/ui/diagrams';
import { chatMarkup } from '../src/ui/chat';
import { renderInstitutions, renderPatents, renderStack, renderStory } from '../src/ui/pages';
import {
  renderCbdc,
  renderCity,
  renderDonate,
  renderGlossary,
  renderHome,
  renderMarkets,
  renderNews,
  renderNotFound,
  renderNotes,
  renderPeople,
  renderPodcast,
  renderProgrammes,
  renderRead,
  renderResearch,
  renderStandards,
  renderTechnology,
  renderVision,
  venueBarsHtml,
} from '../src/ui/views';
import { FILM_BACKDROPS, FILM_SETS } from '../src/ui/filmSets';
import { cityById } from '../src/data/cities';

describe('Topic plates', () => {
  it('does not collapse untitled news seeds onto the Reuters still', () => {
    expect(plateFor('ukf-roadmap', 'news', 'present').src).toBe(PLATES.canary.src);
    expect(plateFor('hmt-digit', 'news', 'present').src).toBe(PLATES.future.src);
    const srcs = [
      plateFor('ukf-roadmap', 'news', 'present').src,
      plateFor('hmt-digit', 'news', 'present').src,
      plateFor('ukf-report', 'news', 'present').src,
      plateFor('sibos-miami-note', 'news', 'present').src,
      plateFor('trusted-node', 'news', 'present').src,
    ];
    expect(srcs).not.toContain(PLATES.newsroom.src);
    expect(new Set(srcs).size).toBeGreaterThanOrEqual(4);
    expect(plateFor('vision').src).toBe(PLATES.ucl.src);
  });

  it('keeps named programmes on distinct stills', () => {
    const srcs = ['gbtd', 'rln', 'murex', 'oracle', 'basel', 'sync-lab', 'lacchain', 'dentsu'].map(
      (id) => plateFor(id, 'programme').src,
    );
    expect(new Set(srcs).size).toBeGreaterThanOrEqual(6);
    expect(plateFor('lacchain').src).toBe(PLATES.miami.src);
    expect(plateFor('oracle').src).toBe(PLATES.washington.src);
    expect(renderProgrammes()).toContain('/visuals/topics/canary.jpg');
    expect(renderProgrammes()).toContain('/visuals/cities/paris.jpg');
    expect(renderProgrammes()).toContain('/visuals/cities/frankfurt.jpg');
    expect(renderProgrammes()).toContain('/visuals/cities/miami.jpg');
    expect(renderProgrammes()).toContain('/visuals/cities/tokyo.jpg');
  });

  it('maps Vision and essays to real photographs, not leftover SVGs', () => {
    expect(plateFor('vision').src).toBe(PLATES.ucl.src);
    expect(plateFor('philosophy').src).toBe(PLATES.fiber.src);
    expect(plateFor('gbtd').src).toBe(PLATES.canary.src);
    expect(plateFor('standards').src).toBe(PLATES.geneva.src);
    expect(plateFor('essay-future').src).toBe(PLATES.future.src);
    const fig = diagramFigure('essay-philosophy', 'chapter', 'Philosophy');
    expect(fig).toContain('/visuals/topics/fiber.jpg');
    expect(fig).not.toContain('<svg');
  });

  it('keeps instrument SVGs for people, patents, SATP and quotes', () => {
    expect(diagramFigure('verdian', 'person', 'GV')).toContain('<svg');
    expect(diagramFigure('patent-us', 'patent', 'US11842335B2')).toContain('CLAIM SEQUENCE');
    expect(diagramFigure('satp-3', 'satp', '2PC')).toContain('2PC');
    expect(diagramFigure('q1', 'quote', 'Verdian')).toContain('“');
  });

  it('ships the topic JPEGs used on Vision', () => {
    for (const file of ['ucl.jpg', 'fiber.jpg', 'canary.jpg', 'city.jpg', 'library.jpg', 'exchange.jpg', 'datacenter.jpg', 'cable.jpg', 'payments.jpg', 'radio.jpg', 'newsroom.jpg', 'patents-hall.jpg']) {
      const path = resolve(process.cwd(), 'public/visuals/topics', file);
      expect(existsSync(path), file).toBe(true);
    }
    expect(statSync(resolve(process.cwd(), 'public/visuals/topics/canary.jpg')).size).toBeGreaterThan(200_000);
    expect(statSync(resolve(process.cwd(), 'public/visuals/topics/ucl.jpg')).size).toBeGreaterThan(200_000);
    expect(statSync(resolve(process.cwd(), 'public/visuals/topics/cable.jpg')).size).toBeGreaterThan(200_000);
    expect(statSync(resolve(process.cwd(), 'public/visuals/topics/datacenter.jpg')).size).toBeGreaterThan(200_000);
    expect(statSync(resolve(process.cwd(), 'public/visuals/earth/day.jpg')).size).toBeGreaterThan(100_000);
    expect(statSync(resolve(process.cwd(), 'public/visuals/earth/night.jpg')).size).toBeGreaterThan(80_000);
  });

  it('maps technology and story beats to distinct photographs', () => {
    expect(plateFor('connectors').src).toBe(PLATES.frankfurt.src);
    expect(plateFor('satp').src).toBe(PLATES.geneva.src);
    expect(plateFor('whitepaper-2018').src).toBe(PLATES.ucl.src);
    expect(plateFor('gbtd-2025').src).toBe(PLATES.canary.src);
    expect(plateFor('murex-2026').src).toBe(PLATES.paris.src);
    expect(plateFor('x402').src).toBe(PLATES.fiber.src);
    expect(plateFor('fusion').src).toBe(PLATES.cityDay.src);
    expect(plateFor('quantnet').src).toBe(PLATES.city.src);
    expect(plateFor('overledger-network').src).toBe(PLATES.cable.src);
    expect(plateFor('connectors').src).not.toBe(plateFor('overledger-network').src);
  });

  it('gives constellation doors and technology chapters distinct rooms', () => {
    const doors = [
      'Overledger',
      'PayScript',
      'GBTD',
      'SATP',
      '2018 paper',
      'Fusion',
      'x402',
      'Quant',
      'Docs',
      '@quantnetwork',
      '@OverledgerDev',
      '@gverdian',
    ].map((label) => plateFor(`door-${label}`).src);
    expect(new Set(doors).size).toBe(12);
    const tech = TECH.map((t) => plateFor(t.id).src);
    expect(new Set(tech).size).toBe(TECH.length);
    expect(plateFor('quantnet').src).toBe(PLATES.city.src);
    expect(plateFor('murex-2026').src).toBe(PLATES.paris.src);
    expect(new Set(STORY.map((e) => plateFor(e.id).src)).size).toBeGreaterThanOrEqual(20);
  });

  it('sits official portraits on distinct dusk stills, not one shared CERN floor', () => {
    expect(plateFor('verdian').src).toBe(PLATES.ucl.src);
    expect(plateFor('tasca').src).toBe(PLATES.boston.src);
    expect(plateFor('heads').src).toBe(PLATES.canaryDay.src);
    expect(plateFor('board').src).toBe(PLATES.cityDay.src);
  });

  it('maps each city id to that city’s Wikimedia still', () => {
    expect(plateFor('london').src).toBe('/visuals/cities/london.jpg');
    expect(plateFor('geneva').src).toBe('/visuals/cities/geneva.jpg');
    expect(plateFor('basel').src).toBe('/visuals/cities/basel.jpg');
    expect(plateFor('new-york').src).toBe('/visuals/cities/new-york.jpg');
    expect(plateFor('hong-kong').src).toBe('/visuals/cities/hong-kong.jpg');
  });

  it('puts related photographs on the Vision essays', () => {
    const html = renderVision();
    expect(html).toContain('/visuals/topics/ucl.jpg');
    expect(html).toContain('/visuals/topics/fiber.jpg');
    expect(html).toContain('cinema-hero');
    expect(html).toContain('hero-plate');
    expect(html).toContain('hero-still');
    expect(html).toContain('hero-wash');
    expect(html).toContain('cinema-letterbox');
    expect(html).toContain('cinema-grain');
    expect(html).not.toContain('hero-bed');
    const header = html.match(/<header class="page-hero[\s\S]*?<\/header>/)?.[0] ?? '';
    expect(header).toContain('hero-kicker-copy');
    expect(header.match(/class="kicker"/g)?.length).toBe(1);
    expect(header.indexOf('hero-kicker-copy')).toBeLessThan(header.indexOf('<h1 class="display">'));
  });

  it('overlays the kicker on film stages when the page has no hero plate', () => {
    const story = renderStory().match(/<header class="page-hero[\s\S]*?<\/header>/)?.[0] ?? '';
    expect(story).toContain('hero-kicker-copy');
    expect(story).toContain('id="film-stage"');
    expect(story).not.toContain('hero-plate');
    expect(story.match(/class="kicker"/g)?.length).toBe(1);
    const city = renderCity(cityById('geneva')!).match(/<header class="page-hero[\s\S]*?<\/header>/)?.[0] ?? '';
    expect(city).toContain('hero-kicker-copy');
    expect(city).toContain('data-film-set="city:geneva"');
    expect(renderStack()).toContain('hero-kicker-copy');
  });

  it('keeps unique city stills on city pages and does not cover them with a bed', () => {
    expect(motionBedFor('geneva')).toBeUndefined();
    expect(motionBedFor('hong-kong')).toBeUndefined();
    const geneva = cityById('geneva');
    expect(geneva).toBeTruthy();
    const cityHtml = renderCity(geneva!);
    expect(cityHtml).toContain('/visuals/cities/geneva.jpg');
    expect(cityHtml).toContain('id="film-stage"');
    expect(cityHtml).toContain('data-film-set="city:geneva"');
    expect(cityHtml).not.toContain('hero-bed');
  });

  it('prints official portraits as full-bleed cinema posters', () => {
    const html = renderPeople();
    expect(html).toContain('cinema-poster');
    expect(html).toContain('people-face');
    expect(html).toContain('/people/verdian.jpg');
    expect(html).toContain('/people/tasca.jpg');
    expect(html).toContain('still-strip');
    expect(html).toContain('is-portraits');
    expect(html).toContain('cinema-letterbox');
    expect(html).not.toContain('people-bed');
    expect(html).not.toContain('hero-bed');
  });

  it('stands the exploded stack on a film stage with real stills', () => {
    const html = renderStack();
    expect(html).toContain('id="stack-stage"');
    expect(html).toContain('cinema-letterbox');
    expect(html).toContain('/visuals/topics/fiber.jpg');
    expect(html).toContain('/visuals/topics/cable.jpg');
    expect(html).not.toContain('hero-bed');
  });

  it('stands a WebGL film stage on story, programmes and research', () => {
    expect(renderStory()).toContain('id="film-stage"');
    expect(renderStory()).toContain('data-film-set="story"');
    expect(renderProgrammes()).toContain('id="film-stage"');
    expect(renderProgrammes()).toContain('data-film-set="programmes"');
    expect(renderResearch()).toContain('id="film-stage"');
    expect(renderResearch()).toContain('data-film-set="research"');
    expect(renderStory()).not.toContain('hero-bed');
    expect(FILM_BACKDROPS.story).toBe(PLATES.history.src);
    expect(FILM_SETS.story.map((s) => s.src)).toEqual([
      PLATES.geneva.src,
      PLATES.ucl.src,
      PLATES.canary.src,
      PLATES.boeFacade.src,
      PLATES.paris.src,
    ]);
  });

  it('keeps the patent claim SVG and adds a hall photograph above it', () => {
    const html = renderPatents();
    expect(html).toContain('/visuals/topics/patents-hall.jpg');
    expect(html).toContain('CLAIM SEQUENCE');
    expect(html).toContain('still-strip');
    expect(html).not.toContain('hero-bed');
  });

  it('puts a Vision still-strip on the remaining film pages', () => {
    expect(renderInstitutions()).toContain('still-strip');
    expect(renderInstitutions()).toContain('/visuals/cities/geneva.jpg');
    expect(renderGlossary()).toContain('still-strip');
    expect(renderGlossary()).toContain('/visuals/topics/ucl.jpg');
    expect(renderMarkets()).toContain('still-strip');
    expect(renderMarkets()).toContain('/visuals/topics/exchange.jpg');
    expect(renderNews()).toContain('still-strip');
    expect(renderNews()).toContain('briefing');
    expect(renderDonate()).toContain('still-strip');
    expect(renderDonate()).toContain('/visuals/topics/fiber.jpg');
    expect(renderPodcast()).toContain('still-strip');
    expect(renderPodcast()).toContain('/visuals/topics/radio.jpg');
    expect(renderPodcast()).toContain('pod-still');
    expect(renderPodcast()).toContain('series-dot');
    expect(renderPodcast()).toContain('class="series-dot is-on"');
    expect(renderPodcast()).toContain('/podcast/stills/');
    expect(renderPodcast()).toContain('/visuals/stills/future.jpg');
    expect(renderPodcast()).toContain('/visuals/stills/gateway.jpg');
    expect(renderPodcast()).toContain('/visuals/topics/city.jpg');
    expect(renderPodcast()).toContain('/visuals/topics/payments.jpg');
    expect(renderPodcast()).toContain('player-ctrl-still');
    expect(renderPodcast()).toContain('player-adj-still');
    expect(renderHome()).toContain('still-strip');
    expect(renderHome()).toContain('live-news-still');
    expect(renderHome()).toContain('/visuals/cities/paris.jpg');
    expect(renderCbdc()).toContain('still-strip');
    expect(renderCbdc()).toContain('liability-still');
    expect(renderCbdc()).toContain('/visuals/topics/payments.jpg');
    expect(renderCbdc()).toContain('/visuals/topics/exchange.jpg');
    expect(renderMarkets()).toContain('token-still');
    expect(renderMarkets()).toContain('/visuals/topics/fiber.jpg');
    expect(renderMarkets()).toContain('/visuals/topics/datacenter.jpg');
    const venues = venueBarsHtml({
      status: 'live',
      venue: 'CoinGecko',
      priceUsd: 1,
      change24h: 0,
      volume24h: 1,
      high24h: 1,
      low24h: 1,
      marketCap: 1,
      circulating: 1,
      totalSupply: 1,
      ath: 1,
      atl: 1,
      sparkline: [],
      tickers: [
        { name: 'Binance', volume: 10 },
        { name: 'Coinbase Exchange', volume: 6 },
        { name: 'Kraken', volume: 3 },
      ],
      updated: null,
    });
    expect(venues).toContain('venue-bar-still');
    expect(venues).toContain('cinema-bar');
    expect(venues).toContain('Binance');
    expect(venues).toContain('/visuals/cities/hong-kong.jpg');
    expect(venues).toContain('/visuals/cities/new-york.jpg');
    expect(venues).toContain('/visuals/topics/city.jpg');
    expect(searchHitButton({ stageKind: 'term', id: 'overledger', kind: 'Glossary', title: 'Overledger', sub: 'Gateway OS' })).toContain(
      '/visuals/',
    );
    expect(searchHitButton({ stageKind: 'person', id: 'verdian', kind: 'People', title: 'Gilbert Verdian', sub: 'CEO' })).toContain(
      '/people/verdian.jpg',
    );
    expect(renderStandards()).toContain('still-strip');
    expect(renderStandards()).toContain('treaty-still');
    expect(renderStandards()).toContain('satp-still');
    expect(renderStandards()).toContain('acid-still');
    expect(renderStandards()).toContain('/visuals/cities/geneva.jpg');
    expect(renderStandards()).toContain('/visuals/topics/fiber.jpg');
    expect(renderStandards()).toContain('/visuals/topics/canary.jpg');
    expect(renderStandards()).toContain('/visuals/topics/ucl.jpg');
    expect(renderProgrammes()).toContain('still-strip');
    expect(renderVision()).toContain('dyk-still');
    expect(renderVision()).toContain('/visuals/topics/payments.jpg');
    expect(renderVision()).toContain('/visuals/topics/datacenter.jpg');
    expect(renderVision()).toContain('/visuals/topics/city.jpg');
    expect(renderVision()).toContain('/visuals/topics/ucl.jpg');
  });

  it('paints remaining chrome with unique Vision stills', () => {
    const nav = [
      'news',
      'story',
      'technology',
      'people',
      'stack',
      'programmes',
      'institutions',
      'patents',
      'cbdc',
      'markets',
      'research',
      'standards',
      'glossary',
      'podcast',
      'vision',
      'donate',
    ];
    expect(new Set(nav.map((id) => plateFor(`nav-${id}`).src)).size).toBe(16);
    expect(cinemaNavLink('/podcast', 'Podcast')).toContain('/visuals/topics/radio.jpg');
    expect(cinemaNavLink('/vision', 'Vision')).toContain('/visuals/topics/fiber.jpg');
    expect(cinemaNavLink('/cbdc', 'CBDC')).toContain('/visuals/cities/zurich.jpg');
    expect(renderTechnology()).toContain('spine-still');
    expect(renderHome()).toContain('wm-still');
    expect(renderHome()).toContain('/visuals/topics/city.jpg');
    expect(chatMarkup()).toContain('grok-still');
    expect(chatMarkup()).toContain('aria-label="Ask Grok"');
    expect(renderDonate()).toContain('donate-code-still');
    expect(renderDonate()).toContain('/visuals/cities/hong-kong.jpg');
    expect(renderDonate()).toContain('0xFcAD8838195Bdf03dB09999a0E289bf45D6F3FFD');
    expect(renderVision()).toContain('flip-back-still');
    expect(renderVision()).toContain('pull-still');
    expect(renderNews()).toContain('filter-still');
    expect(renderGlossary()).toContain('filter-still');
    expect(renderGlossary()).toContain('letter-still');
    expect(renderStory()).toContain('filter-still');
    expect(renderTechnology()).toContain('filter-still');
    expect(renderResearch()).toContain('id="research-regions"');
    expect(renderResearch()).toContain('id="research-kinds"');
    expect(renderResearch()).toContain('cinema-filter');
    expect(renderMarkets()).toContain('stats-strip');
    expect(renderMarkets()).toContain('spark-strip');
    expect(renderMarkets()).toContain('float-strip');
    expect(renderNews()).toContain('news-tape-strip');
    expect(renderNotes()).toContain('count-strip');
    expect(renderStory()).toContain('count-strip');
    expect(renderStandards()).toContain('stage-body');
    expect(renderCbdc()).toContain('Who owes it.');
    expect(renderProgrammes()).toContain('fold-still');
    expect(renderProgrammes()).toContain('prog-tech');
    expect(renderStack()).toContain('cinema-filter');
    expect(renderStack()).toContain('data-stack-all');
    expect(renderCity(cityById('london')!)).toContain('coord-strip');
    expect(plateFor('filter-news-filter').src).toBe(PLATES.newsroom.src);
    expect(plateFor('filter-gloss-search').src).toBe(PLATES.cambridge.src);
    expect(plateFor('chips-research-regions').src).toBe(PLATES.geneva.src);
    expect(plateFor('chips-stack-tools').src).toBe(PLATES.datacenter.src);
    expect(plateFor('mk-spark').src).toBe(PLATES.fiber.src);
    expect(plateFor('mk-float').src).toBe(PLATES.city.src);
    expect(plateFor('wire-head').src).toBe(PLATES.newsroom.src);
    expect(plateFor('count-story').src).toBe(PLATES.brussels.src);
    expect(plateFor('lloyds-bank').src).toBe(PLATES.royal.src);
    expect(plateFor('wm-lloyds-bank').src).toBe(PLATES.paris.src);
    expect(plateFor('wm-nationwide').src).toBe(PLATES.singapore.src);
    expect(plateFor('wm-barclays').src).toBe(PLATES.city.src);
    expect(renderHome()).toContain('intro-still');
    expect(renderHome()).toContain('A gateway OS</h2><p>Overledger connects');
    expect(renderVision()).toContain('The 2018 problem</h3><p>The UCL Discovery');
    expect(renderVision()).toContain('intro-still');
    expect(renderNews()).toContain('intro-still');
    expect(renderStandards()).toContain('intro-still');
    expect(renderPeople()).toContain('intro-still');
    expect(renderStory()).toContain('story-keys');
    expect(renderMarkets()).toContain('class="mono contract"');
    expect(renderProgrammes()).toContain('cohort-note');
    expect(plateFor('intro-calendar').src).toBe(PLATES.miami.src);
    expect(plateFor('intro-month').src).toBe(PLATES.canary.src);
    expect(plateFor('intro-satp').src).toBe(PLATES.geneva.src);
    expect(plateFor('intro-voices').src).toBe(PLATES.radio.src);
    expect(plateFor('story-keys').src).toBe(PLATES.history.src);
    expect(plateFor('cohort-home').src).toBe(PLATES.canaryDay.src);
    expect(plateFor('cohort-programmes').src).toBe(PLATES.payments.src);
    expect(plateFor('mk-contract').src).toBe(PLATES.datacenter.src);
    expect(plateFor('group-c-suite').src).toBe(PLATES.ucl.src);
    expect(renderHome()).toContain('2015</span><h3>');
    expect(renderPodcast()).toContain('intro-still');
    expect(renderPodcast()).toContain('player-byline');
    expect(renderPatents()).toContain('patent-still');
    expect(plateFor('mk-burn').src).toBe(PLATES.cable.src);
    expect(plateFor('intro-pod-quotes').src).toBe(PLATES.history.src);
    expect(plateFor('player-byline').src).toBe(PLATES.newsroom.src);
    expect(renderPeople()).toContain('person-bio-still');
    expect(renderDonate()).toContain('The only published addresses</h2><p>QNT token');
    expect(renderCity(cityById('london')!)).toContain('United Kingdom</p><h2>London</h2><p>');
    expect(chatMarkup()).toContain('grok-welcome-still');
    expect(renderHome()).toContain('Discover Stage');
    expect(plateFor('grok-welcome').src).toBe(PLATES.library.src);
    expect(plateFor('news-lane-official').src).toBe(PLATES.newsroom.src);
    expect(plateFor('news-lane-markets').src).toBe(PLATES.exchange.src);
    expect(plateFor('news-lane-industry').src).toBe(PLATES.city.src);
    expect(renderTechnology()).toContain('summary-still');
    expect(renderProgrammes()).toContain('summary-still');
    expect(renderPeople()).toContain('summary-still');
    expect(renderResearch()).toContain('summary-still');
    expect(renderTechnology()).toContain('>Chapter</span>');
    expect(renderProgrammes()).toContain('>Filing</span>');
    expect(renderPeople()).toContain('>Record</span>');
    expect(renderResearch()).toContain('>What the document says</span>');
    expect(renderMarkets()).toContain('source-strip');
    expect(plateFor('source-tokenomics').src).toBe(PLATES.exchange.src);
    expect(renderDonate()).toContain('Published recipients');
    expect(renderDonate()).toContain('donate-usdt-still');
    expect(plateFor('intro-donate-list').src).toBe(PLATES.canaryDay.src);
    expect(renderCity(cityById('london')!)).toContain('source-strip');
    expect(renderTechnology()).toContain('tech-cell-still');
    expect(renderResearch()).toContain('door-still');
    expect(renderHome()).toContain('door-still');
    expect(renderHome()).toContain('dyk-answer-still');
    expect(renderHome()).toContain('Vision →');
    expect(plateFor('cta-story').src).toBe(PLATES.history.src);
    expect(renderDonate()).toContain('Do not send funds');
    expect(renderDonate()).toContain('warn-strip');
    expect(plateFor('donate-warn').src).toBe(PLATES.exchange.src);
    expect(renderCity(cityById('london')!)).toContain('← Earth');
    expect(plateFor('back-earth').src).toBe(PLATES.city.src);
    expect(plateFor('back-library').src).toBe(PLATES.library.src);
    expect(plateFor('back-wire').src).toBe(PLATES.newsroom.src);
    expect(renderRead('overledger-2018')).toContain('← Library');
    expect(renderRead('overledger-2018')).toContain('Open the original');
    expect(renderNotFound()).toContain('mast-strip');
    expect(plateFor('notfound-mast').src).toBe(PLATES.gateway.src);
    expect(chatMarkup()).toContain('data-grok-prompt');
    expect(chatMarkup()).toContain('/visuals/cities/cambridge.jpg');
    expect(plateFor('grok-chips').src).toBe(PLATES.cambridge.src);
    expect(renderHome()).toContain('Open the source');
    expect(renderPeople()).toContain('person-cta');
    expect(renderPeople()).toContain('Monogram only');
    expect(renderHome()).toContain('mast-strip');
    expect(renderHome()).toContain('See how the gate works');
    expect(plateFor('home-cta').src).toBe(PLATES.fiber.src);
    expect(plateFor('market-bar').src).toBe(PLATES.exchange.src);
    expect(plateFor('intro-foot').src).toBe(PLATES.hero.src);
    expect(plateFor('foot-disclaimer').src).toBe(PLATES.library.src);
    expect(plateFor('foot-voices').src).toBe(PLATES.radio.src);
    expect(plateFor('story-suggest').src).toBe(PLATES.newsroom.src);
    expect(cinemaNavLink('/news', 'News', true)).toContain('aria-current="page"');
    expect(cinemaNavLink('/news', 'News', true)).toContain('/visuals/topics/newsroom.jpg');
    expect(searchMarkup()).toContain('id="desk-search-input"');
    expect(searchMarkup()).toContain('filter-still');
    expect(searchMarkup()).toContain('/visuals/topics/library.jpg');
    expect(
      searchHitButton({ stageKind: 'term', id: 'overledger', kind: 'Glossary', title: 'Overledger', sub: 'Gateway OS' }),
    ).toContain('poster-frame');
    expect(plateFor('search-input').src).toBe(PLATES.library.src);
    expect(plateFor('nav-search').src).toBe(PLATES.library.src);
    expect(plateFor('nav-more').src).toBe(PLATES.tokyo.src);
    expect(plateFor('chip-qnt').src).toBe(PLATES.exchange.src);
    expect(plateFor('stage-crumb').src).toBe(PLATES.history.src);
    expect(plateFor('grok-form').src).toBe(PLATES.radio.src);
    expect(chatMarkup()).toContain('id="grok-form"');
    expect(chatMarkup()).toContain('grok-ask-strip');
    expect(plateFor('hud-earth').src).toBe(PLATES.city.src);
    expect(plateFor('hud-overlays').src).toBe(PLATES.fiber.src);
    expect(plateFor('hud-tools').src).toBe(PLATES.datacenter.src);
    expect(renderHome()).toContain('nav-still');
    expect(renderHome()).toContain('id="city-select"');
    expect(renderHome()).toMatch(/hud-card[\s\S]{0,500}\/visuals\/topics\/city\.jpg/);
    expect(renderHome()).toMatch(/hud-more[\s\S]{0,400}\/visuals\/topics\/fiber\.jpg/);
    expect(renderHome()).toMatch(/hud-tools[\s\S]{0,400}\/visuals\/topics\/datacenter\.jpg/);
  });

  it('keeps year-suffixed keys and does not collapse SATP drafts onto Geneva', () => {
    expect(plateFor('murex-2026').src).toBe(PLATES.paris.src);
    expect(plateFor('quantnet', 'programme').src).toBe(PLATES.city.src);
    expect(plateFor('connectors').src).toBe(PLATES.frankfurt.src);
    expect(plateFor('essay-future').src).toBe(PLATES.future.src);
    expect(plateFor('satp-arch', 'paper-standards', '2023').src).not.toBe(PLATES.geneva.src);
    expect(plateFor('satp-adapt', 'paper-standards', '2023').src).not.toBe(
      plateFor('satp-core', 'paper-standards', '2023').src,
    );
    const hashed = ['satp-draft-zz', 'satp-other-yy', 'satp-alpha-01', 'satp-beta-02', 'satp-gamma-03', 'satp-delta-04', 'satp-epsilon-05', 'satp-zeta-06'].map(
      (id) => plateFor(id, 'paper-standards', '2024').src,
    );
    expect(new Set(hashed).size).toBeGreaterThanOrEqual(6);
  });

  it('spreads research, glossary and notes across distinct photographs', () => {
    const srcs = (html: string) => [...html.matchAll(/src="(\/visuals\/[^"]+\.jpg)"/g)].map((m) => m[1]);
    expect(new Set(srcs(renderResearch())).size).toBeGreaterThanOrEqual(16);
    expect(new Set(srcs(renderGlossary())).size).toBeGreaterThanOrEqual(28);
    expect(new Set(srcs(renderNews())).size).toBeGreaterThanOrEqual(10);
    expect(new Set(srcs(renderNotes())).size).toBeGreaterThanOrEqual(18);
    expect(plateFor('overledger-2018').src).toBe(PLATES.ucl.src);
    expect(plateFor('mondelli-thesis-2017').src).toBe(PLATES.lisbon.src);
    expect(plateFor('cbdc', 'CBDC').src).toBe(PLATES.zurich.src);
    expect(plateFor('satp-arch', 'paper-standards').src).not.toBe(PLATES.geneva.src);
    expect(plateFor('internet-of-value').src).toBe(PLATES.fiber.src);
    expect(plateFor('overledger-gateway').src).toBe(PLATES.gateway.src);
    expect(plateFor('home-interop').src).toBe(PLATES.fiber.src);
    expect(plateFor('home-standards').src).toBe(PLATES.brussels.src);
    expect(plateFor('linux').src).toBe(PLATES.fiber.src);
    expect(plateFor('hyperledger').src).toBe(PLATES.datacenter.src);
    expect(plateFor('vocalink').src).toBe(PLATES.newsroom.src);
    expect(new Set(papers.map((p) => plateFor(p.id).src)).size).toBeGreaterThanOrEqual(36);
    expect(plateFor('iso-23516').src).not.toBe(plateFor('satp-core').src);
    expect(plateFor('boe-lab').src).toBe(PLATES.london.src);
    expect(plateFor('x402').src).toBe(PLATES.fiber.src);
    expect(plateFor('binance').src).toBe(PLATES.hongkong.src);
    expect(plateFor('coinbase-exchange').src).toBe(PLATES.newyork.src);
    expect(plateFor('kraken').src).toBe(PLATES.city.src);
    expect(
      new Set(
        ['icrypex', 'bitdelta', 'bvox', 'hotcoin', 'bitvavo', 'phemex', 'websea', 'binance', 'coinbase-exchange', 'kraken'].map(
          (id) => plateFor(id).src,
        ),
      ).size,
    ).toBe(10);
    const inst = INSTITUTIONS.map((i) => plateFor(i.id, 'institution').src);
    expect(new Set(inst).size).toBeGreaterThanOrEqual(20);
    const pods = [...renderPodcast().matchAll(/class="pod-still"[^>]*src="(\/visuals\/[^"]+)"/g)].map((m) => m[1]);
    expect(new Set(pods).size).toBeGreaterThanOrEqual(18);
  });
});
