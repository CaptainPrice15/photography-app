import { Router } from "express";
import { getSession, setSession, clearSession, login, register } from "../lib/auth.js";
import type { AuthState } from "@lumen/shared";

const REGISTER_MESSAGES: Record<string, string> = {
  INVALID_EMAIL: "Enter a valid email address.",
  WEAK_PASSWORD: "Password must be at least 8 characters.",
  MISMATCH: "Passwords do not match.",
  EMAIL_EXISTS: "An account with this email already exists.",
  ADMIN_RESERVED: "This email is reserved.",
  SERVER_ERROR: "Something went wrong. Please try again.",
};

const router = Router();

router.get("/session", (req, res) => {
  const session = getSession(req);
  res.json({ session });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password);

  if (!result.ok) {
    res.status(401).json({ status: "error", message: result.error } as AuthState);
    return;
  }

  setSession(res, result.session);
  res.json({ status: "success", session: result.session } as AuthState);
});

router.post("/register", async (req, res) => {
  const { email, password, confirm } = req.body;
  const result = await register(email, password, confirm);

  if (!result.ok) {
    const error = result.error;
    const message = REGISTER_MESSAGES[error] ?? "Registration failed.";
    res.status(400).json({ status: "error", message } as AuthState);
    return;
  }

  setSession(res, result.session);
  res.json({ status: "success", session: result.session } as AuthState);
});

router.post("/logout", (_req, res) => {
  clearSession(res);
  res.json({ status: "success" });
});

export { router as authRouter };