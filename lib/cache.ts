import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { kv } from "@vercel/kv";

const CACHE_DIR = path.join(
  process.env.PHOTO_CACHE_DIR ?? path.join(os.tmpdir(), "lumen-photo-cache"),
  "files"
);
const MAX_ENTRIES = 2000;
const hasKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

function cacheKey(keyPath: string): string {
  return createHash("sha256").update(keyPath).digest("hex").slice(0, 32);
}

export async function ensureCacheDir(): Promise<void> {
  if (!hasKV) {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

export async function getCachedFile(
  keyPath: string
): Promise<Buffer | null> {
  const key = cacheKey(keyPath);

  if (hasKV) {
    try {
      const b64 = await kv.get<string>(key);
      if (b64) return Buffer.from(b64, "base64");
      return null;
    } catch {
      return null;
    }
  }

  try {
    const filePath = path.join(CACHE_DIR, `${key}.bin`);
    const buf = await fs.readFile(filePath);
    // Touch mtime for LRU cleanup.
    const now = new Date();
    await fs.utimes(filePath, now, now).catch(() => {});
    return buf;
  } catch {
    return null;
  }
}

export async function setCachedFile(
  keyPath: string,
  buffer: Buffer
): Promise<void> {
  const key = cacheKey(keyPath);

  if (hasKV) {
    try {
      await kv.set(key, buffer.toString("base64"), { ex: 2592000 }); // 30 days
      return;
    } catch (e) {
      console.warn("KV cache write failed, falling back to FS.", e);
    }
  }

  await ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${key}.bin`);
  await fs.writeFile(filePath, buffer);
  await cleanupIfNeeded().catch(() => {});
}

async function cleanupIfNeeded(): Promise<void> {
  if (hasKV) return;
  const entries = await fs.readdir(CACHE_DIR);
  if (entries.length <= MAX_ENTRIES) return;

  const withStats = await Promise.all(
    entries.map(async (name) => {
      const p = path.join(CACHE_DIR, name);
      const stat = await fs.stat(p).catch(() => null);
      return { name, path: p, stat };
    })
  );

  const sorted = withStats
    .filter((e): e is typeof e & { stat: NonNullable<typeof e["stat"]> } => !!e.stat)
    .sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs);

  const remove = sorted.slice(0, sorted.length - MAX_ENTRIES);
  await Promise.all(remove.map((e) => fs.unlink(e.path).catch(() => {})));
}
