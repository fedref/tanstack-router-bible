# 사전 (Dictionary) — 기능/API 역인덱스

개발 중 "이거 어디서 봤더라?" 를 위한 조회표. 기능·API 이름으로 문서와 실행 예제를 찾는다.
아직 미구현 항목은 (예정)으로 두고, Chapter이 완성될 때마다 채운다.

## 개념 / 파일 규약

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| 파일기반 라우팅 | `src/routes/**` → URL 트리 자동 생성 | [01](01-routing.md#라우트-트리는-파일-구조가-곧-url) | `/routing` |
| `__root.tsx` | 모든 라우트의 조상, 공통 레이아웃/컨텍스트 | [01](01-routing.md#라우트-종류) | `/` (사이드바) |
| Index 라우트 (`x.index.tsx`) | 부모 경로 자체에 매칭 | [01](01-routing.md#라우트-종류) | `/routing` |
| Layout 라우트 + `Outlet` | 자식을 감싸는 공유 레이아웃 | [01](01-routing.md#layout-라우트와-outlet) | `/routing`, `/routing/matching` |
| 동적 세그먼트 (`$param`) | URL 변수 → `params.*` | [01](01-routing.md#동적-세그먼트--매칭) | `/routing/matching/$productId` |
| Pathless Layout (`_x.tsx`) | URL엔 없지만 레이아웃/beforeLoad 공유 | (예정, 06) | (예정) |
| Splat (`$.tsx`) | 남은 경로 전부(404 등) | (예정, 06) | (예정) |
| 파일 네이밍 규칙 | `.`=경로구분, `$`=동적, `_`=pathless, `-`=제외 | [01](01-routing.md#네이밍-규칙-정리) | — |

## 셋업 / 도구

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| `TanStackRouterVite` 플러그인 | 파일 스캔 → `routeTree.gen.ts` 생성 | [00](00-getting-started.md#3-플러그인-셋업) | `app/vite.config.ts` |
| `createRouter` | 라우터 인스턴스 생성 (context/preload 옵션) | [00](00-getting-started.md#4-라우터-부트스트랩) | `app/src/main.tsx` |
| `Register` 타입 선언 | 전역 타입 등록 → 앱 전체 타입 추론 | [00](00-getting-started.md#4-라우터-부트스트랩) | `app/src/main.tsx` |
| Router Devtools | 매칭된 라우트/loader/search 관찰 | [00](00-getting-started.md#5-devtools-읽는-법) | 좌하단 아이콘 |
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
| `<Navigate>` / `redirect()` | 선언형/로직 리다이렉트 | [02](02-navigation.md#4-조연들) | (06에서 실사용) |
| `preload` / `defaultPreload` | 클릭 전 미리 로드 | [02](02-navigation.md#preloading--클릭-전에-미리-받기) | `/navigation/preloading` |
| `router.subscribe(type, cb)` | 이동 생명주기 이벤트 구독 | [02](02-navigation.md#router-events--이동-생명주기-관찰) | `/navigation/events` |
| `useRouterState({ select })` | 라우터 상태 구독 (status 등) | [02](02-navigation.md#router-events--이동-생명주기-관찰) | `/navigation/events` |

## 파라미터 (Chapter 03)

| 항목 | 한 줄 | 문서 | 예제 |
|------|-------|------|------|
| Path Params (`$id`) | 경로 조각 → `params.*` | [03](03-params.md#path-params) | `/params/path/$userId` |
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
