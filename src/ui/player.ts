import { quotes } from '../data/catalog';
import { photoFigure, plateFor, PLATES, type Plate } from '../data/plates';
import { cinemaIntro, cinemaStrip, posterFrame } from './diagrams';
import { episodeById, episodeByN, episodesInOrder, type Episode } from '../data/podcast';
import { esc } from './html';

/** One still per episode so the playlist is a film strip, not four recycled beds. */
const EPISODE_STILL: Record<string, Plate> = {
  'internet-of-value': PLATES.fiber,
  'overledger-gateway': PLATES.gateway,
  'qnt-utility': PLATES.exchange,
  'iso-decade': PLATES.zurich,
  lacchain: PLATES.miami,
  rosalind: PLATES.bisTower,
  rln: PLATES.royal,
  gbtd: PLATES.canary,
  'six-banks': PLATES.canaryDay,
  satp: PLATES.geneva,
  fusion: PLATES.cityDay,
  payscript: PLATES.payments,
  'flow-agents': PLATES.city,
  x402: PLATES.cable,
  'oracle-fabric': PLATES.washington,
  murex: PLATES.paris,
  dentsu: PLATES.tokyo,
  'sync-lab': PLATES.boeFacade,
  'sibos-trusted': PLATES.frankfurt,
  'future-money': PLATES.future,
};

function episodeStill(id: string): Plate {
  return EPISODE_STILL[id] ?? plateFor(id);
}

function kick(text: string): string {
  return `<p class="kicker"><i class="section-dot" aria-hidden="true"></i>${esc(text)}</p>`;
}

