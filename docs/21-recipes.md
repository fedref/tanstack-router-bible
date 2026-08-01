# 21 · 실전 레시피 (How-To)

> 성격: **문제 해결 모음**. 앞 장들이 "이 기능은 무엇인가"를 다뤘다면, 이 장은
> **"이걸 하려면 어떻게 하나"** 에 답한다.
> 📖 공식: [How-To 가이드 전체](https://github.com/TanStack/router/tree/main/docs/router/how-to)
> — 공식 사이드바에는 노출되지 않지만 저장소에 존재하는 20여 개 문서를 정리했다.

---

## 목차

| # | 레시피 | 관련 장 |
|---|--------|---------|
| 1 | [테스트 작성하기](#1-테스트-작성하기) | 14 (memory history) |
| 2 | [라우터 문제 디버깅](#2-라우터-문제-디버깅) | 20 (Devtools) |
| 3 | [프로덕션 배포](#3-프로덕션-배포) | 14 (history 종류) |
| 4 | [환경변수 다루기](#4-환경변수-다루기) | 16 (import.meta.env) |
| 5 | [복잡한 search — 배열·객체·Date](#5-복잡한-search--배열객체date) | 03 · 13 |
| 6 | [여러 라우트에서 search 공유](#6-여러-라우트에서-search-공유) | 13 |
| 7 | [인증 붙이기](#7-인증-붙이기) | 06 |
| 8 | [RBAC — 역할 기반 접근 제어](#8-rbac--역할-기반-접근-제어) | 05 · 06 |
| 9 | [UI 라이브러리 통합](#9-ui-라이브러리-통합) | 16 |
| 10 | [React Router에서 이사하기](#10-react-router에서-이사하기) | 01 · 02 |
| 11 | [SSR 붙이기](#11-ssr-붙이기) 🚫 | 16 · 17 |

---

## 1. 테스트 작성하기

### 핵심 — 테스트에는 `createMemoryHistory` 를 쓴다

14장에서 다룬 대로, 브라우저 히스토리를 쓰면 **테스트 간에 URL 상태가 새어 나가** 서로
간섭한다. 테스트마다 메모리 히스토리를 새로 만든다.

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom \
            @testing-library/user-event jsdom
```

```ts
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    typecheck: { enabled: true },   // 타입 테스트까지 돌린다
  },
})
```

### 재사용 가능한 테스트 헬퍼

```tsx
// src/test/router-utils.tsx
import { render } from '@testing-library/react'
import {
  createMemoryHistory, createRootRoute, createRouter, Outlet, RouterProvider,
} from '@tanstack/react-router'

export const rootRoute = createRootRoute({ component: () => <Outlet /> })

export function renderWithRouter(routes: any[], initialLocation = '/') {
  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [initialLocation] }),
  })
  return { ...render(<RouterProvider router={router} />), router }
}
```

**여기서 코드기반 라우팅(17장)이 쓰인다.** 테스트에서는 파일 시스템을 흉내 내기보다
`createRoute` 로 필요한 라우트만 조립하는 편이 간단하다.

### 무엇을 테스트하나

```tsx
// ① params 가 제대로 들어오는가
const { router } = renderWithRouter([userRoute], '/users/123')
expect(screen.getByText('User: 123')).toBeInTheDocument()

// ② search 가 검증되는가
renderWithRouter([searchRoute], '/search?q=react&page=2')
expect(screen.getByText('Query: react, Page: 2')).toBeInTheDocument()

// ③ 링크 클릭으로 이동하는가 — router.state 로 확인
await user.click(screen.getByTestId('about-link'))
expect(router.state.location.pathname).toBe('/about')

// ④ 가드가 막는가 — beforeLoad 에서 redirect
renderWithRouter([protectedRoute, loginRoute], '/protected')
expect(screen.getByText('Login Required')).toBeInTheDocument()

// ⑤ loader 가 데이터를 주는가 — waitFor 필수 (비동기)
await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument())
expect(mockFetchUser).toHaveBeenCalledWith('1')
```

**`router.state.location` 을 직접 검증**하는 것이 요령이다. 화면 텍스트만 보면 "왜"
실패했는지 알기 어렵다.

### Query와 함께 테스트하기

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },   // 테스트에서 재시도는 방해만 된다
})

// context 로 queryClient 를 주입하고 QueryClientProvider 로 감싼다
```

### E2E는 Playwright

```ts
test('search 파라미터가 URL에 반영된다', async ({ page }) => {
  await page.goto('/search?q=react')
  await expect(page.locator('[data-testid="search-input"]')).toHaveValue('react')

  await page.fill('[data-testid="search-input"]', 'vue')
  await page.press('[data-testid="search-input"]', 'Enter')
  await expect(page).toHaveURL('/search?q=vue')
})
```

URL 자체가 상태인 라우터에서는 **`toHaveURL` 검증이 곧 상태 검증**이다. 이게 TanStack
Router 앱의 E2E가 비교적 쉬운 이유다.

---

## 2. 라우터 문제 디버깅

### 먼저 볼 것 다섯 가지

1. **Devtools의 Route Tree** — 그 경로가 실제로 생성됐는가
2. **경로 표기** — 앞 슬래시(`/about`), 동적 세그먼트(`$id`) 문법이 맞는가
3. **`RouterProvider` 안인가** — 밖에서 훅을 부르면 조용히 실패한다
4. **`beforeLoad`** — 의도치 않은 redirect가 걸려 있지 않은가
5. **콘솔** — loader에서 throw된 예외

### 증상 → 원인 → 해결

**라우트 매칭**

| 증상 | 원인 | 해결 |
|------|------|------|
| 404인데 라우트는 있다 | 트리에 안 붙음 | 부모 설정·파일 위치 확인 |
| params가 `undefined` | `{id}` 로 씀 | `$userId` 형태로 |
| params 타입이 이상하다 | 변환 없음 | `params.parse` 추가 (03장) |

**네비게이션**

| 증상 | 원인 | 해결 |
|------|------|------|
| 링크가 동작 안 함 | `href` 를 씀 | `<Link to="…">` |
| 이동이 조용히 실패 | Provider 밖 | `RouterProvider` 안으로 |
| 엉뚱한 곳으로 감 | `beforeLoad` 가드 | 무한 redirect 루프 확인 |

**데이터**

| 증상 | 원인 | 해결 |
|------|------|------|
| `useLoaderData()` 가 `undefined` | loader 미실행 | 라우트 설정 확인 |
| 데이터가 갱신 안 됨 | `loaderDeps` 누락 | 의존값 선언 (04장) |
| 로딩이 안 끝남 | loader 예외 | try/catch로 로그 |

**성능**

| 증상 | 원인 | 해결 |
|------|------|------|
| 리렌더 과다 | search 전체 구독 | `select` 로 좁히기 (11장) |
| 전환이 느림 | loader가 막고 있음 | Network 탭 확인 |

### 콘솔에서 바로 쓰는 명령

개발 중에는 라우터를 `window` 에 붙여 두면 편하다.

```ts
if (import.meta.env.DEV) {
  (window as any).router = router
}
```

```js
router.state                    // 현재 상태 스냅샷
router.state.location           // pathname · search · hash
router.state.matches            // 매칭된 라우트들
router.routesById               // 등록된 전체 라우트
router.buildLocation({ to: '/x' })  // 경로가 유효한지 확인
```

### 타입이 깨졌을 때

```bash
# routeTree.gen.ts 를 다시 만든다 (이 저장소는 빌드 시 자동 생성)
pnpm --filter bible build
```

`declare module '@tanstack/react-router'` 의 `Register` 선언이 있는지도 확인한다(05장).

---

## 3. 프로덕션 배포

### 근본 문제 — SPA는 서버 설정이 필요하다

`/posts/123` 을 **직접 입력하거나 새로고침**하면 브라우저는 서버에 그 경로를 요청한다.
서버에는 그런 파일이 없으니 404다. **모든 경로에 `index.html` 을 돌려주도록** 설정해야
한다.

### 플랫폼별 설정

| 플랫폼 | 방법 |
|--------|------|
| **GitHub Pages** | `index.html` 을 `404.html` 로 복사 (에러 페이지를 폴백으로 사용) |
| **Netlify** | `_redirects` 에 `/*  /index.html  200` |
| **Vercel** | `vercel.json` 의 `rewrites` 로 `/(.*)` → `/index.html` |
| **Cloudflare Pages** | `_redirects` 또는 `_routes.json` |
| **Firebase** | `firebase.json` 의 `rewrites` |
| **Nginx** | `try_files $uri $uri/ /index.html;` |
| **Apache** | `mod_rewrite` 규칙 |

**이 저장소가 바로 GitHub Pages 방식**을 쓴다. 워크플로에서 이렇게 처리한다:

```yaml
# .github/workflows/deploy-pages.yml
- name: SPA fallback & .nojekyll
  working-directory: apps/bible
  run: |
    cp dist/index.html dist/404.html
    touch dist/.nojekyll
```

> 서버 설정을 아예 할 수 없는 환경이라면 **`createHashHistory`** 가 대안이다(14장).
> `/#/posts/123` 형태가 되어 `#` 뒤는 서버로 전송되지 않으므로 폴백이 필요 없다.

### 하위 경로 배포 — base path

`example.com/my-app/` 처럼 하위 경로에 올린다면 두 곳을 맞춰야 한다.

```ts
// vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE || '/',
})
```

```tsx
// main.tsx — 라우터에도 같은 값을 알려 준다
const rawBase = import.meta.env.BASE_URL.replace(/\/$/, '')
const router = createRouter({ routeTree, basepath: rawBase || undefined })
```

이 저장소는 CI에서 `VITE_BASE=/tanstack-router-bible/` 를 주입한다. **둘 중 하나만
설정하면 링크는 맞는데 매칭이 안 되거나, 그 반대가 된다.**

### 배포 체크리스트

- [ ] 서버 폴백(rewrite) 설정
- [ ] `base` 와 `basepath` 일치
- [ ] 빌드 출력 디렉터리가 호스팅 설정과 일치 (`dist`)
- [ ] `VITE_` 접두사 환경변수가 빌드에 주입됨
- [ ] 딥링크로 직접 접속해 확인 (앱 안에서 이동하는 것만으로는 부족)

---

## 4. 환경변수 다루기

### 번들러별 규칙

| 번들러 | 접두사 | 접근 |
|--------|--------|------|
| **Vite** | `VITE_` | `import.meta.env.VITE_API_URL` |
| **Rspack** | `PUBLIC_` | `import.meta.env.PUBLIC_API_URL` |
| **Webpack** | (DefinePlugin 설정) | `process.env.API_URL` |

Vite는 `DEV`, `PROD`, `MODE`, `BASE_URL` 도 기본 제공한다. 이 저장소는 `BASE_URL` 을
basepath 계산에 쓴다.

### 타입 안전하게 쓰기

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_BETA: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

> 이 저장소는 `apps/bible/src/vite-env.d.ts` 에 `/// <reference types="vite/client" />`
> 만 두고 있다. 위처럼 인터페이스를 확장하면 `import.meta.env.VITE_API_URL` 에 자동완성이
> 붙는다.

런타임 검증까지 하려면 앱 시작 시 zod로 파싱한다.

```ts
const env = z.object({
  VITE_API_URL: z.string().url(),
  VITE_ENABLE_BETA: z.enum(['true', 'false']).default('false'),
}).parse(import.meta.env)
```

### 라우터에서 쓰는 곳

```tsx
// loader 에서
loader: async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`)
  return res.json()
}

// feature flag 로 라우트 자체를 막기 (06장 가드 패턴)
beforeLoad: () => {
  if (import.meta.env.VITE_ENABLE_BETA !== 'true') {
    throw redirect({ to: '/' })
  }
}
```

### 보안 — 반드시 지킬 것

**접두사는 보안 장치가 아니다.** `VITE_` 는 "번들에 포함시켜 달라"는 표시일 뿐이며,
**포함된 값은 브라우저에서 그대로 보인다.** API 시크릿·개인 키는 절대 넣지 않는다.
인증이 필요한 호출은 서버 프록시를 통한다.

또한 값은 **빌드 시점에 문자열로 치환**된다. 런타임에 읽는 것이 아니므로, 값을 바꾸면
**다시 빌드**해야 한다. 개발 중 `.env` 를 수정했다면 dev 서버를 재시작한다.

---

## 5. 복잡한 search — 배열·객체·Date

03·13장의 심화편이다. **URL은 문자열뿐**이라는 사실에서 오는 문제들을 다룬다.

### Date가 가장 큰 함정

```tsx
// ❌ Date 객체는 직렬화되지 않는다 → [object Object]
search={{ startDate: new Date() }}

// ✅ ISO 문자열로 넣는다
search={{ startDate: new Date().toISOString() }}
```

스키마에서 다시 `Date` 로 바꿔 쓰려면 `transform` 을 쓴다.

```tsx
const schema = z.object({
  startDate: z.string().datetime().optional(),
  // 검증 후 Date 인스턴스로 변환해서 넘긴다
  selectedDate: z.string().datetime().transform((s) => new Date(s)).optional(),
})
```

> 이때 `structuralSharing`(11장)을 켜면 **타입 에러**가 난다. 구조적 공유는 JSON 호환
> 데이터만 지원하기 때문이다. 변환은 컴포넌트 안에서 하는 편이 안전하다.

### 배열

```tsx
const schema = z.object({
  categories: z.array(z.string()).default([]),
  priceRange: z.array(z.number()).length(2).optional(),
  selectedIds: z.array(z.string().uuid()).max(10).default([]),
})
```

**갱신할 때 새 배열을 만든다.** 기존 배열을 변형하면 라우터가 변화를 감지하지 못한다.

```tsx
// ✅
search={(prev) => ({ ...prev, categories: [...(prev.categories ?? []), 'electronics'] })}

// ❌ 원본을 변형
search={(prev) => { prev.categories.push('new'); return prev }}
```

### 중첩 객체

**단계마다 spread** 해야 한다. 얕은 spread는 안쪽을 날려 버린다.

```tsx
search={(prev) => ({
  ...prev,
  view: { ...prev.view, layout: 'list' },   // view 안쪽까지 펼친다
})}
```

### 알아 둘 제약

- **URL 길이 한계 ~2000자** — 복잡한 중첩 구조는 금방 넘긴다. 넘칠 것 같으면 서버에
  상태를 저장하고 id만 URL에 둔다.
- 큰 객체를 통째로 구독하면 리렌더가 잦다 → `select` 로 좁힌다(11장).
- URL을 읽기 좋게 만들려면 `parseSearchWith`/`stringifySearchWith` 로 JSURL2 같은
  직렬화를 붙인다(13장).

---

## 6. 여러 라우트에서 search 공유

13장의 `retainSearchParams` 가 정답이다. 세 가지 층위로 쓸 수 있다.

```tsx
// ① 앱 전체 — __root 에 걸면 어디를 가도 따라온다
export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: z.object({ locale: z.enum(['ko','en']).catch('ko') }),
  search: { middlewares: [retainSearchParams(['locale'])] },
})

