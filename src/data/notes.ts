import { didYouKnow, sourceUrl } from './catalog';
import { THIS_MONTH } from './timeline';

export type NoteEra = 'history' | 'present' | 'future';

export interface NotePost {
  id: string;
  title: string;
  kicker: string;
  body: string;
  source: string;
  href?: string;
  related?: string;
  dateLabel: string;
  era: NoteEra;
}

function titleFromQuestion(q: string): string {
  const stripped = q.replace(/^Did you know\s+/i, '').replace(/\?$/, '').trim();
  return stripped ? stripped.charAt(0).toUpperCase() + stripped.slice(1) : q;
}

function eraFor(text: string): NoteEra {
  const t = text.toLowerCase();
  if (/q1 2027|digit gilt|\b2027\b/.test(t)) return 'future';
  if (
    /\b201[0-9]\b|\b2020\b|\b2021\b|\b2022\b|\b2023\b|whitepaper|token burn|lacchain|odap|rosalind|iso\/tc 307/.test(
      t,
    )
  ) {
    return 'history';
  }
  return 'present';
}

function monthNotes(): NotePost[] {
  return THIS_MONTH.map((n) => ({
    id: n.id,
    title: n.title,
    kicker: n.lane,
    body: n.body,
    source: n.source,
    href: sourceUrl(n.href),
    dateLabel: n.date,
    era: eraFor(`${n.title} ${n.body} ${n.date}`),
  }));
}

function dykNotes(): NotePost[] {
  return didYouKnow.map((d) => {
    const external = d.to.startsWith('http');
    return {
      id: d.id,
      title: titleFromQuestion(d.q),
      kicker: d.category,
      body: d.a,
      source: 'Sourced field note',
      href: external ? d.to : undefined,
      related: external ? undefined : d.to || '/',
      dateLabel: 'Field note',
      era: eraFor(`${d.q} ${d.a}`),
    };
  });
}

export function notesFromDesk(): NotePost[] {
  return [...monthNotes(), ...dykNotes()];
}

export function noteById(id: string): NotePost | undefined {
  return notesFromDesk().find((n) => n.id === id);
}

export function featuredNote(): NotePost {
  return noteById('not-cbdc') ?? notesFromDesk()[0];
}

export function notesForEra(era: NoteEra | 'ALL', list = notesFromDesk()): NotePost[] {
  if (era === 'ALL') return list;
  return list.filter((n) => n.era === era);
}
