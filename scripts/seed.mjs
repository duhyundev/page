// Pure-Node seed: applies migrations and upserts content/*.md into SQLite.
// Uses only runtime deps (better-sqlite3, drizzle-orm, gray-matter) so it can
// run in the production container without tsx or dev tooling.
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import matter from "gray-matter";

const url = process.env.DATABASE_URL ?? "./data/blog.db";
mkdirSync(dirname(url), { recursive: true });

const sqlite = new Database(url);
sqlite.pragma("journal_mode = WAL");
migrate(drizzle(sqlite), { migrationsFolder: "./db/migrations" });

const CONTENT_DIR = join(process.cwd(), "content");
const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

if (files.length === 0) {
  console.log("content/ 에 마크다운 파일이 없습니다.");
  process.exit(0);
}

const now = Date.now();
const upsert = sqlite.prepare(`
  INSERT INTO posts (slug, title, excerpt, content, date, published, created_at, updated_at)
  VALUES (@slug, @title, @excerpt, @content, @date, @published, @now, @now)
  ON CONFLICT(slug) DO UPDATE SET
    title = excluded.title,
    excerpt = excluded.excerpt,
    content = excluded.content,
    date = excluded.date,
    published = excluded.published,
    updated_at = @now
`);

for (const file of files) {
  const { data, content } = matter(readFileSync(join(CONTENT_DIR, file), "utf-8"));
  const slug = data.slug ?? basename(file, ".md");
  upsert.run({
    slug,
    title: data.title ?? slug,
    excerpt: data.excerpt ?? null,
    content: content.trim(),
    date: data.date ?? new Date().toISOString().slice(0, 10),
    published: data.published === false ? 0 : 1,
    now,
  });
  console.log(`✓ ${slug}${data.published === false ? " (draft)" : ""}`);
}

console.log(`\n${files.length}개 글 seed 완료.`);
