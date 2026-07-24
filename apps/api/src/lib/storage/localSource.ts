import { promises as fs } from "node:fs";
import path from "node:path";
import type { Collection, Photo, PhotoSource } from "@lumen/shared";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const MANIFEST = path.join(PHOTOS_DIR, "manifest.json");

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

async function readManifestMeta(): Promise<
  Map<string, { title?: string; description?: string; accent?: string; accentSoft?: string }>
> {
  const meta = new Map<
    string,
    { title?: string; description?: string; accent?: string; accentSoft?: string }
  >();
  try {
    const raw = await fs.readFile(MANIFEST, "utf8");
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
    // No manifest — fall back to folder names.
  }
  return meta;
}

function extOf(file: string): string {
  return path.extname(file).replace(/^\./, "").toLowerCase();
}

async function scanCollections(): Promise<Collection[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(PHOTOS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const meta = await readManifestMeta();
  const collectionDirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith(".")
  );

  const collections: Collection[] = [];
  for (const dir of collectionDirs) {
    const slug = dir.name;
    const dirPath = path.join(PHOTOS_DIR, slug);
    const files = (await fs.readdir(dirPath)).filter((f) =>
      IMAGE_EXTENSIONS.has(extOf(f))
    );
    files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const info = meta.get(slug);
    const photos: Photo[] = files.map((file, i) => {
      const format = extOf(file);
      const src = `/api/photos/${slug}/${file}`;
      return {
        id: `${slug}-${i + 1}`,
        src,
        alt: `${info?.title ?? slug} photograph ${i + 1}`,
        width: 1600,
        height: 1200,
        title: `${info?.title ?? slug} ${i + 1}`,
        collectionId: slug,
        format,
        featured: i < 2,
      };
    });

    if (photos.length === 0) continue;

    const fallbackTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
    collections.push({
      id: slug,
      slug,
      title: info?.title ?? fallbackTitle,
      description: info?.description,
      cover: photos[0].src,
      accent: info?.accent ?? "#64748b",
      accentSoft: info?.accentSoft,
      photos,
    });
  }

  console.log(`[local] scanCollections → ${collections.length} collections`);
  return collections;
}

export const localSource: PhotoSource = {
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
  async getLatest(limit = 12): Promise<Photo[]> {
    const all = await scanCollections();
    return all.flatMap((c) => c.photos).slice(0, limit);
  },
};
