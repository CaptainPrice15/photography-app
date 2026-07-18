import { isOptimizable, type Collection, type Photo, type PhotoSource } from "./types";

// pCloud REST API (https://docs.pcloud.com). No SDK required — all calls go
// through https://api.pcloud.com with the auth_token returned by /login.
const API = process.env.PCLOUD_API_HOST ?? "https://api.pcloud.com";

// pCloud folder id that holds the photo collections (each subfolder is a
// collection). Use a numeric folder id (e.g. 0 for the root, or the id of a
// dedicated "photos" folder). Set via PCLOUD_ROOT_FOLDERID.
const ROOT_FOLDER_ID = process.env.PCLOUD_ROOT_FOLDERID ?? "0";

// Keep in sync with localSource.ts and the photo proxy route.
const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "heic",
  "heif",
  "tif",
  "tiff",
  "bmp",
  "svg",
]);

interface PCloudFile {
  name: string;
  isfolder?: 0 | 1;
  fileid?: number;
  folderid?: number;
  parentfolderid?: number;
}

interface PCloudResult {
  result: number;
  error?: string;
  auth?: string;
  auth_token?: string;
  metadata?: {
    name?: string;
    folderid?: number;
    fileid?: number;
    isfolder?: 0 | 1;
    contents?: PCloudFile[];
    path?: string;
  };
  hosts?: string[];
  path?: string;
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

function titleCase(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

async function apiCall(
  params: Record<string, string>,
  opts: { throwOnError?: boolean } = {}
): Promise<PCloudResult> {
  const method = params.method;
  const url = new URL(`${API}/${method}`);
  for (const [k, v] of Object.entries(params)) {
    if (k === "method") continue;
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = (await res.json()) as PCloudResult;
  if (data.result !== 0 && opts.throwOnError !== false) {
    throw new Error(`pCloud error ${data.result}: ${data.error ?? "unknown"}`);
  }
  return data;
}

let authToken: string | null = null;

async function login(): Promise<string> {
  if (authToken) return authToken;

  // If a pre-fetched persistent token is provided, use it directly and skip
  // the login call (avoids device-verification / 2FA prompts on a server).
  const preset = process.env.PCLOUD_AUTH_TOKEN;
  if (preset) {
    authToken = preset;
    return authToken;
  }

  const email = process.env.PCLOUD_EMAIL;
  const password = process.env.PCLOUD_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "PCLOUD_EMAIL and PCLOUD_PASSWORD environment variables are required."
    );
  }

  const code =
    process.env.PCLOUD_CODE ?? process.env.PCLOUD_TWO_FACTOR_CODE ?? undefined;

  // First attempt. pCloud returns result 1022 ("Please provide 'code'") when
  // the account has two-factor authentication enabled and a TOTP/email code is
  // required. Retry with the code on that specific error.
  const first = await apiCall(
    {
      method: "login",
      username: email,
      password,
      getauth: "1",
      ...(code ? { code } : {}),
    },
    { throwOnError: false }
  );

  if (first.result === 1022 && !code) {
    throw new Error(
      "pCloud requires a verification code (device verification or 2FA). " +
        "Set PCLOUD_CODE, or fetch a token once via scripts/test-pcloud.mjs and set PCLOUD_AUTH_TOKEN."
    );
  }
  if (first.result !== 0) {
    throw new Error(`pCloud error ${first.result}: ${first.error ?? "unknown"}`);
  }
  if (!first.auth) {
    throw new Error("pCloud login did not return an auth token.");
  }
  authToken = first.auth;
  return authToken;
}

async function listFolder(
  folderId: string,
  token: string
): Promise<PCloudFile[]> {
  const data = await apiCall({
    method: "listfolder",
    folderid: folderId,
    auth: token,
  });
  return data.metadata?.contents ?? [];
}

interface ManifestMeta {
  title?: string;
  description?: string;
  accent?: string;
  accentSoft?: string;
}

async function readManifestMeta(
  token: string
): Promise<Map<string, ManifestMeta>> {
  const meta = new Map<string, ManifestMeta>();
  try {
    const listing = await listFolder(ROOT_FOLDER_ID, token);
    const manifest = listing.find(
      (f) => !f.isfolder && f.name === "manifest.json"
    );
    if (!manifest?.fileid) return meta;
    const file = await apiCall({
      method: "getfilelink",
      fileid: String(manifest.fileid),
      auth: token,
    });
    const link = `https://${file.hosts?.[0] ?? "api.pcloud.com"}${file.path}`;
    const raw = await (await fetch(link)).text();
    const data = JSON.parse(raw) as { collections?: Collection[] };
    for (const c of data.collections ?? []) {
      meta.set(c.slug, {
        title: c.title,
        description: c.description,
        accent: c.accent,
        accentSoft: c.accentSoft,
      });
    }
  } catch {
    // Manifest missing or unreadable — derive later from folder names.
  }
  return meta;
}

interface ResolvedFile {
  fileid: number;
  name: string;
}

// Map a URL path like ["slug", "image.jpg"] to a pCloud file id under the
// root folder. Returns null when not found.
async function resolveFile(
  segments: string[],
  token: string
): Promise<ResolvedFile | null> {
  if (segments.length < 2) return null;
  const [slug, ...rest] = segments;
  const fileName = decodeURIComponent(rest.join("/"));

  const root = await listFolder(ROOT_FOLDER_ID, token);
  const collection = root.find((f) => f.isfolder && f.name === slug);
  if (!collection?.folderid) return null;

  const files = await listFolder(String(collection.folderid), token);
  const match = files.find((f) => !f.isfolder && f.name === fileName);
  if (!match?.fileid) return null;

  return { fileid: match.fileid, name: fileName };
}

// Returns a downloadable https URL for a file id.
async function getDownloadUrl(
  fileid: number,
  token: string
): Promise<string> {
  const data = await apiCall({
    method: "getfilelink",
    fileid: String(fileid),
    auth: token,
  });
  const host = data.hosts?.[0] ?? "api.pcloud.com";
  return `https://${host}${data.path}`;
}

async function scanCollections(): Promise<Collection[]> {
  try {
    const token = await login();
    const names = await listFolder(ROOT_FOLDER_ID, token);
    const meta = await readManifestMeta(token);

    const collectionDirs = names
      .filter((f) => f.isfolder && f.name && !f.name.startsWith("."))
      .sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", undefined, { numeric: true })
      );

    const collections: Collection[] = [];
    for (const dir of collectionDirs) {
      const slug = dir.name!;
      const fileNames = await listFolder(String(dir.folderid), token);
      const imageFiles = fileNames
        .filter((f) => !f.isfolder && IMAGE_EXTENSIONS.has(extOf(f.name)))
        .map((f) => f.name!)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      if (imageFiles.length === 0) continue;

      const info = meta.get(slug);
      const photos: Photo[] = imageFiles.map((file, i) => {
        const format = extOf(file);
        return {
          id: `${slug}-${i + 1}`,
          src: `/api/photos/${slug}/${file}`,
          alt: `${info?.title ?? titleCase(slug)} photograph ${i + 1}`,
          width: 1600,
          height: 1200,
          title: `${info?.title ?? titleCase(slug)} ${i + 1}`,
          collectionId: slug,
          blurDataURL: undefined,
          featured: i < 2,
          format,
          unoptimized: !isOptimizable(format),
        };
      });

      collections.push({
        id: slug,
        slug,
        title: info?.title ?? titleCase(slug),
        description: info?.description,
        cover: photos[0].src,
        accent: info?.accent ?? "#64748b",
        accentSoft: info?.accentSoft,
        photos,
      });
    }

    console.log(`[pcloud] scanCollections → ${collections.length} collections`);
    return collections;
  } catch (err) {
    // Never blank the page on a pCloud error — log it for the host's logs
    // (e.g. Vercel function logs) and render an empty gallery instead.
    console.error("[pcloud] scanCollections failed:", err);
    return [];
  }
}

