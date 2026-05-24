import { NextResponse } from "next/server";
import { setPublished } from "@/lib/posts";

export const runtime = "nodejs";

// Toggle publish state. Body: { published: boolean }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ error: "Bad id" }, { status: 400 });
  }
  let published = true;
  try {
    const body = await req.json();
    if (typeof body.published === "boolean") published = body.published;
  } catch {
    // default to publishing
  }
  const post = setPublished(postId, published);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}
