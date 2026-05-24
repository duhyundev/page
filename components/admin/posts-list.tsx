"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { countWords, Kbd, StatusBadge } from "./atoms";
import { Sidebar, StatusBar, Topbar } from "./chrome";

export type AdminPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  date: string;
  published: boolean;
};

export function PostsList({ posts }: { posts: AdminPost[] }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selected, setSelected] = useState(0);
  const [creating, setCreating] = useState(false);

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.length - publishedCount;

  const open = useCallback((id: number) => router.push(`/admin/posts/${id}`), [router]);

  const createPost = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/posts", { method: "POST" });
      if (res.ok) {
        const { post } = await res.json();
        router.push(`/admin/posts/${post.id}`);
      }
    } finally {
      setCreating(false);
    }
  }, [creating, router]);

  // Keyboard: ⌘B sidebar · J/K navigate · E edit · C new
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((v) => !v);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((i) => Math.min(i + 1, posts.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((i) => Math.max(i - 1, 0));
      } else if (e.key === "e" || e.key === "Enter") {
        const p = posts[selected];
        if (p) open(p.id);
      } else if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        void createPost();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [posts, selected, open, createPost]);

  return (
    <div className="admin-root">
      <div className={`admin-shell${sidebarOpen ? "" : " is-collapsed"}`}>
        <Sidebar postCount={posts.length} />
        <div className="admin-main">
          <Topbar
            crumbs={["Posts"]}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
          <div className="admin-content" style={{ padding: "48px 48px 80px" }}>
            <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.015em" }}>
                  All posts
                </h1>
                <span className="muted" style={{ fontSize: 13 }}>
                  {posts.length} · {publishedCount} published · {draftCount} drafts
                </span>
              </div>
              <p className="muted" style={{ margin: "0 0 40px", fontSize: 16, lineHeight: 1.6 }}>
                글 목록입니다. <Kbd>C</Kbd> 새 글 · <Kbd>J</Kbd>/<Kbd>K</Kbd> 이동 · <Kbd>E</Kbd>{" "}
                편집.
              </p>

              {posts.length === 0 ? (
                <p className="muted">
                  아직 글이 없습니다. <Kbd>C</Kbd> 로 첫 글을 시작하세요.
                </p>
              ) : (
                <div className="post-list-spacious">
                  {posts.map((p, idx) => (
                    <article
                      key={p.id}
                      className={`post-row${idx === selected ? " is-selected" : ""}`}
                      onClick={() => {
                        setSelected(idx);
                        open(p.id);
                      }}
                    >
                      <div className="row-gap-12">
                        <StatusBadge status={p.published ? "published" : "draft"} />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            color: "var(--muted)",
                          }}
                        >
                          {p.date}
                        </span>
                        <span
                          className="muted"
                          style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                        >
                          · {countWords(p.content).toLocaleString()} words
                        </span>
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 20,
                          fontWeight: 600,
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {p.title}
                      </h3>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
          <StatusBar
            left={<span>{posts.length} posts</span>}
            right={
              <span>
                <Kbd>J</Kbd>/<Kbd>K</Kbd> navigate · <Kbd>E</Kbd> edit · <Kbd>⌘B</Kbd> sidebar
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}
