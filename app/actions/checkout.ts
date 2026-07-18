"use server";

import { getSession, markPaid } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface CheckoutState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const file = formData.get("file")?.toString() ?? "";
  const returnTo = `/checkout?file=${encodeURIComponent(file)}`;
  const session = await getSession();

  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (!session.paid) {
    // Demo payment step. Replace with real Stripe checkout + webhook here.
    await markPaid();
  }

  redirect(`/api/download/${file}`);
}
