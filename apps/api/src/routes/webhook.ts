import { Router } from "express";
import { stripe } from "../lib/stripe.js";
import { prisma } from "../lib/db.js";

const router = Router();

router.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  if (!req.rawBody) {
    return res.status(400).send("Missing raw body");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const photoId = session.metadata?.photoId;

    if (userId && photoId) {
      await prisma.order.create({
        data: {
          userId,
          photoId,
          amount: session.amount_total || 0,
          status: "paid",
          stripeId: session.id,
        },
      });
    }
  }

  res.status(200).send();
});

export { router as webhookRouter };