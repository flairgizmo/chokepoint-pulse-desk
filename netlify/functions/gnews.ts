import { fetchGoogleNewsXml } from '../../src/modules/news';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  try {
    const xml = await fetchGoogleNewsXml();
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch {
    return new Response('News proxy failed', { status: 502 });
  }
};

export const config = {
  path: '/api/gnews',
};
