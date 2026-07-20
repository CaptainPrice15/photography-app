// Regenerates manifest.json from the real image files in public/photos.
// Run: node scripts/gen-blur.mjs
//
// It scans every subfolder of public/photos for image files (jpg, png, webp,
// avif, heic, gif, …), reads each image's real dimensions (respecting EXIF
// orientation), and generates a tiny blur placeholder for web-safe formats.
// Collection title/description/accent are kept from an existing manifest when
// present, otherwise derived from the folder name.
import sharp from "sharp";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PHOTOS_DIR = join(ROOT, "public", "photos");
const MANIFEST = join(PHOTOS_DIR, "manifest.json");

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "avif", "gif",
  "heic", "heif", "tif", "tiff", "bmp", "svg",
]);
const OPTIMIZABLE = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

function titleCase(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

async function main() {
  let prevMeta = new Map();
  try {
    const raw = await fs.readFile(MANIFEST, "utf8");
    const data = JSON.parse(raw);
    for (const c of data.collections ?? []) prevMeta.set(c.slug, c);
  } catch {
    // No previous manifest — fine.
  }

  const entries = await fs.readdir(PHOTOS_DIR, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));

  const outCollections = [];
  let total = 0;

  for (const dir of dirs) {
    const slug = dir.name;
    const dirPath = join(PHOTOS_DIR, slug);
    const files = (await fs.readdir(dirPath))
      .filter((f) => IMAGE_EXTENSIONS.has(extname(f).replace(/^\./, "").toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (files.length === 0) continue;

    const meta = prevMeta.get(slug) ?? {};
    const photos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = extname(file).replace(/^\./, "").toLowerCase();
      const src = `/photos/${slug}/${file}`;
      const id = `${slug}-${i + 1}`;

      let width = 1600;
      let height = 1200;
      let blurDataURL;
      let dominantColor = null;

      if (OPTIMIZABLE.has(ext)) {
        try {
          const buf = await fs.readFile(join(dirPath, file));
          const img = sharp(buf, { failOn: "none" }).rotate();
          const meta = await img.metadata();
          width = meta.width ?? width;
          height = meta.height ?? height;
          const blur = await img
            .resize(16, Math.max(1, Math.round((16 * height) / width)), {
              fit: "inside",
            })
            .jpeg({ quality: 50 })
            .toBuffer();
          blurDataURL = `data:image/jpeg;base64,${blur.toString("base64")}`;
          
          if (i === 0) {
            try {
              const { data } = await sharp(buf).resize(1, 1).raw().toBuffer({ resolveWithObject: true });
              const toHex = (c) => c.toString(16).padStart(2, "0");
              dominantColor = `#${toHex(data[0])}${toHex(data[1])}${toHex(data[2])}`;
            } catch {
              // ignore
            }
          }
        } catch {
          // Keep defaults if sharp can't read it.
        }
      } else {
        // HEIC/SVG/etc.: dimensions unknown without transcoding; the optimizer
        // is bypassed at render time (unoptimized). Keep sensible defaults.
        try {
          const buf = await fs.readFile(join(dirPath, file));
          const img = sharp(buf, { failOn: "none" }).rotate();
          const m = await img.metadata();
          if (m.width && m.height) {
            width = m.width;
            height = m.height;
          }
        } catch {
          // ignore
        }
      }

      photos.push({
        id,
        src,
        alt: `${meta.title ?? titleCase(slug)} photograph ${i + 1}`,
        width,
        height,
        title: `${meta.title ?? titleCase(slug)} ${i + 1}`,
        collectionId: slug,
        blurDataURL,
        featured: i < 2,
        format: ext,
        unoptimized: !OPTIMIZABLE.has(ext),
        dominantColor: i === 0 ? dominantColor : undefined,
      });
    }
    
    const coverPhoto = photos[0];

    outCollections.push({
      id: slug,
      slug,
      title: meta.title ?? titleCase(slug),
      description: meta.description,
      cover: coverPhoto.src,
      accent: coverPhoto.dominantColor || meta.accent || "#64748b",
      accentSoft: meta.accentSoft,
      photos,
    });
    total += photos.length;
  }

  const manifest = {
    collections: outCollections,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(
    `Scanned ${total} images across ${outCollections.length} collections into manifest.json`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
