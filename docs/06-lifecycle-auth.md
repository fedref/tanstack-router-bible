# 06 · 라이프사이클 & 인증

> 대응 예제: `/auth`, `/auth/login`, `/auth/dashboard`(보호됨), `/auth/notfound`
> 예제 파일: `apps/bible/src/routes/auth*.tsx`, `apps/bible/src/lib/auth.ts`
> 📖 공식: [authenticated-routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes) ·
> [not-found-errors](https://tanstack.com/router/latest/docs/framework/react/guide/not-found-errors)

Chapter 04에서 loader(데이터가 먼저)를 봤다면, 이번엔 그보다도 **먼저** 실행되는
`beforeLoad` 를 무기로 쓴다. 인증 게이트와 "없음(Not Found)" 처리가 이 Chapter의 두 축이다.

## 한 줄 정의 & 언제 쓰나

- **beforeLoad** — 라우트에 진입하기 직전, loader 보다도 먼저 실행. 여기서 `redirect()` 를 던져
  다른 곳으로 보내거나 context 를 주입한다. **인증 게이트의 자리.**
- **notFound()** — loader/beforeLoad 에서 던지면 에러가 아니라 "없음" 전용 UI 로 넘어간다.

## Authenticated Routes — pathless 레이아웃 + 가드

핵심 패턴은 **"보호 로직을 한 곳에 모으기"** 다. `_protected` 같은 pathless 레이아웃을 만들고
그 `beforeLoad` 에 가드를 한 번만 걸면, 아래 모든 라우트가 자동으로 보호된다.

```tsx
// auth._protected.tsx — 앞 밑줄이라 URL에는 안 붙는다(/auth/dashboard 그대로)
export const Route = createFileRoute('/auth/_protected')({
  beforeLoad: ({ location }) => {
    if (!auth.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },   // 로그인 후 되돌아올 위치
      })
    }
  },
  component: () => <Outlet />,
})

// auth._protected.dashboard.tsx — /auth/dashboard. 인증 코드가 한 줄도 없다!
export const Route = createFileRoute('/auth/_protected/dashboard')({
  component: Dashboard,   // 여기까지 왔으면 이미 통과한 상태
})
```

로그인 페이지는 `?redirect` 를 읽어 **원래 가려던 곳으로 되돌려보낸다**:

```tsx
function LoginPage() {
  const { redirect } = Route.useSearch()
  const router = useRouter()

  function onLogin() {
    auth.login()
    router.history.push(redirect)   // to 가 임의 문자열이라 history.push 를 쓴다
  }
}
```

→ 실행: `/auth` 상태 바에서 **로그아웃** 상태로 "대시보드(보호됨)"를 누르면 로그인으로 튕기고,
로그인하면 대시보드로 되돌아온다.

## Not Found Errors

데이터가 없을 때는 에러가 아니라 "없음"으로 다루는 게 맞다. loader 에서 `notFound()` 를 던지면
가장 가까운 `notFoundComponent` 로 넘어간다.

```tsx
export const Route = createFileRoute('/auth/notfound')({
  loader: ({ deps }) => {
    const item = findItem(/* ... */)
    if (!item) throw notFound()          // 없음 → notFoundComponent
    return item
  },
  notFoundComponent: () => <p>항목을 찾지 못했습니다</p>,
  component: NotFoundDemo,
})
```

- 라우트별 `notFoundComponent` 또는 라우터 전역 `defaultNotFoundComponent` 로 UI를 정한다.
- `notFound()` 는 **에러가 아니다.** errorComponent 가 아니라 notFoundComponent 로 간다.

→ 실행: `/auth/notfound` 에서 "없는 항목"을 누르면 notFoundComponent 가 뜬다.

## 옵션·변형 (다양한 결과)

- **가드 위치.** pathless 레이아웃 대신 개별 라우트의 `beforeLoad` 에 걸 수도 있다. 여러 라우트를
  묶어 보호하려면 pathless 레이아웃이 압도적으로 편하다.
- **context 로 인증 주입.** 루트 context 에 `auth` 를 넣어 `beforeLoad({ context })` 에서 읽으면
  테스트/모킹이 쉬워진다(Chapter 05).
- **redirect 되돌리기.** `location.href` 대신 특정 라우트로 고정할 수도 있다.
- **notFound 범위.** `notFound({ routeId })` 로 어느 라우트의 notFoundComponent 를 쓸지 지정 가능.

## 흔한 실수 / 함정

- **가드를 컴포넌트 안에서 검사.** `useEffect` 로 인증 확인 후 리다이렉트하면 보호된 화면이 한 번
  번쩍인다. `beforeLoad` 는 **렌더 전**이라 그 깜빡임이 없다.
- **redirect 를 return.** `redirect()` 는 **던져야(throw)** 한다. 그냥 반환하면 동작하지 않는다.
- **notFound 를 에러로 처리.** `throw new Error()` 로 없음을 표현하면 errorComponent 가 뜬다.
  의미상 "없음"이면 `notFound()` 를 쓴다.
- **login 의 redirect 를 `to` 로.** 되돌릴 주소는 임의 문자열이라 타입된 `to` 에 안 맞는다.
  `router.history.push(redirect)` 를 쓴다.

## 🔗 시너지

- `beforeLoad` + context ← [Chapter 05 Router Context]. 인증 상태를 context 로 흘려보낸다.
- `redirect()` ← [Chapter 02 Navigation] 의 이동 도구 중 로직용.
- `notFound()` ← [Chapter 04 Data Loading]. loader 가 데이터를 못 찾을 때의 정식 처리.
- 동적 세그먼트로 항목 조회 ← [Chapter 03 Path Params].

## ▶ 실행 예제

- `/auth` — beforeLoad 게이트 개요 · 로그인 상태 바
- `/auth/login` — redirect 되돌리기
- `/auth/dashboard` — pathless `_protected` 로 보호된 라우트
- `/auth/notfound` — notFound() · notFoundComponent
