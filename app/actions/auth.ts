"use server";

import { login, clearSession, type Session } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface AuthState {
  status: "idle" | "success" | "error";
  message: string;
  session?: Session;
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const result = await login(email, password);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  redirect("/gallery");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
