import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually (no dotenv dependency).
const envPath = resolve(process.cwd(), ".env.local");
const text = readFileSync(envPath, "utf8");
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

const email = process.env.PCLOUD_EMAIL;
const password = process.env.PCLOUD_PASSWORD;
const rootFolderId = process.env.PCLOUD_ROOT_FOLDERID ?? "0";

if (!email || !password) {
  console.error("Set PCLOUD_EMAIL and PCLOUD_PASSWORD in .env.local");
  process.exit(1);
}

const API = process.env.PCLOUD_API_HOST ?? "https://api.pcloud.com";

async function call(params: Record<string, string>): Promise<any> {
  const method = params.method;
  const url = new URL(`${API}/${method}`);
  for (const [k, v] of Object.entries(params)) {
    if (k === "method") continue;
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  return res.json();
}

console.log("Logging in as:", email);

const loginRes = await call({
  method: "login",
  username: email,
  password,
  getauth: "1",
  logout: "1",
});

if (loginRes.result !== 0) {
  console.error("✗ Login failed:", loginRes.error ?? loginRes);
  process.exit(1);
}
const token = loginRes.auth;
console.log("✓ Login successful");

const root = await call({
  method: "listfolder",
  folderid: rootFolderId,
  auth: token,
});
const contents = root.metadata?.contents ?? [];
console.log(`✓ Listed ${contents.length} item(s) in folder ${rootFolderId}:`);

for (const item of contents) {
  if (item.isfolder) {
    const inner = await call({
      method: "listfolder",
      folderid: String(item.folderid),
      auth: token,
    });
    const files = (inner.metadata?.contents ?? []).filter((f: any) => !f.isfolder);
    console.log(`  • ${item.name}/ → ${files.length} file(s)`);
  } else {
    console.log(`  • ${item.name} (file)`);
  }
}

const manifest = contents.find(
  (f: any) => !f.isfolder && f.name === "manifest.json"
);
if (manifest?.fileid) {
  const link = await call({
    method: "getfilelink",
    fileid: String(manifest.fileid),
    auth: token,
  });
  const url = `https://${link.hosts?.[0] ?? "api.pcloud.com"}${link.path}`;
  const raw = await (await fetch(url)).text();
  const meta = JSON.parse(raw);
  console.log(
    "✓ manifest.json found with",
    meta.collections?.length,
    "collections"
  );
} else {
  console.log("• manifest.json not present (optional)");
}