export const pcloudSource: PhotoSource = {
  async getCollections() {
    return scanCollections();
  },
  async getCollection(slug: string) {
    const all = await scanCollections();
    return all.find((c) => c.slug === slug) ?? null;
  },
  async getFeatured() {
    const all = await scanCollections();
    return all.flatMap((c) => c.photos).filter((p) => p.featured);
  },
  async getAllPhotos(): Promise<Photo[]> {
    const all = await scanCollections();
    return all.flatMap((c) => c.photos);
  },
};

// Resolve and fetch a file by URL path segments (["slug", "image.jpg"]).
// Returns the bytes stream plus the resolved file name, or null if missing.
export async function getPcloudFile(
  segments: string[]
): Promise<{ buffer: Buffer; name: string } | null> {
  try {
    const token = await login();
    const resolved = await resolveFile(segments, token);
    if (!resolved) return null;
    const url = await getDownloadUrl(resolved.fileid, token);
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      name: resolved.name,
    };
  } catch (err) {
    console.error("[pcloud] getPcloudFile failed:", err);
    return null;
  }
}

// Trigger a login at server startup (called from instrumentation.ts) so the
// auth_token is resolved before the first request arrives. Errors are
// swallowed — the lazy per-request path already handles (and retries on) failures.
export async function warmPcloudLogin(): Promise<void> {
  if (!process.env.PCLOUD_EMAIL || !process.env.PCLOUD_PASSWORD) {
    console.log("[pcloud] no credentials set — skipping startup login");
    return;
  }
  try {
    await login();
    console.log("[pcloud] startup login succeeded");
  } catch (err) {
    console.error("[pcloud] startup login failed (will retry on first request):", err);
  }
}
