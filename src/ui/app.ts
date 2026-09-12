import { papers, quotes, didYouKnow, QNT_CONTRACT } from '../data/catalog';
import { notesFromDesk } from '../data/notes';
import { CITIES } from '../data/cities';
import { PEOPLE } from '../data/people';
import { GLOSSARY } from '../data/glossary';
import { fetchMarkets, staleCache, type MarketPrint } from '../modules/markets';
import { fetchNews, type NewsRiver } from '../modules/news';
import type { EarthGlobe } from './globe';
import { chatMarkup, wireChat } from './chat';
import { wirePlayer } from './player';
import { mountTesseract } from './tesseract';
import { esc, fmtCompact, fmtMoney, fmtPct } from './html';
import {
  DISCLAIMER,
  renderCbdc,
  renderCity,
  renderDonate,
  renderGlossary,
  renderHome,
  renderMarkets,
  renderEpisode,
  renderNews,
  renderNote,
  renderNotes,
  renderNotFound,
  renderPodcast,
  renderPeople,
  renderProgrammes,
  renderRead,
  renderResearch,
  renderStandards,
  renderTechnology,
  renderVision,
} from './views';

interface Route {
  name: string;
  id?: string;
}

export class QntDesk {
  private root: HTMLElement;
  private globe: EarthGlobe | null = null;
  private tessDispose: (() => void) | null = null;
  private markets: MarketPrint | null = staleCache();
  private news: NewsRiver | null = null;
  private abort: AbortController | null = null;
  private lastHoverId: string | undefined;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  start(): void {
    this.bindNav();
    this.render();
    void this.refreshFeeds();
    window.setInterval(() => void this.refreshFeeds(), 50_000);
  }

