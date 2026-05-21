# duhyunkim.page — 디자인 시스템 spec

> 이 문서가 기준점이다. 흐름: **이 spec(b) → 코드 토큰/컴포넌트(a) → Claude Design 온보딩**.
> Claude Design은 코드베이스를 읽어 디자인 시스템을 구성하므로, 여기서 정한 것을 (a)에서 코드로 박아둔다.

---

## 1. 제품 정의 (Foundation)

| 항목 | 정의 |
|---|---|
| 한 줄 | 글의 깊이로 신뢰를 주는, 심플한 개인 블로그 |
| 독자 | 잠재 고객 · 채용담당 |
| 목적 | 방문자가 "내가 누군지 파악 → 연락"하게 만든다 |
| 첫인상 목표 | **사고·글의 깊이** — 콘텐츠가 히어로 |
| 작성 방식 | CMS형 에디터(Tiptap). *(a) 코드 단계에서 다룸 — 보는 쪽 디자인과 분리* |

### 페이지
- **홈** — 하이브리드: 짧은 소개(이름 + 한 줄 + 2~3문장) + 최근 글 목록
- **About** — 누군지·하는 일·이력. 끝에 연락 링크.
- **블로그** — 글 목록 + 글 상세. **프로젝트도 별도 페이지 없이 글로 정리.**
- **Contact** — 별도 페이지 없음. **푸터 + About 하단**에 이메일·GitHub·LinkedIn 노출.

### 콘텐츠 종류
기술 딥다이브 · 개인 에세이/생각 · 프로젝트(글로 정리)

---

## 2. 디자인 원칙

1. **콘텐츠가 주인공** — 장식은 글을 방해하지 않는 선까지만.
2. **극도의 미니멀** — 텍스트·여백·위계로 승부. 흐트림 없는 레이아웃.
3. **조용한 자신감** — 화려함 대신 정돈. 신뢰는 절제에서 나온다.
4. **읽기 최우선** — 줄 길이·줄간격·대비를 가독성 기준으로 잡는다.
5. **일관성** — 토큰 하나에서 모든 화면이 파생된다.

---

## 3. 컬러 토큰

베이스는 **약간 따뜻한 중성 그레이스케일**(차가운 순회색 회피 → 사람 냄새 + Pretendard와 어울림).
포인트 컬러는 **Nord 레드** 1색. 링크·강조·작은 마크에만 쓴다.

### 포인트 컬러: Nord 레드 (시그니처)
- 출처: 본인 **Nord Grand 피아노**의 그 레드 → 정체성과 연결되는, 흔치 않은 개인 시그니처. 채용·고객 기억에 남음.
- 극도의 미니멀 + 거의 무채색 베이스 위 **레드 1색** → 강렬하지만 절제됨. **적게 쓸수록 강해진다** (큰 면적 칠 금지).
- 가독성 분리: 본문 링크 텍스트는 시그니처보다 살짝 딥한 레드(라이트), 다크에선 밝힌 웜 레드로 대비 확보(AA 목표). 시그니처 원색은 로고 닷·작은 마크·hover 등 **비텍스트 강조**에만.
- 사용 규칙: 링크 · 강조 · hover · active · 작은 시각 마크. 그 외엔 무채색.

### Light
```
--background:    #FAFAF8   /* 따뜻한 near-white */
--surface:       #FFFFFF
--foreground:    #1A1A19   /* 따뜻한 near-black */
--muted:         #6B6B66   /* 메타·날짜·캡션 */
--border:        #E6E5E1
--accent:           #C81E2C   /* 링크·강조 텍스트 — 가독성 위해 시그니처보다 약간 딥 */
--accent-hover:     #A5141F
--accent-signature: #DA291C   /* Nord 시그니처 레드 — 로고 닷·작은 마크 등 비텍스트 */
```

### Dark
```
--background:    #0E0E0D
--surface:       #161615
--foreground:    #ECEBE7
--muted:         #9A9893
--border:        #2A2A27
--accent:           #FF6A60   /* 다크 배경 대비 위해 밝힌 웜 레드 */
--accent-hover:     #FF8780
--accent-signature: #FF4438   /* 다크용 시그니처 레드 */
```

