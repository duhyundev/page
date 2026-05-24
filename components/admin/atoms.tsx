// Admin atoms — Kbd, StatusBadge, TagChip, Avatar, SaveStatus, WordCount.
// Ported from the design bundle (ui_kits/admin/components/shared.jsx).
import type { ReactNode } from "react";
import { I } from "./icons";

export type PostStatus = "draft" | "published" | "scheduled";
export type SaveState = "saved" | "saving" | "unsaved";

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

const STATUS_MAP: Record<PostStatus | "unsaved", { label: string; dot: string }> = {
  draft: { label: "Draft", dot: "draft" },
  published: { label: "Published", dot: "published" },
  scheduled: { label: "Scheduled", dot: "scheduled" },
  unsaved: { label: "Unsaved", dot: "unsaved" },
};

export function StatusBadge({ status }: { status: PostStatus | "unsaved" }) {
  const m = STATUS_MAP[status] ?? STATUS_MAP.draft;
  return (
    <span className="status-badge">
      <span className={`status-dot status-dot--${m.dot}`} />
      {m.label}
    </span>
  );
}

export function TagChip({ children }: { children: ReactNode }) {
  return <span className="tag-chip">{children}</span>;
}

export function SaveStatus({
  state = "saved",
  agoSec = 2,
}: {
  state?: SaveState;
  agoSec?: number;
}) {
  if (state === "saving") {
    return (
      <span className="muted" style={{ fontSize: 12 }}>
        Saving…
      </span>
    );
  }
  if (state === "unsaved") {
    return (
      <span style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span className="status-dot status-dot--unsaved" />
        <span style={{ color: "var(--accent)" }}>Unsaved</span>
      </span>
    );
  }
  return (
    <span
      className="muted"
      style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <I.check size={12} />
      Saved · {agoSec}s ago
    </span>
  );
}

export function readMinutes(words: number) {
  return Math.max(1, Math.round(words / 220));
}

export function WordCount({ words = 0 }: { words?: number }) {
  return (
    <span className="muted" style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>
      {words.toLocaleString()} words · {readMinutes(words)} min read
    </span>
  );
}

export function Avatar({ size = 24 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-signature)",
        color: "#fff",
        fontSize: size * 0.46,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      D
    </span>
  );
}

/** Word count from plain text — shared by list rows and the editor strip. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
