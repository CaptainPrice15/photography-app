import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const browserDist = join(process.cwd(), 'apps/lumen/dist/lumen/browser');
const fallbackHtml = readFileSync(join(browserDist, 'index.html'), 'utf-8');

let ssrApp: any = null;

async function getSsrApp() {
  if (ssrApp) return ssrApp;
  // @ts-expect-error module only exists after Angular build completes
  const mod = await import('../apps/lumen/dist/lumen/server/server.mjs');
  ssrApp = mod.default;
  return ssrApp;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getSsrApp();
    app.handle(req, res, () => {
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
