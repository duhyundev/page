/** Slugify a title. Keeps Korean/word chars, collapses the rest into hyphens. */
export function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || `post-${Date.now()}`;
}
