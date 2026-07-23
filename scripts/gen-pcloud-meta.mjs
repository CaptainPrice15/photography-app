import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

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

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif",
  "heic", "heif", "tif", "tiff", "bmp", "svg",
]);
const OPTIMIZABLE = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

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
  const data = await call({
    method: "getfilelink",
    fileid: String(fileid),
    auth: token,
  });
  return `https://${data.hosts?.[0] ?? "api.pcloud.com"}${data.path}`;
}

async function main() {
  const login = await call({
    method: "login",
    username: process.env.PCLOUD_EMAIL,
    password: process.env.PCLOUD_PASSWORD,
    getauth: "1",
  });
  if (login.result !== 0) {
    console.error("✗ Login failed:", login.error ?? login);
    process.exit(1);
  }
  const token = login.auth;

  console.log("Logged in. Scanning root folder...");

  const root = await call({
    method: "listfolder",
    folderid: ROOT_FOLDER_ID,
    auth: token,
  });

  const photoMeta = {};
  let total = 0;
  let failed = 0;

  for (const dir of root.metadata?.contents ?? []) {
    if (!dir.isfolder || !dir.name || dir.name.startsWith(".")) continue;
    const slug = dir.name;
    console.log(`\n📁 ${slug}/`);

    const listing = await call({
      method: "listfolder",
      folderid: String(dir.folderid),
      auth: token,
    });

    const files = (listing.metadata?.contents ?? [])
      .filter((f) => !f.isfolder && IMAGE_EXTENSIONS.has(extOf(f.name)))
      .map((f) => ({ name: f.name, fileid: f.fileid }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    if (files.length === 0) {
      console.log("  (no images)");
      continue;
    }

    for (const file of files) {
      const ext = extOf(file.name);
      const key = `${slug}/${file.name}`;
      const entry = { width: 1600, height: 1200 };

      if (OPTIMIZABLE.has(ext)) {
        try {
          const url = await getDownloadUrl(file.fileid, token);
          const res = await fetch(url);
          if (!res.ok) {
            console.log(`  ✗ ${file.name} — HTTP ${res.status}`);
            failed++;
            continue;
          }
          const buf = Buffer.from(await res.arrayBuffer());
          const img = sharp(buf, { failOn: "none" }).rotate();
          const meta = await img.metadata();
          entry.width = meta.width ?? 1600;
          entry.height = meta.height ?? 1200;

          console.log(`  ✓ ${file.name} — ${entry.width}×${entry.height}`);
        } catch (err) {
          console.log(`  ✗ ${file.name} — ${err.message}`);
          failed++;
        }
      } else {
        console.log(`  - ${file.name} (skipped, non-optimizable)`);
      }

      photoMeta[key] = entry;
      total++;
    }
  }

  const out = "photo-meta.json";
  writeFileSync(out, JSON.stringify(photoMeta, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${out}: ${total} entries${failed ? ` (${failed} failed)` : ""}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
