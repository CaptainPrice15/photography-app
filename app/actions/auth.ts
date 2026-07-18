"use server";

import { login, register, clearSession, type Session } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface AuthState {
  status: "idle" | "success" | "error";
  message: string;
  session?: Session;
}

const REGISTER_MESSAGES: Record<string, string> = {
  INVALID_EMAIL: "Enter a valid email address.",
  WEAK_PASSWORD: "Password must be at least 8 characters.",
  MISMATCH: "Passwords do not match.",
  EMAIL_EXISTS: "An account with this email already exists.",
  ADMIN_RESERVED: "This email is reserved.",
  SERVER_ERROR: "Something went wrong. Please try again.",
};

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const returnTo = formData.get("returnTo")?.toString();

  const result = await login(email, password);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  redirect(returnTo && returnTo.startsWith("/") ? returnTo : "/gallery");
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";
  const returnTo = formData.get("returnTo")?.toString();

  const result = await register(email, password, confirm);
  if (!result.ok) {
    return { status: "error", message: REGISTER_MESSAGES[result.error] ?? "Registration failed." };
  }

  redirect(returnTo && returnTo.startsWith("/") ? returnTo : "/gallery");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
