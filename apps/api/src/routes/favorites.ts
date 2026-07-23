import { Router } from "express";
import { prisma } from "../lib/db.js";
import { getSession } from "../lib/auth.js";
import { photoSource } from "../lib/storage/index.js";
import type { Photo } from "@lumen/shared";

const router = Router();

router.get("/favorites", async (req, res) => {
  const session = getSession(req);
  if (!session || !session.email) {
    return res.json([]);
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return res.json([]);
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { photoId: true },
  });

  res.json(favorites.map((f) => f.photoId));
});

router.post("/favorites/toggle", async (req, res) => {
  const session = getSession(req);
  if (!session || !session.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { photoId } = req.body;
  if (!photoId) {
    return res.status(400).json({ error: "Missing photoId" });
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_photoId: {
        userId: user.id,
        photoId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        photoId,
      },
    });
  }

  res.json({ success: true });
});

router.get("/favorites/photos", async (req, res) => {
  const session = getSession(req);
  if (!session || !session.email) {
    return res.json([]);
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return res.json([]);
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { photoId: true },
  });

  if (favorites.length === 0) {
    return res.json([]);
  }

  const favIds = new Set(favorites.map((f) => f.photoId));
  const allPhotos = await photoSource.getAllPhotos();
  const result = allPhotos.filter((p) => favIds.has(p.id));

  res.json(result);
});

export { router as favoritesRouter };