# CLAUDE.md — duhyunkim.page

개인 기록용 블로그. Next.js로 만들고 라즈베리파이 k3s에 셀프 호스팅한다.
(이 파일은 프로젝트 영속 컨텍스트를 담는다 — 메모리 시스템 대신 여기에 적는다.)

## 컨벤션
- **패키지 매니저는 pnpm** (npm/yarn 아님). `pnpm dlx` 사용, `pnpm-lock.yaml` 유지.
- 메모리 시스템 쓰지 말 것. 영속 정보는 이 CLAUDE.md 또는 `docs/`에 기록.

## 스택
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- SQLite + Drizzle ORM. 콘텐츠는 현재 `content/*.md` → seed (에디터는 다음 단계)
- 마크다운 렌더: react-markdown + remark-gfm, `prose`(@tailwindcss/typography)
- 폰트: Pretendard (variable dynamic-subset, `app/layout.tsx`에서 import)

## 디자인 시스템
- **기준 문서: `docs/design-system.md`** (제품 정의 + 토큰 + 컴포넌트 규칙). 변경 시 먼저 여기 반영.
- 톤: 극도의 미니멀, 읽기 중심. 포인트 컬러 = **Nord 레드**(시그니처). 그 외 무채색.
- 토큰: `app/globals.css` (shadcn 호환 시맨틱 네이밍). 라이트/다크 + 토글(`components/theme-toggle.tsx`, system 기본 + localStorage, FOUC 방지 스크립트는 layout `<head>`).
- 정체성/연락처 단일 소스: `lib/site.ts` (이름·태그라인·email·GitHub·LinkedIn). ⚠️ GitHub/LinkedIn URL·태그라인·About 본문은 placeholder.
- 페이지: 홈(하이브리드: 소개 + 최근 글) · `/about` · 글 목록/상세 · Contact는 푸터+About. 프로젝트는 별도 페이지 없이 글로 정리.
- 다음: `claude.ai/design` 온보딩(이 코드베이스를 읽어 시스템 추출) → 화면 디자인 → 핸드오프 번들 → 코드 통합.

## 세션 기록 (SessionEnd hook)
- 세션 종료 시 Claude Code의 전체 transcript(JSONL)를 `sessions/<날짜>-<id>.jsonl`로 **그대로 복사**한다. 메시지·tool input·출력·thinking·시간 전부 손실 없이 보존(파싱·가공 없음).
- 설정: `.claude/settings.json`의 SessionEnd hook → `scripts/persist-session.mjs` (`transcript_path`를 `sessions/`로 copyFileSync).
- `sessions/`는 .gitignore 처리 = **로컬 기록용, 커밋 안 함**. hook 변경/비활성화는 `/hooks`.

## 로컬 개발
```sh
pnpm install
pnpm db:generate   # 스키마 변경 시 마이그레이션 생성
pnpm db:seed       # content/*.md → SQLite (node scripts/seed.mjs)
pnpm dev           # http://localhost:3000
```
글 추가: `content/`에 frontmatter(title/date/excerpt/published) 포함 .md 작성 후 `pnpm db:seed`.

## 호스팅 (라즈베리파이 + k3s + Cloudflare Tunnel)
- 배포 절차: `DEPLOY.md`. 이미지는 Pi에서 arm64 네이티브 빌드 → k3s containerd import.
- 콘텐츠는 빌드 시 이미지에 baked-in. 글 발행 = 새 .md 추가 → 재빌드 → 재배포.
- `/admin`(에디터)·이미지(R2)·PVC+Litestream 백업은 이후 단계.

### Pi 접속 (Tailscale)
집 ISP가 Mac과 Pi에 **서로 다른 공인 /24**를 줘서 로컬 직접 SSH 불가 → Tailscale로 접속.
자세한 진단/설명은 `docs/infra-network-tailscale.md`.
- Pi: `ssh duhyunkim@100.91.78.61` (tailnet `duhyunkim-pi`, Tailscale SSH, 키/비번 불필요, sudo 패스워드리스)
- 이 Mac: `duhyunkim-main` `100.81.239.79` / tailnet 계정 `duhyun.dev@`
- Pi 하드웨어: Pi 5, 16GB RAM, 4코어, aarch64, Debian 13(trixie), NVMe SSD 1TB 부팅

### k3s 주의
- Raspberry Pi는 `/boot/firmware/cmdline.txt`에 `cgroup_memory=1 cgroup_enable=memory` 추가 + 재부팅해야 k3s가 뜬다(없으면 `failed to find memory cgroup`).

## 로드맵
- [x] 스캐폴딩 + DB + 읽기 페이지
- [x] k3s 배포 아티팩트 (Dockerfile, k8s/)
- [x] 디자인 시스템 토대 (토큰·Pretendard·테마 토글·홈/About) — `docs/design-system.md`
- [ ] Pi 호스팅 (진행 중)
- [ ] claude.ai/design 온보딩 → 화면 디자인 → 통합
- [ ] Tiptap 하이브리드 에디터 + `/admin`
- [ ] R2 이미지 업로드 / PVC + Litestream 백업
