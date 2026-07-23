import { pcloudSource } from "./pcloudSource.js";
import { localSource } from "./localSource.js";
import type { PhotoSource } from "@lumen/shared";

const override = process.env.PHOTO_SOURCE;
const hasPcloudCreds = Boolean(process.env.PCLOUD_EMAIL && process.env.PCLOUD_PASSWORD);
const SOURCE = override ?? (hasPcloudCreds ? "pcloud" : "local");

console.log(
  `[storage] active photo source = "${SOURCE}" (override=${override ?? "∅"}, hasPcloudCreds=${hasPcloudCreds})`
);

export const photoSource: PhotoSource =
  SOURCE === "pcloud" ? pcloudSource : localSource;
