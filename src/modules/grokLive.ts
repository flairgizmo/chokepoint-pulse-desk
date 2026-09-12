import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ChatReply, ChatTurn } from './assistant';

const XAI_URL = 'https://api.x.ai/v1/chat/completions';

function hydrateDotEnv(): void {
  if (process.env.XAI_API_KEY || process.env.GROK_API_KEY) return;
  const file = resolve(process.cwd(), '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*(XAI_API_KEY|GROK_API_KEY|XAI_MODEL)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

function envGet(name: string): string {
  hydrateDotEnv();
  try {
    const netlify = (globalThis as { Netlify?: { env?: { get?: (k: string) => string | undefined } } }).Netlify;
    const fromNetlify = netlify?.env?.get?.(name);
    if (fromNetlify) return fromNetlify;
  } catch {
    /* browser or node without Netlify */
  }
  return process.env[name] ?? '';
}

export function grokApiKey(): string {
  return envGet('XAI_API_KEY') || envGet('GROK_API_KEY');
}

export function grokModel(): string {
  return envGet('XAI_MODEL') || 'grok-3-mini';
}

export function grokConnected(): boolean {
  return Boolean(grokApiKey());
}

export async function answerWithGrok(
  question: string,
  history: ChatTurn[],
  briefing: ChatReply,
): Promise<ChatReply | null> {
  const key = grokApiKey();
  if (!key || !question.trim()) return null;

  const system = [
    'You are Ask Grok on QntDesk, a research desk on Quant Network, Overledger and programmable money.',
    'Write like a professional British correspondent. Affirmative facts. Name and title on every quotation.',
    'Overledger is a gateway operating system. GBTD tokens are liabilities of Barclays, HSBC, Lloyds Bank, NatWest, Nationwide and Santander. Quant supplies Overledger and PayScript. QNT is an ERC-20 utility token.',
    'Do not invent prices, headlines, mandates, offices, or faces. If the briefing does not support a claim, say the desk does not have that on the record.',
    'Keep answers tight. Prefer the sourced briefing below.',
    '',
    'Sourced briefing:',
    briefing.text,
    briefing.cites.length ? `Citations: ${briefing.cites.map((c) => `${c.label} ${c.href}`).join(' · ')}` : '',
  ].join('\n');

  const messages = [
    { role: 'system', content: system },
    ...history.slice(-8).map((t) => ({ role: t.role, content: t.content })),
    { role: 'user', content: question.trim() },
  ];

  const res = await fetch(XAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: grokModel(),
      temperature: 0.2,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Grok ${res.status}${err ? `: ${err.slice(0, 180)}` : ''}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;

  return {
    text,
    cites: briefing.cites,
    mode: 'live',
  };
}
