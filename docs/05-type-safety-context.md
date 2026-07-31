# 05 · 타입 안전성 & 컨텍스트

> 대응 예제: `/type-safety`, `/type-safety/context`, `/type-safety/utils`
> 예제 파일: `apps/bible/src/routes/type-safety*.tsx`
> 📖 공식: [type-safety](https://tanstack.com/router/latest/docs/framework/react/guide/type-safety) ·
> [type-utilities](https://tanstack.com/router/latest/docs/framework/react/guide/type-utilities) ·
> [router-context](https://tanstack.com/router/latest/docs/framework/react/guide/router-context)

앞의 Chapter들에서 "타입이 흐른다"는 말을 여러 번 했다. 이번엔 그 원리를 정면으로 본다.
동시에 **Router Context**(타입 있는 의존성 주입)를 익혀, Chapter 06 인증과 Chapter 07 Query 의
발판을 놓는다.

## 한 줄 정의 & 언제 쓰나

- **타입 안전성** — `Register` 선언 한 번으로 경로·params·search·context 의 타입이 앱 전체로
  흐른다. 실수는 런타임이 아니라 에디터에서 잡힌다.
- **Router Context** — 라우트 트리 전역에 값을 주입하는 통로. loader/beforeLoad/컴포넌트 어디서든
  타입과 함께 꺼내 쓴다.

## 타입은 어떻게 흐르는가

비결은 단 한 번의 등록이다.

```tsx
// main.tsx
const router = createRouter({ routeTree, context: { queryClient } })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

이 선언 덕에 아래가 전부 **컴파일 에러**로 잡힌다(런타임까지 가지 않는다):

```tsx
<Link to="/nope" />                                   // ❌ 없는 경로
<Link to="/params/path/$userId" />                    // ❌ params 누락
<Link to="/params/search" search={{ page: 'x' }} />   // ❌ page 는 number

const { userId } = Route.useParams()   // ✅ userId: number (자동 추론)
const { q } = Route.useSearch()        // ✅ q: string
```

## Router Context — 타입 있는 의존성 주입

context 는 두 단계로 채워진다. **루트에서 최초 주입**하고, 각 라우트의 **beforeLoad 가 값을 더해**
자식에게 내려보낸다.

```tsx
// 1) 루트에서 최초 주입
createRouter({ routeTree, context: { queryClient } })
createRootRouteWithContext<{ queryClient: QueryClient }>()({ /* ... */ })

// 2) beforeLoad 로 값을 더해 자식에게 전달
export const Route = createFileRoute('/type-safety/context')({
  beforeLoad: ({ context }) => {
    void context.queryClient          // 부모 context, 타입 있음
    return { role: 'admin' as const, loadedAt: now() }
  },
  component: ContextDemo,
})

// 3) 병합된 context 를 타입과 함께 읽는다
function ContextDemo() {
  const ctx = Route.useRouteContext()  // { queryClient, role, loadedAt }
}
```

- 루트에서 온 값(`queryClient`)과 beforeLoad 가 더한 값(`role`, `loadedAt`)이 **하나의 타입**으로
  합쳐진다.
- 같은 context 를 `loader({ context })`, `beforeLoad({ context })` 에서도 쓴다. 그래서 인증 검사나
  Query 프리페치의 공유 도구가 된다.

→ 실행: `/type-safety/context` 에서 병합된 context(queryClient + role + loadedAt)를 확인.

## getRouteApi — 컴포넌트 밖에서도 타입 유지

라우트 컴포넌트가 아닌 곳(깊은 자식 컴포넌트 등)에서 그 라우트의 훅을 쓰고 싶을 때, `Route`
객체를 import 하거나 props 로 넘기지 않고 `getRouteApi` 로 접근한다.

```tsx
import { getRouteApi } from '@tanstack/react-router'

const api = getRouteApi('/type-safety/utils')

function Panel() {
  const { n } = api.useSearch()       // number, 타입 추론됨
  const navigate = api.useNavigate()
  // api.useParams() / api.useLoaderData() / api.useRouteContext() 도 동일
}
```

→ 실행: `/type-safety/utils` 의 `<Panel>` 은 라우트 컴포넌트가 아닌데도 `?n` 을 타입과 함께
읽고 갱신한다.

## 옵션·변형 — strict / from · 타입 유틸

훅을 라우트 밖에서 쓸 때 기준을 알려 주는 방법은 둘이다.

```tsx
// A. from 으로 특정 라우트 기준 (권장 — 정확한 타입)
const { n } = useSearch({ from: '/type-safety/utils' })

// B. strict: false — 아무 라우트에서나 느슨하게 (타입은 넓어짐)
const search = useSearch({ strict: false })

// 자주 쓰는 타입 유틸
import type { LinkProps } from '@tanstack/react-router'
type MyLink = LinkProps
```

## 흔한 실수 / 함정

- **Register 누락.** 이걸 빠뜨리면 타입 추론이 통째로 꺼진다. 자동완성이 안 되면 여기부터 본다.
- **라우트 밖에서 from 없이 훅 사용.** `useSearch()` 를 라우트 밖에서 그냥 부르면 타입을 못 좁힌다.
  `from` 을 주거나 `getRouteApi` 를 쓴다.
- **context 를 상태로 오해.** context 는 리렌더를 일으키는 React state 가 아니다. 자주 바뀌는
  값(로그인 여부 등)은 beforeLoad 에서 다시 계산되게 설계한다.
- **context 타입을 루트에서 안 잡음.** `createRootRouteWithContext<T>()` 로 타입을 선언해야
  자식들이 그 타입을 본다.

## 🔗 시너지

- context 의 `queryClient` → [Chapter 07 Query 통합] 에서 loader 프리페치에 그대로 쓰인다.
- `beforeLoad` + context → [Chapter 06 Authenticated Routes] 의 인증 게이트 핵심.
- `getRouteApi` / `from` → [Chapter 03·04] 의 params·search·loaderData 를 어디서든 안전하게 읽기.

## ▶ 실행 예제

- `/type-safety` — Register 원리 · 컴파일 에러 예
- `/type-safety/context` — 루트 주입 + beforeLoad 병합 + useRouteContext
- `/type-safety/utils` — getRouteApi · strict/from · 타입 유틸
