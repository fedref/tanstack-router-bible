# 17 · 옵션 전수 레퍼런스 & 코드기반 라우팅

> 성격: **총람(索引)**. 앞 장들이 "왜/언제"를 설명했다면, 이 장은 **"전부 몇 개이고 각각
> 무엇인가"** 를 빠짐없이 나열한다. 읽는 문서가 아니라 **찾는 문서**다.
> 기준 버전: `@tanstack/react-router@1.170.18` · `@tanstack/router-core@1.171.15`

---

# 1부 · 코드기반 라우팅 API

파일기반 라우팅(01장)을 쓰면 이 API들을 직접 부를 일이 거의 없다. 플러그인이 대신
생성해 주기 때문이다. 그러나 **테스트에서 라우터를 손으로 조립할 때**, 또는 파일 시스템을
쓸 수 없는 환경에서는 필요하다.

## `createRootRoute()` / `createRootRouteWithContext<T>()`

루트 라우트를 만든다. 파일기반에서는 `__root.tsx` 가 이걸 호출한다.

```tsx
import { createRootRoute, createRootRouteWithContext } from '@tanstack/react-router'

// 컨텍스트가 없을 때
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// 컨텍스트 타입이 있을 때 (이 저장소가 쓰는 방식)
interface RouterContext { queryClient: QueryClient }
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})
```

`createRootRouteWithContext` 는 **함수를 반환하는 함수**다. 타입 인자만 먼저 받고, 옵션은
두 번째 호출에서 받는다. 괄호가 두 번인 이유가 이것이다.

> `rootRouteWithContext` 는 **deprecated** 다. 타입 정의에
> `@deprecated Use the createRootRouteWithContext function instead` 로 표시되어 있다.
> `RootRoute` 클래스를 직접 `new` 하는 방식도 마찬가지로 옛 API다.

### 루트 전용 옵션 — `shellComponent` 🚫

> **SSR 전용 — 실행 예제 없음.** 이 저장소는 정적 배포라 문서 껍데기를 Vite가 만든
> `index.html` 이 담당한다. 아래는 SSR을 붙였을 때의 예시 코드다.

루트 라우트에만 있는 옵션이다. SSR에서 `<html>`, `<head>`, `<body>` 를 포함한 문서 껍데기를
정의한다.

```tsx
createRootRoute({
  shellComponent: ({ children }) => (
    <html>
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  ),
})
```

## `createRoute()`

자식 라우트를 만든다. **`getParentRoute` 가 필수**라는 점이 파일기반과의 결정적 차이다.
파일기반에서는 파일 위치가 부모를 알려 주지만, 여기서는 직접 지정해야 한다.

```tsx
const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts',
  component: PostsPage,
})

const postRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '$postId',
  loader: ({ params }) => fetchPost(params.postId),
})

// 트리 조립도 수동이다
const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postRoute]),
])

const router = createRouter({ routeTree })
```

파일기반에서는 이 조립 코드 전체가 `routeTree.gen.ts` 로 자동 생성된다.

## `RouteApi` / `getRouteApi()`

라우트 객체를 import하지 않고 **id 문자열만으로** 그 라우트의 훅에 접근한다. 05장에서
다뤘다.

```tsx
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/posts/$postId')

function AnyComponent() {
  const params = routeApi.useParams()          // 타입 안전
  const data = routeApi.useLoaderData()
  const search = routeApi.useSearch()
  const ctx = routeApi.useRouteContext()
  const match = routeApi.useMatch()
  const deps = routeApi.useLoaderDeps()
  const navigate = routeApi.useNavigate()
}
```

`getRouteApi(id)` 는 `RouteApi` 클래스의 인스턴스를 반환한다. `new RouteApi({ id })` 로
직접 만들 수도 있지만 함수 쪽이 표준이다.

**순환 import를 끊는 것**이 주 용도다. 컴포넌트가 라우트 파일을 import하고 라우트 파일이
컴포넌트를 import하는 구조에서, 문자열 id만 쓰면 의존이 생기지 않는다.

## `FileRoute` / `LazyRoute`

- **`FileRoute`** — `createFileRoute` 이전의 클래스 API. **deprecated** 다.
  타입 정의에 `@deprecated It's no longer recommended to use the FileRoute class directly` 로
  적혀 있다. `createFileRoute('/path')(options)` 를 쓴다.
