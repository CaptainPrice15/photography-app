import type { NextRequest } from "next/server";
import { getLoggedInSdk } from "@/lib/storage/filenSource";
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

function toFilenPath(segments: string[]): string {
  // Validate that the path cannot escape /photos.
  const joined = segments.map((s) => decodeURIComponent(s)).join("/");
  if (joined.includes("..") || joined.startsWith("/")) {
    throw new Error("Invalid path");
  }
  return `/photos/${joined}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await params;
  let filenPath: string;
  try {
    filenPath = toFilenPath(path);
  } catch {
    return new Response("Invalid path", { status: 400 });
  }

  try {
    const cached = await getCachedFile(filenPath);
    if (cached) {
      const name = path[path.length - 1] ?? "";
      return new Response(cached as unknown as BodyInit, {
        headers: {
          "Content-Type": mimeFromName(name),
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }

    const sdk = await getLoggedInSdk();
    const stat = await sdk.fs().stat({ path: filenPath });
    if (stat.isDirectory()) {
      return new Response("Not found", { status: 404 });
    }

    // Try fast readable stream first.
    if (stat.type === "file" && "metadata" in stat) {
      try {
        const meta = stat.metadata as {
          bucket: string;
          region: string;
          chunks: number;
          version: number;
          key: string;
          size: number;
        };
        const cloud = (sdk as unknown as {
          cloud: () => {
            downloadFileToReadableStream: (args: {
              uuid: string;
              bucket: string;
              region: string;
              chunks: number;
              version: number;
              key: string;
              size: number;
            }) => ReadableStream<Uint8Array>;
          };
        }).cloud();
        const stream = cloud.downloadFileToReadableStream({
          uuid: stat.uuid,
          bucket: meta.bucket,
          region: meta.region,
          chunks: meta.chunks,
          version: meta.version,
          key: meta.key,
          size: meta.size,
        });

        // Cache while streaming is awkward; return stream directly.
        return new Response(stream, {
          headers: {
            "Content-Type": mimeFromName(path[path.length - 1] ?? ""),
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      } catch {
        // Fall through to buffer approach.
      }
    }

    const buffer = await sdk.fs().readFile({ path: filenPath });
    await setCachedFile(filenPath, buffer);

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": mimeFromName(path[path.length - 1] ?? ""),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error("Filen proxy error:", err);
    return new Response("Failed to load image", { status: 500 });
  }
}
