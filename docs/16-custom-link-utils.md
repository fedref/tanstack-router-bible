# 16 · 커스텀 Link · SSR API · 저수준 유틸

> 대응 예제: `/custom-link` · `/navigation/link`
> ⚠️ **2부(SSR 관련 API)는 실행 예제가 없다** — 이 저장소는 GitHub Pages 정적 배포(CSR)라
> SSR 동작이 불가능하다. 설명과 예시 코드로만 다룬다. 1부·3부는 CSR에서 전부 동작한다.
> 📖 공식: [custom-link](https://tanstack.com/router/latest/docs/framework/react/guide/custom-link) ·
> [useLinkProps](https://tanstack.com/router/latest/docs/framework/react/api/router/useLinkPropsHook)

이 장은 **"자주 쓰지는 않지만 있다는 걸 알아야 하는 것들"** 을 모았다. 필요한 순간에
"그런 게 있었지" 하고 돌아오기 위한 장이다.

---

# 1부 · 커스텀 Link 만들기

## 문제 — 디자인 시스템과 라우터를 붙이기

`<Link>` 는 `<a>` 를 렌더한다. 그런데 앱에는 이미 `<Button>`, `<MenuItem>`, `<Card>` 같은
컴포넌트가 있다. 이것들을 **타입 안전한 라우터 링크로** 만들려면 어떻게 할까?

순진한 방법은 이렇다:

```tsx
// ❌ to 가 string 이라 타입 안전성이 사라진다
<Button onClick={() => navigate({ to: '/posts' })}>글 목록</Button>
```

`to` 자동완성도, 오타 검사도, params 검증도 없다. 이 장의 두 API가 이 문제를 푼다.

## `createLink()` — 컴포넌트를 링크로 승격

```tsx
import { createLink } from '@tanstack/react-router'
import * as React from 'react'

// ① 기반 컴포넌트: a 태그 속성을 받아야 한다
interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'ghost'
}

const BasicLink = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
  ({ variant = 'primary', ...props }, ref) => (
    <a ref={ref} className={`btn btn-${variant}`} {...props} />
  ),
)

// ② 라우터 링크로 승격
export const AppLink = createLink(BasicLink)
```

이제 `AppLink` 는 **자체 props와 라우터 props를 모두** 가진다.

```tsx
<AppLink
  to="/posts/$postId"          // ✅ 자동완성 + 타입 검사
  params={{ postId: '1' }}     // ✅ 이 라우트에 필요한 params 강제
  variant="ghost"              // ✅ 원래 컴포넌트의 props
  activeProps={{ className: 'active' }}
>
  글 보기
</AppLink>
```

**`forwardRef` 가 사실상 필수**다. 라우터가 ref를 통해 요소에 접근해 preload(hover 감지)
등을 처리하기 때문이다. ref를 넘기지 않으면 동작은 하되 일부 기능이 빠진다.

### 서드파티 컴포넌트와 붙이기

`asChild` 패턴을 쓰는 라이브러리(Radix, Base UI 등)와는 이렇게 조합한다.

```tsx
const MenuItemLink = createLink(
  React.forwardRef<HTMLAnchorElement, MenuItemProps>((props, ref) => (
    <Menu.Item asChild>
      <a ref={ref} {...props} />
    </Menu.Item>
  )),
)
```

## `useLinkProps()` — props만 뽑아 쓰기

컴포넌트를 새로 만들 것 없이 **`<a>` 에 필요한 props 객체만** 얻는다.

```tsx
import { useLinkProps } from '@tanstack/react-router'

function CustomAnchor() {
  const linkProps = useLinkProps({
    to: '/posts/$postId',
    params: { postId: '1' },
    activeProps: { className: 'text-blue-600' },
  })

  // href, onClick, onMouseEnter(preload), aria-current 등이 들어 있다
  return <a {...linkProps}>글 보기</a>
}
```

반환 타입은 `React.ComponentPropsWithRef<'a'>` 다. 즉 **완성된 `<a>` props** 이며,
여기에는 다음이 포함된다:

- `href` — 계산된 최종 URL (basepath, mask 반영)
- `onClick` — 기본 동작 막고 라우터 이동
- `onMouseEnter` / `onTouchStart` — preload 트리거
- `aria-current="page"` — 활성 상태 접근성 속성
- `data-status="active"` — 스타일링용 훅

### `createLink` vs `useLinkProps`

| | `createLink` | `useLinkProps` |
|---|---|---|
| 결과 | 재사용 가능한 **컴포넌트** | props **객체** |
| 타입 안전 | 컴포넌트 사용처마다 유지 | 호출 지점에서만 |
| 적합 | 디자인 시스템 전반에 쓸 링크 | 일회성, 또는 조건부 렌더 |

**여러 곳에서 쓸 거라면 `createLink`**, 한 곳에서만 특수하게 필요하면 `useLinkProps` 다.

---

# 2부 · SSR 관련 API

> ## 🚫 SSR 전용 — 실행 예제 없음
>
> 이 저장소의 `bible` 앱은 **GitHub Pages에 배포되는 순수 CSR(SPA)** 이다. 서버가 없으므로
> 아래 API들은 **동작 자체가 불가능**하다. 따라서 이 절은 **설명과 예시 코드로만** 다루며,
> 눌러 볼 수 있는 예제 라우트를 만들지 않는다.
>
> 그럼에도 문서에 싣는 이유는 `@tanstack/react-router` 가 export 하는 이상
> **"무엇인지"는 알아야** 하기 때문이다. TanStack Start나 자체 SSR을 붙이는 순간
> 이 절이 필요해진다. 아래 코드는 **그때 그대로 쓸 수 있는 형태**로 적었다.
>
> 대상: `HeadContent` · `Scripts` · `Asset` · `ScriptOnce` · `useTags` · `ClientOnly` ·
> `useHydrated` · `RouterContextProvider`(SSR 맥락)

## `<HeadContent />` — `<head>` 태그 관리

라우트별로 선언한 메타 태그를 실제 `<head>` 에 렌더한다.

```tsx
// 라우트에서 선언
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => fetchPost(params.postId),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData.title },
      { name: 'description', content: loaderData.excerpt },
      { property: 'og:image', content: loaderData.coverUrl },
    ],
    links: [{ rel: 'canonical', href: `/posts/${loaderData.id}` }],
    scripts: [{ src: '/analytics.js', async: true }],
    styles: [{ href: '/post.css', rel: 'stylesheet' }],
  }),
})

// 문서 셸에서 렌더
<html>
  <head>
    <HeadContent />   {/* ← 여기에 위 태그들이 들어간다 */}
  </head>
  …
</html>
```

**매치된 모든 라우트의 `head` 가 병합**된다. 부모가 기본 title을 주고 자식이 덮어쓰는
식으로 계층적으로 동작한다.

CSR 전용 앱에서도 쓸 수는 있지만, 초기 HTML에 태그가 없으므로 **크롤러가 읽지 못한다.**
SEO가 목적이라면 SSR이 함께 필요하다.

## `<Scripts />` — 스크립트 렌더

라우트들이 선언한 `scripts` 를 렌더한다. 보통 `<body>` 끝에 둔다.

```tsx
<body>
  <div id="root">…</div>
  <Scripts />
</body>
```

## `<Asset />` — 단일 태그 렌더

`RouterManagedTag` 하나를 받아 그리는 저수준 컴포넌트다. `HeadContent` 와 `Scripts` 가
내부적으로 쓴다. 직접 쓸 일은 거의 없다.

## `<ScriptOnce />` — 한 번만 실행되는 인라인 스크립트

```tsx
<ScriptOnce>
  {`document.documentElement.classList.toggle('dark', localStorage.theme === 'dark')`}
</ScriptOnce>
```

**하이드레이션 전에 실행되어야 하는 코드**를 넣는다. 대표적으로 **다크 모드 깜빡임(FOUC)
방지**다. React가 붙기 전에 클래스를 세팅해야 흰 화면이 번쩍이지 않는다.

> 이 저장소는 CSR이라 `main.tsx` 상단의 `initTheme()` 함수가 같은 역할을 한다. SSR이라면
> 그 코드가 `ScriptOnce` 로 들어가야 한다.

## `useTags()`

현재 매치들이 만들어 낸 태그 목록을 반환한다. `HeadContent` 가 쓰는 훅이며, 커스텀
`<head>` 관리자를 직접 만들 때만 필요하다.

## `<ClientOnly>` / `useHydrated()`

서버에서 렌더하면 안 되는 것을 다룬다.

```tsx
import { ClientOnly, useHydrated } from '@tanstack/react-router'

// 컴포넌트 방식
<ClientOnly fallback={<div style={{ height: 400 }} />}>
  <MapWidget />          {/* window 를 참조하는 라이브러리 */}
</ClientOnly>

// 훅 방식
function Widget() {
  const hydrated = useHydrated()
  if (!hydrated) return <Skeleton />
  return <BrowserOnlyThing />
}
```

`useHydrated()` 는 **SSR에서 항상 `false`**, CSR에서는 **첫 렌더에 `false`, 이후 `true`** 다.
이 규칙 덕분에 서버와 클라이언트의 첫 렌더 결과가 일치해 **하이드레이션 불일치 경고가
나지 않는다.**

`fallback` 의 크기를 실제 콘텐츠와 맞춰 두면 레이아웃 이동(CLS)을 막을 수 있다.

## `RouterContextProvider`

`RouterProvider` 없이 **라우터 컨텍스트만** 제공한다. 테스트에서 라우터에 의존하는
컴포넌트를 격리해 렌더할 때, 또는 라우터 트리 밖에서 라우터 훅을 써야 할 때 쓴다.

---

# 3부 · 경로 조작 유틸

라우터 내부가 쓰는 문자열 유틸들이 공개되어 있다. **직접 쓸 일은 드물지만**, 커스텀 링크나
경로 계산 로직을 만들 때 필요하다. 직접 구현하면 엣지 케이스에서 어긋나므로 이걸 쓰는
편이 안전하다.

```tsx
import {
  joinPaths, cleanPath, trimPath, trimPathLeft, trimPathRight,
  resolvePath, interpolatePath, rootRouteId,
} from '@tanstack/react-router'
```

| 함수 | 하는 일 | 예 |
|---|---|---|
| `joinPaths([...])` | 조각을 이어 붙인다 (중복 슬래시 정리) | `['/a','/b']` → `/a/b` |
| `cleanPath(p)` | 중복 슬래시를 하나로 | `//a///b` → `/a/b` |
| `trimPath(p)` | 양끝 슬래시 제거 | `/a/b/` → `a/b` |
| `trimPathLeft(p)` | 앞 슬래시 제거 | `/a/b` → `a/b` |
| `trimPathRight(p)` | 뒤 슬래시 제거 | `/a/b/` → `/a/b` |
| `resolvePath(...)` | 상대 경로를 절대 경로로 | `..`, `./` 해석 |
| `interpolatePath(...)` | 템플릿에 params 채우기 | `/posts/$id` + `{id:'1'}` → `/posts/1` |
| `rootRouteId` | 루트 라우트의 id 상수 | `notFound({ routeId: rootRouteId })` |

`interpolatePath` 는 실제로 쓸 만하다. 라우트 템플릿과 params로 URL 문자열이 필요한데
`Link` 를 쓸 수 없는 상황(예: 이메일 본문에 넣을 URL 생성)에서 유용하다.

## 값 비교 유틸

```tsx
import {
  deepEqual, replaceEqualDeep, isPlainObject, isPlainArray, functionalUpdate,
} from '@tanstack/react-router'
```

| 함수 | 하는 일 |
|---|---|
| `deepEqual(a, b)` | 깊은 동등 비교 |
| `replaceEqualDeep(prev, next)` | 내용이 같은 부분은 **이전 참조를 재사용** (구조적 공유) |
| `isPlainObject(v)` | 순수 객체인가 (클래스 인스턴스 제외) |
| `isPlainArray(v)` | 순수 배열인가 |
| `functionalUpdate(updater, prev)` | 값이면 그대로, 함수면 `updater(prev)` 실행 |

`replaceEqualDeep` 이 11장에서 본 `structuralSharing` 의 실제 구현이다. `functionalUpdate`
는 `search: (prev) => …` 같은 "값 또는 업데이터" 패턴을 처리하는 함수다. 커스텀 훅에서
같은 API 모양을 만들고 싶을 때 그대로 쓸 수 있다.

## `DEFAULT_PROTOCOL_ALLOWLIST` — 링크 보안

```tsx
import { DEFAULT_PROTOCOL_ALLOWLIST } from '@tanstack/react-router'
// http:, https:, mailto:, tel:
```

라우터는 **절대 URL의 프로토콜을 검사**한다. 허용 목록에 없으면 이동을 거부한다.
`javascript:alert(1)` 같은 XSS 벡터를 막기 위한 장치다.

```tsx
createRouter({
  routeTree,
  protocolAllowlist: [...DEFAULT_PROTOCOL_ALLOWLIST, 'myapp:'],   // 딥링크 추가
})
```

커스텀 스킴(모바일 앱 딥링크 등)을 쓴다면 여기에 추가한다. **`javascript:` 를 추가하는
일은 절대 없어야 한다.**

## `rewrite` / `origin` / `composeRewrites`

URL을 라우터 내부 표현과 실제 주소 사이에서 변환한다. **서브도메인 라우팅**이 대표
사용처다.

```tsx
import { composeRewrites } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  origin: 'https://example.com',
  rewrite: composeRewrites([
    {
      // 들어올 때: tenant.example.com/dashboard → /tenant/dashboard
      input: ({ url }) => {
        const sub = url.hostname.split('.')[0]
        if (sub === 'www') return
        url.pathname = `/${sub}${url.pathname}`
        return url
      },
      // 나갈 때: 반대로 되돌린다
      output: ({ url }) => {
        const [, tenant, ...rest] = url.pathname.split('/')
        url.hostname = `${tenant}.example.com`
        url.pathname = '/' + rest.join('/')
        return url
      },
    },
  ]),
})
```

`composeRewrites` 는 여러 규칙을 하나로 합친다. 라우트 트리는 `/tenant/dashboard` 라는
평범한 경로만 알면 되고, 도메인 처리는 이 층에서 끝난다.

`origin` 은 절대 URL을 만들 때 기준이 되는 출처다. SSR에서 요청 호스트를 넣거나,
`interpolatePath` 로 절대 URL을 만들 때 쓰인다.

## `reactUse` / `useLayoutEffect`

내부 호환 레이어다.

- `reactUse` — React 19의 `use()` 를 안전하게 참조한다(구버전 React 대응).
- `useLayoutEffect` — SSR에서 `useLayoutEffect` 경고를 피하기 위해 서버에서는
  `useEffect` 로 대체하는 래퍼다.

**앱 코드에서 직접 쓸 이유는 없다.** 라이브러리를 만들며 같은 문제를 겪는다면 참고할 만한
구현이다.

## 🔗 시너지

- **02장 `Link`** — `createLink` 는 `Link` 의 모든 옵션(`activeProps`, `preload`, `mask` …)을
  그대로 물려받는다. 02장을 이해했다면 커스텀 링크는 껍데기만 바꾸는 일이다.
- **05장 타입 안전성** — `createLink` 의 가치는 전부 타입에 있다. 디자인 시스템 컴포넌트에
  라우터의 타입 추론을 이식하는 작업이다.
- **09장 코드 스플리팅** — `useLinkProps` 의 `onMouseEnter` 가 preload를 트리거하고, 그것이
  청크와 loader를 동시에 당겨온다. 커스텀 링크에서 ref를 빠뜨리면 이 연결이 끊긴다.
- **12장 에러 경계** — `rootRouteId` 는 `notFound({ routeId: rootRouteId })` 로 12장에서 쓴다.

## ▶ 실행 예제

`apps/bible/src/components/ui/sidebar.tsx` 는 shadcn 컴포넌트와 `Link` 를 조합한 실제
사례다. `createLink` 를 쓰지는 않았지만, 같은 문제(디자인 시스템 + 라우터)를 다룬다.
이걸 `createLink` 방식으로 리팩터링해 보는 것이 좋은 연습이 된다.

## 📖 공식 문서

- [Custom Link](https://tanstack.com/router/latest/docs/framework/react/guide/custom-link)
- [`useLinkProps`](https://tanstack.com/router/latest/docs/framework/react/api/router/useLinkPropsHook)
- [SSR Guide](https://tanstack.com/router/latest/docs/framework/react/guide/ssr)