function quoteStageId(text: string): string | undefined {
  return quotes.find((q) => q.text === text || q.text.startsWith(text.slice(0, 48)))?.id;
}

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function playerMarkup(ep: Episode, playlist = episodesInOrder()): string {
  const list = playlist
    .map((item, i) => {
      return `<li>
        <a class="pod-item${item.id === ep.id ? ' is-on' : ''}" href="/podcast/${esc(item.id)}">
          <img class="pod-still" src="${esc(episodeStill(item.id).src)}" alt="" width="1280" height="720" loading="eager" decoding="async"${i < 2 ? ' fetchpriority="high"' : ''} />
          <span class="n">${String(item.n).padStart(2, '0')}</span>
          <span>
            <strong>${esc(item.title)}</strong>
            <em>James Hale and Amelia Crowe</em>
          </span>
        </a>
      </li>`;
    })
    .join('');
  const quoteCards = ep.quotes
    .map((q) => {
      const id = quoteStageId(q.text);
      const copy = `<span class="qmark" aria-hidden="true">“</span><p>${esc(q.text)}</p><footer><strong>${esc(q.who)}</strong><span>${esc(q.role)}</span></footer>`;
      const still = posterFrame(photoFigure(plateFor(id ?? `pod-${q.who}`), 'quote-still'), copy);
      return id
        ? `<button type="button" class="quote-card" data-stage="quote" data-stage-id="${esc(id)}">${still}</button>`
        : `<blockquote class="quote-card">${still}</blockquote>`;
    })
    .join('');
  const next = episodeByN(ep.n + 1);
  const prev = episodeByN(ep.n - 1);
  const bubbles = ep.script
    .split(/\n\n+/)
    .map((block) => {
      const m = /^(James Hale|Amelia Crowe):\s*([\s\S]+)$/.exec(block.trim());
      if (!m) return `<p>${esc(block)}</p>`;
      const who = m[1] === 'James Hale' ? 'james' : 'amelia';
      return `<p class="pod-line ${who}"><strong>${esc(m[1])}</strong> ${esc(m[2])}</p>`;
    })
    .join('');
  const dots = playlist
    .map(
      (item) =>
        `<a class="series-dot${item.id === ep.id ? ' is-on' : ''}" href="/podcast/${esc(item.id)}" aria-label="Episode ${item.n}"><img src="${esc(episodeStill(item.id).src)}" alt="" width="96" height="54" /><span>${String(item.n).padStart(2, '0')}</span></a>`,
    )
    .join('');
  return `
    <section class="player" data-player data-audio="${esc(ep.audioSrc)}" data-poster="${esc(ep.posterSrc)}" data-next="${next ? `/podcast/${esc(next.id)}` : ''}">
      <div class="player-stage">
        <img class="player-still" src="${esc(episodeStill(ep.id).src)}" alt="" width="1920" height="1080" />
        <canvas class="player-wave" data-wave aria-hidden="true"></canvas>
        <div class="player-scrim">
          <p class="kicker">Episode ${String(ep.n).padStart(2, '0')} · James Hale and Amelia Crowe</p>
          <h2 class="display">${esc(ep.title)}</h2>
        </div>
      </div>
      <audio preload="metadata"></audio>
      <div class="player-controls">
        ${photoFigure(episodeStill(ep.id), 'player-ctrl-still')}
        <div class="player-ctrl-row">
        <button type="button" class="player-skip" data-skip="-15" aria-label="Back fifteen seconds">−15</button>
        <button type="button" class="player-play" data-play aria-label="Play">Play</button>
        <button type="button" class="player-skip" data-skip="15" aria-label="Forward fifteen seconds">+15</button>
        <input type="range" min="0" max="1000" value="0" data-seek aria-label="Seek" />
        <span class="mono" data-time>0:00 / —</span>
        <label class="sr-only" for="pod-rate">Speed</label>
        <select id="pod-rate" data-rate>
          <option value="0.9">0.9×</option>
          <option value="1" selected>1×</option>
          <option value="1.1">1.1×</option>
        </select>
        </div>
      </div>
      ${cinemaStrip(
        'player-byline',
        `<p class="player-byline">
        <span class="host-tile james" aria-hidden="true"><img src="${esc(PLATES.radio.src)}" alt="" width="64" height="64" /><span>JH</span></span>
        <span class="host-tile amelia" aria-hidden="true"><img src="${esc(PLATES.newsroom.src)}" alt="" width="64" height="64" /><span>AC</span></span>
        <strong>James Hale</strong> and <strong>Amelia Crowe</strong> · hosts · series ${String(ep.n).padStart(2, '0')} of 20
      </p>`,
      )}
      <nav class="series-dots" aria-label="Series">${dots}</nav>
      <nav class="player-adjacent">
        ${
          prev
            ? `<a class="player-adj" href="/podcast/${esc(prev.id)}">${posterFrame(
                photoFigure(episodeStill(prev.id), 'player-adj-still'),
                `<span class="kicker">Previous</span><strong>← ${esc(prev.title)}</strong>`,
              )}</a>`
            : ''
        }
        ${
          next
            ? `<a class="player-adj" href="/podcast/${esc(next.id)}">${posterFrame(
                photoFigure(episodeStill(next.id), 'player-adj-still'),
                `<span class="kicker">Next</span><strong>${esc(next.title)} →</strong>`,
              )}</a>`
            : ''
        }
      </nav>
    </section>
    <section class="pod-quotes">
      ${cinemaIntro('intro-pod-quotes', `${kick('In this episode')}<h2 class="display">Lines that stay on the record.</h2>`)}
      ${quoteCards}
    </section>
    <details class="pod-transcript">
      <summary>${cinemaIntro('intro-pod-transcript', `${kick('The conversation')}<h2 class="display">Hale and Crowe, in order.</h2>`)}</summary>
      ${bubbles}
    </details>
    <nav class="pod-list" aria-label="All episodes">
      ${cinemaIntro('intro-pod-list', `${kick('The series, in order')}<h2 class="display">Twenty conversations.</h2>`)}
      <ol>${list}</ol>
    </nav>`;
}

