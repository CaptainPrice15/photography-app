import type { NextRequest } from "next/server";
import { getPcloudFile } from "@/lib/storage/pcloudSource";
import { getCachedFile, setCachedFile } from "@/lib/cache";
import { watermarkPreview } from "@/lib/watermark";
import convert from "heic-convert";

export const runtime = "nodejs";

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

// Browsers (Chrome/Firefox/Edge) cannot render HEIC/HEIF. Transcode those to
// JPEG server-side so every browser displays them. Safari can show HEIC
// natively, but serving JPEG universally keeps behavior consistent.
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
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;

  const cacheKey = `wm:${path.join("/")}`;
  try {
    const cached = await getCachedFile(cacheKey);
    if (cached) {
      return new Response(cached as unknown as BodyInit, {
        headers: previewHeaders("image/jpeg"),
      });
    }

    const file = await getPcloudFile(path);
    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    // Serve a watermarked, downscaled derivative only. The clean original is
    // never sent to unauthenticated views — it can only be fetched via the
    // gated /api/download route after payment.
    const { bytes, contentType } = await toBrowserBytes(file.name, file.buffer);
    let preview = { bytes, contentType };
    try {
      preview = await watermarkPreview(bytes, contentType);
    } catch (wmErr) {
      console.error("[photos] watermark failed, serving plain preview:", wmErr);
    }
    await setCachedFile(cacheKey, preview.bytes);

    return new Response(preview.bytes as unknown as BodyInit, {
      headers: previewHeaders(preview.contentType),
    });
  } catch (err) {
    console.error("pCloud photo proxy error:", err);
    return new Response("Failed to load image", { status: 500 });
  }
}

function previewHeaders(contentType: string): Record<string, string> {
  return {
    "Content-Type": contentType,
    "Content-Disposition": "inline",
    "Cache-Control": "public, max-age=86400, immutable",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
}
