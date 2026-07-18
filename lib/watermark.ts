import sharp from "sharp";

export const WATERMARK_TEXT = "lumen.photo";
const PREVIEW_LONG_EDGE = 1600;
const PREVIEW_QUALITY = 82;
const WATERMARK_OPACITY = 0.22;

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

  const fontSize = Math.max(18, Math.round(Math.min(width, height) / 28));
  const tileGap = fontSize * 6;

  const watermarkSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${tileGap}" height="${tileGap}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="0" y="${tileGap / 2}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="600" fill="white" fill-opacity="${WATERMARK_OPACITY}" letter-spacing="2">${WATERMARK_TEXT}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
    </svg>
  `);

  const bytes = await base
    .resize({
      width: width > PREVIEW_LONG_EDGE ? PREVIEW_LONG_EDGE : undefined,
      height: height > PREVIEW_LONG_EDGE ? PREVIEW_LONG_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    })
    .composite([{ input: watermarkSvg, gravity: "center", blend: "over" }])
    .jpeg({ quality: PREVIEW_QUALITY, mozjpeg: true })
    .toBuffer();

  return { bytes, contentType: "image/jpeg" };
}
