# 04 · 데이터 로딩 / 변경

> 대응 예제: `/data`, `/data/basics`, `/data/deps`, `/data/mutations`
> 예제 파일: `apps/bible/src/routes/data*.tsx`, `apps/bible/src/lib/todos.ts`
> 📖 공식: [data-loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading) ·
> [data-mutations](https://tanstack.com/router/latest/docs/framework/react/guide/data-mutations)

지금까지는 "어디로 가고(01·02) 무슨 값을 싣는가(03)"였다. 이번엔 그 라우트가 **화면을 그리기
전에 데이터를 준비하는 법**이다. 핵심 사고 전환은 하나 — **컴포넌트보다 데이터가 먼저** 온다.

## 한 줄 정의 & 언제 쓰나

라우트에 `loader` 를 달면 라우터가 컴포넌트 렌더 **전에** 그 함수를 실행해 데이터를 받아 둔다.
컴포넌트는 `useLoaderData()` 로 이미 준비된 데이터를 꺼내 쓴다. "컴포넌트 안에서 useEffect 로
fetch → 스피너" 하던 흐름이 라우트 레벨로 올라간다.

## 라우트 데이터 생명주기

진입하면 대략 이 순서다:

`beforeLoad`(진입 전 검사·컨텍스트, Chapter 06) → `loaderDeps`(loader 가 의존하는 값 선언) →
`loader`(데이터 로드) → 로딩이 길면 `pendingComponent`, throw 하면 `errorComponent` →
준비되면 `component`.

## loader · pending · error

```tsx
export const Route = createFileRoute('/data/basics')({
  loaderDeps: ({ search }) => ({ slow: search.slow, fail: search.fail }),
  loader: async ({ deps }) => {
    if (deps.fail) throw new Error('의도적으로 던진 에러입니다')
    return listTodos(deps.slow ? 1500 : 300)
  },
  pendingComponent: () => <Spinner />,               // 로딩이 pendingMs(기본 1s) 초과 시
  errorComponent: ({ error }) => <Err e={error} />,  // loader 가 throw 시
  component: LoaderDemo,
})

function LoaderDemo() {
  const todos = Route.useLoaderData()   // loader 반환값, 타입 추론됨
  return <ul>{todos.map(/* ... */)}</ul>
}
```

- **pendingComponent** 는 로딩이 임계(기본 1초)를 넘겨야 뜬다. 짧은 로딩엔 깜빡임을 막으려고
  일부러 안 띄운다.
- **errorComponent** 는 loader 가 throw 하면 뜬다. `error` 와 `reset`(재시도)을 받는다.

→ 실행: `/data/basics` 에서 "느리게(1.5s)"로 pendingComponent 를, "에러"로 errorComponent 를
직접 띄워 보라.

## loaderDeps · staleTime

loader 가 search 같은 외부 값에 의존한다면, 그 의존성을 `loaderDeps` 로 **명시**한다. 이 값이
바뀔 때만 loader 가 다시 실행된다.

```tsx
export const Route = createFileRoute('/data/deps')({
  validateSearch: (s) => searchSchema.parse(s),      // { page, category }
  loaderDeps: ({ search }) => ({ page: search.page, category: search.category }),
  loader: async ({ deps }) => {
    const all = await listProducts()
    const filtered = deps.category === 'all'
      ? all : all.filter((p) => p.category === deps.category)
    return { items: paginate(filtered, deps.page), loadedAt: now() }
  },
  staleTime: 5000,   // 5초 내 같은 deps 재방문 → 캐시 사용(재로드 X)
})
```

- **staleTime**: 데이터가 "신선하다"고 볼 시간. 이 안에 같은 deps 로 돌아오면 loader 를 다시
  돌리지 않고 캐시를 쓴다. (기본 0 → 이동마다 새로 로드, 단 preload 는 캐시된다.)
- **gcTime**: 안 쓰는 캐시를 메모리에서 버리기까지의 시간. 기본 30분.

→ 실행: `/data/deps` 에서 category·page 를 바꾸며 "불러온 시각"을 관찰하라. deps 를 바꾸면
갱신되지만, 5초 내 같은 조합이면 시각이 그대로다(재로드 안 함).

### `loaderDeps` 에는 실제로 쓰는 것만 넣는다

공식 문서가 강조하는 대목이다.

```tsx
// ❌ search 를 통째로 넘긴다 → 관계없는 값이 바뀌어도 loader 가 다시 돈다
loaderDeps: ({ search }) => search,

// ✅ loader 안에서 실제로 쓰는 것만
loaderDeps: ({ search }) => ({ category: search.category, page: search.page }),
```

`?theme=dark` 같은 UI 상태가 search 에 섞여 있으면, 통째로 넘겼을 때 테마만 바꿔도
서버 요청이 나간다. **deps 는 캐시 키**라는 점을 기억하면 판단이 쉽다.

### `shouldReload` — 시간이 아닌 논리로 제어하기

`staleTime` 이 "몇 초 안에는 재사용"이라면, `shouldReload` 는 "이런 조건이면 다시
로드"다. 둘은 함께 동작한다.

```tsx
export const Route = createFileRoute('/reports')({
  loader: fetchReport,
  // 항상 다시 로드
  shouldReload: true,
  // 또는 조건부 — cause 로 판단한다 (11장)
  shouldReload: ({ cause }) => cause === 'enter',
})
```

### `staleReloadMode` — stale 일 때 어떻게 보여줄까

`staleTime` 이 지난 데이터를 다시 받는 동안 화면을 어떻게 할지 정한다.

| 값 | 동작 |
|---|---|
| `'background'` | **낡은 데이터를 먼저 보여 주고** 뒤에서 갱신 |
| `'blocking'` | 새 데이터가 올 때까지 기다린다 (pendingComponent 표시) |

```tsx
createRouter({ routeTree, defaultStaleReloadMode: 'background' })
```

목록 화면처럼 "일단 뭐라도 보이는 게 나은" 곳은 `background`, 잔액·재고처럼 **틀린 값을
잠깐이라도 보여 주면 안 되는** 곳은 `blocking` 이다.

### preload 전용 캐시 옵션

프리로드(02장)는 일반 이동과 **별도의 캐시 정책**을 가진다.

| 옵션 | 기본값 | 뜻 |
|---|---|---|
| `preloadStaleTime` | `30_000` | 프리로드한 데이터의 신선 기간 |
| `preloadGcTime` | `gcTime` 따름 | 프리로드 캐시 수거 시간 |

기본값이 30초인 이유는 **hover 를 반복할 때마다 요청이 나가지 않게** 하기 위해서다.
링크 위에서 마우스를 흔들어도 30초 안에는 한 번만 받는다.

### 캐시를 아예 끄고 싶다면

TanStack Query(07장)처럼 **외부 캐시를 따로 두는 경우**, 라우터 캐시가 오히려 방해가
된다. 두 겹으로 캐시하면 어느 쪽이 최신인지 헷갈린다.

```tsx
export const Route = createFileRoute('/posts')({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  gcTime: 0,              // 라우터 캐시를 남기지 않는다
  shouldReload: false,    // 라우터가 스스로 재로드하지 않는다
})
```

라우터는 "loader 를 부르는 일"만 하고 **캐시 판단은 Query 에 맡긴다.** 라우터 전역으로는
`defaultPreloadStaleTime: 0` 을 주면 프리로드 때도 매번 loader 가 불려 외부 캐시가 판단을
가져간다.

### `abortController` — 취소된 이동의 요청 정리

loader 인자로 들어온다. 사용자가 빠르게 다른 링크로 옮기면 이전 요청은 쓸모없어진다.

```tsx
loader: async ({ params, abortController }) => {
  const res = await fetch(`/api/posts/${params.postId}`, {
    signal: abortController.signal,   // 이동이 취소되면 fetch 도 취소된다
  })
  return res.json()
}
```

넘기지 않아도 동작은 하지만, 취소된 요청이 계속 살아남아 네트워크를 점유한다. 자세한
내용은 11장에서 다룬다.

## Mutations · invalidate

라우터에는 별도의 mutation API 가 **없다.** 기본 패턴은 **"변경 → invalidate"** 다. 데이터를
바꾼 뒤 `router.invalidate()` 로 관련 loader 를 다시 돌려 화면을 최신화한다.

```tsx
const router = useRouter()

async function onAdd(title: string) {
  await addTodo(title)        // 1) 스토어/서버를 변경
  await router.invalidate()   // 2) loader 재실행 → 화면 갱신
}
```

→ 실행: `/data/mutations` 에서 추가/토글/삭제할 때마다 "loader 실행 횟수"가 늘어난다 —
invalidate 가 loader 를 다시 부른다는 증거다.

## Not Found (loader 맥락)

loader 가 데이터를 못 찾으면 `notFound()` 를 던져 "없음" 상태로 보낼 수 있다. 이 흐름과 전용
UI(`notFoundComponent`)는 Chapter 06에서 본격적으로 다룬다.

```tsx
loader: async ({ params }) => {
  const item = await getItem(params.id)
  if (!item) throw notFound()   // → 가장 가까운 notFoundComponent 로
  return item
}
```

## 흔한 실수 / 함정

- **loaderDeps 누락.** search 에 의존하는데 `loaderDeps` 를 안 쓰면, search 만 바뀔 때 loader 가
  다시 안 돈다. "필터를 바꿨는데 목록이 그대로"면 여기를 의심한다.
- **pending 이 안 보인다고 당황.** 로딩이 1초 미만이면 pendingComponent 는 원래 안 뜬다(정상).
- **mutation 후 invalidate 누락.** 데이터를 바꾸고 invalidate 를 안 하면 화면이 옛 데이터를
  그대로 보여 준다.
- **loader 에서 무거운 계산.** loader 는 네비게이션을 막는다(블로킹). 오래 걸리는 건
  deferred 로딩(Phase 2 주제)이나 Query 로 분리한다.

## 🔗 시너지

- `loaderDeps` ← [Chapter 03 Search Params]. search 가 바뀌면 다시 로드하는 고리가 여기서 완성.
- `preload` + `staleTime` ← [Chapter 02 Preloading]. hover 프리로드가 캐시에 얹힌다.
- `notFound()` → [Chapter 06 Not Found Errors].
- loader 를 캐시 라이브러리로 대체/보강 → [Chapter 07 TanStack Query 통합] (`ensureQueryData`).
- `context` 를 loader 에서 쓰기 → [Chapter 05 Router Context].

## ▶ 실행 예제

- `/data` — 데이터 생명주기 개요
- `/data/basics` — loader · pendingComponent · errorComponent (slow/fail 플래그)
- `/data/deps` — loaderDeps · staleTime 캐시 관찰
- `/data/mutations` — 변경 후 router.invalidate()
