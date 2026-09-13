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
import { chipsFromIds, type RelatedChip } from './relate';
import type { StageDoc } from './stage';

function factLine(label: string, value: string): string {
  return `${label}: ${value}`;
}

function newsWhy(title: string, lane: string): string {
  const t = title.toLowerCase();
  if (/satp|ietf|odap/.test(t)) return 'This pulse sits next to the IETF SATP desk: a protocol room, not a Quant SKU.';
  if (/gbtd|tokenis|tokeniz|deposit|sterling/.test(t)) return 'This pulse sits next to GBTD: commercial-bank sterling, not a CBDC.';
  if (/overledger|quantnet/.test(t)) return 'This pulse sits next to the gateway OS — a mapping layer, not a twelfth chain.';
  if (/fusion|trusted node/.test(t)) return 'This pulse sits next to Fusion operations. Quant’s sentence, not a supervisor’s finding.';
  if (/payscript|flow application/.test(t)) return 'This pulse sits next to programmability at the account, named in the GBTD stack.';
  if (/bank of england|synchronis|rtgs|rt2/.test(t)) {
    return 'Bank of England language is adjacency unless the source names a contract. The Synchronisation Lab is simulated RT2.';
  }
  if (/\bqnt\b|token price/.test(t)) return 'A utility-token mention. QNT is not equity. This desk does not treat price as the story.';
  return `Grade this as ${lane.toLowerCase()} wire. It is a pulse, not a timeline fact until an editor places it.`;
}

function newsConnects(title: string): RelatedChip[] {
  const t = title.toLowerCase();
  const ids: string[] = [];
  if (/overledger/.test(t)) ids.push('overledger');
  if (/quantnet/.test(t)) ids.push('quantnet');
  if (/satp|odap/.test(t)) ids.push('satp');
  if (/fusion/.test(t)) ids.push('fusion');
  if (/gbtd|tokenis|tokeniz|deposit/.test(t)) ids.push('gbtd');
  if (/payscript/.test(t)) ids.push('payscript');
  if (/verdian/.test(t)) ids.push('verdian');
  if (/riley/.test(t)) ids.push('riley');
  if (/hargreaves/.test(t)) ids.push('hargreaves');
  return chipsFromIds(ids, 5);
}

