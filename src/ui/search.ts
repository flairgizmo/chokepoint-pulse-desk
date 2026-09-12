import { chapters, papers, quotes } from '../data/catalog';
import { GLOSSARY } from '../data/glossary';
import { PEOPLE } from '../data/people';
import { TECH } from '../data/tech';
import { STORY } from '../data/story';
import { PATENTS } from '../data/patents';
import { INSTITUTIONS } from '../data/institutions';
import { esc } from './html';

interface Hit {
  href: string;
  kind: string;
  title: string;
  sub: string;
}

function collect(): Hit[] {
  const hits: Hit[] = [
    ...PEOPLE.map((p) => ({ href: `/people#${p.id}`, kind: 'People', title: p.name, sub: p.role })),
    ...GLOSSARY.map((t) => ({ href: `/glossary#${t.id}`, kind: 'Glossary', title: t.term, sub: t.body.slice(0, 90) })),
    ...papers.map((p) => ({ href: `/research#${p.id}`, kind: 'Research', title: p.title, sub: `${p.year} · ${p.venue}` })),
    ...chapters.map((c) => ({ href: `/${c.page}#${c.id}`, kind: 'Chapter', title: c.title, sub: c.kicker })),
    ...TECH.map((t) => ({ href: `/technology#${t.id}`, kind: 'Technology', title: t.name, sub: t.purpose })),
    ...STORY.map((e) => ({ href: `/story#${e.id}`, kind: 'Timeline', title: e.title, sub: e.date })),
    ...PATENTS.map((p) => ({ href: `/patents#${p.id}`, kind: 'Patent', title: p.number, sub: p.title })),
    ...INSTITUTIONS.map((i) => ({ href: `/institutions#${i.id}`, kind: 'Institution', title: i.name, sub: i.role })),
    ...quotes.slice(0, 40).map((q) => ({ href: `/people`, kind: 'Quote', title: q.who, sub: q.text.slice(0, 90) })),
  ];
  return hits;
}

export function searchMarkup(): string {
  return `<div class="desk-search" id="desk-search" hidden>
    <div class="desk-search-backdrop" data-search-close></div>
    <div class="desk-search-panel" role="dialog" aria-modal="true" aria-labelledby="desk-search-title">
      <h2 id="desk-search-title" class="sr-only">Search the desk</h2>
      <label class="sr-only" for="desk-search-input">Search</label>
      <input id="desk-search-input" type="search" placeholder="Search people, patents, terms, programmes…" />
      <ul id="desk-search-hits"></ul>
      <p class="empty-note" id="desk-search-empty" hidden>Nothing on this desk matches. Try Overledger, SATP, GBTD, or a surname.</p>
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
      ? corpus.filter((h) => `${h.title} ${h.sub} ${h.kind}`.toLowerCase().includes(q)).slice(0, 12)
      : corpus.slice(0, 8);
    empty.hidden = hits.length > 0;
    list.innerHTML = hits
      .map(
        (h) =>
          `<li><a href="${esc(h.href)}"><span class="kicker">${esc(h.kind)}</span><strong>${esc(h.title)}</strong><span>${esc(h.sub)}</span></a></li>`,
      )
      .join('');
  };

  const setOpen = (open: boolean): void => {
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
  document.addEventListener('keydown', (ev) => {
    if (ev.key === '/' && !['INPUT', 'TEXTAREA'].includes((ev.target as HTMLElement).tagName)) {
      ev.preventDefault();
      setOpen(true);
    }
    if (ev.key === 'Escape' && !wrap.hidden) setOpen(false);
  });
}