  private bindNav(): void {
    window.addEventListener('popstate', () => this.render());
    window.addEventListener('hashchange', () => {
      if (location.hash.startsWith('#mission/')) this.go('/', true);
    });
    document.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement;
      const more = this.root.querySelector('details.more');
      if (more instanceof HTMLDetailsElement && more.open && !target.closest('details.more')) {
        more.open = false;
      }
      const a = target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || a.target === '_blank') return;
      ev.preventDefault();
      this.go(href);
    });
    document.addEventListener('keydown', (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
        ev.preventDefault();
        this.togglePalette(true);
      }
      if (ev.key === '/' && !(ev.target instanceof HTMLInputElement) && !(ev.target instanceof HTMLTextAreaElement)) {
        ev.preventDefault();
        this.togglePalette(true);
      }
      if (ev.key === 'Escape') {
        this.togglePalette(false);
        this.closeMenu();
      }
    });
    this.syncLegacyHash();
  }

  private syncLegacyHash(): void {
    const raw = location.hash.replace(/^#/, '');
    if (raw.startsWith('mission/')) this.go('/', true);
  }

  private go(path: string, replace = false): void {
    const apply = (): void => {
      const url = path.startsWith('/') ? path : `/${path}`;
      if (replace) history.replaceState({}, '', url);
      else history.pushState({}, '', url);
      this.closeMenu();
      window.scrollTo(0, 0);
      this.render();
      const heading = this.root.querySelector<HTMLElement>('main h1');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && typeof document.startViewTransition === 'function') {
      try {
        const t = document.startViewTransition(apply);
        void t.finished.catch(() => undefined);
      } catch {
        apply();
      }
    } else {
      apply();
    }
  }

  private parse(): Route {
    const path = location.pathname.replace(/\/$/, '') || '/';
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return { name: 'home' };
    const head = parts[0];
    if (head === 'desk' || head === 'ops' || head === 'how') return { name: 'home' };
    if ((head === 'city' || head === 'cities') && parts[1]) return { name: 'city', id: parts[1] };
    if (head === 'read' && parts[1]) return { name: 'read', id: parts[1] };
    if (head === 'notes' && parts[1]) return { name: 'note', id: parts[1] };
    if (head === 'podcast' && parts[1]) return { name: 'episode', id: parts[1] };
    if (head === 'people' && parts[1]) return { name: 'people', id: parts[1] };
    return { name: head };
  }

  private render(): void {
    this.globe?.dispose();
    this.globe = null;
    this.tessDispose?.();
    this.tessDispose = null;
    this.lastHoverId = undefined;
    const route = this.parse();
    const body = this.body(route);
    this.root.innerHTML = this.shell(body, route);
    this.wire(route);
  }

  private body(route: Route): string {
    switch (route.name) {
      case 'home':
        return renderHome();
      case 'vision':
        return renderVision();
      case 'technology':
        return renderTechnology();
      case 'programmes':
      case 'institutional':
        return renderProgrammes();
      case 'cbdc':
        return renderCbdc();
      case 'standards':
        return renderStandards();
      case 'team':
      case 'people':
        return renderPeople();
      case 'research':
      case 'library':
        return renderResearch();
      case 'read':
        return route.id ? renderRead(route.id) : renderNotFound();
      case 'notes':
        return renderNotes();
      case 'note':
        return route.id ? renderNote(route.id) : renderNotFound();
      case 'podcast':
        return renderPodcast();
      case 'episode':
        return route.id ? renderEpisode(route.id) : renderNotFound();
      case 'glossary':
        return renderGlossary();
      case 'markets':
        return renderMarkets(this.markets ?? undefined);
      case 'news':
        return renderNews(this.news ?? undefined);
      case 'city': {
        const city = CITIES.find((c) => c.id === route.id);
        return city ? renderCity(city) : renderNotFound();
      }
      case 'donate':
        return renderDonate();
      default:
        return renderNotFound();
    }
  }

  private shell(body: string, route: Route): string {
    const price = this.markets?.priceUsd != null ? fmtMoney(this.markets.priceUsd) : '—';
    const chg = this.markets?.change24h;
    const live = this.markets?.status === 'live';
    const vol =
      this.markets?.volume24h != null ? `Vol ${fmtCompact(this.markets.volume24h)}` : '';
    const cap =
      this.markets?.marketCap != null ? `Mcap ${fmtCompact(this.markets.marketCap)}` : '';
    const shortcut = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
    return `
      <div class="app">
        <header class="top">
          <div class="top-bar">
          <a class="brand" href="/" aria-label="QntDesk home">
            <img class="logo" src="/brand/qntdesk-icon.png" width="36" height="36" alt="" />
            <span class="word">Qnt<span>Desk</span></span>
          </a>
          <nav class="nav" aria-label="Primary">
            <a href="/notes" ${route.name === 'notes' || route.name === 'note' ? 'aria-current="page"' : ''}>Notes</a>
            <a href="/podcast" ${route.name === 'podcast' || route.name === 'episode' ? 'aria-current="page"' : ''}>Podcast</a>
            <a href="/vision" ${route.name === 'vision' ? 'aria-current="page"' : ''}>Vision</a>
            <a href="/programmes" ${route.name === 'programmes' || route.name === 'institutional' ? 'aria-current="page"' : ''}>Programmes</a>
            <a href="/research" ${route.name === 'research' || route.name === 'library' || route.name === 'read' ? 'aria-current="page"' : ''}>Research</a>
            <details class="more">
              <summary>More</summary>
              <div class="more-menu">
                <a href="/people">People</a>
                <a href="/technology">The stack</a>
                <a href="/news">News</a>
                <a href="/markets">Markets</a>
                <a href="/cbdc">CBDC</a>
                <a href="/standards">Standards</a>
                <a href="/glossary">Glossary</a>
                <a href="/donate">Donate</a>
              </div>
            </details>
          </nav>
          <div class="top-tools">
            <a class="qnt-chip" href="/markets"><i class="${live ? 'live' : ''}"></i> QNT <strong>${esc(price)}</strong> ${chg != null ? `<em class="${chg >= 0 ? 'up' : 'down'}">${esc(fmtPct(chg))}</em>` : ''}</a>
            <button type="button" class="icon-btn" data-open-palette aria-label="Open command palette">${esc(shortcut)}</button>
            <a class="btn btn-primary cta-nav" href="/podcast"><span class="btn-swap"><span>Play the series</span><span>Open Podcast</span></span><span class="btn-arrow" aria-hidden="true">↗</span></a>
            <button type="button" class="icon-btn menu-btn" data-open-menu aria-label="Open menu" aria-expanded="false">☰</button>
          </div>
          </div>
        </header>
        <div class="market-bar">
          <a href="/markets">Markets</a>
          <span data-bar-print>${esc(price)} ${chg != null ? fmtPct(chg) : ''} 24h</span>
          <span data-bar-vol>${esc(vol)}</span>
          <span data-bar-cap>${esc(cap)}</span>
          <span class="chip ${live ? 'live' : 'degraded'}" data-bar-status>${live ? 'Live' : esc(this.markets?.status ?? 'loading')}</span>
          <span data-bar-venue>${esc(this.markets?.venue ? `${this.markets.venue} QNT-USD` : '')}</span>
          <a href="/news" class="push">Live news →</a>
        </div>
        <div class="mobile-nav" id="mobile-nav">
          <a href="/notes">Notes</a>
          <a href="/podcast">Podcast</a>
          <a href="/news">News</a>
          <a href="/markets">Markets</a>
          <a href="/vision">Vision</a>
          <a href="/technology">Stack</a>
          <a href="/programmes">Programmes</a>
          <a href="/cbdc">CBDC</a>
          <a href="/people">People</a>
          <a href="/research">Research</a>
          <a href="/standards">Standards</a>
          <a href="/glossary">Glossary</a>
        </div>
        <main>${body}</main>
        <footer class="foot">
          <div class="foot-grid">
            <div class="foot-col">
              <span class="word">Qnt<span>Desk</span></span>
              <p>The Internet of Value. Overledger, programmable money, and the people building it.</p>
            </div>
            <nav class="foot-col" aria-label="Live">
              <p class="kicker"><i class="section-dot" aria-hidden="true"></i>Live</p>
              <a href="/news">News</a>
              <a href="/markets">Markets</a>
              <a href="/notes">Notes</a>
              <a href="/podcast">Podcast</a>
              <a href="/donate">Donate</a>
            </nav>
            <nav class="foot-col" aria-label="Encyclopedia">
              <p class="kicker"><i class="section-dot" aria-hidden="true"></i>Encyclopedia</p>
              <a href="/vision">Vision</a>
              <a href="/technology">The stack</a>
              <a href="/programmes">Programmes</a>
              <a href="/cbdc">CBDC</a>
            </nav>
            <nav class="foot-col" aria-label="Research">
              <p class="kicker"><i class="section-dot" aria-hidden="true"></i>Research</p>
              <a href="/research">Library</a>
              <a href="/people">People</a>
              <a href="/standards">Standards</a>
              <a href="/glossary">Glossary</a>
            </nav>
          </div>
          <div class="foot-legal">
            <p>${esc(DISCLAIMER)}</p>
            <p class="voices-inline">
              <a href="https://x.com/quantnetwork" rel="noopener noreferrer" target="_blank">@quantnetwork</a>
              <a href="https://x.com/OverledgerDev" rel="noopener noreferrer" target="_blank">@OverledgerDev</a>
              <a href="https://x.com/gverdian" rel="noopener noreferrer" target="_blank">@gverdian</a>
              <span class="mono">QNT ${esc(QNT_CONTRACT)}</span>
            </p>
          </div>
        </footer>
        <div class="palette-scrim" hidden id="palette-scrim"></div>
        <div class="palette" hidden id="palette">
          <input type="search" id="palette-input" placeholder="Search papers, people, cities, terms…" aria-label="Command palette" />
          <ul id="palette-results"></ul>
        </div>
        ${chatMarkup()}
      </div>`;
  }

  private wire(route: Route): void {
    this.root.querySelector('[data-open-palette]')?.addEventListener('click', () => this.togglePalette(true));
    this.root.querySelector('#palette-scrim')?.addEventListener('click', () => this.togglePalette(false));
    this.root.querySelector('[data-open-menu]')?.addEventListener('click', () => {
      const nav = this.root.querySelector('#mobile-nav');
      const btn = this.root.querySelector('[data-open-menu]');
      if (!nav || !btn) return;
      const open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    const palIn = this.root.querySelector<HTMLInputElement>('#palette-input');
    palIn?.addEventListener('input', () => this.paintPalette(palIn.value));

    wireChat(this.root);
    this.wireTesseract();
    this.wireMotionBeds();
    if (route.name === 'podcast' || route.name === 'episode') wirePlayer(this.root);
    this.root.querySelectorAll<HTMLVideoElement>('.pod-tease video').forEach((vid) => {
      const card = vid.closest('.pod-tease');
      card?.addEventListener('mouseenter', () => void vid.play());
      card?.addEventListener('mouseleave', () => {
        vid.pause();
        vid.currentTime = 0;
      });
    });
    if (route.name === 'home') void this.wireGlobe();
    if (route.name === 'markets') this.hydrateMarkets();
    if (route.name === 'news') {
      if (this.news) this.hydrateNews();
      else this.bindNewsFilter();
    }
    if (route.name === 'home') this.hydrateHomeLive();
    if (route.name === 'research' || route.name === 'library') {
      const input = this.root.querySelector<HTMLInputElement>('#lib-search');
      const apply = () => {
        const main = this.root.querySelector('main');
        const on = this.root.querySelector<HTMLButtonElement>('#research-regions .chip.is-on');
        if (main) main.innerHTML = renderResearch(input?.value ?? '', on?.dataset.region ?? 'ALL');
        this.wire(route);
      };
      input?.addEventListener('input', apply);
      this.root.querySelectorAll<HTMLButtonElement>('#research-regions [data-region]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.root.querySelectorAll('#research-regions .chip').forEach((c) => c.classList.remove('is-on'));
          btn.classList.add('is-on');
          apply();
        });
      });
    }
    if (route.name === 'programmes' || route.name === 'institutional') {
      const input = this.root.querySelector<HTMLInputElement>('#prog-search');
      input?.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        this.root.querySelectorAll('#prog-grid .chapter').forEach((el) => {
          const hit = !q || (el.textContent ?? '').toLowerCase().includes(q);
          (el as HTMLElement).hidden = !hit;
        });
      });
    }
    if (route.name === 'notes') {
      const input = this.root.querySelector<HTMLInputElement>('#notes-search');
      const apply = () => {
        const main = this.root.querySelector('main');
        const on = this.root.querySelector<HTMLButtonElement>('#notes-eras .chip.is-on');
        if (main) main.innerHTML = renderNotes(input?.value ?? '', (on?.dataset.era as 'ALL' | 'history' | 'present' | 'future') ?? 'ALL');
        this.wire(route);
      };
      input?.addEventListener('input', apply);
      this.root.querySelectorAll<HTMLButtonElement>('#notes-eras [data-era]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.root.querySelectorAll('#notes-eras .chip').forEach((c) => c.classList.remove('is-on'));
          btn.classList.add('is-on');
          apply();
        });
      });
    }
    if (route.name === 'glossary') {
      const input = this.root.querySelector<HTMLInputElement>('#gloss-search');
      input?.addEventListener('input', () => {
        const main = this.root.querySelector('main');
        if (main) main.innerHTML = renderGlossary(input.value);
        this.wire(route);
      });
    }
    if (route.name === 'standards') {
      this.root.querySelectorAll('.stage-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          btn.parentElement?.classList.toggle('open');
        });
      });
      this.root.querySelector('.stage')?.classList.add('open');
    }
    if (route.name === 'people') {
      const id = route.id || location.hash.replace(/^#/, '');
      if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
    }
  }

  private wireTesseract(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('#tesseract');
    if (!canvas) return;
    this.tessDispose = mountTesseract(canvas);
  }

  private wireMotionBeds(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.root.querySelectorAll<HTMLVideoElement>('video.hero-bed, video.era-bed, video.visual-bed, video.page-bed, video.story-bed').forEach((vid) => {
      if (reduced) {
        vid.removeAttribute('autoplay');
        vid.pause();
      }
    });
  }

  private async wireGlobe(): Promise<void> {
    const stage = this.root.querySelector<HTMLElement>('#earth-stage');
    if (!stage) return;
    const { EarthGlobe } = await import('./globe');
    if (!this.root.contains(stage)) return;
    this.globe = new EarthGlobe(stage, {
      onCity: (id) => this.go(`/city/${id}`),
      onHud: (hud) => {
        const line = this.root.querySelector('#isr-line');
        const zoom = this.root.querySelector('#zoom-readout');
        const hover = this.root.querySelector<HTMLElement>('#city-hover');
        if (line) {
          line.textContent = `Look-down · ${hud.altitudeKm.toLocaleString()} km · ${hud.lat.toFixed(3)}°, ${hud.lon.toFixed(3)}° · sourced programme corridors`;
        }
        if (zoom) zoom.textContent = `${hud.zoom.toFixed(1)}×`;
        if (hover && hud.hoverId !== this.lastHoverId) {
          this.lastHoverId = hud.hoverId;
          const city = hud.hoverId ? CITIES.find((c) => c.id === hud.hoverId) : undefined;
          if (city) {
            hover.hidden = false;
            hover.innerHTML = `<p class="kicker">${esc(city.kind)}</p><strong>${esc(city.name)}</strong><p>${esc(city.lede)}</p>`;
          } else {
            hover.hidden = true;
            hover.innerHTML = '';
          }
        }
      },
    });
    this.root.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach((b) => {
      b.addEventListener('click', () => this.globe?.zoomBy(Number(b.dataset.zoom)));
    });
    this.root.querySelector('[data-reset-globe]')?.addEventListener('click', () => this.globe?.reset());
    if (window.matchMedia('(max-width: 959px)').matches) {
      const labels = this.root.querySelector<HTMLInputElement>('[data-globe-opt="labels"]');
      if (labels) labels.checked = false;
    }
    this.root.querySelectorAll<HTMLInputElement>('[data-globe-opt]').forEach((input) => {
      const apply = () => {
        const key = input.dataset.globeOpt;
        const on = input.checked;
        if (key === 'spin' || key === 'labels' || key === 'day' || key === 'night' || key === 'routes' || key === 'corridors' || key === 'activity') {
          this.globe?.setOverlays({ [key]: on });
        }
      };
      input.addEventListener('change', apply);
      apply();
    });
    this.root.querySelector<HTMLSelectElement>('#city-select')?.addEventListener('change', (ev) => {
      const id = (ev.target as HTMLSelectElement).value;
      this.globe?.focusCity(id);
    });
  }

  private hydrateMarkets(): void {
    const main = this.root.querySelector('main');
    if (!main || !this.markets) return;
    main.innerHTML = renderMarkets(this.markets);
  }

  private hydrateNews(): void {
    const main = this.root.querySelector('main');
    if (!main || !this.news) return;
    const prev = this.root.querySelector<HTMLInputElement>('#news-filter')?.value ?? '';
    main.innerHTML = renderNews(this.news, prev);
    this.bindNewsFilter();
  }

  private bindNewsFilter(): void {
    const main = this.root.querySelector('main');
    const input = this.root.querySelector<HTMLInputElement>('#news-filter');
    if (!main || !input) return;
    input.addEventListener('input', () => {
      main.innerHTML = renderNews(this.news ?? undefined, input.value);
      this.bindNewsFilter();
    });
  }

  private hydrateHomeLive(): void {
    const price = this.root.querySelector('[data-home-price]');
    const meta = this.root.querySelector('[data-home-meta]');
    if (price && this.markets?.priceUsd != null) {
      price.textContent = fmtMoney(this.markets.priceUsd);
    }
    if (meta && this.markets) {
      meta.textContent = `${this.markets.venue} · ${this.markets.status} · ${this.markets.change24h != null ? fmtPct(this.markets.change24h) : ''}`;
    }
    const news = this.root.querySelector('[data-home-news]');
    if (news && this.news) {
      const meta = this.root.querySelector('[data-home-news-meta]');
      if (meta) {
        meta.textContent = `${this.news.items.length} headlines · ${this.news.status}`;
      }
      news.innerHTML = this.news.items.length
        ? this.news.items
            .slice(0, 5)
            .map(
              (h) =>
                `<li><span class="kicker">${esc(h.lane)}</span> <a href="${esc(h.url)}" target="_blank" rel="noopener noreferrer">${esc(h.title)}</a></li>`,
            )
            .join('')
        : `<li class="empty-note">${esc(this.news.error ?? 'No matching headlines yet.')}</li>`;
    }
  }

  private async refreshFeeds(): Promise<void> {
    this.abort?.abort();
    this.abort = new AbortController();
    const { signal } = this.abort;
    try {
      const [m, n] = await Promise.all([fetchMarkets(signal), fetchNews(signal)]);
      this.markets = m;
      this.news = n;
      const chip = this.root.querySelector('.qnt-chip strong');
      if (chip && m.priceUsd != null) chip.textContent = fmtMoney(m.priceUsd);
      const bar = this.root.querySelector('[data-bar-print]');
      if (bar && m.priceUsd != null) {
        bar.textContent = `${fmtMoney(m.priceUsd)} ${m.change24h != null ? fmtPct(m.change24h) : ''} 24h`;
      }
      const volEl = this.root.querySelector('[data-bar-vol]');
      if (volEl && m.volume24h != null) volEl.textContent = `Vol ${fmtCompact(m.volume24h)}`;
      const capEl = this.root.querySelector('[data-bar-cap]');
      if (capEl && m.marketCap != null) capEl.textContent = `Mcap ${fmtCompact(m.marketCap)}`;
      const statusEl = this.root.querySelector('[data-bar-status]');
      if (statusEl) {
        statusEl.textContent = m.status === 'live' ? 'Live' : m.status;
        statusEl.className = `chip ${m.status.toLowerCase()}`;
      }
      const venueEl = this.root.querySelector('[data-bar-venue]');
      if (venueEl) venueEl.textContent = m.venue ? `${m.venue} QNT-USD` : '';
      const route = this.parse();
      if (route.name === 'markets') this.hydrateMarkets();
      if (route.name === 'news') this.hydrateNews();
      if (route.name === 'home') this.hydrateHomeLive();
    } catch {
      /* last-good already applied inside fetchers */
    }
  }

  private closeMenu(): void {
    this.root.querySelector('#mobile-nav')?.classList.remove('is-open');
    this.root.querySelector('[data-open-menu]')?.setAttribute('aria-expanded', 'false');
    this.root.querySelectorAll('details.more').forEach((el) => {
      (el as HTMLDetailsElement).open = false;
    });
  }

  private togglePalette(open: boolean): void {
    const pal = this.root.querySelector<HTMLElement>('#palette');
    const scrim = this.root.querySelector<HTMLElement>('#palette-scrim');
    if (!pal) return;
    pal.hidden = !open;
    if (scrim) scrim.hidden = !open;
    if (open) {
      const input = pal.querySelector<HTMLInputElement>('input');
      input?.focus();
      this.paintPalette(input?.value ?? '');
    }
  }

  private paintPalette(q: string): void {
    const box = this.root.querySelector('#palette-results');
    if (!box) return;
    const query = q.trim().toLowerCase();
    const rows: Array<{ href: string; title: string; sub: string }> = [];
    const pages = [
      ['/', 'Earth', 'Latest record and the globe'],
      ['/notes', 'Notes', 'Latest field notes'],
      ['/podcast', 'Podcast', 'Twenty films'],
      ['/vision', 'Vision', 'Internet of Value'],
      ['/technology', 'The stack', 'Overledger, Fusion, PayScript'],
      ['/programmes', 'Programmes', 'GBTD, Murex, Rosalind'],
      ['/cbdc', 'CBDC', 'Liability test'],
      ['/people', 'People', 'Verdian, Riley, Belchior'],
      ['/research', 'Research', '48 documents'],
      ['/standards', 'Standards', 'SATP, ISO'],
      ['/markets', 'Markets', 'Live QNT'],
      ['/news', 'News', 'The wire'],
      ['/glossary', 'Glossary', 'Programmable money language'],
    ];
    for (const [href, title, sub] of pages) {
      if (!query || `${title} ${sub}`.toLowerCase().includes(query)) rows.push({ href, title, sub });
    }
    for (const p of papers) {
      if (query && `${p.title} ${p.authors.join(' ')}`.toLowerCase().includes(query)) {
        rows.push({ href: `/read/${p.id}`, title: p.title, sub: p.venue });
      }
    }
    for (const person of PEOPLE) {
      if (query && `${person.name} ${person.role}`.toLowerCase().includes(query)) {
        rows.push({ href: `/people#${person.id}`, title: person.name, sub: person.role });
      }
    }
    for (const city of CITIES) {
      if (query && city.name.toLowerCase().includes(query)) {
        rows.push({ href: `/city/${city.id}`, title: city.name, sub: city.kind });
      }
    }
    for (const t of GLOSSARY) {
      if (query && `${t.term} ${t.body}`.toLowerCase().includes(query)) {
        rows.push({ href: `/glossary`, title: t.term, sub: t.body.slice(0, 80) });
      }
    }
    for (const note of notesFromDesk()) {
      if (query && `${note.title} ${note.body} ${note.kicker}`.toLowerCase().includes(query)) {
        rows.push({ href: `/notes/${note.id}`, title: note.title, sub: `${note.kicker} · ${note.era}` });
      }
    }
    for (const d of didYouKnow) {
      if (query && d.q.toLowerCase().includes(query)) {
        rows.push({ href: `/notes/${d.id}`, title: d.q, sub: d.category });
      }
    }
    for (const quote of quotes) {
      if (query && `${quote.who} ${quote.text}`.toLowerCase().includes(query)) {
        rows.push({ href: `/${quote.page}`, title: `“${quote.text.slice(0, 72)}”`, sub: quote.who });
      }
    }
    box.innerHTML = rows
      .slice(0, 18)
      .map((r) => `<li><a href="${esc(r.href)}"><strong>${esc(r.title)}</strong><span>${esc(r.sub)}</span></a></li>`)
      .join('');
  }

}
