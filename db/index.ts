import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import * as schema from "./schema";

// Environment-separated, file-based SQLite — local dev and production use
// independent DB files so they never clobber each other:
//   dev  → ./data/dev.db
//   prod → ./data/blog.db   (override via DATABASE_URL, e.g. a PVC mount path)
const url =
  process.env.DATABASE_URL ??
  (process.env.NODE_ENV === "production" ? "./data/blog.db" : "./data/dev.db");
mkdirSync(dirname(url), { recursive: true });

// Reuse a single connection (and skip re-migrating) across dev hot reloads.
const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  migrated?: boolean;
};

const sqlite =
  globalForDb.sqlite ??
  (() => {
    const conn = new Database(url);
    conn.pragma("journal_mode = WAL");
    return conn;
  })();

if (process.env.NODE_ENV !== "production") globalForDb.sqlite = sqlite;

export const db = drizzle(sqlite, { schema });

// Apply migrations once per process, idempotently. A fresh DB — local dev or a
// brand-new production volume — gets its schema on first connection, so there
// is no separate seed/migrate step to run by hand.
if (!globalForDb.migrated) {
  migrate(db, { migrationsFolder: join(process.cwd(), "db", "migrations") });
  globalForDb.migrated = true;
}
