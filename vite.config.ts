import { copyFileSync, existsSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';

const port = Number(process.env.PORT) || 8080;

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function writeText(res: ServerResponse, status: number, body: string, type: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.end(body);
}

function chatDesk(): Plugin {
  const handle = (req: IncomingMessage, res: ServerResponse, next: () => void): void => {
    if (req.method === 'GET') {
      void (async () => {
        const { chatStatus } = await import('./src/modules/chatServer');
        writeJson(res, 200, chatStatus());
      })();
      return;
    }
    if (req.method !== 'POST') {
      next();
      return;
    }
    const chunks: Buffer[] = [];
    let received = 0;
    req.on('data', (c) => {
      received += c.length;
      if (received > 24_000) {
        res.statusCode = 413;
        res.end('Payload too large');
        req.destroy();
        return;
      }
      chunks.push(Buffer.from(c));
    });
    req.on('end', () => {
      void (async () => {
        const { answerChat } = await import('./src/modules/chatServer');
        const { sanitizeHistory, sanitizeQuestion } = await import('./src/modules/chatGuard');
        let question = '';
        let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as {
            question?: string;
            history?: Array<{ role: 'user' | 'assistant'; content: string }>;
          };
          question = sanitizeQuestion(parsed.question);
          history = sanitizeHistory(parsed.history);
        } catch {
          question = '';
        }
        const reply = await answerChat(question, history);
        writeJson(res, 200, reply);
      })();
    });
  };

  return {
    name: 'qntdesk-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/chat', handle);
    },
  };
}

function liveApis(): Plugin {
  const markets = (_req: IncomingMessage, res: ServerResponse): void => {
    void (async () => {
      const { fetchMarketsDirect } = await import('./src/modules/markets');
      writeJson(res, 200, await fetchMarketsDirect());
    })().catch((err) => writeJson(res, 502, { status: 'degraded', error: String(err) }));
  };

  const news = (_req: IncomingMessage, res: ServerResponse): void => {
    void (async () => {
      const { fetchNewsRiver } = await import('./src/modules/news');
      writeJson(res, 200, await fetchNewsRiver());
    })().catch((err) => writeJson(res, 502, { status: 'degraded', items: [], error: String(err) }));
  };

  const gnews = (_req: IncomingMessage, res: ServerResponse): void => {
    void (async () => {
      const { fetchGoogleNewsXml } = await import('./src/modules/news');
      const xml = await fetchGoogleNewsXml();
      writeText(res, 200, xml, 'application/rss+xml; charset=utf-8');
    })().catch(() => writeText(res, 502, 'News proxy failed', 'text/plain; charset=utf-8'));
  };

  const status = (_req: IncomingMessage, res: ServerResponse): void => {
    void (async () => {
      const { chatStatus } = await import('./src/modules/chatServer');
      writeJson(res, 200, {
        ok: true,
        grok: chatStatus().grok,
        endpoints: ['/api/chat', '/api/markets', '/api/news', '/api/gnews', '/api/status'],
      });
    })();
  };

  const mount = (server: { middlewares: { use: (path: string, fn: (req: IncomingMessage, res: ServerResponse) => void) => void } }) => {
    server.middlewares.use('/api/markets', markets);
    server.middlewares.use('/api/news', news);
    server.middlewares.use('/api/gnews', gnews);
    server.middlewares.use('/api/status', status);
  };

  return {
    name: 'qntdesk-live-apis',
    configureServer(server) {
      mount(server);
    },
    configurePreviewServer(server) {
      mount(server);
    },
  };
}

function securityHeaders(): Plugin {
  const apply = (res: ServerResponse): void => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  };
  return {
    name: 'qntdesk-security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        apply(res);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
        apply(res);
        next();
      });
    },
  };
}

function spaFallback(): Plugin {
  return {
    name: 'qntdesk-spa-fallback',
    closeBundle() {
      const index = join(process.cwd(), 'dist', 'index.html');
      if (existsSync(index)) copyFileSync(index, join(process.cwd(), 'dist', '404.html'));
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  appType: 'spa',
  plugins: [securityHeaders(), liveApis(), chatDesk(), spaFallback()],
  server: {
    port,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
