import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

const CACHE_DIR = path.join(
  process.env.FILEN_CACHE_DIR ?? path.join(os.tmpdir(), "lumen-filen-cache"),
  "files"
);
const MAX_ENTRIES = 500;

function cacheKey(filenPath: string): string {
  return createHash("sha256").update(filenPath).digest("hex").slice(0, 32);
}

export async function ensureCacheDir(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function getCachedFile(
  filenPath: string
): Promise<Buffer | null> {
  try {
    const key = cacheKey(filenPath);
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
  filenPath: string,
  buffer: Buffer
): Promise<void> {
  await ensureCacheDir();
  const key = cacheKey(filenPath);
  const filePath = path.join(CACHE_DIR, `${key}.bin`);
  await fs.writeFile(filePath, buffer);
  await cleanupIfNeeded().catch(() => {});
}

async function cleanupIfNeeded(): Promise<void> {
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
