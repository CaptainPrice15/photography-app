"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { photoSource } from "@/lib/storage";
import type { Photo } from "@/lib/storage/types";

export interface OrderWithPhoto {
  id: string;
  amount: number;
  status: string;
  stripeId: string | null;
  createdAt: Date;
  photo: Photo | null;
}

export async function getUserOrders(): Promise<OrderWithPhoto[]> {
  const session = await getSession();
  if (!session || !session.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) return [];

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) return [];

  const allPhotos = await photoSource.getAllPhotos();
  const photoMap = new Map(allPhotos.map(p => [p.id, p]));

  return orders.map(order => ({
    id: order.id,
    amount: order.amount,
    status: order.status,
    stripeId: order.stripeId,
    createdAt: order.createdAt,
    photo: order.photoId ? (photoMap.get(order.photoId) ?? null) : null,
  }));
}

export async function getPhotoById(photoId: string): Promise<Photo | null> {
  const allPhotos = await photoSource.getAllPhotos();
  return allPhotos.find(p => p.id === photoId) ?? null;
}
