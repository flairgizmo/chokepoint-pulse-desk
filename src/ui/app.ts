import { QNT_CONTRACT } from '../data/catalog';
import { CITIES } from '../data/cities';
import { fetchMarkets, staleCache, type MarketPrint } from '../modules/markets';
import { fetchNews, type NewsRiver } from '../modules/news';
import type { EarthGlobe } from './globe';
import { chatMarkup, wireChat } from './chat';
import { wirePlayer } from './player';
import { mountTesseract } from './tesseract';
import { esc, fmtCompact, fmtMoney, fmtPct, fmtQty } from './html';
import {
  DISCLAIMER,
  newsListMarkup,
  renderCbdc,
  renderCity,
  renderDonate,
  renderGlossary,
  renderHome,
  renderMarkets,
  renderEpisode,
  renderNews,
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
      if (ev.key === 'Escape') this.closeMenu();
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
    apply();
  }

  private parse(): Route {
    const path = location.pathname.replace(/\/$/, '') || '/';
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return { name: 'home' };
    const head = parts[0];
    if (head === 'desk' || head === 'ops' || head === 'how' || head === 'notes' || head === 'note') return { name: 'news' };
    if ((head === 'city' || head === 'cities') && parts[1]) return { name: 'city', id: parts[1] };
    if (head === 'read' && parts[1]) return { name: 'read', id: parts[1] };
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
    return `
      <div class="app">
        <header class="top">
          <div class="top-bar">
          <a class="brand" href="/" aria-label="QntDesk home">
            <img class="logo" src="/brand/qntdesk-icon.png" width="36" height="36" alt="" />
            <span class="word">Qnt<span>Desk</span></span>
          </a>
          <nav class="nav" aria-label="Primary">
            <a href="/news" ${route.name === 'news' ? 'aria-current="page"' : ''}>News</a>
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
            <a class="btn btn-primary cta-nav" href="/podcast"><span class="btn-swap"><span>Start the series</span><span>Open Podcast</span></span><span class="btn-arrow" aria-hidden="true">↗</span></a>
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
          <a href="/news">News</a>
          <a href="/podcast">Podcast</a>
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
        ${chatMarkup()}
      </div>`;
  }

  private wire(route: Route): void {
    this.root.querySelector('[data-open-menu]')?.addEventListener('click', () => {
      const nav = this.root.querySelector('#mobile-nav');
      const btn = this.root.querySelector('[data-open-menu]');
      if (!nav || !btn) return;
      const open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
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
    const tape = this.root.querySelector('[data-mk]');
    if (!this.markets) return;
    if (!tape) {
      const main = this.root.querySelector('main');
      if (main) main.innerHTML = renderMarkets(this.markets);
      return;
    }
    const p = this.markets;
    const set = (sel: string, text: string): void => {
      this.root.querySelectorAll(sel).forEach((el) => {
        el.textContent = text;
      });
    };
    const circ = p.circulating;
    const total = p.totalSupply;
    const pct = circ && total ? Math.min(100, (circ / total) * 100) : 0;
    const outside = circ != null && total != null ? Math.max(0, total - circ) : null;
    set('[data-mk-price]', p.priceUsd != null ? fmtMoney(p.priceUsd) : '—');
    const chg = this.root.querySelector('[data-mk-change]');
    if (chg) {
      chg.textContent = `${p.change24h != null ? fmtPct(p.change24h) : '—'} 24h`;
      chg.className = (p.change24h ?? 0) >= 0 ? 'up' : 'down';
    }
    set('[data-mk-vol]', p.volume24h != null ? fmtMoney(p.volume24h, 0) : '—');
    set('[data-mk-cap]', p.marketCap != null ? fmtMoney(p.marketCap, 0) : '—');
    set(
      '[data-mk-range]',
      `${p.high24h != null ? fmtMoney(p.high24h) : '—'} / ${p.low24h != null ? fmtMoney(p.low24h) : '—'}`,
    );
    set('[data-mk-circ]', circ != null ? fmtQty(circ) : '—');
    set('[data-mk-circ2]', circ != null ? fmtQty(circ) : '—');
    set('[data-mk-total]', total != null ? fmtQty(total) : '—');
    set('[data-mk-total2]', total != null ? fmtQty(total) : '—');
    set('[data-mk-outside]', outside != null ? fmtQty(outside) : '—');
    set('[data-mk-meta]', `Updated ${p.updated ?? '—'} · ${p.venue ?? ''}`);
    set(
      '[data-mk-ath]',
      `${pct ? `${pct.toFixed(1)}% circulating` : 'Supply figures will appear when CoinGecko answers.'} · ATH ${p.ath != null ? fmtMoney(p.ath) : '—'} · ATL ${p.atl != null ? fmtMoney(p.atl) : '—'}`,
    );
    const status = this.root.querySelector('[data-mk-status]');
    if (status) {
      status.textContent = p.status;
      status.className = `chip ${p.status.toLowerCase()}`;
    }
    const bar = this.root.querySelector<HTMLElement>('[data-mk-bar]');
    if (bar) bar.style.width = `${pct}%`;
    const err = this.root.querySelector<HTMLElement>('[data-mk-error]');
    if (err) {
      err.hidden = !p.error;
      err.textContent = p.error ?? '';
    }
  }

  private hydrateNews(): void {
    const list = this.root.querySelector('[data-news-list]');
    const prev = this.root.querySelector<HTMLInputElement>('#news-filter')?.value ?? '';
    if (!list) {
      const main = this.root.querySelector('main');
      if (main) main.innerHTML = renderNews(this.news ?? undefined, prev);
      this.bindNewsFilter();
      return;
    }
    const painted = newsListMarkup(this.news ?? undefined, prev);
    list.innerHTML = painted.html;
    const count = this.root.querySelector('[data-news-count]');
    if (count) count.textContent = `${painted.count} matching headlines`;
    const status = this.root.querySelector('[data-news-status]');
    if (status) {
      status.textContent = this.news?.status ?? 'loading';
      status.className = `chip ${(this.news?.status ?? 'loading').toLowerCase()}`;
    }
    this.bindNewsFilter();
  }

  private bindNewsFilter(): void {
    const input = this.root.querySelector<HTMLInputElement>('#news-filter');
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';
    input.addEventListener('input', () => {
      const painted = newsListMarkup(this.news ?? undefined, input.value);
      const list = this.root.querySelector('[data-news-list]');
      if (list) list.innerHTML = painted.html;
      const count = this.root.querySelector('[data-news-count]');
      if (count) count.textContent = `${painted.count} matching headlines`;
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
}
