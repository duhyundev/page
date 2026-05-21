import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, type Post } from "@/db/schema";

export function getPublishedPosts(): Post[] {
  return db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.date))
    .all();
}

export function getPostBySlug(slug: string): Post | undefined {
  return db.select().from(posts).where(eq(posts.slug, slug)).get();
}
