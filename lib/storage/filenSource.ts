import { FilenSDK } from "@filen/sdk";
import os from "node:os";
import path from "node:path";
import { isOptimizable, type Collection, type Photo, type PhotoSource } from "./types";

const ROOT = "/photos";

// Keep in sync with localSource.ts and photo proxy.
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

// On serverless platforms (Vercel) the filesystem is read-only except /tmp.
// Pin tmpPath to a writable location so the SDK can cache chunks/metadata.
const TMP_PATH = process.env.FILEN_TMP_PATH ?? path.join(os.tmpdir(), "filen-sdk");

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

function titleCase(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function getSdk(): FilenSDK {
  const email = process.env.FILEN_EMAIL;
  const password = process.env.FILEN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "FILEN_EMAIL and FILEN_PASSWORD environment variables are required."
    );
  }
  return new FilenSDK({
    metadataCache: true,
    connectToSocket: false,
    tmpPath: TMP_PATH,
  });
}

let loginPromise: Promise<FilenSDK> | null = null;

async function getLoggedInSdk(): Promise<FilenSDK> {
  if (loginPromise) return loginPromise;
  const sdk = getSdk();
  const twoFactorCode = process.env.FILEN_TWO_FACTOR_CODE;
  loginPromise = (async () => {
    try {
      await sdk.login({
        email: process.env.FILEN_EMAIL!,
        password: process.env.FILEN_PASSWORD!,
        ...(twoFactorCode ? { twoFactorCode } : {}),
      });
      return sdk;
    } catch (err) {
      loginPromise = null; // allow retry on next request
      console.error("[filen] login failed:", err);
      throw err;
    }
  })();
  return loginPromise;
}

interface ManifestMeta {
  title?: string;
  description?: string;
  accent?: string;
  accentSoft?: string;
}

async function readManifestMeta(
  sdk: FilenSDK
): Promise<Map<string, ManifestMeta>> {
  const meta = new Map<string, ManifestMeta>();
  try {
    const buffer = await sdk.fs().readFile({ path: `${ROOT}/manifest.json` });
    const text = buffer.toString("utf8");
    const data = JSON.parse(text) as { collections?: Collection[] };
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

async function scanCollections(): Promise<Collection[]> {
  try {
    const sdk = await getLoggedInSdk();
    const names: string[] = await sdk.fs().readdir({ path: ROOT });
    const meta = await readManifestMeta(sdk);

    const collectionDirs = [] as string[];
    for (const name of names) {
      if (name.startsWith(".") || !name) continue;
      const stat = await sdk.fs().stat({ path: `${ROOT}/${name}` });
      if (stat.isDirectory()) collectionDirs.push(name);
    }
    collectionDirs.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const collections: Collection[] = [];
    for (const slug of collectionDirs) {
      const dirPath = `${ROOT}/${slug}`;
      const fileNames: string[] = await sdk.fs().readdir({ path: dirPath });
      const imageFiles = fileNames
        .filter((f) => IMAGE_EXTENSIONS.has(extOf(f)))
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

    console.log(`[filen] scanCollections → ${collections.length} collections`);
    return collections;
  } catch (err) {
    // Never blank the page on a Filen error — log it for the host's logs
    // (e.g. Vercel function logs) and render an empty gallery instead.
    console.error("[filen] scanCollections failed:", err);
    return [];
  }
}

export const filenSource: PhotoSource = {
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

export { getLoggedInSdk };