// ② 특정 섹션 — 레이아웃 라우트에 건다
export const Route = createFileRoute('/products')({
  search: { middlewares: [retainSearchParams(['category', 'sort'])] },
})

// ③ 링크 하나만 — updater 함수로 직접
<Link to="/products/$id" search={(prev) => ({ ...prev })} />
```

**①②를 쓰면 링크마다 search를 적을 필요가 없어진다.** "링크에서 손으로 넘기던 것"을
"라우트에 선언"으로 옮기는 것이 핵심이다.

기본값을 URL에서 지우는 `stripSearchParams` 와 함께 쓸 때는 **retain → strip 순서**를
지킨다. 실행 예제는 `/search-mw` 에 있다.

---

## 7. 인증 붙이기

06장에서 다룬 내용의 실전 정리다.

### 구조 — context에 auth를 넣는다

```tsx
// main.tsx
const router = createRouter({
  routeTree,
  context: { auth: undefined!, queryClient },   // 초기값은 App에서 주입
})

function App() {
  const auth = useAuth()                        // 자체 훅 or Auth 라이브러리
  return <RouterProvider router={router} context={{ auth }} />
}
```

`undefined!` 로 두고 `RouterProvider` 의 `context` prop으로 주입하는 것이 요령이다.
라우터 인스턴스는 모듈 레벨에서 한 번만 만들고, **React 상태인 auth는 렌더 시점에**
넘긴다.

### 가드 — pathless 레이아웃 하나로

```tsx
// routes/_authenticated.tsx — URL에 나타나지 않는 레이아웃
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
})
```

이 아래에 놓인 모든 라우트가 자동으로 보호된다. `_authenticated.dashboard.tsx` 는
`/dashboard` 가 되고 가드는 상속된다.

### 로그인 후 원래 자리로

```tsx
const search = Route.useSearch()
const router = useRouter()

