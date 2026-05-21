#!/usr/bin/env node
// SessionEnd hook: persist this project's session by copying Claude Code's full
// transcript (JSONL) into the repo's sessions/ directory. The raw transcript already
// contains everything — user/assistant messages, tool inputs AND outputs, timestamps.
// Receives the hook payload as JSON on stdin: { session_id, transcript_path, cwd, ... }.
import { readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

let payload = {};
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  /* ignore malformed stdin */
}

const { transcript_path: transcriptPath, session_id: sessionId = "unknown", cwd } = payload;
if (!transcriptPath) process.exit(0);

try {
  const root = cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const outDir = resolve(root, "sessions");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const name = `${stamp}-${sessionId}.jsonl`;
  copyFileSync(transcriptPath, join(outDir, name));
  process.stdout.write(JSON.stringify({ systemMessage: `세션 기록 저장: sessions/${name}` }));
} catch {
  /* never block session end */
}
