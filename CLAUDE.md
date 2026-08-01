# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Scope:** Only what current models still get wrong. If the model or the harness already handles something reliably, it doesn't belong here - a rule that restates default behavior burns context and buys nothing.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. State Assumptions, Then Proceed

**Say what you assumed. Keep going. Default the rest.**

Before implementing:
- State your assumptions in one line, then start.
- If multiple interpretations exist, pick the likeliest and say which one you picked.
- If a simpler approach exists, say so while doing the work - not as a question that blocks it.
- Ask only when the answer changes what gets built, not how well, and the wrong choice can't be cheaply undone.

A stated assumption gets corrected in seconds. A question costs a round-trip and hands the work back to the user. If you're about to ask a second question in one task, you're doing it wrong.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Verify Before Done

**If you touched code, run the check before saying "done" - and report what actually ran.**

- `npm test`, `pytest`, `cargo test`, whatever the project uses. Smallest relevant check first, broader checks when risk is high.
- No test setup? At minimum, verify the project builds or typechecks.
- Report the exact command and its result: "passed", "failed with X", or "not run because Y".
- Never write "done", "fixed", or "works" unless a concrete check backs it.
- Run it proactively, before the user signals "끝", "완료", "다 됐어".

This is the step LLMs skip most often. Treat it as non-negotiable.

## 5. Teach One Thing On The Way Out

**End with what the user would want to know next time. Two or three sentences.**

When the work is done:
- Name the one concept, tradeoff, or gotcha that actually mattered here.
- Teach what the code doesn't show: why this way over the obvious one, which default you leaned on, what breaks first at scale.
- If it needs a heading, it's too long. If it restates the diff, delete it.
- Skip it when the change is trivial, or when the user is the one who taught you the thing.

Why: an agent that only ships code leaves the user unable to maintain it. They should finish each task slightly more able to do it without you.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and stated assumptions get corrected early instead of surfacing as mistakes late.

---

# 프로젝트 특화 (tanstack-router-bible)

위 5개 원칙은 그대로 적용한다. 아래는 이 저장소에서만 달라지는 부분이다.
원문이 "Merge with project-specific instructions as needed" 라고 권한 대로 덧붙인다.

## ⚠️ 2번(Simplicity First)과 이 저장소의 충돌

**2번은 코드에만 적용한다. 문서에는 정반대 원칙이 적용된다.**

| 대상 | 원칙 |
|------|------|
| **코드** (`apps/**`, `scripts/**`) | 2번 그대로 — 최소한으로, 추측성 추상화 금지 |
| **문서** (`docs/**`, `README.md`) | **정반대** — "간결함보다 완전함" |

`README.md` 의 제1원칙이 이것이다:

> **"어려우니 빼자"는 금지.** 난이도를 이유로 기능을 생략하면, 독자는 그 기능이
> *없다고* 믿게 된다. 이해 못 할 위험보다 **존재를 모를 위험이 크다.**

실제로 이 저장소는 한때 `@tanstack/react-router` 가 export 하는 100개 중 22개만
문서화된 상태였고, 아무도 알아채지 못했다. 그래서 문서에서는 "짧게 쓰자"는 판단을
**하지 않는다.** 잘 안 쓰는 API·저수준 유틸·deprecated 항목까지 적되, "언제 쓰나 /
대개 안 쓴다 / 무엇으로 대체됐다"를 함께 밝힌다.

문서 분량을 줄이는 판단은 사용자의 몫이다. 임의로 축소하지 않는다.

## 4번(Verify Before Done) — 이 저장소에서 실제로 돌릴 명령

```bash
pnpm check:docs      # 문서 커버리지 — export + 옵션 필드 192개 대조. 누락 시 exit 1
pnpm -r typecheck    # 두 앱 타입체크
pnpm --filter bible exec vite build   # 빌드 (routeTree.gen.ts 생성 겸함)
```

- **`docs/**` 를 건드렸으면 `pnpm check:docs` 를 돌린다.** 새 API 를 문서화했는지,
  기존 문서를 지우면서 커버리지를 깨지 않았는지 확인하는 유일한 수단이다.
- **`apps/bible/src/routes/**` 를 건드렸으면 빌드 → typecheck 순서로 돌린다.**
  `routeTree.gen.ts` 는 커밋되지 않는 생성물이라, 빌드를 먼저 하지 않으면 typecheck 가
  존재하지 않는 라우트를 참조해 실패한다.
- 라우트를 새로 만들었으면 dev 서버를 띄워 HTTP 200 까지 확인한다.

## 라우트 파일을 만들 때

- 파일명이 곧 URL 이다. `.lazy` `.index` `route` `__root` `_pathless` `(group)` 은
  **예약 규칙**이므로 임의로 쓰지 않는다 (`docs/01-routing.md` 참조).
  실제로 `code-splitting.lazy.tsx` 를 만들었다가 generator 가 코드 스플리팅 규약으로
  해석해 파일을 덮어쓴 적이 있다.
- 챕터 라우트는 `{chapter}.tsx`(레이아웃) + `{chapter}.index.tsx`(본문) 짝을 지킨다.
  01~08 과 09~16 이 같은 구조여야 한다.
- 사이드바 등록은 `apps/bible/src/routes/__root.tsx` 의 `NAV` 배열이다.

## SSR 관련 작업

이 저장소는 **GitHub Pages 정적 배포(CSR)** 다. SSR 전용 API 는 동작하지 않는다.

- 문서에는 싣되 🚫 배지를 붙이고 **실행 예제를 만들지 않는다.**
- 대상: `HeadContent` `Scripts` `Asset` `ScriptOnce` `useTags` `ClientOnly`
  `useHydrated` `createSerializationAdapter` `createRouterConfig` + 라우터 옵션
  `isServer` `isShell` `isPrerendering` `defaultSsr` `dehydrate` `hydrate`
- 반대로 `ScrollRestoration` `useBlocker` 코드 스플리팅처럼 **SPA 에서 오히려 더
  중요한** 것들이 많다. "SSR 같아 보인다"는 이유로 빼지 않는다.

## 문서 서술 규약

- 한국어로 쓰되 **코드 식별자·기술 용어는 원문 유지**.
- 억지 번역을 하지 않는다. 한국 개발자가 실제로 쓰지 않는 말(조상/자손, 이름표 등)로
  옮기느니 원어를 쓴다. `structural sharing` · `co-location` · `chunk` 처럼 통용되는
  용어는 그대로 둔다.
- 각 장은 7섹션 템플릿을 따른다: ① 한 줄 정의 → ② 최소 예제 → ③ 옵션·변형 →
  ④ 흔한 실수/함정 → ⑤ 🔗 시너지 → ▶ 실행 예제 → 📖 공식 문서.
- 실행 예제가 없어도 문서는 쓴다. `(예제 없음 — 코드 조각으로 설명)` 이라고 적고
  설명은 그대로 자세히 쓴다.

## 공식 문서와의 관계

**공식에 있는 내용이 이 저장소에 없으면 안 된다.** 새 주제를 쓰기 전에 공식 문서를
확인한다.

```bash
# 공식 문서 목차 (사이드바에 노출되는 것)
curl -s https://raw.githubusercontent.com/TanStack/router/main/docs/router/config.json

# how-to 문서 (사이드바에 없지만 저장소에 존재 — 21장의 출처)
curl -s https://api.github.com/repos/TanStack/router/contents/docs/router/how-to
```
