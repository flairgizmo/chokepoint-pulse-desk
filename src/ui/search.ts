import { chapters, papers, quotes } from '../data/catalog';
import { GLOSSARY } from '../data/glossary';
import { PEOPLE } from '../data/people';
import { TECH } from '../data/tech';
import { STORY } from '../data/story';
import { PATENTS } from '../data/patents';
import { INSTITUTIONS } from '../data/institutions';
import { PROGRAMMES } from '../data/programmes';
import { photoFigure, plateFor } from '../data/plates';
import { esc } from './html';
import { isStageOpen, revealStage } from './stage';

interface Hit {
  kind: string;
  stageKind: string;
  id: string;
  title: string;
  sub: string;
}

function collect(): Hit[] {
  return [
    ...PEOPLE.map((p) => ({ stageKind: 'person', id: p.id, kind: 'People', title: p.name, sub: p.role })),
    ...GLOSSARY.map((t) => ({
      stageKind: 'term',
      id: t.id,
      kind: 'Glossary',
      title: t.term,
      sub: t.body.slice(0, 90),
    })),
    ...papers.map((p) => ({
      stageKind: 'paper',
      id: p.id,
      kind: 'Research',
      title: p.title,
      sub: `${p.year} · ${p.venue}`,
    })),
    ...chapters.map((c) => ({
      stageKind: 'chapter',
      id: c.id,
      kind: 'Chapter',
      title: c.title,
      sub: c.kicker,
    })),
    ...TECH.map((t) => ({ stageKind: 'tech', id: t.id, kind: 'Technology', title: t.name, sub: t.purpose })),
    ...STORY.map((e) => ({ stageKind: 'event', id: e.id, kind: 'Timeline', title: e.title, sub: e.date })),
    ...PATENTS.map((p) => ({ stageKind: 'patent', id: p.id, kind: 'Patent', title: p.number, sub: p.title })),
    ...INSTITUTIONS.map((i) => ({
      stageKind: 'institution',
      id: i.id,
      kind: 'Institution',
      title: i.name,
      sub: i.role,
    })),
    ...PROGRAMMES.map((p) => ({
      stageKind: 'programme',
      id: p.id,
      kind: 'Programme',
      title: p.title,
      sub: p.owner,
    })),
    ...quotes.slice(0, 40).map((q) => ({
      stageKind: 'quote',
      id: q.id,
      kind: 'Quote',
      title: q.who,
      sub: q.text.slice(0, 90),
    })),
  ];
}

export function searchHitButton(h: Hit): string {
  const person = h.stageKind === 'person' ? PEOPLE.find((p) => p.id === h.id) : undefined;
  const still = person?.photo
    ? `<figure class="photo-plate cinema-frame search-still"><img src="${esc(person.photo)}" alt="${esc(person.name)}" width="160" height="100" /></figure>`
    : photoFigure(plateFor(h.id, h.stageKind), 'search-still');
  return `<li><button type="button" data-stage="${esc(h.stageKind)}" data-stage-id="${esc(h.id)}">${still}<span class="kicker">${esc(h.kind)}</span><strong>${esc(h.title)}</strong><span class="search-sub">${esc(h.sub)}</span></button></li>`;
}

export function searchMarkup(): string {
  return `<div class="desk-search" id="desk-search" hidden>
    <div class="desk-search-backdrop" data-search-close></div>
    <div class="desk-search-panel" role="dialog" aria-modal="true" aria-labelledby="desk-search-title">
      <h2 id="desk-search-title" class="sr-only">Search the record</h2>
      <label class="sr-only" for="desk-search-input">Search</label>
      <input id="desk-search-input" type="search" placeholder="Search people, patents, terms, programmes…" />
      <ul id="desk-search-hits"></ul>
      <p class="empty-note" id="desk-search-empty" hidden>Nothing matches. Try Overledger, SATP, GBTD, or a surname.</p>
    </div>
  </div>`;
}

export function wireSearch(root: HTMLElement): void {
  const wrap = root.querySelector<HTMLElement>('#desk-search');
  const input = root.querySelector<HTMLInputElement>('#desk-search-input');
  const list = root.querySelector<HTMLElement>('#desk-search-hits');
  const empty = root.querySelector<HTMLElement>('#desk-search-empty');
  if (!wrap || !input || !list || !empty) return;
  const corpus = collect();

  const paint = (): void => {
    const q = input.value.trim().toLowerCase();
    const hits = q
      ? corpus
          .filter((h) => `${h.title} ${h.sub} ${h.kind}`.toLowerCase().includes(q))
          .sort((a, b) => {
            const rank = (h: Hit): number => {
              const t = h.title.toLowerCase();
              if (t === q) return 0;
              if (t.startsWith(q)) return 1;
              if (t.includes(q)) return 2;
              return 3;
            };
            return rank(a) - rank(b);
          })
          .slice(0, 12)
      : corpus.slice(0, 8);
    empty.hidden = hits.length > 0;
    list.innerHTML = hits.map(searchHitButton).join('');
  };

  const setOpen = (open: boolean): void => {
    if (open && isStageOpen()) return;
    wrap.hidden = !open;
    if (open) {
      paint();
      input.focus();
    }
  };

  root.querySelectorAll('[data-open-search]').forEach((btn) => {
    btn.addEventListener('click', () => setOpen(true));
  });
  wrap.querySelectorAll('[data-search-close]').forEach((el) => {
    el.addEventListener('click', () => setOpen(false));
  });
  input.addEventListener('input', paint);
  list.addEventListener('click', (ev) => {
    const hit = (ev.target as HTMLElement).closest<HTMLElement>('[data-stage]');
    if (!hit) return;
    ev.preventDefault();
    const kind = hit.dataset.stage;
    const id = hit.dataset.stageId;
    if (!kind || !id) return;
    setOpen(false);
    revealStage(kind, id);
  });

  if (!document.body.dataset.searchKeys) {
    document.body.dataset.searchKeys = '1';
    document.addEventListener('keydown', (ev) => {
      const tag = (ev.target as HTMLElement).tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const metaK = (ev.key === 'k' || ev.key === 'K') && (ev.metaKey || ev.ctrlKey);
      if (metaK) {
        ev.preventDefault();
        const panel = document.querySelector<HTMLElement>('#desk-search');
        if (panel && !panel.hidden) panel.hidden = true;
        else document.querySelector<HTMLButtonElement>('[data-open-search]')?.click();
        return;
      }
      if (ev.key === '/' && !typing) {
        ev.preventDefault();
        document.querySelector<HTMLButtonElement>('[data-open-search]')?.click();
      }
      const live = document.querySelector<HTMLElement>('#desk-search');
      if (ev.key === 'Escape' && live && !live.hidden) {
        ev.preventDefault();
        live.hidden = true;
      }
    });
  }
}
