import { jwtVerify, SignJWT } from "jose";

// Single-user admin. Username is a UX flourish (terminal login); the real
// boundary is the bcrypt password check + signed session cookie.
export const ADMIN_USERNAME = "duhyunkim";
export const SESSION_COOKIE = "admin_session";
const SESSION_TTL = "30d";

// Dev fallback keeps local `pnpm dev` working without env setup. In production
// set AUTH_SECRET (any long random string) so sessions survive restarts.
function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

/** Sign a session token for the single admin user. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(ADMIN_USERNAME)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

/** Verify a session token. Returns true when valid & not expired. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
