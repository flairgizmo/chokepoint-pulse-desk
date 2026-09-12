import { chapters, papers, quotes, didYouKnow, sourceUrl, type Quote } from '../data/catalog';
import { PEOPLE } from '../data/people';
import { GLOSSARY } from '../data/glossary';
import { CITIES } from '../data/cities';
import { GBTD_BANKS } from '../data/timeline';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  text: string;
  cites: Array<{ label: string; href: string }>;
  mode: 'sourced' | 'live';
}

const HARD =
  'QntDesk is a research desk on Quant, Overledger and programmable money. Overledger is a gateway operating system. GBTD is tokenised commercial-bank sterling. QNT is a utility token. Answer from the record. Do not invent prices, headlines, mandates or faces.';

function score(hay: string, q: string): number {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const h = hay.toLowerCase();
  let n = 0;
  for (const w of words) if (h.includes(w)) n += 1;
  if (h.includes(q.toLowerCase())) n += 3;
  return n;
}

export function answerFromDesk(question: string): ChatReply {
  const q = question.trim();
  if (!q) {
    return {
      text: `${HARD}\n\nAsk about Overledger, GBTD, SATP, QNT, people, papers or a city on the globe.`,
      cites: [],
      mode: 'sourced',
    };
  }
  const lower = q.toLowerCase();
  const cites: ChatReply['cites'] = [];
  const bits: string[] = [];

  if (/\b(cbdc|digital pound|gbtd)\b/.test(lower)) {
    bits.push(
      `GBTD tokens are liabilities of ${GBTD_BANKS.join(', ')}. A CBDC would be a liability of a central bank. Quant is the named technology partner (Overledger + PayScript), not the issuer.`,
    );
    cites.push({ label: 'Liability test', href: '/cbdc' });
  }
  if (/\b(overledger|blockchain|l1|twelfth)\b/.test(lower)) {
    bits.push(
      'Overledger is a gateway operating system. It maps applications onto ledgers and bank cores. It does not mint a native L1.',
    );
    cites.push({ label: 'The stack', href: '/technology' });
  }
  if (/\bqnt\b|tokenomics|contract/.test(lower)) {
    bits.push(
      'QNT is an ERC-20 utility token. Live price on this desk comes from Coinbase, Kraken or Binance — never invented. Check the Ethereum contract on Markets before sending anything.',
    );
    cites.push({ label: 'Markets', href: '/markets' });
  }

  const chHits = chapters
    .map((c) => ({ c, s: score(`${c.title} ${c.body} ${c.kicker}`, q) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  for (const { c } of chHits) {
    bits.push(`${c.title}: ${c.body.slice(0, 320)}${c.body.length > 320 ? '…' : ''}`);
    cites.push({ label: c.title, href: `/${c.page}#${c.id}` });
  }

  const pHits = papers
    .map((p) => ({ p, s: score(`${p.title} ${p.lede} ${p.authors.join(' ')} ${p.venue}`, q) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  for (const { p } of pHits) {
    bits.push(`${p.year} · ${p.title} (${p.venue}). ${p.lede}`);
    cites.push({ label: p.title, href: `/read/${p.id}` });
  }

  const people = PEOPLE.map((p) => ({ p, s: score(`${p.name} ${p.role} ${p.bio}`, q) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2);
  for (const { p } of people) {
    bits.push(`${p.name}, ${p.role}: ${p.bio.slice(0, 240)}`);
    cites.push({ label: p.name, href: `/people#${p.id}` });
  }

  const terms = GLOSSARY.map((t) => ({ t, s: score(`${t.term} ${t.body}`, q) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2);
  for (const { t } of terms) {
    bits.push(`${t.term}: ${t.body}`);
    cites.push({ label: t.term, href: `/glossary#${t.id}` });
  }

  const cities = CITIES.map((c) => ({ c, s: score(`${c.name} ${c.lede} ${c.body}`, q) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2);
  for (const { c } of cities) {
    bits.push(`${c.name}: ${c.lede}`);
    cites.push({ label: c.name, href: `/city/${c.id}` });
  }

  const qs = quotes
    .map((quote) => ({ quote, s: score(`${quote.who} ${quote.text} ${quote.role}`, q) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2);
  for (const { quote } of qs) {
    bits.push(`“${quote.text}” — ${quote.who}, ${quote.role}`);
    cites.push({ label: quote.who, href: sourceUrl(quote.href) });
  }

  const dyk = didYouKnow
    .map((d) => ({ d, s: score(`${d.q} ${d.a}`, q) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 1);
  for (const { d } of dyk) {
    bits.push(`${d.q} ${d.a}`);
    cites.push({ label: d.cta, href: d.to });
  }

  if (!bits.length) {
    return {
      text: `${HARD}\n\nNothing in the sourced encyclopedia matched that closely. Try Overledger, GBTD, SATP, Fusion, PayScript, Verdian, or a city name. I will not invent an answer.`,
      cites: [{ label: 'Library', href: '/research' }],
      mode: 'sourced',
    };
  }

  const seen = new Set<string>();
  const uniq = cites.filter((c) => {
    if (seen.has(c.href)) return false;
    seen.add(c.href);
    return true;
  });

  return {
    text: `${bits.slice(0, 6).join('\n\n')}\n\n${HARD}`,
    cites: uniq.slice(0, 6),
    mode: 'sourced',
  };
}

export function formatQuote(q: Quote): string {
  return `“${q.text}” — ${q.who}`;
}
