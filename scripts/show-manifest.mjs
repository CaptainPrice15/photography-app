import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
const text = readFileSync(envPath, "utf8");
for (const line of text.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  let val = trimmed.slice(idx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
  if (!(key in process.env)) process.env[key] = val;
}

const API = process.env.PCLOUD_API_HOST ?? "https://api.pcloud.com";
const ROOT = process.env.PCLOUD_ROOT_FOLDERID ?? "0";

async function call(params) {
  const m = params.method;
  const u = new URL(API + "/" + m);
  for (const [k, v] of Object.entries(params)) { if (k === "method") continue; u.searchParams.set(k, v); }
  return (await fetch(u)).json();
}

const login = await call({ method: "login", username: process.env.PCLOUD_EMAIL, password: process.env.PCLOUD_PASSWORD, getauth: "1" });
const token = login.auth;
const root = await call({ method: "listfolder", folderid: ROOT, auth: token });
const manifestFile = (root.metadata?.contents ?? []).find(f => !f.isfolder && f.name === "manifest.json");
if (manifestFile?.fileid) {
  const link = await call({ method: "getfilelink", fileid: String(manifestFile.fileid), auth: token });
  const url = "https://" + (link.hosts?.[0] ?? "api.pcloud.com") + link.path;
  const raw = await (await fetch(url)).text();
  console.log("Current manifest.json content:");
  console.log(raw);
} else {
  console.log("No manifest.json found on pCloud");
}
