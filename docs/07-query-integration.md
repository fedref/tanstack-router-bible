# 07 · TanStack Query 통합

> 대응 예제: `/query`, `/query/prefetch`, `/query/search`, `/query/mutation`
> 예제 파일: `app/src/routes/query*.tsx`, `app/src/lib/queries.ts`
> 📖 공식: [integrations/query](https://tanstack.com/router/latest/docs/framework/react/integrations/query)

Router 의 loader 는 "진입 전에 막고 받는" 데 강하고, TanStack Query 는 "받은 걸 캐시하고 여러
화면이 공유·재검증" 하는 데 강하다. 이 Chapter는 둘을 **한 캐시로** 엮는다. 접점은 Chapter 05에서
context 에 넣어 둔 하나의 `queryClient` 다.

## 한 줄 정의 & 언제 쓰나

loader 에서 `queryClient.ensureQueryData` 로 **프리페치**하고, 컴포넌트에서
`useSuspenseQuery` 로 **즉시 꺼내 쓴다.** loader 가 미리 채웠으니 컴포넌트는 기다리지 않는다.

## queryOptions — 한 번 정의해 공유

프리페치와 컴포넌트가 **같은 것**을 가리키게 하려면 `queryOptions` 로 key+fn 을 한 곳에 둔다.

```tsx
// lib/queries.ts
export const productsQuery = queryOptions({
  queryKey: ['products'],
  queryFn: () => listProducts(),
})
```

## loader 프리페치 + useSuspenseQuery

```tsx
export const Route = createFileRoute('/query/prefetch')({
  // context.queryClient 는 루트에서 주입한 것(Chapter 05)
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: PrefetchDemo,
})

function PrefetchDemo() {
  const { data } = useSuspenseQuery(productsQuery)   // 이미 캐시됨 → 즉시(suspend 안 함)
}
```

- `ensureQueryData` — 캐시에 있으면 그대로, 없으면 받아서 채운다. loader 는 이걸 await 한다.
- `useSuspenseQuery` — 캐시가 이미 차 있으니 지연 없이 반환한다. 그래서 로딩 스피너가 안 뜬다.

→ 실행: `/query/prefetch`. 우하단 Query Devtools 에서 `['products']` 캐시를 확인하라.

## Search Params ↔ queryKey

search 값을 `queryKey` 에 넣으면, search 가 바뀔 때마다 다른 캐시 항목이 된다. 한 번 본 조합은
캐시로 즉시 열린다.

```tsx
export function productsByCategoryQuery(category: string) {
  return queryOptions({
    queryKey: ['products', category],          // ← search 값이 key 에
    queryFn: () => fetchByCategory(category),
  })
}

export const Route = createFileRoute('/query/search')({
  validateSearch: (s) => searchSchema.parse(s),           // { category }
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(productsByCategoryQuery(deps.category)),
})

function QuerySearchDemo() {
  const { category } = Route.useSearch()
  const { data } = useSuspenseQuery(productsByCategoryQuery(category))
}
```

이것이 Chapter 03(search)·04(loaderDeps)·05(context)가 한데 모이는 지점이다.

→ 실행: `/query/search` 에서 카테고리를 바꾸며 Devtools 에 키가 쌓이는 걸 보라.

## Mutation — useMutation + invalidateQueries

Query 를 얹으면 변경은 `useMutation`, 갱신은 `invalidateQueries` 로 한다. Chapter 04의
`router.invalidate()` 와 목적은 같지만, **캐시 키 단위로 더 정밀하게** 무효화한다.

```tsx
const qc = useQueryClient()
const { data: todos } = useSuspenseQuery(todosQuery)

const addMut = useMutation({
  mutationFn: (title: string) => addTodo(title),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),  // 관련 캐시만 무효화
})

<button onClick={() => addMut.mutate('새 할 일')} disabled={addMut.isPending}>추가</button>
```

→ 실행: `/query/mutation` 에서 추가/토글/삭제 시 `['todos']` 만 무효화되어 다시 받아진다.

## 옵션·변형 (다양한 결과)

- **router.invalidate() vs invalidateQueries().** 전자는 라우트 loader 전체, 후자는 특정 쿼리
  키만. 상황에 맞게 고른다.
- **useQuery vs useSuspenseQuery.** 프리페치를 안 했거나 로딩 UI 를 직접 그리고 싶으면
  `useQuery`(+ `isPending`), 프리페치 후 즉시 쓰려면 `useSuspenseQuery`.
- **staleTime 이원화.** Router 의 `staleTime`(Chapter 04)과 Query 의 `staleTime` 은 별개다. Query
  로 데이터를 관리한다면 Query 쪽 옵션을 기준으로 잡는 게 헷갈리지 않는다.

## 흔한 실수 / 함정

- **queryKey 불일치.** loader 프리페치와 컴포넌트의 key 가 다르면 캐시를 못 맞춰 두 번 받는다.
  `queryOptions` 로 한 곳에 정의해 이 실수를 원천 차단한다.
- **useSuspenseQuery 인데 프리페치 누락.** loader 에서 안 채우면 첫 렌더가 suspend 한다 →
  pendingComponent 나 Suspense 경계가 필요하다.
- **context.queryClient 미주입.** 루트에서 context 에 안 넣으면 loader 에서 접근할 수 없다
  (Chapter 05).

## 🔗 시너지

- `context.queryClient` ← [Chapter 05 Router Context].
- `loaderDeps` + queryKey ← [Chapter 03 Search] · [Chapter 04 Data Loading].
- Devtools 로 캐시 관찰 ← [Chapter 00 Getting Started].
- 이 모든 조합의 종합 → [Chapter 08 시너지 종합].

## ▶ 실행 예제

- `/query` — Router loader × Query 캐시 비교
- `/query/prefetch` — ensureQueryData + useSuspenseQuery
- `/query/search` — Search Params ↔ queryKey
- `/query/mutation` — useMutation + invalidateQueries