- **`LazyRoute`** — `createLazyFileRoute` 가 반환하는 객체의 **타입**이다(09장). 값이
  아니라 타입이므로 직접 호출하지 않는다.

## `createRouterConfig()` 🚫

> **SSR 전용 — 실행 예제 없음.** 서버·클라이언트가 설정을 공유해야 의미가 있는 API다.

라우터 설정 중 **직렬화 어댑터와 SSR 기본값**을 미리 묶어 두는 헬퍼다. TanStack Start처럼
서버·클라이언트가 같은 설정을 공유해야 하는 환경에서 쓴다.

```tsx
import { createRouterConfig } from '@tanstack/react-router'

export const config = createRouterConfig({
  serializationAdapters: [moneyAdapter],
  defaultSsr: true,
})
```

순수 CSR 앱에서는 필요하지 않다.

---

# 2부 · RouterOptions 전수

`createRouter({ … })` 에 넣을 수 있는 전체 옵션이다. **core 43개 + React 어댑터 7개**.

## 필수·기본

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `routeTree` | — | **필수.** 라우트 트리 | 00 |
| `context` | `{}` | 루트 컨텍스트 초기값 | 05 |
| `additionalContext` | — | 컨텍스트에 덧붙일 값 | 05 |
| `basepath` | `/` | 앱이 놓인 하위 경로 | 00 |
| `history` | `createBrowserHistory()` | 히스토리 구현 | 14 |
| `caseSensitive` | `false` | 경로 대소문자 구분 | 01 |
| `trailingSlash` | `'never'` | 끝 슬래시 처리(`'always'`/`'never'`/`'preserve'`) | 01 |
| `pathParamsAllowedCharacters` | — | path param에 허용할 특수문자 배열 | 03 |
| `origin` | — | 절대 URL 기준 출처 | 16 |
| `rewrite` | — | URL 입출력 변환 | 16 |

## 프리로드 · 캐시

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `defaultPreload` | `false` | `'intent'` \| `'viewport'` \| `'render'` \| `false` | 02 |
| `defaultPreloadDelay` | `50` | intent 프리로드 지연(ms) | 02 |
| `defaultPreloadIntentProximity` | — | 커서가 얼마나 가까우면 프리로드할지(px) | 02 |
| `defaultPreloadStaleTime` | `30_000` | 프리로드 데이터 신선 기간 | 04 |
| `defaultPreloadGcTime` | — | 프리로드 캐시 수거 시간 | 04 |
| `defaultStaleTime` | `0` | loader 데이터 신선 기간 | 04 |
| `defaultGcTime` | `1_800_000`(30분) | 캐시 수거 시간 | 04 |
| `defaultStaleReloadMode` | — | `'background'` \| `'blocking'` — stale 재검증 방식 | 04 |
| `defaultRemountDeps` | — | 어떤 값이 바뀌면 컴포넌트를 재마운트할지 | 아래 |

## 대기 · 에러

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `defaultPendingMs` | `1000` | 이 시간 넘으면 pending UI 표시 | 04 |
| `defaultPendingMinMs` | `500` | pending UI 최소 표시 시간(깜빡임 방지) | 04 |
| `notFoundMode` | `'fuzzy'` | `'root'` \| `'fuzzy'` | 12 |
| `notFoundRoute` | — | (구 API) 404 라우트 | 12 |
| `disableGlobalCatchBoundary` | `false` | 전역 에러 경계 끄기 | 12 |

## 스크롤 · 전환

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `scrollRestoration` | `false` | 스크롤 복원 켜기 | 15 |
| `getScrollRestorationKey` | `(l) => l.href` | 스크롤 저장 키 | 15 |
| `scrollRestorationBehavior` | `'auto'` | `'auto'`\|`'instant'`\|`'smooth'` | 15 |
| `scrollToTopSelectors` | `['window']` | 맨 위로 올릴 추가 요소 | 15 |
| `defaultViewTransition` | `false` | View Transitions 사용 | 15 |
| `defaultHashScrollIntoView` | `true` | `#hash` 로 스크롤 | 15 |

## search · 직렬화

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `parseSearch` | `defaultParseSearch` | URL → 객체 | 13 |
| `stringifySearch` | `defaultStringifySearch` | 객체 → URL | 13 |
| `serializationAdapters` | `[]` | 커스텀 타입 직렬화 | 13 |
| `defaultStructuralSharing` | `false` | select 결과 구조적 공유 | 11 |

