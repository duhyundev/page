"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Kbd,
  readMinutes,
  SaveStatus,
  StatusBadge,
  WordCount,
  countWords,
  type SaveState,
} from "./atoms";

export type EditorPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  date: string;
  published: boolean;
};

const AUTOSAVE_MS = 800;

export function EditorCombo({ post }: { post: EditorPost }) {
  const router = useRouter();

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [date, setDate] = useState(post.date);
  const [published, setPublished] = useState(post.published);
  const [content, setContent] = useState(post.content); // 마크다운 원문 = 단일 진실

  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [savedAgo, setSavedAgo] = useState(0);

  const words = countWords(content);

  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 항상 최신 폼 값을 저장 함수에서 읽도록 ref로 미러링 (디바운스 클로저 문제 방지)
  const formRef = useRef({ title, slug, excerpt, date, content });
  formRef.current = { title, slug, excerpt, date, content };

  const save = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dirtyRef.current = false;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formRef.current),
      });
      if (!res.ok) throw new Error("save failed");
      const { post: updated } = await res.json();
      if (updated?.slug && updated.slug !== formRef.current.slug) setSlug(updated.slug);
      setSaveState("saved");
      setSavedAgo(0);
    } catch {
      setSaveState("unsaved");
    }
  }, [post.id]);

  // 어떤 필드든 바뀌면 dirty 표시 + 디바운스 autosave 재무장
  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setSaveState("unsaved");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void save(), AUTOSAVE_MS);
  }, [save]);

  // "Saved · Ns ago" 카운터
  useEffect(() => {
    if (saveState !== "saved") return;
    const t = setInterval(() => setSavedAgo((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [saveState]);

  const goBack = useCallback(() => {
    router.push("/admin");
    router.refresh();
  }, [router]);

  const togglePublish = useCallback(async () => {
    const next = !published;
    setPublished(next);
    await save();
    await fetch(`/api/admin/posts/${post.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: next }),
    });
  }, [published, save, post.id]);

  // 키보드: ⌘S 저장 · ⌘⇧P 발행 · Esc 뒤로
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      } else if (meta && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        void togglePublish();
      } else if (e.key === "Escape") {
        goBack();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, togglePublish, goBack]);

  // 언마운트 시 미저장분 flush
  useEffect(() => {
    return () => {
      if (dirtyRef.current) void save();
    };
  }, [save]);

  return (
    <div className="admin-root" style={{ display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 24px",
          borderBottom: "1px solid var(--admin-divider)",
        }}
      >
        <button type="button" className="btn btn--ghost" style={{ padding: "4px 8px" }} onClick={goBack}>
          ← Posts
        </button>
        <SaveStatus state={saveState} agoSec={savedAgo} />
        <div style={{ marginLeft: "auto" }} className="row-gap-12">
          <WordCount words={words} />
          <StatusBadge status={published ? "published" : "draft"} />
          <button type="button" className="btn" onClick={goBack}>
            Done
          </button>
          <button type="button" className="btn btn--primary" onClick={togglePublish}>
            {published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", minHeight: 0 }}>
        <main style={{ overflowY: "auto", padding: "32px 24px 80px" }}>
          <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
            <input
              className="editor-title-input"
              value={title}
              placeholder="제목"
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
            />
            <textarea
              value={content}
              placeholder="여기에 마크다운으로 본문을 씁니다."
              spellCheck={false}
              onChange={(e) => {
                setContent(e.target.value);
                markDirty();
              }}
              style={{
                width: "100%",
                minHeight: "60vh",
                border: "none",
                outline: "none",
                background: "transparent",
                resize: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "1.0625rem",
                lineHeight: 1.75,
                color: "var(--foreground)",
              }}
            />
          </div>
        </main>

        <aside className="meta-panel">
          <div className="meta-section">
            <span className="meta-label">Status</span>
            <div className="row-gap-8">
              <StatusBadge status={published ? "published" : "draft"} />
              <button
                type="button"
                className="btn btn--ghost"
                style={{ marginLeft: "auto", fontSize: 12, padding: "4px 8px" }}
                onClick={togglePublish}
              >
                Change
              </button>
            </div>
          </div>

          <div className="meta-section">
            <span className="meta-label">Slug</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                markDirty();
              }}
              onBlur={() => void save()}
            />
          </div>

          <div className="meta-section">
            <span className="meta-label">Excerpt</span>
            <textarea
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div className="meta-section">
            <span className="meta-label">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div
            className="meta-section"
            style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--admin-divider)" }}
          >
            <span className="meta-label">Stats</span>
            <span className="meta-value" style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
              {words.toLocaleString()} words · {readMinutes(words)} min
            </span>
          </div>
        </aside>
      </div>

      <footer className="admin-statusbar">
        <span>
          Auto-save on ·{" "}
          {saveState === "saved"
            ? `Last saved ${savedAgo}s ago`
            : saveState === "saving"
              ? "Saving…"
              : "Unsaved changes"}
        </span>
        <div className="statusbar-right">
          <span>
            <Kbd>⌘S</Kbd> save · <Kbd>⌘⇧P</Kbd> publish · <Kbd>Esc</Kbd> back
          </span>
        </div>
      </footer>
    </div>
  );
}
