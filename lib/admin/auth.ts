import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ac_admin_token";
const encoder = new TextEncoder();

export type AdminPayload = {
  sub: string;   // admin_users.id
  email: string;
  role: string;
};

function secretBytes(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not set.");
  return encoder.encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function signAdminJWT(payload: AdminPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretBytes());
}

export async function verifyAdminJWT(token: string | undefined): Promise<AdminPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretBytes());
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromCookie(): Promise<AdminPayload | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyAdminJWT(token);
}

export function setAdminCookie(token: string) {
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminCookie() {
  cookies().delete(ADMIN_COOKIE);
}

export function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
