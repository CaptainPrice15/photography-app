import { Router } from "express";
import { prisma } from "../lib/db.js";
import { getSession } from "../lib/auth.js";
import { photoSource } from "../lib/storage/index.js";
import { stripe } from "../lib/stripe.js";
import type { Photo } from "@lumen/shared";

const router = Router();

interface OrderWithPhoto {
  id: string;
  amount: number;
  status: string;
  stripeId: string | null;
  createdAt: string;
  photo: Photo | null;
}

router.get("/orders", async (req, res) => {
  const session = getSession(req);
  if (!session || !session.email) {
    return res.json([]);
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return res.json([]);
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return res.json([]);
  }

  const allPhotos = await photoSource.getAllPhotos();
  const photoMap = new Map(allPhotos.map((p) => [p.id, p]));

  const result: OrderWithPhoto[] = orders.map((order) => ({
    id: order.id,
    amount: order.amount,
    status: order.status,
    stripeId: order.stripeId,
    createdAt: order.createdAt.toISOString(),
    photo: order.photoId ? (photoMap.get(order.photoId) ?? null) : null,
  }));

  res.json(result);
});

router.post("/checkout", async (req, res) => {
  const session = getSession(req);
  if (!session || !session.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { photoId, title } = req.body;

  if (!photoId || !title) {
    return res.status(400).json({ error: "Missing photoId or title" });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `High-Res Download: ${title}`,
              images: [],
            },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.SITE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || "http://localhost:3000"}/gallery`,
      metadata: {
        userId: user.id,
        photoId,
      },
    });

    res.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout session creation failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/photo/:photoId", async (req, res) => {
  const allPhotos = await photoSource.getAllPhotos();
  const photo = allPhotos.find((p) => p.id === req.params.photoId) ?? null;
  res.json(photo);
});

export { router as paymentRouter };