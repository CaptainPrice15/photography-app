import { filenSource } from "./filenSource";
import { localSource } from "./localSource";
import type { PhotoSource } from "./types";

// Swap the active photo backend here. Future adapters (Mega, Google Drive,
// Cloudinary/S3, Filen) just need to implement the PhotoSource interface — the UI
// never imports a concrete source, so nothing else changes.

const SOURCE = process.env.NEXT_PUBLIC_PHOTO_SOURCE ?? "local";

console.log(`[storage] active photo source = "${SOURCE}"`);

export const photoSource: PhotoSource =
  SOURCE === "filen" ? filenSource : localSource;
