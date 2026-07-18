import { filenSource } from "./filenSource";
import { localSource } from "./localSource";
import type { PhotoSource } from "./types";

// Swap the active photo backend here. Future adapters (Mega, Google Drive,
// Cloudinary/S3, Filen) just need to implement the PhotoSource interface — the UI
// never imports a concrete source, so nothing else changes.
//
// Resolution order:
//   1. Explicit override: PHOTO_SOURCE or NEXT_PUBLIC_PHOTO_SOURCE ("local" | "filen")
//   2. Auto: if Filen credentials are present, use "filen" (so no extra env var
//      is required once FILEN_EMAIL/FILEN_PASSWORD are set)
//   3. Fallback: "local"
const override = process.env.PHOTO_SOURCE ?? process.env.NEXT_PUBLIC_PHOTO_SOURCE;
const hasFilenCreds = Boolean(process.env.FILEN_EMAIL && process.env.FILEN_PASSWORD);
const SOURCE = override ?? (hasFilenCreds ? "filen" : "local");

console.log(
  `[storage] active photo source = "${SOURCE}" (override=${override ?? "∅"}, hasFilenCreds=${hasFilenCreds})`
);

export const photoSource: PhotoSource =
  SOURCE === "filen" ? filenSource : localSource;
