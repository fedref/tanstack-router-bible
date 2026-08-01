# TanStack Router 학습 바이블

TanStack Router(React · 파일기반)를 **공식 문서 수준으로 전부** 익히되, 단일 기능을 넘어
**기능 조합의 시너지**까지 체득하기 위한 개인 학습용 참고서다.

- 성격: **커리큘럼**(순차 학습 경로) + **사전**(주제별 빠른 조회)을 겸한다.
- 구성: `docs/` 의 Markdown 문서 ↔ `apps/bible/` 의 **실제 구동되는 예제** 가 짝을 이룬다.
- 학습법: 문서에서 개념을 읽고 → `bible` 에서 눌러보고 → `playground` 에서 직접 구현해 본다.

## 이 문서의 원칙 — 빠짐없이, 자세하게

**`@tanstack/react-router` 가 export 하는 모든 API와 모든 옵션을 다룬다.** 이것이 이 저장소의
제1원칙이며, 다른 모든 편의는 여기에 양보한다.

- **간결함보다 완전함.** 짧고 읽기 좋은 문서보다, 찾던 기능이 실제로 실려 있는 문서가 낫다.
- **"어려우니 빼자"는 금지.** 난이도를 이유로 기능을 생략하면, 독자는 그 기능이 *없다고*
  믿게 된다. 이해 못 할 위험보다 **존재를 모를 위험이 크다.** 어려운 주제는 빼는 대신
  설명을 더 길게 쓴다.
- **모르는 채 넘어가지 않게.** 잘 안 쓰는 API, 저수준 유틸, deprecated 항목까지 적는다.
  대신 "언제 쓰나 / 대개 안 쓴다 / 무엇으로 대체됐다"를 함께 밝힌다.
- **커버리지는 측정한다.** 패키지의 export 목록과 옵션 타입을 문서와 기계적으로 대조해
  누락을 찾는다. 감각이 아니라 목록으로 확인한다.

> 다루는 범위: `@tanstack/react-router` **전체** + 파일기반 라우팅 + TanStack Query 통합.
> TanStack Start / Solid 어댑터는 별도 패키지이므로 경계만 짚고 넘어간다.

### SSR 전용 기능은 "설명 + 예시 코드"까지만

이 저장소의 `bible` 앱은 **GitHub Pages에 배포되는 순수 CSR(SPA)** 이다. 서버가 없으므로
SSR 동작 자체가 불가능하다. 그래서 SSR이 있어야 의미가 생기는 기능은 이렇게 다룬다:

- ✅ **문서에는 싣는다** — 이 패키지가 export 하는 이상 "무엇인지"는 알아야 한다.
- ✅ **예시 코드는 쓴다** — 실제 프로젝트에서 어떻게 쓰는지 보여 준다.
- 🚫 **실행 예제(라우트)는 만들지 않는다** — 동작하지 않는 예제는 없느니만 못하다.

해당 항목에는 다음 배지를 붙여 한눈에 구분되게 한다:

> **🚫 SSR 전용** — 이 저장소(GitHub Pages · CSR)에서는 실행 예제를 두지 않는다.
> 설명과 예시 코드로만 다룬다.

**대상은 9개다**: `HeadContent` · `Scripts` · `Asset` · `ScriptOnce` · `useTags` ·
`ClientOnly` · `useHydrated` · `createSerializationAdapter` · `createRouterConfig`
(+ 라우터 옵션 `isServer` · `isShell` · `isPrerendering` · `defaultSsr` · `dehydrate` · `hydrate`)

> 참고: 나머지 API는 **전부 CSR에서 동작한다.** `ScrollRestoration`, `useBlocker`,
> 코드 스플리팅처럼 오히려 **SPA에서 더 중요한** 것들도 많으므로, "SSR 같아 보인다"는
> 이유로 빼지 않는다.

---

## 저장소 구조 (pnpm workspace)

```
.
├── docs/               # 📖 문서 — Chapter 00~21 + INDEX(사전)
├── scripts/            # 🔍 check-doc-coverage.mjs (커버리지 검사)
├── apps/
│   ├── bible/          # 🖥️ 완성된 참고 예제. GitHub Pages 배포 대상. (읽기용)
│   └── playground/     # ✍️ 직접 구현해 보는 연습장. 배포하지 않는다.
└── pnpm-workspace.yaml
```

`bible` 은 "정답지", `playground` 는 "빈 답안지"다. 문서를 읽고 playground 에서 직접 짜 보다가
막히면 bible 의 같은 주제 라우트를 열어 비교한다. 두 앱은 서로 의존하지 않는다.

## 실행법

