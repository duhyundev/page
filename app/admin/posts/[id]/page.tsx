import { notFound } from "next/navigation";
import { EditorCombo, type EditorPost } from "@/components/admin/editor";
import { getPostById } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata = { title: "Editor · admin" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const post = getPostById(postId);
  if (!post) notFound();

  const editorPost: EditorPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    date: post.date,
    published: post.published,
  };

  return <EditorCombo post={editorPost} />;
}
