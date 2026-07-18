// Generates placeholder photography images + manifest.json with blur placeholders.
// Run: node scripts/gen-blur.mjs
import sharp from "sharp";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PHOTOS_DIR = join(ROOT, "public", "photos");

// Collection definitions with distinct accent palettes.
const collections = [
  {
    id: "aurora",
    slug: "aurora",
    title: "Aurora",
    description: "Cool teals and greens — northern lights, oceans, and still nights.",
    accent: "#2dd4bf",
    accentSoft: "#5eead4",
    // gradient stops [from, to] used to synthesize varied photos
    stops: ["#0f766e", "#2dd4bf", "#a7f3d0"],
  },
  {
    id: "sunset",
    slug: "sunset",
    title: "Sunset",
    description: "Warm ambers and roses — golden hour, deserts, and city dusk.",
    accent: "#f59e0b",
    accentSoft: "#fbbf24",
    stops: ["#7c2d12", "#f59e0b", "#fecaca"],
  },
  {
    id: "mono",
    slug: "mono",
    title: "Mono",
    description: "Slate and silver — architecture, fog, and quiet minimalism.",
    accent: "#64748b",
    accentSoft: "#94a3b8",
    stops: ["#0f172a", "#475569", "#cbd5e1"],
  },
  {
    id: "bloom",
    slug: "bloom",
    title: "Bloom",
    description: "Soft pinks and violets — florals, portraits, and dreamscape.",
    accent: "#ec4899",
    accentSoft: "#f472b6",
    stops: ["#831843", "#ec4899", "#fbcfe8"],
  },
];

// Varied aspect ratios for a true masonry feel.
const ratios = [
  [1200, 1600], // portrait
  [1600, 1200], // landscape
  [1200, 1200], // square
  [1200, 1800], // tall
  [1800, 1200], // wide
  [1200, 1400],
];

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function makeImage(buffer, w, h) {
  // Build a smooth diagonal gradient + soft blobs using SVG, rasterized by sharp.
  const svg = buffer
    .replaceAll("{{W}}", String(w))
    .replaceAll("{{H}}", String(h));
  return sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
}

async function build() {
  await rm(PHOTOS_DIR, { recursive: true, force: true });
  await mkdir(PHOTOS_DIR, { recursive: true });

  const outCollections = [];
  const allPhotos = [];

  for (const c of collections) {
    const dir = join(PHOTOS_DIR, c.slug);
    await mkdir(dir, { recursive: true });
    const photos = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const [w, h] = ratios[(i + hashStr(c.id)) % ratios.length];
      const rnd = mulberry32(hashStr(c.id + i));
      const a = c.stops[0];
      const b = c.stops[1 + Math.floor(rnd() * 2)];
      const angle = Math.floor(rnd() * 360);
      const cx1 = 20 + Math.floor(rnd() * 60);
      const cy1 = 20 + Math.floor(rnd() * 60);
      const cx2 = 20 + Math.floor(rnd() * 60);
      const cy2 = 20 + Math.floor(rnd() * 60);
      const blob = c.stops[2];

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="{{W}}" height="{{H}}" viewBox="0 0 {{W}} {{H}}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="r1" cx="${cx1}%" cy="${cy1}%" r="45%">
      <stop offset="0%" stop-color="${blob}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${blob}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="r2" cx="${cx2}%" cy="${cy2}%" r="40%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="{{W}}" height="{{H}}" fill="url(#g)"/>
  <rect width="{{W}}" height="{{H}}" fill="url(#r1)"/>
  <rect width="{{W}}" height="{{H}}" fill="url(#r2)"/>
  <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="${Math.round(
    Math.min(w, h) / 8
  )}" font-weight="700" fill="#ffffff" fill-opacity="0.85" text-anchor="middle" dominant-baseline="middle">${c.title} ${i + 1}</text>
</svg>`;

      const jpg = await makeImage(svg, w, h);
      const file = `${c.slug}-${i + 1}.jpg`;
      await writeFile(join(dir, file), jpg);

      // Tiny blur placeholder.
      const blur = await sharp(jpg)
        .resize(16, Math.max(1, Math.round((16 * h) / w)), { fit: "inside" })
        .jpeg({ quality: 50 })
        .toBuffer();
      const blurDataURL = `data:image/jpeg;base64,${blur.toString("base64")}`;

      const photo = {
        id: `${c.id}-${i + 1}`,
        src: `/photos/${c.slug}/${file}`,
        alt: `${c.title} photograph ${i + 1}`,
        width: w,
        height: h,
        title: `${c.title} ${i + 1}`,
        collectionId: c.id,
        blurDataURL,
        featured: i < 2,
      };
      photos.push(photo);
      allPhotos.push(photo);
    }

    const coverPhoto = photos[0];
    outCollections.push({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      cover: coverPhoto.src,
      accent: c.accent,
      accentSoft: c.accentSoft,
      photos,
    });
  }

  const manifest = {
    collections: outCollections,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(
    join(PHOTOS_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log(
    `Generated ${allPhotos.length} placeholder images across ${collections.length} collections.`
  );
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
