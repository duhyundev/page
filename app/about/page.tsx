import type { Metadata } from "next";
import { site, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} 소개`,
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="text-lg text-muted">{site.tagline}</p>
      </header>

      {/* ⚠️ 플레이스홀더 본문 — 실제 소개로 교체 필요 */}
      <div className="prose max-w-none">
        <h2>지금 하는 일</h2>
        <p>
          (여기에 현재 무엇을 만들고 있는지, 어떤 문제에 관심이 있는지 적습니다.)
        </p>

        <h2>이력</h2>
        <p>
          (간단한 배경과 경험을 적습니다. 만든 것은 별도 페이지 대신 관련 글로
          링크합니다.)
        </p>
      </div>

      <section className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Contact
        </h2>
        <nav className="flex gap-4 text-sm">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="text-accent transition-colors hover:text-accent-hover"
              {...(s.label !== "Email"
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </section>
    </div>
  );
}