## 마스킹 · 보안

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `routeMasks` | `[]` | 전역 마스킹 규칙 | 15 |
| `unmaskOnReload` | `false` | 새로고침 시 마스크 해제 | 15 |
| `protocolAllowlist` | `http:` `https:` `mailto:` `tel:` | 허용 프로토콜 | 16 |

## SSR 전용 🚫

> **이 저장소에서는 동작하지 않는다.** GitHub Pages 정적 배포(CSR)이므로 서버가 없다.
> 설명만 싣고 실행 예제는 두지 않는다.

| 옵션 | 설명 |
|---|---|
| `isServer` | 서버 환경인지 |
| `isShell` | 셸(껍데기)만 렌더 중인지 |
| `isPrerendering` | 사전 렌더링 중인지 |
| `defaultSsr` | 라우트별 SSR 기본 정책 |
| `dehydrate` | 서버 상태를 직렬화하는 함수 |
| `hydrate` | 클라이언트에서 복원하는 함수 |
| `serializationAdapters` | 커스텀 타입 직렬화 (13장) |

## React 어댑터 전용

`@tanstack/react-router` 가 추가하는 옵션이다. core 문서에는 나오지 않는다.

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `defaultComponent` | `Outlet` | 컴포넌트 미지정 시 기본값 | 12 |
| `defaultErrorComponent` | `ErrorComponent` | 에러 컴포넌트 기본값 | 12 |
| `defaultPendingComponent` | — | 대기 컴포넌트 기본값 | 12 |
| `defaultNotFoundComponent` | `DefaultGlobalNotFound` | 404 컴포넌트 기본값 | 12 |
| `defaultOnCatch` | — | 전역 에러 관찰자 | 12 |
| `Wrap` | — | 라우터 전체를 감싸는 래퍼 | 12 |
| `InnerWrap` | — | 매치 트리 안쪽을 감싸는 래퍼 | 12 |

---

# 3부 · Route 옵션 전수

`createFileRoute('/path')({ … })` 에 넣을 수 있는 전체 옵션이다.

## 매칭 · 검증

| 옵션 | 설명 | 장 |
|---|---|---|
| `path` / `id` | 경로 또는 커스텀 id (파일기반에서는 자동) | 01 |
| `getParentRoute` | 부모 라우트 (코드기반 전용, 필수) | 17 |
| `validateSearch` | search 스키마 검증 | 03 |
| `params: { parse, stringify }` | path param 타입 변환 | 03 |
| `caseSensitive` | 이 라우트만 대소문자 구분 | 01 |
| `search: { middlewares }` | search 미들웨어 | 13 |
| `preSearchFilters` ⚠️ | **deprecated** → `search.middlewares` | 13 |
| `postSearchFilters` ⚠️ | **deprecated** → `search.middlewares` | 13 |

## 데이터

| 옵션 | 설명 | 장 |
|---|---|---|
| `beforeLoad` | 진입 전 최우선 실행. 가드·컨텍스트 주입 | 06 |
| `loader` | 데이터 로드 | 04 |
| `loaderDeps` | loader 의존값 선언 | 04 |
| `context` | 이 라우트가 추가할 컨텍스트 | 05 |
| `shouldReload` | 재방문 시 loader를 다시 돌릴지 (boolean 또는 함수) | 아래 |
| `remountDeps` | 어떤 값이 바뀌면 컴포넌트를 재마운트할지 | 아래 |
| `staleTime` / `gcTime` | 이 라우트의 캐시 정책 | 04 |
| `preload` | 이 라우트의 프리로드 여부 | 02 |
| `preloadStaleTime` / `preloadGcTime` | 프리로드 캐시 정책 | 02 |

## 컴포넌트

| 옵션 | 설명 | 장 |
|---|---|---|
| `component` | 본 화면 | 01 |
| `pendingComponent` | 로딩 중 | 04 |
| `errorComponent` | 에러 (`null`/`false` 로 경계 해제) | 12 |
| `notFoundComponent` | 404 | 12 |
| `pendingMs` / `pendingMinMs` | 대기 UI 타이밍 | 04 |
| `wrapInSuspense` | 강제 Suspense 경계 | 09 |
| `codeSplitGroupings` | 코드 분할 단위 | 09 |

