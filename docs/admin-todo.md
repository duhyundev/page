# 어드민 TODO — 미구현·삭제된 기능

`/admin` CMS를 "작동하는 것만" 남기고 정리하면서 제거한 항목들. 나중에 하나씩 다시 붙인다.
지금 실제로 동작하는 것: **터미널 로그인 · 글 목록(J/K/E/C/⌘B) · 글 작성/수정(제목·본문 마크다운 textarea·excerpt·slug·date) · autosave · 발행/해제 · 다크모드.**

## 에디터
- [ ] 마크다운 **툴바** (Bold/제목/링크/리스트 삽입 — 선택영역 조작)
- [ ] **라이브 프리뷰** (textarea 옆에 react-markdown 렌더; 현재는 공개 글 페이지로만 확인)
- [ ] 키보드 단축키 확장 (⌘B 굵게 등 — 현재 ⌘B는 사이드바 토글)
- [ ] 리치 에디터(Milkdown 등) 재검토 — 필요해지면

## 콘텐츠 메타
- [ ] **태그** — `tags` 테이블 + 목록/에디터 칩 UI + 필터 (삭제됨)
- [ ] **커버 이미지** + 본문 **인라인 이미지 업로드** (dropzone UI까지 있었음, 저장 미구현 → 삭제)
- [ ] **scheduled** 상태 (현재 draft/published 2단계만)
- [ ] **조회수 / 통계** 표시

## 화면 (사이드바에서 제거한 placeholder nav)
- [ ] **Media** 라이브러리
- [ ] **Stats** 대시보드
- [ ] **Tags** 관리 페이지
- [ ] **Settings** 페이지
- [ ] **About 페이지** 에디터 (단일 about 레코드 편집)
- [ ] 사이드바 **검색** + **커맨드 팔레트(⌘K)**
- [ ] **모바일** 레이아웃

## 인프라 / 운영
- [ ] **Phase 3 — PVC + Litestream(R2 백업)**: 어드민 쓰기 production 영속화. (현재 prod DB는 컨테이너 임시 FS → 재시작 시 글 소실)
- [ ] 프로드 인증 시크릿: `ADMIN_PASSWORD_HASH` · `AUTH_SECRET`를 SealedSecret로 (현재 dev 기본값)
