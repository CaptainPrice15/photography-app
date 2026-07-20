import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Retrieve the user ID and photo ID from the metadata
    const userId = session.metadata?.userId;
    const photoId = session.metadata?.photoId;

    if (userId && photoId) {
      await prisma.order.create({
        data: {
          userId,
          amount: session.amount_total || 0,
          status: "paid",
          stripeId: session.id,
        },
      });

      // Optionally, you could set `user.paid = true` if the site is a subscription,
      // but here we just record the order. For single downloads, the order gives access.
    }
  }

  return new NextResponse(null, { status: 200 });
}