## 라이프사이클 관찰

| 옵션 | 시점 |
|---|---|
| `onEnter` | 이 라우트에 **처음 진입**했을 때 |
| `onStay` | 이미 있던 라우트가 **재검증**됐을 때 |
| `onLeave` | 이 라우트를 **떠날 때** |
| `onError` | loader/beforeLoad 에러 발생 시 |
| `onCatch` | React 에러 경계가 잡았을 때 |

```tsx
export const Route = createFileRoute('/analytics')({
  onEnter: (match) => trackPageView(match.pathname),
  onLeave: (match) => flushPendingEvents(),
})
```

셋 다 `RouteMatch` 객체를 인자로 받는다. **분석 이벤트 전송**이 대표 용도다.
`useEffect` 로 하는 것과 달리 **라우터 생명주기에 정확히 붙으므로** 리렌더 영향을 받지
않는다.

## 기타

| 옵션 | 설명 | 장 |
|---|---|---|
| `staticData` | 라우트에 붙이는 임의의 정적 데이터 | 아래 |
| `head` 🚫 | `<head>` 태그 (meta/links/scripts/styles) — SSR 필요 | 16 |
| `scripts` 🚫 | 스크립트 태그 — SSR 필요 | 16 |
| `headers` 🚫 | HTTP 응답 헤더 — SSR 필요 | 16 |
| `ssr` 🚫 | 이 라우트의 SSR 정책 — SSR 필요 | 16 |

> 🚫 표시는 **이 저장소(GitHub Pages · CSR)에서 동작하지 않는 옵션**이다. `head` 는 CSR에서
> 호출은 되지만 초기 HTML에 태그가 없어 크롤러가 읽지 못하므로, SEO 목적이라면 SSR이
> 함께 필요하다.

### `staticData` — 라우트에 메타 붙이기

```tsx
export const Route = createFileRoute('/admin/users')({
  staticData: {
    title: '사용자 관리',
    icon: 'users',
    requiredRole: 'admin',
  },
})
```

읽을 때는 매치에서 꺼낸다(11장).

```tsx
const matches = useMatches()
const title = matches.at(-1)?.staticData.title
```

**타입을 확장**하면 전 라우트에서 강제할 수 있다.

```ts
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    title: string
    requiredRole?: 'admin' | 'user'
  }
}
```

이렇게 선언하면 `title` 을 빠뜨린 라우트가 **타입 에러**가 난다. 브레드크럼·사이드바를
라우트 정의에서 자동 생성하는 패턴의 기반이 된다.

### `shouldReload` — 재검증 제어

```tsx
// 항상 다시 로드
shouldReload: true,

// 조건부
shouldReload: ({ cause, params }) => cause === 'enter',
```

`staleTime` 이 "시간 기준"이라면 `shouldReload` 는 "논리 기준"이다. 둘 다 만족해야
loader가 다시 돈다.

### `remountDeps` — 컴포넌트 재마운트 제어

기본적으로 같은 라우트 안에서 params만 바뀌면 컴포넌트는 **재마운트되지 않는다.**
`/posts/1` → `/posts/2` 로 갈 때 컴포넌트 상태(스크롤, 입력값)가 유지된다. 대개 이게
바람직하지만, 완전히 새 화면처럼 다루고 싶을 때가 있다.

```tsx
export const Route = createFileRoute('/posts/$postId')({
  // postId 가 바뀌면 컴포넌트를 새로 마운트한다
  remountDeps: ({ params }) => ({ postId: params.postId }),
})
```

콜백은 `{ routeId, search, params, loaderDeps }` 를 받는다. 라우터 전역으로는
`defaultRemountDeps` 를 쓴다.

---

# 4부 · Link / Navigate 옵션 전수

`<Link>`, `useNavigate()`, `navigate()`, `redirect()` 가 공유하는 옵션이다.

## 목적지

| 옵션 | 설명 | 장 |
|---|---|---|
| `to` | 대상 경로 (타입 안전) | 02 |
| `from` | 상대 경로의 기준 | 02 |
| `params` | path params (값 또는 업데이터 함수) | 03 |
| `search` | search params (값 또는 업데이터 함수) | 03 |
| `hash` | `#` 뒤 값 | 02 |
| `state` | history state | 14 |
| `mask` | 주소창에 보일 다른 URL | 15 |

## 동작

