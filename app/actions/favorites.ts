"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { photoSource } from "@/lib/storage";
import type { Photo } from "@/lib/storage/types";

export async function toggleFavorite(photoId: string) {
  const session = await getSession();
  if (!session || !session.email) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return { error: "User not found" };
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
      where: {
        id: existing.id,
      },
    });
  } else {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        photoId,
      },
    });
  }

  revalidatePath("/gallery");
  revalidatePath("/collections");
  revalidatePath("/favourites");

  return { success: true };
}

export async function getFavorites() {
  const session = await getSession();
  if (!session || !session.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) return [];

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { photoId: true },
  });

  return favorites.map(f => f.photoId);
}

export async function getFavoritePhotos(): Promise<Photo[]> {
  const session = await getSession();
  if (!session || !session.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) return [];

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { photoId: true },
  });

  if (favorites.length === 0) return [];

  const favIds = new Set(favorites.map(f => f.photoId));
  const allPhotos = await photoSource.getAllPhotos();
  return allPhotos.filter(p => favIds.has(p.id));
}
