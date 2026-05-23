import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { site, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: "기록하는 공간 — Duhyun Kim",
};

// Set theme class before paint: stored choice first, else system preference.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5">
          <header className="flex items-center justify-between py-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-accent-signature"
              />
              {site.name}
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              <Link href="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
              <ThemeToggle />
            </nav>
          </header>

          <main className="flex-1 py-10">{children}</main>

          <footer className="flex flex-col gap-3 border-t border-border py-8 text-sm text-muted">
            <nav className="flex gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="transition-colors hover:text-foreground"
                  {...(s.label !== "Email"
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <span>© {new Date().getFullYear()} {site.name}</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
