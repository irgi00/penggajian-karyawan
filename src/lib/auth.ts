import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { pool } from "./db";
import { COOKIE_NAME, COOKIE_MAX_AGE, JWT_EXPIRES, getJwtSecret } from "./config";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function signJWT(payload: JwtPayload): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES });
}

export function verifyJWT(token: string): JwtPayload | null {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

async function clearSessionSafely() {
  try {
    await clearSessionCookie();
  } catch {
    // Ignore cookie mutation failures in read-only render contexts.
  }
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyJWT(token);
  if (!payload) {
    await clearSessionSafely();
    return null;
  }

  try {
    const result = await pool.query(
      "SELECT id, email, role, is_active FROM users WHERE id = $1",
      [payload.id]
    );

    if (result.rowCount === 0) {
      await clearSessionSafely();
      return null;
    }

    const user = result.rows[0];
    if (!user.is_active || user.role !== payload.role || user.email !== payload.email) {
      await clearSessionSafely();
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
