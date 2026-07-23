import { Router, Request } from "express";
import { getPcloudFile } from "../lib/storage/pcloudSource.js";
import { getSession } from "../lib/auth.js";

const router = Router();

router.get("/*path", async (req: Request, res) => {
  const session = getSession(req);
  if (!session || !session.paid) {
    return res.status(402).send("Payment required");
  }

  const path = (req.params as { path?: string[] }).path ?? [];

  try {
    const file = await getPcloudFile(path);
    if (!file) {
      return res.status(404).send("Not found");
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

    res.set({
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    return res.send(file.buffer);
  } catch (err) {
    console.error("pCloud download error:", err);
    return res.status(500).send("Failed to download");
  }
});

export { router as downloadRouter };