```bash
pnpm install                # 루트에서 한 번 — 두 앱을 모두 설치한다

pnpm dev:playground         # http://localhost:5174  — 연습장 (= pnpm dev)
pnpm dev:bible              # http://localhost:5173  — 참고 예제
                            # 포트가 다르므로 두 개를 나란히 띄워도 된다

pnpm typecheck              # 두 앱 전체 — 파일기반 라우팅의 타입 추론 검증
pnpm build                  # 두 앱 전체 프로덕션 빌드
```

> 개별 앱만 다룰 때는 `pnpm --filter bible <script>` 형태를 쓴다.
> `src/routeTree.gen.ts` 는 플러그인 생성물이라 커밋되지 않는다 — clone 직후 typecheck 가
> 실패하면 `pnpm build` 를 한 번 돌려 생성한다.

버전: `@tanstack/react-router ^1.170` · `router-plugin ^1.168` · `react 19` · `vite 6` · `react-query ^5`
UI: `shadcn/ui`(Base UI 기반, radix 아님) + Tailwind v4 + 라이트/다크 테마. shadcn studio 스타일 대시보드 쉘.

---

## 커리큘럼 (순차 학습 경로)

| # | Chapter | 문서 | 예제 라우트 | 상태 |
|---|------|------|-------------|------|
| 00 | Getting Started | [docs/00-getting-started.md](docs/00-getting-started.md) | `/` | ✅ |
| 01 | 라우팅 기초 | [docs/01-routing.md](docs/01-routing.md) | `/routing/*` | ✅ |
| 02 | 네비게이션 | [docs/02-navigation.md](docs/02-navigation.md) | `/navigation/*` | ✅ |
| 03 | 파라미터 (Path/Search) | [docs/03-params.md](docs/03-params.md) | `/params/*` | ✅ |
| 04 | 데이터 로딩/변경 | [docs/04-data-loading.md](docs/04-data-loading.md) | `/data/*` | ✅ |
| 05 | 타입 안전성 & 컨텍스트 | [docs/05-type-safety-context.md](docs/05-type-safety-context.md) | `/type-safety/*` | ✅ |
| 06 | 라이프사이클 & 인증 | [docs/06-lifecycle-auth.md](docs/06-lifecycle-auth.md) | `/auth/*` | ✅ |
| 07 | TanStack Query 통합 | [docs/07-query-integration.md](docs/07-query-integration.md) | `/query/*` | ✅ |
| 08 | 시너지 종합 (kitchen-sink) | [docs/08-synergy.md](docs/08-synergy.md) | `/kitchen-sink/*` | ✅ |

### 심화 — 코어가 제공하지만 기초 8장에 담기지 않는 것들

00~08이 "쓰는 순서"라면, 09~21은 **"남김없이"** 를 담당한다. 순서대로 읽어도 되고
필요할 때 골라 봐도 된다.

| # | Chapter | 문서 | 다루는 핵심 |
|---|------|------|-------------|
| 09 | 코드 스플리팅 & Lazy | [docs/09-code-splitting.md](docs/09-code-splitting.md) | `createLazyFileRoute` · `lazyRouteComponent` · `codeSplitGroupings` |
| 10 | Deferred & 스트리밍 | [docs/10-deferred-streaming.md](docs/10-deferred-streaming.md) | `defer` · `Await` · `useAwaited` |
| 11 | Match API & 라우터 상태 | [docs/11-match-api.md](docs/11-match-api.md) | `useMatch(es)` · `useMatchRoute` · `useLocation` |
| 12 | 에러 · NotFound 경계 | [docs/12-error-boundaries.md](docs/12-error-boundaries.md) | `CatchBoundary` · `onError` · `notFoundMode` |
| 13 | Search 미들웨어 & 직렬화 | [docs/13-search-middleware.md](docs/13-search-middleware.md) | `retainSearchParams` · `stripSearchParams` · 직렬화 어댑터 |
| 14 | 네비게이션 차단 & History | [docs/14-blocking-history.md](docs/14-blocking-history.md) | `useBlocker` · `Block` · `createMemoryHistory` |
| 15 | Masking · 스크롤 · 전환 | [docs/15-masking-scroll.md](docs/15-masking-scroll.md) | `createRouteMask` · `ScrollRestoration` · View Transitions |
| 16 | 커스텀 Link · SSR API · 유틸 | [docs/16-custom-link-utils.md](docs/16-custom-link-utils.md) | `createLink` · `HeadContent` · 저수준 유틸 |
| 17 | 옵션 전수 레퍼런스 | [docs/17-options-reference.md](docs/17-options-reference.md) | RouterOptions · Route 옵션 · Link 옵션 총람 |
| 18 | 생성기 설정 · CLI · Virtual Routes | [docs/18-generator-config.md](docs/18-generator-config.md) | `tsr.config.json` 옵션 전수 · `tsr` CLI · Virtual File Routes |
| 19 | 국제화 (i18n) | [docs/19-i18n.md](docs/19-i18n.md) | `{-$locale}` optional param · `rewrite` |
| 20 | ESLint & Devtools | [docs/20-eslint-devtools.md](docs/20-eslint-devtools.md) | 속성 순서 규칙 · Devtools 읽는 법 |
| 21 | **실전 레시피 (How-To)** | [docs/21-recipes.md](docs/21-recipes.md) | 테스트 · 디버깅 · 배포 · 환경변수 · RBAC · 마이그레이션 |

