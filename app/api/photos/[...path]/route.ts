import type { NextRequest } from "next/server";
import { getPcloudFile } from "@/lib/storage/pcloudSource";
import { getCachedFile, setCachedFile } from "@/lib/cache";
import { watermarkPreview, type PreviewSize } from "@/lib/watermark";
import { generateBlurDataUrl, setCachedBlurDataUrl } from "@/lib/blur";
import convert from "heic-convert";

export const runtime = "nodejs";

const ALLOWED_SIZES = new Set(["thumb", "preview", "lightbox", "blur"]);

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;
  const sizeParam = req.nextUrl.searchParams.get("size") ?? "lightbox";
  const size: PreviewSize | "blur" =
    ALLOWED_SIZES.has(sizeParam) ? (sizeParam as PreviewSize | "blur") : "lightbox";
  const pathStr = path.join("/");
  const isBlur = size === "blur";

  const rawCacheKey = `raw:${pathStr}`;
  const wmCacheKey = `wm:${pathStr}:${size}`;
  const blurCacheKey = `blur:${pathStr}`;

  try {
    if (isBlur) {
      const cachedBlur = await getCachedFile(blurCacheKey);
      if (cachedBlur) {
        return new Response(cachedBlur as unknown as BodyInit, {
          headers: previewHeaders("text/plain", "86400"),
        });
      }
    } else {
      const cached = await getCachedFile(wmCacheKey);
      if (cached) {
        return new Response(cached as unknown as BodyInit, {
          headers: previewHeaders("image/jpeg", "31536000"),
        });
      }
    }

    let rawBuffer: Buffer | null = await getCachedFile(rawCacheKey);
    let rawName: string;

    if (rawBuffer) {
      rawName = path[path.length - 1];
    } else {
      const file = await getPcloudFile(path);
      if (!file) {
        return new Response("Not found", { status: 404 });
      }
      rawBuffer = file.buffer;
      rawName = file.name;
      setCachedFile(rawCacheKey, rawBuffer).catch(() => {});
    }

    const { bytes, contentType } = await toBrowserBytes(rawName, rawBuffer);

    if (isBlur) {
      const blurDataUri = await generateBlurDataUrl(bytes, contentType);
      const blurBuffer = Buffer.from(blurDataUri);
      await setCachedFile(blurCacheKey, blurBuffer);
      setCachedBlurDataUrl(pathStr, blurDataUri);
      return new Response(blurBuffer as unknown as BodyInit, {
        headers: previewHeaders("text/plain", "86400"),
      });
    }

    let preview = { bytes, contentType };
    try {
      preview = await watermarkPreview(bytes, contentType, size);
      generateBlurDataUrl(bytes, contentType)
        .then((dataUri) => {
          setCachedBlurDataUrl(pathStr, dataUri);
          setCachedFile(blurCacheKey, Buffer.from(dataUri)).catch(() => {});
        })
        .catch(() => {});
    } catch (wmErr) {
      console.error("[photos] watermark failed, serving plain preview:", wmErr);
    }
    await setCachedFile(wmCacheKey, preview.bytes);

    return new Response(preview.bytes as unknown as BodyInit, {
      headers: previewHeaders(preview.contentType, "31536000"),
    });
  } catch (err) {
    console.error("pCloud photo proxy error:", err);
    return new Response("Failed to load image", { status: 500 });
  }
}

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
