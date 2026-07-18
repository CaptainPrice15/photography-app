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

const { FilenSDK } = await import("@filen/sdk");

const email = process.env.FILEN_EMAIL;
const password = process.env.FILEN_PASSWORD;
const twoFactorCode = process.env.FILEN_TWO_FACTOR_CODE;

console.log("Logging in as:", email);

const sdk = new FilenSDK({ metadataCache: true, connectToSocket: false });

try {
  await sdk.login({
    email,
    password,
    ...(twoFactorCode ? { twoFactorCode } : {}),
  });
  console.log("✓ Login successful");

  const root = "/photos";
  const entries = await sdk.fs().readdir({ path: root });
  console.log(`✓ Listed ${entries.length} item(s) in ${root}:`, entries);

  // Inspect first collection if any.
  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const stat = await sdk.fs().stat({ path: `${root}/${name}` });
    if (stat.isDirectory()) {
      const files = await sdk.fs().readdir({ path: `${root}/${name}` });
      console.log(`  • ${name}/ → ${files.length} file(s):`, files.slice(0, 5));
    } else {
      console.log(`  • ${name} (file)`);
    }
  }

  // Try reading manifest if present.
  try {
    const buf = await sdk.fs().readFile({ path: `${root}/manifest.json` });
    const meta = JSON.parse(buf.toString("utf8"));
    console.log("✓ manifest.json found with", meta.collections?.length, "collections");
  } catch {
    console.log("• manifest.json not present (optional)");
  }
} catch (err) {
  console.error("✗ Connection failed:", err?.message ?? err);
  process.exit(1);
}
