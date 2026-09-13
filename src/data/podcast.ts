import { ACT3 } from './podcast-act3';
import { CODA } from './podcast-coda';

export type HostId = 'james' | 'amelia';

export interface EpisodeQuote {
  who: string;
  role: string;
  text: string;
}

export interface Episode {
  id: string;
  n: number;
  title: string;
  lede: string;
  host: HostId;
  hostName: string;
  hostTitle: string;
  minutes: number;
  published: string;
  related: string;
  bed: 'london' | 'gateway' | 'sterling' | 'future';
  audioSrc: string;
  videoSrc: string;
  posterSrc: string;
  quotes: EpisodeQuote[];
  script: string;
}

export const HOSTS: Record<HostId, { name: string; title: string; voice: string }> = {
  james: {
    name: 'James Hale',
    title: 'QntDesk correspondent',
    voice: 'en-GB-RyanNeural',
  },
  amelia: {
    name: 'Amelia Crowe',
    title: 'QntDesk correspondent',
    voice: 'en-GB-SoniaNeural',
  },
};

export interface TalkLine {
  who: HostId;
  text: string;
}

type Memory = { open: [string, string]; close: [string, string] };

const MEMORY: Record<number, Memory> = {
  1: {
    open: [
      'We start at the beginning because every room later — GBTD, SATP, Fusion — hangs off this one sentence.',
      'And I want the people on it. Tasca wrote the destination. Verdian built a company that treats it as an engineering problem, not a slogan.',
    ],
    close: [
      'That is the map we will keep walking: a gateway, named rooms, a utility token, and a standard that moves an asset once.',
      'Next we open the object itself. Overledger. Not a twelfth chain. The gate.',
    ],
  },
  2: {
    open: [
      'Last conversation we filed Tasca’s risky necessity. Today the object itself.',
      'Overledger. A gateway operating system. If you remember one thing from this series, remember that it is not a twelfth blockchain.',
    ],
    close: [
      'Fusion, PayScript, Flow, QuantNet — they sit on that sentence. We will get to each of them.',
      'First, the token that licences the network. QNT. Utility, not equity.',
    ],
  },
  3: {
    open: [
      'If Overledger is the gate, QNT is why the gate has a token.',
      'Utility, not equity. We will say that every time someone asks us to blur it. The contract is on Ethereum. You can read it yourself.',
    ],
    close: [
      'The 2018 burn retired the unsold allocation. Two supply figures sit on the record. Today’s circulating print comes from CoinGecko.',
      'The next room is older than the token. ISO. Verdian’s standards life — the reason a gateway company sounds like a standards company.',
    ],
  },
  4: {
    open: [
      'Before there was a product page, there was a committee. ISO Technical Committee 307.',
      'I love this chapter because it explains the voice. Quant talks like people who have already sat in the room where the language is written down.',
    ],
    close: [
      'Standards first, then Latin America. LACChain is the first big public room on this map.',
      'Same founder. Same instinct: connect what already exists. Do not ask a continent to move house.',
    ],
  },
  5: {
    open: [
      'LACChain, 2021. IDB Lab. The first time this desk can point at a public interoperability programme with Quant inside it.',
      'I keep this next to ISO on purpose. The committee writes the language. The development bank tries it in the wild.',
    ],
    close: [
      'From a regional chain of chains to a London API experiment. Rosalind is the next room — and it has already concluded.',
      'Concluded matters. We do not leave a 2023 lab sounding like it is still warm.',
    ],
  },
  6: {
    open: [
      'Project Rosalind. BIS Innovation Hub London and the Bank of England. An API experiment. Concluded in 2023.',
      'Quant says it supplied technology as a vendor. That is a precise sentence. Vendor, not issuer. API, not a live digital pound.',
    ],
    close: [
      'The next step in the UK is not a CBDC. It is commercial-bank sterling learning to take an instruction.',
      'RLN, then GBTD. The liability stays with the banks. That distinction is the rest of this series.',
    ],
  },
  7: {
    open: [
      'The Regulated Liability Network is the rehearsal. GBTD is the live show.',
      'I like the humility of a rehearsal. The UK tried the idea among banks before it asked sterling to move for real.',
    ],
    close: [
      'Twenty twenty-five names the technology partner. Quant. Overledger and PayScript.',
      'And then it names the six banks. That is the sentence this series has been walking toward.',
    ],
  },
  8: {
    open: [
      'Twenty-sixth of September, twenty twenty-five. UK Finance selects Quant. Live tokenised sterling deposits.',
      'I still get a lift from that date. Not because it is a victory lap — because it is specific. A partner. A product. A liability that is not the central bank’s.',
    ],
    close: [
      'GBTD is not a CBDC. Say it kindly, and say it every time.',
      'Next we sit with the six names. Barclays, HSBC, Lloyds, NatWest, Nationwide, Santander. The banks owe the holder.',
    ],
  },
  9: {
    open: [
      'Six commercial banks. I want them said out loud, the way a roll-call is said out loud.',
      'Barclays. HSBC. Lloyds Bank. NatWest. Nationwide. Santander. Those are the issuers. Quant is the technology partner.',
    ],
    close: [
      'Sterling that can take an instruction, still owed by a bank you already know.',
      'The next room is not a bank. It is a protocol. SATP. How an asset moves once, and only once.',
    ],
  },
  10: {
    open: [
      'Secure Asset Transfer Protocol. IETF work. Not a Quant SKU. Quant helps write it.',
      'I care about that distinction. A company can sit in a working group without owning the standard. That is how grown-up rails get built.',
    ],
    close: [
      'Stage three is burn-and-mint under two-phase commit. The asset lives in one place when the transfer ends.',
      'If SATP is how value moves between networks, Fusion is how Quant rolls many ledgers into one operating hour. Layer 2.5.',
    ],
  },
  11: {
    open: [
      'Fusion. Layer 2.5. A multi-ledger rollup. Trusted Node is who processes it.',
      'Last conversation we had a protocol. Today we have an operating model. Someone has to run the node. Quant is naming who.',
    ],
    close: [
      'A rollup is interesting. A named operator is what makes a bank comfortable.',
      'Then the language at the account. PayScript. Programmability with a name you can put in a stack diagram.',
    ],
  },
  12: {
    open: [
      'PayScript is the sentence GBTD actually uses. Programmability at the account.',
      'I have been waiting to say this since episode eight. The banks did not buy a slogan. They bought a way to write an instruction on a deposit.',
    ],
    close: [
      'Overledger maps. PayScript writes. Fusion settles the hour. The stack is starting to feel like a stack.',
      'Agents come next. Flow Applications. The same steps a human runs, an agent can call.',
    ],
  },
  13: {
    open: [
      'Flow Applications. MCP-callable workflows. Build once, deploy everywhere — Quant’s own line.',
      'This is where the series stops being only a banking story and becomes a story about who is allowed to move value.',
    ],
    close: [
      'If an agent can call a workflow, the settlement still wants bank money. That is the optimistic Quant read, and it is on their pages.',
      'x402 is the payment rail the Linux Foundation is carrying. Quant is a general member. We will keep those ranks honest.',
    ],
  },
  14: {
    open: [
      'x402. A Linux Foundation project. Quant is a general member — not the steward, not the owner.',
      'I like a company that can sit in a room without pretending the room is theirs. That is the same instinct as SATP.',
    ],
    close: [
      'Agent payments still want a bank on the other side. Layer 2 again. Deposits.',
      'Oracle is the next named platform. Overledger as the orchestration layer on Fabric. New York is the pin.',
    ],
  },
  15: {
    open: [
      'Oracle’s own blog names Overledger. February 2025. Cross-ledger, two-phase workflows on Hyperledger Fabric.',
      'When a platform that size writes your product into their sentence, the gateway stops being a whitepaper object.',
    ],
    close: [
      'Fabric underneath. Overledger across. The same map we have been drawing since episode two.',
      'Paris next. Murex. Tokenised deposits inside MX.3 — a platform more than three hundred institutions already run.',
    ],
  },
  16: {
    open: [
      'Murex, twenty-fifth of March, twenty twenty-six. Tokenised deposits and digital-bond settlement inside MX.3.',
      'This is my favourite vendor sentence in the series. Not a new chain. A named integration in a system the industry already trusts.',
    ],
    close: [
      'Verdian, on that newsroom page: the next generation will not replace what works. It will make what works programmable.',
      'Tokyo after Paris. Dentsu Soken. The same architecture, a different working day.',
    ],
  },
  17: {
    open: [
      'Dentsu Soken. Japan’s tokenised-deposit conversation, with Quant named as a partner.',
      'I keep GBTD in one hand when I read this. London is live. Tokyo is a second market practising the same idea.',
    ],
    close: [
      'Programmable deposits are not a UK curiosity. They are a design that other rooms can pick up.',
      'Home again. The Bank of England Synchronisation Lab. Simulated RT2. A different liability from GBTD. Stay kind, and stay precise.',
    ],
  },
  18: {
    open: [
      'February twenty twenty-six. The Synchronisation Lab. Simulated RT2. Quant as a Synchronisation Operator.',
      'I want the word simulated said clearly. This is practice beside RTGS, not a live digital pound, and not GBTD.',
    ],
    close: [
      'Layer one in Verdian’s diagram. Wholesale central-bank money. GBTD remains layer two. Different who-owes-it.',
      'Then the industry fair. Trusted Node, and Sibos Miami. Who processes the transaction — and who walks over to the stand.',
    ],
  },
  19: {
    open: [
      'Tenth of September, twenty twenty-six. Quant publishes Trusted Node: who is processing your transaction?',
      'If Fusion is a multi-ledger rollup, someone has to run the node. Naming the operator is how you earn a bank’s afternoon.',
    ],
    close: [
      'Sibos Miami, stand DISL fifty-one, with Murex on programmable settlement. The industry still walks the floor.',
      'The last conversation is the decade ahead. DIGIT. Deposits. A gateway that already exists.',
    ],
  },
  20: {
    open: [
      'We end where the calendar is still warm. The Economic Secretary, eighth of September, twenty twenty-six, at UK Finance.',
      'A DIGIT gilt in the first quarter of twenty twenty-seven. The speech does not name Quant. It is the same week’s landscape, and we will not invent a credit.',
    ],
    close: [
      'Twenty conversations. The people named, the titles attached, the dates on the page. The Internet of Value is already in the room.',
      'QNT meters the network. Overledger lets the networks speak. The banks still owe the holder. The instruction is new. Thank you for listening.',
    ],
  },
};