| 옵션 | 기본값 | 설명 | 장 |
|---|---|---|---|
| `replace` | `false` | 기록 교체(뒤로가기에 안 남김) | 02 |
| `resetScroll` | `true` | 이동 후 맨 위로 | 15 |
| `hashScrollIntoView` | 라우터 설정 | `#hash` 로 스크롤 | 15 |
| `viewTransition` | 라우터 설정 | 전환 애니메이션 | 15 |
| `ignoreBlocker` | `false` | 네비게이션 차단 무시 | 14 |
| `reloadDocument` | `false` | SPA 이동 대신 전체 새로고침 | 02 |
| `href` | — | 외부 URL (`to` 대신) | 02 |

## Link 전용

| 옵션 | 설명 | 장 |
|---|---|---|
| `preload` | `'intent'`\|`'viewport'`\|`'render'`\|`false` | 02 |
| `preloadDelay` | 프리로드 지연(ms) | 02 |
| `preloadIntentProximity` | 커서 근접 거리(px) | 02 |
| `activeProps` | 활성 시 추가할 props | 02 |
| `inactiveProps` | 비활성 시 추가할 props | 02 |
| `activeOptions` | 활성 판정 방식 (아래) | 02 |
| `disabled` | 비활성화 | 02 |
| `target` | `_blank` 등 | 02 |
| `children` | JSX 또는 `({ isActive }) => JSX` | 02 |

### `activeOptions` 네 가지

| 필드 | 기본값 | 설명 |
|---|---|---|
| `exact` | `false` | 정확히 일치해야 활성 (기본은 접두 매칭) |
| `includeHash` | `false` | hash까지 비교 |
| `includeSearch` | `true` | search까지 비교 |
| `explicitUndefined` | `false` | `undefined` 인 search 키를 "없어야 함"으로 엄격 판정 |

`explicitUndefined` 는 미묘하다. `search: { tab: undefined }` 를 준 링크가 있을 때,
기본값(`false`)에서는 `tab` 이 뭐든 활성으로 본다. `true` 로 하면 **`tab` 이 실제로 없을
때만** 활성이 된다.

---

# 5부 · loader / beforeLoad 인자 전수

```tsx
loader: async (ctx) => { … }
```

| 필드 | 설명 | 장 |
|---|---|---|
| `params` | path params | 03 |
| `search` | search params (beforeLoad만) | 03 |
| `deps` | `loaderDeps` 결과 (loader만) | 04 |
| `context` | 병합된 컨텍스트 | 05 |
| `location` | 현재 `ParsedLocation` | 11 |
| `abortController` | 이동 취소 시 abort | 11 |
| `cause` | `'preload'`\|`'enter'`\|`'stay'` | 11 |
| `preload` | 프리로드 중인가(boolean) | 11 |
| `matches` | 이번 이동의 전체 매치 | 11 |
| `route` | 이 라우트 객체 | 11 |
| `routeId` | 이 라우트 id | 11 |
| `buildLocation` | 이동 없이 URL 계산 | 11 |
| `parentMatchPromise` | 부모 매치 완료 Promise | 10 |
| `navigate` ⚠️ | **deprecated** → `throw redirect()` | 06 |

---

---

# 6부 · 타입 export 총람

`@tanstack/react-router` 는 **값 100개 외에 타입만 204개**를 더 export 한다. 대부분은
제네릭 추론을 위한 내부 헬퍼라 직접 쓸 일이 없지만, **직접 써야 하는 것들이 섞여 있어**
구분이 필요하다.

## 실제로 쓰게 되는 타입

### 컴포넌트 props

| 타입 | 언제 | 장 |
|---|---|---|
| `ErrorComponentProps` | `errorComponent` 를 별도 컴포넌트로 뺄 때 | 12 |
| `NotFoundRouteProps` | `notFoundComponent` 를 별도로 뺄 때 | 12 |
| `RouteComponent` · `ErrorRouteComponent` · `NotFoundRouteComponent` | 컴포넌트 타입을 명시할 때 | 12 |
| `AsyncRouteComponent` | `lazyRouteComponent` 의 반환 타입 | 09 |
| `RouterProps` | `RouterProvider` props | 00 |

```tsx
import type { ErrorComponentProps } from '@tanstack/react-router'

// 여러 라우트에서 공유하는 에러 화면
export function AppError({ error, reset }: ErrorComponentProps) {
  return <div>{error.message}<button onClick={reset}>재시도</button></div>
}
```

