import sharp from "sharp";

const BLUR_LONG_EDGE = 20;
const blurCache = new Map<string, string>();

export function getCachedBlurDataUrl(path: string): string | undefined {
  return blurCache.get(path);
}

export function setCachedBlurDataUrl(path: string, dataUri: string): void {
  blurCache.set(path, dataUri);
}

export async function generateBlurDataUrl(
  input: Buffer,
  contentType: string
): Promise<string> {
  const isHeic =
    contentType === "image/heic" || contentType === "image/heif";

  let base = sharp(input, { failOn: "none" });

  if (isHeic) {
    const raw = await base.jpeg().toBuffer();
    base = sharp(raw, { failOn: "none" });
  }

  const meta = await base.metadata();
  const width = meta.width ?? BLUR_LONG_EDGE;
  const height = meta.height ?? BLUR_LONG_EDGE;

  const ratio = Math.min(BLUR_LONG_EDGE / width, BLUR_LONG_EDGE / height);
  const targetWidth = Math.round(width * ratio);
  const targetHeight = Math.round(height * ratio);

  const { data } = await base
    .resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 30 })
    .toBuffer({ resolveWithObject: true });

  const base64 = data.toString("base64");
  return `data:image/jpeg;base64,${base64}`;
}
