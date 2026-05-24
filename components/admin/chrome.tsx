"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { I } from "./icons";
import { Kbd } from "./atoms";

export function Brand() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 8px",
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: "-0.015em",
      }}
    >
      <I.brand />
      duhyunkim
      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, marginLeft: 4 }}>
        · admin
      </span>
    </div>
  );
}

/** Dark-mode toggle button — mirrors components/theme-toggle.tsx behaviour. */
function DarkToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="admin-sidebar-iconbtn"
      style={{ marginLeft: "auto" }}
      onClick={toggle}
    >
      {mounted ? (
        dark ? (
          <I.sun size={14} />
        ) : (
          <I.moon size={14} />
        )
      ) : (
        <span style={{ width: 14, height: 14 }} />
      )}
    </button>
  );
}

export function Sidebar({ postCount }: { postCount?: number }) {
  const router = useRouter();

  async function newPost() {
    const res = await fetch("/api/admin/posts", { method: "POST" });
    if (res.ok) {
      const { post } = await res.json();
      router.push(`/admin/posts/${post.id}`);
    }
  }

  return (
    <aside className="admin-sidebar">
      <Brand />

      <div className="admin-sidebar-section" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn btn--primary"
          style={{ justifyContent: "center" }}
          onClick={newPost}
        >
          <I.plus size={14} /> New post
          <Kbd>C</Kbd>
        </button>
      </div>

      <div className="admin-sidebar-section">
        <Link href="/admin" className="admin-nav-item is-active">
          <I.file size={15} />
          Posts
          {postCount != null && <span className="nav-count">{postCount}</span>}
        </Link>
      </div>

      <div style={{ flex: 1 }} />

      <div className="admin-sidebar-footer">
        <span style={{ fontSize: 13 }}>Dark mode</span>
        <DarkToggle />
      </div>
    </aside>
  );
}

export function Topbar({
  crumbs = ["Posts"],
  rightSlot,
  onToggleSidebar,
  sidebarOpen = true,
}: {
  crumbs?: string[];
  rightSlot?: ReactNode;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}) {
  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="btn btn--ghost"
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        onClick={onToggleSidebar}
        style={{ padding: "6px 8px" }}
      >
        <I.sidebar size={15} />
      </button>
      <nav className="crumb">
        {crumbs.map((c, i) => (
          <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span className="crumb-sep">/</span>}
            <span className={i === crumbs.length - 1 ? "crumb-active" : ""}>{c}</span>
          </span>
        ))}
      </nav>
      <div className="topbar-right">{rightSlot}</div>
    </header>
  );
}

export function StatusBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <footer className="admin-statusbar">
      {left}
      <div className="statusbar-right">{right}</div>
    </footer>
  );
}