### 링크 · 이동

| 타입 | 언제 | 장 |
|---|---|---|
| `LinkProps` | `Link` 를 감싸는 컴포넌트의 props | 16 |
| `LinkComponent` · `LinkComponentProps` · `CreateLinkProps` | `createLink` 로 만든 컴포넌트 타입 | 16 |
| `LinkOptions` · `ActiveLinkOptions` | `linkOptions()` 결과 타입 | 02 |
| `ActiveOptions` | `activeOptions` 객체 | 02 |
| `NavigateOptions` · `ToOptions` · `ToMaskOptions` | `navigate()` 인자 타입 | 02 · 15 |
| `UseNavigateResult` | `useNavigate()` 반환 타입 | 02 |
| `UseLinkPropsOptions` · `UseMatchRouteOptions` | 해당 훅의 옵션 | 11 · 16 |

```tsx
import type { LinkProps } from '@tanstack/react-router'

// to · params · search 를 그대로 받아 넘기는 래퍼
function NavItem({ icon, ...linkProps }: LinkProps & { icon: ReactNode }) {
  return <Link {...linkProps}>{icon}</Link>
}
```

### 상태 · 매치

| 타입 | 언제 | 장 |
|---|---|---|
| `ParsedLocation` | `useLocation()` 반환값 | 11 |
| `RouteMatch` | 매치 객체를 함수로 넘길 때 | 11 |
| `RouterState` | `useRouterState()` 반환값 | 02 · 11 |
| `RouterEvents` · `RouterEvent` · `RouterListener` | `router.subscribe()` 콜백 | 02 |
| `RemountDepsOptions` | `remountDeps` 콜백 인자 | 17 |
| `ContextOptions` · `LoaderFnContext` | loader/beforeLoad 인자 | 04 · 11 |

### 에러 · 리다이렉트

| 타입 | 언제 | 장 |
|---|---|---|
| `NotFoundError` | `notFound()` 반환·인자 | 12 |
| `Redirect` · `RedirectOptions` | `redirect()` 관련 | 12 |

### History

| 타입 | 언제 | 장 |
|---|---|---|
| `RouterHistory` | 커스텀 history 를 만들거나 주입할 때 | 14 |
| `HistoryLocation` · `HistoryState` · `ParsedPath` | history 내부 값 | 14 |

### Deferred

| 타입 | 언제 | 장 |
|---|---|---|
| `DeferredPromise` · `DeferredPromiseState` | `defer()` 반환 타입 | 10 |
| `AwaitOptions` | `<Await>` props | 10 |
| `ControlledPromise` | `createControlledPromise()` 반환 | 10 |

### 설정 · 확장

| 타입 | 언제 | 장 |
|---|---|---|
| `RouterOptions` · `RouteOptions` · `RootRouteOptions` | 옵션 객체를 변수로 뺄 때 | 17 |
| `UpdatableRouteOptions` · `BaseRouteOptions` · `FileBaseRouteOptions` | 라우트 옵션 세부 | 17 |
| `LazyRouteOptions` | `createLazyFileRoute` 가 받는 것 | 09 |
| `SearchMiddleware` | 커스텀 search 미들웨어 | 13 |
| `SearchSerializer` · `SearchParser` | 직렬화 함수 타입 | 13 |
| `SerializationAdapter` | `createSerializationAdapter` 결과 | 13 |
| `LocationRewrite` · `LocationRewriteFunction` | `rewrite` 옵션 | 16 |
| `UseBlockerOpts` | `useBlocker` 옵션 | 14 |
| `MatchRouteOptions` | `<MatchRoute>` props | 11 |
| `RouterManagedTag` | `<Asset>` 이 받는 태그 | 16 |
| `MetaDescriptor` | `head()` 의 meta 항목 | 16 |

### declaration merging 으로 확장하는 것

**이 타입들은 읽는 용도가 아니라 우리가 늘리는 용도**다. 05장의 `Register` 와 같은 방식이다.

