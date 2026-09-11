/**
 * Capture product chrome screenshots into proof/
 * Usage: npm run build && npm run preview & ; node scripts/capture-proof.mjs
 * Or: npm run proof (expects preview/dev on 5173)
 */
import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dist = join(root, 'dist');
const proofDir = join(root, 'proof');

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.map': 'application/json',
};

async function serveDist() {
  const server = createServer(async (req, res) => {
    try {
      let path = req.url?.split('?')[0] || '/';
      if (path === '/') path = '/index.html';
      const file = join(dist, path);
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch {
      // SPA fallback
      try {
        const data = await readFile(join(dist, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    }
  });
  await new Promise((resolve) => server.listen(5179, '127.0.0.1', resolve));
  return server;
}

async function main() {
  await mkdir(proofDir, { recursive: true });
  const server = await serveDist();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const base = 'http://127.0.0.1:5179';
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-proof="hero"]');

  await page.screenshot({
    path: join(proofDir, '01-hero.png'),
    clip: { x: 0, y: 0, width: 1440, height: 720 },
  });

  await page.goto(`${base}/desk`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-proof="gallery"]');
  const gallery = await page.$('[data-proof="gallery"]');
  if (gallery) {
    await gallery.screenshot({ path: join(proofDir, '02-gallery.png') });
  }

  await page.goto(`${base}/markets`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const ticker = await page.$('[data-proof="ticker"]');
  if (ticker) {
    await ticker.screenshot({ path: join(proofDir, '04-ticker.png') });
  }

  await page.goto(`${base}/desk/hormuz`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-proof="detail"]');
  await page.screenshot({
    path: join(proofDir, '03-detail-hormuz.png'),
    fullPage: true,
  });

  await browser.close();
  server.close();
  console.log('Proof screenshots written to proof/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
