"use server";

import { getCachedBlurDataUrl } from "@/lib/blur";
import { getCachedFile } from "@/lib/cache";
import { photoSource } from "@/lib/storage";

export async function getBlurDataUrls(
  photoIds: string[]
): Promise<Record<string, string>> {
  if (photoIds.length === 0) return {};

  const allPhotos = await photoSource.getAllPhotos();
  const photoMap = new Map(allPhotos.map((p) => [p.id, p]));
  const result: Record<string, string> = {};

  for (const id of photoIds) {
    const photo = photoMap.get(id);
    if (!photo) continue;

    const path = photo.src.replace("/api/photos/", "");
    const cached = getCachedBlurDataUrl(path);
    if (cached) {
      result[id] = cached;
      continue;
    }

    try {
      const buf = await getCachedFile(`blur:${path}`);
      if (buf) {
        const dataUri = buf.toString("utf8");
        result[id] = dataUri;
      }
    } catch {
      // blur not available yet; request will lazy-generate it
    }
  }

  return result;
}