## 사전 (주제별 조회)

빠른 조회는 **[docs/INDEX.md](docs/INDEX.md)** 참고 — API/기능명으로 문서와 예제 라우트를 역인덱싱한다.

---

## 문서 규약

모든 주제는 다음 7섹션 템플릿을 따른다:
**① 한 줄 정의 & 언제 쓰나 → ② 최소 예제 → ③ 옵션·변형(다양한 결과) → ④ 흔한 실수/함정 →
⑤ 🔗 시너지(다른 기능과의 조합) → ▶ 실행 예제(앱 라우트) → 📖 공식 문서 링크.**

문서 서술은 한국어, 코드 식별자·기술 용어는 원문 유지.

### 실행 예제가 없어도 문서는 쓴다

초판에서는 "앱에 예제가 있는 주제만 자세히 쓴다"는 암묵적 규칙이 작동해, 예제를 만들기
번거로운 기능이 문서에서도 통째로 빠졌다. 이제는 반대로 한다 — **문서가 먼저다.** 실행
예제가 아직 없으면 `▶ 실행 예제` 자리에 `(예제 없음 — 코드 조각으로 설명)` 이라고 적고
설명은 그대로 자세히 쓴다.

### 커버리지 측정 방법

문서가 실제로 전부를 덮고 있는지는 눈이 아니라 스크립트로 확인한다. **없는 것은 눈에
보이지 않기 때문이다** — 이 저장소도 한때 100개 중 22개만 문서화된 상태였고, 아무도
알아채지 못했다.

```bash
pnpm check:docs              # 누락이 있으면 이름을 출력하고 exit 1
pnpm check:docs --verbose    # 검사한 이름을 전부 출력
```

`scripts/check-doc-coverage.mjs` 가 설치된 패키지의 타입 정의에서 이름을 뽑아
`docs/*.md` 전문과 대조한다. 검사 대상은 다섯 갈래다.

| 검사 항목 | 어디서 뽑나 |
|---|---|
| **public export** | `@tanstack/react-router` 의 `index.d.ts` |
| **RouterOptions** | core 의 `RouterOptions` + React 어댑터의 `RouterOptionsExtensions` |
| **Route 옵션** | `UpdatableRouteOptions` |
| **Link 옵션 · activeOptions** | `LinkOptionsProps` · `ActiveOptions` |
| **loader/beforeLoad 인자** | `ContextOptions` |

출력은 이런 모양이다.

```
문서 커버리지 검사
  @tanstack/react-router  1.170.18
  @tanstack/router-core   1.171.15
  docs/                   208,391자

  ✅ public export            100/100
  ✅ RouterOptions (core)     45/45
  ✅ RouterOptions (React)    7/7
  ✅ Route 옵션                 21/21
  ✅ Link 옵션                  6/6
  ✅ activeOptions            4/4
  ✅ loader/beforeLoad 인자     9/9

  합계 192/192
```

> React 어댑터가 declaration merging 으로 덧붙이는 옵션(`defaultErrorComponent`,
> `Wrap`, `InnerWrap` 등)은 **core 문서에 나오지 않는다.** 그래서 core 와 React 쪽을
> 따로 뽑아 합친다.

### 버전을 올린 뒤에 할 일

```bash
pnpm update @tanstack/react-router
pnpm check:docs
```

새 버전에서 API가 추가됐다면 타입 정의에는 있는데 `docs/` 에는 없으므로 **누락으로
찍힌다.** 그 항목을 문서화한 뒤 커밋한다.

```
❌ public export            100/103

누락 — 아래 이름이 docs/ 어디에도 등장하지 않는다:

  [public export]
    useRoutePreload
    createNavigationGuard
    RouteErrorBoundary
```

### 이 검사가 잡지 못하는 것

하한선을 지키는 장치이지 문서 품질을 보증하지는 않는다. 아래는 사람이 봐야 한다.

- 이름만 한 번 언급되고 **설명이 부실한** 경우
- 기존 API 의 **동작이 바뀐** 경우 (이름은 그대로이므로 통과한다)
- **제거·deprecated 된** API 가 문서에 남아 있는 경우
- 타입 정의의 **인터페이스 이름 자체가 바뀐** 경우 → `⚠️ 추출 실패` 로 표시되니
  그때는 스크립트의 인터페이스 이름을 갱신한다
