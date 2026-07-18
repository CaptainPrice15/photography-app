import type { NextRequest } from "next/server";
import { getLoggedInSdk } from "@/lib/storage/filenSource";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

function toFilenPath(segments: string[]): string {
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
  const session = await getSession();
  if (!session || !session.paid) {
    return new Response("Payment required", { status: 402 });
  }

  const { path } = await params;
  let filenPath: string;
  try {
    filenPath = toFilenPath(path);
  } catch {
    return new Response("Invalid path", { status: 400 });
  }

  try {
    const sdk = await getLoggedInSdk();
    const stat = await sdk.fs().stat({ path: filenPath });
    if (stat.isDirectory()) {
      return new Response("Not found", { status: 404 });
    }

    const buffer = await sdk.fs().readFile({ path: filenPath });
    const name = path[path.length - 1] ?? "download";
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : ext === "avif"
              ? "image/avif"
              : ext === "heic"
                ? "image/heic"
                : "application/octet-stream";

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Filen download error:", err);
    return new Response("Failed to download", { status: 500 });
  }
}