// redirect 는 임의 문자열이므로 navigate 대신 history.push 를 쓴다
const target = search.redirect ?? '/'
router.history.push(
  target.startsWith('/') && !target.startsWith('//') ? target : '/',
)
```

**오픈 리다이렉트 검증을 빠뜨리지 않는다**(14장). 실행 예제는 `/auth/login` 이다.

### 외부 인증 공급자(Auth0·Clerk·Supabase)

패턴은 동일하다. 공급자의 훅에서 상태를 꺼내 context에 넣으면 된다.

```tsx
function App() {
  const { isAuthenticated, user, isLoading } = useAuth0()

  // 로딩 중에는 라우터를 렌더하지 않는다 — 가드가 잘못 판단한다
  if (isLoading) return <Splash />

  return <RouterProvider router={router} context={{ auth: { isAuthenticated, user } }} />
}
```

**로딩 상태 처리가 핵심이다.** 인증 확인이 끝나기 전에 라우터를 띄우면, 가드가
"미인증"으로 판단해 로그인 페이지로 튕긴 뒤 다시 돌아오는 깜빡임이 생긴다.

---

## 8. RBAC — 역할 기반 접근 제어

인증(누구인가)과 인가(무엇을 할 수 있는가)는 다르다. 7번이 인증이라면 이건 인가다.

### context 확장

```ts
interface AuthState {
  isAuthenticated: boolean
  user: { id: string; roles: string[]; permissions: string[] } | null
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}
```

판정 함수를 **context에 담아 두는 것**이 요령이다. 각 라우트에서 `user.roles.includes(…)`
를 반복하지 않게 된다.

### 계층으로 쌓기

```
_authenticated.tsx          → 로그인 여부만 확인
└── _admin.tsx              → hasRole('admin')
    └── users.tsx           → hasPermission('users:write')
