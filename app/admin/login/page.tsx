"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ADMIN_USERNAME } from "@/lib/auth";

type Row = { type: "muted" | "err" | "ok" | "cmd" | "pw-echo"; text: string } | { type: "blank" };

type Mode = "cmd" | "pw" | "connecting" | "auth";

export default function TerminalLoginPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Row[]>([
    { type: "muted", text: "duhyunkim.page admin — single user — zsh" },
    { type: "blank" },
  ]);
  const [mode, setMode] = useState<Mode>("cmd");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current && (mode === "cmd" || mode === "pw")) {
      inputRef.current.focus();
    }
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, mode]);

  function push(...rows: Row[]) {
    setHistory((h) => [...h, ...rows]);
  }

  async function authenticate(password: string) {
    setMode("connecting");
    push({ type: "muted", text: "Connecting…" });
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ADMIN_USERNAME, password }),
      });
      if (!res.ok) {
        push({ type: "err", text: "login: authentication failed" });
        setMode("pw");
        return;
      }
      push({ type: "ok", text: "✓ Authenticated. Loading workspace." });
      setMode("auth");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 600);
    } catch {
      push({ type: "err", text: "login: connection error" });
      setMode("pw");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "cmd") {
      const cmd = input.trim();
      push({ type: "cmd", text: cmd });
      setInput("");
      if (cmd === "") return;

      if (cmd === `login ${ADMIN_USERNAME}`) {
        push({ type: "muted", text: `User: ${ADMIN_USERNAME}` });
        setMode("pw");
        return;
      }
      if (cmd === "clear") {
        setHistory([{ type: "blank" }]);
        return;
      }
      const parts = cmd.split(/\s+/);
      const head = parts[0];
      if (head === "login") {
        if (parts.length < 2) {
          push({ type: "err", text: "login: usage: login <username>" });
        } else {
          push({
            type: "err",
            text: `login: user not found: ${parts.slice(1).join(" ")}`,
          });
        }
        return;
      }
      push({ type: "err", text: `zsh: command not found: ${head}` });
      return;
    }

    if (mode === "pw") {
      const pw = input;
      push({ type: "pw-echo", text: `Password: ${"●".repeat(Math.max(pw.length, 1))}` });
      setInput("");
      if (pw.length === 0) {
        push({ type: "err", text: "Empty password." });
        return;
      }
      void authenticate(pw);
    }
  }

  const promptVisible = mode === "cmd" || mode === "pw";

  return (
    <div
      ref={scrollRef}
      onClick={() => inputRef.current?.focus()}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-mono)",
        fontSize: 14,
        lineHeight: 1.7,
        padding: "60px 80px 80px",
        overflowY: "auto",
        cursor: "text",
      }}
    >
      {history.map((row, i) => {
        if (row.type === "blank") return <div key={i} style={{ height: 12 }} />;
        if (row.type === "muted")
          return (
            <div key={i} className="muted">
              {row.text}
            </div>
          );
        if (row.type === "err" || row.type === "ok")
          return (
            <div key={i} style={{ color: "var(--accent)" }}>
              {row.text}
            </div>
          );
        if (row.type === "pw-echo") return <div key={i}>{row.text}</div>;
        return (
          <div key={i}>
            <span style={{ color: "var(--accent)" }}>~/admin</span> $ {row.text}
          </div>
        );
      })}

      {promptVisible && (
        <form onSubmit={onSubmit}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            {mode === "cmd" ? (
              <>
                <span style={{ color: "var(--accent)" }}>~/admin</span>
                <span>&nbsp;$&nbsp;</span>
              </>
            ) : (
              <span>Password:&nbsp;</span>
            )}
            <input
              ref={inputRef}
              type={mode === "pw" ? "password" : "text"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="off"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                font: "inherit",
                color: "inherit",
                letterSpacing: mode === "pw" ? "0.2em" : "normal",
                padding: 0,
              }}
            />
          </div>
        </form>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 80,
          color: "var(--muted)",
          fontSize: 12,
        }}
      >
        Press <kbd className="kbd">↵</kbd> to submit
      </div>
    </div>
  );
}