function personStage(id: string): StageDoc | null {
  const p = PEOPLE.find((x) => x.id === id);
  if (!p) return null;
  const spoken = quotes.find((q) => q.personId === p.id);
  const extra = p.current
    ? 'The desk files them as current: a named role, not a composite, and not a yearbook caption.'
    : 'The desk files them as documentary: the work remains after the title left the about page.';
  const line = spoken ? ` A sourced line sits under this name: “${spoken.text}”` : '';
  return {
    id: p.id,
    kind: 'person',
    title: p.name,
    kicker: `${p.role} · ${p.current ? 'current' : 'documentary'}`,
    stake: `${p.name} — ${p.role}.`,
    body: `${p.bio}${p.note ? ` ${p.note}` : ''} ${extra}${line} Related chips open the patents, chapters, or programmes their name actually touches.`,
    analogy: spoken
      ? `A sourced line is a door, not a pull-quote decoration: “${spoken.text}” — ${spoken.who}.`
      : `${p.name} is a documented name on this desk. Initials appear only when Quant published no still.`,
    fact: spoken
      ? factLine('Sourced line', `${spoken.who}, ${spoken.role}`)
      : factLine('Status', p.current ? 'Current / documented' : 'Left / documentary'),
    facts: [
      { label: 'Status', value: p.current ? 'Current / documented' : 'Left / documentary' },
      { label: 'Group', value: p.group },
    ],
    related: chipsFromIds([
      ...(spoken ? [spoken.id] : []),
      'overledger',
      p.id === 'hargreaves' || p.id === 'facer' || p.id === 'chiriac' || p.id === 'belchior' ? 'satp' : 'overledger-platform',
    ]),
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
      kicker: `${q.role} · quote`,
      stake: `Said in the context of ${q.role}.`,
      body: `${q.text} Said in the context of ${q.role}${q.note ? ` — ${q.note}` : ''}. The line is a door into the person, not a decoration on a brochure. Speaker, venue of the source, and the original sit together so the sentence can be checked.`,
      analogy: 'A quote is a door. Walk through it to the person, the venue, and the year — not to a typeset slogan.',
      fact: factLine('Source', q.role),
      related: q.personId ? chipsFromIds([q.personId]) : [],
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
      stake: e.stake,
      body: `${e.body} This beat is dated ${e.date}. Quiet months are omitted on purpose — the rail does not invent holes. The year is a room: what changed, who signed, which standard or product it unlocked.`,
      analogy: e.analogy,
      fact: e.hrefKey ? factLine('Primary source', e.hrefKey) : factLine('Date', e.date),
      related: chipsFromIds(e.related),
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
      stake: t.purpose,
      body: `${t.does} Why it exists: ${t.why} What it is not: ${t.isNot} Standards and constraints: ${t.standards}`,
      analogy: t.analogy,
      fact: factLine('Standards', t.standards),
      facts: [{ label: 'Standards', value: t.standards }],
      related: chipsFromIds(t.related),
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
      stake: 'A claim about sequence or method — not a live rail.',
      body: `${p.claim} ${p.why} Numbers on this desk match the public file. A Japanese acceptance is filed only as Quant’s news note; this stage does not invent a JPO number that is not on that page.`,
      analogy: 'A patent is a claim about sequence or method. It is not a deployment, and it is not SATP.',
      fact: factLine('Granted / filed', p.granted || p.filed || 'See source'),
      facts: [
        { label: 'Granted / filed', value: p.granted || p.filed || '—' },
        { label: 'Inventors', value: p.inventors.join(', ') || 'See source' },
      ],
      related: chipsFromIds(p.related),
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
      stake:
        i.status === 'adjacency'
          ? 'Adjacency is a neighbouring room, not a contract.'
          : i.status === 'historical'
            ? 'A finished room. The document remains.'
            : 'Still in the room, with the role named.',
      body: `${i.body} Role on this desk: ${i.role}. Status: ${i.status}${i.dates ? ` (${i.dates})` : ''}. Current versus former is labelled so a seating plan is not read as a sponsorship reel.`,
      analogy:
        i.status === 'adjacency'
          ? 'Adjacency is a neighbouring room, not a contract.'
          : i.status === 'historical'
            ? 'A finished room. The document remains.'
            : 'Still in the room, with the role named.',
      fact: i.dates ? factLine('Dates', i.dates) : factLine('Role', i.role),
      facts: i.dates ? [{ label: 'Dates', value: i.dates }] : [],
      related: chipsFromIds(['overledger', 'gbtd', 'satp']),
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
      stake: `A working definition for ${t.term}.`,
      body: t.body,
      analogy: t.analogy ?? `Think of ${t.term} as a labelled drawer: the definition is what you find inside, not a slogan on the front.`,
      fact: factLine('Desk', 'Glossary'),
      related: chipsFromIds([t.id === 'synthorus' ? 'synchronisation' : t.id, 'satp', 'overledger', 'gbtd']),
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
      stake: p.id === 'synchro' ? 'A neighbouring research thread, with a verification chip.' : 'Read the publisher. This stage is the desk’s brief.',
      body:
        p.id === 'synchro'
          ? `${p.lede} Distinct from Quant’s February 2026 Synchronisation Lab note (simulated RT2). Bank of England pages describe synchronisation as locking an RTGS movement to an external event. This file is not a BoE publication naming Quant as operator of “Synthorus.”`
          : `${p.lede} Venue: ${p.year}, ${p.venue}. Authors as filed: ${p.authors.join(', ') || 'see source'}. The reader stays on this desk; the publisher remains one click further.`,
      analogy:
        p.id === 'synchro'
          ? 'A neighbouring research thread, not the 2026 Synchronisation Lab press note.'
          : 'Read the publisher. This stage is the desk’s brief.',
      fact: factLine('Venue', `${p.year} · ${p.venue}`),
      facts: [
        { label: 'Venue', value: p.venue },
        { label: 'Authors', value: p.authors.join(', ') || 'See source' },
      ],
      related: chipsFromIds(p.authors.some((a) => /verdian/i.test(a)) ? ['verdian'] : ['overledger']),
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
      stake: c.kicker,
      body: `${c.body} This chapter remains on the ${c.page} route. The stage is the brief; the page is the shelf.`,
      analogy: 'A chapter is a shelf mark, not a second home page.',
      related: chipsFromIds([c.id, 'overledger']),
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
    const why = newsWhy(title, lane);
    return {
      id,
      kind: 'news',
      title,
      kicker: `${source} · ${lane}${published ? ` · ${published}` : ''}`,
      stake: why,
      body: `A sourced headline on the desk. ${source}${published ? `, ${published}` : ''}. ${why} This brief stays here so you do not have to leave to understand the item. The original remains one click further. Never auto-file a rumour onto the timeline as fact.`,
      analogy: 'A wire story is a pulse, not a verdict. The original is one click further.',
      fact: factLine('Published', published || 'as fetched'),
      facts: [
        { label: 'Fetched context', value: 'Official Quant, Overledger docs, IETF SATP, quality news, filings.' },
        { label: 'Published', value: published || '—' },
      ],
      related: newsConnects(title),
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
      stake: `Next public milestone: ${p.milestone}`,
      body: `${p.body} Owner: ${p.owner}. Institutions on the card: ${p.institutions.join(', ') || 'see body'}. Related technology: ${p.tech.join(', ')}. A mention on the wire is not a new contract.`,
      analogy: 'A programme is a room with a status chip. A mention on the wire is not a new contract.',
      fact: factLine('Status', p.status),
      facts: [
        { label: 'Status', value: p.status },
        { label: 'Institutions', value: p.institutions.join(', ') || 'See body' },
        { label: 'Related tech', value: p.tech.join(', ') },
      ],
      related: chipsFromIds(p.tech),
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
      kicker: 'IETF SATP · draft',
      stake: 'The day the core draft is an RFC, a bank can write a gateway-to-gateway transfer without buying a brand.',
      body: `${s.body} ${s.tags}. SATP is IETF work. Overledger can implement it. That still does not make SATP a Quant SKU. Stages: 0 verify, 1 initiate, 2 lock-assertion, 3 two-phase commit. Crash recovery is a separate Belchior draft.`,
      analogy: 'SWIFT for the moment an asset must leave one network and arrive in exactly one other.',
      fact: factLine('Desk', 'IETF SATP — not a Quant SKU'),
      related: chipsFromIds(['satp', 'hargreaves', 'chiriac', 'facer', 'overledger']),
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
        kicker: 'Liability · wholesale',
        stake: 'A central-bank liability for institutions, typically sitting next to RTGS.',
        body: 'A central-bank liability for institutions, typically sitting next to RTGS. Isolated chains cannot give you finality in the central bank’s book. Overledger’s claim is to talk to that book, not to replace it. The Synchronisation Lab is simulated RT2 — adjacency, labelled as such. This is not GBTD, and it is not a live digital pound.',
        analogy: 'The settlement gold in the basement. The deposits upstairs are a different IOU.',
        fact: factLine('Adjacency', 'Synchronisation Lab = simulated RT2'),
        related: chipsFromIds(['quantnet', 'synchronisation', 'cbdc']),
        visual: diagramSvg('money-wholesale', 'money', 'Wholesale'),
      },
      retail: {
        id: 'retail',
        kind: 'money',
        title: 'Retail CBDC',
        kicker: 'Liability · retail',
        stake: 'A public counter at the central bank that has been designed, not opened.',
        body: 'A central-bank liability intended for the public. Project Rosalind tested APIs for such an ecosystem and concluded in 2023. No live UK retail CBDC exists. GBTD is not this object. The digital pound remains consultation and lab work.',
        analogy: 'A public counter at the central bank that has been designed, not opened.',
        fact: factLine('Programme', 'Rosalind concluded 2023'),
        related: chipsFromIds(['basel', 'digital-pound', 'cbdc']),
        visual: diagramSvg('money-retail', 'money', 'Retail'),
      },
      tcbm: {
        id: 'tcbm',
        kind: 'money',
        title: 'Tokenised commercial-bank money',
        kicker: 'Liability · commercial bank',
        stake: 'The same bank IOU, now able to lock, release and settle against a condition.',
        body: 'A commercial bank’s IOU, represented as a token. GBTD is the live UK specimen with six named banks. Quant is the technology partner. SATP is how an asset is supposed to leave one network and arrive in exactly one other — useful the day a wholesale CBDC and a tokenised deposit need to meet.',
        analogy: 'The same bank IOU, now able to lock, release and settle against a condition.',
        fact: factLine('Live specimen', 'GBTD — six commercial banks'),
        related: chipsFromIds(['gbtd', 'satp', 'tokenised-deposit']),
        visual: diagramSvg('money-tcbm', 'money', 'TCBM'),
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
      stake: 'A doorway, not a redirect.',
      body: `${who}. This desk keeps the brief here. The publisher remains one click further if you want the sentence in its first room. Adjacency is not endorsement.`,
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
        kicker: 'Proof · interoperability',
        stake: 'Overledger is a gateway OS. The scarce resource is not another chain.',
        body: 'Overledger is a gateway OS. The 2018 whitepaper files multi-ledger applications without single-ledger dependency. Fusion sits across ledgers as Layer 2.5. PayScript programmes the account. The scarce resource is not another chain. This chip is a stage, not an anchor jump to a reused page.',
        analogy: 'A clearing house that already knows the members, rather than a new exchange that asks them to move in.',
        fact: factLine('Primary', 'Overledger whitepaper, UCL Discovery, 2018'),
        related: chipsFromIds(['overledger', 'fusion', 'payscript']),
        visual: diagramSvg('proof-interop', 'proof', 'Interop'),
      },
      standards: {
        id: 'standards',
        kind: 'proof',
        title: 'Standards rooms Quant actually sits in',
        kicker: 'Proof · standards',
        stake: 'The treaty table. The product may implement the treaty. It does not own the seals.',
        body: 'IETF SATP: Quant authors and a co-chair. ISO/TC 307: Verdian proposed it in 2015 and convenes WG7. ISO/TS 23516:2026 is the interoperability framework. SATP is not a Quant SKU. The day it is an RFC, a bank can implement a gateway-to-gateway transfer without buying a brand.',
        analogy: 'The treaty table. The product is allowed to implement the treaty. It does not own the seals.',
        fact: factLine('Rooms', 'IETF SATP · ISO/TC 307 WG7'),
        related: chipsFromIds(['satp', 'iso', 'verdian']),
        visual: diagramSvg('proof-standards', 'proof', 'Standards'),
      },
      institutions: {
        id: 'institutions',
        kind: 'proof',
        title: 'Who they still sit with',
        kicker: 'Proof · institutions',
        stake: 'A seating plan, not a sponsorship reel.',
        body: 'Current: UK Finance convenor; six GBTD issuing banks; Oracle and Murex as named vendors; IETF and ISO working-group roles; Linux Foundation x402 general membership; Dentsu Soken announced 2026. Historical: Rosalind (concluded), LACChain 2021 announcement, Vocalink lineage. Adjacency: Bank of England lab, MIT/SERC, INATBA. Adjacency is not a contract.',
        analogy: 'A seating plan, not a sponsorship reel.',
        fact: factLine('Rule', 'Adjacency ≠ contract. Current vs former is labelled.'),
        related: chipsFromIds(['uk-finance', 'ietf', 'boe']),
        visual: diagramSvg('proof-institutions', 'proof', 'Rooms'),
      },
    };
    return proofs[id] ?? null;
  }
  return null;
}