```

```tsx
// routes/_authenticated._admin.tsx
export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole('admin')) {
      throw redirect({ to: '/unauthorized', search: { redirect: location.href } })
    }
  },
})
```

### 401과 403을 구분한다

| 상황 | 판정 | 보낼 곳 |
|------|------|---------|
| 로그인 안 함 | `!isAuthenticated` | `/login` |
| 로그인했지만 권한 없음 | `!hasRole(…)` | `/unauthorized` |

**둘을 같은 곳으로 보내면 사용자가 혼란스럽다.** 이미 로그인한 사람을 로그인 페이지로
보내면 "왜 또 로그인하라는 거지?"가 된다. `/unauthorized` 에서는 현재 역할과 필요한
역할을 보여 주고, 접근 가능한 곳으로 가는 링크를 준다.

### 화면 요소 단위 제어

라우트를 막을 정도는 아니고 버튼만 숨기고 싶을 때는 컴포넌트로 감싼다.

```tsx
<PermissionGuard roles={['admin']} fallback={null}>
  <DeleteButton />
</PermissionGuard>
```

> ⚠️ 이것은 **UI 편의**일 뿐 보안이 아니다. 클라이언트 코드는 사용자가 조작할 수 있다.
> 실제 권한 검사는 **반드시 서버에서** 한다.

---

## 9. UI 라이브러리 통합

16장의 `createLink` 가 모든 통합의 기반이다. 라이브러리마다 감싸는 방식만 다르다.

### 공통 패턴

```tsx
const MyLink = createLink(
  React.forwardRef<HTMLAnchorElement, Props>((props, ref) => (
    <LibraryComponent ref={ref} {...props} />
  )),
)
```

**`forwardRef` 가 필수**다. 빠뜨리면 preload(hover 감지)가 조용히 동작하지 않는다.

### 라이브러리별 요령

| 라이브러리 | 방법 |
|-----------|------|
| **shadcn/ui** (이 저장소) | `asChild` 또는 `render` prop으로 `Link` 주입 |
| **Material UI** | `component={Link}` prop 또는 `createLink(MuiLink)` |
| **Chakra UI** | `as={Link}` 또는 `createLink(ChakraLink)` |
| **Framer Motion** | `motion.a` 를 `createLink` 로 감싼다 |

이 저장소는 Base UI 기반 shadcn을 쓰므로 `render` prop 방식이다.

```tsx
// apps/bible/src/routes/__root.tsx 에서 쓰는 실제 패턴
<SidebarMenuButton render={<Link to={item.to} />} isActive={isActive(item)}>
  <item.icon />
  <span>{item.title}</span>
