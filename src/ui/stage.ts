import { sourceUrl } from '../data/catalog';
import { esc, extLink } from './html';
import { forceGrokIdle } from './chat';
import { sameDeskPath, stageRoute, type RelatedChip } from './relate';

export interface StageDoc {
  id: string;
  kind: string;
  title: string;
  kicker?: string;
  stake?: string;
  body: string;
  analogy?: string;
  fact?: string;
  facts?: Array<{ label: string; value: string }>;
  related?: RelatedChip[];
  original?: { href: string; label: string };
  visual: string;
}

type Resolver = (kind: string, id: string, el?: HTMLElement) => StageDoc | null;

interface OpenOpts {
  fromHistory?: boolean;
  el?: HTMLElement;
}

let docBound = false;
let resolveFn: Resolver | null = null;
let navigateFn: ((path: string) => void) | null = null;
let stack: StageDoc[] = [];
let current: StageDoc | null = null;
let openedHere = false;
let returnFocus: HTMLElement | null = null;

export function setStageNavigator(fn: (path: string) => void): void {
  navigateFn = fn;
}

export function stageMarkup(): string {
  return `<div class="desk-stage" id="desk-stage" hidden>
    <div class="desk-stage-backdrop" data-stage-close></div>
    <div class="desk-stage-sheet" role="dialog" aria-modal="true" aria-labelledby="desk-stage-title" aria-describedby="desk-stage-stake" tabindex="-1">
      <header class="desk-stage-head">
        <p class="kicker" id="desk-stage-kicker"></p>
        <button type="button" class="desk-stage-close" data-stage-close aria-label="Close stage">Esc</button>
        <h2 class="display" id="desk-stage-title"></h2>
        <p class="desk-stage-stake" id="desk-stage-stake"></p>
      </header>
      <div class="desk-stage-split">
        <div class="desk-stage-object" id="desk-stage-visual"></div>
        <div class="desk-stage-story" id="desk-stage-body"></div>
      </div>
      <footer class="desk-stage-foot" id="desk-stage-foot"></footer>
    </div>
  </div>`;
}

function parseStageHash(): { kind: string; id: string } | null {
  if (!location.hash.startsWith('#stage/')) return null;
  const raw = location.hash.replace(/^#stage\//, '');
  const [kind, id] = raw.split('/').map((s) => decodeURIComponent(s));
  if (!kind || !id) return null;
  return { kind, id };
}

function stageHash(doc: StageDoc): string {
  return `#stage/${encodeURIComponent(doc.kind)}/${encodeURIComponent(doc.id)}`;
}

function focusables(panel: HTMLElement): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])')].filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
  );
}

function paint(root: HTMLElement, doc: StageDoc): void {
  const wrap = root.querySelector<HTMLElement>('#desk-stage');
  const panel = root.querySelector<HTMLElement>('.desk-stage-sheet');
  const visual = root.querySelector('#desk-stage-visual');
  const kicker = root.querySelector('#desk-stage-kicker');
  const title = root.querySelector('#desk-stage-title');
  const stake = root.querySelector('#desk-stage-stake');
  const body = root.querySelector('#desk-stage-body');
  const foot = root.querySelector('#desk-stage-foot');
  if (!wrap || !panel || !visual || !kicker || !title || !stake || !body || !foot) return;

  current = doc;
  kicker.textContent = doc.kicker || doc.kind;
  title.textContent = doc.title;
  stake.textContent = doc.stake || '';
  visual.innerHTML = doc.visual;

  const sourced = doc.fact
    ? `<p class="stage-fact"><strong>On the record.</strong> ${esc(doc.fact)}</p>`
    : '';
  const facts = doc.facts?.length
    ? `<dl class="stage-facts">${doc.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`
    : '';
  body.innerHTML = `<p>${esc(doc.body)}</p>${sourced}${facts}`;

  const crumb = stack.length
    ? `<button type="button" class="stage-crumb" data-stage-back>← ${esc(stack[stack.length - 1].title)}</button>`
    : '';
  const relatedChips = (doc.related ?? []).filter((r) => !(r.kind === doc.kind && r.id === doc.id));
  const related = relatedChips.length
    ? `<div class="stage-related" aria-label="Related">${relatedChips
        .map(
          (r) =>
            `<button type="button" class="stage-chip" data-stage="${esc(r.kind)}" data-stage-id="${esc(r.id)}">${esc(r.label)}</button>`,
        )
        .join('')}</div>`
    : '';
  const original = doc.original
    ? `<p class="stage-original">${extLink(doc.original.href.startsWith('http') ? doc.original.href : sourceUrl(doc.original.href), doc.original.label || 'Open original')}</p>`
    : '';
  foot.innerHTML = `${crumb}${related}<div class="stage-actions"><button type="button" class="btn btn-primary" data-stage-close>Stay</button>${original}</div>`;

  wrap.hidden = false;
  wrap.dataset.kind = doc.kind;
  document.body.classList.add('stage-open');
  forceGrokIdle();
  panel.focus({ preventScroll: true });
}

function hide(root: HTMLElement, restore = true): void {
  const wrap = root.querySelector<HTMLElement>('#desk-stage');
  if (!wrap || wrap.hidden) return;
  wrap.hidden = true;
  document.body.classList.remove('stage-open');
  const y = Number(wrap.dataset.scroll || 0);
  stack = [];
  current = null;
  if (restore) {
    window.scrollTo(0, y);
    returnFocus?.focus?.({ preventScroll: true });
  }
  returnFocus = null;
  openedHere = false;
}

