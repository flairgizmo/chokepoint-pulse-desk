import { answerChat, chatStatus } from '../../src/modules/chatServer';
import { MAX_BODY_BYTES, sanitizeHistory, sanitizeQuestion } from '../../src/modules/chatGuard';
import type { ChatTurn } from '../../src/modules/assistant';

const hits = new Map<string, { n: number; t: number }>();

function allow(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  if (row.n >= 24) return false;
  row.n += 1;
  return true;
}

function clientIp(req: Request): string {
  const raw = req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip') ?? '';
  return raw.split(',')[0]?.trim() || 'local';
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'GET') {
    return Response.json(chatStatus());
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!allow(clientIp(req))) {
    return new Response('Too many questions. Try again in a minute.', { status: 429 });
  }
  const length = Number(req.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) {
    return new Response('Payload too large', { status: 413 });
  }
  let question = '';
  let history: ChatTurn[] = [];
  try {
    const body = (await req.json()) as { question?: string; history?: ChatTurn[] };
    question = sanitizeQuestion(body.question);
    history = sanitizeHistory(body.history);
  } catch {
    question = '';
  }
  const reply = await answerChat(question, history);
  return Response.json(reply, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
};

export const config = {
  path: '/api/chat',
};