const JAMES_BRIDGES = [
  'That line still gets me.',
  'That filing is why the six banks are on the page.',
  'You can hear the 2018 paper in that sentence.',
  'I keep a map: gate, rooms, token, standard.',
  'Optimistic, yes — because the rooms are named.',
  'Same architecture. Different liability.',
];

const AMELIA_BRIDGES = [
  'And this is where sterling stops being a thought experiment.',
  'Right. The filing actually says it.',
  'Keep the title on the quote. It is how the next room is earned.',
  'That is the through-line, and it is a kind one.',
  'I can feel the decade connecting here.',
  'The banks still owe the holder. The instruction is new.',
];

function otherHost(who: HostId): HostId {
  return who === 'james' ? 'amelia' : 'james';
}

export function talkTrack(script: string, opener: HostId = 'james', n = 1): TalkLine[] {
  const cleaned = script
    .replace(/This is QntDesk, and I am James Hale\.\s*/g, '')
    .replace(/This is QntDesk\.\s*/g, '')
    .replace(/Amelia Crowe, QntDesk\.\s*/g, '')
    .replace(/James Hale and Amelia Crowe open the Quant story from the beginning[^.]*\.\s*/g, '')
    .replace(/^(James Hale|Amelia Crowe)\.\s*/gm, '')
    .replace(/Twenty short films\. Five minutes each\.\s*/gi, '')
    .replace(/Twenty films\. Five minutes\.\s*/gi, '')
    .replace(/Twenty films\./gi, 'Twenty conversations.')
    .replace(/, and for watching\.?/gi, '.')
    .replace(/and for watching\.?/gi, '');
  const sentences = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z“"‘])/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 6);
  const lines: TalkLine[] = [];
  const memory = MEMORY[n];
  let who: HostId = opener;
  if (memory) {
    lines.push({ who, text: memory.open[0] });
    who = otherHost(who);
    lines.push({ who, text: memory.open[1] });
    who = otherHost(who);
  }
  let cue = 0;
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join(' ');
    if (!chunk) continue;
    const bridgeBank = who === 'amelia' ? AMELIA_BRIDGES : JAMES_BRIDGES;
    const useBridge = lines.length > 1 && i > 0 && i % 6 === 0;
    lines.push({
      who,
      text: useBridge ? `${bridgeBank[cue % bridgeBank.length]} ${chunk}` : chunk,
    });
    if (useBridge) cue += 1;
    who = otherHost(who);
  }
  if (memory) {
    lines.push({ who, text: memory.close[0] });
    lines.push({ who: otherHost(who), text: memory.close[1] });
  } else if (lines.length === 1) {
    lines.push({
      who: otherHost(opener),
      text: 'And the next conversation picks up the next room — same network, same record.',
    });
  }
  return lines;
}

export function dialogueScript(lines: TalkLine[]): string {
  return lines
    .map((l) => `${HOSTS[l.who].name}: ${l.text}`)
    .join('\n\n');
}

function ep(
  n: number,
  id: string,
  title: string,
  lede: string,
  host: HostId,
  published: string,
  related: string,
  bed: Episode['bed'],
  quotes: EpisodeQuote[],
  script: string,
): Episode {
  const h = HOSTS[host];
  return {
    id,
    n,
    title,
    lede,
    host,
    hostName: h.name,
    hostTitle: h.title,
    minutes: 5,
    published,
    related,
    bed,
    audioSrc: `/podcast/audio/ep-${String(n).padStart(2, '0')}.mp3`,
    videoSrc: `/podcast/beds/${bed}.mp4`,
    posterSrc: `/podcast/stills/${bed}.png`,
    quotes,
    script: dialogueScript(
      talkTrack(
        `${script.trim()}\n\n${(CODA[n] ?? '').trim()}\n\n${(ACT3[n] ?? '').trim()}`.trim(),
        host,
        n,
      ),
    ),
  };
}

