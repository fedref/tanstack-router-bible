# 11 · Match API & 라우터 상태 읽기

> 대응 예제: `/matches` · `/navigation/events` · `/type-safety/utils`
> 예제 파일: `apps/bible/src/routes/navigation.events.tsx`, `apps/bible/src/routes/type-safety.utils.tsx`
> 📖 공식: [useMatch](https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchHook) ·
> [useMatches](https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchesHook) ·
> [useLocation](https://tanstack.com/router/latest/docs/framework/react/api/router/useLocationHook)

## 한 줄 정의 & 언제 쓰나

**"지금 어떤 라우트들이 매칭되어 있는가"를 읽는 API 묶음이다.**

02~07장에서 쓴 `Route.useParams()`, `Route.useLoaderData()` 는 **특정 한 라우트**의 데이터를
읽는다. 반면 이 장의 API는 **매치 배열 전체**를 다룬다.

URL 하나에 매칭되는 라우트는 보통 여러 개다. `/kitchen-sink/abc123` 하나에도:

```
__root                          ← 매치 0
└── kitchen-sink                ← 매치 1
    └── kitchen-sink/_app       ← 매치 2 (pathless 가드)
        └── $productId          ← 매치 3
```

네 개의 매치가 **동시에** 살아 있다. 각각 자기 `loader` 결과와 `context` 를 갖는다. 이
배열을 통째로 다뤄야 풀리는 문제들이 있다 — **브레드크럼**, **전역 로딩 표시**,
**부모 데이터 참조** 같은 것들이다.

## 지도 — 어느 훅을 언제 쓰나

| 훅/컴포넌트 | 무엇을 주나 | 대표 용도 |
|---|---|---|
| `useMatch({ from })` | 매치 **하나** | 특정 라우트의 상태(status, error 등) |
| `useMatches()` | 매치 **전부** (루트부터) | 브레드크럼, 전역 로딩 |
| `useParentMatches()` | **상위(부모 쪽)** 매치들 | 부모의 loaderData 참조 |
| `useChildMatches()` | **하위(자식 쪽)** 매치들 | 레이아웃에서 자식 상태 감시 |
| `useMatchRoute()` | "이 경로가 매칭 중인가?" 판정 함수 | 조건부 UI |
| `<MatchRoute>` | 위와 같은 일을 컴포넌트로 | JSX 안에서 조건부 렌더 |
| `<Matches>` | 매치 트리를 렌더 | 루트 레이아웃 커스터마이징 |
| `useLocation()` | 현재 URL 정보 | pathname/search/hash 읽기 |
| `useLoaderDeps()` | loader 의존값 | 캐시 키 디버깅 |
| `useCanGoBack()` | 뒤로 갈 수 있나 | 뒤로가기 버튼 활성화 |

## `useMatch()` — 매치 하나 읽기

```tsx
import { useMatch } from '@tanstack/react-router'

// 특정 라우트의 매치를 가져온다
const match = useMatch({ from: '/posts/$postId' })

match.status        // 'pending' | 'success' | 'error' | 'redirected' | 'notFound'
match.isFetching    // false | 'beforeLoad' | 'loader'
match.error         // loader가 throw한 값
match.loaderData    // loader 반환값
match.params        // path params
match.search        // search params
match.context       // 병합된 라우트 컨텍스트
match.fetchCount    // 몇 번 로드했나
match.updatedAt     // 마지막 갱신 시각(ms)
match.abortController // 이 매치의 AbortController
```

`Route.useLoaderData()` 가 **데이터만** 준다면, `useMatch()` 는 **그 데이터를 둘러싼 상태
전부**를 준다. "지금 다시 로딩 중인가?"(`isFetching`)를 알아야 하는 화면에서 특히 유용하다.

### 옵션 네 가지

```tsx
useMatch({
  from: '/posts/$postId',   // 어느 라우트의 매치인가
  strict: false,            // 이 라우트가 아니어도 에러 내지 않음
  shouldThrow: false,       // 매치가 없으면 throw 대신 undefined 반환
  select: (m) => m.status,  // 필요한 부분만 골라 구독
  structuralSharing: true,  // 구조적 동일성 유지 (아래 설명)
})
```

**`select` 를 쓰면 리렌더가 줄어든다.** 이게 이 API 묶음 전체를 관통하는 핵심이다.
`select` 없이 매치 객체 전체를 구독하면 매치의 **어느 필드가 바뀌어도** 컴포넌트가 다시
그려진다. `select: (m) => m.status` 로 좁히면 status가 바뀔 때만 다시 그려진다.

**`shouldThrow: false`** 는 "있으면 쓰고 없으면 말고" 를 만든다. 공용 컴포넌트가 여러
라우트에서 쓰이는데 특정 라우트에서만 매치가 있는 경우에 필요하다.

```tsx
const match = useMatch({ from: '/admin', shouldThrow: false })
if (!match) return null   // /admin 아래가 아니면 아무것도 안 그린다
```

## `useMatches()` — 전부 읽기

루트부터 현재까지의 매치를 **배열**로 준다. 순서는 상위(루트 쪽) → 하위(현재 라우트 쪽)다.

```tsx
const matches = useMatches()
// [ __root 매치, /posts 매치, /posts/$postId 매치 ]
```

### 대표 용도 ① 브레드크럼

매치 배열이 곧 계층 구조이므로 브레드크럼과 1:1로 대응한다. 각 라우트가 loader에서
자기 이름을 흘려 주면 된다.

```tsx
// 각 라우트에서
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId)
    return { post, crumb: post.title }   // ← 브레드크럼용 이름
  },
})

// 공용 브레드크럼 컴포넌트
import { useMatches, isMatch, Link } from '@tanstack/react-router'

function Breadcrumbs() {
  const matches = useMatches()

  // crumb 을 가진 매치만 골라낸다
  const crumbs = matches.filter(
    (m): m is typeof m & { loaderData: { crumb: string } } =>
      isMatch(m, 'loaderData.crumb'),
  )

  return (
    <nav>
      {crumbs.map((m) => (
        <Link key={m.id} to={m.fullPath} params={m.params}>
          {m.loaderData.crumb}   {/* 옵셔널 체이닝 없이 접근된다 */}
        </Link>
      ))}
    </nav>
  )
}
```

**`isMatch(match, 'loaderData.crumb')`** 는 단순 필터가 아니라 **타입 가드**다
(`match is …` 를 반환한다). 경로 문자열은 점 표기로 중첩 필드까지 지정할 수 있다.

### 함정 — `filter` 에 그냥 넘기면 타입이 좁혀지지 않는다

```tsx
// ❌ 이렇게 쓰면 m.loaderData 가 'possibly undefined' 로 남는다
const crumbs = matches.filter((m) => isMatch(m, 'loaderData.crumb'))
crumbs.map((m) => m.loaderData.crumb)   // TS18048 에러
```

인라인 화살표 함수로 감싸는 순간 반환 타입이 `boolean` 으로 추론되어, `isMatch` 가 가진
타입 술어가 `filter` 결과까지 전달되지 않는다. **화살표 함수의 반환 타입을 명시**해서
술어를 다시 붙여 줘야 한다. 위 예제가 그렇게 되어 있는 이유다.

`loaderData` 가 optional(`loaderData?: TLoaderData`)로 선언되어 있어 생기는 문제이며,
`apps/bible/src/routes/matches.index.tsx` 의 실제 코드에서 확인할 수 있다.

### 대표 용도 ② 전역 로딩 표시

```tsx
const isAnyLoading = useMatches({
  select: (matches) => matches.some((m) => m.isFetching),
})

return isAnyLoading ? <TopProgressBar /> : null
```

`select` 로 boolean 하나만 구독하므로, 매치 내용이 아무리 바뀌어도 **true↔false 가 바뀔
때만** 리렌더된다.

## `useParentMatches()` / `useChildMatches()`

`useMatches()` 가 전체라면, 이 둘은 **현재 라우트 기준 상대 위치**로 잘라 준다.

```tsx
// /posts/$postId 컴포넌트 안에서
const parents = useParentMatches()   // [__root, /posts]
const children = useChildMatches()   // [] (하위 라우트가 없으면 빈 배열)
```

**부모의 loaderData를 읽는 것**이 `useParentMatches()` 의 주 용도다. 다만 대부분의 경우
더 나은 방법이 있다:

```tsx
// 방법 A: 부모 라우트를 직접 지정 — 타입이 정확하다 (권장)
const parentData = useLoaderData({ from: '/posts' })

// 방법 B: 부모 매치 배열에서 찾기 — 라우트 id를 모를 때
const parents = useParentMatches()
const postsMatch = parents.find((m) => m.routeId === '/posts')
```

**A를 쓸 수 있으면 A를 쓴다.** B는 "어느 부모인지 컴파일 시점에 알 수 없는" 공용
컴포넌트에서만 필요하다.

`useChildMatches()` 는 레이아웃 라우트에서 **자식의 로딩 상태를 감시**할 때 쓴다. 예를
들어 사이드바는 그대로 두고 콘텐츠 영역만 스피너를 띄우는 경우다.

## `useMatchRoute()` / `<MatchRoute>` — "지금 여기 있나?" 판정

`Link` 의 `activeProps` 로는 부족할 때, 즉 **링크가 아닌 UI**를 경로에 따라 바꿀 때 쓴다.

```tsx
const matchRoute = useMatchRoute()

// 매칭되면 params 객체를, 아니면 false 를 반환한다
const params = matchRoute({ to: '/posts/$postId' })
if (params) {
  console.log(params.postId)   // 타입 안전
}

// 부분 매칭 (기본값은 정확 매칭이 아니라 접두 매칭)
matchRoute({ to: '/posts', fuzzy: true })

// pending 상태(이동 중)도 매칭에 포함
matchRoute({ to: '/posts/$postId', pending: true })
```

같은 일을 JSX에서 하려면 컴포넌트 버전을 쓴다.

```tsx
import { MatchRoute } from '@tanstack/react-router'

<MatchRoute to="/posts/$postId" params={{ postId: '1' }}>
  {(match) => (match ? <Badge>보는 중</Badge> : null)}
</MatchRoute>
```

**`pending: true` 조합이 특히 쓸모 있다.** 링크를 클릭한 직후, 아직 이동이 끝나지 않은
상태에서 "이제 곧 여기로 갑니다" 표시를 낼 수 있다.

```tsx
<MatchRoute to="/reports" pending>
  {(match) => (match ? <Spinner /> : null)}
</MatchRoute>
```

## `<Matches>` — 매치 트리 렌더

루트 레이아웃에서 매치들이 렌더되는 지점을 직접 제어한다. `__root.tsx` 에서
`<Outlet />` 대신 쓸 수 있으며, 라우터가 기본으로 하는 일(전역 pending/error 경계 설정)을
직접 구성할 때 쓴다. 일반적인 앱에서는 `<Outlet />` 으로 충분하고, 이 컴포넌트까지 갈
일은 드물다.

## `useLocation()` — 현재 URL 정보

```tsx
const location = useLocation()

location.href        // '/posts/1?tab=comments#top' (origin 제외 전체)
location.pathname    // '/posts/1'
location.search      // { tab: 'comments' }   ← 파싱된 객체
location.searchStr   // '?tab=comments'       ← 원문 문자열
location.hash        // 'top'
location.state       // history state 객체
location.publicHref  // basepath/rewrite 적용된 공개 URL
location.external    // 외부 링크인가
location.maskedLocation    // 마스킹 중이면 실제 위치 (15장)
location.unmaskOnReload    // 새로고침 시 마스크 해제 여부
```

여기서도 `select` 로 좁히는 습관이 중요하다.

```tsx
// ❌ URL의 어느 부분이 바뀌어도 리렌더
const location = useLocation()
const pathname = location.pathname

// ✅ pathname 이 바뀔 때만 리렌더
const pathname = useLocation({ select: (l) => l.pathname })
```

**search 값을 읽을 때는 `useLocation` 이 아니라 `Route.useSearch()` 를 쓴다.**
`useLocation().search` 는 검증(`validateSearch`)을 거치지 않은 원본이라 타입이 약하다.
03장에서 다룬 대로 `useSearch()` 가 검증된 값을 준다.

## `useLoaderDeps()` — loader 의존값 읽기

04장의 `loaderDeps` 가 실제로 어떤 값으로 계산됐는지 읽는다.

```tsx
const deps = useLoaderDeps({ from: '/posts' })
// loaderDeps: ({ search }) => ({ page: search.page }) 였다면 → { page: 2 }
```

주 용도는 **디버깅**이다. "왜 loader가 다시 실행되지?" 또는 "왜 안 되지?" 를 추적할 때,
deps가 실제로 바뀌었는지 눈으로 확인한다. Devtools의 match 정보에서도 같은 값을 볼 수 있다.

## `useCanGoBack()` — 뒤로 갈 수 있나

```tsx
const canGoBack = useCanGoBack()
const router = useRouter()

<button disabled={!canGoBack} onClick={() => router.history.back()}>
  뒤로
</button>
```

앱에 직접 진입한 첫 화면에서는 `false` 다. 이 확인 없이 `history.back()` 을 부르면
**앱 밖으로 나가 버린다.** 뒤로가기 버튼을 직접 만든다면 사실상 필수다.

## loader / beforeLoad 안에서의 매치 정보

컴포넌트 밖 — `loader` 와 `beforeLoad` 의 인자에도 매치 관련 정보가 들어온다. 04·06장에서
`params`, `context`, `location` 은 다뤘지만 나머지도 있다.

```tsx
loader: async ({
  params, deps, context, location,   // (04·06장에서 다룸)
  abortController,   // 이 매치가 취소되면 abort 되는 컨트롤러
  cause,             // 'preload' | 'enter' | 'stay'
  matches,           // 이번 이동에서 매칭된 모든 매치
  buildLocation,     // 이동하지 않고 URL만 계산하는 함수
  preload,           // 프리로드로 실행 중인가 (boolean)
  route,             // 이 라우트 객체
  parentMatchPromise,// 부모 매치가 끝나기를 기다리는 Promise
}) => { … }
```

### `abortController` — 요청 취소

사용자가 빠르게 다른 링크로 이동하면 이전 loader의 fetch는 쓸모없어진다. 시그널을
넘겨 주면 **자동으로 취소된다.**

```tsx
loader: async ({ params, abortController }) => {
  const res = await fetch(`/api/posts/${params.postId}`, {
    signal: abortController.signal,   // ← 이동이 취소되면 fetch도 취소
  })
  return res.json()
}
```

느린 API를 쓰는 화면에서 링크를 빠르게 오갈 때, 이게 없으면 취소된 요청들이 계속 살아
남아 네트워크를 점유한다.

### `cause` — 왜 실행됐나

```tsx
loader: async ({ cause, params }) => {
  // 'preload' : 마우스 hover 등으로 미리 받는 중
  // 'enter'   : 실제로 이 라우트에 진입
  // 'stay'    : 이미 있던 라우트가 재검증됨
  if (cause === 'preload') {
    return fetchPostLight(params.postId)   // 프리로드 때는 가볍게
  }
  return fetchPostFull(params.postId)
}
```

프리로드에서 무거운 작업(분석 이벤트 전송 등)을 건너뛰는 데 쓴다. **hover만 해도 조회수가
올라가는 버그**가 이 값을 확인하지 않아 생긴다.

### `preload` 와 `cause` 의 관계

`preload: boolean` 은 `cause === 'preload'` 와 같은 정보를 boolean으로 준다. 셋 중 하나를
구분해야 한다면 `cause`, 프리로드 여부만 보면 된다면 `preload` 를 쓴다.

## 리렌더 최적화 — 두 가지 장치

라우터가 리렌더를 줄이는 방법은 두 가지이고, **하나는 자동, 하나는 수동**이다.

### ① 구조적 공유는 search에 이미 적용되어 있다

라우터는 search params에 **구조적 공유(structural sharing)를 기본으로 적용**한다. URL이
바뀌어도 **값이 그대로인 키는 참조까지 유지**된다.

```
/details?foo=f1&bar=b1  →  /details?foo=f1&bar=b2

search.foo → 이전과 동일한 참조 (바뀌지 않았으므로)
search.bar → 새 값
```

그래서 `Route.useSearch()` 를 쓰고 `foo` 만 의존하는 컴포넌트는 `bar` 가 바뀌어도
불필요하게 다시 그려지지 않는다. **우리가 아무것도 하지 않아도 되는 부분**이다.

### ② `select` 는 우리가 직접 좁히는 것

```tsx
// bar 가 바뀌어도 이 컴포넌트는 리렌더되지 않는다
const foo = Route.useSearch({ select: (s) => s.foo })
```

### `structuralSharing` — 둘을 합칠 때

`useMatch`, `useMatches`, `useLocation`, `useRouterState` 등 `select` 를 받는 훅은
`structuralSharing` 옵션도 받는다.

```tsx
const ids = useMatches({
  select: (matches) => matches.map((m) => m.id),
  structuralSharing: true,
})
```

`select` 가 **새 객체나 배열을 만들어 반환**하면, 내용이 같아도 참조가 매번 달라져
리렌더가 발생한다. `structuralSharing: true` 는 이전 결과와 **깊은 비교**를 해서 내용이
같으면 이전 참조를 그대로 재사용한다.

라우터 전역으로 켜려면 `createRouter({ defaultStructuralSharing: true })` 를 쓴다.
`select` 가 원시값(문자열·숫자·boolean)만 반환한다면 필요 없다.

**제약**: 구조적 공유는 **JSON 호환 데이터에만** 동작한다. 클래스 인스턴스나 직렬화
불가능한 값을 `select` 가 반환하면 타입 에러가 난다. 그런 경우는 해당 훅에만
`structuralSharing: false` 를 준다.

## 흔한 실수 / 함정

**1. `select` 없이 통째로 구독한다**
`useMatches()` 를 그냥 부르면 매치 배열의 아주 작은 변화에도 리렌더된다. 전역 로딩바처럼
자주 바뀌는 것을 구독하면 앱 전체가 느려진다. **`select` 를 기본값처럼 쓴다.**

**2. `useLocation().search` 로 search를 읽는다**
검증 전 원본이라 타입이 약하고 기본값도 적용되지 않는다. `Route.useSearch()` 를 쓴다.

**3. `useCanGoBack()` 확인 없이 `history.back()`**
첫 진입 화면에서 앱 밖으로 나가 버린다.

**4. `abortController.signal` 을 안 넘긴다**
동작은 하지만 취소된 요청이 계속 살아 있다. fetch를 쓴다면 항상 넘긴다.

**5. `cause` 를 무시한다**
프리로드에서도 부수효과(조회수 증가, 로그 전송)가 실행된다. hover만으로 데이터가 오염된다.

**6. `useParentMatches()` 로 부모 데이터를 찾는다**
`useLoaderData({ from: '/부모경로' })` 가 타입도 정확하고 코드도 짧다. 부모 경로를 모를
때만 매치 배열을 뒤진다.

## 🔗 시너지

- **02장 `useRouterState`** — 이 장의 훅들은 결국 `useRouterState` 의 특화 버전이다.
  더 세밀한 상태(status, isLoading, location 전체)가 필요하면 `useRouterState({ select })`
  로 내려간다.
- **04장 loader** — `abortController`, `cause` 는 loader를 실무 수준으로 쓰기 위한 필수
  지식이다. 04장의 기본 loader에 이 둘을 얹으면 완성형이 된다.
- **05장 `getRouteApi`** — 라우트 밖에서 타입을 유지하며 매치에 접근하는 짝이다.
- **06장 pathless 가드** — 가드가 매치 배열에서 어떤 위치를 차지하는지 `useMatches()` 로
  직접 확인해 보면 구조가 명확해진다.
- **12장 에러 경계** — `match.status === 'error'`, `match.error` 가 12장 에러 처리와
  연결된다.

## ▶ 실행 예제

- `/navigation/events` — `useRouterState({ select })` 로 라우터 상태를 구독하는 실제 예제
- `/type-safety/utils` — `getRouteApi`, `useSearch({ from })` 등 라우트 밖 접근

브레드크럼과 `useMatches` 조합은 `apps/playground` 에서 직접 만들어 보기 좋은 주제다.
각 라우트 loader에 `crumb` 을 넣고 위 코드를 그대로 옮기면 동작한다.

## 📖 공식 문서

- [`useMatch`](https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchHook)
- [`useMatches`](https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchesHook)
- [`useParentMatches`](https://tanstack.com/router/latest/docs/framework/react/api/router/useParentMatchesHook)
- [`useChildMatches`](https://tanstack.com/router/latest/docs/framework/react/api/router/useChildMatchesHook)
- [`useMatchRoute`](https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchRouteHook)
- [`useLocation`](https://tanstack.com/router/latest/docs/framework/react/api/router/useLocationHook)
- [`useCanGoBack`](https://tanstack.com/router/latest/docs/framework/react/api/router/useCanGoBackHook)
