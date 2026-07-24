import { Router } from "express";
import { photoSource } from "../lib/storage/index.js";

const router = Router();

router.get("/collections", async (_req, res) => {
  try {
    const collections = await photoSource.getCollections();
    res.json(collections);
  } catch (err) {
    console.error("[photos] collections failed:", err);
    res.status(500).json({ error: "Failed to load collections" });
  }
});

router.get("/collections/:slug", async (req, res) => {
  try {
    const collection = await photoSource.getCollection(req.params.slug);
    if (!collection) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }
    res.json(collection);
  } catch (err) {
    console.error("[photos] collection failed:", err);
    res.status(500).json({ error: "Failed to load collection" });
  }
});

router.get("/featured", async (_req, res) => {
  try {
    const featured = await photoSource.getFeatured();
    res.json(featured);
  } catch (err) {
    console.error("[photos] featured failed:", err);
    res.status(500).json({ error: "Failed to load featured" });
  }
});

router.get("/all", async (_req, res) => {
  try {
    const all = await photoSource.getAllPhotos();
    res.json(all);
  } catch (err) {
    console.error("[photos] all failed:", err);
    res.status(500).json({ error: "Failed to load photos" });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const rawLimit = Number.parseInt(req.query.limit as string, 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 60) : 12;
    const latest = await photoSource.getLatest(limit);
    res.json(latest);
  } catch (err) {
    console.error("[photos] latest failed:", err);
    res.status(500).json({ error: "Failed to load latest photos" });
  }
});

export { router as photosMetaRouter };
