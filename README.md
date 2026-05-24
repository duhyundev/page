# duhyunkim.page

기록용 개인 블로그. Next.js로 만들고 라즈베리파이 k3s에 셀프 호스팅한다.

## 스택

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **SQLite + Drizzle ORM** — 글의 진실은 DB. 환경별 독립 파일(dev `./data/dev.db` / prod `./data/blog.db`)
- **`/admin` CMS** — 터미널 로그인 → 글 목록 → Tiptap 에디터(마크다운 저장, autosave)
- 호스팅: **라즈베리파이 + k3s + Cloudflare Tunnel** ([DEPLOY.md](./DEPLOY.md))

## 로컬 개발

```sh
pnpm install
pnpm dev           # http://localhost:3000 — 첫 실행 시 ./data/dev.db 자동 생성·마이그레이션
pnpm db:generate   # db/schema.ts 변경 시 마이그레이션 SQL 생성 (다음 부팅에 자동 적용)
pnpm verify        # 타입체크 + 테스트
```

## 글 쓰기

`/admin` 에디터로 작성·발행한다. (dev 비밀번호 기본값 `duhyunkim` — 운영 설정은 [`.env.example`](./.env.example))

```
http://localhost:3000/admin  →  login duhyunkim  →  비밀번호
```

## 로드맵

- [x] 스캐폴딩 + DB + 읽기 페이지
- [x] Pi 호스팅 (k3s + Cloudflare Tunnel + GitOps)
- [x] `/admin` CMS (로그인 · 목록 · Tiptap 에디터 · 인증 · CRUD)
- [x] 환경별 DB + 부팅 자동 마이그레이션
- [ ] 에디터 Milkdown 교체
- [ ] PVC + Litestream(R2) 영속화 — 어드민 쓰기 production
- [ ] 이미지 업로드 · 태그 · 통계 등 어드민 확장
