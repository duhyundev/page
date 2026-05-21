# duhyunkim.page

기록용 개인 블로그. Next.js로 만들고 라즈베리파이 k3s에 셀프 호스팅한다.

## 스택

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **SQLite + Drizzle ORM** — 콘텐츠 저장
- 콘텐츠는 현재 `content/*.md`에서 seed (에디터는 다음 단계)
- 호스팅: **라즈베리파이 + k3s + Cloudflare Tunnel** ([DEPLOY.md](./DEPLOY.md))

## 로컬 개발

```sh
pnpm install
pnpm db:generate   # 스키마 변경 시 마이그레이션 생성
pnpm db:seed       # content/*.md → SQLite
pnpm dev           # http://localhost:3000
```

## 글 쓰기 (현재)

`content/`에 frontmatter 포함 마크다운을 추가하고 `pnpm db:seed` 실행:

```markdown
---
title: "제목"
date: "2026-05-21"
excerpt: "한 줄 요약"
published: true
---

본문 (마크다운)
```

## 로드맵

- [x] 스캐폴딩 + DB + 읽기 페이지
- [x] k3s 배포 아티팩트
- [ ] Pi 호스팅 (DEPLOY.md)
- [ ] Tiptap 하이브리드 에디터 + `/admin`
- [ ] R2 이미지 업로드
- [ ] PVC + Litestream 백업
