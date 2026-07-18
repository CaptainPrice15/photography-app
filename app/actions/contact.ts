"use server";

import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Message should be at least 10 characters."),
});

export interface ContactState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  // Demo handler: in production, send via Resend / SMTP here.
  // e.g. await resend.emails.send({ ... })
  console.log("Contact submission:", parsed.data);

  return {
    status: "success",
    message: "Thanks! Your message has been received.",
  };
}
