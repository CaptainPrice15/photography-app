import { promises as fs } from "node:fs";
import path from "node:path";
import type { Collection, Photo, PhotoSource } from "./types";

const MANIFEST = path.join(process.cwd(), "public", "photos", "manifest.json");

async function load(): Promise<Collection[]> {
  const raw = await fs.readFile(MANIFEST, "utf8");
  const data = JSON.parse(raw) as { collections: Collection[] };
  return data.collections;
}

export const localSource: PhotoSource = {
  async getCollections() {
    return load();
  },
  async getCollection(slug: string) {
    const all = await load();
    return all.find((c) => c.slug === slug) ?? null;
  },
  async getFeatured() {
    const all = await load();
    return all.flatMap((c) => c.photos).filter((p) => p.featured);
  },
  async getAllPhotos(): Promise<Photo[]> {
    const all = await load();
    return all.flatMap((c) => c.photos);
  },
};
