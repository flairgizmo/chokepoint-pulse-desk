import { answerFromDesk } from '../../src/modules/assistant';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  let question = '';
  try {
    const body = (await req.json()) as { question?: string };
    question = String(body.question ?? '');
  } catch {
    question = '';
  }
  const reply = answerFromDesk(question);
  return Response.json(reply);
};

export const config = {
  path: '/api/chat',
};
