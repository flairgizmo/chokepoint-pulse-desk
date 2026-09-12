import { episodeById, episodesNewestFirst, type Episode } from '../data/podcast';
import { esc } from './html';

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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
  return `
    <section class="player" data-player data-audio="${esc(ep.audioSrc)}" data-video="${esc(ep.videoSrc)}">
      <div class="player-stage">
        <video class="player-video" poster="${esc(ep.posterSrc)}" playsinline loop muted></video>
        <div class="player-scrim">
          <p class="kicker">Episode ${String(ep.n).padStart(2, '0')} · ${esc(ep.hostName)}</p>
          <h2 class="display">${esc(ep.title)}</h2>
        </div>
      </div>
      <audio preload="metadata"></audio>
      <div class="player-controls">
        <button type="button" class="player-play" data-play aria-label="Play">Play</button>
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
      <p class="player-byline"><strong>${esc(ep.hostName)}</strong> · ${esc(ep.hostTitle)}</p>
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
  };

  play.addEventListener('click', () => {
    if (audio.paused) {
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
  });
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
