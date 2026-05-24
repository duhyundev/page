import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { type Post, posts } from "@/db/schema";
import { slugify } from "./slug";

export { slugify } from "./slug";

// ---------- Public read path (site) ----------

export function getPublishedPosts(): Post[] {
  return db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.date)).all();
}

export function getPostBySlug(slug: string): Post | undefined {
  return db.select().from(posts).where(eq(posts.slug, slug)).get();
}

// ---------- Admin (CRUD) ----------

/** All posts, newest first — drafts included. Used by the admin list. */
export function getAllPosts(): Post[] {
  return db.select().from(posts).orderBy(desc(posts.date)).all();
}

export function getPostById(id: number): Post | undefined {
  return db.select().from(posts).where(eq(posts.id, id)).get();
}

/** Ensure a slug is unique (suffixes -2, -3, … on collision). */
function uniqueSlug(desired: string, ignoreId?: number): string {
  let candidate = desired;
  let n = 1;
  while (true) {
    const existing = db.select().from(posts).where(eq(posts.slug, candidate)).get();
    if (!existing || existing.id === ignoreId) return candidate;
    n += 1;
    candidate = `${desired}-${n}`;
  }
}

export function createPost(input?: { title?: string }): Post {
  const title = input?.title?.trim() || "제목 없는 글";
  const slug = uniqueSlug(slugify(title));
  const now = new Date();
  return db
    .insert(posts)
    .values({
      slug,
      title,
      excerpt: "",
      content: "",
      date: now.toISOString().slice(0, 10),
      published: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

export type UpdatablePostFields = Partial<
  Pick<Post, "title" | "slug" | "excerpt" | "content" | "date" | "published">
>;

export function updatePost(id: number, fields: UpdatablePostFields): Post | undefined {
  const patch: UpdatablePostFields & { updatedAt: Date } = {
    ...fields,
    updatedAt: new Date(),
  };
  if (fields.slug != null) {
    patch.slug = uniqueSlug(slugify(fields.slug), id);
  }
  return db.update(posts).set(patch).where(eq(posts.id, id)).returning().get();
}

export function setPublished(id: number, published: boolean): Post | undefined {
  return db
    .update(posts)
    .set({ published, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning()
    .get();
}

export function deletePost(id: number): void {
  db.delete(posts).where(eq(posts.id, id)).run();
}