export function wirePlayer(root: HTMLElement): void {
  const box = root.querySelector<HTMLElement>('[data-player]');
  if (!box) return;
  const audio = box.querySelector('audio');
  const play = box.querySelector<HTMLButtonElement>('[data-play]');
  const seek = box.querySelector<HTMLInputElement>('[data-seek]');
  const time = box.querySelector('[data-time]');
  const rate = box.querySelector<HTMLSelectElement>('[data-rate]');
  const wave = box.querySelector<HTMLCanvasElement>('[data-wave]');
  if (!audio || !play || !seek || !time || !rate) return;

  audio.src = box.dataset.audio ?? '';

  const paint = (): void => {
    const dur = audio.duration || 0;
    time.textContent = `${fmtTime(audio.currentTime)} / ${fmtTime(dur)}`;
    if (dur) seek.value = String(Math.round((audio.currentTime / dur) * 1000));
    if (!wave) return;
    const ctx = wave.getContext('2d');
    if (!ctx) return;
    const w = (wave.width = wave.clientWidth || 640);
    const h = (wave.height = wave.clientHeight || 220);
    ctx.clearRect(0, 0, w, h);
    const playing = !audio.paused;
    const progress = dur ? audio.currentTime / dur : 0;
    const cx = w * 0.5;
    const cy = h * 0.42;
    const rings = 4;
    for (let r = 0; r < rings; r += 1) {
      const rad = Math.min(w, h) * (0.16 + r * 0.07);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 201, 167, ${playing ? 0.18 + r * 0.08 : 0.1})`;
      ctx.lineWidth = 1.2;
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
    }
    const bars = 56;
    const t = audio.currentTime;
    for (let i = 0; i < bars; i += 1) {
      const a = (i / bars) * Math.PI * 2 - Math.PI / 2;
      const amp = 0.22 + 0.78 * Math.abs(Math.sin(i * 0.41 + t * 2.6));
      const inner = Math.min(w, h) * 0.14;
      const outer = inner + Math.min(w, h) * 0.2 * amp * (playing ? 1 : 0.45);
      ctx.strokeStyle = i / bars <= progress ? 'rgba(0, 201, 167, 0.95)' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = Math.max(2, w / 180);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
      ctx.stroke();
    }
    for (let i = 0; i < 48; i += 1) {
      const x = (i / 48) * w;
      const amp = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.55 + t * 3.1));
      const bh = (h * 0.22) * amp * (playing ? 1 : 0.4);
      ctx.fillStyle = i / 48 <= progress ? 'rgba(21, 80, 255, 0.85)' : 'rgba(255,255,255,0.18)';
      ctx.fillRect(x + 2, h - bh - 8, Math.max(2, w / 48 - 4), bh);
    }
  };

  const setPlaying = (on: boolean): void => {
    if (on) {
      void audio.play();
      play.textContent = 'Pause';
    } else {
      audio.pause();
      play.textContent = 'Play';
    }
  };

  play.addEventListener('click', () => setPlaying(audio.paused));

  box.querySelectorAll<HTMLButtonElement>('[data-skip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + Number(btn.dataset.skip)));
      paint();
    });
  });

  seek.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
  });

  rate.addEventListener('change', () => {
    audio.playbackRate = Number(rate.value);
  });

  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('loadedmetadata', paint);
  audio.addEventListener('waiting', () => play.classList.add('is-loading'));
  audio.addEventListener('canplay', () => play.classList.remove('is-loading'));
  audio.addEventListener('error', () => {
    play.classList.remove('is-loading');
    play.disabled = true;
    time.textContent = 'Audio unavailable';
  });
  audio.addEventListener('ended', () => {
    play.textContent = 'Play';
    const href = box.dataset.next;
    if (href) window.location.assign(href);
  });

  window.setInterval(() => {
    if (!audio.paused) paint();
  }, 160);
  paint();
}

export function relatedEpisodeCard(id: string): string {
  const ep = episodeById(id);
  if (!ep) return '';
  return `<a class="pod-tease" href="/podcast/${esc(ep.id)}">${posterFrame(
    photoFigure(episodeStill(ep.id), 'pod-tease-still'),
    `<p class="kicker">Podcast · Episode ${String(ep.n).padStart(2, '0')}</p>
      <strong>${esc(ep.title)}</strong>
      <em>James Hale and Amelia Crowe</em>`,
  )}</a>`;
}
