import { sourceUrl } from '../data/catalog';
import { esc, extLink } from './html';

export interface StageDoc {
  id: string;
  kind: string;
  title: string;
  kicker?: string;
  body: string;
  analogy?: string;
  facts?: Array<{ label: string; value: string }>;
  related?: Array<{ label: string; href: string }>;
  original?: { href: string; label: string };
  visual: string;
}

type Resolver = (kind: string, id: string, el?: HTMLElement) => StageDoc | null;

let docBound = false;

export function stageMarkup(): string {
  return `<div class="desk-stage" id="desk-stage" hidden>
    <div class="desk-stage-backdrop" data-stage-close></div>
    <div class="desk-stage-panel" role="dialog" aria-modal="true" aria-labelledby="desk-stage-title" tabindex="-1">
      <button type="button" class="desk-stage-close" data-stage-close aria-label="Close story">Close</button>
      <div class="desk-stage-visual" id="desk-stage-visual"></div>
      <div class="desk-stage-copy">
        <p class="kicker" id="desk-stage-kicker"></p>
        <h2 id="desk-stage-title"></h2>
        <div id="desk-stage-body"></div>
      </div>
    </div>
  </div>`;
}

export function openStage(root: HTMLElement, doc: StageDoc): void {
  const wrap = root.querySelector<HTMLElement>('#desk-stage');
  const panel = root.querySelector<HTMLElement>('.desk-stage-panel');
  const visual = root.querySelector('#desk-stage-visual');
  const kicker = root.querySelector('#desk-stage-kicker');
  const title = root.querySelector('#desk-stage-title');
  const body = root.querySelector('#desk-stage-body');
  if (!wrap || !panel || !visual || !kicker || !title || !body) return;

  wrap.dataset.scroll = String(window.scrollY);
  kicker.textContent = doc.kicker || doc.kind;
  title.textContent = doc.title;
  visual.innerHTML = doc.visual;
  const facts = doc.facts?.length
    ? `<dl class="stage-facts">${doc.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`
    : '';
  const analogy = doc.analogy ? `<p class="stage-analogy"><strong>In one analogy.</strong> ${esc(doc.analogy)}</p>` : '';
  const related = doc.related?.length
    ? `<p class="stage-related">${doc.related.map((r) => `<a href="${esc(r.href)}">${esc(r.label)}</a>`).join(' · ')}</p>`
    : '';
  const original = doc.original
    ? `<p class="stage-original">${extLink(doc.original.href.startsWith('http') ? doc.original.href : sourceUrl(doc.original.href), doc.original.label)}</p>`
    : '';
  body.innerHTML = `<p>${esc(doc.body)}</p>${analogy}${facts}${related}${original}`;
  wrap.hidden = false;
  document.body.classList.add('stage-open');
  const hash = `#stage/${encodeURIComponent(doc.kind)}/${encodeURIComponent(doc.id)}`;
  if (location.hash !== hash) history.replaceState({}, '', `${location.pathname}${hash}`);
  panel.focus({ preventScroll: true });
}

export function closeStage(root: HTMLElement): void {
  const wrap = root.querySelector<HTMLElement>('#desk-stage');
  if (!wrap || wrap.hidden) return;
  wrap.hidden = true;
  document.body.classList.remove('stage-open');
  const y = Number(wrap.dataset.scroll || 0);
  if (location.hash.startsWith('#stage/')) history.replaceState({}, '', location.pathname);
  window.scrollTo(0, y);
}

export function wireStages(root: HTMLElement, resolve: Resolver): void {
  const wrap = root.querySelector<HTMLElement>('#desk-stage');
  if (!wrap) return;

  const openFromEl = (el: HTMLElement): void => {
    const kind = el.dataset.stage;
    const id = el.dataset.stageId;
    if (!kind || !id) return;
    const doc = resolve(kind, id, el);
    if (doc) openStage(root, doc);
  };

  if (root.dataset.stageBound === '1') {
    const raw = location.hash.replace(/^#stage\//, '');
    if (location.hash.startsWith('#stage/')) {
      const [kind, id] = raw.split('/').map((s) => decodeURIComponent(s));
      const doc = kind && id ? resolve(kind, id) : null;
      if (doc) openStage(root, doc);
    }
    return;
  }
  root.dataset.stageBound = '1';

  root.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    if (target.closest('[data-stage-close]')) {
      ev.preventDefault();
      closeStage(root);
      return;
    }
    const hit = target.closest<HTMLElement>('[data-stage]');
    if (!hit) return;
    if (hit.tagName === 'A' || hit.tagName === 'BUTTON') ev.preventDefault();
    openFromEl(hit);
  });

  if (!docBound) {
    docBound = true;
    document.addEventListener('keydown', (ev) => {
      const live = document.querySelector<HTMLElement>('#desk-stage');
      if (!live || live.hidden) return;
      const host = live.closest('#app') ?? document.body;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeStage(host as HTMLElement);
        return;
      }
      if (ev.key !== 'Tab') return;
      const panel = live.querySelector<HTMLElement>('.desk-stage-panel');
      if (!panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    });
  }

  const raw = location.hash.replace(/^#stage\//, '');
  if (location.hash.startsWith('#stage/')) {
    const [kind, id] = raw.split('/').map((s) => decodeURIComponent(s));
    const doc = kind && id ? resolve(kind, id) : null;
    if (doc) openStage(root, doc);
  }
}
