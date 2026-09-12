import { fetchNewsRiver } from '../../src/modules/news';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  const river = await fetchNewsRiver();
  return Response.json(river, {
        headers: { 'Cache-Control': 'public, max-age=1800' },
  });
};

export const config = {
  path: '/api/news',
};
