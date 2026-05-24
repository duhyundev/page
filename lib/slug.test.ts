import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates English titles", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("collapses punctuation and trims edge hyphens", () => {
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
    expect(slugify("a---b")).toBe("a-b");
  });

  it("keeps Korean characters", () => {
    const s = slugify("제품 로그 #1 — 시작하다");
    expect(s).toBe("제품-로그-1-시작하다");
    expect(s.startsWith("-")).toBe(false);
    expect(s.endsWith("-")).toBe(false);
  });

  it("falls back to a post-<ts> slug when empty", () => {
    expect(slugify("   ")).toMatch(/^post-\d+$/);
    expect(slugify("!!!")).toMatch(/^post-\d+$/);
  });
});
