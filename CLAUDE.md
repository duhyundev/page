# CLAUDE.md — duhyunkim.page

개인 기록용 블로그. Next.js로 만들고 라즈베리파이 k3s에 셀프 호스팅한다.
(이 파일은 프로젝트 영속 컨텍스트를 담는다 — 메모리 시스템 대신 여기에 적는다.)

## 컨벤션
- **응답·문서·스킬·주석은 한글로 작성.** 명령·식별자·코드·기술 용어(kubectl, ArgoCD 등)는 영문 유지.
- **패키지 매니저는 pnpm** (npm/yarn 아님). `pnpm dlx` 사용, `pnpm-lock.yaml` 유지.
- 커밋은 `/commit` 스킬 포맷 (서명됨, `Co-Authored-By` 트레일러).
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

## 호스팅 & 배포 (라즈베리파이 k3s + GitOps) — 라이브

`duhyunkim.page` 라이브. **운영 = `git push` (main)** — 그 외 수동 작업 없음.

```
코드 수정 → git push
  └─ GitHub Actions(.github/workflows/deploy.yml): arm64 빌드 → ghcr push → kustomize 이미지 태그 bump 커밋
       └─ ArgoCD(k3s 상주): 변경 감지 → sync → 롤아웃
            └─ blog 파드(ghcr 이미지) + cloudflared(SealedSecret 토큰)
                 └─ Cloudflare Tunnel(`page` 터널) → duhyunkim.page
```

- 이미지: `ghcr.io/duhyundev/page:<sha>` (public 패키지 → pull secret 불필요). 빌드는 Actions(QEMU arm64).
- 콘텐츠: 현재 `content/*.md`가 빌드 시 이미지에 baked-in. 글 발행 = .md 추가 → push. (쓰기 DB는 에디터 단계)
- ⚠️ **클러스터를 `kubectl apply`로 수동 변경하지 말 것.** git이 단일 진실, ArgoCD가 reconcile(self-heal).

### gitops/ 구조 (App-of-Apps)
- `gitops/bootstrap/root-app.yaml` — 루트 Application (1회 `kubectl apply`로 부트스트랩, `gitops/apps/` 감시)
- `gitops/apps/` — 자식 Application: `blog`, `cloudflared`
- `gitops/workloads/blog` — Kustomize(deployment+service). 이미지 태그는 CI가 `kustomize edit set image`로 bump
- `gitops/workloads/cloudflared` — Kustomize(deployment + **SealedSecret** 토큰)
- 도구 원칙: 내 워크로드=**Kustomize**, 시크릿=**Sealed Secrets**(암호화해 git 커밋), ArgoCD·sealed-secrets 컨트롤러=**부트스트랩**(아래)

### ArgoCD
- UI: **`http://duhyunkim-pi.tail601229.ts.net`** (tailnet 전용, `tailscale serve --http=80`로 노출, 공인 노출 0)
- 로그인: `admin` / 초기비번은 `kubectl -n argocd get secret argocd-initial-admin-secret`
- argocd-server는 insecure 모드(평문 HTTP; TLS는 tailscale serve가 처리)

### 클러스터 부트스트랩 (재구축 시 1회 — 아직 IaC 아닌 수동)
1. k3s 설치 + `/boot/firmware/cmdline.txt`에 `cgroup_memory=1 cgroup_enable=memory` 추가 후 재부팅 (없으면 `failed to find memory cgroup`)
2. ArgoCD 설치(`argo-cd/stable/manifests/install.yaml`) + `argocd-cmd-params-cm`에 `server.insecure=true` 패치
3. Sealed Secrets 컨트롤러 설치(`controller.yaml`) — ⚠️ 봉인 키 보유. **ArgoCD/Helm으로 재설치 금지**(키 바뀌면 기존 SealedSecret 복호화 불가)
4. cloudflared 토큰 → `kubeseal` → `gitops/workloads/cloudflared/sealedsecret.yaml` 커밋
5. `kubectl apply -f gitops/bootstrap/root-app.yaml` → 이후 ArgoCD가 전부 관리
6. ArgoCD UI 노출: `tailscale serve --bg --http=80 http://<argocd-server-ClusterIP>:80`
7. Cloudflare 대시보드: `page` 터널 Public Hostname `duhyunkim.page` → `http://blog.blog.svc.cluster.local:80`

### Pi 접속 (Tailscale)
집 ISP가 Mac과 Pi에 **서로 다른 공인 /24**를 줘서 로컬 직접 SSH 불가 → Tailscale로 접속.
자세한 진단/설명은 `docs/infra-network-tailscale.md`.
- Pi: `ssh duhyunkim@100.91.78.61` (tailnet `duhyunkim-pi`, Tailscale SSH, 키/비번 불필요, sudo 패스워드리스)
- 이 Mac: `duhyunkim-main` `100.81.239.79` / tailnet 계정 `duhyun.dev@`
- Pi 하드웨어: Pi 5, 16GB RAM, 4코어, aarch64, Debian 13(trixie), NVMe SSD 1TB 부팅

## 로드맵
- [x] 스캐폴딩 + DB + 읽기 페이지
- [x] 디자인 시스템 토대 (토큰·Pretendard·테마 토글·홈/About) — `docs/design-system.md`
- [x] Pi k3s 호스팅 + Cloudflare Tunnel (`duhyunkim.page` 라이브)
- [x] GitOps CI/CD (ArgoCD + ghcr + GitHub Actions + Sealed Secrets) — `git push`로 자동 배포
- [ ] `DEPLOY.md` GitOps 기준으로 갱신 (현재 옛 수동 빌드 방식이라 stale)
- [ ] claude.ai/design 온보딩 → 화면 디자인 → 통합
- [ ] Tiptap 하이브리드 에디터 + `/admin` → 쓰기 DB → **PVC + Litestream(R2 백업)** 도입
- [ ] `lib/site.ts` placeholder(태그라인/GitHub·LinkedIn URL) 확정
