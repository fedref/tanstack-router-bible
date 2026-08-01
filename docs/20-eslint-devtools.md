# 20 · ESLint 플러그인 & Devtools

> 대응 예제: 좌하단 Devtools 아이콘 (모든 라우트)
> 📖 공식: [eslint-plugin-router](https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router) ·
> [create-route-property-order](https://tanstack.com/router/latest/docs/eslint/create-route-property-order) ·
> [devtools](https://tanstack.com/router/latest/docs/framework/react/devtools)

## 1부 · ESLint 플러그인

### 왜 필요한가 — 속성 순서가 타입을 바꾼다

TanStack Router에서 **라우트 옵션 객체의 속성 순서는 취향이 아니다.** 순서가 틀리면
타입 추론이 깨진다.

```tsx
// ❌ loader 가 beforeLoad 보다 위에 있다
export const Route = createFileRoute('/posts')({
  loader: ({ context }) => {
    context.user     // ⚠️ beforeLoad 가 넣어 준 user 를 타입이 모른다
  },
  beforeLoad: ({ context }) => ({ user: getUser() }),
})

// ✅ beforeLoad 가 먼저
export const Route = createFileRoute('/posts')({
  beforeLoad: ({ context }) => ({ user: getUser() }),
  loader: ({ context }) => {
    context.user     // ✅ 타입이 살아 있다
  },
})
```

TypeScript는 객체 리터럴의 속성을 **위에서 아래로 순차 평가**하며 타입을 좁혀 나간다.
`beforeLoad` 가 컨텍스트에 값을 더한다는 사실을 `loader` 가 알려면, `beforeLoad` 가 먼저
평가되어야 한다.

이건 눈으로 잡기 어렵고, 잡아도 계속 재발한다. **린터에게 맡기는 게 맞다.**

### 필수 순서

```
① params · validateSearch
② loaderDeps · search.middlewares · ssr
③ context
④ beforeLoad
⑤ loader
⑥ (순서 무관) onEnter · onStay · onLeave · head · scripts · headers · remountDeps
```

`component`, `errorComponent`, `staleTime` 등 나머지 속성은 순서에 영향받지 않는다.

외우기보다 **흐름을 이해하는 편이 낫다.** URL을 해석하고(①) → 의존값을 뽑고(②) →
컨텍스트를 만들고(③④) → 데이터를 불러온다(⑤). 라우터가 실제로 실행하는 순서 그대로다.

### 설치와 설정

```bash
pnpm add -D @tanstack/eslint-plugin-router
```

**Flat Config (ESLint 9+)**

```js
// eslint.config.js
import pluginRouter from '@tanstack/eslint-plugin-router'

export default [
  ...pluginRouter.configs['flat/recommended'],
]
```

직접 지정하려면:

```js
export default [
  {
    plugins: { '@tanstack/router': pluginRouter },
    rules: { '@tanstack/router/create-route-property-order': 'error' },
  },
]
```

**Legacy Config (.eslintrc)**

```json
{ "extends": ["plugin:@tanstack/eslint-plugin-router/recommended"] }
```

### 제공 규칙

| 규칙 | 내용 |
|------|------|
| `@tanstack/router/create-route-property-order` | 위 순서를 강제. **자동 수정 가능**(`--fix`) |

적용 대상은 `createRoute`, `createFileRoute`, `createRootRoute`,
`createRootRouteWithContext` 네 함수다.

### `@typescript-eslint/only-throw-error` 와의 충돌

이 규칙을 함께 쓴다면 예외를 등록해야 한다. TanStack Router는 `redirect()` 와
`notFound()` 를 **throw로 구현**하는데, 그 값이 `Error` 인스턴스가 아니기 때문이다
(12장 참조).

```js
{
  rules: {
    '@typescript-eslint/only-throw-error': ['error', {
      allow: [
        { from: 'package', package: '@tanstack/router-core', name: ['Redirect', 'NotFoundError'] },
      ],
    }],
  },
}
```

등록하지 않으면 정상적인 `throw redirect(…)` 가 전부 린트 에러로 잡힌다.

## 2부 · Devtools

### 설치와 배치

```bash
pnpm add -D @tanstack/react-router-devtools
```

```tsx
// __root.tsx
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

function RootLayout() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  )
}
```

이 저장소는 `apps/bible/src/routes/__root.tsx` 에 이렇게 넣어 두었고, 화면 좌하단
아이콘으로 열린다.

### 프로덕션 번들에서 빼기

devtools는 개발용이다. 프로덕션 빌드에서 제외하려면 조건부 lazy 로딩을 쓴다.

```tsx
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((d) => ({
        default: d.TanStackRouterDevtools,
      })),
    )
```

> Vite는 `import.meta.env.PROD` 를 빌드 시점에 상수로 치환하므로, 프로덕션에서는 import
> 자체가 트리 셰이킹으로 제거된다.

### 무엇을 볼 수 있나 — 읽는 법

Devtools를 열면 정보가 많아 처음엔 압도된다. **실제로 자주 보게 되는 것은 네 가지**다.

| 패널 | 볼 것 | 언제 유용한가 |
|------|-------|---------------|
| **Matches** | 지금 매칭된 라우트 목록과 각각의 `status` | "왜 이 컴포넌트가 안 뜨지?" |
| **Loader Data** | 각 매치의 `loaderData` | "데이터가 왜 undefined지?" |
| **Search Params** | 검증 후의 search 값 | `validateSearch` 가 기대대로 동작하는지 |
| **Route Tree** | 전체 라우트 트리 | 파일 이름이 의도한 URL이 됐는지 |

**11장의 Match API가 보여 주는 것과 같은 정보**다. `useMatches()` 로 코드에서 읽는 것을
Devtools는 화면으로 보여 준다. 둘을 함께 알면 디버깅이 빨라진다.

### 자주 쓰는 디버깅 흐름

**"loader가 왜 다시 안 돌지?"**
→ Matches에서 `status` 와 `updatedAt` 확인 → `loaderDeps` 가 실제로 바뀌었는지 확인
(04장 · 11장 `useLoaderDeps`)

**"링크를 눌렀는데 404가 뜬다"**
→ Route Tree에서 그 경로가 생성됐는지 확인 → 없다면 파일 이름 규칙 문제(01장)

**"search 값이 사라진다"**
→ Search Params 패널에서 검증 후 값 확인 → `validateSearch` 스키마나 미들웨어 확인(03·13장)

### React Query Devtools와 함께

07장처럼 TanStack Query를 함께 쓴다면 두 Devtools를 같이 띄우는 것이 좋다. 이 저장소도
그렇게 되어 있다.

```tsx
<TanStackRouterDevtools position="bottom-left" />
<ReactQueryDevtools initialIsOpen={false} />
```

**라우터 캐시와 Query 캐시는 별개**다. loader가 `ensureQueryData` 로 프리페치했다면 데이터는
Query 쪽에 있다. "loaderData는 비었는데 화면은 잘 나온다"면 정상이며, Query Devtools를
봐야 한다.

## 흔한 실수 / 함정

**1. 속성 순서를 손으로 관리한다**
반드시 재발한다. 린터를 켠다. `--fix` 로 자동 수정된다.

**2. `only-throw-error` 예외를 등록하지 않는다**
정상적인 `throw redirect()` 가 전부 에러로 잡혀, 결국 규칙을 통째로 끄게 된다.

**3. Devtools를 프로덕션에 포함시킨다**
번들이 수백 KB 커진다. 조건부 lazy 로딩으로 뺀다.

**4. Devtools를 `__root.tsx` 밖에 둔다**
`RouterProvider` 컨텍스트 안에 있어야 라우터 상태를 읽을 수 있다.

## 🔗 시너지

- **05장 타입 안전성** — 속성 순서 규칙은 "타입 추론이 어떻게 흐르는가"의 실무적 귀결이다.
  05장을 이해했다면 왜 순서가 중요한지 납득된다.
- **11장 Match API** — Devtools가 화면으로 보여 주는 것을 코드로 읽는 방법.
- **12장 에러 경계** — `redirect`/`notFound` 가 throw라는 사실이 린트 설정까지 영향을 준다.

## ▶ 실행 예제

- 모든 라우트 — 좌하단 Devtools 아이콘
- `apps/bible/src/routes/__root.tsx` — Devtools 배치 코드

이 저장소에는 아직 ESLint 설정이 없다. `apps/playground` 에 플러그인을 직접 설치하고
일부러 `loader` 를 `beforeLoad` 위에 둬 보면, 린트 에러와 함께 **타입 추론이 실제로 깨지는
것**을 동시에 확인할 수 있다.

## 📖 공식 문서

- [ESLint Plugin Router](https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router)
- [create-route-property-order](https://tanstack.com/router/latest/docs/eslint/create-route-property-order)
- [Devtools](https://tanstack.com/router/latest/docs/framework/react/devtools)
