# 12 · 에러 · NotFound 경계

> 대응 예제: `/errors` · `/errors/boundary` · `/data/basics?fail=true` · `/auth/notfound`
> 예제 파일: `apps/bible/src/routes/data.basics.tsx`, `apps/bible/src/routes/auth.notfound.tsx`
> 📖 공식: [not-found-errors](https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors) ·
> [CatchBoundary](https://tanstack.com/router/latest/docs/framework/react/api/router/catchBoundaryComponent)

## 한 줄 정의 & 언제 쓰나

**라우터에서 "정상이 아닌 흐름"은 세 종류이고, 셋은 서로 다르게 다뤄야 한다.**

| 종류 | 의미 | 만드는 법 | 받는 곳 |
|------|------|-----------|---------|
| **Error** | 진짜 실패 (네트워크 끊김, 서버 500) | `throw new Error()` | `errorComponent` |
| **NotFound** | 없음 (잘못된 id, 삭제된 글) | `throw notFound()` | `notFoundComponent` |
| **Redirect** | 다른 데로 보냄 (미인증) | `throw redirect()` | 라우터가 처리 |

셋 다 `throw` 로 시작하지만 **결과가 완전히 다르다.** 없는 상품 페이지에 "서버 오류가
발생했습니다" 를 띄우는 앱을 흔히 보는데, 그건 이 셋을 구분하지 않아서 생기는 일이다.
404는 실패가 아니라 **정상적인 응답**이다.

## 최소 예제 — 세 흐름을 한자리에

```tsx
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })          // ③ 리다이렉트
    }
  },
  loader: async ({ params }) => {
    const res = await fetch(`/api/posts/${params.postId}`)

    if (res.status === 404) {
      throw notFound()                          // ② 없음
    }
    if (!res.ok) {
      throw new Error('게시글을 불러오지 못했습니다')  // ① 실패
    }
    return res.json()
  },

  errorComponent: ({ error, reset }) => (       // ① 을 받는다
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  ),
  notFoundComponent: () => (                    // ② 를 받는다
    <div>그런 글은 없습니다.</div>
  ),
  // ③ 은 컴포넌트가 필요 없다 — 라우터가 이동시킨다
})
```

## ① Error — `errorComponent`

### 받는 props 세 가지

```tsx
errorComponent: ({ error, info, reset }) => { … }
```

| prop | 내용 |
|------|------|
| `error` | throw된 값. 보통 `Error` 인스턴스 |
| `info` | `{ componentStack: string }` — 렌더 중 에러일 때만 |
| `reset` | **에러 상태를 지우고 다시 시도**하는 함수 |

`reset` 이 핵심이다. 이걸 호출하면 경계가 초기화되고 loader가 다시 실행된다. 사용자에게
"다시 시도" 버튼을 주려면 이 함수를 연결한다.

### `ErrorComponent` — 기본 제공 컴포넌트

직접 만들기 전에 쓸 수 있는 기본 구현이 있다.

```tsx
import { ErrorComponent } from '@tanstack/react-router'

errorComponent: ({ error }) => <ErrorComponent error={error} />
```

개발 중에는 에러 메시지와 스택을 보여 주므로 디버깅에 쓸 만하다. 프로덕션 화면으로는
직접 만든 컴포넌트를 쓰는 편이 낫다.

### `errorComponent: null` — 경계를 없애기

```tsx
errorComponent: null,   // 또는 false
```

타입이 `false | null | undefined | ErrorRouteComponent` 인 이유가 여기 있다. `null` 을
주면 이 라우트는 에러를 잡지 않고 **부모로 올려보낸다.** 자식마다 에러 화면을 띄우는 대신
레이아웃 한 곳에서 모아 처리하고 싶을 때 쓴다.

### `onError` — 잡기 전에 관찰하기

```tsx
export const Route = createFileRoute('/posts')({
  onError: (err) => {
    // 로깅·모니터링 전송. UI는 바꾸지 않는다
    reportToSentry(err)
  },
  errorComponent: MyErrorView,
})
```

`onError` 는 **loader/beforeLoad 단계의 에러**를 관찰한다. UI를 그리지 않고 부수효과만
수행하는 자리다.

### `onCatch` — 렌더 에러까지 관찰하기

```tsx
onCatch: (error, errorInfo) => {
  reportToSentry(error, { componentStack: errorInfo.componentStack })
}
```

`onCatch` 는 **React 에러 경계가 잡은 것**을 받는다. 즉 렌더 중 터진 에러까지 포함한다.
`errorInfo.componentStack` 이 있어 어느 컴포넌트에서 났는지 알 수 있다.

라우터 전역으로 걸려면 `defaultOnCatch` 를 쓴다.

```tsx
createRouter({
  routeTree,
  defaultOnCatch: (error, errorInfo) => reportToSentry(error, errorInfo),
})
```

## ② NotFound — `notFound()` 와 `notFoundComponent`

### `notFound()` 의 옵션

```ts
notFound({
  data?: any,        // notFoundComponent 로 전달할 데이터
  routeId?: string,  // 어느 라우트의 경계에서 잡을지 지정
  throw?: boolean,   // true 면 반환 대신 스스로 throw
  headers?: HeadersInit,  // SSR에서 응답 헤더 (404 상태코드 등)
})
```

`data` 를 넘기면 컴포넌트에서 받을 수 있다.

```tsx
// loader
throw notFound({ data: { searchedId: params.postId } })

// notFoundComponent
notFoundComponent: ({ data }) => (
  <div>{(data as any).searchedId} 번 글을 찾을 수 없습니다.</div>
)
```

`routeId` 는 **어느 층에서 잡을지**를 지정한다. 기본은 가장 가까운 경계이지만, 예를 들어
상세 페이지에서 404가 났을 때 목록 레이아웃까지 통째로 404 화면으로 바꾸고 싶다면
그 라우트 id를 준다.

```tsx
import { rootRouteId } from '@tanstack/react-router'

throw notFound({ routeId: rootRouteId })   // 앱 전체를 404 화면으로
```

> `notFound({ global: true })` 는 **deprecated** 되었다. 위처럼 `routeId: rootRouteId` 를 쓴다.

### `notFoundMode` — 어디서 잡을지의 전역 정책

```tsx
createRouter({
  routeTree,
  notFoundMode: 'fuzzy',   // 기본값. 'root' 로 바꿀 수 있다
})
```

**URL이 어떤 라우트와도 매칭되지 않을 때** 어떻게 할지를 정한다.

- **`'fuzzy'`(기본)** — 부분적으로라도 매칭된 **가장 깊은 라우트**의 `notFoundComponent`
  를 쓴다. `/posts/xyz/nothing` 이면 `/posts` 레이아웃은 살아 있고 그 안쪽만 404가 된다.
  사이드바·헤더가 유지되므로 사용자 경험이 낫다.
- **`'root'`** — 무조건 루트의 404 화면으로 간다. 화면 전체가 404가 된다.

### `DefaultGlobalNotFound` — 기본 404 화면

`notFoundComponent` 를 아무 데도 지정하지 않으면 라우터가 쓰는 기본 컴포넌트다. 직접
가져다 쓸 수도 있다.

```tsx
import { DefaultGlobalNotFound } from '@tanstack/react-router'

createRouter({ routeTree, defaultNotFoundComponent: DefaultGlobalNotFound })
```

### `NotFoundRoute` — 옛 방식

코드기반 라우팅 시절 "매칭 안 되면 여기로" 를 표현하던 라우트 클래스다. **파일기반
라우팅에서는 쓰지 않는다.** 스플랫 라우트(`$.tsx`)와 `notFoundComponent` 조합이 현재
방식이다.

```tsx
// routes/$.tsx — 남은 모든 경로를 잡는다
export const Route = createFileRoute('/$')({
  component: () => <div>없는 페이지입니다</div>,
})
```

## ③ Redirect — 그리고 판별 함수들

`redirect()` 는 06장에서 다뤘다. 여기서는 **판별 함수**를 본다.

```tsx
import { isRedirect, isNotFound } from '@tanstack/react-router'
// isResolvedRedirect 는 react-router 가 re-export 하지 않는다 — core 에서 가져온다
import { isResolvedRedirect } from '@tanstack/router-core'

try {
  await router.load()
} catch (err) {
  if (isRedirect(err)) {
    // 리다이렉트다 — 정상 흐름이므로 에러로 보고하면 안 된다
  } else if (isNotFound(err)) {
    // 404다
  } else {
    reportToSentry(err)   // 진짜 에러만 보고
  }
}
```

**이 판별이 중요한 이유**: `redirect()` 와 `notFound()` 는 내부적으로 throw로 구현된다.
에러 로깅 코드를 순진하게 짜면 **정상적인 리다이렉트가 전부 에러로 집계된다.** 모니터링
대시보드가 404와 로그인 리다이렉트로 가득 차는 흔한 사고다.

`isResolvedRedirect(err)` 는 리다이렉트 중에서도 **최종 `href` 가 계산 완료된 것**만
가려낸다. SSR에서 Location 헤더를 세팅할 때처럼 확정된 URL이 필요한 경우에 쓴다.

> ⚠️ `isRedirect` · `isNotFound` 와 달리 **`isResolvedRedirect` 는
> `@tanstack/react-router` 가 re-export 하지 않는다.** `@tanstack/router-core` 에서
> 직접 가져와야 한다. core 는 react-router 의 의존성이라 별도 설치 없이 import 되지만,
> `package.json` 에 명시하지 않은 패키지를 쓰는 셈이므로 직접 의존성으로 추가해 두는
> 편이 안전하다.

## 컴포넌트로 경계 만들기 — `CatchBoundary` / `CatchNotFound`

라우트 옵션(`errorComponent`)은 **라우트 단위**로만 경계를 만든다. 화면 안의 **일부
영역**만 감싸려면 컴포넌트를 쓴다. 10장의 Deferred 에러가 대표적인 사용처다.

### `CatchBoundary`

```tsx
import { CatchBoundary } from '@tanstack/react-router'

<CatchBoundary
  getResetKey={() => resetCount}          // 필수: 이 값이 바뀌면 경계가 초기화된다
  errorComponent={({ error, reset }) => (
    <div>위젯 로드 실패: {error.message}</div>
  )}
  onCatch={(error, errorInfo) => reportToSentry(error, errorInfo)}
>
  <RiskyWidget />
</CatchBoundary>
```

**`getResetKey` 가 필수라는 점**이 특징이다. React의 ErrorBoundary는 한 번 에러가 나면
그 상태에 갇히는데, 이 키가 바뀌면 자동으로 초기화된다. 보통 URL이나 카운터를 연결한다.

```tsx
// URL이 바뀌면 에러 상태를 자동으로 푼다
const pathname = useLocation({ select: (l) => l.pathname })
<CatchBoundary getResetKey={() => pathname}> … </CatchBoundary>
```

### `CatchNotFound`

같은 일을 404에 대해 한다.

```tsx
import { CatchNotFound } from '@tanstack/react-router'

<CatchNotFound
  fallback={(error) => <div>이 영역의 데이터가 없습니다</div>}
  onCatch={(error, info) => { /* 관찰 */ }}
>
  <ProductPanel />
</CatchNotFound>
```

`fallback` 은 `NotFoundError` 를 인자로 받는 **함수**다. `CatchBoundary` 의
`errorComponent` 와 형태가 다르니 주의한다.

### `disableGlobalCatchBoundary`

```tsx
createRouter({ routeTree, disableGlobalCatchBoundary: true })
```

라우터가 앱 최상단에 자동으로 두는 전역 경계를 끈다. 에러가 라우터 밖으로 전파되므로,
**앱을 감싸는 자체 ErrorBoundary가 이미 있을 때** 켠다. 그냥 켜면 에러 하나에 앱 전체가
하얗게 되므로, 대체 경계 없이 켜서는 안 된다.

## 검증 실패는 별도 에러다 — `SearchParamError` / `PathParamError`

03장의 `validateSearch` 나 `params.parse` 가 실패하면 일반 에러가 아니라 전용 에러가
throw된다.

```tsx
import { SearchParamError } from '@tanstack/react-router'

errorComponent: ({ error }) => {
  if (error instanceof SearchParamError) {
    return <div>URL의 검색 조건이 올바르지 않습니다.</div>
  }
  return <div>{error.message}</div>
}
```

사용자가 URL을 손으로 고쳤을 때 주로 발생한다. zod를 쓴다면 `.catch(기본값)` 으로
에러 자체를 내지 않고 기본값으로 넘기는 편이 대개 낫다(03장).

## 라우터 전역 기본값 정리

라우트마다 지정하지 않았을 때 쓰일 기본 컴포넌트를 한곳에서 정한다. **이 옵션들은
`@tanstack/react-router` 쪽에서 추가되는 것들**이라 core 문서에는 나오지 않는다.

```tsx
createRouter({
  routeTree,
  defaultComponent: MyDefault,              // 기본값: Outlet
  defaultErrorComponent: MyError,           // 기본값: ErrorComponent
  defaultPendingComponent: MySpinner,
  defaultNotFoundComponent: My404,          // 기본값: DefaultGlobalNotFound
  defaultOnCatch: (err, info) => log(err),

  // 라우터 전체를 감싸는 래퍼 (Provider 주입용)
  Wrap: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
  // 매치 트리 안쪽을 감싸는 래퍼
  InnerWrap: ({ children }) => <Analytics>{children}</Analytics>,
})
```

`Wrap` 과 `InnerWrap` 은 잘 알려지지 않았지만 유용하다. `RouterProvider` 바깥에서
Provider를 감쌀 수 없는 상황(예: Provider가 라우터 컨텍스트를 필요로 할 때)에 쓴다.

## 흔한 실수 / 함정

**1. 404에 `throw new Error()` 를 쓴다**
"서버 오류" 화면이 뜬다. 없는 것은 `notFound()` 다.

**2. 리다이렉트를 에러로 로깅한다**
`isRedirect(err)` 로 먼저 걸러야 한다. 모니터링이 오염된다.

**3. `reset` 을 연결하지 않는다**
사용자가 새로고침 말고는 빠져나갈 방법이 없어진다.

**4. `getResetKey` 를 상수로 준다**
`getResetKey={() => 'x'}` 처럼 고정값이면 경계가 영원히 초기화되지 않는다. URL이나
카운터를 연결한다.

**5. `notFoundMode: 'root'` 를 기본으로 쓴다**
사이드바까지 사라져 사용자가 길을 잃는다. 특별한 이유가 없으면 `'fuzzy'` 를 둔다.

**6. Deferred 에러를 `errorComponent` 로 잡으려 한다**
10장에서 다룬 대로 잡히지 않는다. `<CatchBoundary>` 로 감싼다.

**7. `errorComponent` 안에서 또 에러를 낸다**
에러 화면에서 `error.response.data.message` 처럼 깊게 접근하면 그 자체가 터진다. 에러
컴포넌트는 **어떤 값이 와도 안전하게** 짠다.

## 🔗 시너지

- **04장 loader** — 에러 경계는 loader와 짝이다. `pendingComponent`(로딩) ·
  `errorComponent`(실패) · `notFoundComponent`(없음) 세 개를 함께 지정해야 한 라우트의
  상태 표현이 완성된다.
- **06장 beforeLoad/redirect** — 리다이렉트가 에러와 같은 메커니즘(throw)을 쓴다는 것을
  이해하면 `isRedirect` 의 필요성이 분명해진다.
- **10장 Deferred** — 부분 실패를 부분적으로 보여 주려면 `CatchBoundary` 가 필요하다.
- **11장 Match API** — `match.status === 'error'`, `match.error` 로 에러 상태를 밖에서
  관찰할 수 있다. 전역 에러 배너 같은 UI에 쓴다.

## ▶ 실행 예제

- `/data/basics?fail=true` — loader가 throw하고 `errorComponent` 가 받는다
- `/auth/notfound` · `/auth/notfound?missing=true` — `notFound()` 와 `notFoundComponent`

`CatchBoundary`, `CatchNotFound` 는 `apps/playground` 에서 위 코드를 옮겨 실습하기 좋다.
일부러 throw하는 위젯을 만들어 감싸 보면 경계가 어디까지 막는지 체감된다.

## 📖 공식 문서

- [Not Found Errors](https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors)
- [`notFound`](https://tanstack.com/router/latest/docs/framework/react/api/router/notFoundFunction)
- [`CatchBoundary`](https://tanstack.com/router/latest/docs/framework/react/api/router/catchBoundaryComponent)
- [`ErrorComponent`](https://tanstack.com/router/latest/docs/framework/react/api/router/errorComponentComponent)
