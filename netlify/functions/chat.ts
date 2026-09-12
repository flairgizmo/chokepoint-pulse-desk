import { answerChat, chatStatus } from '../../src/modules/chatServer';
import type { ChatTurn } from '../../src/modules/assistant';

export default async (req: Request): Promise<Response> => {
  if (req.method === 'GET') {
    return Response.json(chatStatus());
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  let question = '';
  let history: ChatTurn[] = [];
  try {
    const body = (await req.json()) as { question?: string; history?: ChatTurn[] };
    question = String(body.question ?? '');
    history = Array.isArray(body.history) ? body.history : [];
  } catch {
    question = '';
  }
  const reply = await answerChat(question, history);
  return Response.json(reply);
};

export const config = {
  path: '/api/chat',
};
