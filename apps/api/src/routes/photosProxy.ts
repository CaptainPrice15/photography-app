import { Router } from "express";
import { getPcloudFile } from "../lib/storage/pcloudSource.js";
import { getCachedFile, setCachedFile } from "../lib/cache.js";
import { watermarkPreview, type PreviewSize, type OutputFormat } from "../lib/watermark.js";
import convert from "heic-convert";

const ALLOWED_SIZES = new Set(["thumb", "preview", "lightbox", "w640", "w1200", "w1920"]);

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  tif: "image/tiff",
  tiff: "image/tiff",
  bmp: "image/bmp",
  svg: "image/svg+xml",
};

function extOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function mimeFromName(name: string): string {
  return MIME[extOf(name)] ?? "application/octet-stream";
}

async function toBrowserBytes(
  name: string,
  buffer: Buffer
): Promise<{ bytes: Buffer; contentType: string }> {
  const ext = extOf(name);
  if (ext === "heic" || ext === "heif") {
    try {
      const jpg = await convert({
        buffer,
        format: "JPEG",
        quality: 0.9,
      });
      return { bytes: Buffer.from(jpg), contentType: "image/jpeg" };
    } catch (err) {
      console.error("[photos] HEIC convert failed, serving raw:", err);
      return { bytes: buffer, contentType: mimeFromName(name) };
    }
  }
  return { bytes: buffer, contentType: mimeFromName(name) };
}

const router = Router();

router.use(async (req, res, next) => {
  if (req.method !== "GET") { return next(); }

  const pathStr = req.path.replace(/^\//, "");
  const path = pathStr.split("/").filter(Boolean);
  const sizeParam = req.query.size as string ?? "lightbox";
  const size: PreviewSize = ALLOWED_SIZES.has(sizeParam) ? (sizeParam as PreviewSize) : "lightbox";

  const formatParam = req.query.fm as string ?? "auto";
  const format: OutputFormat = ["auto", "avif", "webp", "jpeg"].includes(formatParam)
    ? (formatParam as OutputFormat)
    : "auto";
  const widthParam = req.query.w as string | undefined;
  const qualityParam = req.query.q as string | undefined;
  const width = widthParam ? parseInt(widthParam, 10) : undefined;
  const quality = qualityParam ? parseInt(qualityParam, 10) : undefined;

  const rawCacheKey = `raw:${pathStr}`;
  const wmCacheKey = `wm:${pathStr}:${size}:${format}`;

  try {
    const cached = await getCachedFile(wmCacheKey);
    if (cached) {
      res.set(previewHeaders("image/jpeg", "31536000"));
      return res.send(cached);
    }

    let rawBuffer: Buffer | null = await getCachedFile(rawCacheKey);
    let rawName: string;

    if (rawBuffer) {
      rawName = path[path.length - 1];
    } else {
      const file = await getPcloudFile(path);
      if (!file) {
        return res.status(404).send("Not found");
      }
      rawBuffer = file.buffer;
      rawName = file.name;
      setCachedFile(rawCacheKey, rawBuffer).catch(() => {});
    }

    const { bytes, contentType } = await toBrowserBytes(rawName, rawBuffer);

    let preview = { bytes, contentType };
    try {
      preview = await watermarkPreview(bytes, contentType, size, { width, quality, format, acceptHeader: req.headers.accept ?? "" });
    } catch (wmErr) {
      console.error("[photos] watermark failed, serving plain preview:", wmErr);
    }
    await setCachedFile(wmCacheKey, preview.bytes);

    res.set(previewHeaders(preview.contentType, "31536000"));
    return res.send(preview.bytes);
  } catch (err) {
    console.error("pCloud photo proxy error:", err);
    return res.status(500).send("Failed to load image");
  }
});

function previewHeaders(contentType: string, maxAge?: string): Record<string, string> {
  return {
    "Content-Type": contentType,
    "Content-Disposition": "inline",
    "Cache-Control": `public, max-age=${maxAge ?? "86400"}, s-maxage=${maxAge ?? "86400"}, stale-while-revalidate=604800`,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}

export { router as photosProxyRouter };