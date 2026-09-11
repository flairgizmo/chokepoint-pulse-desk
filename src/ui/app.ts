import { MissionBook, type Mission } from '../modules/missions';
import { GevShareLink } from '../modules/GevShareLink';
import {
  LiveFeeds,
  type AircraftFeedResult,
  type QuakeFeedResult,
} from '../modules/feeds';

const GEV_BASE =
  (import.meta.env.VITE_GEV_BASE as string | undefined)?.replace(/\/$/, '') ||
  GevShareLink.DEFAULT_BASE_URL;

export class PulseDeskApp {
  private root: HTMLElement;
  private view: 'room' | 'detail' = 'room';
  private selectedId: string | null = null;
  private quakes: QuakeFeedResult | null = null;
  private aircraftSample: AircraftFeedResult | null = null;
  private abort: AbortController | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async start(): Promise<void> {
    this.bindHash();
    this.render();
    await this.refreshFeeds();
  }

  private bindHash(): void {
    window.addEventListener('hashchange', () => {
      this.syncFromHash();
      this.render();
    });
    this.syncFromHash();
  }

  private syncFromHash(): void {
    const raw = window.location.hash.replace(/^#/, '');
    if (raw.startsWith('mission/')) {
      const id = raw.slice('mission/'.length);
      if (MissionBook.byId(id)) {
        this.view = 'detail';
        this.selectedId = id;
        return;
      }
    }
    this.view = 'room';
    this.selectedId = null;
  }

  private navigate(hash: string): void {
    window.location.hash = hash;
  }

  private async refreshFeeds(): Promise<void> {
    this.abort?.abort();
    this.abort = new AbortController();
    const { signal } = this.abort;

    try {
      this.quakes = await LiveFeeds.fetchEarthquakes(signal);
    } catch {
      this.quakes = {
        id: 'usgs-quakes',
        label: 'USGS Earthquakes',
        status: 'degraded',
        sourceUrl: LiveFeeds.USGS_SOURCE,
        attribution: 'Credit: U.S. Geological Survey',
        commercialOk: true,
        lastUpdated: new Date().toISOString(),
        items: [],
        error: 'Fetch aborted or failed',
      };
    }

    // Optional aircraft: sample Hormuz only — honest degrade if CORS blocks
    const hormuz = MissionBook.byId('hormuz');
    if (hormuz) {
      this.aircraftSample = await LiveFeeds.fetchAircraftNear(
        hormuz.id,
        hormuz.camera.lat,
        hormuz.camera.lon,
        120,
        signal,
      );
    }

    if (this.view === 'room') this.render();
  }

  private render(): void {
    if (this.view === 'detail' && this.selectedId) {
      const mission = MissionBook.byId(this.selectedId);
      if (mission) {
        this.root.innerHTML = this.shell(this.renderDetail(mission));
        this.wireDetail(mission);
        return;
      }
    }
    this.root.innerHTML = this.shell(this.renderRoom());
    this.wireRoom();
  }

  private shell(body: string): string {
    return `
      <div class="app-shell">
        <div class="banner-class" role="status">
          <span>UNCLASSIFIED // PUBLIC SOURCES ONLY</span>
          <span class="sub">No keys required to boot · OSINT desk companion</span>
        </div>
        <header class="topbar">
          <div class="brand">
            <div class="brand-mark" aria-hidden="true"></div>
            <div>
              <h1>Chokepoint Pulse Desk</h1>
              <p class="aka">Also branded · Situation Brief</p>
            </div>
          </div>
          <div class="hero-meta" style="margin:0">
            <span class="chip ok">commercial_ok · editorial</span>
            <span class="chip">GEV @ ${this.escape(GEV_BASE)}</span>
          </div>
        </header>
        ${body}
        <footer class="footer">
          <div><strong>Attribution:</strong> Deep-links target
            <a href="https://github.com/bilawalsidhu/gods-eye-view" rel="noopener noreferrer" target="_blank">God's Eye View</a>
            by Bilawal Sidhu (MIT for GEV source). This desk does not fork or vendor Cesium/GEV.
            maptheworld.ai is Substack — not the app. Local GEV defaults to
            <code>http://localhost:4173</code>.</div>
          <div><strong>License:</strong> MIT for Chokepoint Pulse Desk. Live quake tape: USGS public domain.
            Optional aircraft: adsb.lol ODbL when reachable.</div>
          <div><strong>Honesty:</strong> Never invent live headlines or vessel/aircraft counts.
            Chips read live · degraded · EXAMPLE.</div>
        </footer>
        <div class="toast" id="toast" role="status" aria-live="polite"></div>
      </div>
    `;
  }

  private renderRoom(): string {
    const cards = MissionBook.all()
      .map((m, i) => this.renderCard(m, i + 1))
      .join('');

    return `
      <section class="hero" data-proof="hero">
        <p class="hero-kicker">Situation Room</p>
        <h2>Five chokepoints. One pulse.</h2>
        <p class="hero-job">GEV is the eye; we ship the pulse.</p>
        <p>
          Thin intelligence desk companion for
          <a href="https://github.com/bilawalsidhu/gods-eye-view" rel="noopener noreferrer" target="_blank">God's Eye View</a>.
          We own editorial briefing cards and share-link routing. GEV owns the globe.
          Open any mission to hand a camera + sensor look into local GEV.
        </p>
        <div class="hero-meta">
          <span class="chip">Desktop-first</span>
          <span class="chip">Keyless boot</span>
          <span class="chip">Share-link encoder</span>
        </div>
      </section>

      <div class="section-head">
        <h3>Mission gallery</h3>
        <span class="hint">Click a card for ops brief · primary CTA opens GEV</span>
      </div>
      <section class="gallery" data-proof="gallery" aria-label="Chokepoint missions">
        ${cards}
      </section>

      <div class="section-head">
        <h3>Live public tickers</h3>
        <span class="hint">Keyless · source URL stamped · no invented numbers</span>
      </div>
      <section class="ticker-panel" data-proof="ticker" aria-label="Live tickers">
        ${this.renderTickers()}
      </section>
    `;
  }

  private renderCard(m: Mission, index: number): string {
    const gevUrl = MissionBook.gevUrl(m, GEV_BASE);
    const badges = [
      m.commercialOk ? `<span class="chip ok">commercial_ok</span>` : '',
      m.exampleBadge ? `<span class="chip example">EXAMPLE</span>` : '',
      `<span class="chip">${this.escape(m.sensorLook)}</span>`,
    ].join('');

    return `
      <article class="mission-card" data-mission="${this.escape(m.id)}" tabindex="0" role="button" aria-label="Open briefing for ${this.escape(m.title)}">
        <div class="card-top">
          <span class="card-index">CP-${String(index).padStart(2, '0')}</span>
          <span class="card-time">${this.escape(this.fmtTime(m.editorialUpdated))}</span>
        </div>
        <h3 class="card-title">${this.escape(m.title)}</h3>
        <p class="card-region">${this.escape(m.region)}</p>
        <p class="card-pulse">${this.escape(m.pulseLine)}</p>
        <div class="card-meta">${badges}</div>
        <div class="card-actions">
          <a class="btn btn-primary" href="${this.escape(gevUrl)}" target="_blank" rel="noopener noreferrer" data-gev-link>
            Open in God's Eye View
          </a>
          <button type="button" class="btn btn-ghost" data-open-detail="${this.escape(m.id)}">Ops brief</button>
        </div>
      </article>
    `;
  }

  private renderTickers(): string {
    const q = this.quakes;
    const a = this.aircraftSample;

    const qChip = q
      ? `<span class="chip ${q.status.toLowerCase()}">${q.status}</span>`
      : `<span class="chip degraded">loading</span>`;

    const quakeRows =
      q && q.items.length > 0
        ? `<ul class="ticker-list">${q.items
            .map(
              (item) => `
          <li class="ticker-item">
            <span class="mag">M${item.mag?.toFixed(1) ?? '?'}</span>
            <a class="place" href="${this.escape(item.url)}" target="_blank" rel="noopener noreferrer">${this.escape(item.place)}</a>
            <span class="when">${this.escape(this.fmtTime(new Date(item.time).toISOString()))}</span>
          </li>`,
            )
            .join('')}</ul>`
        : `<p class="empty-note">${
            q?.status === 'live'
              ? 'No M4.5+ events in the current USGS day feed window.'
              : q?.error
                ? `Feed degraded: ${this.escape(q.error)}`
                : 'Loading USGS GeoJSON…'
          }</p>`;

    const aChip = a
      ? `<span class="chip ${a.status.toLowerCase()}">${a.status}</span>`
      : `<span class="chip example">EXAMPLE</span>`;

    const airBody =
      a && a.items.length > 0
        ? `<ul class="ticker-list">${a.items
            .map(
              (ac) => `
          <li class="ticker-item">
            <span class="mag">${this.escape(ac.callsign ?? ac.icao)}</span>
            <span class="place">${ac.lat.toFixed(2)}, ${ac.lon.toFixed(2)} · ${
              ac.altFt != null ? `${ac.altFt} ft` : 'alt n/a'
            }</span>
            <span class="when">${this.escape(ac.icao)}</span>
          </li>`,
            )
            .join('')}</ul>`
        : `<p class="empty-note">${
            a?.note
              ? this.escape(a.note)
              : 'Optional adsb.lol probe — awaiting response or marked EXAMPLE if blocked.'
          }</p>`;

    return `
      <div class="ticker-grid">
        <div>
          <div class="section-head" style="margin-bottom:0.35rem">
            <h3 style="font-size:0.8rem">USGS earthquakes</h3>
            ${qChip}
          </div>
          ${quakeRows}
          <p class="feed-foot">
            ${q ? this.escape(q.attribution) : ''} ·
            source <a href="${this.escape(q?.sourceUrl ?? LiveFeeds.USGS_SOURCE)}" target="_blank" rel="noopener noreferrer">${this.escape(q?.sourceUrl ?? LiveFeeds.USGS_SOURCE)}</a>
            · updated ${this.escape(q?.lastUpdated ?? '—')}
          </p>
        </div>
        <div>
          <div class="section-head" style="margin-bottom:0.35rem">
            <h3 style="font-size:0.8rem">Aircraft (optional)</h3>
            ${aChip}
          </div>
          ${airBody}
          <p class="feed-foot">
            ${a ? this.escape(a.attribution) : 'adsb.lol'} ·
            ${
              a
                ? `source <a href="${this.escape(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">${this.escape(a.sourceUrl)}</a>`
                : 'keyless bbox/point when CORS allows'
            }
            · updated ${this.escape(a?.lastUpdated ?? '—')}
          </p>
        </div>
      </div>
    `;
  }

  private renderDetail(m: Mission): string {
    const state = MissionBook.toShareState(m);
    const gevUrl = GevShareLink.buildUrl(state, { baseUrl: GEV_BASE });
    const hash = GevShareLink.encodeHash(state);

    return `
      <div class="detail-view" data-proof="detail">
        <div class="detail-nav">
          <button type="button" class="btn" data-back>← Situation Room</button>
        </div>
        <section class="detail-hero">
          <p class="hero-kicker">${this.escape(m.region)}</p>
          <h2>${this.escape(m.title)}</h2>
          <p class="hero-job">${this.escape(m.pulseLine)}</p>
          <div class="hero-meta">
            <span class="chip ok">commercial_ok</span>
            <span class="chip">${this.escape(m.sensorLook)}</span>
            <span class="chip">editorial ${this.escape(this.fmtTime(m.editorialUpdated))}</span>
          </div>
          <div class="card-actions" style="margin-top:1rem">
            <a class="btn btn-primary" href="${this.escape(gevUrl)}" target="_blank" rel="noopener noreferrer">Open in God's Eye View</a>
            <button type="button" class="btn" data-copy-link>Copy GEV link</button>
            <button type="button" class="btn btn-ghost" data-copy-hash>Copy hash</button>
          </div>
        </section>
        <div class="detail-grid">
          <div class="panel">
            <h3>Ops brief</h3>
            <p>${this.escape(m.opsBrief)}</p>
            <h3>Why it matters</h3>
            <p>${this.escape(m.whyItMatters)}</p>
            <div class="ethics">
              <h3>Ethics</h3>
              <p>${this.escape(m.ethicsNote)}</p>
            </div>
          </div>
          <div>
            <div class="panel" style="margin-bottom:1rem">
              <h3>Recommended sensor look</h3>
              <p><strong style="color:var(--cyan)">${this.escape(m.sensorLook)}</strong> — ${this.escape(m.sensorRationale)}</p>
              <h3>Shot / camera notes</h3>
              <p>${this.escape(m.shotNotes)}</p>
            </div>
            <div class="panel">
              <h3>GEV share link</h3>
              <div class="coord-block" data-share-url>${this.escape(gevUrl)}</div>
              <p style="margin-top:0.75rem;font-size:0.75rem;font-family:var(--font-mono);color:var(--ink-faint)">
                lat ${m.camera.lat} · lon ${m.camera.lon} · alt ${m.camera.alt}m<br/>
                hash preview: ${this.escape(hash.slice(0, 72))}…
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private wireRoom(): void {
    this.root.querySelectorAll<HTMLElement>('[data-mission]').forEach((el) => {
      const id = el.dataset.mission!;
      const open = () => this.navigate(`mission/${id}`);
      el.addEventListener('click', (ev) => {
        const t = ev.target as HTMLElement;
        if (t.closest('[data-gev-link]') || t.closest('[data-open-detail]')) return;
        open();
      });
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          open();
        }
      });
    });
    this.root.querySelectorAll<HTMLElement>('[data-open-detail]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.navigate(`mission/${btn.dataset.openDetail}`);
      });
    });
    this.root.querySelectorAll('[data-gev-link]').forEach((a) => {
      a.addEventListener('click', (ev) => ev.stopPropagation());
    });
  }

  private wireDetail(m: Mission): void {
    this.root.querySelector('[data-back]')?.addEventListener('click', () => {
      this.navigate('');
    });
    const url = MissionBook.gevUrl(m, GEV_BASE);
    const hash = GevShareLink.encodeHash(MissionBook.toShareState(m));
    this.root.querySelector('[data-copy-link]')?.addEventListener('click', () => {
      void this.copy(url, 'GEV link copied');
    });
    this.root.querySelector('[data-copy-hash]')?.addEventListener('click', () => {
      void this.copy(hash, 'Hash copied');
    });
  }

  private async copy(text: string, okMsg: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toast(okMsg);
    } catch {
      this.toast('Clipboard blocked — select the link manually');
    }
  }

  private toast(msg: string): void {
    const el = this.root.querySelector('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 2200);
  }

  private fmtTime(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
    } catch {
      return iso;
    }
  }

  private escape(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
