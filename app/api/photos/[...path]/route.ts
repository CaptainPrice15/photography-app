import type { NextRequest } from "next/server";
import { getPcloudFile } from "@/lib/storage/pcloudSource";
import { getCachedFile, setCachedFile } from "@/lib/cache";

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

function mimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return MIME[ext] ?? "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;

  const cacheKey = path.join("/");
  try {
    const cached = await getCachedFile(cacheKey);
    if (cached) {
      const name = path[path.length - 1] ?? "";
      return new Response(cached as unknown as BodyInit, {
        headers: {
          "Content-Type": mimeFromName(name),
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const file = await getPcloudFile(path);
    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    await setCachedFile(cacheKey, file.buffer);

    return new Response(file.buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": mimeFromName(file.name),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error("pCloud photo proxy error:", err);
    return new Response("Failed to load image", { status: 500 });
  }
}
