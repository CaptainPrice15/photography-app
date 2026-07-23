import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually (no dotenv dependency).
let envPath = resolve(process.cwd(), ".env.local");
let text: string;
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

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif",
  "heic", "heif", "tif", "tiff", "bmp", "svg",
]);

// Known collection metadata. Add new collections here, or rely on the
// auto-generated fallback (title-cased folder name + neutral accent).
const COLLECTION_META: Record<string, { title?: string; accent?: string; accentSoft?: string }> = {
  Kedarnath: { title: "Kedarnath", accent: "#2dd4bf", accentSoft: "#5eead4" },
  Sikkim: { title: "Sikkim", accent: "#f59e0b", accentSoft: "#fbbf24" },
};
const DEFAULT_ACCENT = "#64748b";
const DEFAULT_ACCENT_SOFT = "#94a3b8";

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}
function titleCase(slug: string): string {
  return slug ? slug[0].toUpperCase() + slug.slice(1) : slug;
}

async function call(params: Record<string, string>): Promise<any> {
  const m = params.method;
  const u = new URL(API + "/" + m);
  for (const [k, v] of Object.entries(params)) {
    if (k === "method") continue;
    u.searchParams.set(k, v);
  }
  const res = await fetch(u.toString());
  return res.json();
}

async function main(): Promise<void> {
  const login = await call({
    method: "login",
    username: process.env.PCLOUD_EMAIL ?? "",
    password: process.env.PCLOUD_PASSWORD ?? "",
    getauth: "1",
  });
  if (login.result !== 0) {
    console.error("✗ Login failed:", login.error ?? login);
    process.exit(1);
  }
  const token = login.auth;

  const root = await call({
    method: "listfolder",
    folderid: ROOT_FOLDER_ID,
    auth: token,
  });
  const collections: any[] = [];
  let total = 0;

  for (const dir of root.metadata?.contents ?? []) {
    if (!dir.isfolder || !dir.name || dir.name.startsWith(".")) continue;
    const slug = dir.name;
    const listing = await call({
      method: "listfolder",
      folderid: String(dir.folderid),
      auth: token,
    });
    const files = (listing.metadata?.contents ?? [])
      .filter((f: any) => !f.isfolder && IMAGE_EXTENSIONS.has(extOf(f.name)))
      .map((f: any) => f.name)
      .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true }));
    if (files.length === 0) continue;

    const meta = COLLECTION_META[slug] ?? {};
    const title = meta.title ?? titleCase(slug);
    const accent = meta.accent ?? DEFAULT_ACCENT;
    const accentSoft = meta.accentSoft ?? DEFAULT_ACCENT_SOFT;

    const photos = files.map((file: string, i: number) => ({
      id: `${slug}-${i + 1}`,
      src: `/api/photos/${slug}/${encodeURIComponent(file)}`,
      alt: `${title} photograph ${i + 1}`,
      title: `${title} ${i + 1}`,
      collectionId: slug,
      featured: i < 2,
    }));

    collections.push({
      id: slug,
      slug,
      title,
      accent,
      accentSoft,
      cover: `/api/photos/${slug}/${encodeURIComponent(files[0])}`,
      photos,
    });
    total += photos.length;
    console.log(`  * ${slug}/ -> ${files.length} photo(s)`);
  }

  const manifest = {
    collections,
    updatedAt: new Date().toISOString(),
  };
  const out = "manifest.json";
  writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(
    `\nWrote ${out}: ${collections.length} collections, ${total} photos.`
  );
  console.log("Upload this file to pCloud at Photos/manifest.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});