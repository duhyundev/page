import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ADMIN_USERNAME, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

// Dev fallback password is "duhyunkim" so local `pnpm dev` works out of the box.
// In production set ADMIN_PASSWORD_HASH (bcrypt hash) — see CLAUDE.md.
const DEV_FALLBACK_HASH = bcrypt.hashSync("duhyunkim", 10);

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { username, password } = body;
  if (username !== ADMIN_USERNAME || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH ?? DEV_FALLBACK_HASH;
  const ok = await bcrypt.compare(password, hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