> 시맨틱 네이밍(shadcn 호환) 유지: `background / surface / foreground / muted / border / accent`.
> Tailwind v4 `@theme inline`에서 `--color-*`로 매핑.

---

## 4. 타이포그래피

### 폰트
- **Pretendard** (제목·본문 모두). `pretendard` npm 패키지 또는 CDN.
- fallback: `system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
- 코드: `ui-monospace, "SF Mono", "JetBrains Mono", monospace`

### 스케일 (rem 기준, 16px = 1rem)
| 용도 | 크기 | 무게 | 비고 |
|---|---|---|---|
| Hero (홈/About 상단) | 2.5–3rem | 700 | tracking 살짝 타이트 |
| h1 (글 제목) | 2rem | 700 | |
| h2 | 1.5rem | 600 | |
| h3 | 1.25rem | 600 | |
| 본문 | 1.0625rem (17px) | 400 | **line-height 1.75** (읽기용) |
| 메타/캡션 | 0.875rem | 400 | `--muted` 색 |

### 읽기 폭
- 본문 컬럼: **약 65~72자** → `max-width: 42rem`(672px) 중앙 정렬.

---

## 5. 간격·형태

```
spacing base: 4px            /* 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 */
radius-sm: 4px               /* 코드블록·인풋 등 최소 곡률 */
radius-md: 8px               /* 카드류(거의 안 씀) */
border-width: 1px            /* 얇게 */
```
극도의 미니멀 → 그림자·강한 곡률 지양. 구분은 **여백 > 보더 > 그림자** 순.

---

## 6. 컴포넌트 / 패턴

- **헤더**: 좌측 이름("Duhyun Kim"), 우측 네비(About · Writing) + **테마 토글**. 하단 얇은 border 또는 무.
- **푸터**: 카피라이트 + 연락 링크(이메일·GitHub·LinkedIn), 작은 muted 텍스트.
- **홈(하이브리드)**: ① 인트로 블록(이름 + 한 줄 태그라인 + 2~3문장 + 연락 링크) → ② "최근 글" 목록.
- **글 목록 아이템**: 날짜(meta) · 제목 · 한 줄 요약. 세로 리스트, 항목 간 넉넉한 여백.
- **글 상세**: "← 목록" 링크 → 날짜 → 큰 제목 → prose 본문. `@tailwindcss/typography`를 토큰에 맞춰 튜닝(제목·인용·코드·리스트·링크).
- **About**: 롱폼 소개. 섹션 구분(예: 지금 하는 일 / 이력). 만든 것은 관련 **글로 링크**. 끝에 연락 링크.
- **Contact**: 별도 페이지 없음. **푸터 + About 하단**에 이메일·GitHub·LinkedIn.

### 테마 토글
- 라이트/다크 **둘 다 + 토글 버튼**. 시스템 설정 기본값 + 사용자 선택 `localStorage` 저장.
- 클라이언트 JS 필요 → (a) 코드 단계에서 구현. SSR 깜빡임(FOUC) 방지 처리.

---

## 7. (a) 코드 단계 체크리스트

- [ ] `pretendard` 설치 + `--font-sans` 토큰 교체
- [ ] `app/globals.css` 컬러 토큰을 위 값으로 교체 (light/dark)
- [ ] 테마 토글 컴포넌트 (system + localStorage, FOUC 방지)
- [ ] 레이아웃: 헤더(네비+토글) / 푸터(연락 링크)
- [ ] 홈 하이브리드 (인트로 + 최근 글)
- [ ] About 페이지 (끝에 연락 링크)
- [ ] Contact = 푸터 + About 하단 (별도 페이지 없음)
- [ ] prose 스타일을 토큰에 맞춰 튜닝
- [ ] 포인트 컬러: ink blue vs underline-only 라이브 비교 후 확정

## 8. Claude Design 온보딩 메모
- 위 토큰·타이포가 코드에 박힌 상태로 온보딩 → 시스템이 깔끔하게 추출됨.
- 핸드오프 프롬프트에 명시: **"Next.js App Router + Tailwind v4, Pretendard, 극도의 미니멀, 읽기 중심"**.