| 타입 | 무엇을 확장하나 | 장 |
|---|---|---|
| `Register` | 라우터 인스턴스를 전역에 등록 (필수) | 05 |
| `StaticDataRouteOption` | `staticData` 에 필수 필드를 강제 | 17 |
| `UpdatableRouteOptionsExtensions` | 라우트 옵션을 직접 추가 | — |
| `RouterOptionsExtensions` | 라우터 옵션을 직접 추가 | — |
| `SerializableExtensions` · `SerializerExtensions` | 직렬화 가능 타입을 늘림 | 13 |
| `RouteMatchExtensions` | 매치 객체에 필드 추가 | — |

```ts
// staticData 에 title 을 필수로 만든다 — 빠뜨린 라우트가 타입 에러가 된다
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    title: string
  }
}
```

### 타입 유틸

| 타입 | 하는 일 |
|---|---|
| `Expand` | 교차 타입을 펼쳐 IDE 툴팁을 읽기 쉽게 |
| `Assign` · `MergeAll` · `IntersectAssign` | 객체 타입 병합 |
| `Constrain` · `ConstrainLiteral` | 리터럴 타입 제약 |
| `LooseReturnType` · `LooseAsyncReturnType` | 반환 타입 추출 |
| `Validator` · `ValidatorAdapter` · `ValidatorObj` | zod/valibot 등 검증기 어댑터 |

## 나머지 — 내부 추론 헬퍼

위 표에 없는 **124개**는 이 문서에서 이름을 다루지 않는다. 성격은 두 가지다.

**① 제네릭 추론용 (약 68개)** — `AnyRoute` · `AnyRouter` · `ResolveParams` ·
`InferFullSearchSchema` · `MakeRouteMatchUnion` 처럼 `Any` · `Resolve` · `Infer` ·
`Make` · `Trim` · `Constrain` 으로 시작하는 이름들이다.

**② 특정 prop 의 타입 계산용 (약 56개)** — `RelativeToPath` · `AbsoluteToPath` ·
`ToSubOptions` · `SearchParamOptions` · `PathParamOptions` 같은 것들로,
`<Link to>` 의 자동완성을 만들어 내는 타입들이다. 우리가 `to="/posts/$postId"` 를 칠 때
자동완성이 뜨는 것이 이들의 작품이지만, **직접 import 할 일은 없다.**

> **경계를 분명히 해 둔다.** 이 저장소는 **값 export 100개와 옵션 192개를 100% 다루지만,
> 타입 전용 export 204개는 전부 다루지 않는다.** 위 표의 80개가 "직접 쓰게 되는 것"이고
> 나머지 124개는 내부 추론용이라고 판단해 이름만 이 절에서 언급한다.
>
> 그중 하나가 필요해지는 순간이 오면 — 대개 **제네릭 유틸을 직접 만들 때다** — 아래
> 명령으로 전체 목록을 뽑아 타입 정의를 직접 읽는 편이 빠르다.

앱 코드에서 직접 쓸 일은 거의 없지만, **제네릭 유틸을 직접 만들 때** 필요해진다.

```ts
import type { AnyRouter, RegisteredRouter, RouteIds } from '@tanstack/react-router'

// 등록된 라우터의 라우트 id 만 받는 함수
function trackPage(routeId: RouteIds<RegisteredRouter['routeTree']>) { … }
```

전체 목록이 필요하면 타입 정의를 직접 본다.

```bash
grep -oE 'export type \{[^}]*\}' \
  apps/bible/node_modules/@tanstack/react-router/dist/esm/index.d.ts
```

## 이 문서를 최신으로 유지하는 법

버전을 올린 뒤에는 README에 적힌 커버리지 스크립트를 돌린다. 새 API가 추가되면 누락으로
잡힌다.

```bash
# 프로젝트 루트에서 — 누락이 있으면 이름이 출력된다
node -e "…"   # README.md 의 '커버리지 측정 방법' 참조
```

옵션 표는 타입 정의에서 직접 뽑을 수 있다.

```bash
# RouterOptions 필드 나열
grep -oE '^\s+[a-zA-Z]+\??:' \
  apps/bible/node_modules/@tanstack/router-core/dist/esm/router.d.ts | sort -u
```

## 📖 공식 문서

- [RouterOptions](https://tanstack.com/router/latest/docs/framework/react/api/router/RouterOptionsType)
- [RouteOptions](https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType)
- [LinkOptions](https://tanstack.com/router/latest/docs/framework/react/api/router/LinkOptionsType)
- [Code Based Routing](https://tanstack.com/router/latest/docs/framework/react/guide/code-based-routing)
