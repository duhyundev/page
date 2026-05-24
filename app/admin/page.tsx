import { type AdminPost, PostsList } from "@/components/admin/posts-list";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata = { title: "Posts · admin" };

export default function AdminPostsPage() {
  const posts: AdminPost[] = getAllPosts().map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    date: p.date,
    published: p.published,
  }));
  return <PostsList posts={posts} />;
}
