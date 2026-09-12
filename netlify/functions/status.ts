import { chatStatus } from '../../src/modules/chatServer';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  return Response.json({
    ok: true,
    grok: chatStatus().grok,
    endpoints: ['/api/chat', '/api/markets', '/api/news', '/api/gnews', '/api/status'],
  });
};

export const config = {
  path: '/api/status',
};
