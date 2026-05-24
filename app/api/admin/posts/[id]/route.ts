import { NextResponse } from "next/server";
import { deletePost, getPostById, type UpdatablePostFields, updatePost } from "@/lib/posts";

export const runtime = "nodejs";

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Partial update (used by autosave + meta panel). Body: UpdatablePostFields
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseId(id);
  if (postId == null) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  let body: UpdatablePostFields;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const allowed: UpdatablePostFields = {};
  for (const key of ["title", "slug", "excerpt", "content", "date", "published"] as const) {
    if (key in body) (allowed as Record<string, unknown>)[key] = body[key];
  }

  const post = updatePost(postId, allowed);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseId(id);
  if (postId == null) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  const post = getPostById(postId);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseId(id);
  if (postId == null) return NextResponse.json({ error: "Bad id" }, { status: 400 });
  deletePost(postId);
  return NextResponse.json({ ok: true });
}
