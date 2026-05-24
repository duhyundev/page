import { NextResponse } from "next/server";
import { createPost } from "@/lib/posts";

export const runtime = "nodejs";

// Create a new draft. Body: { title?: string }
export async function POST(req: Request) {
  let body: { title?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine — creates an untitled draft
  }
  const post = createPost({ title: body.title });
  return NextResponse.json({ post }, { status: 201 });
}
