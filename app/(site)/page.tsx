import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Home() {
  const posts = getPublishedPosts();

  return (
    <div className="flex flex-col gap-16">
      {/* Intro */}
      <section className="flex flex-col gap-4">
        <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="text-lg text-muted">{site.tagline}</p>
        <p className="leading-relaxed">
          기술 딥다이브와 만드는 과정, 그 사이의 생각을 글로 남깁니다.{" "}
          <Link href="/about" className="text-accent hover:text-accent-hover">
            더 알아보기 →
          </Link>
        </p>
      </section>

      {/* Recent writing */}
      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Writing
        </h2>
        {posts.length === 0 ? (
          <p className="text-muted">
            아직 글이 없습니다. <code>content/</code>에 마크다운을 추가하고{" "}
            <code>pnpm db:seed</code>를 실행하세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-8">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="flex flex-col gap-1">
                  <time className="text-sm text-muted">
                    {formatDate(post.date)}
                  </time>
                  <h3 className="text-xl font-semibold tracking-tight">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt ? (
                    <p className="text-muted">{post.excerpt}</p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
