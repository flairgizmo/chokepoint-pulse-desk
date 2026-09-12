import { paperById, quotes, sourceUrl, chapters } from '../data/catalog';
import { INSTITUTIONS, institutionById } from '../data/institutions';
import { patentById } from '../data/patents';
import { PEOPLE } from '../data/people';
import { programmeById } from '../data/programmes';
import { storyById } from '../data/story';
import { techById } from '../data/tech';
import { SATP_STAGES } from '../data/timeline';
import { GLOSSARY } from '../data/glossary';
import { diagramSvg } from './diagrams';
import { headlineById, rememberHeadline } from './newsCache';
import type { StageDoc } from './stage';

function personStage(id: string): StageDoc | null {
  const p = PEOPLE.find((x) => x.id === id);
  if (!p) return null;
  const spoken = quotes.find((q) => q.personId === p.id);
  return {
    id: p.id,
    kind: 'person',
    title: p.name,
    kicker: p.role,
    body: p.bio + (p.note ? ` ${p.note}` : ''),
    analogy: spoken
      ? `A sourced line: “${spoken.text}” — ${spoken.who}, ${spoken.role}.`
      : `${p.name} is a documented name on this desk, not a composite.`,
    facts: [
      { label: 'Status', value: p.current ? 'Current / documented' : 'Left / documentary' },
      { label: 'Group', value: p.group },
    ],
    related: [
      { label: 'People', href: `/people#${p.id}` },
      { label: 'Technology', href: '/technology' },
    ],
    original: p.href ? { href: sourceUrl(p.href), label: 'Open original' } : undefined,
    visual: diagramSvg(p.id, 'person', p.initials),
  };
}

