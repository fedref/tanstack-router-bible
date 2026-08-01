# 사전 (Dictionary) — 기능/API 역인덱스

개발 중 "이거 어디서 봤더라?" 를 위한 조회표. 기능·API 이름으로 문서와 실행 예제를 찾는다.
아직 미구현 항목은 (예정)으로 두고, Chapter이 완성될 때마다 채운다.

## 개념 / 파일 규약

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| 파일기반 라우팅 | `src/routes/**` → URL 트리 자동 생성 | [01](01-routing.md#라우트-트리는-파일-구조가-곧-url) | `/routing` |
| `__root.tsx` | 모든 라우트의 최상위 부모, 공통 레이아웃/컨텍스트 | [01](01-routing.md#라우트-종류) | `/` (사이드바) |
| Index 라우트 (`x.index.tsx`) | 부모 경로 자체에 매칭 | [01](01-routing.md#라우트-종류) | `/routing` |
| Layout 라우트 + `Outlet` | 자식을 감싸는 공유 레이아웃 | [01](01-routing.md#layout-라우트와-outlet) | `/routing`, `/routing/matching` |
| 동적 세그먼트 (`$param`) | URL 변수 → `params.*` | [01](01-routing.md#동적-세그먼트--매칭) | `/routing/matching/$productId` |
| Pathless Layout (`_x.tsx`) | URL엔 없지만 레이아웃/beforeLoad 공유 | (예정, 06) | (예정) |
| Splat (`$.tsx`) | 남은 경로 전부(404 등) | (예정, 06) | (예정) |
| 파일 네이밍 규칙 | `.`=경로구분, `$`=동적, `_`=pathless, `-`=제외 | [01](01-routing.md#네이밍-규칙-정리) | — |
| 폴더 방식 라우팅 | `route.tsx` 가 폴더의 레이아웃 | [01](01-routing.md#폴더-방식의-레이아웃은-routetsx-다) | — |
| `(group)` 괄호 폴더 | 이름이 URL 에서 삭제됨 (정리 전용) | [01](01-routing.md#괄호-그룹-group-은-순수하게-정리용이다) | — |
| `layout_` 뒤 밑줄 | un-nesting — URL 유지, 레이아웃만 탈출 | [01](01-routing.md#앞-밑줄과-뒤-밑줄은-정반대다) | — |
| **매칭 우선순위** | index → 정적 → 동적 → splat (정의 순서 무관) | [01](01-routing.md#매칭-우선순위--파일을-쓴-순서는-상관없다) | `/routing/matching` |

## 셋업 / 도구

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `TanStackRouterVite` 플러그인 | 파일 스캔 → `routeTree.gen.ts` 생성 | [00](00-getting-started.md#3-플러그인-셋업) | `apps/bible/vite.config.ts` |
| `createRouter` | 라우터 인스턴스 생성 (context/preload 옵션) | [00](00-getting-started.md#4-라우터-부트스트랩) | `apps/bible/src/main.tsx` |
| `Register` 타입 선언 | 전역 타입 등록 → 앱 전체 타입 추론 | [00](00-getting-started.md#4-라우터-부트스트랩) | `apps/bible/src/main.tsx` |
| Router Devtools | 매칭된 라우트/loader/search 관찰 | [00](00-getting-started.md#5-devtools-읽는-법) | `/getting-started` · 좌하단 아이콘 |
| `defaultPreload: 'intent'` | 링크 hover 시 미리 로드 | [00](00-getting-started.md#4-라우터-부트스트랩) | 전 링크 |

## API 빠른 참조 (구현된 것)

| API | 용도 | 문서 |
|-----|------|------|
| `createRootRouteWithContext<T>()` | 컨텍스트 타입을 가진 루트 라우트 | [00](00-getting-started.md) · [01](01-routing.md) |
| `createFileRoute('/path')({...})` | 파일 라우트 정의 | [01](01-routing.md) |
| `<Outlet />` | 자식 라우트 렌더 위치 | [01](01-routing.md#layout-라우트와-outlet) |
| `<Link to params activeOptions>` | 타입 안전 내비게이션 | [01](01-routing.md) · (상세 02) |
| `Route.useParams()` | 해당 라우트의 path params | [01](01-routing.md#동적-세그먼트--매칭) |
| `Route.useLoaderData()` | 해당 라우트의 loader 반환값 | [01](01-routing.md#동적-세그먼트--매칭) |
| `loader: ({ params }) => ...` | 라우트 진입 전 데이터 로드 | (상세 04) |

## 네비게이션 (Chapter 02)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `<Link>` | 선언형 이동 (클릭 링크) | [02](02-navigation.md#최소-예제) | `/navigation/link` |
| `useNavigate()` | 명령형 이동 (코드로) | [02](02-navigation.md#2-search-를-상태처럼-다루기-updater-함수) | `/navigation/imperative` |
| `activeProps` / `inactiveProps` | active 상태별 스타일 | [02](02-navigation.md#1-active-상태-스타일링) | `/navigation/link` |
| `activeOptions={{ exact }}` | 정확 일치 vs 접두 매칭 | [02](02-navigation.md#1-active-상태-스타일링) | `/navigation/link` |
| Link render-prop `isActive` | children 함수로 내용 토글 | [02](02-navigation.md#1-active-상태-스타일링) | `/navigation/link` |
| `search: (prev) => ...` | search 를 상태처럼 갱신 | [02](02-navigation.md#2-search-를-상태처럼-다루기-updater-함수) | `/navigation/imperative` |
| `replace: true` | 히스토리 교체(뒤로가기 안 남김) | [02](02-navigation.md#2-search-를-상태처럼-다루기-updater-함수) | `/navigation/imperative` |
| `linkOptions()` | 재사용 가능한 타입 안전 링크 설정 | [02](02-navigation.md#3-linkoptions--재사용-가능한-타입-안전-링크-설정) | `/navigation/link` |
| `<Navigate>` / `redirect()` | 선언형/로직 리다이렉트 | [02](02-navigation.md#8-조연들) | (06에서 실사용) |
| `preload` / `defaultPreload` | 클릭 전 미리 로드 | [02](02-navigation.md#preloading--클릭-전에-미리-받기) | `/navigation/preloading` |
| `router.subscribe(type, cb)` | 이동 생명주기 이벤트 구독 | [02](02-navigation.md#router-events--이동-생명주기-관찰) | `/navigation/events` |
| `useRouterState({ select })` | 라우터 상태 구독 (status 등) | [02](02-navigation.md#router-events--이동-생명주기-관찰) | `/navigation/events` |

## 파라미터 (Chapter 03)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| Path Params (`$id`) | 경로 조각 → `params.*` | [03](03-params.md#path-params) | `/params/path/$userId` |
| **선택적 param** `{-$id}` | 있어도 되고 없어도 되는 세그먼트 | [03](03-params.md#선택적-path-param---param) | (19장 i18n) |
| **prefix** `pre-{$id}` | 세그먼트 앞부분 고정 | [03](03-params.md#prefix--suffix--세그먼트-일부만-변수로) | — |
| **suffix** `{$id}.txt` | 세그먼트 뒷부분 고정 | [03](03-params.md#prefix--suffix--세그먼트-일부만-변수로) | — |
| **splat `_splat`** | 남은 경로 전부. 변수명 고정 | [03](03-params.md#splat--남은-경로-전부-_splat) | — |
| **`params.priority`** | 매칭 후보가 겹칠 때 시도 순서 | [03](03-params.md#paramspriority--매칭-후보가-겹칠-때) | — |
| `params.parse` → `false` | 매칭 포기하고 다음 후보로 | [03](03-params.md#paramspriority--매칭-후보가-겹칠-때) | — |
| `pathParamsAllowedCharacters` | 이스케이프 예외 문자 8종 | [03](03-params.md#pathparamsallowedcharacters--이스케이프-예외) | — |
| `params: { parse, stringify }` | path param 타입 변환(string↔number 등) | [03](03-params.md#최소-예제--타입-변환) | `/params/path` |
| `Route.useParams()` | 해당 라우트 path params | [03](03-params.md#path-params) | `/params/path/$userId` |
| `validateSearch` | search 스키마 검증(타입 소스) | [03](03-params.md#search-params--1급-검증타입) | `/params/search` |
| `Route.useSearch()` | 검증된 search 값 읽기 | [03](03-params.md#search-params--1급-검증타입) | `/params/search` |
| zod / manual / valibot 검증 | 같은 검증의 여러 구현 | [03](03-params.md#옵션변형--같은-검증-다른-방법) | `/params/search` |
| `.catch(기본값)` (zod) | 잘못된 값 → 기본값 폴백 | [03](03-params.md#search-params--1급-검증타입) | `/params/search` |
| 배열·객체 Search | 복합 값도 1급 | [03](03-params.md#커스텀-직렬화-custom-serialization) | `/params/serialization` |
| `parseSearch`/`stringifySearch` | 라우터 레벨 커스텀 직렬화 | [03](03-params.md#커스텀-직렬화-custom-serialization) | (코드 참조) |

## 데이터 로딩/변경 (Chapter 04)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `loader` | 렌더 전 데이터 로드 | [04](04-data-loading.md#loader--pending--error) | `/data/basics` |
| `Route.useLoaderData()` | loader 반환값 읽기 | [04](04-data-loading.md#loader--pending--error) | `/data/basics` |
| `pendingComponent` | 로딩 대기 UI(pendingMs 초과 시) | [04](04-data-loading.md#loader--pending--error) | `/data/basics?slow=true` |
| `errorComponent` | loader throw 시 에러 UI | [04](04-data-loading.md#loader--pending--error) | `/data/basics?fail=true` |
| `loaderDeps` | loader 의존값 선언 → 바뀌면 재실행 | [04](04-data-loading.md#loaderdeps--staletime) | `/data/deps` |
| `staleTime` / `gcTime` | 캐시 신선도 / 수거 시간 | [04](04-data-loading.md#loaderdeps--staletime) | `/data/deps` |
| `router.invalidate()` | 변경 후 loader 재실행 | [04](04-data-loading.md#mutations--invalidate) | `/data/mutations` |
| `notFound()` | loader 에서 없음 처리 | [04](04-data-loading.md#not-found-loader-맥락) | (06에서 실사용) |

## 타입 안전성 & 컨텍스트 (Chapter 05)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `Register` 선언 | 앱 전역 타입 추론 스위치 | [05](05-type-safety-context.md#타입은-어떻게-흐르는가) | `main.tsx` |
| `createRootRouteWithContext<T>()` | context 타입을 가진 루트 | [05](05-type-safety-context.md#router-context--타입-있는-의존성-주입) | `__root.tsx` |
| `beforeLoad` 로 context 병합 | 값을 더해 자식에 전달 | [05](05-type-safety-context.md#router-context--타입-있는-의존성-주입) | `/type-safety/context` |
| `Route.useRouteContext()` | 병합된 context 읽기 | [05](05-type-safety-context.md#router-context--타입-있는-의존성-주입) | `/type-safety/context` |
| `getRouteApi(path)` | 라우트 밖에서 타입 유지 접근 | [05](05-type-safety-context.md#getrouteapi--컴포넌트-밖에서도-타입-유지) | `/type-safety/utils` |
| `useSearch({ from })` / `{ strict: false }` | 라우트 밖 훅 사용 | [05](05-type-safety-context.md#옵션변형--strict--from--타입-유틸) | `/type-safety/utils` |
| `LinkProps` 등 타입 유틸 | 재사용 타입 헬퍼 | [05](05-type-safety-context.md#옵션변형--strict--from--타입-유틸) | (코드 참조) |

## 라이프사이클 & 인증 (Chapter 06)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `beforeLoad` | 진입 전 최우선 실행(게이트) | [06](06-lifecycle-auth.md#authenticated-routes--pathless-레이아웃--가드) | `/auth/dashboard` |
| pathless 레이아웃 (`_x.tsx`) | URL 없이 가드/레이아웃 공유 | [06](06-lifecycle-auth.md#authenticated-routes--pathless-레이아웃--가드) | `auth._protected.tsx` |
| `redirect({ to, search })` | beforeLoad 에서 던져 이동 | [06](06-lifecycle-auth.md#authenticated-routes--pathless-레이아웃--가드) | `/auth/dashboard` |
| `router.history.push(href)` | 임의 문자열 경로로 이동 | [06](06-lifecycle-auth.md#authenticated-routes--pathless-레이아웃--가드) | `/auth/login` |
| `notFound()` | 없음 처리(에러 아님) | [06](06-lifecycle-auth.md#not-found-errors) | `/auth/notfound` |
| `notFoundComponent` | 없음 전용 UI(라우트/전역) | [06](06-lifecycle-auth.md#not-found-errors) | `/auth/notfound?missing=true` |

## TanStack Query 통합 (Chapter 07)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `queryOptions()` | key+fn 한 곳 정의(공유) | [07](07-query-integration.md#queryoptions--한-번-정의해-공유) | `lib/queries.ts` |
| `queryClient.ensureQueryData()` | loader 에서 프리페치 | [07](07-query-integration.md#loader-프리페치--usesuspensequery) | `/query/prefetch` |
| `useSuspenseQuery()` | 캐시에서 즉시 읽기 | [07](07-query-integration.md#loader-프리페치--usesuspensequery) | `/query/prefetch` |
| search → `queryKey` | search 값이 캐시 키로 | [07](07-query-integration.md#search-params--querykey) | `/query/search` |
| `useMutation()` | 변경 + 상태(isPending) | [07](07-query-integration.md#mutation--usemutation--invalidatequeries) | `/query/mutation` |
| `invalidateQueries({ queryKey })` | 키 단위 정밀 무효화 | [07](07-query-integration.md#mutation--usemutation--invalidatequeries) | `/query/mutation` |

## 시너지 종합 (Chapter 08)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| pathless `_app` 가드 | 하위 전체 보호 | [08](08-synergy.md#1-보호--pathless-레이아웃-하나로) | `/kitchen-sink` |
| search → loader → queryKey | 필터 상태의 전 흐름 | [08](08-synergy.md#2-카탈로그--search--loader-프리페치--캐시) | `/kitchen-sink` |
| Path Param → 프리페치 → notFound | 상세 조회 흐름 | [08](08-synergy.md#3-상세--path-param--프리페치--notfound) | `/kitchen-sink/$productId` |

전 Chapter(01~07)가 한 앱에 합쳐지는 종합 예제다.

---

# 심화 (Chapter 09–17)

`@tanstack/react-router` 가 export 하는 **100개 API 전부**와 라우터·라우트·Link 옵션
**81개 전부**가 아래 어딘가에 실려 있다. 커버리지는 스크립트로 검증한다(README 참조).

> 🚫 표시는 **SSR이 있어야 동작하는 항목**이다. 이 저장소는 GitHub Pages 정적 배포(CSR)라
> 실행 예제를 두지 않고 **설명과 예시 코드로만** 다룬다. 표시가 없는 항목은 전부 CSR에서
> 동작한다.

## 코드 스플리팅 & Lazy (Chapter 09)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `autoCodeSplitting` | 플러그인 옵션 한 줄로 전체 자동 분할 | [09](09-code-splitting.md#①-최소-예제--플러그인에-한-줄) | `apps/bible/vite.config.ts` |
| `createLazyFileRoute` | 컴포넌트만 별도 파일(`.lazy.tsx`)로 | [09](09-code-splitting.md#②-lazytsx--파일을-둘로-나누는-방식) | (코드 조각) |
| `createLazyRoute` | 코드기반 라우팅용 lazy | [09](09-code-splitting.md#코드기반-라우팅이라면-createlazyroute) | — |
| `lazyRouteComponent` | 컴포넌트 단위 지연 로드 (preload 연동) | [09](09-code-splitting.md#③-lazyroutecomponent--컴포넌트-단위로-직접) | — |
| `lazyFn` | 함수(loader) 지연 로드 | [09](09-code-splitting.md#lazyfn--loader를-늦게-받기) | — |
| `FileRouteLoader` ⚠️ | deprecated — loader는 본체 파일에 | [09](09-code-splitting.md#lazyfn--loader를-늦게-받기) | — |
| `codeSplitGroupings` | 라우트별 분할 단위 지정 | [09](09-code-splitting.md#라우트-하나만--codesplitgroupings) | — |
| `codeSplittingOptions` | 앱 전역 분할 정책(`splitBehavior`) | [09](09-code-splitting.md#앱-전체--codesplittingoptions) | — |
| `wrapInSuspense` | 강제 Suspense 경계 | [09](09-code-splitting.md#wrapinsuspense--강제로-suspense-경계-만들기) | — |

## Deferred & 스트리밍 (Chapter 10)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| Promise 그대로 반환 | `await` 없이 넘기면 부분 스트리밍 | [10](10-deferred-streaming.md#최소-예제) | `/deferred` |
| `<Await>` | Promise를 기다려 render prop으로 | [10](10-deferred-streaming.md#await-의-세-부분) | `/deferred` |
| `useAwaited()` | 훅 버전 (경계는 직접) | [10](10-deferred-streaming.md#useawaited--훅-버전) | — |
| `defer()` | 명시적 래핑 + `serializeError` | [10](10-deferred-streaming.md#defer--명시적으로-감싸기) | — |
| `createControlledPromise()` | 밖에서 resolve/reject 하는 Promise | [10](10-deferred-streaming.md#createcontrolledpromise--밖에서-결정하는-promise) | — |

## Match API & 라우터 상태 (Chapter 11)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `useMatch({ from })` | 매치 하나 + 그 상태 전부 | [11](11-match-api.md#usematch--매치-하나-읽기) | `/matches` |
| `useMatches()` | 매치 전부 → 브레드크럼 | [11](11-match-api.md#usematches--전부-읽기) | `/matches` |
| `isMatch()` | 매치 타입 가드 (filter 함정 주의) | [11](11-match-api.md#대표-용도-①-브레드크럼) | `/matches` |
| `useParentMatches()` | 상위 매치들 (부모 쪽) | [11](11-match-api.md#useparentmatches--usechildmatches) | — |
| `useChildMatches()` | 하위 매치들 (자식 쪽) | [11](11-match-api.md#useparentmatches--usechildmatches) | — |
| `useMatchRoute()` | "지금 여기 있나?" 판정 함수 | [11](11-match-api.md#usematchroute--matchroute--지금-여기-있나-판정) | `/matches` |
| `<MatchRoute>` | 위와 같은 일을 컴포넌트로 | [11](11-match-api.md#usematchroute--matchroute--지금-여기-있나-판정) | — |
| `<Matches>` | 매치 트리 직접 렌더 | [11](11-match-api.md#matches--매치-트리-렌더) | — |
| `useLocation()` | 현재 URL 정보 (`select` 권장) | [11](11-match-api.md#uselocation--현재-url-정보) | `/matches` |
| `useLoaderDeps()` | loader 의존값 (디버깅) | [11](11-match-api.md#useloaderdeps--loader-의존값-읽기) | — |
| `useCanGoBack()` | 뒤로 갈 수 있나 | [11](11-match-api.md#usecangoback--뒤로-갈-수-있나) | `/matches` |
| `abortController` | loader 인자 — 요청 취소 | [11](11-match-api.md#abortcontroller--요청-취소) | — |
| `cause` | `'preload'`\|`'enter'`\|`'stay'` | [11](11-match-api.md#cause--왜-실행됐나) | — |
| `structuralSharing` | select 결과 참조 유지 | [11](11-match-api.md#structuralsharing--둘을-합칠-때) | — |

## 에러 · NotFound 경계 (Chapter 12)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| Error/NotFound/Redirect 구분 | 셋은 다르게 다뤄야 한다 | [12](12-error-boundaries.md#한-줄-정의--언제-쓰나) | `/data/basics?fail=true` |
| `errorComponent` | `{ error, info, reset }` | [12](12-error-boundaries.md#①-error--errorcomponent) | `/data/basics?fail=true` |
| `errorComponent: null` | 경계 해제 → 부모로 전파 | [12](12-error-boundaries.md#errorcomponent-null--경계를-없애기) | — |
| `ErrorComponent` | 기본 제공 에러 화면 | [12](12-error-boundaries.md#errorcomponent--기본-제공-컴포넌트) | — |
| `onError` / `onCatch` | 로깅·모니터링 훅 | [12](12-error-boundaries.md#onerror--잡기-전에-관찰하기) | — |
| `notFound({ data, routeId })` | 없음 처리 + 경계 지정 | [12](12-error-boundaries.md#②-notfound--notfound-와-notfoundcomponent) | `/auth/notfound` |
| `notFoundMode` | `'fuzzy'`(기본) \| `'root'` | [12](12-error-boundaries.md#notfoundmode--어디서-잡을지의-전역-정책) | — |
| `DefaultGlobalNotFound` | 기본 404 화면 | [12](12-error-boundaries.md#defaultglobalnotfound--기본-404-화면) | — |
| `isRedirect` / `isNotFound` | 정상 흐름을 에러로 집계하지 않기 | [12](12-error-boundaries.md#③-redirect--그리고-판별-함수들) | — |
| `<CatchBoundary>` | 영역 단위 에러 경계(`getResetKey`) | [12](12-error-boundaries.md#catchboundary) | `/deferred` |
| `<CatchNotFound>` | 영역 단위 404 경계 | [12](12-error-boundaries.md#catchnotfound) | — |
| `disableGlobalCatchBoundary` | 전역 경계 끄기 | [12](12-error-boundaries.md#disableglobalcatchboundary) | — |
| `SearchParamError` | search 검증 실패 전용 에러 | [12](12-error-boundaries.md#검증-실패는-별도-에러다--searchparamerror--pathparamerror) | — |
| `Wrap` / `InnerWrap` | 라우터를 감싸는 래퍼 옵션 | [12](12-error-boundaries.md#라우터-전역-기본값-정리) | — |

## Search 미들웨어 & 직렬화 (Chapter 13)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `search.middlewares` | 이동할 때마다 search 가공 | [13](13-search-middleware.md#최소-예제--필터-유지하기) | `/search-mw` |
| `retainSearchParams` | 값을 이동에 따라다니게 | [13](13-search-middleware.md#retainsearchparams--값을-붙들어-두기) | `/search-mw` |
| `stripSearchParams` | 기본값이면 URL에서 제거 | [13](13-search-middleware.md#stripsearchparams--값을-지우기) | `/search-mw` |
| 커스텀 미들웨어 | `({ search, next, meta }) => …` | [13](13-search-middleware.md#직접-미들웨어-만들기) | — |
| `preSearchFilters` ⚠️ | deprecated → `search.middlewares` | [13](13-search-middleware.md#presearchfilters--postsearchfilters-는-deprecated) | — |
| `parseSearchWith` / `stringifySearchWith` | URL 직렬화 방식 교체 | [13](13-search-middleware.md#parsesearchwith--stringifysearchwith) | `/params/serialization` |
| `defaultParseSearch` / `defaultStringifySearch` | 기본 구현 (JSON 기반) | [13](13-search-middleware.md#기본-동작) | — |
| `createSerializationAdapter` 🚫 | 커스텀 타입 SSR 직렬화 | [13](13-search-middleware.md#createserializationadapter--커스텀-타입-직렬화) | SSR 전용 |

## 네비게이션 차단 & History (Chapter 14)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `useBlocker` | 이동 차단 (`shouldBlockFn`) | [14](14-blocking-history.md#네비게이션-차단--useblocker) | `/blocking` |
| `withResolver: true` | 커스텀 확인 UI (`proceed`/`reset`) | [14](14-blocking-history.md#커스텀-확인-ui--withresolver-true) | `/blocking` |
| `enableBeforeUnload` | 탭 닫기·새로고침도 경고 | [14](14-blocking-history.md#옵션-네-가지) | `/blocking` |
| `<Block>` | 컴포넌트 버전 | [14](14-blocking-history.md#block--컴포넌트-버전) | — |
| `createBrowserHistory` | 기본 히스토리 (`/posts/1`) | [14](14-blocking-history.md#createbrowserhistory--기본값) | `main.tsx` |
| `createHashHistory` | `/#/posts/1` — 서버 설정 불필요 | [14](14-blocking-history.md#createhashhistory--서버-설정이-불가능할-때) | — |
| `createMemoryHistory` | 주소창 없이 — 테스트·SSR | [14](14-blocking-history.md#creatememoryhistory--주소가-없는-환경) | — |
| `createHistory` | 직접 구현하는 저수준 팩토리 | [14](14-blocking-history.md#createhistory--직접-만들기) | — |
| `router.history.*` | push/replace/go/back/canGoBack… | [14](14-blocking-history.md#routerhistory--직접-조작하기) | `/auth/login` |
| 오픈 리다이렉트 방어 | `history.push` 에 사용자 입력 주의 | [14](14-blocking-history.md#navigate-와-historypush-는-다르다) | `/auth/login` |

## Masking · 스크롤 · 전환 (Chapter 15)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `<Link mask>` | 주소창에 다른 URL 보이기 | [15](15-masking-scroll.md#최소-예제--링크-단위-마스킹) | — |
| `createRouteMask` | 전역 마스킹 규칙 | [15](15-masking-scroll.md#라우터-전역-마스킹--createroutemask) | — |
| `unmaskOnReload` | 새로고침 시 마스크 해제 | [15](15-masking-scroll.md#unmaskonreload--새로고침-시-동작) | — |
| `scrollRestoration` | 뒤로가기 시 스크롤 복원 | [15](15-masking-scroll.md#최소-예제--옵션-한-줄) | `main.tsx` |
| `getScrollRestorationKey` | 스크롤 저장 키 (기본 `href`) | [15](15-masking-scroll.md#①-getscrollrestorationkey--언제-바꾸나) | — |
| `scrollToTopSelectors` | 내부 패널도 맨 위로 | [15](15-masking-scroll.md#③-scrolltotopselectors) | — |
| `useElementScrollRestoration` | 개별 요소 스크롤 복원 | [15](15-masking-scroll.md#useelementscrollrestoration--개별-요소-복원) | — |
| `defaultViewTransition` | 전환 애니메이션 | [15](15-masking-scroll.md#최소-예제) | — |
| View Transition `types` | 전환 종류별 CSS 분기 | [15](15-masking-scroll.md#types--전환-종류-구분하기) | — |
| `defaultHashScrollIntoView` | `#hash` 로 스크롤 | [15](15-masking-scroll.md#defaulthashscrollintoview) | — |

## 커스텀 Link · SSR API · 유틸 (Chapter 16)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `createLink()` | 내 컴포넌트를 타입 안전 링크로 | [16](16-custom-link-utils.md#createlink--컴포넌트를-링크로-승격) | — |
| `useLinkProps()` | `<a>` props만 뽑아 쓰기 | [16](16-custom-link-utils.md#uselinkprops--props만-뽑아-쓰기) | — |
| `<HeadContent>` 🚫 | 라우트별 `<head>` 태그 렌더 | [16](16-custom-link-utils.md#headcontent---head-태그-관리) | SSR 전용 |
| `<Scripts>` / `<Asset>` / `<ScriptOnce>` 🚫 | 스크립트·태그 렌더 (FOUC 방지) | [16](16-custom-link-utils.md#scripts---스크립트-렌더) | SSR 전용 |
| `useTags()` 🚫 | 현재 매치의 태그 목록 | [16](16-custom-link-utils.md#usetags) | SSR 전용 |
| `<ClientOnly>` / `useHydrated()` 🚫 | 서버 렌더 제외 | [16](16-custom-link-utils.md#clientonly--usehydrated) | SSR 전용 |
| `RouterContextProvider` | 라우터 컨텍스트만 제공 | [16](16-custom-link-utils.md#routercontextprovider) | — |
| `joinPaths` `cleanPath` `trimPath*` | 경로 문자열 유틸 | [16](16-custom-link-utils.md#3부--경로-조작-유틸) | — |
| `resolvePath` `interpolatePath` | 상대→절대, 템플릿에 params 채우기 | [16](16-custom-link-utils.md#3부--경로-조작-유틸) | — |
| `rootRouteId` | 루트 라우트 id 상수 | [16](16-custom-link-utils.md#3부--경로-조작-유틸) | — |
| `deepEqual` `replaceEqualDeep` | 깊은 비교 · 구조적 공유 | [16](16-custom-link-utils.md#값-비교-유틸) | — |
| `functionalUpdate` | "값 또는 업데이터" 패턴 처리 | [16](16-custom-link-utils.md#값-비교-유틸) | — |
| `isPlainObject` / `isPlainArray` | 순수 객체·배열 판정 | [16](16-custom-link-utils.md#값-비교-유틸) | — |
| `DEFAULT_PROTOCOL_ALLOWLIST` | 링크 프로토콜 허용 목록(XSS 방어) | [16](16-custom-link-utils.md#default_protocol_allowlist--링크-보안) | — |
| `composeRewrites` / `rewrite` / `origin` | 서브도메인 라우팅 등 URL 변환 | [16](16-custom-link-utils.md#rewrite--origin--composerewrites) | — |
| `reactUse` / `useLayoutEffect` | 내부 호환 레이어 (직접 쓸 일 없음) | [16](16-custom-link-utils.md#reactuse--uselayouteffect) | — |

## 옵션 전수 & 코드기반 라우팅 (Chapter 17)

| 항목 | 한 줄 | 문서 |
|------|-------|------|
| RouterOptions 총람 | core 43 + React 7 = **49개** | [17](17-options-reference.md#2부--routeroptions-전수) |
| Route 옵션 총람 | 매칭·데이터·컴포넌트·라이프사이클 | [17](17-options-reference.md#3부--route-옵션-전수) |
| Link/Navigate 옵션 총람 | 목적지·동작·Link 전용 | [17](17-options-reference.md#4부--link--navigate-옵션-전수) |
| loader/beforeLoad 인자 총람 | 14개 필드 | [17](17-options-reference.md#5부--loader--beforeload-인자-전수) |
| `createRootRoute` | 루트 라우트 생성 | [17](17-options-reference.md#createrootroute--createrootroutewithcontextt) |
| `rootRouteWithContext` ⚠️ | deprecated → `createRootRouteWithContext` | [17](17-options-reference.md#createrootroute--createrootroutewithcontextt) |
| `shellComponent` 🚫 | 루트 전용 — SSR 문서 껍데기 | [17](17-options-reference.md#루트-전용-옵션--shellcomponent) |
| `createRoute` | 코드기반 자식 라우트 (`getParentRoute` 필수) | [17](17-options-reference.md#createroute) |
| `RouteApi` / `getRouteApi` | id 문자열로 라우트 훅 접근 | [17](17-options-reference.md#routeapi--getrouteapi) |
| `FileRoute` ⚠️ / `LazyRoute` | deprecated 클래스 / lazy 반환 타입 | [17](17-options-reference.md#fileroute--lazyroute) |
| `createRouterConfig` 🚫 | 직렬화·SSR 설정 묶음 | [17](17-options-reference.md#createrouterconfig) |
| `staticData` | 라우트에 임의 메타 붙이기 | [17](17-options-reference.md#staticdata--라우트에-메타-붙이기) |
| `shouldReload` | 재검증 논리 제어 | [17](17-options-reference.md#shouldreload--재검증-제어) |
| `remountDeps` | 컴포넌트 재마운트 조건 | [17](17-options-reference.md#remountdeps--컴포넌트-재마운트-제어) |
| `onEnter` / `onStay` / `onLeave` | 라우트 생명주기 관찰 | [17](17-options-reference.md#라이프사이클-관찰) |
| `activeOptions.explicitUndefined` | undefined search 엄격 판정 | [17](17-options-reference.md#activeoptions-네-가지) |

## 생성기 설정 · CLI · Virtual Routes (Chapter 18)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `tsr.config.json` / 플러그인 옵션 | 18개 전수 표 | [18](18-generator-config.md#설정-옵션-전수) | `vite.config.ts` |
| `routeFileIgnorePattern` | 정규식으로 테스트·스토리 파일 제외 | [18](18-generator-config.md#경로--파일-인식) | — |
| `routeToken` / `indexToken` | 레이아웃·index 파일명 변경 (정규식 가능) | [18](18-generator-config.md#경로--파일-인식) | — |
| `routeTreeFileHeader` / `Footer` | 생성 파일에 지시문 삽입 | [18](18-generator-config.md#생성-코드-스타일) | — |
| `tmpDir` | 원자적 쓰기용 임시 폴더(`.tanstack`) | [18](18-generator-config.md#동작-제어) | — |
| `tsr generate` / `tsr watch` | 번들러 없을 때 쓰는 CLI | [18](18-generator-config.md#router-cli--번들러-없이-쓰기) | — |
| **Virtual File Routes** | 파일 구조와 URL 을 분리 | [18](18-generator-config.md#virtual-file-routes--파일-구조와-url을-분리하기) | — |
| `rootRoute` `route` `index` `layout` | 가상 트리 선언 API | [18](18-generator-config.md#api-네-개--하나) | — |
| `physical()` | 그 하위는 기존 파일기반 규칙으로 | [18](18-generator-config.md#api-네-개--하나) | — |
| `__virtual.ts` | 하위 트리만 가상 설정 | [18](18-generator-config.md#하위-트리만-가상으로--__virtualts) | — |

## 국제화 i18n (Chapter 19)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `{-$locale}` 패턴 | 라우트 하나로 `/about` · `/en/about` 처리 | [19](19-i18n.md#최소-예제--optional-path-param-하나로) | — |
| locale 검증 | `beforeLoad` + `notFound()` | [19](19-i18n.md#locale-검증하기) | — |
| 언어 전환 | `params={(prev) => ({ ...prev, locale })}` | [19](19-i18n.md#언어-전환--나머지-params-유지하기) | — |
| `rewrite` 로 locale 분리 | 라우트 트리에서 locale 을 걷어낸다 | [19](19-i18n.md#rewrite-로-locale을-url-층에서-분리하기) | — |
| `<html lang>` 갱신 | 접근성·SEO | [19](19-i18n.md#html-lang-속성) | — |

## ESLint & Devtools (Chapter 20)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| **라우트 속성 순서** | 순서가 타입 추론을 바꾼다 | [20](20-eslint-devtools.md#왜-필요한가--속성-순서가-타입을-바꾼다) | — |
| 필수 순서 | params → loaderDeps → context → beforeLoad → loader | [20](20-eslint-devtools.md#필수-순서) | — |
| `@tanstack/eslint-plugin-router` | 설치·flat/legacy 설정 | [20](20-eslint-devtools.md#설치와-설정) | — |
| `create-route-property-order` | 유일한 규칙. 자동 수정 가능 | [20](20-eslint-devtools.md#제공-규칙) | — |
| `only-throw-error` 충돌 | redirect/notFound 는 throw 다 | [20](20-eslint-devtools.md#typescript-eslintonly-throw-error-와의-충돌) | — |
| Devtools 읽는 법 | Matches · Loader Data · Search · Route Tree | [20](20-eslint-devtools.md#무엇을-볼-수-있나--읽는-법) | 좌하단 아이콘 |
| Devtools 프로덕션 제외 | 조건부 lazy 로딩 | [20](20-eslint-devtools.md#프로덕션-번들에서-빼기) | — |

## 실전 레시피 (Chapter 21)

공식 `how-to` 문서를 문제 해결 관점으로 묶었다. 새 API 는 거의 없고 앞 장들의 조합이다.

| 레시피 | 핵심 | 문서 | 밑바탕 |
|--------|------|------|--------|
| 테스트 작성 | `createMemoryHistory` + `renderWithRouter` 헬퍼 | [21](21-recipes.md#1-테스트-작성하기) | 14 · 17 |
| `router.state` 검증 | 화면 텍스트보다 라우터 상태를 본다 | [21](21-recipes.md#무엇을-테스트하나) | 11 |
| E2E (Playwright) | `toHaveURL` 이 곧 상태 검증 | [21](21-recipes.md#e2e는-playwright) | — |
| 디버깅 체크리스트 | 증상 → 원인 → 해결 표 | [21](21-recipes.md#2-라우터-문제-디버깅) | 20 |
| `window.router` 노출 | 콘솔에서 `router.state` 직접 확인 | [21](21-recipes.md#콘솔에서-바로-쓰는-명령) | 20 |
| SPA 배포 폴백 | 플랫폼별 rewrite 설정 (GitHub Pages = 404.html) | [21](21-recipes.md#3-프로덕션-배포) | 14 |
| base path 배포 | `base` 와 `basepath` 를 함께 맞춘다 | [21](21-recipes.md#하위-경로-배포--base-path) | 00 |
| 환경변수 | `VITE_` 접두사 · 타입 선언 · 빌드 시점 치환 | [21](21-recipes.md#4-환경변수-다루기) | 16 |
| 환경변수 보안 | 접두사는 보안이 아니다 — 시크릿 금지 | [21](21-recipes.md#보안--반드시-지킬-것) | — |
| **Date in search** | ISO 문자열로 넣는다 (`[object Object]` 방지) | [21](21-recipes.md#date가-가장-큰-함정) | 03 · 13 |
| 배열·중첩 객체 search | 새 배열 생성 · 단계마다 spread | [21](21-recipes.md#배열) | 03 |
| URL 길이 한계 | 약 2000자 — 넘치면 서버에 저장하고 id 만 | [21](21-recipes.md#알아-둘-제약) | — |
| search 공유 3층위 | root · 레이아웃 · 링크 단위 | [21](21-recipes.md#6-여러-라우트에서-search-공유) | 13 |
| 인증 구조 | `context: { auth: undefined! }` + Provider 주입 | [21](21-recipes.md#7-인증-붙이기) | 05 · 06 |
| 인증 로딩 처리 | 확인 전 라우터를 띄우면 깜빡임이 생긴다 | [21](21-recipes.md#외부-인증-공급자auth0clerksupabase) | 06 |
| **RBAC** | `hasRole`/`hasPermission` 을 context 에 | [21](21-recipes.md#8-rbac--역할-기반-접근-제어) | 05 · 06 |
| 401 vs 403 | 미인증 → `/login`, 권한없음 → `/unauthorized` | [21](21-recipes.md#401과-403을-구분한다) | 12 |
| UI 라이브러리 통합 | shadcn · MUI · Chakra · Framer Motion | [21](21-recipes.md#9-ui-라이브러리-통합) | 16 |
| React Router 이사 | 개념 대응표 + 점진 이전 전략 | [21](21-recipes.md#10-react-router에서-이사하기) | 01 · 18 |

## 설계 철학 & FAQ (Chapter 22)

| 항목 | 한 줄 | 문서 |
|------|-------|------|
| 출발점 | Nozzle 대시보드의 search params 요구에서 시작 | [22](22-design-decisions-faq.md#출발점--대시보드의-search-params) |
| JSX 라우트를 쓰지 않는 이유 | TypeScript 가 라우트를 추론하지 못한다 | [22](22-design-decisions-faq.md#jsx로-라우트를-정의할-수-없는-이유) |
| `Register` 선언이 필요한 이유 | 모듈 선언 병합으로 앱 전역 타입 추론을 켠다 | [22](22-design-decisions-faq.md#register-선언이-필요한-이유) |
| 파일기반을 권하는 이유 | 보일러플레이트를 플러그인이 대신 쓴다 | [22](22-design-decisions-faq.md#왜-파일기반을-권하나) |
| 다른 라우터와의 비교 | Next.js · Remix/React Router 와의 트레이드오프 | [22](22-design-decisions-faq.md#다른-라우터-대신-이걸-쓸-이유가-있나) |
| 프레임워크인가 | 아니다. 풀스택은 TanStack Start | [22](22-design-decisions-faq.md#프레임워크인가) |
| **`routeTree.gen.ts` 커밋** | 공식은 "커밋하라". 이 저장소는 따르지 않는다 | [22](22-design-decisions-faq.md#routetreegents-를-커밋해야-하나) |
| 루트 조건부 렌더 | 불가능. Layout/Pathless 라우트를 쓴다 | [22](22-design-decisions-faq.md#루트-라우트를-조건부로-렌더할-수-있나) |
| Parallel Routes | **공식 문서 미작성** 상태 | [22](22-design-decisions-faq.md#parallel-routes-는-어떻게-쓰나) |

## 번들러별 설치 (Chapter 18 보강)

| 번들러 | import 경로 | 문서 |
|--------|-------------|------|
| Vite | `@tanstack/router-plugin/vite` | [18](18-generator-config.md#vite-이-저장소가-쓰는-방식) |
| Rspack / Rsbuild | `@tanstack/router-plugin/rspack` | [18](18-generator-config.md#rspack--rsbuild) |
| Webpack | `@tanstack/router-plugin/webpack` | [18](18-generator-config.md#webpack) |
| Esbuild | `@tanstack/router-plugin/esbuild` | [18](18-generator-config.md#esbuild) |
| 번들러 없음 | 코드기반 라우팅으로 전환 | [18](18-generator-config.md#번들러가-없을-때--수동-설치) |

## 타입 export (Chapter 17 · 6부)

값 100개 외에 **타입만 204개**가 export 된다. 직접 쓰게 되는 80개는 아래 갈래로 정리돼
있고, 나머지 124개는 제네릭 추론용 내부 헬퍼다.

| 갈래 | 대표 타입 | 문서 |
|------|-----------|------|
| 컴포넌트 props | `ErrorComponentProps` · `NotFoundRouteProps` · `RouteComponent` | [17](17-options-reference.md#컴포넌트-props) |
| 링크 · 이동 | `LinkProps` · `NavigateOptions` · `ActiveOptions` · `LinkComponent` | [17](17-options-reference.md#링크--이동) |
| 상태 · 매치 | `ParsedLocation` · `RouteMatch` · `RouterState` · `RouterEvents` | [17](17-options-reference.md#상태--매치) |
| 에러 · 리다이렉트 | `NotFoundError` · `Redirect` · `RedirectOptions` | [17](17-options-reference.md#에러--리다이렉트) |
| History | `RouterHistory` · `HistoryLocation` · `HistoryState` | [17](17-options-reference.md#history) |
| Deferred | `DeferredPromise` · `AwaitOptions` · `ControlledPromise` | [17](17-options-reference.md#deferred) |
| 설정 · 확장 | `SearchMiddleware` · `SerializationAdapter` · `UseBlockerOpts` | [17](17-options-reference.md#설정--확장) |
| **declaration merging 대상** | `Register` · `StaticDataRouteOption` · `SerializableExtensions` | [17](17-options-reference.md#declaration-merging-으로-확장하는-것) |
| 타입 유틸 | `Expand` · `Assign` · `Validator` | [17](17-options-reference.md#타입-유틸) |
| 내부 추론 헬퍼 (124개) | `AnyRoute` · `ResolveParams` · `RelativeToPath` | [17](17-options-reference.md#나머지--내부-추론-헬퍼) |
