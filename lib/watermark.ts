import sharp from "sharp";

export const WATERMARK_TEXT = "lumen.photo";

export type PreviewSize = "thumb" | "preview" | "lightbox" | "w640" | "w1200" | "w1920";

export type OutputFormat = "auto" | "avif" | "webp" | "jpeg";

const SIZE_CONFIG: Record<PreviewSize, { longEdge: number; quality: number; opacity: number }> = {
  thumb: { longEdge: 400, quality: 70, opacity: 0.25 },
  preview: { longEdge: 900, quality: 75, opacity: 0.22 },
  lightbox: { longEdge: 1600, quality: 75, opacity: 0.22 },
  w640: { longEdge: 640, quality: 75, opacity: 0.22 },
  w1200: { longEdge: 1200, quality: 75, opacity: 0.22 },
  w1920: { longEdge: 1920, quality: 75, opacity: 0.22 },
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

function resolveFormat(format: OutputFormat, acceptHeader: string): "avif" | "webp" | "jpeg" {
  if (format !== "auto") return format;
  if (acceptHeader.includes("image/avif")) return "avif";
  if (acceptHeader.includes("image/webp")) return "webp";
  return "jpeg";
}

export interface PreviewOptions {
  width?: number;
  quality?: number;
  format?: OutputFormat;
  acceptHeader?: string;
}

export async function watermarkPreview(
  input: Buffer,
  contentType: string,
  size: PreviewSize = "lightbox",
  options: PreviewOptions = {}
): Promise<{ bytes: Buffer; contentType: string }> {
  const isHeic = contentType === "image/heic" || contentType === "image/heif";

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

  if (options.width && options.width < targetWidth) {
    const ratio = options.width / targetWidth;
    targetWidth = options.width;
    targetHeight = Math.round(targetHeight * ratio);
  }

  const watermarkSvg = buildWatermarkSvg(targetWidth, targetHeight, SIZE_CONFIG[size].opacity);

  const quality = options.quality ?? SIZE_CONFIG[size].quality;
  const outputFormat = resolveFormat(options.format ?? "auto", options.acceptHeader ?? "");

  let pipeline = base
    .resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .composite([{ input: watermarkSvg, gravity: "center", blend: "over" }]);

  let finalContentType: string;
  switch (outputFormat) {
    case "avif":
      pipeline = pipeline.avif({ quality });
      finalContentType = "image/avif";
      break;
    case "webp":
      pipeline = pipeline.webp({ quality });
      finalContentType = "image/webp";
      break;
    case "jpeg":
    default:
      pipeline = pipeline.jpeg({ quality });
      finalContentType = "image/jpeg";
      break;
  }

  const bytes = await pipeline.toBuffer();
  return { bytes, contentType: finalContentType };
}