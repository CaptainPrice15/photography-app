import type { NextRequest } from "next/server";
import { getPcloudFile } from "@/lib/storage/pcloudSource";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const session = await getSession();
  if (!session || !session.paid) {
    return new Response("Payment required", { status: 402 });
  }

  const { path } = await params;

  try {
    const file = await getPcloudFile(path);
    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    const name = file.name;
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

    return new Response(file.buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (err) {
    console.error("pCloud download error:", err);
    return new Response("Failed to download", { status: 500 });
  }
}
