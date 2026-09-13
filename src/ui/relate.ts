import { chapters, papers, quotes } from '../data/catalog';
import { GLOSSARY } from '../data/glossary';
import { INSTITUTIONS } from '../data/institutions';
import { PATENTS } from '../data/patents';
import { PEOPLE } from '../data/people';
import { PROGRAMMES } from '../data/programmes';
import { STORY } from '../data/story';
import { TECH } from '../data/tech';
import { CITIES } from '../data/cities';

export interface RelatedChip {
  label: string;
  kind: string;
  id: string;
}

const STAGE_ROUTE: Record<string, string> = {
  person: '/people',
  quote: '/people',
  event: '/story',
  tech: '/technology',
  patent: '/patents',
  institution: '/institutions',
  term: '/glossary',
  paper: '/research',
  news: '/news',
  programme: '/programmes',
  satp: '/standards',
  money: '/cbdc',
  source: '/news',
  proof: '/',
  chapter: '/vision',
  city: '/',
};

export function stageRoute(kind: string): string {
  return STAGE_ROUTE[kind] ?? '/';
}

export function sameDeskPath(pathname: string, dest: string): boolean {
  const here = pathname.replace(/\/+$/, '') || '/';
  const there = dest.replace(/\/+$/, '') || '/';
  if (here === there) return true;
  if (there === '/story' && (here === '/timeline' || here === '/story')) return true;
  if (there === '/news' && (here === '/notes' || here === '/desk' || here === '/news')) return true;
  if (there === '/people' && (here === '/team' || here === '/people')) return true;
  if (there === '/programmes' && here === '/institutional') return true;
  if (there === '/institutions' && here === '/boards') return true;
  if (there === '/research' && (here === '/library' || here === '/research')) return true;
  return false;
}

/** Map a corpus id to a child-stage chip. Prefer the most specific object. */
export function chipFromId(raw: string): RelatedChip | null {
  const id = raw.replace(/^#/, '').trim();
  if (!id || id.startsWith('/')) return null;

  const person = PEOPLE.find((p) => p.id === id);
  if (person) return { kind: 'person', id: person.id, label: person.name };

  const patent = PATENTS.find((p) => p.id === id);
  if (patent) return { kind: 'patent', id: patent.id, label: patent.number };

  const tech = TECH.find((t) => t.id === id);
  if (tech) return { kind: 'tech', id: tech.id, label: tech.name };

  const programme = PROGRAMMES.find((p) => p.id === id);
  if (programme) return { kind: 'programme', id: programme.id, label: programme.title };

  const city = CITIES.find((c) => c.id === id);
  if (city) return { kind: 'city', id: city.id, label: city.name };

  const institution = INSTITUTIONS.find((i) => i.id === id);
  if (institution) return { kind: 'institution', id: institution.id, label: institution.name };

  const event = STORY.find((e) => e.id === id);
  if (event) return { kind: 'event', id: event.id, label: event.title };

  const paper = papers.find((p) => p.id === id);
  if (paper) return { kind: 'paper', id: paper.id, label: paper.title };

  const chapter = chapters.find((c) => c.id === id);
  if (chapter) return { kind: 'chapter', id: chapter.id, label: chapter.title };

  const quote = quotes.find((q) => q.id === id);
  if (quote) return { kind: 'quote', id: quote.id, label: quote.who };

  const term = GLOSSARY.find((t) => t.id === id);
  if (term) return { kind: 'term', id: term.id, label: term.term };

  if (/^[0-3]$/.test(id)) return { kind: 'satp', id, label: `SATP stage ${id}` };
  if (id === 'wholesale' || id === 'retail' || id === 'tcbm') {
    return { kind: 'money', id, label: id === 'tcbm' ? 'Tokenised commercial-bank money' : id };
  }
  if (id === 'interop' || id === 'standards' || id === 'institutions') {
    return { kind: 'proof', id, label: id };
  }
  return null;
}

export function chipsFromIds(ids: string[], limit = 6): RelatedChip[] {
  const seen = new Set<string>();
  const out: RelatedChip[] = [];
  for (const raw of ids) {
    const chip = chipFromId(raw);
    if (!chip) continue;
    const key = `${chip.kind}:${chip.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(chip);
    if (out.length >= limit) break;
  }
  return out;
}