export function openStage(root: HTMLElement, doc: StageDoc, opts: OpenOpts = {}): void {
  const wrap = root.querySelector<HTMLElement>('#desk-stage');
  if (!wrap) return;
  const wasOpen = !wrap.hidden && current;
  if (!wasOpen) {
    wrap.dataset.scroll = String(window.scrollY);
    if (!opts.fromHistory) {
      const active = document.activeElement;
      returnFocus = active instanceof HTMLElement ? active : null;
    }
    stack = [];
  } else if (current && (current.kind !== doc.kind || current.id !== doc.id)) {
    if (stack.length >= 1) stack[0] = stack[0];
    if (stack.length >= 1) {
      stack[stack.length - 1] = current;
    } else {
      stack.push(current);
    }
    if (stack.length > 1) stack = stack.slice(-1);
  }

  paint(root, doc);

  const hash = stageHash(doc);
  if (opts.fromHistory) {
    if (location.hash !== hash) history.replaceState({}, '', `${location.pathname}${location.search}${hash}`);
    return;
  }
  if (location.hash !== hash) {
    history.pushState({ stage: true, kind: doc.kind, id: doc.id }, '', `${location.pathname}${location.search}${hash}`);
    openedHere = true;
  }
}

export function closeStage(root: HTMLElement, fromHistory = false): void {
  const wrap = root.querySelector<HTMLElement>('#desk-stage');
  if (!wrap || wrap.hidden) return;
  if (!fromHistory && openedHere && location.hash.startsWith('#stage/')) {
    history.back();
    return;
  }
  if (location.hash.startsWith('#stage/')) {
    history.replaceState({}, '', `${location.pathname}${location.search}`);
  }
  hide(root, true);
}

export function syncStageFromLocation(root: HTMLElement): void {
  const parsed = parseStageHash();
  if (!parsed || !resolveFn) {
    hide(root, true);
    return;
  }
  const doc = resolveFn(parsed.kind, parsed.id);
  if (!doc) {
    hide(root, true);
    return;
  }
  stack = [];
  openStage(root, doc, { fromHistory: true });
}

export function revealStage(kind: string, id: string, el?: HTMLElement): void {
  if (!resolveFn) return;
  const dest = stageRoute(kind);
  const openHere = (): void => {
    const host = document.querySelector<HTMLElement>('#app') ?? document.body;
    const doc = resolveFn?.(kind, id, el);
    if (doc) openStage(host, doc);
  };
  if (sameDeskPath(location.pathname, dest)) {
    openHere();
    return;
  }
  if (navigateFn) {
    navigateFn(dest);
    queueMicrotask(openHere);
    return;
  }
  location.assign(`${dest}#stage/${encodeURIComponent(kind)}/${encodeURIComponent(id)}`);
}

export function isStageOpen(): boolean {
  const live = document.querySelector<HTMLElement>('#desk-stage');
  return Boolean(live && !live.hidden);
}

export function wireStages(root: HTMLElement, resolve: Resolver): void {
  resolveFn = resolve;
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
    if (location.hash.startsWith('#stage/')) syncStageFromLocation(root);
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
    if (target.closest('[data-stage-back]')) {
      ev.preventDefault();
      if (openedHere) history.back();
      else if (stack.length) {
        const parent = stack.pop();
        if (parent) openStage(root, parent, { fromHistory: true });
      }
      return;
    }
    const hit = target.closest<HTMLElement>('[data-stage]');
    if (!hit) return;
    if (hit.closest('#desk-search')) return;
    if (hit.tagName === 'A' || hit.tagName === 'BUTTON') ev.preventDefault();
    openFromEl(hit);
  });

  const panel = wrap.querySelector<HTMLElement>('.desk-stage-sheet');
  if (panel && !panel.dataset.swipe) {
    panel.dataset.swipe = '1';
    let startY = 0;
    panel.addEventListener(
      'touchstart',
      (ev) => {
        startY = ev.touches[0]?.clientY ?? 0;
      },
      { passive: true },
    );
    panel.addEventListener(
      'touchend',
      (ev) => {
        const y = ev.changedTouches[0]?.clientY ?? 0;
        if (y - startY > 88 && panel.scrollTop < 10) closeStage(root);
      },
      { passive: true },
    );
  }

  if (!docBound) {
    docBound = true;
    document.addEventListener('keydown', (ev) => {
      const live = document.querySelector<HTMLElement>('#desk-stage');
      if (!live || live.hidden) return;
      const host = (live.closest('#app') as HTMLElement | null) ?? document.body;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeStage(host);
        return;
      }
      if (ev.key !== 'Tab') return;
      const sheet = live.querySelector<HTMLElement>('.desk-stage-sheet');
      if (!sheet) return;
      const list = focusables(sheet);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    });
  }

  if (location.hash.startsWith('#stage/')) syncStageFromLocation(root);
}

export function relatedButtons(chips: RelatedChip[]): string {
  return chips
    .map(
      (r) =>
        `<button type="button" class="text-link" data-stage="${esc(r.kind)}" data-stage-id="${esc(r.id)}">${esc(r.label)}</button>`,
    )
    .join(' · ');
}
