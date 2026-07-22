import sharp from "sharp";

export const WATERMARK_TEXT = "lumen.photo";

export type PreviewSize = "thumb" | "preview" | "lightbox";

const SIZE_CONFIG: Record<PreviewSize, { longEdge: number; quality: number; opacity: number }> = {
  thumb: { longEdge: 400, quality: 70, opacity: 0.25 },
  preview: { longEdge: 900, quality: 75, opacity: 0.22 },
  lightbox: { longEdge: 1600, quality: 75, opacity: 0.22 },
};

const svgCache = new Map<string, Buffer>();

function buildWatermarkSvg(w: number, h: number, opacity: number): Buffer {
  const key = `${w}x${h}x${opacity}`;
  const cached = svgCache.get(key);
  if (cached) return cached;

  const fontSize = Math.max(14, Math.round(Math.min(w, h) / 28));
  const tileGap = fontSize * 6;

  const svg = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${tileGap}" height="${tileGap}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="0" y="${tileGap / 2}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="600" fill="white" fill-opacity="${opacity}" letter-spacing="2">${WATERMARK_TEXT}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
    </svg>
  `);

  svgCache.set(key, svg);
  return svg;
}

export async function watermarkPreview(
  input: Buffer,
  contentType: string,
  size: PreviewSize = "lightbox"
): Promise<{ bytes: Buffer; contentType: string }> {
  const isHeic =
    contentType === "image/heic" || contentType === "image/heif";

  let base = sharp(input, { failOn: "none" });

  if (isHeic) {
    const raw = await base.jpeg().toBuffer();
    base = sharp(raw, { failOn: "none" });
  }

  const meta = await base.metadata();
  const imgWidth = meta.width ?? SIZE_CONFIG[size].longEdge;
  const imgHeight = meta.height ?? SIZE_CONFIG[size].longEdge;

  const longEdge = SIZE_CONFIG[size].longEdge;
  let targetWidth = imgWidth;
  let targetHeight = imgHeight;

  if (imgWidth > longEdge || imgHeight > longEdge) {
    const ratio = Math.min(longEdge / imgWidth, longEdge / imgHeight);
    targetWidth = Math.round(imgWidth * ratio);
    targetHeight = Math.round(imgHeight * ratio);
  }

  const watermarkSvg = buildWatermarkSvg(targetWidth, targetHeight, SIZE_CONFIG[size].opacity);

  const bytes = await base
    .resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .composite([{ input: watermarkSvg, gravity: "center", blend: "over" }])
    .jpeg({ quality: SIZE_CONFIG[size].quality })
    .toBuffer();

  return { bytes, contentType: "image/jpeg" };
}
