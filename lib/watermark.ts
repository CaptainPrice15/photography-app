import sharp from "sharp";

export const WATERMARK_TEXT = "lumen.photo";
const PREVIEW_LONG_EDGE = 1600;
const PREVIEW_QUALITY = 75;
const WATERMARK_OPACITY = 0.22;

// Cache SVG watermark patterns keyed by "widthXheight" to avoid regenerating.
const svgCache = new Map<string, Buffer>();

function buildWatermarkSvg(w: number, h: number): Buffer {
  const key = `${w}x${h}`;
  const cached = svgCache.get(key);
  if (cached) return cached;

  const fontSize = Math.max(18, Math.round(Math.min(w, h) / 28));
  const tileGap = fontSize * 6;

  const svg = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${tileGap}" height="${tileGap}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="0" y="${tileGap / 2}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="600" fill="white" fill-opacity="${WATERMARK_OPACITY}" letter-spacing="2">${WATERMARK_TEXT}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
    </svg>
  `);

  svgCache.set(key, svg);
  return svg;
}

/**
 * Burns a tiled, diagonal text watermark into a downscaled JPEG preview.
 * The browser only ever receives this derivative — the clean original is
 * never sent to unauthenticated views, so screenshots / "open in new tab"
 * still capture a watermarked copy.
 */
export async function watermarkPreview(
  input: Buffer,
  contentType: string
): Promise<{ bytes: Buffer; contentType: string }> {
  const isHeic =
    contentType === "image/heic" || contentType === "image/heif";

  let base = sharp(input, { failOn: "none" });

  // HEIC/HEIF need an explicit output format before compositing.
  if (isHeic) {
    const raw = await base.jpeg().toBuffer();
    base = sharp(raw, { failOn: "none" });
  }

  const meta = await base.metadata();
  const width = meta.width ?? PREVIEW_LONG_EDGE;
  const height = meta.height ?? PREVIEW_LONG_EDGE;

  let targetWidth = width;
  let targetHeight = height;

  if (width > PREVIEW_LONG_EDGE || height > PREVIEW_LONG_EDGE) {
    const ratio = Math.min(PREVIEW_LONG_EDGE / width, PREVIEW_LONG_EDGE / height);
    targetWidth = Math.round(width * ratio);
    targetHeight = Math.round(height * ratio);
  }

  const watermarkSvg = buildWatermarkSvg(targetWidth, targetHeight);

  const bytes = await base
    .resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .composite([{ input: watermarkSvg, gravity: "center", blend: "over" }])
    .jpeg({ quality: PREVIEW_QUALITY })
    .toBuffer();

  return { bytes, contentType: "image/jpeg" };
}
