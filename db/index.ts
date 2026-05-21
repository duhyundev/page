import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "./data/blog.db";
mkdirSync(dirname(url), { recursive: true });

// Reuse a single connection across hot reloads in dev to avoid leaking handles.
const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
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
