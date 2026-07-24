import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const browserDist = join(process.cwd(), 'apps/lumen/dist/lumen/browser');
const fallbackHtml = readFileSync(join(browserDist, 'index.html'), 'utf-8');

let ssrApp: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!ssrApp) {
      const mod = await import('../apps/lumen/dist/lumen/server/server.mjs');
      ssrApp = mod.default;
    }
    ssrApp.handle(req, res, () => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(fallbackHtml);
    });
  } catch {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(fallbackHtml);
  }
}
