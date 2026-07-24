import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";

const COOKIE_NAME = "lumen_session";
const SESSION_DAYS = 7;
const MIN_PASSWORD = 8;
const BCRYPT_COST = 12;

export interface Session {
  email: string;
  role: "admin" | "user";
  paid: boolean;
}

interface SignedSession extends Session {
  exp: number;
}

function secret(): string {
  const key = process.env.AUTH_SECRET;
  if (!key) {
    throw new Error("AUTH_SECRET environment variable is required for sessions.");
  }
  return key;
}

function sign(payload: string): string {
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verify(value: string): SignedSession | null {
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as SignedSession;
    if (!parsed.email || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSession(req: Request): Session | null {
  const raw = (req as any).headers.cookie;
  if (!raw) return null;

  const parsed = Object.fromEntries(
    raw.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );

  const value = parsed[COOKIE_NAME];
  if (!value) return null;

  const session = verify(value);
  if (!session) return null;
  return { email: session.email, role: session.role, paid: session.paid };
}

export function setSession(res: Response, session: Session): void {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ ...session, exp })).toString("base64url");
  const signed = sign(payload);

  (res as any).cookie(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSession(res: Response): void {
  (res as any).clearCookie(COOKIE_NAME, { path: "/" });
}

export function updateSession(res: Response, updates: Partial<Session>, req: Request): void {
  const current = getSession(req) ?? { email: "", role: "user" as const, paid: false };
  setSession(res, { ...current, ...updates });
}

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export function markPaid(res: Response, req: Request): void {
  updateSession(res, { paid: true }, req);
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !password || password.length < 4) {
    return { ok: false, error: "Enter a valid email and password." };
  }

  const isAdmin =
    trimmed === (process.env.ADMIN_EMAIL ?? "").toLowerCase() &&
    password === process.env.ADMIN_PASSWORD;

  if (isAdmin) {
    const session: Session = { email: trimmed, role: "admin", paid: true };
    return { ok: true, session };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: trimmed } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const session: Session = {
        email: user.email,
        role: user.role === "admin" ? "admin" : "user",
        paid: user.paid,
      };
      return { ok: true, session };
    }
  } catch (err) {
    console.error("login db lookup failed:", err);
  }

  return { ok: false, error: "Invalid email or password." };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type RegisterError =
  | "INVALID_EMAIL"
  | "WEAK_PASSWORD"
  | "MISMATCH"
  | "EMAIL_EXISTS"
  | "ADMIN_RESERVED"
  | "SERVER_ERROR";

export async function register(
  email: string,
  password: string,
  confirm: string
): Promise<{ ok: true; session: Session } | { ok: false; error: RegisterError }> {
  const trimmed = normalizeEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "INVALID_EMAIL" };
  }
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: "WEAK_PASSWORD" };
  }
  if (password !== confirm) {
    return { ok: false, error: "MISMATCH" };
  }

  if (trimmed === (process.env.ADMIN_EMAIL ?? "").toLowerCase()) {
    return { ok: false, error: "ADMIN_RESERVED" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: trimmed } });
    if (existing) {
      return { ok: false, error: "EMAIL_EXISTS" };
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const user = await prisma.user.create({
      data: { email: trimmed, passwordHash, role: "user", paid: false },
    });

    const session: Session = { email: user.email, role: "user", paid: false };
    return { ok: true, session };
  } catch (err) {
    console.error("registration failed:", err);
    return { ok: false, error: "SERVER_ERROR" };
  }
}