export function resolveStage(kind: string, id: string, el?: HTMLElement): StageDoc | null {
  if (kind === 'person') return personStage(id);
  if (kind === 'quote') {
    const q = quotes.find((x) => x.id === id);
    if (!q) return null;
    return {
      id: q.id,
      kind: 'quote',
      title: q.who,
      kicker: q.role,
      body: q.text,
      analogy: 'A quote is a door. The person, the venue, and the source sit on this stage.',
      related: q.personId ? [{ label: q.who, href: `/people#${q.personId}` }] : [],
      original: { href: sourceUrl(q.href), label: 'Open original' },
      visual: diagramSvg(q.id, 'quote', q.who),
    };
  }
  if (kind === 'event') {
    const e = storyById(id);
    if (!e) return null;
    return {
      id: e.id,
      kind: 'event',
      title: e.title,
      kicker: `${e.date} · ${e.theme}`,
      body: e.body,
      analogy: e.analogy,
      related: e.related.slice(0, 4).map((r) => ({ label: r, href: r.startsWith('/') ? r : `/story#${e.id}` })),
      original: e.hrefKey ? { href: sourceUrl(e.hrefKey), label: 'Open original' } : undefined,
      visual: diagramSvg(e.id, 'event', e.date),
    };
  }
  if (kind === 'tech') {
    const t = techById(id);
    if (!t) return null;
    return {
      id: t.id,
      kind: 'tech',
      title: t.name,
      kicker: t.era,
      body: `${t.does} Why it exists: ${t.why} What it is not: ${t.isNot}`,
      analogy: t.analogy,
      facts: [{ label: 'Standards', value: t.standards }],
      related: [{ label: 'Technology chapter', href: `/technology#${t.id}` }],
      visual: diagramSvg(t.id, 'tech', t.name),
    };
  }
  if (kind === 'patent') {
    const p = patentById(id);
    if (!p) return null;
    return {
      id: p.id,
      kind: 'patent',
      title: p.number,
      kicker: p.title,
      body: `${p.claim} ${p.why}`,
      analogy: 'A patent is a claim about sequence or method. It is not a live rail.',
      facts: [
        { label: 'Granted / filed', value: p.granted || p.filed || '—' },
        { label: 'Inventors', value: p.inventors.join(', ') || 'See source' },
      ],
      original: { href: sourceUrl(p.hrefKey), label: 'Open original' },
      visual: diagramSvg(p.id, 'patent', p.number),
    };
  }
  if (kind === 'institution') {
    const i = institutionById(id) ?? INSTITUTIONS.find((x) => x.id === id);
    if (!i) return null;
    return {
      id: i.id,
      kind: 'institution',
      title: i.name,
      kicker: `${i.role} · ${i.status}`,
      body: i.body,
      analogy: i.status === 'adjacency'
        ? 'Adjacency is a neighbouring room, not a contract.'
        : i.status === 'historical'
          ? 'A finished room. The document remains.'
          : 'Still in the room, with the role named.',
      facts: i.dates ? [{ label: 'Dates', value: i.dates }] : [],
      original: { href: sourceUrl(i.hrefKey), label: 'Open original' },
      visual: diagramSvg(i.id, 'institution', i.name),
    };
  }
  if (kind === 'term') {
    const t = GLOSSARY.find((x) => x.id === id);
    if (!t) return null;
    return {
      id: t.id,
      kind: 'term',
      title: t.term,
      kicker: 'Glossary',
      body: t.body,
      analogy: t.analogy,
      related: [{ label: 'Glossary', href: `/glossary#${t.id}` }],
      visual: diagramSvg(t.id, 'term', t.term),
    };
  }
  if (kind === 'paper') {
    const p = paperById(id);
    if (!p) return null;
    return {
      id: p.id,
      kind: 'paper',
      title: p.title,
      kicker: `${p.kind} · ${p.year}`,
      body: p.lede,
      analogy: p.id === 'synchro'
        ? 'A neighbouring research thread, not the 2026 Synchronisation Lab press note.'
        : 'Read the publisher. This stage is the desk’s brief.',
      facts: [
        { label: 'Venue', value: p.venue },
        { label: 'Authors', value: p.authors.join(', ') || 'See source' },
      ],
      original: { href: sourceUrl(p.hrefKey), label: 'Open original' },
      visual: diagramSvg(p.id, 'paper', p.year),
    };
  }
  if (kind === 'chapter') {
    const c = chapters.find((x) => x.id === id);
    if (!c) return null;
    return {
      id: c.id,
      kind: 'chapter',
      title: c.title,
      kicker: c.kicker,
      body: c.body,
      related: [{ label: 'Open on the page', href: `/${c.page}#${c.id}` }],
      visual: diagramSvg(c.id, 'chapter', c.kicker),
    };
  }
  if (kind === 'news') {
    const cached = headlineById(id);
    const title = el?.dataset.title || cached?.title || el?.textContent || 'Headline';
    const source = el?.dataset.source || cached?.source || 'Wire';
    const published = el?.dataset.published || cached?.published || '';
    const url = el?.dataset.url || cached?.url || '';
    const lane = el?.dataset.lane || cached?.lane || 'Industry';
    rememberHeadline({ id, title, url, source, published, lane });
    return {
      id,
      kind: 'news',
      title,
      kicker: `${source} · ${lane}`,
      body: `A sourced headline on the desk. ${source}${published ? `, ${published}` : ''}. This brief stays here so you do not have to leave to understand the item. Grade it as ${lane.toLowerCase()} wire, not as a timeline fact until an editor places it.`,
      analogy: 'A wire story is a pulse, not a verdict. The original is one click further.',
      facts: [
        { label: 'Fetched context', value: 'Official Quant, Overledger docs, IETF SATP, quality news, filings.' },
        { label: 'Published', value: published || '—' },
      ],
      original: url ? { href: url, label: 'Open original' } : undefined,
      visual: diagramSvg(id, 'news', lane),
    };
  }
  if (kind === 'programme') {
    const p = programmeById(id);
    if (!p) return null;
    return {
      id: p.id,
      kind: 'programme',
      title: p.title,
      kicker: `${p.status} · ${p.kicker}`,
      body: `${p.body} Owner: ${p.owner}. Next public milestone: ${p.milestone}`,
      analogy: 'A programme is a room with a status chip. A mention on the wire is not a new contract.',
      facts: [
        { label: 'Status', value: p.status },
        { label: 'Institutions', value: p.institutions.join(', ') || 'See body' },
        { label: 'Related tech', value: p.tech.join(', ') },
      ],
      related: [{ label: 'Programme cockpit', href: `/programmes#${p.id}` }, ...p.tech.map((t) => ({ label: t, href: `/technology#${t}` }))],
      original: p.hrefKey ? { href: sourceUrl(p.hrefKey), label: 'Open original' } : undefined,
      visual: diagramSvg(p.id, 'programme', p.status),
    };
  }
  if (kind === 'satp') {
    const s = SATP_STAGES.find((x) => x.n === id);
    if (!s) return null;
    return {
      id: s.n,
      kind: 'satp',
      title: `SATP stage ${s.n} — ${s.title}`,
      kicker: 'IETF SATP',
      body: `${s.body} ${s.tags}. SATP is IETF work. Overledger can implement it. That still does not make SATP a Quant SKU. The day the core draft is an RFC, a bank can write a gateway-to-gateway transfer without buying a brand.`,
      analogy: 'SWIFT for the moment an asset must leave one network and arrive in exactly one other.',
      related: [{ label: 'Standards desk', href: '/standards' }, { label: 'SATP chapter', href: '/technology#satp' }],
      original: { href: sourceUrl('satpCore'), label: 'Open original' },
      visual: diagramSvg(`satp-${s.n}`, 'satp', s.title),
    };
  }
  if (kind === 'money') {
    const models: Record<string, StageDoc> = {
      wholesale: {
        id: 'wholesale',
        kind: 'money',
        title: 'Wholesale CBDC / RTGS',
        kicker: 'Liability',
        body: 'A central-bank liability for institutions, typically sitting next to RTGS. Isolated chains cannot give you finality in the central bank’s book. Overledger’s claim is to talk to that book, not to replace it. The Synchronisation Lab is simulated RT2 — adjacency, labelled as such.',
        analogy: 'The settlement gold in the basement. The deposits upstairs are a different IOU.',
        related: [{ label: 'CBDC page', href: '/cbdc' }, { label: 'QuantNet', href: '/technology#quantnet' }],
        visual: diagramSvg('money-wholesale', 'cbdc', 'Wholesale'),
      },
      retail: {
        id: 'retail',
        kind: 'money',
        title: 'Retail CBDC',
        kicker: 'Liability',
        body: 'A central-bank liability intended for the public. Project Rosalind tested APIs for such an ecosystem and concluded in 2023. No live UK retail CBDC exists. GBTD is not this object.',
        analogy: 'A public counter at the central bank that has been designed, not opened.',
        related: [{ label: 'Rosalind', href: '/programmes#basel' }],
        visual: diagramSvg('money-retail', 'cbdc', 'Retail'),
      },
      tcbm: {
        id: 'tcbm',
        kind: 'money',
        title: 'Tokenised commercial-bank money',
        kicker: 'Liability',
        body: 'A commercial bank’s IOU, represented as a token. GBTD is the live UK specimen with six named banks. Quant is the technology partner. SATP is how an asset is supposed to leave one network and arrive in exactly one other — useful the day a wholesale CBDC and a tokenised deposit need to meet.',
        analogy: 'The same bank IOU, now able to lock, release and settle against a condition.',
        related: [{ label: 'GBTD', href: '/programmes#gbtd' }, { label: 'SATP', href: '/standards' }],
        visual: diagramSvg('money-tcbm', 'cbdc', 'TCBM'),
      },
    };
    return models[id] ?? null;
  }
  if (kind === 'source') {
    const href = el?.dataset.url || '';
    const who = el?.dataset.source || '';
    const title = el?.dataset.title || el?.textContent || 'Source';
    return {
      id,
      kind: 'source',
      title,
      kicker: who || 'On the record',
      body: `${who}. This desk keeps the brief here. The publisher remains one click further if you want the sentence in its first room.`,
      analogy: 'A doorway, not a redirect.',
      original: href ? { href, label: 'Open original' } : undefined,
      visual: diagramSvg(id, 'source', title),
    };
  }
  if (kind === 'proof') {
    const proofs: Record<string, StageDoc> = {
      interop: {
        id: 'interop',
        kind: 'proof',
        title: 'Interoperability as an operating layer',
        kicker: 'Proof',
        body: 'Overledger is a gateway OS. The 2018 whitepaper files multi-ledger applications without single-ledger dependency. Fusion sits across ledgers as Layer 2.5. PayScript programmes the account. The scarce resource is not another chain.',
        analogy: 'A clearing house that already knows the members, rather than a new exchange that asks them to move in.',
        related: [{ label: 'Technology', href: '/technology' }, { label: 'Stack', href: '/stack' }],
        visual: diagramSvg('proof-interop', 'proof', 'Interop'),
      },
      standards: {
        id: 'standards',
        kind: 'proof',
        title: 'Standards rooms Quant actually sits in',
        kicker: 'Proof',
        body: 'IETF SATP: Quant authors and a co-chair. ISO/TC 307: Verdian proposed it in 2015 and convenes WG7. ISO/TS 23516:2026 is the interoperability framework. SATP is not a Quant SKU. The day it is an RFC, a bank can implement a gateway-to-gateway transfer without buying a brand.',
        analogy: 'The treaty table. The product is allowed to implement the treaty. It does not own the seals.',
        related: [{ label: 'Standards desk', href: '/standards' }],
        visual: diagramSvg('proof-standards', 'proof', 'Standards'),
      },
      institutions: {
        id: 'institutions',
        kind: 'proof',
        title: 'Who they still sit with',
        kicker: 'Proof',
        body: 'Current: UK Finance convenor; six GBTD issuing banks; Oracle and Murex as named vendors; IETF and ISO working-group roles; Linux Foundation x402 general membership; Dentsu Soken announced 2026. Historical: Rosalind (concluded), LACChain 2021 announcement, Vocalink lineage. Adjacency: Bank of England lab, MIT/SERC, INATBA. Adjacency is not a contract.',
        analogy: 'A seating plan, not a sponsorship reel.',
        related: [{ label: 'Institutions', href: '/institutions' }],
        visual: diagramSvg('proof-institutions', 'proof', 'Rooms'),
      },
    };
    return proofs[id] ?? null;
  }
  return null;
}
