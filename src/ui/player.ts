import { episodeById, episodeByN, episodesInOrder, type Episode } from '../data/podcast';
import { esc } from './html';

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function playerMarkup(ep: Episode, playlist = episodesInOrder()): string {
  const list = playlist
    .map(
      (item) => `<li>
        <a class="pod-item${item.id === ep.id ? ' is-on' : ''}" href="/podcast/${esc(item.id)}">
          <span class="n">${String(item.n).padStart(2, '0')}</span>
          <span>
            <strong>${esc(item.title)}</strong>
            <em>James Hale and Amelia Crowe</em>
          </span>
        </a>
      </li>`,
    )
    .join('');
  const quotes = ep.quotes
    .map(
      (q) => `<blockquote class="quote-card">
        <p>${esc(q.text)}</p>
        <footer><strong>${esc(q.who)}</strong><span>${esc(q.role)}</span></footer>
      </blockquote>`,
    )
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
        `<a class="series-dot${item.id === ep.id ? ' is-on' : ''}" href="/podcast/${esc(item.id)}" aria-label="Episode ${item.n}">${String(item.n).padStart(2, '0')}</a>`,
    )
    .join('');
  return `
    <section class="player" data-player data-audio="${esc(ep.audioSrc)}" data-video="${esc(ep.videoSrc)}" data-next="${next ? `/podcast/${esc(next.id)}` : ''}">
      <div class="player-stage">
        <video class="player-video" poster="${esc(ep.posterSrc)}" playsinline loop muted></video>
        <canvas class="player-wave" data-wave aria-hidden="true"></canvas>
        <div class="player-scrim">
          <p class="kicker">Episode ${String(ep.n).padStart(2, '0')} · James Hale and Amelia Crowe</p>
          <h2 class="display">${esc(ep.title)}</h2>
        </div>
      </div>
      <audio preload="metadata"></audio>
      <div class="player-controls">
        <button type="button" class="player-skip" data-skip="-15" aria-label="Back fifteen seconds">−15</button>
        <button type="button" class="player-play" data-play aria-label="Play">Play</button>
        <button type="button" class="player-skip" data-skip="15" aria-label="Forward fifteen seconds">+15</button>
        <input type="range" min="0" max="1000" value="0" data-seek aria-label="Seek" />
        <span class="mono" data-time>0:00 / —</span>
        <label class="player-toggle"><input type="checkbox" data-video-on checked /> Video</label>
        <label class="sr-only" for="pod-rate">Speed</label>
        <select id="pod-rate" data-rate>
          <option value="0.9">0.9×</option>
          <option value="1" selected>1×</option>
          <option value="1.1">1.1×</option>
        </select>
      </div>
      <p class="player-byline">
        <span class="host-tile james" aria-hidden="true">JH</span>
        <span class="host-tile amelia" aria-hidden="true">AC</span>
        <strong>James Hale</strong> and <strong>Amelia Crowe</strong> · correspondents · series ${String(ep.n).padStart(2, '0')} of 20
      </p>
      <nav class="series-dots" aria-label="Series">${dots}</nav>
      <nav class="player-adjacent">
        ${prev ? `<a class="text-link" href="/podcast/${esc(prev.id)}">← ${esc(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a class="text-link" href="/podcast/${esc(next.id)}">${esc(next.title)} →</a>` : '<span></span>'}
      </nav>
    </section>
    <section class="pod-quotes">
      <p class="kicker">In this episode</p>
      ${quotes}
    </section>
    <details class="pod-transcript" open>
      <summary>The conversation</summary>
      ${bubbles}
    </details>
    <nav class="pod-list" aria-label="All episodes">
      <p class="kicker">The series, in order</p>
      <ol>${list}</ol>
    </nav>`;
}

export function wirePlayer(root: HTMLElement): void {
  const box = root.querySelector<HTMLElement>('[data-player]');
  if (!box) return;
  const audio = box.querySelector('audio');
  const video = box.querySelector('video');
  const play = box.querySelector<HTMLButtonElement>('[data-play]');
  const seek = box.querySelector<HTMLInputElement>('[data-seek]');
  const time = box.querySelector('[data-time]');
  const rate = box.querySelector<HTMLSelectElement>('[data-rate]');
  const videoOn = box.querySelector<HTMLInputElement>('[data-video-on]');
  const wave = box.querySelector<HTMLCanvasElement>('[data-wave]');
  if (!audio || !video || !play || !seek || !time || !rate || !videoOn) return;

  audio.src = box.dataset.audio ?? '';
  video.src = box.dataset.video ?? '';

  const syncVideo = (): void => {
    if (!video.duration) return;
    video.currentTime = audio.currentTime % video.duration;
  };

  const paint = (): void => {
    const dur = audio.duration || 0;
    time.textContent = `${fmtTime(audio.currentTime)} / ${fmtTime(dur)}`;
    if (dur) seek.value = String(Math.round((audio.currentTime / dur) * 1000));
    if (wave) {
      const ctx = wave.getContext('2d');
      if (ctx) {
        const w = (wave.width = wave.clientWidth || 640);
        const h = (wave.height = wave.clientHeight || 72);
        ctx.clearRect(0, 0, w, h);
        const bars = 48;
        const progress = dur ? audio.currentTime / dur : 0;
        for (let i = 0; i < bars; i += 1) {
          const x = (i / bars) * w;
          const amp = 0.28 + 0.72 * Math.abs(Math.sin(i * 0.55 + audio.currentTime * 3.1));
          const bh = h * amp * (audio.paused ? 0.45 : 1);
          ctx.fillStyle = i / bars <= progress ? 'rgba(62, 224, 178, 0.85)' : 'rgba(255,255,255,0.28)';
          ctx.fillRect(x + 2, h - bh, Math.max(2, w / bars - 4), bh);
        }
      }
    }
  };

  const setPlaying = (on: boolean): void => {
    if (on) {
      void audio.play();
      if (videoOn.checked) {
        syncVideo();
        void video.play();
      }
      play.textContent = 'Pause';
    } else {
      audio.pause();
      video.pause();
      play.textContent = 'Play';
    }
  };

  play.addEventListener('click', () => setPlaying(audio.paused));

  box.querySelectorAll<HTMLButtonElement>('[data-skip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + Number(btn.dataset.skip)));
      syncVideo();
      paint();
    });
  });

  seek.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    syncVideo();
  });

  rate.addEventListener('change', () => {
    audio.playbackRate = Number(rate.value);
    video.playbackRate = Number(rate.value);
  });

  videoOn.addEventListener('change', () => {
    video.style.opacity = videoOn.checked ? '1' : '0';
    if (videoOn.checked && !audio.paused) {
      syncVideo();
      void video.play();
    } else {
      video.pause();
    }
  });

  audio.addEventListener('timeupdate', () => {
    paint();
    if (!video.paused && video.duration && Math.abs(video.currentTime - (audio.currentTime % video.duration)) > 0.8) {
      syncVideo();
    }
  });
  audio.addEventListener('loadedmetadata', paint);
  audio.addEventListener('waiting', () => play.classList.add('is-loading'));
  audio.addEventListener('canplay', () => play.classList.remove('is-loading'));
  audio.addEventListener('error', () => {
    play.classList.remove('is-loading');
    play.disabled = true;
    time.textContent = 'Audio unavailable';
  });
  video.addEventListener('error', () => {
    videoOn.checked = false;
    video.style.opacity = '0';
  });
  audio.addEventListener('ended', () => {
    video.pause();
    play.textContent = 'Play';
    const href = box.dataset.next;
    if (href) window.location.assign(href);
  });

  window.setInterval(() => {
    if (!audio.paused) paint();
  }, 160);
}

export function relatedEpisodeCard(id: string): string {
  const ep = episodeById(id);
  if (!ep) return '';
  return `<a class="pod-tease" href="/podcast/${esc(ep.id)}">
    <video muted loop playsinline poster="${esc(ep.posterSrc)}" src="${esc(ep.videoSrc)}"></video>
    <span>
      <p class="kicker">Podcast · Episode ${String(ep.n).padStart(2, '0')}</p>
      <strong>${esc(ep.title)}</strong>
      <em>James Hale and Amelia Crowe</em>
    </span>
  </a>`;
}