</SidebarMenuButton>
```

`createLink` 방식과 비교해 보려면 `/custom-link` 예제를 참고한다.

### Framer Motion과 함께 쓸 때

페이지 전환 애니메이션은 **View Transitions(15장)로도 가능**하다. CSS만으로 되므로 번들
크기가 늘지 않는다. Framer Motion은 더 정교한 제어가 필요할 때 선택한다.

---

## 10. React Router에서 이사하기

### 개념 대응표

| React Router | TanStack Router |
|-------------|-----------------|
| `<Route path element>` | `createFileRoute` (파일 위치가 곧 경로) |
| `useParams()` | `Route.useParams()` — 타입 안전 |
| `useSearchParams()` | `Route.useSearch()` — 검증됨 |
| `useNavigate()` | `useNavigate()` — `to` 가 타입 안전 |
| `loader` (RRv6.4+) | `loader` — 거의 동일 |
| `<Outlet />` | `<Outlet />` — 동일 |
| `useLocation()` | `useLocation()` — 동일 |
| `errorElement` | `errorComponent` |
| `*` (splat) | `$.tsx` → `params._splat` |
| `:id` | `$id` |

### 이사할 때 실제로 걸리는 것들

**1. search params 사고방식이 바뀐다**
React Router의 `useSearchParams` 는 `URLSearchParams`(문자열)를 준다. TanStack Router는
**검증된 객체**를 준다. `validateSearch` 를 먼저 정의해야 한다(03장).

**2. 경로가 문자열이 아니다**
`navigate('/posts/' + id)` 같은 문자열 조합이 타입 에러가 된다.
`navigate({ to: '/posts/$id', params: { id } })` 로 바꾼다.

**3. 파일 구조가 곧 라우트다**
라우트 정의 파일(`routes.tsx`)이 사라지고 파일 이름 규칙으로 대체된다(01장).
기존 구조를 유지하고 싶다면 **Virtual File Routes**(18장)로 점진 이전할 수 있다.

**4. 타입 등록을 빠뜨리면 전부 `any` 가 된다**
```ts
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
```

### 점진적 이전 전략

한 번에 다 바꾸지 않아도 된다.

1. `basepath` 를 나눠 일부 경로만 TanStack Router로 처리
2. **Virtual File Routes**로 기존 파일 구조를 그대로 매핑(18장)
3. `physical()` 로 새로 쓰는 영역만 파일기반 규칙 적용
4. 안정되면 전체를 파일기반으로 정리

### React Location 에서 오는 경우

TanStack Router 의 **전신**이다. 같은 팀이 만들었고 Router 가 그 후속작이라, 공식
마이그레이션 가이드가 따로 있다. 다만 React Location 은 더 이상 유지보수되지 않으므로
새로 시작한다면 고려 대상이 아니다.

주요 대응은 이렇다.

| React Location | TanStack Router |
|---|---|
| `<Router routes={routes}>` | `createRouter({ routeTree })` |
| `useMatch()` | `Route.useParams()` · `Route.useLoaderData()` |
| `useSearch()` | `Route.useSearch()` — **검증된 값** |
| `loader` | `loader` — 인자 형태가 다르다 |
| `<Link to>` | `<Link to>` — 타입 안전해졌다 |

가장 크게 달라진 것은 **search params 가 검증을 거친다**는 점이다(03장). React Location
에서는 자유 형식이었으므로, 이사할 때 `validateSearch` 스키마를 새로 작성해야 한다.

📖 [공식 가이드](https://tanstack.com/router/latest/docs/framework/react/installation/migrate-from-react-location)

---

## 11. SSR 붙이기 🚫

> **🚫 SSR 전용 — 이 저장소에서는 동작하지 않는다.** GitHub Pages 정적 배포(CSR)이므로
> 서버가 없다. 아래는 설명과 예시 코드이며, 실행 예제는 두지 않는다.

### 선택지 두 가지

| 방법 | 언제 |
|------|------|
| **TanStack Start** | 새 프로젝트. 라우터·서버·빌드가 통합되어 있다 |
| **직접 구성** (Vite SSR + Express 등) | 기존 서버 인프라에 얹어야 할 때 |

**대부분은 TanStack Start를 쓰는 편이 낫다.** 아래 수동 구성은 그럴 수 없을 때의 얼개다.

### 서버 쪽 얼개

SSR 컴포넌트는 **메인 진입점이 아니라 서브패스**에서 가져온다. 클라이언트 번들에
서버 코드가 섞이지 않게 하려는 구조다.

```
@tanstack/react-router/ssr/server   → RouterServer
@tanstack/react-router/ssr/client   → RouterClient
```

```tsx
// server.tsx
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { RouterServer } from '@tanstack/react-router/ssr/server'

