# 08 · 시너지 종합 — 미니 카탈로그

> 대응 예제: `/kitchen-sink`, `/kitchen-sink/login`, `/kitchen-sink/$productId`
> 예제 파일: `apps/bible/src/routes/kitchen-sink*.tsx`, `apps/bible/src/lib/queries.ts`
> 📖 공식: [examples/kitchen-sink](https://tanstack.com/router/latest/docs/framework/react/examples/kitchen-sink-react-query-file-based)

마지막 Chapter는 새 API를 배우지 않는다. 대신 **앞의 기능들을 하나의 흐름에 합쳐** 각 조각이
어떻게 맞물리는지 본다. 로그인 → 검색/필터 → 상세로 이어지는 작은 카탈로그 앱이다.

## 무엇이 합쳐지나

| 기능 | 어디서 왔나 | 이 앱에서의 역할 |
|------|-------------|------------------|
| pathless 가드 `_app` | Chapter 06 | 카탈로그·상세를 한 번에 보호 |
| `context.queryClient` | Chapter 05 | loader 프리페치의 통로 |
| 검증된 Search(`q`, `category`) | Chapter 03 | 필터 상태를 URL에 |
| `loaderDeps` + 프리페치 | Chapter 04 | search 바뀌면 다시 로드 |
| `queryKey` = search/param | Chapter 07 | 조합별 캐시 · 즉시 렌더 |
| Path Param + `notFound()` | Chapter 03·06 | 없는 상품 처리 |

## 흐름 따라가기

### 1) 보호 — pathless 레이아웃 하나로

```tsx
// kitchen-sink._app.tsx — 이 아래 전부 자동 보호
export const Route = createFileRoute('/kitchen-sink/_app')({
  beforeLoad: ({ location }) => {
    if (!auth.isAuthenticated()) {
      throw redirect({ to: '/kitchen-sink/login', search: { redirect: location.href } })
    }
  },
  component: () => <Outlet />,
})
```

로그아웃 상태로 `/kitchen-sink` 에 가면 로그인으로 튕기고, 로그인하면 원래 위치로 돌아온다.

### 2) 카탈로그 — search → loader 프리페치 → 캐시

```tsx
// kitchen-sink._app.index.tsx  → /kitchen-sink
export const Route = createFileRoute('/kitchen-sink/_app/')({
  validateSearch: (s) => searchSchema.parse(s),               // { q, category } (03)
  loaderDeps: ({ search }) => ({ q: search.q, category: search.category }),  // (04)
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(catalogQuery(deps)),  // (05·07)
})

function Catalog() {
  const { q, category } = Route.useSearch()
  const { data } = useSuspenseQuery(catalogQuery({ q, category }))  // 즉시 (07)
  // 검색 입력·카테고리 버튼 → navigate({ search }) 로 URL 갱신 (02·03)
}
```

검색어·카테고리가 URL에 살아 있어(03) 새로고침·공유에도 유지되고, 그 값이 곧 queryKey 라(07)
본 조합은 캐시로 즉시 열린다.

### 3) 상세 — Path Param → 프리페치 → notFound

```tsx
// kitchen-sink._app.$productId.tsx  → /kitchen-sink/$productId
export const Route = createFileRoute('/kitchen-sink/_app/$productId')({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.productId))
    if (!product) throw notFound()      // 없으면 notFoundComponent (06)
  },
  notFoundComponent: () => <p>이 상품을 찾을 수 없습니다</p>,
  component: Detail,
})
```

→ 실행: `/kitchen-sink` 에서 상품을 눌러 상세로, 상세의 "없는 상품(#999)" 버튼으로 notFound 를
확인하라.

## 여기서 배우는 것

- **각 기능은 독립적이지만, 진짜 앱에서는 늘 함께 온다.** 가드 없는 카탈로그, 캐시 없는 검색,
  검증 없는 필터는 반쪽이다.
- **URL이 상태의 단일 출처.** 필터도, 선택한 상품도 전부 URL에 있으니 새로고침·공유·뒤로가기가
  공짜로 맞아떨어진다.
- **loader와 Query의 분업.** loader 는 "진입 전에 막고 프리페치", Query 는 "캐시·재검증·공유".
  접점은 하나의 queryClient.

## 흔한 실수 / 함정

- **queryFn 이 undefined 반환.** React Query 는 undefined 를 금지한다. 없으면 `null` 을 돌려주고
  loader 에서 `notFound()` 로 처리한다(이 예제의 `productQuery` 가 그렇게 한다).
- **가드를 라우트마다 중복.** 보호할 라우트가 여럿이면 pathless 레이아웃 하나로 묶는다.
- **search 를 loaderDeps 에 안 넣음.** 필터를 바꿔도 목록이 그대로면 여기를 의심(04).

## 🔗 시너지 (전체 지도)

이 Chapter가 곧 지도다: [01 라우팅] 위에 [02 내비] · [03 파라미터] · [04 데이터] · [05 타입/컨텍스트]
· [06 인증/에러] · [07 Query] 가 층층이 얹혀 하나의 앱이 된다.

## ▶ 실행 예제

- `/kitchen-sink` — 보호된 카탈로그(검색·필터)
- `/kitchen-sink/login` — 가드 리다이렉트 대상
- `/kitchen-sink/$productId` — 상세 · notFound
