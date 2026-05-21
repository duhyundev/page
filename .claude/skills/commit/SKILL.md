---
name: commit
description: Write a git commit in the user's conventional format (type-prefixed subject, terse factual bullets, Co-Authored-By trailer). Use whenever creating a git commit.
---

# 커밋 메시지 포맷

```
<type>[optional scope]: <description>

- 무엇이/왜 바뀌었는지 설명하는 불릿
- 필요하면 한 줄 더
- 각 불릿은 간결하고 사실 위주로

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## 타입
`feat` · `fix` · `docs` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `style`

## 규칙
- **제목(subject)**: 명령형, 콜론 뒤 소문자 시작, 마침표 없음, ~72자 이내.
- **스코프**(선택): 괄호 안 명사. 예) `feat(editor):`, `fix(db):`.
- **본문 불릿**: *무엇*과 *왜*를 설명 (어떻게는 코드가 말함). 간결·사실 위주, 군더더기·마케팅 표현 금지. 사소한 한 줄 변경이면 본문 생략.
- **트레일러**: 항상 `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`로 끝맺음 (현재 모델의 정확한 ID/이름 사용).
- 커밋 하나에 논리적 변경 하나. 무관한 변경을 묶지 말 것.

## 워크플로
1. `git status` + `git diff` (+ `git diff --staged`)로 무엇이 바뀌는지 정확히 확인.
2. 관련된 변경끼리 묶어서 의도적으로 stage, 무관한 건 별도 커밋으로 분리.
3. 위 포맷대로 메시지 작성.
4. 커밋은 **사용자가 요청할 때만**. `git add -A`로 무작정 담지 말고 의도적으로 stage.

## 예시
```
feat(editor): Tiptap 마크다운 하이브리드 에디터 추가

- 코드블록·콜아웃·이미지용 슬래시 메뉴
- 이식성을 위해 콘텐츠를 마크다운으로 저장

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```
```
fix(db): SQLite 열기 전에 data 디렉터리 생성

- ./data 없을 때 첫 실행 ENOENT 방지

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```
