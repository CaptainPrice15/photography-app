import { filenSource } from "./filenSource";
import { localSource } from "./localSource";
import type { PhotoSource } from "./types";

// Swap the active photo backend here. Future adapters (Mega, Google Drive,
// Cloudinary/S3, Filen) just need to implement the PhotoSource interface — the UI
// never imports a concrete source, so nothing else changes.
//
// Read at RUNTIME (not just build time). `photoSource` is only used in Server
// Components / Route Handlers, so a plain (non-NEXT_PUBLIC_) env var works and is
// picked up on redeploy without relying on build-time inlining. `NEXT_PUBLIC_`
// is also honored for convenience/backwards-compat.
const SOURCE =
  process.env.PHOTO_SOURCE ?? process.env.NEXT_PUBLIC_PHOTO_SOURCE ?? "local";

console.log(
  `[storage] active photo source = "${SOURCE}" (PHOTO_SOURCE=${process.env.PHOTO_SOURCE ?? "∅"}, NEXT_PUBLIC_PHOTO_SOURCE=${process.env.NEXT_PUBLIC_PHOTO_SOURCE ?? "∅"})`
);

export const photoSource: PhotoSource =
  SOURCE === "filen" ? filenSource : localSource;
