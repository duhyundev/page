// Single source of truth for site identity + contact.
// ⚠️ Replace the placeholder values marked below with real ones.
export const site = {
  name: "Duhyun Kim",
  // 홈/About 상단 한 줄 태그라인. (확정 필요)
  tagline: "만드는 사람. 과정과 생각을 글로 남깁니다.",
  email: "duhyun.dev@gmail.com",
  // ⚠️ 실제 핸들로 교체 필요
  github: "https://github.com/duhyunkim",
  linkedin: "https://www.linkedin.com/in/duhyunkim",
} as const;

export const socials = [
  { label: "Email", href: `mailto:${site.email}` },
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
] as const;
