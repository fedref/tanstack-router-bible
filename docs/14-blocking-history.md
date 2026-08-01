# 14 · 네비게이션 차단 & History

> 대응 예제: `/blocking` · `/blocking/history` · `/auth/login`
> 예제 파일: `apps/bible/src/routes/auth.login.tsx`, `apps/bible/src/main.tsx`
> 📖 공식: [navigation-blocking](https://tanstack.com/router/latest/docs/framework/react/guide/navigation-blocking) ·
> [history-types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)

## 한 줄 정의 & 언제 쓰나

두 가지 주제를 묶었다. 둘 다 **라우터 아래에 깔린 브라우저 히스토리**를 다룬다.

- **차단(Blocking)**: "저장하지 않은 변경이 있습니다. 정말 나가시겠습니까?"
- **History 종류**: 브라우저 주소 / 해시(`#/path`) / 메모리(주소 없음) 중 무엇을 쓸 것인가

## 네비게이션 차단 — `useBlocker`

### 최소 예제

```tsx
import { useBlocker } from '@tanstack/react-router'

function EditForm() {
  const [isDirty, setIsDirty] = useState(false)

  useBlocker({
    shouldBlockFn: () => isDirty,       // true 면 이동을 막는다
    enableBeforeUnload: true,           // 탭 닫기/새로고침도 막는다
  })

  return <form onChange={() => setIsDirty(true)}>…</form>
}
```

이것만으로 **앱 내부 이동은 확인창**, **탭 닫기는 브라우저 기본 경고**가 걸린다.

### 옵션 네 가지

```tsx
useBlocker({
  shouldBlockFn,              // 필수: 막을지 판정 (boolean | Promise<boolean>)
  enableBeforeUnload: true,   // 브라우저 이탈(새로고침·탭 닫기)도 막을지
  disabled: false,            // 일시적으로 끄기
  withResolver: false,        // 커스텀 UI를 쓸지 (아래 설명)
})
```

`enableBeforeUnload` 는 boolean뿐 아니라 **함수**도 받는다. `() => isDirty` 처럼 동적으로
판정할 수 있다.

### `shouldBlockFn` 은 "어디로 가는지"를 안다

인자로 현재/다음 위치가 들어온다. **타입 안전**하다.

```tsx
useBlocker({
  shouldBlockFn: ({ current, next, action }) => {
    // 같은 섹션 안에서 움직이는 건 허용
    if (next.routeId.startsWith('/editor')) return false

    // 뒤로가기만 막고 싶다면
    if (action === 'BACK') return isDirty

    return isDirty
  },
})
```

| 인자 | 내용 |
|---|---|
| `current` | 지금 위치 — `routeId`, `fullPath`, `pathname`, `params`, `search` |
| `next` | 가려는 위치 — 같은 형태 |
| `action` | `'PUSH'` \| `'REPLACE'` \| `'BACK'` \| `'FORWARD'` |

`current.search.page` 처럼 **search까지 타입이 살아 있다.** 라우트별 스키마가 유니온으로
들어오므로, `routeId` 로 좁힌 뒤 접근하면 정확한 타입이 나온다.

### 비동기 판정도 된다

```tsx
shouldBlockFn: async ({ next }) => {
  const hasUnsaved = await checkServerDraft()
  return hasUnsaved
}
```

`Promise<boolean>` 을 반환할 수 있어, 서버에 확인한 뒤 결정하는 흐름도 가능하다.

### 커스텀 확인 UI — `withResolver: true`

기본값(`false`)은 브라우저의 `confirm()` 창을 쓴다. 디자인이 맞지 않으면 직접 만든
모달로 바꾼다.

```tsx
function EditForm() {
  const [isDirty, setIsDirty] = useState(false)

  // withResolver: true 면 상태 객체를 돌려준다
  const { status, proceed, reset, next } = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
  })

  return (
    <>
      <form onChange={() => setIsDirty(true)}>…</form>

      {status === 'blocked' && (
        <Dialog open>
          <p>저장하지 않은 변경이 있습니다.</p>
          <p>{next.pathname} 으로 이동하시겠습니까?</p>
          <button onClick={proceed}>나가기</button>
          <button onClick={reset}>계속 편집</button>
        </Dialog>
      )}
    </>
  )
}
```

반환값은 **판별 유니온**이라 `status` 로 좁히면 나머지 필드가 타입상 확정된다.

```ts
| { status: 'blocked'; current; next; action; proceed: () => void; reset: () => void }
| { status: 'idle';    current: undefined; next: undefined; … }
```

`status === 'idle'` 일 때 `proceed` 는 `undefined` 이므로, 좁히지 않고 호출하면 타입
에러가 난다. 실수를 컴파일러가 막아 주는 구조다.

### `<Block>` — 컴포넌트 버전

같은 일을 JSX로 한다. 옵션은 `useBlocker` 와 동일하다.

```tsx
import { Block } from '@tanstack/react-router'

<Block shouldBlockFn={() => isDirty} withResolver>
  {({ status, proceed, reset }) =>
    status === 'blocked' ? (
      <Dialog open>
        <button onClick={proceed}>나가기</button>
        <button onClick={reset}>취소</button>
      </Dialog>
    ) : null
  }
</Block>
```

`children` 은 일반 JSX여도 되고, `withResolver` 를 쓸 때는 render prop 함수로 쓴다.

> `<Block condition={…} blockerFn={…}>` 형태는 **deprecated** 다. 타입 정의에
> `@deprecated Use the UseBlockerOpts property instead` 로 표시되어 있다. 기존 코드에서
> 보이면 `shouldBlockFn` 방식으로 옮긴다.

### 차단의 한계 — 반드시 알아야 할 것

**브라우저 이탈은 커스텀 UI로 막을 수 없다.** `enableBeforeUnload` 는 브라우저의
표준 경고창만 띄운다. 메시지도 바꿀 수 없다(스팸 방지를 위해 브라우저가 막았다).
`withResolver` 로 만든 모달은 **앱 내부 이동에만** 적용된다.

또한 `shouldBlockFn` 이 비동기일 때, 브라우저 이탈 경로에서는 기다려 주지 않는다.
`beforeunload` 는 동기적으로만 동작하기 때문이다.

## History 종류

라우터는 세 가지 히스토리 구현 중 하나 위에서 돈다. 기본값은 브라우저 히스토리다.

```tsx
import {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from '@tanstack/react-router'
```

### `createBrowserHistory()` — 기본값

```tsx
const router = createRouter({ routeTree })   // 자동으로 이걸 쓴다

// 명시적으로 쓰거나 옵션을 줄 때
createRouter({
  routeTree,
  history: createBrowserHistory({
    createHref: (path) => `/app${path}`,   // href 생성 방식 커스터마이징
    window: iframeWindow,                  // 다른 window 객체 사용 (iframe 등)
  }),
})
```

`/posts/1` 같은 **깨끗한 URL**을 쓴다. 단, **서버가 모든 경로를 index.html로 돌려줘야
한다.** 이 저장소가 GitHub Pages에서 `404.html` 을 복사해 두는 이유가 정확히 이것이다.

### `createHashHistory()` — 서버 설정이 불가능할 때

```tsx
createRouter({ routeTree, history: createHashHistory() })
```

URL이 `/#/posts/1` 형태가 된다. **`#` 뒤는 서버로 전송되지 않으므로** 어떤 정적 호스팅에
올려도 새로고침이 깨지지 않는다.

| | Browser | Hash |
|---|---|---|
| URL | `/posts/1` | `/#/posts/1` |
| 서버 설정 | 필요 (SPA fallback) | 불필요 |
| SEO | 유리 | 불리 |
| 쓸 때 | 대부분의 경우 | 서버를 제어할 수 없을 때 |

### `createMemoryHistory()` — 주소가 없는 환경

```tsx
createRouter({
  routeTree,
  history: createMemoryHistory({
    initialEntries: ['/posts/1'],   // 필수: 시작 위치
    initialIndex: 0,                // 선택: 몇 번째에서 시작할지
  }),
})
```

브라우저 주소창을 건드리지 않고 **메모리에만** 히스토리를 유지한다. 세 가지 용도가 있다.

1. **테스트** — jsdom에서 특정 URL 상태를 만들어 컴포넌트를 검증한다.
   ```tsx
   const router = createRouter({
     routeTree,
     history: createMemoryHistory({ initialEntries: ['/products?page=2'] }),
   })
   render(<RouterProvider router={router} />)
   ```
2. **SSR** — 서버에는 주소창이 없으므로 요청 URL로 메모리 히스토리를 만든다.
3. **임베드 UI** — 모달이나 위젯 안에서 자체 라우팅을 돌리되 브라우저 주소는 바꾸지 않을 때.

`initialEntries` 에 여러 개를 넣으면 **뒤로가기 기록까지 흉내** 낼 수 있다.

```tsx
createMemoryHistory({
  initialEntries: ['/', '/posts', '/posts/1'],
  initialIndex: 2,     // /posts/1 에서 시작, 뒤로 두 번 갈 수 있다
})
```

### `createHistory()` — 직접 만들기

셋 중 어느 것도 맞지 않을 때 쓰는 저수준 팩토리다. `pushState`, `replaceState`, `go`,
`back`, `forward`, `createHref` 를 직접 구현해 넘긴다. React Native나 Electron처럼
브라우저 히스토리가 없는 환경에서 어댑터를 만들 때 쓴다. 일반 웹 앱에서는 쓸 일이 없다.

## `router.history` — 직접 조작하기

라우터가 쥐고 있는 히스토리 객체는 밖에서도 쓸 수 있다.

```tsx
const router = useRouter()

router.history.push('/posts/1')      // 이동 (기록 추가)
router.history.replace('/posts/1')   // 이동 (기록 교체)
router.history.go(-2)                // 두 단계 뒤로
router.history.back()
router.history.forward()
router.history.canGoBack()           // boolean
router.history.createHref('/posts')  // 최종 href 문자열 계산
router.history.location              // 현재 위치 (파싱 전 원본)
router.history.length                // 기록 개수
router.history.subscribe((e) => …)   // 변경 구독 (해제 함수 반환)
router.history.flush()               // 대기 중인 변경 즉시 반영
```

### `navigate` 와 `history.push` 는 다르다

```tsx
// ✅ 타입 안전. 라우트가 존재하는지 컴파일 시점에 검사된다
navigate({ to: '/posts/$postId', params: { postId: '1' } })

// ⚠️ 문자열. 오타가 런타임까지 간다
router.history.push('/posts/1')
```

**기본은 `navigate`** 다. `history.push` 는 **경로를 문자열로만 알 수 있을 때** 쓴다.
예를 들어 로그인 후 `?redirect=/some/path` 로 받은 임의의 경로로 돌려보내는 경우다.
이 저장소의 `/auth/login` 이 정확히 그 예다.

```tsx
// apps/bible/src/routes/auth.login.tsx 의 패턴
const search = Route.useSearch()
router.history.push(search.redirect || '/')   // redirect 는 임의의 문자열
```

이때는 **오픈 리다이렉트 취약점**에 주의한다. 외부 URL이 들어오면 피싱에 악용될 수 있다.

```tsx
const target = search.redirect ?? '/'
// 앱 내부 경로만 허용
router.history.push(target.startsWith('/') && !target.startsWith('//') ? target : '/')
```

### `history.block` — 저수준 차단

`useBlocker` 가 내부적으로 쓰는 API다. 해제 함수를 반환한다.

```tsx
const unblock = router.history.block({
  blockerFn: async () => confirm('나가시겠습니까?'),
  enableBeforeUnload: true,
})
// 나중에 unblock() 으로 해제
```

React 컴포넌트 안이라면 `useBlocker` 가 정리(cleanup)까지 해 주므로 이걸 직접 쓸 일은
없다. 컴포넌트 밖에서 차단을 걸어야 할 때만 필요하다.

## 흔한 실수 / 함정

**1. 커스텀 모달로 탭 닫기를 막으려 한다**
불가능하다. 브라우저 기본 경고만 뜬다.

**2. `shouldBlockFn` 이 항상 `true` 를 반환한다**
사용자가 앱에 갇힌다. `isDirty` 같은 조건을 반드시 건다. 개발 중에는 저장 후
`setIsDirty(false)` 를 빠뜨려 갇히는 일이 흔하다.

**3. `withResolver: true` 인데 `status` 를 확인하지 않는다**
`proceed` 가 `undefined` 일 때 호출하면 터진다. 타입이 막아 주지만 `as` 로 우회하면
런타임 에러가 된다.

**4. `history.push` 에 사용자 입력을 그대로 넣는다**
오픈 리다이렉트 취약점. 내부 경로인지 검증한다.

**5. 해시 히스토리를 쓰면서 basepath를 설정한다**
`#` 뒤의 경로에는 basepath 개념이 다르게 적용된다. 둘을 함께 쓸 때는 실제 URL을
확인하며 맞춘다.

**6. 테스트에서 브라우저 히스토리를 쓴다**
테스트 간 URL 상태가 새어 나가 서로 간섭한다. 테스트는 `createMemoryHistory` 로 매번
새로 만든다.

## 🔗 시너지

- **02장 `useNavigate`** — 평소 이동은 `navigate`, 문자열 경로만 있을 때 `history.push`.
  둘의 경계를 아는 것이 이 장의 실용적 핵심이다.
- **06장 인증 리다이렉트** — 로그인 후 원래 가려던 곳으로 돌려보내는 흐름에서
  `history.push` 와 오픈 리다이렉트 검증이 함께 등장한다.
- **11장 `useCanGoBack`** — 뒤로가기 버튼을 만들 때 `router.history.back()` 과 짝으로 쓴다.
- **04장 mutations** — 폼 저장 성공 시 `setIsDirty(false)` 를 호출해야 차단이 풀린다.
  저장과 차단 해제는 세트로 다룬다.

## ▶ 실행 예제

- `/auth/login` — `router.history.push(redirect)` 로 임의 경로 복귀

`useBlocker` 는 `apps/playground` 에서 폼 하나 만들어 실습하기 좋다. `withResolver: true`
로 모달을 붙여 보면 `proceed`/`reset` 의 동작이 명확해진다.

## 📖 공식 문서

- [Navigation Blocking](https://tanstack.com/router/latest/docs/framework/react/guide/navigation-blocking)
- [History Types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)
- [`useBlocker`](https://tanstack.com/router/latest/docs/framework/react/api/router/useBlockerHook)
