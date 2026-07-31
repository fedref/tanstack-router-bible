# 02 · 네비게이션

> 대응 예제: `/navigation`, `/navigation/link`, `/navigation/imperative`,
> `/navigation/preloading`, `/navigation/events`
> 예제 파일: `apps/bible/src/routes/navigation*.tsx`
> 📖 공식: [navigation](https://tanstack.com/router/latest/docs/framework/react/guide/navigation) ·
> [link-options](https://tanstack.com/router/latest/docs/framework/react/guide/link-options) ·
> [custom-link](https://tanstack.com/router/latest/docs/framework/react/guide/custom-link) ·
> [preloading](https://tanstack.com/router/latest/docs/framework/react/guide/preloading) ·
> [router-events](https://tanstack.com/router/latest/docs/framework/react/guide/router-events)

Chapter 01에서 "어떤 URL이 있는가"를 배웠다면, 이번 Chapter은 "그 URL들 사이를 **어떻게 오가는가**"
다. 이동 API는 여러 개지만 뿌리는 하나다 — 전부 같은 타입 안전성을 공유하고, 옵션 이름도
대부분 겹친다(`to`, `params`, `search`, `hash`, `replace` …). 그래서 하나를 제대로 익히면
나머지는 금방 따라온다.

## 한 줄 정의 & 언제 쓰나

- **`<Link>`** — 사용자가 클릭할 링크. 선언형이고, 대부분의 이동은 이걸로 한다.
- **`useNavigate()`** — 코드가 판단해서 보내는 이동(제출 후, 조건 분기 등). 명령형이다.
- 나머지(`<Navigate>`, `redirect()`, `linkOptions()`)는 특수 상황용 조연이다.

가르는 기준은 간단하다. **"사용자가 눌러서 가면 `Link`, 코드가 결정해서 가면 `useNavigate`."**

## 최소 예제

```tsx
import { Link, useNavigate } from '@tanstack/react-router'

// 선언형
<Link to="/routing/matching/$productId" params={{ productId: '1' }}>
  상품 1
</Link>

// 명령형
const navigate = useNavigate()
<button onClick={() => navigate({ to: '/routing' })}>라우팅으로</button>
```

두 방식 모두 `to` 가 실제 존재하는 경로가 아니면, 그리고 `params` 가 빠지면 **컴파일 에러**가
난다. 이 안전망이 이동 코드 전반에 깔려 있다.

## 옵션·변형 (다양한 결과)

### 1) active 상태 스타일링

현재 위치인 링크를 다르게 꾸미는 건 내비게이션 UI의 기본이다.

```tsx
<Link
  to="/navigation/link"
  activeProps={{ className: 'font-semibold text-primary' }}
  inactiveProps={{ className: 'text-muted-foreground' }}
>
  Link 심화
</Link>
```

- 부모 경로 링크는 **자식에 있을 때도** active 로 친다. 정확히 일치할 때만 active 로 보려면
  `activeOptions={{ exact: true }}` 를 준다.
- `activeOptions` 에는 `includeSearch`, `includeHash` 등도 있어, "search 까지 같아야 active"
  같은 세밀한 판단이 가능하다.
- children 을 함수로 주면 `isActive` 를 직접 받아 내용을 통째로 바꿀 수 있다:
  `{({ isActive }) => <span>{isActive ? '● 현재' : '○ 이동'}</span>}`

→ 실행: `/navigation/link` 에서 네 가지 변형을 눈으로 확인.

### 2) search 를 상태처럼 다루기 (updater 함수)

`useNavigate` 의 진가는 **search 를 상태처럼** 갱신할 때 드러난다.

```tsx
const navigate = Route.useNavigate()

// 이전 값 기준으로 갱신 — search 에 함수를 준다
navigate({ search: (prev) => ({ count: prev.count + 1 }) })

// 히스토리에 안 쌓고 교체
navigate({ search: { count: 0 }, replace: true })
```

여기서 핵심은 **count 가 컴포넌트 state 가 아니라 URL에 산다**는 점이다. 새로고침해도,
링크를 복사해 남에게 보내도 값이 보존된다. "URL이 곧 상태"라는 이 감각이 TanStack Router의
핵심 철학이다. (search 검증은 Chapter 03에서 본격적으로 다룬다.)

→ 실행: `/navigation/imperative` 에서 ±1 버튼을 누르며 주소창의 `?count=` 를 관찰.

### 3) linkOptions — 재사용 가능한 타입 안전 링크 설정

같은 링크 설정을 여러 곳에서 쓸 때, 문자열을 복붙하지 말고 묶어 둔다.

```tsx
import { linkOptions } from '@tanstack/react-router'

const productLink = linkOptions({
  to: '/routing/matching/$productId',
  params: { productId: '1' },
})

<Link {...productLink}>상품 1</Link>   // to/params 가 여기서도 타입 검증됨
```

### 4) 조연들

| API | 언제 |
|-----|------|
| `<Navigate to="..." />` | 렌더 시점에 즉시 리다이렉트하는 컴포넌트 |
| `redirect({ to })` | `beforeLoad`/`loader` 안에서 **던져서** 이동 (Chapter 06 인증) |

## Preloading — 클릭 전에 미리 받기

미리 로드는 사용자가 링크를 **클릭하기 전에** 그 라우트의 loader 데이터를 받아 두는 기능이다.
클릭 순간엔 이미 준비돼 있어 "즉시 열리는" 체감을 만든다.

```tsx
// 전역 (main.tsx)
createRouter({ defaultPreload: 'intent' })   // hover/touch/focus 시 미리 로드

// 개별 링크에서 덮어쓰기
<Link to="/x" preload="viewport" />          // 화면에 보이면
<Link to="/x" preload="intent" preloadDelay={200} />  // hover 후 200ms 뒤
<Link to="/x" preload={false} />             // 이 링크만 끔
```

| 값 | 시점 |
|----|------|
| `'intent'` | hover / touch / focus (가장 흔함) |
| `'viewport'` | 링크가 화면에 들어올 때 |
| `'render'` | 링크가 렌더되는 즉시 |
| `false` | 끔 |

→ 실행: `/navigation/preloading` 의 상품 링크에 마우스를 올린 뒤 좌하단 Router Devtools 에서
클릭 없이도 라우트가 미리 로드되는 것을 확인.

## Router Events — 이동 생명주기 관찰

이동의 각 단계(시작·로드·완료)에 훅을 걸고 싶을 때 `router.subscribe` 를 쓴다. 분석 로깅,
상단 진행바, 스크롤 처리 등에 유용하다.

```tsx
const router = useRouter()

useEffect(() => {
  const unsub = router.subscribe('onResolved', (e) => {
    console.log('이동 완료:', e.toLocation.href)
  })
  return unsub   // subscribe 는 해지 함수를 돌려준다
}, [router])
```

- 구독 가능한 이벤트: `onBeforeNavigate`, `onBeforeLoad`, `onLoad`, `onResolved` 등.
- 현재 이동 상태만 필요하면 구독 대신 `useRouterState({ select: (s) => s.status })`
  (`'idle'` | `'pending'`) 가 더 간편하다. 진행 표시에 자주 쓴다.

→ 실행: `/navigation/events` 에서 버튼으로 이동을 일으키면 로그가 실시간으로 쌓인다.

## 흔한 실수 / 함정

- **명령형과 선언형 혼동.** 클릭 링크를 `useNavigate` + `onClick` 으로 만들면 접근성(오른쪽
  클릭으로 새 탭 열기 등)을 잃는다. 링크는 `<Link>` 로 두는 게 기본이다.
- **search 검증 라우트로 링크할 때 `search` 누락.** `validateSearch` 가 있는 라우트로 리터럴
  `to` 를 쓰면 `search` 가 요구된다(타입 에러). 값을 넘기거나 `search: (prev) => …` 로 갱신한다.
- **`replace` 를 안 써서 히스토리 오염.** 필터/탭 같은 잦은 상태 변경은 `replace: true` 로
  뒤로가기 스택을 더럽히지 않는 게 보통 낫다.

## 🔗 시너지

- `search` 갱신 → [Chapter 03 Search Params] 에서 zod/valibot 검증과 함께 완성된다.
- `preload` + `loader` → [Chapter 04 Data Loading] 의 캐시/staleness 와 맞물린다.
- `redirect()` 이동 → [Chapter 06 Authenticated Routes] 의 핵심 도구다.
- `useRouterState({ select })` → [Chapter 05 Type Safety] 의 선택자 패턴과 이어진다.

## ▶ 실행 예제

- `/navigation` — 이동 방법 비교표
- `/navigation/link` — active 스타일 · activeOptions · isActive · linkOptions · hash
- `/navigation/imperative` — useNavigate · search updater · replace
- `/navigation/preloading` — 전역/개별 preload 변형
- `/navigation/events` — router.subscribe · 라이브 이벤트 로그 · status
