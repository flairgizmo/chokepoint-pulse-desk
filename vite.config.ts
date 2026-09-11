import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vitest/config';

const port = Number(process.env.PORT) || 5173;
const GNEWS =
  'https://news.google.com/rss/search?q=%22Quant+Network%22+OR+Overledger+OR+QNT&hl=en-GB&gl=GB&ceid=GB:en';

function chatDesk(): Plugin {
  return {
    name: 'qntdesk-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(Buffer.from(c)));
        req.on('end', () => {
          void (async () => {
            const { answerFromDesk } = await import('./src/modules/assistant');
            let question = '';
            try {
              question = String(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}').question ?? '');
            } catch {
              question = '';
            }
            const reply = answerFromDesk(question);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(reply));
          })();
        });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/chat', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(Buffer.from(c)));
        req.on('end', () => {
          void (async () => {
            const { answerFromDesk } = await import('./src/modules/assistant');
            let question = '';
            try {
              question = String(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}').question ?? '');
            } catch {
              question = '';
            }
            const reply = answerFromDesk(question);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(reply));
          })();
        });
      });
    },
  };
}

function gnewsProxy(): Plugin {
  async function handle(_req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const upstream = await fetch(GNEWS, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent':
            'Mozilla/5.0 (compatible; QntDesk/2.0; independent encyclopedia)',
        },
      });
      const body = await upstream.text();
      res.statusCode = upstream.ok ? 200 : upstream.status;
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.end(body);
    } catch {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('News proxy failed');
    }
  }

  return {
    name: 'qntdesk-gnews-proxy',
    configureServer(server) {
      server.middlewares.use('/api/gnews', (req, res) => {
        void handle(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/gnews', (req, res) => {
        void handle(req, res);
      });
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  appType: 'spa',
  plugins: [gnewsProxy(), chatDesk()],
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
