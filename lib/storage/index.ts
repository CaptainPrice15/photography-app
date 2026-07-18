import { pcloudSource } from "./pcloudSource";
import { localSource } from "./localSource";
import type { PhotoSource } from "./types";

// Swap the active photo backend here. Future adapters (Mega, Google Drive,
// Cloudinary/S3, pCloud) just need to implement the PhotoSource interface — the UI
// never imports a concrete source, so nothing else changes.
//
// Resolution order:
//   1. Explicit override: PHOTO_SOURCE or NEXT_PUBLIC_PHOTO_SOURCE ("local" | "pcloud")
//   2. Auto: if pCloud credentials are present, use "pcloud" (so no extra env var
//      is required once PCLOUD_EMAIL/PCLOUD_PASSWORD are set)
//   3. Fallback: "local"
const override = process.env.PHOTO_SOURCE ?? process.env.NEXT_PUBLIC_PHOTO_SOURCE;
const hasPcloudCreds = Boolean(process.env.PCLOUD_EMAIL && process.env.PCLOUD_PASSWORD);
const SOURCE = override ?? (hasPcloudCreds ? "pcloud" : "local");

console.log(
  `[storage] active photo source = "${SOURCE}" (override=${override ?? "∅"}, hasPcloudCreds=${hasPcloudCreds})`
);

export const photoSource: PhotoSource =
  SOURCE === "pcloud" ? pcloudSource : localSource;
