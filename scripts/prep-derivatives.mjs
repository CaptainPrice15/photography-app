// Pre-generates watermarked derivatives (thumb, preview, lightbox) and blur
// placeholders for every photo in pCloud. Run before deploy:
//
//   node scripts/prep-derivatives.mjs
//
// Requires .env.local with pCloud credentials. Writes into the cache backend
// (Vercel KV when KV_REST_API_URL + KV_REST_API_TOKEN are set, otherwise the
// local filesystem cache at PHOTO_CACHE_DIR or /tmp/lumen-photo-cache).
//
// Safe to run multiple times — skips already-cached keys.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { createHash } from "node:crypto";

// --- Load .env ---
let envPath = resolve(process.cwd(), ".env.local");
let text;
try {
  text = readFileSync(envPath, "utf8");
} catch {
  envPath = resolve(process.cwd(), ".env");
  text = readFileSync(envPath, "utf8");
}
for (const line of text.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let val = trimmed.slice(idx + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  if (!(key in process.env)) process.env[key] = val;
}

const API = process.env.PCLOUD_API_HOST ?? "https://api.pcloud.com";
const ROOT_FOLDER_ID = process.env.PCLOUD_ROOT_FOLDERID ?? "0";
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif", "heic", "heif", "tif", "tiff", "bmp", "svg"]);
const OPTIMIZABLE = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

// --- Inline cache implementation (same logic as lib/cache.ts) ---
const hasKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
let kvClient = null;

if (hasKV) {
  const { kv } = await import("@vercel/kv");
  kvClient = kv;
}

const CACHE_DIR = resolve(
  process.env.PHOTO_CACHE_DIR ?? resolve(process.cwd(), ".photo-cache"),
  "files"
);
const { mkdir, readFile, writeFile } = await import("node:fs/promises");

async function ensureDir() {
  if (!hasKV) await mkdir(CACHE_DIR, { recursive: true });
}

function cacheKey(keyPath) {
  return createHash("sha256").update(keyPath).digest("hex").slice(0, 32);
}

async function getCached(keyPath) {
  const key = cacheKey(keyPath);
  if (kvClient) {
    try {
      const b64 = await kvClient.get(key);
      if (b64) return Buffer.from(b64, "base64");
      return null;
    } catch { return null; }
  }
  try {
    const p = resolve(CACHE_DIR, `${key}.bin`);
    return await readFile(p);
  } catch { return null; }
}

async function setCached(keyPath, buffer) {
  const key = cacheKey(keyPath);
  if (kvClient) {
    try {
      await kvClient.set(key, buffer.toString("base64"), { ex: 2592000 });
      return;
    } catch (e) { console.warn("KV write failed", e.message); }
  }
  await ensureDir();
  await writeFile(resolve(CACHE_DIR, `${key}.bin`), buffer);
}

// --- pCloud helpers ---
function extOf(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

async function call(params) {
  const m = params.method;
  const u = new URL(API + "/" + m);
  for (const [k, v] of Object.entries(params)) {
    if (k === "method") continue;
    u.searchParams.set(k, v);
  }
  const res = await fetch(u.toString());
  return res.json();
}

async function getDownloadUrl(fileid, token) {
  const data = await call({ method: "getfilelink", fileid: String(fileid), auth: token });
  return `https://${data.hosts?.[0] ?? "api.pcloud.com"}${data.path}`;
}

// --- watermark (same as lib/watermark.ts) ---
async function watermark(input, contentType, longEdge, quality, opacity) {
  let base = sharp(input, { failOn: "none" });
  if (contentType === "image/heic" || contentType === "image/heif") {
    base = sharp(await base.jpeg().toBuffer(), { failOn: "none" });
  }
  const meta = await base.metadata();
  const iw = meta.width ?? longEdge;
  const ih = meta.height ?? longEdge;
  let tw = iw, th = ih;
  if (iw > longEdge || ih > longEdge) {
    const r = Math.min(longEdge / iw, longEdge / ih);
    tw = Math.round(iw * r);
    th = Math.round(ih * r);
  }
  const fontSize = Math.max(14, Math.round(Math.min(tw, th) / 28));
  const tileGap = fontSize * 6;
  const svg = Buffer.from(
    `<svg width="${tw}" height="${th}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="wm" width="${tileGap}" height="${tileGap}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><text x="0" y="${tileGap / 2}" font-family="Helvetica,Arial,sans-serif" font-size="${fontSize}" font-weight="600" fill="white" fill-opacity="${opacity}" letter-spacing="2">lumen.photo</text></pattern></defs><rect width="100%" height="100%" fill="url(#wm)" /></svg>`
  );
  return base
    .resize(tw, th, { fit: "inside", withoutEnlargement: true })
    .composite([{ input: svg, gravity: "center", blend: "over" }])
    .jpeg({ quality })
    .toBuffer();
}

async function generateBlur(input) {
  const base = sharp(input, { failOn: "none" });
  const meta = await base.metadata();
  const w = meta.width ?? 16;
  const h = meta.height ?? 16;
  const blob = await base
    .resize(16, Math.max(1, Math.round((16 * h) / w)), { fit: "inside" })
    .jpeg({ quality: 50 })
    .toBuffer();
  return `data:image/jpeg;base64,${blob.toString("base64")}`;
}

const SIZES = [
  { name: "thumb", longEdge: 400, quality: 70, opacity: 0.25 },
  { name: "preview", longEdge: 900, quality: 75, opacity: 0.22 },
  { name: "lightbox", longEdge: 1600, quality: 75, opacity: 0.22 },
];

async function main() {
  await ensureDir();

  const login = await call({ method: "login", username: process.env.PCLOUD_EMAIL, password: process.env.PCLOUD_PASSWORD, getauth: "1" });
  if (login.result !== 0) { console.error("Login failed:", login.error ?? login); process.exit(1); }
  const token = login.auth;

  const root = await call({ method: "listfolder", folderid: ROOT_FOLDER_ID, auth: token });

  let total = 0, skipped = 0, failed = 0;

  for (const dir of root.metadata?.contents ?? []) {
    if (!dir.isfolder || !dir.name || dir.name.startsWith(".")) continue;
    const slug = dir.name;
    const listing = await call({ method: "listfolder", folderid: String(dir.folderid), auth: token });
    const files = (listing.metadata?.contents ?? [])
      .filter((f) => !f.isfolder && IMAGE_EXTENSIONS.has(extOf(f.name)))
      .map((f) => ({ name: f.name, fileid: f.fileid }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    for (const file of files) {
      if (!OPTIMIZABLE.has(extOf(file.name))) continue;
      const pathStr = `${slug}/${file.name}`;
      const rawKey = `raw:${pathStr}`;
      let raw = await getCached(rawKey);

      if (!raw) {
        try {
          const url = await getDownloadUrl(file.fileid, token);
          const res = await fetch(url);
          if (!res.ok) { failed++; continue; }
          raw = Buffer.from(await res.arrayBuffer());
          await setCached(rawKey, raw);
        } catch (e) { console.error(`  ✗ ${pathStr} download: ${e.message}`); failed++; continue; }
      }

      const mime = IMAGE_EXTENSIONS.has(extOf(file.name))
        ? `image/${extOf(file.name) === "jpg" ? "jpeg" : extOf(file.name)}`
        : "application/octet-stream";

      let anyGenerated = false;
      for (const size of SIZES) {
        const wmKey = `wm:${pathStr}:${size.name}`;
        const existing = await getCached(wmKey);
        if (existing) { skipped++; continue; }
        try {
          const wm = await watermark(raw, mime, size.longEdge, size.quality, size.opacity);
          await setCached(wmKey, wm);
          anyGenerated = true;
        } catch (e) { console.error(`  ✗ ${pathStr} ${size.name}: ${e.message}`); failed++; }
      }

      const blurKey = `blur:${pathStr}`;
      if (!(await getCached(blurKey))) {
        try {
          const blurDataUri = await generateBlur(raw);
          await setCached(blurKey, Buffer.from(blurDataUri));
        } catch { /* non-fatal */ }
      }

      if (anyGenerated) total++;
    }
  }

  console.log(`Done. Generated derivatives for ${total} photos, ${skipped} already cached, ${failed} failed.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
