# 10 · Deferred & 스트리밍

> 대응 예제: `/deferred`
> 📖 공식: [deferred-data-loading](https://tanstack.com/router/latest/docs/framework/react/guide/deferred-data-loading) ·
> [defer](https://tanstack.com/router/latest/docs/framework/react/api/router/deferFunction) ·
> [Await](https://tanstack.com/router/latest/docs/framework/react/api/router/awaitComponent)

## 한 줄 정의 & 언제 쓰나

**Deferred는 "느린 데이터 때문에 빠른 데이터까지 기다리게 하지 않는" 기법이다.**

04장에서 배운 `loader` 는 기본적으로 **전부 기다린다.** 반환한 값이 모두 준비되어야 화면이
그려진다. 대부분은 이게 옳다 — 반쪽짜리 화면을 보여 주느니 잠깐 기다리는 게 낫다.

그런데 이런 화면이 있다:

```
게시글 상세 페이지
├── 제목·본문      ← 30ms  (빠름)
└── 댓글 목록      ← 1200ms (느림, 외부 API)
```

전부 기다리면 **본문도 1200ms 뒤에** 뜬다. 사용자는 1.2초 동안 빈 화면을 본다. 본문은
30ms에 준비됐는데도 말이다.

Deferred는 이 지점을 푼다. **빠른 데이터로 먼저 그리고, 느린 데이터는 준비되는 대로
그 자리에만 채워 넣는다.**

## 최소 예제

핵심은 **loader에서 `await` 하지 않고 Promise 자체를 반환하는 것**이다.

```tsx
import { createFileRoute, Await } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // 빠른 것: 기다린다 → 이게 준비돼야 화면을 그린다
    const post = await fetchPost(params.postId)

    // 느린 것: await 하지 않는다 → Promise 그대로 반환
    const commentsPromise = fetchComments(params.postId)

    return { post, commentsPromise }
  },
  component: PostPage,
})

function PostPage() {
  const { post, commentsPromise } = Route.useLoaderData()

  return (
    <article>
      {/* 30ms 만에 즉시 렌더된다 */}
      <h1>{post.title}</h1>
      <p>{post.body}</p>

      {/* 이 부분만 1200ms 뒤에 채워진다 */}
      <Await promise={commentsPromise} fallback={<div>댓글 불러오는 중…</div>}>
        {(comments) => (
          <ul>
            {comments.map((c) => <li key={c.id}>{c.text}</li>)}
          </ul>
        )}
      </Await>
    </article>
  )
}
```

`await` 를 붙이느냐 마느냐 — 그 한 글자가 "전부 기다림"과 "부분 스트리밍"을 가른다.

## `<Await>` 의 세 부분

```tsx
<Await
  promise={somePromise}          // 필수: 기다릴 Promise
  fallback={<Skeleton />}        // 선택: 해결 전까지 보여줄 것
>
  {(data) => <Result data={data} />}   {/* 필수: 결과를 받는 함수 */}
</Await>
```

`children` 이 **함수**라는 점이 중요하다. 일반 JSX가 아니라 render prop이다. 해결된 값이
인자로 들어온다.

`fallback` 을 생략하면 자체 Suspense 경계를 만들지 않고 **상위 경계로 위임**한다. 라우트의
`pendingComponent` 가 대신 뜨게 되는데, 그러면 화면 전체가 대기 상태가 되어 Deferred를 쓴
의미가 사라진다. **`fallback` 은 사실상 필수라고 생각하는 편이 좋다.**

## `useAwaited()` — 훅 버전

같은 일을 훅으로 한다. 컴포넌트를 쪼갤 때 쓴다.

```tsx
import { useAwaited } from '@tanstack/react-router'

function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = useAwaited({ promise })   // 해결될 때까지 suspend
  return <ul>{comments.map((c) => <li key={c.id}>{c.text}</li>)}</ul>
}

// 사용하는 쪽에서 Suspense 경계를 직접 만든다
<Suspense fallback={<div>댓글 불러오는 중…</div>}>
  <Comments promise={commentsPromise} />
</Suspense>
```

`<Await>` 는 `fallback` 을 주면 내부에서 Suspense 경계까지 만들어 주지만, `useAwaited` 는
**suspend만 한다.** 경계는 호출하는 쪽 책임이다.

| | `<Await>` | `useAwaited()` |
|---|---|---|
| 형태 | 컴포넌트 + render prop | 훅 |
| Suspense 경계 | `fallback` 주면 자동 생성 | 직접 감싸야 함 |
| 적합한 곳 | 한 파일 안에서 부분 대기 | 컴포넌트를 분리했을 때 |

## `defer()` — 명시적으로 감싸기

```tsx
import { defer } from '@tanstack/react-router'

loader: async ({ params }) => {
  const post = await fetchPost(params.postId)
  return {
    post,
    commentsPromise: defer(fetchComments(params.postId)),
  }
}
```

`defer()` 는 Promise에 **상태 꼬리표를 붙여 돌려준다.** 반환 타입이
`DeferredPromise<T> = Promise<T> & { [TSR_DEFERRED_PROMISE]: DeferredPromiseState<T> }`
이고, 그 상태는 다음 셋 중 하나다:

```ts
| { status: 'pending';  data?: T; error?: unknown }
| { status: 'success';  data: T }
| { status: 'error';    data?: T; error: unknown }
```

### 지금은 대개 없어도 된다

현재 버전에서는 **loader가 반환한 Promise를 라우터가 알아서 처리**하므로, 위 최소 예제처럼
`defer()` 없이 Promise를 그냥 반환해도 `<Await>` 가 동작한다. `defer()` 를 명시적으로
쓰는 경우는 이렇다:

1. **에러 직렬화를 제어할 때** — 유일한 옵션이 `serializeError` 다.

   ```tsx
   defer(fetchComments(id), {
     serializeError: (err) => ({ message: '댓글을 불러오지 못했습니다' }),
   })
   ```

   SSR에서 서버의 에러를 클라이언트로 넘길 때, 스택 트레이스 같은 내부 정보가 그대로
   새어 나가지 않도록 가공하는 자리다.

2. **Promise 상태를 직접 읽을 때** — `TSR_DEFERRED_PROMISE` 심볼로 접근한다. suspend 없이
   "지금 로딩 중인가?"를 확인하는 용도이며, 실무에서 쓸 일은 드물다.

3. **의도를 코드에 남길 때** — `await` 이 빠진 게 실수인지 의도인지 리뷰어가 헷갈리는
   경우가 있다. `defer()` 로 감싸 두면 "일부러 안 기다린 것"이 분명해진다.

## 에러 처리

Deferred 된 Promise가 **reject되면 `<Await>` 안에서 throw된다.** 라우트의
`errorComponent` 는 이걸 잡지 못한다 — 그건 loader 단계의 에러를 위한 것이고, 이 에러는
렌더 단계에서 터지기 때문이다. 그래서 **`<Await>` 주변에 ErrorBoundary가 필요하다.**

```tsx
import { CatchBoundary } from '@tanstack/react-router'

<CatchBoundary
  getResetKey={() => 'comments'}
  errorComponent={({ error }) => <div>댓글 로드 실패: {error.message}</div>}
>
  <Await promise={commentsPromise} fallback={<Skeleton />}>
    {(comments) => <CommentList comments={comments} />}
  </Await>
</CatchBoundary>
```

`CatchBoundary` 는 12장에서 자세히 다룬다. **핵심은 "본문은 살아 있고 댓글 영역만 에러를
보여 준다"** 는 점이다. 부분 실패를 부분적으로 처리할 수 있다는 것이 Deferred의 또 다른
이점이다.

## `createControlledPromise()` — 밖에서 결정하는 Promise

`resolve`/`reject` 를 밖으로 꺼낸 Promise를 만든다. 라우터 내부가 비동기 흐름을 조율할 때
쓰는 유틸인데, export 되어 있으므로 직접 쓸 수도 있다.

```tsx
import { createControlledPromise } from '@tanstack/react-router'

const gate = createControlledPromise<string>()

gate.status        // 'pending' | 'resolved' | 'rejected'
gate.value         // 해결된 값 (해결 후)
gate.resolve('ok') // 밖에서 해결시킨다
gate.reject(err)   // 밖에서 거부시킨다
```

전형적인 쓰임은 **"사용자 조작을 기다리는 Promise"** 다. 예를 들어 모달에서 확인을 누를
때까지 기다리는 흐름:

```tsx
const confirmGate = createControlledPromise<boolean>()
// 모달의 "확인" 버튼: confirmGate.resolve(true)
// 모달의 "취소" 버튼: confirmGate.resolve(false)

<Await promise={confirmGate} fallback={<ConfirmModal gate={confirmGate} />}>
  {(ok) => (ok ? <Proceed /> : <Cancelled />)}
</Await>
```

표준 `Promise.withResolvers()` 와 비슷하지만 `status`, `value` 를 함께 노출한다는 점이
다르다.

## 흔한 실수 / 함정

**1. `await` 를 습관적으로 붙인다**
`return { post, comments: await fetchComments(id) }` 로 쓰면 Deferred가 아니다. 다시
"전부 기다림"이 된다. 가장 흔한 실수이고, 겉보기에는 동작하므로 발견이 늦다.

**2. `fallback` 을 빼먹는다**
상위 Suspense 경계로 올라가 화면 전체가 pending 상태가 된다. 부분 로딩을 하려던 의도가
사라진다.

**3. `<Await>` 의 children을 JSX로 쓴다**
```tsx
<Await promise={p}><div>…</div></Await>   // ❌ 함수여야 한다
<Await promise={p}>{(data) => <div>…</div>}</Await>   // ✅
```

**4. Deferred 에러를 `errorComponent` 로 잡으려 한다**
잡히지 않는다. `<CatchBoundary>` 로 감싼다.

**5. 매 렌더마다 새 Promise를 만든다**
컴포넌트 본문에서 `fetchComments()` 를 호출해 `<Await>` 에 넘기면 렌더마다 새 Promise가
생겨 무한 루프에 빠진다. Promise는 **loader에서 만들어 내려보낸다.**

**6. 모든 걸 defer 한다**
빠른 데이터까지 defer하면 화면이 조각조각 나타나 오히려 어수선하다. 체감 기준은
**"이것 때문에 나머지가 막히는가?"** 하나다. 그렇지 않다면 그냥 `await` 한다.

## 🔗 시너지

- **04장 loader** — Deferred는 loader의 확장이다. `pendingComponent` 가 "화면 전체 대기"
  라면 `<Await fallback>` 은 "영역별 대기"다. 둘을 함께 쓰면 2단 로딩이 된다.
- **07장 TanStack Query** — Query와 함께 쓸 때는 보통 Deferred가 필요 없다.
  `ensureQueryData` 로 중요한 것만 프리페치하고, 나머지는 컴포넌트에서 `useQuery` 로
  받으면 같은 효과가 난다. **Query를 쓴다면 Deferred는 선택지에서 내려도 된다.**
- **09장 코드 스플리팅** — 코드는 나중에(09), 데이터도 나중에(10). 둘을 합치면 껍데기가
  가장 먼저 뜬다.
- **12장 CatchBoundary** — Deferred의 부분 실패를 부분적으로 처리하는 짝이다.

## ▶ 실행 예제

이 저장소의 bible 앱은 TanStack Query 통합(07장)을 주 경로로 삼아서, Deferred 전용
라우트를 두지 않았다. 위 코드 조각을 `apps/playground` 에 그대로 옮겨 실습해 보는 것을
권한다. 느린 API는 이렇게 흉내 낼 수 있다:

```ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const fetchComments = async (id: string) => {
  await sleep(1200)
  return [{ id: '1', text: '첫 댓글' }]
}
```

## 📖 공식 문서

- [Deferred Data Loading](https://tanstack.com/router/latest/docs/framework/react/guide/deferred-data-loading)
- [`defer`](https://tanstack.com/router/latest/docs/framework/react/api/router/deferFunction)
- [`Await`](https://tanstack.com/router/latest/docs/framework/react/api/router/awaitComponent)
- [`useAwaited`](https://tanstack.com/router/latest/docs/framework/react/api/router/useAwaitedHook)
