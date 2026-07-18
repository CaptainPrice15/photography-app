import { localSource } from "./localSource";
import type { PhotoSource } from "./types";

// Swap the active photo backend here. Future adapters (Mega, Google Drive,
// Cloudinary/S3) just need to implement the PhotoSource interface — the UI
// never imports a concrete source, so nothing else changes.
//
//   import { megaSource } from "./megaSource";
//   import { googleDriveSource } from "./googleDriveSource";
//   import { cdnSource } from "./cdnSource";
//
// For remote sources, also whitelist `images.remotePatterns` in next.config.ts.

const SOURCE = process.env.NEXT_PUBLIC_PHOTO_SOURCE ?? "local";

export const photoSource: PhotoSource =
  SOURCE === "mega"
    ? // megaSource
      localSource
    : SOURCE === "gdrive"
      ? // googleDriveSource
        localSource
      : SOURCE === "cdn"
        ? // cdnSource
          localSource
        : localSource;