export async function render(url: string) {
  const router = createRouter({
    routeTree,
    // 서버에는 주소창이 없다 → 요청 URL 로 메모리 히스토리를 만든다 (14장)
    history: createMemoryHistory({ initialEntries: [url] }),
  })

  // 매칭된 라우트의 loader 를 서버에서 모두 실행한다
  await router.load()

  return renderToPipeableStream(<RouterServer router={router} />)
}
```

### 클라이언트 쪽 — 하이드레이션

```tsx
// client.tsx
import { createRouter } from '@tanstack/react-router'
import { RouterClient } from '@tanstack/react-router/ssr/client'

const router = createRouter({ routeTree })
hydrateRoot(document, <RouterClient router={router} />)
```

서버가 심어 둔 dehydrated 상태를 라우터가 읽어 **loader를 다시 실행하지 않는다.**

### 함께 쓰이는 것들 (전부 16장 참조)

| API | 역할 |
|-----|------|
| `<HeadContent />` | 라우트별 `head` 를 실제 `<head>` 로 |
| `<Scripts />` | 스크립트 태그 렌더 |
| `<ScriptOnce />` | 하이드레이션 전 실행 (다크모드 FOUC 방지) |
| `<ClientOnly>` / `useHydrated()` | 서버 렌더 제외 |
| `shellComponent` | `<html>` 문서 껍데기 (17장) |
| `createSerializationAdapter` | 커스텀 클래스 직렬화 (13장) |
| `dehydrate` / `hydrate` | 서버 상태 전달 (17장) |

### CSR에서 SSR로 옮길 때 주의할 것

1. **`window` 접근 코드가 서버에서 터진다** → `<ClientOnly>` 로 감싸거나 `useEffect` 로 옮긴다
2. **`localStorage` 기반 테마** → `<ScriptOnce>` 로 하이드레이션 전에 적용
3. **loader가 서버에서도 돈다** → 브라우저 전용 API를 쓰고 있지 않은지 확인
4. **하이드레이션 불일치** → 서버와 클라이언트의 첫 렌더 결과가 같아야 한다.
   `useHydrated()` 가 이 규칙을 지키도록 설계되어 있다(16장).

---

## 🔗 다른 장과의 관계

이 장은 **앞 장들의 조합**이다. 새로운 API는 거의 없고, 이미 배운 것을 실제 문제에
맞춰 엮는다.

| 레시피 | 밑바탕 |
|--------|--------|
| 테스트 | 14 memory history · 17 코드기반 라우팅 |
| 디버깅 | 20 Devtools · 11 Match API |
| 배포 | 14 history 종류 · 00 basepath |
| 복잡한 search | 03 validateSearch · 13 미들웨어 |
| 인증·RBAC | 05 context · 06 beforeLoad · 12 redirect |
| UI 통합 | 16 createLink |
| 마이그레이션 | 01 파일 규약 · 18 Virtual Routes |

## 📖 공식 문서

공식 How-To 문서는 사이드바에 노출되지 않지만 저장소에 있다.

- [how-to 디렉터리 전체](https://github.com/TanStack/router/tree/main/docs/router/how-to)
- [setup-testing](https://github.com/TanStack/router/blob/main/docs/router/how-to/setup-testing.md) ·
  [debug-router-issues](https://github.com/TanStack/router/blob/main/docs/router/how-to/debug-router-issues.md) ·
  [deploy-to-production](https://github.com/TanStack/router/blob/main/docs/router/how-to/deploy-to-production.md)
- [setup-rbac](https://github.com/TanStack/router/blob/main/docs/router/how-to/setup-rbac.md) ·
  [arrays-objects-dates-search-params](https://github.com/TanStack/router/blob/main/docs/router/how-to/arrays-objects-dates-search-params.md)
