import { fetchMarketsDirect } from '../../src/modules/markets';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  const print = await fetchMarketsDirect();
  return Response.json(print, {
    headers: { 'Cache-Control': 'public, max-age=20' },
  });
};

export const config = {
  path: '/api/markets',
};
