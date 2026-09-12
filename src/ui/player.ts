import { episodeById, episodeByN, episodesNewestFirst, type Episode } from '../data/podcast';
import { esc } from './html';

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function hostInitial(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2);
}

export function playerMarkup(ep: Episode, playlist = episodesNewestFirst()): string {
  const list = playlist
    .map(
      (item) => `<li>
        <a class="pod-item${item.id === ep.id ? ' is-on' : ''}" href="/podcast/${esc(item.id)}">
          <span class="n">${String(item.n).padStart(2, '0')}</span>
          <span>
            <strong>${esc(item.title)}</strong>
            <em>${esc(item.hostName)} · ${esc(item.hostTitle)}</em>
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
  const newer = episodeByN(ep.n + 1);
  const older = episodeByN(ep.n - 1);
  return `
    <section class="player" data-player data-audio="${esc(ep.audioSrc)}" data-video="${esc(ep.videoSrc)}" data-next="${older ? `/podcast/${esc(older.id)}` : ''}">
      <div class="player-stage">
        <video class="player-video" poster="${esc(ep.posterSrc)}" playsinline loop muted></video>
        <canvas class="player-wave" data-wave aria-hidden="true"></canvas>
        <div class="player-scrim">
          <p class="kicker">Episode ${String(ep.n).padStart(2, '0')} · ${esc(ep.hostName)}</p>
          <h2 class="display">${esc(ep.title)}</h2>
        </div>
      </div>
      <audio preload="metadata"></audio>
      <div class="player-controls">
        <button type="button" class="player-skip" data-skip="-15" aria-label="Back fifteen seconds">−15</button>
        <button type="button" class="player-play" data-play aria-label="Play">Play</button>
        <button type="button" class="player-skip" data-skip="15" aria-label="Forward fifteen seconds">+15</button>
        <input type="range" min="0" max="1000" value="0" data-seek aria-label="Seek" />
        <span class="mono" data-time>0:00 / ${ep.minutes}:00</span>
        <label class="player-toggle"><input type="checkbox" data-video-on checked /> Video</label>
        <label class="sr-only" for="pod-rate">Speed</label>
        <select id="pod-rate" data-rate>
          <option value="0.9">0.9×</option>
          <option value="1" selected>1×</option>
          <option value="1.1">1.1×</option>
        </select>
      </div>
      <p class="player-byline">
        <span class="host-tile" aria-hidden="true">${esc(hostInitial(ep.hostName))}</span>
        <strong>${esc(ep.hostName)}</strong> · ${esc(ep.hostTitle)} · five-minute film
      </p>
      <nav class="player-adjacent">
        ${newer ? `<a class="text-link" href="/podcast/${esc(newer.id)}">← ${esc(newer.title)}</a>` : '<span></span>'}
        ${older ? `<a class="text-link" href="/podcast/${esc(older.id)}">${esc(older.title)} →</a>` : '<span></span>'}
      </nav>
    </section>
    <section class="pod-quotes">
      <p class="kicker">In this episode</p>
      ${quotes}
    </section>
    <details class="pod-transcript">
      <summary>Transcript</summary>
      <p>${esc(ep.script).replace(/\n\n/g, '</p><p>')}</p>
    </details>
    <nav class="pod-list" aria-label="All episodes">
      <p class="kicker">Latest first</p>
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
      <em>${esc(ep.hostName)} · ${esc(ep.hostTitle)}</em>
    </span>
  </a>`;
}