export const EPISODES: Episode[] = [
  ep(
    1,
    'internet-of-value',
    'The Internet of Value',
    'Paolo Tasca called it a risky necessity. Quant built a company on that sentence.',
    'james',
    '2026-09-12',
    '/vision',
    'future',
    [
      {
        who: 'Paolo Tasca',
        role: 'Frontiers in Blockchain, 15 September 2020',
        text: 'Internet of Value: A Risky Necessity',
      },
      {
        who: 'Quant',
        role: 'About Quant',
        text: 'Leading pioneers in unlocking the power of programmable money.',
      },
    ],
    `This is QntDesk. James Hale and Amelia Crowe open the Quant story from the beginning — the rooms, the rails, and the people who built the gateway. The story of Quant Network, Overledger, and the future of money, told from the record, voices named.

Paolo Tasca, writing in Frontiers in Blockchain on the fifteenth of September, twenty twenty, titled his essay with four words that still set the temperature of this industry: Internet of Value: A Risky Necessity. He pictured an information society of digital things and digital citizens, a world where value is exchanged as freely and easily as information. That is the destination. The road is the work.

Tasca named the four currents underneath it: datafication, dematerialization, platformization, and a new awareness of social and resource value. He also named the risks: systemic, governance, privacy, social welfare. He invited every operator building the digital economy to work together on an open, accessible, and secure Internet of Value.

Quant puts the same idea on the company page in a single line. Quant, About Quant: Leading pioneers in unlocking the power of programmable money. Another line from the same house: The foundation of digital finance.

Gilbert Verdian’s career is the industrial version of Tasca’s sentence. Vocalink. Mastercard. UK government CISO work. The proposal that became ISO Technical Committee three hundred and seven. Then a company whose product claim is not another ledger. It is the layer that lets ledgers, bank cores, and payment rails speak.

Overledger, in the twenty eighteen whitepaper archived at UCL Discovery, is introduced as a technology for the design, deployment and execution of multi-ledger decentralized applications. The authors are Gilbert Verdian, Paolo Tasca, Colin Paterson, and Gaetano Mondelli. Their abstract is the cold open of this entire series: applications have been trapped on a single ledger. Overledger is the proposed way out.

This desk files that argument as journalism. QNT is the utility token of the network. Six UK commercial banks are already programming sterling deposits on the architecture. The next nineteen films walk the decade: the burn, the standards rooms, Latin America, Rosalind, the Regulated Liability Network, GBTD, SATP, Fusion, PayScript, agents, Oracle, Murex, Tokyo, the Bank of England lab, Sibos Miami, and the Treasury’s DIGIT gilt.

The Internet of Value, on this desk, is a set of named rooms and dated filings.`,
  ),
  ep(
    2,
    'overledger-gateway',
    'Overledger — the gateway',
    'The twenty eighteen whitepaper files a gateway operating system.',
    'amelia',
    '2026-09-12',
    '/technology',
    'gateway',
    [
      {
        who: 'Verdian, Tasca, Paterson, Mondelli',
        role: 'Overledger whitepaper v0.1, 2018 — UCL Discovery abstract',
        text: 'This paper proposes a solution to the problem of single-ledger dependency, by introducing a new technology for the design, deployment and execution of multi-ledger decentralized applications. This technology is called Overledger.',
      },
      {
        who: 'Dr Luke Riley',
        role: 'Head of Innovation — DLT interoperability options note, 11 November 2021',
        text: 'Quant’s Overledger is the pre-eminent instance of API gateway categorisation.',
      },
    ],
    `If you remember one object from this series, remember this one. Overledger is a gateway operating system. It maps a request onto the settlement domains it is connected to — Ethereum, Hyperledger Fabric, Corda, a bank core, Faster Payments, SWIFT.

The twenty eighteen whitepaper, version zero point one, sits at UCL Discovery. Verdian, Tasca, Paterson, Mondelli, Overledger whitepaper v0.1, twenty eighteen, UCL Discovery abstract: This paper proposes a solution to the problem of single-ledger dependency, by introducing a new technology for the design, deployment and execution of multi-ledger decentralized applications. This technology is called Overledger.

They had already named the trap. The same authors, same abstract: This limitation forces distributed applications to be single-ledger-dependent, i.e. limited to be only executed on a single ledger.

Quant’s product page says it in the voice of a vendor. Quant, Overledger product page: Overledger is a universal API connector that ensures secure interoperability between traditional financial systems and blockchain networks. And again: How? With Overledger, the world’s first API-based blockchain gateway.

Dr Luke Riley, Head of Innovation, writing the DLT interoperability options note on the eleventh of November, twenty twenty one: The future of Distributed Ledger Technology is interoperability. But at the moment, most DLT implementations don’t work together, presenting a huge barrier to adoption. He places Overledger in a taxonomy — nodes, proxies, gateways — and then he chooses. Dr Luke Riley, Head of Innovation: Quant’s Overledger is the pre-eminent instance of API gateway categorisation.

The twenty twenty three ACM paper — Belchior, Riley, Hardjono, Vasconcelos, Correia — gives the academy the same grid: modes of data, asset transfer, asset exchange; infrastructure of nodes, proxies, gateways. Quant’s shipped claim occupies the gateway cell.

That is why this desk keeps saying gateway. If deposits, tokens and wholesale money sit on different books, the layer that already maps between those books is the object to file. Fusion, PayScript, Flow Applications, QuantNet sit on that sentence. We will get to each of them. First, the token that licences the network.`,
  ),
  ep(
    3,
    'qnt-utility',
    'QNT — the token of the network',
    'An ERC-20, burned in twenty eighteen. Overledger licences settle in it.',
    'james',
    '2026-09-12',
    '/markets',
    'gateway',
    [
      {
        who: 'Quant',
        role: 'About Quant',
        text: 'The foundation of digital finance.',
      },
      {
        who: 'Gilbert Verdian',
        role: 'The three-layer digital money architecture, 23 April 2026',
        text: 'Quant is the horizontal interoperability layer connecting all three tiers of the digital money architecture.',
      },
    ],
    `James Hale. QNT is an ERC-20 on Ethereum. The contract is zero x four a two two zero E six zero nine six B two five E A D b eight eight three five eight c b four four zero six eight A three two four eight two five four six seven five. Check it yourself on Etherscan before you send anything.

On the fourteenth of September, twenty eighteen, Quant burned unsold QNT. The transaction is on the chain: zero x seven six three f three two a zero. Quant’s own post records a post-burn total of fourteen million, six hundred and twelve thousand, four hundred and ninety three point zero eight QNT. Public allocation nine million, nine hundred and sixty four thousand. Company four million, six hundred and forty eight thousand.

Bitstamp’s MiCA whitepaper, dated the thirteenth of May, twenty twenty six, records a TGE split of sixty eight point one nine percent market and thirty one point eight one percent company, an initialised contract of forty five million, four hundred and sixty seven thousand, and a post-burn maximum they cite as fourteen million, eight hundred and eighty one thousand, three hundred and sixty four. Those two supply figures sit together on the record. Today’s circulating supply and the live price come from CoinGecko. This desk does not invent a print.

Licences for Overledger can lock QNT for the term of the licence — that is in the MiCA filing. QNT is the utility token of Quant Network. It is distinct from equity in Quant Network Limited.

Why does a gateway need a token. Because the network has to be paid for in a unit the software already understands. Overledger licences settle in QNT. That is the industrial reason it trades. Quant, on the company page: The foundation of digital finance.

Read that next to Gilbert Verdian’s twenty twenty six architecture essay. He writes that Quant is the horizontal interoperability layer connecting all three tiers of the digital money architecture. The token is how that layer is licensed. The banks we will name in episode eight do not issue QNT. They issue sterling deposits. The gateway in the middle is Overledger. The unit of that gateway is QNT.

If you came here for a price target, leave with a contract address and two supply notes. If you came here for the future of money, stay. The token is the metering of a network of networks.`,
  ),
  ep(
    4,
    'iso-decade',
    'A decade at ISO',
    'From Technical Committee three hundred and seven to ISO/TS 23516.',
    'amelia',
    '2026-09-12',
    '/standards',
    'london',
    [
      {
        who: 'Gilbert Verdian',
        role: 'The three-layer digital money architecture, 23 April 2026',
        text: 'A framework every bank needs to understand before building tokenisation infrastructure.',
      },
      {
        who: 'Dr Luke Riley',
        role: 'Head of Innovation — DLT interoperability options note, 11 November 2021',
        text: 'The future of Distributed Ledger Technology (DLT) is interoperability.',
      },
    ],
    `Amelia Crowe. Standards are slow on purpose. In twenty fifteen Gilbert Verdian put a blockchain committee in front of ISO. That proposal became ISO Technical Committee three hundred and seven. A decade later the interoperability framework is ISO/TS 23516, project eighty two thousand and ninety eight: DLT to DLT, and DLT to the world outside the ledger.

That is the vocabulary the decade was for. Quant’s product bet is that a gateway can ship while the vocabulary is still being written down in Geneva.

Gilbert Verdian, The three-layer digital money architecture, twenty third of April, twenty twenty six: A framework every bank needs to understand before building tokenisation infrastructure. He is speaking about money layers. The ISO work is the twin sentence: a framework every rail needs before it pretends to be a universe.

SATP, which we film in episode ten, is IETF work. ISO 23516 is the committee vocabulary. They are cousins, not the same object. Hyperledger Cacti, where Rafael Belchior is a maintainer, is the Linux Foundation’s enterprise interoperability project — again a cousin.

The people in those rooms have names. Martin Hargreaves and Alex Chiriac appear on SATP drafts from Quant. Thomas Hardjono writes from MIT. Belchior writes from Técnico Lisboa. The protocol is larger than any one vendor. That is what a standard is.

When this desk pins Geneva, Sydney, Brussels, Cambridge and Boston on the globe, those pins are rooms where interoperability is written down. They are documents, and the people who sign them.

The enthusiasm here is not for a committee number. It is for the moment a bank can say: we connected once, and the other networks already have a word for what we just did. ISO gave them the word. Overledger gave them the gate.`,
  ),
  ep(
    5,
    'lacchain',
    'LACChain, twenty twenty one',
    'Quant and IDB Lab announce Overledger for Latin America and the Caribbean.',
    'james',
    '2026-09-12',
    '/programmes',
    'london',
    [
      {
        who: 'Quant',
        role: 'QuantNet product page',
        text: 'QuantNet: The Infrastructure of Money.',
      },
      {
        who: 'Kirat Rawel',
        role: 'Head of Sales — 9 July 2026',
        text: 'Synchronised settlement across jurisdictions is technically achievable today. The reason it is not the default is a coordination problem, not a capability problem.',
      },
    ],
    `James Hale. First of February, twenty twenty one. Quant and LACChain, the IDB Lab programme, announce Overledger interoperability and tokenised cross-border payments for Latin America and the Caribbean. The grade on this desk is announced. It is a named room in twenty twenty one.

That announcement matters because the Internet of Value was never going to be a London-only story. Cross-border value is where single-ledger dependency hurts first. A payment that has to become a message, then a correspondent, then another message, is the old internet of value — slow, expensive, and full of reconciliation.

Kirat Rawel, Head of Sales, ninth of July, twenty twenty six: Synchronised settlement across jurisdictions is technically achievable today. The reason it is not the default is a coordination problem, not a capability problem. And again, Kirat Rawel, Head of Sales: When a payment message moves seamlessly between institutions across jurisdictions using ISO 20022, that is real progress. But message delivery is not the same as settlement finality, it is just the communication of a transfer instruction.

LACChain is an early public attempt to put a gateway under that coordination problem. IDB Lab’s programme, Overledger as the interoperability layer, tokenised cross-border payments as the use case. We file the date. We file the partners. We do not inflate it into a twenty twenty six mandate.

QuantNet, on Quant’s product page, is the later bank-facing name for the same architecture. Quant, QuantNet product page: QuantNet: The Infrastructure of Money. And: QuantNet connects banks to tokenised money and digital assets through a single programmable gateway, enabling value movement across public and private networks, payment systems, and asset platforms with certainty and control.

From an announced corridor in twenty twenty one to a bank-facing gateway in twenty twenty five is one company’s walk. The next films name the labs and the live sterling.`,
  ),
  ep(
    6,
    'rosalind',
    'Project Rosalind',
    'BIS Innovation Hub London and the Bank of England, twenty twenty three.',
    'amelia',
    '2026-09-12',
    '/cbdc',
    'london',
    [
      {
        who: 'Gilbert Verdian',
        role: 'CEO and Founder — Oracle Blockchain blog, 12 February 2025',
        text: 'And for institutional clients, this is key, as it addresses the challenge of securely connecting, orchestrating and programming the movement of money and assets across multiple networks of value.',
      },
    ],
    `Amelia Crowe. Project Rosalind is a twenty twenty three experiment. The Bank for International Settlements Innovation Hub in London, with the Bank of England, tested APIs for a retail central-bank digital currency. Quant says it was on the vendor team with UST. The BIS page records a concluded experiment.

That sentence has three jobs. It names the room. It names Quant’s own claim. It keeps Rosalind in twenty twenty three, where it lives.

A central-bank digital currency is a liability of the central bank. GBTD tokens, which we reach in episode eight, are liabilities of commercial banks. Rosalind sat on the CBDC side of that line. The Synchronisation Lab of February twenty twenty six, later in this series, sits adjacent to wholesale RTGS. Different objects. Same company walking through the rooms where the future of money is being designed.

Gilbert Verdian, CEO and Founder, Oracle Blockchain blog, twelfth of February, twenty twenty five: And for institutional clients, this is key, as it addresses the challenge of securely connecting, orchestrating and programming the movement of money and assets across multiple networks of value.

Rosalind was an API experiment for retail CBDC. The skill Quant says it brought is orchestration — connecting, programming, moving value across networks. That skill is the Overledger claim, reused wherever the client is a central bank, a commercial bank, or a market infrastructure.

Basel appears on our globe as bibliography: Project Agora, speeches on the singleness of money, wholesale CBDC research. London appears as the Rosalind room and as Quant’s home. The pins mean rooms. The papers mean dates. The future of money is being written in both.`,
  ),
  ep(
    7,
    'rln',
    'The Regulated Liability Network',
    'The twenty twenty four dress rehearsal GBTD sits on.',
    'james',
    '2026-09-12',
    '/programmes',
    'sterling',
    [
      {
        who: 'Gilbert Verdian',
        role: 'CEO and Founder — Oracle Blockchain blog, 12 February 2025',
        text: 'We have partnered with Oracle not only to bring the concept of a unified ledger to life, but also to enable seamless interoperability for Oracle’s platform for implementations of assets and regulated networks such the Regulated Liability Network (RLN).',
      },
    ],
    `James Hale. Before the Great British Tokenised Deposit, there was the Regulated Liability Network. UK Finance’s RLN phase in twenty twenty four is the dress rehearsal. Same problem: the singleness of commercial-bank money across institutions. Can a deposit at one bank be programmed, moved, and recognised at another, without becoming a different kind of money.

Gilbert Verdian, CEO and Founder, Oracle Blockchain blog, twelfth of February, twenty twenty five: Quant is delighted with the launch of Oracle’s Blockchain Platform Digital Assets Edition. We have partnered with Oracle not only to bring the concept of a unified ledger to life, but also to enable seamless interoperability for Oracle’s platform for implementations of assets and regulated networks such the Regulated Liability Network.

That is Verdian placing Overledger under RLN-shaped work on an Oracle, Hyperledger Fabric platform. The date is February twenty twenty five. GBTD, the live UK Finance selection, arrives in September the same year.

The idea is older than both. Commercial-bank money is already digital. What it has not been, at scale, is programmable across institutions with atomic settlement and a shared instruction. RLN is the industry attempt to keep the liability where it is — on the bank balance sheet — and still let the software run.

Quant, QuantNet product page: Built on the proven architecture underpinning GB Tokenised Deposits, UK RLN, it is seamless, compliant, and ready for global adoption.

So the company’s own product page draws a straight line: RLN, GBTD, QuantNet. Episode eight is that line arriving in public, with six bank names attached.`,
  ),
  ep(
    8,
    'gbtd',
    'GBTD — live sterling, programmed',
    'Twenty sixth of September, twenty twenty five. Six banks. Quant as technology partner.',
    'amelia',
    '2026-09-12',
    '/programmes',
    'sterling',
    [
      {
        who: 'Gilbert Verdian',
        role: 'CEO of Quant — UK Finance GBTD announcement, 26 September 2025',
        text: 'Being selected for this project marks a pivotal step in the UK’s financial evolution. This milestone goes beyond improving payments, it’s about enabling new forms of programmable money that will fundamentally transform how value is moved and managed.',
      },
      {
        who: 'Gilbert Verdian',
        role: 'The three-layer digital money architecture, 23 April 2026',
        text: 'Tokenised deposits are ordinary commercial bank money, the M1/M2 deposits that fund the overwhelming majority of global economic activity, made programmable through distributed ledger technology.',
      },
      {
        who: 'UK Finance',
        role: 'GBTD live-pilot announcement, 26 September 2025',
        text: 'These tokenised deposits are a digital representation of traditional sterling commercial bank money.',
      },
      {
        who: 'Jana Mackintosh',
        role: 'Managing Director, UK Finance — 26 September 2025',
        text: 'This project is a powerful example of industry collaboration to deliver next generation payments for the benefit of customers and businesses - and an opportunity for the UK to lead globally in setting standards for tokenised money.',
      },
    ],
    `Amelia Crowe. This is the live one. Twenty sixth of September, twenty twenty five. UK Finance selects Quant to provide the technology for live tokenised sterling deposits with Barclays, HSBC, Lloyds Bank, NatWest, Nationwide and Santander. EY and Linklaters support. Overledger and PayScript are named as the foundation.

The tokens are liabilities of those six commercial banks. The holder is owed by the bank. Quant supplies Overledger and PayScript. That is the partnership.

Gilbert Verdian, CEO of Quant, UK Finance GBTD announcement, twenty sixth of September, twenty twenty five: Being selected for this project marks a pivotal step in the UK’s financial evolution. This milestone goes beyond improving payments, it’s about enabling new forms of programmable money that will fundamentally transform how value is moved and managed. Our involvement underscores Quant’s leadership in digital finance, as we work alongside the UK’s leading institutions to build the infrastructure powering tomorrow’s economy.

Seven months later he writes the architecture essay. Gilbert Verdian, The three-layer digital money architecture, twenty third of April, twenty twenty six: Tokenised deposits are ordinary commercial bank money, the M1/M2 deposits that fund the overwhelming majority of global economic activity, made programmable through distributed ledger technology. And: Start at Layer 2. Tokenised deposits are the most mature, most deployed, and most regulatory-clear component. They are where institutional use cases live today.

That is the future of money stated as a starting point. Not a new coin. The deposits that already fund the economy, programmed.

UK Finance’s digital markets report of September twenty twenty six names GBTD as UK innovation. The Economic Secretary’s speech the same week names a DIGIT gilt in the first quarter of twenty twenty seven. We will film that landscape in episode twenty.

If you have been waiting for the moment programmable money left the whitepaper, this is the date. Six banks. One gateway. Sterling that can take an instruction.`,
  ),
  ep(
    9,
    'six-banks',
    'The six banks',
    'Barclays, HSBC, Lloyds, NatWest, Nationwide, Santander.',
    'james',
    '2026-09-12',
    '/programmes',
    'sterling',
    [
      {
        who: 'Gilbert Verdian',
        role: 'CEO of Quant — UK Finance GBTD announcement, 26 September 2025',
        text: 'Our involvement underscores Quant’s leadership in digital finance, as we work alongside the UK’s leading institutions to build the infrastructure powering tomorrow’s economy.',
      },
    ],
    `James Hale. Say the names the way UK Finance said them. Barclays. HSBC. Lloyds Bank. NatWest. Nationwide. Santander.

Those six are the GBTD cohort. Each token is that bank’s liability. The holder does not become a customer of Quant. The holder remains a customer of the bank that issued the deposit.

That is the design that lets a regulated system move. Programmability arrives without asking a supervisor to pretend a new issuer has appeared. The issuer is the bank you already know.

Around the cohort sit the institutions this desk also files. UK Finance convened the selection. The Bank of England runs the Synchronisation Lab we reach later. The BIS holds the Rosalind page. Murex puts tokenised deposits inside MX.3. Oracle names Overledger on a Fabric platform.

Gilbert Verdian, CEO of Quant, twenty sixth of September, twenty twenty five: Our involvement underscores Quant’s leadership in digital finance, as we work alongside the UK’s leading institutions to build the infrastructure powering tomorrow’s economy.

Working alongside is the correct verb. Technology partner. Overledger plus PayScript. EY and Linklaters in support.

When this desk prints letter tiles — B, H, L, N, N, S — those are the banks. When the live QNT chip moves in the header, that is the utility token of the gateway, priced by the market, licensed by the software. Two different objects on one page, because the future of money is a system, not a ticker.

Episode ten is how an asset is supposed to move from one network to another without being in two places at once.`,
  ),
  ep(
    10,
    'satp',
    'SATP — how assets move',
    'Secure Asset Transfer Protocol. IETF work. Two-phase commit inside stage three.',
    'amelia',
    '2026-09-12',
    '/standards',
    'gateway',
    [
      {
        who: 'Dr Luke Riley',
        role: 'Head of Innovation — DLT interoperability options note, 11 November 2021',
        text: 'The future of Distributed Ledger Technology (DLT) is interoperability.',
      },
    ],
    `Amelia Crowe. SATP is the Secure Asset Transfer Protocol. It is an IETF work item. ODAP was the twenty twenty name. Martin Hargreaves and Alex Chiriac appear as Quant authors. Others on the drafts include Thomas Hardjono of MIT, Rafael Belchior of Técnico Lisboa, and Ramakrishna of IBM Research.

Stage zero is pre-transfer verification — a context ID, identity checks, the FATF travel rule. Out of the core spec. Stage one is initiation. Gateways exchange claims and agree to commence. Stage two is lock assertion. The origin gateway signs that the asset is immobilised, because the other side may not be able to read a private ledger. Stage three is commitment. Classic two-phase commit lives here: prepare, then burn and mint. Both sides commit, or both abort.

Dr Luke Riley, Head of Innovation, twenty twenty one: The future of Distributed Ledger Technology is interoperability.

SATP is how interoperability becomes a protocol instead of a hope. Overledger can implement a SATP-shaped gateway. The protocol remains an IETF document.

Atomicity: the transfer commits on both networks or fails with no state change. Consistency: when it ends, the asset lives in exactly one network. Isolation: origin state is not modified by anyone else while locked. Durability: once committed, a gateway crash does not undo it.

That is the sound of the future of money when it is being careful. Not a bridge that hopes. A commit.

Crash recovery is a separate Belchior draft. Read the architecture before the core. Then read the core. Then look at Fusion, which is how Quant now ships a multi-ledger execution environment on top of the gateway.`,
  ),
  ep(
    11,
    'fusion',
    'Fusion — Layer 2.5',
    'A multi-ledger rollup. Trusted Node is who processes it.',
    'james',
    '2026-09-12',
    '/technology',
    'gateway',
    [
      {
        who: 'Dr Luke Riley',
        role: 'Head of Innovation — Flow Applications, 21 May 2026',
        text: 'Overledger is Quant’s enterprise blockchain platform, the connectivity and orchestration layer that sits across public and private distributed ledger networks.',
      },
    ],
    `James Hale. Fusion is Quant’s multi-ledger rollup. The company calls it Layer 2.5 — an execution environment that connects many networks at once. A twenty twenty six Japanese patent, Quant says, protects the multi-DLT token method behind it.

Trusted Node, in Quant’s tenth of September twenty twenty six essay, is the question of who processes the transaction. KYC-verified operators. Chosen jurisdictions. DORA Article twenty eight as the compliance test.

Dr Luke Riley, Head of Innovation, Flow Applications, twenty first of May, twenty twenty six: Overledger is Quant’s enterprise blockchain platform, the connectivity and orchestration layer that sits across public and private distributed ledger networks.

Fusion sits on that connectivity. Flow Applications are the workflows. PayScript is the language of the instruction. QuantNet is the bank-facing door.

The excitement — and I will use the word — is that a rollup across ledgers is how you stop asking every application to become a native citizen of every chain. You execute once. You settle where the liability lives.

Gilbert Verdian, The three-layer digital money architecture, twenty twenty six: Quant’s Overledger platform is the horizontal interoperability layer, a universal API gateway that any institution can connect to once, gaining the ability to transact across any distributed ledger and any legacy rail in the three-layer architecture.

Connect once. Transact across. That is Fusion’s job description in motion. Episode twelve is the language those transactions speak.`,
  ),
  ep(
    12,
    'payscript',
    'PayScript — money that takes an instruction',
    'Martin Hargreaves puts programmability at the account.',
    'amelia',
    '2026-09-12',
    '/technology',
    'sterling',
    [
      {
        who: 'Martin Hargreaves',
        role: 'Chief Product Officer, Financial Services — 2 May 2025',
        text: 'Programmable payments present a transformative opportunity for financial transactions – enabling automation, customisation and greater control beyond the traditional payment mechanisms we have today.',
      },
      {
        who: 'Martin Hargreaves',
        role: 'Chief Product Officer, Financial Services — 2 May 2025',
        text: 'PayScript, our fully customisable, open standard language enables businesses to develop programmable workflows that improve the efficiency of payment processes by removing repetitive manual tasks.',
      },
    ],
    `Amelia Crowe. Martin Hargreaves is Chief Product Officer, Financial Services. On the second of May, twenty twenty five, he writes the programmable payments note that this desk keeps next to the whitepaper.

Martin Hargreaves, Chief Product Officer, Financial Services: Programmable payments present a transformative opportunity for financial transactions – enabling automation, customisation and greater control beyond the traditional payment mechanisms we have today.

He makes it simple. Martin Hargreaves: In simple terms, programmable payments are automated payments that are triggered when certain conditions are met.

Then he moves the intelligence. Martin Hargreaves: We’re proposing a new model where programmability is embedded at the account level, regardless of the type of funds, allowing for greater flexibility and enabling customers to select payment methods on a per-transaction basis, without being constrained by predefined functionality.

And he names the language. Martin Hargreaves: PayScript, our fully customisable, open standard language enables businesses to develop programmable workflows that improve the efficiency of payment processes by removing repetitive manual tasks.

GBTD names PayScript as foundation beside Overledger. That is why this film sits after the six banks. The deposits are the liability. The gateway is the path. PayScript is the instruction.

The future of money, in this telling, is an account that can take a condition. Invoice paid when goods scan. Margin called when a price prints. A treasury moving at the speed of the rule, not the speed of the email.

That is worth a British reporter raising her voice a little. The banks already hold the money. The software is catching up.`,
  ),
  ep(
    13,
    'flow-agents',
    'Flow Applications — humans and agents, same steps',
    'Dr Luke Riley’s workflows, callable by a person or a model.',
    'james',
    '2026-09-12',
    '/technology',
    'future',
    [
      {
        who: 'Dr Luke Riley',
        role: 'Head of Innovation — Flow Applications, 21 May 2026',
        text: 'Flow Applications are where Overledger’s network connectivity becomes something you can ship: pre-built, reusable workflows that any interface can consume from day one.',
      },
    ],
    `James Hale. Twenty first of May, twenty twenty six. Dr Luke Riley, Head of Innovation, publishes Flow Applications.

Dr Luke Riley, Head of Innovation: Flow Applications are where Overledger’s network connectivity becomes something you can ship: pre-built, reusable workflows that any interface can consume from day one.

And: A Flow Application is a complete business workflow, bridging assets, executing payments, deploying contracts, managing permissions, hosted on Overledger and ready to consume.

Every Overledger workflow, in that note, auto-exposes MCP tool definitions — natural-language hints, risk flags, idempotency. Claude Desktop, Cursor, or a headless agent can execute the same steps as Quant Connect.

That is the sentence where the future of money meets the future of software. The bank does not write the workflow twice. The agent does not get a secret second API. The instruction is the same.

Thomas Hardjono’s work on authenticated delegation — including the ICML twenty twenty five position that AI agents need authenticated delegation — is the constraint beside that excitement. An agent that pays must carry an auditable authority, not a key in a prompt.

MIT SERC, the Social and Ethical Responsibilities of Computing, sits in the landscape of that argument. This desk files it as landscape. The constraint still applies to Flow and to x402.

Riley again, twenty twenty one, on why the gateway category: We explain why we think that the API gateway categorisation is the best approach, and why Quant’s Overledger is the leading solution in this category.

Ship the workflow. Let the interface be a human or a model. Keep the audit. That is episode thirteen.`,
  ),
  ep(
    14,
    'x402',
    'x402 — Payment Required, twenty twenty six',
    'HTTP 402, reserved since nineteen ninety seven, revived for software that pays software.',
    'amelia',
    '2026-09-12',
    '/technology',
    'future',
    [
      {
        who: 'Quant',
        role: 'About Quant',
        text: 'Ready to redefine how money works for you?',
      },
    ],
    `Amelia Crowe. HTTP 402, Payment Required, has been reserved since nineteen ninety seven. It sat unused in the web stack for a generation. x402, hosted at the Linux Foundation, revives it so software can pay software. Quant is a general member.

Quant’s published claim is that Fusion Layer 2.5 is x402-ready from day one, and that the missing piece is settling those agent payments in tokenised bank money rather than only in unregulated tokens.

Listen to that twice. Agents will pay. The open question is what they pay in. Quant’s answer is the middle band of Verdian’s diagram: commercial-bank money, programmed.

Quant, About Quant: Ready to redefine how money works for you?

The company page is allowed a slogan. This desk translates it. Money that works is money that can answer a machine without leaving the regulated perimeter.

Hardjono’s delegation papers are again the brake pedal. An agent with a payment method and no authentic delegation is a story we already know the ending of. Flow Applications plus x402 plus tokenised deposits is the stack Quant is arguing for: the workflow, the web status code, the bank liability.

That is a vision of the future of money I can say with energy, because the pieces are named. Linux Foundation for the code. IETF for SATP. UK Finance for the deposits. Overledger for the gate.`,
  ),
  ep(
    15,
    'oracle-fabric',
    'Oracle, Fabric, a unified ledger',
    'February twenty twenty five. Oracle names Overledger on a Hyperledger Fabric platform.',
    'james',
    '2026-09-12',
    '/programmes',
    'gateway',
    [
      {
        who: 'Gilbert Verdian',
        role: 'CEO and Founder — Oracle Blockchain blog, 12 February 2025',
        text: 'Quant is delighted with the launch of Oracle’s Blockchain Platform Digital Assets Edition.',
      },
    ],
    `James Hale. February twenty twenty five. Oracle Blockchain Platform Digital Assets Edition. Fabric underneath. Besu also in the family. Oracle’s own blog names Quant Overledger as the orchestration layer for cross-ledger, two-phase workflows.

Gilbert Verdian, CEO and Founder, Oracle Blockchain blog, twelfth of February, twenty twenty five: Quant is delighted with the launch of Oracle’s Blockchain Platform Digital Assets Edition. We have partnered with Oracle not only to bring the concept of a unified ledger to life, but also to enable seamless interoperability for Oracle’s platform for implementations of assets and regulated networks such the Regulated Liability Network.

Linux Foundation software underneath. Quant gateway across. New York is the markets pin on our globe.

Two-phase workflows on that blog are the same family of idea as SATP’s stage three. Prepare. Commit. The asset in one place when you are done.

This is how an enterprise stack actually looks. Not a new chain for Oracle’s clients. A Fabric platform they already understand, and a gateway that can talk to the other networks those clients still have to live with.

Episode sixteen is the capital-markets twin. Paris. Murex. MX.3.`,
  ),
  ep(
    16,
    'murex',
    'Murex — programmable markets',
    'Twenty fifth of March, twenty twenty six. Tokenised deposits inside MX.3.',
    'amelia',
    '2026-09-12',
    '/programmes',
    'sterling',
    [
      {
        who: 'Gilbert Verdian',
        role: 'Founder and CEO — Murex newsroom, 25 March 2026',
        text: 'The next generation of capital markets infrastructure will not replace what works. It will make what works programmable.',
      },
    ],
    `Amelia Crowe. Twenty fifth of March, twenty twenty six. Murex and Quant announce a partnership to put tokenised deposits and digital-bond settlement inside MX.3, the cross-asset platform used by more than three hundred institutions.

Gilbert Verdian, Founder and CEO, Murex newsroom, twenty fifth of March, twenty twenty six: Banks and capital markets firms know tokenization is happening. The question they are working through is how to operationalize it without compromising the risk management, compliance and operational resilience they have spent decades building.

Then the line this series could be named after. Gilbert Verdian, Founder and CEO: The next generation of capital markets infrastructure will not replace what works. It will make what works programmable.

That is the whole Quant vision in one breath. Keep the system that already has the risk book, the compliance desk, the sixty thousand users. Teach it an instruction.

Alex Chiriac’s public bio lists connectors under Overledger including Hyperledger Fabric, Corda, Polkadot and the XRP Ledger. Murex is the named capital-markets integration: one connector, many ledgers, inside a system the industry already runs.

Sibos Miami, later this month as we record, puts Quant and Murex on a Discover Stage on the twenty eighth of September, twenty twenty six, talking programmable settlement. Episode nineteen will meet them there.

If you want to know whether the future of money is a demo or a desk, look at MX.3. That is a desk.`,
  ),
  ep(
    17,
    'dentsu',
    'Dentsu Soken, Tokyo',
    'Fourteenth of January, twenty twenty six. A named room in Japan.',
    'james',
    '2026-09-12',
    '/programmes',
    'future',
    [
      {
        who: 'Quant',
        role: 'Company value — Ambition',
        text: 'The scale of a task won’t deter us when we believe it will take us closer to our vision.',
      },
    ],
    `James Hale. Fourteenth of January, twenty twenty six. Dentsu Soken, Tokyo. A named Quant programme in Japan. On this globe Tokyo is a room, the way London is a room and Paris is a room.

Quant’s own note on that announcement lists prior regulated pilots. We file Quant’s sentence as Quant’s sentence. The pin means a named partner on a named date.

Quant, Company value — Ambition: The scale of a task won’t deter us when we believe it will take us closer to our vision. Every problem is an opportunity. Every obstacle is a chance to take a calculated risk and question assumptions. In short, we’re not afraid to think big.

The Internet of Value has to be a multi-city story or it is a pamphlet. Tokyo is how this desk remembers that. Dentsu Soken is the fourteenth of January. Murex is the twenty fifth of March. The Bank of England lab is February. Sibos Miami is the last week of September.

Corridors on the globe — Dentsu, Murex, Oracle, LACChain, Sibos — are sourced programme arcs. They are how a gateway company looks when it is walking.

Episode eighteen is the lab next to RTGS.`,
  ),
  ep(
    18,
    'sync-lab',
    'The Synchronisation Lab',
    'February twenty twenty six. Simulated RT2. Quant as a Synchronisation Operator.',
    'amelia',
    '2026-09-12',
    '/cbdc',
    'london',
    [
      {
        who: 'Gilbert Verdian',
        role: 'The three-layer digital money architecture, 23 April 2026',
        text: 'The Bank of England’s Synchronisation Lab, in which Quant participates as a Synchronisation Operator, is testing atomic multi-party settlement over the existing RTGS synchronisation capability, where QuantNet coordinates cross-ledger transactions with the GBP leg settling through RTGS.',
      },
    ],
    `Amelia Crowe. February twenty twenty six. The Bank of England’s Synchronisation Lab. Simulated RT2. Quant’s own note files the participation.

Gilbert Verdian, The three-layer digital money architecture, twenty third of April, twenty twenty six: The Bank of England’s Synchronisation Lab, in which Quant participates as a Synchronisation Operator, is testing atomic multi-party settlement over the existing RTGS synchronisation capability, where QuantNet coordinates cross-ledger transactions with the GBP leg settling through RTGS.

That is a long sentence and every clause earns its keep. Synchronisation Operator. Atomic multi-party settlement. Existing RTGS capability. QuantNet coordinating. Sterling leg through RTGS.

Layer one in Verdian’s diagram is wholesale central-bank money and RTGS finality. The lab sits against that layer. GBTD sits in layer two, commercial-bank deposits. Different liabilities. One conversation.

Verdian again, same essay: The three-layer architecture functions as a coherent system only when all three layers can communicate with each other and with the legacy infrastructure, including RTGS, SWIFT, Faster Payments, and Open Banking, that will continue to process the majority of financial transactions for years alongside the new architecture.

The majority of financial transactions will still run on the rails we already have. The future of money is those rails, speaking. The lab is where a gateway practises the accent.`,
  ),
  ep(
    19,
    'sibos-trusted',
    'Trusted Node, Sibos Miami',
    'Who processes the transaction. Then the industry walks into Miami.',
    'james',
    '2026-09-12',
    '/news',
    'london',
    [
      {
        who: 'Quant',
        role: 'Company value — Trust',
        text: 'We trust each other, we engineer trust into our solutions, and we work hard every day to earn the trust of our clients and partners.',
      },
    ],
    `James Hale. Tenth of September, twenty twenty six. Quant publishes The Trusted Node Program: Who’s processing your transaction? KYC-verified operators. Chosen jurisdictions for Fusion. DORA Article twenty eight as the compliance test. A company essay on who processes the transaction.

Quant, Company value — Trust: Fundamental to a prosperous economy, trust also lies at the heart of our company. Indeed, we believe it is the bedrock of a healthy society committed to equality and fairness. We trust each other, we engineer trust into our solutions, and we work hard every day to earn the trust of our clients and partners.

Trusted Node is that value turned into an operating model. If Fusion is a multi-ledger rollup, someone has to run the node. Quant is naming who, and under which rule.

Then the calendar. Sibos twenty twenty six, Miami Beach Convention Center, the twenty eighth of September to the first of October, stand DISL fifty one. Posted from the official Quant account on the fifth of August. Discover Stage on the twenty eighth at half past ten with Murex on programmable settlement. Welcome drinks the twenty ninth. Conference stage the first of October.

Sibos twenty twenty five was Frankfurt, stand thirteen. The industry fair is where a gateway company stands still long enough for the banks to walk over.

This desk will be reading the wire that week the way we read it every week: headlines that name Quant, Overledger, or QNT. Official voices: at quantnetwork, at OverledgerDev, at gverdian.

Episode twenty is the decade ahead — DIGIT, deposits, and the sentence Verdian already wrote.`,
  ),
  ep(
    20,
    'future-money',
    'The decade ahead',
    'DIGIT in twenty twenty seven. Deposits that take an instruction. A gateway that already exists.',
    'amelia',
    '2026-09-12',
    '/vision',
    'future',
    [
      {
        who: 'Gilbert Verdian',
        role: 'The three-layer digital money architecture, 23 April 2026',
        text: 'Start at Layer 2. Tokenised deposits are the most mature, most deployed, and most regulatory-clear component. They are where institutional use cases live today.',
      },
      {
        who: 'Gilbert Verdian',
        role: 'Founder and CEO — Murex newsroom, 25 March 2026',
        text: 'The next generation of capital markets infrastructure will not replace what works. It will make what works programmable.',
      },
      {
        who: 'Paolo Tasca',
        role: 'Frontiers in Blockchain, 2020',
        text: 'I, therefore, invite all the operators and stakeholders who are building the new digital economy to work together to build an open, accessible, and secure IoV for an equitable global economy.',
      },
      {
        who: 'UK Finance',
        role: 'GBTD live-pilot announcement, 26 September 2025',
        text: 'These tokenised deposits are a digital representation of traditional sterling commercial bank money. They retain the trust and regulatory protections of conventional deposits, while offering benefits such as enhanced speed and fraud protection.',
      },
      {
        who: 'Jana Mackintosh',
        role: 'Managing Director, UK Finance — 26 September 2025',
        text: 'This project is a powerful example of industry collaboration to deliver next generation payments for the benefit of customers and businesses - and an opportunity for the UK to lead globally in setting standards for tokenised money.',
      },
    ],
    `Amelia Crowe. We end where the calendar is still warm. On the eighth of September, twenty twenty six, the Economic Secretary to the Treasury speaks at UK Finance. The speech names a DIGIT gilt in the first quarter of twenty twenty seven, and wholesale digital markets. UK Finance’s report the same week names GBTD as UK innovation.

Gilbert Verdian, The three-layer digital money architecture, twenty third of April, twenty twenty six: Start at Layer 2. Tokenised deposits are the most mature, most deployed, and most regulatory-clear component. They are where institutional use cases live today.

Gilbert Verdian, Founder and CEO, Murex newsroom, twenty fifth of March, twenty twenty six: The next generation of capital markets infrastructure will not replace what works. It will make what works programmable.

Paolo Tasca, Frontiers in Blockchain, twenty twenty: I, therefore, invite all the operators and stakeholders who are building the new digital economy to work together to build an open, accessible, and secure IoV for an equitable global economy.

That is the future of money as this desk can state it from the record. Commercial-bank sterling, programmed, at six UK banks. A gateway operating system archived in twenty eighteen. A utility token burned down and licensed. An IETF protocol for moving an asset once. A Layer 2.5 rollup. A language called PayScript. Workflows an agent can call. Oracle on Fabric. Murex in MX.3. A lab beside RTGS. Miami at the end of September.

QNT is how the network is metered. Overledger is how the networks speak. The banks still owe the holder. The instruction is new.

Twenty films. The people named, the titles attached, the dates on the page. This is QntDesk. The Internet of Value is already in the room. Thank you for listening, and for watching.`,
  ),
];

export function episodesNewestFirst(): Episode[] {
  return [...EPISODES].sort((a, b) => b.n - a.n || b.published.localeCompare(a.published));
}

export function episodesInOrder(): Episode[] {
  return [...EPISODES].sort((a, b) => a.n - b.n);
}

export function episodeById(id: string): Episode | undefined {
  return EPISODES.find((e) => e.id === id);
}

export function episodeByN(n: number): Episode | undefined {
  return EPISODES.find((e) => e.n === n);
}

export function latestEpisode(): Episode {
  return episodesNewestFirst()[0] ?? EPISODES[EPISODES.length - 1];
}
