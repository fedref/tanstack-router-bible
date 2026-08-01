# 09 · 코드 스플리팅 & Lazy 로딩

> 대응 예제: `/code-splitting` · `/code-splitting/manual`
> `autoCodeSplitting: true` 가 이미 켜져 있다.
> 예제 파일: `apps/bible/vite.config.ts`, `apps/bible/dist/assets/*.js`(빌드 산출물)
> 📖 공식: [code-splitting](https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting) ·
> [createLazyFileRoute](https://tanstack.com/router/latest/docs/framework/react/api/router/createLazyFileRouteFunction) ·
> [lazyRouteComponent](https://tanstack.com/router/latest/docs/framework/react/api/router/lazyRouteComponentFunction)

## 한 줄 정의 & 언제 쓰나

**코드 스플리팅은 "지금 필요 없는 화면의 코드를 나중에 받게" 만드는 기법이다.** 라우터는
어차피 URL 단위로 화면을 나누므로, 코드도 같은 경계로 나누기에 가장 자연스러운 지점이다.

라우트가 10개인 앱에서 첫 화면을 열 때 10개 화면의 코드를 모두 받을 이유가 없다. 사용자가
`/dashboard` 로 갈 때 그 코드를 받으면 된다. 초기 번들이 작아지면 **첫 화면이 뜨는 시간이
직접적으로 줄어든다.**

TanStack Router는 이걸 **세 가지 층위**로 제공한다. 아래로 갈수록 손이 많이 가고, 대신
세밀하게 제어할 수 있다.

| 방법 | 손이 가는 정도 | 언제 |
|------|:---:|------|
| ① `autoCodeSplitting: true` | 설정 한 줄 | **거의 항상 이걸로 충분하다** |
| ② `.lazy.tsx` 파일 분리 | 파일을 둘로 나눔 | 자동 분할을 끄고 라우트별로 직접 고를 때 |
| ③ `lazyRouteComponent()` | 코드로 직접 | 라우트가 아닌 임의 컴포넌트, 또는 코드기반 라우팅 |

## ① 최소 예제 — 플러그인에 한 줄

이 저장소가 쓰는 방식이다.

```ts
// apps/bible/vite.config.ts
TanStackRouterVite({
  target: 'react',
  autoCodeSplitting: true,   // ← 이 한 줄
})
```

이것만으로 **모든 라우트의 컴포넌트가 자동으로 별도 청크가 된다.** 우리 코드에는
`lazy` 라는 단어조차 등장하지 않는다. 실제로 이 저장소를 빌드하면 라우트 이름이 그대로
붙은 청크가 쏟아진다:

```
apps/bible/dist/assets/
├── auth.login-pXXmqstp.js            ← /auth/login 진입 시에만 받는다
├── auth._protected.dashboard-*.js
├── navigation.link-*.js
├── query.mutation-*.js
└── index-*.js                        ← 공통 번들
```

`pnpm --filter bible build` 를 돌린 뒤 `dist/assets/` 를 직접 열어 보면 눈으로 확인할 수 있다.

### 무엇이 분리되고 무엇이 남는가

여기가 핵심이다. **라우트 파일 전체가 분리되는 게 아니다.** 기본 동작은
`[['component'], ['pendingComponent'], ['errorComponent'], ['notFoundComponent']]` 로,
네 가지 컴포넌트가 **각각 따로** 떨어져 나간다.

반대로 **분리되지 않고 초기 번들에 남는 것**들이 있다:

- `loader` — 데이터를 먼저 받아야 화면을 그릴 수 있으므로, 컴포넌트를 기다리는 동안
  병렬로 실행되어야 한다. 같이 분리하면 "코드 받기 → 그다음 데이터 받기" 로 직렬이 된다.
- `beforeLoad` — 인증 가드가 여기 있다. 분리하면 가드를 통과시킬지 판단하기 위해 코드를
  먼저 내려받아야 하고, 이는 곧 보호된 화면의 코드를 미인증 사용자에게 보내는 셈이 된다.
- `validateSearch`, `params.parse` — 매칭 단계에서 즉시 필요하다.

이 설계 때문에 **"loader에 무거운 라이브러리를 import 하면 그게 초기 번들에 들어간다."**
날짜 파싱 라이브러리나 마크다운 파서를 loader 상단에서 정적 import 하면 코드 스플리팅
효과가 통째로 사라진다. 이럴 땐 loader 안에서 동적 `import()` 를 쓴다.

```tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // ❌ 파일 상단에서 import 하면 초기 번들에 포함된다
    // ✅ 필요한 시점에 동적으로 받는다
    const { marked } = await import('marked')
    const post = await fetchPost(params.postId)
    return { html: marked(post.body) }
  },
})
```

## ② `.lazy.tsx` — 파일을 둘로 나누는 방식

`autoCodeSplitting` 을 끄고 라우트별로 직접 고르고 싶을 때 쓴다. 규칙은 **한 라우트를 두
파일로 나누는 것**이다.

```tsx
// posts.tsx — 즉시 로드되는 쪽 (loader, beforeLoad, validateSearch …)
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  // component 를 여기 쓰지 않는다
})
```

```tsx
// posts.lazy.tsx — 나중에 받는 쪽 (컴포넌트들)
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/posts')({
  component: PostsPage,
  pendingComponent: () => <div>불러오는 중…</div>,
  errorComponent: ({ error }) => <div>{error.message}</div>,
  notFoundComponent: () => <div>없는 글입니다</div>,
})
```

두 파일의 경로 문자열(`'/posts'`)이 같아야 한 라우트로 합쳐진다.

### `createLazyFileRoute` 에는 컴포넌트 4종만 넣을 수 있다

타입 정의가 이를 강제한다:

```ts
type LazyRouteOptions = Pick<UpdatableRouteOptions<…>,
  'component' | 'errorComponent' | 'pendingComponent' | 'notFoundComponent'>
```

즉 `loader`, `beforeLoad`, `validateSearch`, `staleTime` 같은 건 **넣을 수 없다.** 실수로
넣으면 타입 에러가 난다. 위에서 설명한 "분리하면 안 되는 것들"이 타입 수준에서 차단되는
셈이다. 규칙을 외우지 않아도 컴파일러가 막아 준다.

### 코드기반 라우팅이라면 `createLazyRoute`

파일기반이 아니라 `createRoute` 로 직접 트리를 만드는 경우에는 라우트 **id** 로 짝을 짓는다.

```tsx
import { createLazyRoute } from '@tanstack/react-router'

export const Route = createLazyRoute('/posts')({
  component: PostsPage,
})
```

`createLazyFileRoute` 는 파일 경로로, `createLazyRoute` 는 라우트 id로 연결한다는 점만
다르고 받는 옵션은 동일하다.

## ③ `lazyRouteComponent()` — 컴포넌트 단위로 직접

파일을 나누지 않고 **컴포넌트 하나만** 늦게 받고 싶을 때 쓴다.

```tsx
import { lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/heavy')({
  // default export 를 쓰는 경우
  component: lazyRouteComponent(() => import('./-components/heavy-chart')),
})
```

named export 라면 두 번째 인자로 이름을 준다.

```tsx
component: lazyRouteComponent(
  () => import('./-components/charts'),
  'RevenueChart',   // ← export const RevenueChart = …
)
```

### React의 `lazy()` 와 무엇이 다른가

둘 다 동적 import를 감싸지만 **라우터와의 협조 여부**가 다르다.

| | `React.lazy` | `lazyRouteComponent` |
|---|---|---|
| Suspense 필요 | 직접 `<Suspense>` 로 감싸야 함 | 라우터의 `pendingComponent` 가 처리 |
| preload 연동 | 없음 | **`Link` 의 preload 시 컴포넌트도 미리 받는다** |
| 에러 처리 | 직접 ErrorBoundary | 라우터의 `errorComponent` |

두 번째 항목이 결정적이다. `defaultPreload: 'intent'` 를 켜 두면 링크에 마우스를 올리는
순간 **데이터(loader)와 코드(청크)를 동시에** 미리 받는다. 클릭했을 때는 둘 다 준비되어
있어 즉시 전환된다. React의 `lazy()` 로는 이 협조가 일어나지 않아, 클릭 후에야 코드를
받기 시작한다.

### `lazyFn()` — loader를 늦게 받기

컴포넌트가 아니라 **함수**를 지연 로드하는 짝이다.

```tsx
import { lazyFn } from '@tanstack/react-router'

export const Route = createFileRoute('/reports')({
  loader: lazyFn(() => import('./-loaders/report-loader'), 'loadReport'),
})
```

다만 앞서 설명한 이유로 **loader 분리는 일반적으로 권장되지 않는다.** 실제로 이와 짝이
되는 `FileRouteLoader` 는 공식적으로 deprecated 되었고, 타입 정의에 이렇게 적혀 있다:

> `@deprecated` It's recommended not to split loaders into separate files.
> Instead, place the loader function in the main route file via `createFileRoute`.

loader 자체가 아주 무거운 코드(예: 거대한 파서)에 의존할 때만 고려하고, 그마저도 앞에서
본 loader 내부 동적 `import()` 로 해결되는 경우가 대부분이다.

## 옵션·변형 — 분할 단위를 직접 설계하기

기본 분할 방식이 마음에 들지 않으면 그룹을 재정의할 수 있다. 두 층위가 있다.

### 라우트 하나만 — `codeSplitGroupings`

```tsx
export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
  pendingComponent: Skeleton,
  errorComponent: ErrorView,
  // 세 컴포넌트를 각각이 아니라 "한 청크"로 묶는다
  codeSplitGroupings: [['component', 'pendingComponent', 'errorComponent']],
})
```

기본값은 넷을 각각 떼는 것(`[['component'],['pendingComponent'],…]`)이다. 조각이 잘게
나뉘면 요청 수가 늘어난다. pending/error 컴포넌트가 아주 작다면 위처럼 묶는 편이 요청
수를 줄여 오히려 빠를 수 있다.

지정 가능한 값은 다섯 가지다: `'loader'`, `'component'`, `'pendingComponent'`,
`'errorComponent'`, `'notFoundComponent'`.

### 앱 전체 — `codeSplittingOptions`

플러그인 옵션으로 전역 정책을 세운다.

```ts
TanStackRouterVite({
  target: 'react',
  autoCodeSplitting: true,
  codeSplittingOptions: {
    // 전역 기본값을 바꾼다
    defaultBehavior: [['component'], ['errorComponent', 'notFoundComponent']],

    // 라우트 id 별로 프로그램적으로 결정한다
    splitBehavior: ({ routeId }) => {
      // 관리자 화면은 통째로 하나의 청크로
      if (routeId.startsWith('/admin')) {
        return [['component', 'pendingComponent', 'errorComponent']]
      }
      // undefined 를 반환하면 defaultBehavior 를 따른다
    },

    // 특정 노드를 아예 번들에서 제거한다 (예: 프로덕션에서 devtools용 코드)
    deleteNodes: [],

    // HMR 지원 코드 삽입 여부. 기본 true
    addHmr: true,
  },
})
```

`splitBehavior` 의 `routeId` 는 **타입 안전**하다. 등록된 라우트 id만 들어오므로 오타가
타입 에러로 잡힌다.

### `wrapInSuspense` — 강제로 Suspense 경계 만들기

```tsx
export const Route = createFileRoute('/widget')({
  wrapInSuspense: true,
  component: Widget,
})
```

라우터는 필요할 때만 Suspense 경계를 만드는데, 이 옵션을 켜면 **항상** 감싼다. 컴포넌트
안에서 `use()` 나 `useSuspenseQuery()` 를 쓰는데 상위에 경계가 없어 앱 전체가 흔들릴 때
쓴다. 대개는 `pendingComponent` 를 지정하는 것으로 충분하고, 이 옵션까지 갈 일은 드물다.

## 흔한 실수 / 함정

**1. `.lazy.tsx` 에 loader를 넣으려다 타입 에러**
의도된 차단이다. loader는 본체 파일(`posts.tsx`)에 둔다.

**2. `autoCodeSplitting` 을 켰는데 번들이 안 줄어든다**
라우트 파일 상단에서 무거운 라이브러리를 정적 import 하고 있을 확률이 높다. 그 import가
`loader` 나 모듈 최상위에서 쓰이면 초기 번들에 남는다. `pnpm --filter bible build` 로
청크 목록을 보고, 큰 청크가 어디에 딸려 있는지 확인한다.

**3. 두 파일의 경로 문자열이 다르다**
`posts.tsx` 의 `createFileRoute('/posts')` 와 `posts.lazy.tsx` 의
`createLazyFileRoute('/posts')` 는 **문자열이 정확히 같아야** 한 라우트로 합쳐진다.
다르면 조용히 별개 라우트가 되거나 컴포넌트가 없는 라우트가 된다.

**4. 청크가 너무 잘게 쪼개져 요청이 폭증**
라우트 100개 × 컴포넌트 4종 = 최대 400개 청크가 될 수 있다. HTTP/2에서도 무료는 아니다.
`codeSplittingOptions.defaultBehavior` 로 묶어 준다.

**5. `React.lazy` 를 습관적으로 쓴다**
동작은 하지만 preload 연동을 잃는다. 라우트 컴포넌트라면 `lazyRouteComponent` 를 쓴다.

## 🔗 시너지

- **02장 Preloading** — `defaultPreload: 'intent'` 와 조합할 때 진가가 나온다. 코드
  스플리팅만 켜면 클릭 후 대기가 생기지만, preload와 함께 쓰면 hover 시점에 코드와
  데이터를 병렬로 받아 대기가 사라진다. **둘은 세트로 켜는 것이 기본값에 가깝다.**
- **04장 pendingComponent** — 청크를 받는 동안 보여줄 UI가 `pendingComponent` 다.
  `pendingMs` 로 "얼마나 늦어지면 보여줄지"를 조절한다.
- **06장 beforeLoad 가드** — beforeLoad가 분리되지 않는 이유가 여기 있다. 보호된 라우트의
  판단 로직은 항상 즉시 실행되어야 한다.
- **10장 Deferred** — 코드 스플리팅이 *코드*를 나중에 받는 것이라면, Deferred는 *데이터*를
  나중에 받는 것이다. 둘을 함께 쓰면 "껍데기 먼저, 코드와 데이터는 뒤따라" 가 된다.

## ▶ 실행 예제

이 저장소 전체가 예제다. `apps/bible/vite.config.ts` 에 `autoCodeSplitting: true` 가
켜져 있고, 빌드하면 라우트별 청크가 생성된다.

```bash
pnpm --filter bible build
ls apps/bible/dist/assets/ | head -20    # 라우트 이름이 붙은 청크들
```

브라우저 개발자도구 Network 탭을 열고 사이드바의 링크에 **마우스만 올려 보면**
(클릭하지 않아도) 해당 라우트의 `.js` 청크를 받아 오는 것을 볼 수 있다. 이것이
`defaultPreload: 'intent'` 와 코드 스플리팅의 조합이다.

## 📖 공식 문서

- [Code Splitting 가이드](https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting)
- [`createLazyFileRoute`](https://tanstack.com/router/latest/docs/framework/react/api/router/createLazyFileRouteFunction)
- [`createLazyRoute`](https://tanstack.com/router/latest/docs/framework/react/api/router/createLazyRouteFunction)
- [`lazyRouteComponent`](https://tanstack.com/router/latest/docs/framework/react/api/router/lazyRouteComponentFunction)
