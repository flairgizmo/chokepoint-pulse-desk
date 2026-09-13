import { QNT_CONTRACT } from '../data/catalog';
import { CITIES } from '../data/cities';
import { fetchMarkets, staleCache, type MarketPrint } from '../modules/markets';
import { fetchNews, type NewsRiver } from '../modules/news';
import type { EarthGlobe } from './globe';
import { chatMarkup, wireChat } from './chat';
import { wirePlayer } from './player';
import { mountGateway } from './gateway';
import { esc, fmtCompact, fmtMoney, fmtPct, fmtQty } from './html';
import {
  DISCLAIMER,
  newsListMarkup,
  sparklineSvg,
  venueBarsHtml,
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
  renderStory,
  renderStack,
  renderPatents,
  renderInstitutions,
  renderTechnology,
  renderVision,
} from './views';
import { setStageNavigator, stageMarkup, syncStageFromLocation, wireStages } from './stage';
import { searchMarkup, wireSearch } from './search';
import { resolveStage } from './resolve';
import { matchProgrammes } from '../data/programmes';
import { rememberHeadline } from './newsCache';
import { STORY } from '../data/story';

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
  private lastPath = '';

  constructor(root: HTMLElement) {
    this.root = root;
  }

  start(): void {
    this.bindNav();
    this.render();
    void this.refreshFeeds();
    window.setInterval(() => void this.refreshFeeds(), 30 * 60 * 1000);
  }

  private bindNav(): void {
    setStageNavigator((path) => this.go(path));
    window.addEventListener('popstate', () => this.onPop());
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
    this.bindStoryKeys();
  }

  private onPop(): void {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === this.lastPath) {
      syncStageFromLocation(this.root);
      return;
    }
    this.lastPath = path;
    this.render();
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
    if (head === 'timeline' || head === 'story') return { name: 'story' };
    if (head === 'boards') return { name: 'institutions' };
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
    this.lastPath = location.pathname.replace(/\/+$/, '') || '/';
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
      case 'story':
        return renderStory();
      case 'stack':
        return renderStack();
      case 'patents':
        return renderPatents();
      case 'institutions':
        return renderInstitutions();
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
            <a href="/story" ${route.name === 'story' ? 'aria-current="page"' : ''}>Story</a>
            <a href="/technology" ${route.name === 'technology' ? 'aria-current="page"' : ''}>Technology</a>
            <a href="/programmes" ${route.name === 'programmes' || route.name === 'institutional' ? 'aria-current="page"' : ''}>Programmes</a>
            <a href="/research" ${route.name === 'research' || route.name === 'library' || route.name === 'read' ? 'aria-current="page"' : ''}>Research</a>
            <details class="more">
              <summary>More</summary>
              <div class="more-menu">
                <a href="/people">People</a>
                <a href="/stack">Stack</a>
                <a href="/standards">Standards</a>
                <a href="/patents">Patents</a>
                <a href="/institutions">Institutions</a>
                <a href="/cbdc">CBDC</a>
                <a href="/markets">Markets</a>
                <a href="/glossary">Glossary</a>
                <a href="/podcast">Podcast</a>
                <a href="/vision">Vision</a>
                <a href="/donate">Donate</a>
              </div>
            </details>
          </nav>
          <div class="top-tools">
            <a class="qnt-chip" href="/markets"><i class="${live ? 'live' : ''}"></i> QNT <strong>${esc(price)}</strong> ${chg != null ? `<em class="${chg >= 0 ? 'up' : 'down'}">${esc(fmtPct(chg))}</em>` : ''}</a>
            <button type="button" class="icon-btn" data-open-search aria-label="Search the desk">Search</button>
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
          <a href="/story">Story</a>
          <a href="/technology">Technology</a>
          <a href="/stack">Stack</a>
          <a href="/programmes">Programmes</a>
          <a href="/people">People</a>
          <a href="/institutions">Institutions</a>
          <a href="/patents">Patents</a>
          <a href="/cbdc">CBDC</a>
          <a href="/markets">Markets</a>
          <a href="/research">Research</a>
          <a href="/standards">Standards</a>
          <a href="/glossary">Glossary</a>
          <a href="/podcast">Podcast</a>
        </div>
        <main>${body}</main>
        <footer class="foot colophon">
          <div class="foot-legal">
            <p class="word">Qnt<span>Desk</span></p>
            <p>Independent educational brief. Not Quant Network Ltd. Sources: official Quant surfaces, Overledger docs, IETF SATP, public filings. Ingest about every thirty minutes. Markets via cached CoinGecko with as-of shown.</p>
            <p>${esc(DISCLAIMER)}</p>
            <p class="voices-inline">
              <a href="/donate">Donate</a>
              <a href="https://x.com/quantnetwork" rel="noopener noreferrer" target="_blank">@quantnetwork</a>
              <a href="https://x.com/OverledgerDev" rel="noopener noreferrer" target="_blank">@OverledgerDev</a>
              <a href="https://x.com/gverdian" rel="noopener noreferrer" target="_blank">@gverdian</a>
              <span class="mono">QNT ${esc(QNT_CONTRACT)}</span>
            </p>
          </div>
        </footer>
        ${stageMarkup()}
        ${searchMarkup()}
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
    wireStages(this.root, resolveStage);
    wireSearch(this.root);
    this.wireFilters(route);
    this.wireGateway();
    this.wireMotionBeds();
    this.wireFlips();
    if (route.name === 'podcast' || route.name === 'episode') wirePlayer(this.root);
    if (this.root.querySelector('#earth-stage')) void this.wireGlobe();
    if (route.name === 'markets') this.hydrateMarkets();
    if (route.name === 'news') {
      if (this.news) this.hydrateNews();
      else this.bindNewsFilter();
    }
    if (route.name === 'home') this.hydrateHomeLive();
    if (route.name === 'programmes' || route.name === 'institutional') this.hydrateProgrammes();
    if (route.name === 'story') this.hydrateStorySuggest();
    if (route.name === 'research' || route.name === 'library') {
      const input = this.root.querySelector<HTMLInputElement>('#lib-search');
      const apply = () => {
        const q = (input?.value ?? '').trim().toLowerCase();
        const region = this.root.querySelector<HTMLButtonElement>('#research-regions .chip.is-on')?.dataset.region ?? 'ALL';
        let n = 0;
        this.root.querySelectorAll<HTMLElement>('#research-grid .paper').forEach((el) => {
          const hay = (el.textContent ?? '').toLowerCase();
          const regionOk = region === 'ALL' || (el.dataset.region ?? '').includes(region);
          const hit = (!q || hay.includes(q)) && regionOk;
          el.hidden = !hit;
          if (hit) n += 1;
        });
        const empty = this.root.querySelector<HTMLElement>('#research-empty');
        if (empty) empty.hidden = n > 0;
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
    if (route.name === 'glossary') {
      const input = this.root.querySelector<HTMLInputElement>('#gloss-search');
      input?.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        this.root.querySelectorAll<HTMLElement>('main .term').forEach((el) => {
          el.hidden = Boolean(q) && !(el.textContent ?? '').toLowerCase().includes(q);
        });
        this.root.querySelectorAll<HTMLElement>('main .letter').forEach((sec) => {
          const any = [...sec.querySelectorAll<HTMLElement>('.term')].some((t) => !t.hidden);
          sec.hidden = !any;
        });
      });
    }
    if (route.name === 'people') {
      const id = route.id || location.hash.replace(/^#/, '');
      if (id && !id.startsWith('stage/')) document.getElementById(id)?.scrollIntoView({ block: 'start' });
    }
  }

  private wireFilters(route: Route): void {
    const bindSearch = (inputId: string, itemSel: string, emptyId?: string): void => {
      const input = this.root.querySelector<HTMLInputElement>(inputId);
      if (!input) return;
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        let n = 0;
        this.root.querySelectorAll<HTMLElement>(itemSel).forEach((el) => {
          const hay = (el.dataset.q || el.textContent || '').toLowerCase();
          const hit = !q || hay.includes(q);
          el.hidden = !hit;
          if (hit) n += 1;
        });
        const empty = emptyId ? this.root.querySelector<HTMLElement>(emptyId) : null;
        if (empty) empty.hidden = n > 0;
      });
    };
    if (route.name === 'story') {
      const rail = this.root.querySelector('#story-rail');
      const applyStory = (): void => {
        const q = this.root.querySelector<HTMLInputElement>('#story-search')?.value.trim().toLowerCase() ?? '';
        const theme = this.root.querySelector<HTMLButtonElement>('[data-story-theme].is-on')?.dataset.storyTheme ?? 'all';
        const density = this.root.querySelector<HTMLSelectElement>('#story-density')?.value ?? 'year';
        rail?.setAttribute('data-density', density);
        let n = 0;
        this.root.querySelectorAll<HTMLElement>('.story-node').forEach((el) => {
          const hay = (el.dataset.q || el.textContent || '').toLowerCase();
          const themeOk = theme === 'all' || el.dataset.theme === theme;
          const textOk = !q || hay.includes(q);
          const hit = themeOk && textOk;
          el.hidden = !hit;
          if (hit) n += 1;
        });
        const empty = this.root.querySelector<HTMLElement>('#story-empty');
        if (empty) empty.hidden = n > 0;
        const count = this.root.querySelector('[data-story-count]');
        if (count) count.textContent = `${n} events on the rail`;
      };
      this.root.querySelector('#story-search')?.addEventListener('input', applyStory);
      this.root.querySelectorAll<HTMLButtonElement>('[data-story-theme]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.root.querySelectorAll('[data-story-theme]').forEach((c) => c.classList.remove('is-on'));
          btn.classList.add('is-on');
          applyStory();
        });
      });
      this.root.querySelector('#story-density')?.addEventListener('change', applyStory);
    }
    if (route.name === 'technology') bindSearch('#tech-search', '.tech-chapter', '#tech-empty');
    if (route.name === 'patents') bindSearch('#patent-search', '.patent-card', '#patent-empty');
    if (route.name === 'institutions') {
      const applyInst = (): void => {
        const q = this.root.querySelector<HTMLInputElement>('#inst-search')?.value.trim().toLowerCase() ?? '';
        const st = this.root.querySelector<HTMLButtonElement>('[data-inst-status].is-on')?.dataset.instStatus ?? 'all';
        let n = 0;
        this.root.querySelectorAll<HTMLElement>('.inst-card').forEach((el) => {
          const hay = (el.dataset.q || el.textContent || '').toLowerCase();
          const hit = (!q || hay.includes(q)) && (st === 'all' || el.dataset.status === st);
          el.hidden = !hit;
          if (hit) n += 1;
        });
        const empty = this.root.querySelector<HTMLElement>('#inst-empty');
        if (empty) empty.hidden = n > 0;
      };
      this.root.querySelector('#inst-search')?.addEventListener('input', applyInst);
      this.root.querySelectorAll<HTMLButtonElement>('[data-inst-status]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.root.querySelectorAll('[data-inst-status]').forEach((c) => c.classList.remove('is-on'));
          btn.classList.add('is-on');
          applyInst();
        });
      });
    }
    if (route.name === 'programmes' || route.name === 'institutional') {
      const applyProg = (): void => {
        const q = this.root.querySelector<HTMLInputElement>('#prog-search')?.value.trim().toLowerCase() ?? '';
        const st = this.root.querySelector<HTMLButtonElement>('[data-prog-status].is-on')?.dataset.progStatus ?? 'all';
        let n = 0;
        this.root.querySelectorAll<HTMLElement>('.prog-card').forEach((el) => {
          const hay = (el.dataset.q || el.textContent || '').toLowerCase();
          const hit = (!q || hay.includes(q)) && (st === 'all' || el.dataset.status === st);
          el.hidden = !hit;
          if (hit) n += 1;
        });
        const empty = this.root.querySelector<HTMLElement>('#prog-empty');
        if (empty) empty.hidden = n > 0;
      };
      this.root.querySelector('#prog-search')?.addEventListener('input', applyProg);
      this.root.querySelectorAll<HTMLButtonElement>('[data-prog-status]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.root.querySelectorAll('[data-prog-status]').forEach((c) => c.classList.remove('is-on'));
          btn.classList.add('is-on');
          applyProg();
        });
      });
    }
    if (route.name === 'people') {
      const applyPeople = (): void => {
        const q = this.root.querySelector<HTMLInputElement>('#people-search')?.value.trim().toLowerCase() ?? '';
        this.root.querySelectorAll<HTMLElement>('.person, .people-tile, .ol-list li').forEach((el) => {
          el.hidden = Boolean(q) && !(el.textContent ?? '').toLowerCase().includes(q);
        });
      };
      this.root.querySelector('#people-search')?.addEventListener('input', applyPeople);
    }
    if (route.name === 'stack') {
      this.root.querySelectorAll<HTMLButtonElement>('[data-stack-iso]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.stackIso;
          this.root.querySelectorAll('.stack-rungs li').forEach((el) => {
            el.classList.toggle('is-dim', el.getAttribute('data-rung') !== id);
          });
        });
      });
      this.root.querySelector('[data-stack-all]')?.addEventListener('click', () => {
        this.root.querySelectorAll('.stack-rungs li').forEach((el) => el.classList.remove('is-dim'));
      });
    }
  }

  private wireGateway(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('#gateway');
    if (!canvas) return;
    this.tessDispose = mountGateway(canvas);
  }

  private wireFlips(): void {
    this.root.querySelectorAll<HTMLElement>('.flip-card').forEach((card) => {
      card.addEventListener('click', () => card.classList.toggle('is-flipped'));
      card.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          card.classList.toggle('is-flipped');
        }
      });
      card.tabIndex = 0;
    });
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
          line.textContent = `LOOK-DOWN  ALT ${hud.altitudeKm.toLocaleString()} km  ${hud.lat.toFixed(3)}° ${hud.lon.toFixed(3)}°  ZOOM ${hud.zoom.toFixed(1)}×  SRC corridors`;
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
    const spark = this.root.querySelector('[data-mk-spark]');
    if (spark) spark.innerHTML = sparklineSvg(p.sparkline ?? []);
    const bars = this.root.querySelector('[data-mk-bars]');
    if (bars) bars.innerHTML = venueBarsHtml(p);
    const ring = this.root.querySelector('.token-visual');
    if (ring && circ && total) {
      const arc = ring.querySelector('.supply-ring-arc');
      if (arc) {
        const r = 46;
        const c = 2 * Math.PI * r;
        const dash = (pct / 100) * c;
        arc.setAttribute('stroke-dasharray', `${dash.toFixed(2)} ${c.toFixed(2)}`);
      }
      const label = ring.querySelector('text');
      if (label) label.textContent = `${pct.toFixed(1)}%`;
    }
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
    const pulse = this.root.querySelector('[data-home-pulse]');
    if (pulse && this.news) {
      pulse.innerHTML = this.news.items.length
        ? this.news.items
            .slice(0, 8)
            .map((h) => {
              rememberHeadline({
                id: h.id,
                title: h.title,
                url: h.url,
                source: h.source,
                published: h.published ?? '',
                lane: h.lane,
              });
              return `<li><button type="button" data-stage="news" data-stage-id="${esc(h.id)}" data-title="${esc(h.title)}" data-url="${esc(h.url)}" data-source="${esc(h.source)}" data-published="${esc(h.published ?? '')}" data-lane="${esc(h.lane)}"><span class="kicker">${esc(h.lane)}</span> ${esc(h.title)}</button></li>`;
            })
            .join('')
        : `<li class="empty-note">${esc(this.news.error ?? 'The river is quiet. Filings stay on the news desk.')}</li>`;
    }
    const price = this.root.querySelector('[data-home-price]');
    const meta = this.root.querySelector('[data-home-meta]');
    if (price && this.markets?.priceUsd != null) {
      price.textContent = fmtMoney(this.markets.priceUsd);
    }
    if (meta && this.markets) {
      meta.textContent = `${this.markets.venue ?? 'CoinGecko'} · ${this.markets.status} · ${this.markets.change24h != null ? fmtPct(this.markets.change24h) : ''} · as of ${this.markets.updated ?? '—'}`;
    }
    const news = this.root.querySelector('[data-home-news]');
    if (news && this.news) {
      const newsMeta = this.root.querySelector('[data-home-news-meta]');
      if (newsMeta) newsMeta.textContent = `${this.news.items.length} headlines · ${this.news.status}`;
      news.innerHTML = this.news.items.length
        ? this.news.items
            .slice(0, 5)
            .map((h) => {
              rememberHeadline({
                id: h.id,
                title: h.title,
                url: h.url,
                source: h.source,
                published: h.published ?? '',
                lane: h.lane,
              });
              return `<li><button type="button" data-stage="news" data-stage-id="${esc(h.id)}" data-title="${esc(h.title)}" data-url="${esc(h.url)}" data-source="${esc(h.source)}" data-published="${esc(h.published ?? '')}" data-lane="${esc(h.lane)}"><span class="kicker">${esc(h.lane)}</span> ${esc(h.title)}</button></li>`;
            })
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
      if (route.name === 'programmes' || route.name === 'institutional') this.hydrateProgrammes();
      if (route.name === 'story') this.hydrateStorySuggest();
    } catch {
      /* last-good already applied inside fetchers */
    }
  }

  private hydrateProgrammes(): void {
    if (!this.news?.items.length) return;
    this.root.querySelectorAll<HTMLElement>('[data-prog-mentions]').forEach((el) => {
      const id = el.dataset.progMentions;
      if (!id) return;
      const hits = this.news?.items.filter((h) => matchProgrammes(h.title).some((p) => p.id === id)).slice(0, 3) ?? [];
      if (!hits.length) {
        el.hidden = true;
        el.innerHTML = '';
        return;
      }
      el.hidden = false;
      el.innerHTML = `Mentioned on the wire: ${hits
        .map((h) => {
          rememberHeadline({
            id: h.id,
            title: h.title,
            url: h.url,
            source: h.source,
            published: h.published ?? '',
            lane: h.lane,
          });
          return `<button type="button" data-stage="news" data-stage-id="${esc(h.id)}" data-title="${esc(h.title)}" data-url="${esc(h.url)}" data-source="${esc(h.source)}" data-published="${esc(h.published ?? '')}" data-lane="${esc(h.lane)}">${esc(h.title)}</button>`;
        })
        .join(' · ')}`;
    });
  }

  private hydrateStorySuggest(): void {
    const slot = this.root.querySelector<HTMLElement>('[data-story-suggest]');
    if (!slot || !this.news?.items.length) return;
    const known = new Set(STORY.map((e) => e.title.toLowerCase()));
    const suggestions = this.news.items
      .filter((h) => /quant|overledger|satp|gbtd|qnt/i.test(h.title) && ![...known].some((t) => h.title.toLowerCase().includes(t.slice(0, 18))))
      .slice(0, 4);
    if (!suggestions.length) {
      slot.hidden = true;
      return;
    }
    slot.hidden = false;
    slot.innerHTML = `<span class="chip">unverified until placed</span> On the wire, not yet on this rail: ${suggestions
      .map((h) => {
        rememberHeadline({
          id: h.id,
          title: h.title,
          url: h.url,
          source: h.source,
          published: h.published ?? '',
          lane: h.lane,
        });
        return `<button type="button" data-stage="news" data-stage-id="${esc(h.id)}" data-title="${esc(h.title)}" data-url="${esc(h.url)}" data-source="${esc(h.source)}" data-published="${esc(h.published ?? '')}" data-lane="${esc(h.lane)}">${esc(h.title)}</button>`;
      })
      .join(' · ')}`;
  }

  private bindStoryKeys(): void {
    if (document.body.dataset.storyKeys === '1') return;
    document.body.dataset.storyKeys = '1';
    document.addEventListener('keydown', (ev) => {
      if (ev.key !== 'j' && ev.key !== 'k') return;
      const tag = (ev.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const rail = document.querySelector('#story-rail');
      const stage = document.querySelector<HTMLElement>('#desk-stage');
      const search = document.querySelector<HTMLElement>('#desk-search');
      if (!rail || (stage && !stage.hidden) || (search && !search.hidden)) return;
      const nodes = [...rail.querySelectorAll<HTMLElement>('.story-node')].filter((n) => !n.hidden);
      if (!nodes.length) return;
      ev.preventDefault();
      const current = nodes.findIndex((n) => n.classList.contains('is-focus'));
      const next = ev.key === 'j' ? Math.min(nodes.length - 1, current + 1) : Math.max(0, current < 0 ? 0 : current - 1);
      nodes.forEach((n) => n.classList.remove('is-focus'));
      const node = nodes[next];
      node.classList.add('is-focus');
      node.scrollIntoView({ block: 'center' });
      node.querySelector<HTMLButtonElement>('.story-hit')?.focus();
    });
  }

  private closeMenu(): void {
    this.root.querySelector('#mobile-nav')?.classList.remove('is-open');
    this.root.querySelector('[data-open-menu]')?.setAttribute('aria-expanded', 'false');
    this.root.querySelectorAll('details.more').forEach((el) => {
      (el as HTMLDetailsElement).open = false;
    });
  }
}
