import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "lumen_session";
const SESSION_DAYS = 7;

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

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return null;
  const session = verify(value);
  if (!session) return null;
  // Strip exp before returning.
  return { email: session.email, role: session.role, paid: session.paid };
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ ...session, exp })).toString("base64url");
  const signed = sign(payload);
  store.set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function updateSession(updates: Partial<Session>): Promise<void> {
  const current = (await getSession()) ?? { email: "", role: "user" as const, paid: false };
  await setSession({ ...current, ...updates });
}

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export async function markPaid(): Promise<void> {
  await updateSession({ paid: true });
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

  const session: Session = isAdmin
    ? { email: trimmed, role: "admin", paid: true }
    : { email: trimmed, role: "user", paid: false };

  await setSession(session);
  return { ok: true, session };
}
