# 01 · 라우팅 기초

> 대응 예제: `/routing`, `/routing/concepts`, `/routing/matching`, `/routing/matching/$productId`
> 예제 파일: `app/src/routes/routing*.tsx`
> 📖 공식: [routing-concepts](https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts) ·
> [route-trees](https://tanstack.com/router/latest/docs/framework/react/routing/route-trees) ·
> [route-matching](https://tanstack.com/router/latest/docs/framework/react/routing/route-matching) ·
> [file-naming-conventions](https://tanstack.com/router/latest/docs/framework/react/routing/file-naming-conventions)

이 Chapter에서 익힐 것은 **"파일을 어디에 어떤 이름으로 두면 어떤 URL이 되는가"** 하나로
모인다. 이 규칙만 손에 익으면 이후 Chapter(데이터 로딩, 인증, Query)은 전부 이 위에 얹히는
얘기라 훨씬 수월해진다.

## 한 줄 정의 & 언제 쓰나

파일기반 라우팅에서는 **파일 구조가 곧 URL 구조**다. `src/routes/**` 안의 파일 이름을
플러그인이 읽어 `routeTree.gen.ts`(라우트 트리)로 바꿔 준다. 그래서 우리는 "라우트를 등록하는
코드"를 따로 쓰지 않고, **파일을 만들고 이름 짓는 것만으로** 라우팅을 설계한다.

비유하자면 폴더 트리가 그대로 사이트맵이 되는 셈이다. 파일을 옮기면 URL이 옮겨지고, 이름을
바꾸면 경로가 바뀐다.

## 라우트 트리는 파일 구조가 곧 URL

이 저장소의 실제 파일들이 어떤 URL로 변환되는지 나란히 보자. 왼쪽이 파일, 오른쪽이 결과 URL이다.

```
src/routes/
├── __root.tsx            → 모든 라우트의 최상위 (공통 레이아웃/컨텍스트)
├── index.tsx             → /
├── routing.tsx           → /routing        (레이아웃: <Outlet/> 보유)
├── routing.index.tsx     → /routing        (index 자식)
├── routing.concepts.tsx  → /routing/concepts
├── routing.matching.tsx  → /routing/matching   (또 다른 레이아웃)
├── routing.matching.index.tsx      → /routing/matching
└── routing.matching.$productId.tsx → /routing/matching/:productId
```

가장 먼저 눈에 익혀야 할 규칙은 이것 하나다. **파일명의 `.`(점)은 경로 구분자(`/`)로
읽힌다.** 그래서 `routing.matching.$productId.tsx` 는 점을 슬래시로 바꿔 읽으면
`/routing/matching/:productId` 가 된다. (폴더로 나눠 `routing/matching/$productId.tsx` 처럼
써도 결과는 같다. 파일 수가 많아지면 폴더 방식이 보기 편하다.)

## 최소 예제

라우트 하나는 이렇게 단출하다.

```tsx
// app/src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <h1>Home</h1>,
})
```

여기서 `createFileRoute('/')` 안의 경로 문자열('/')은 사실 **플러그인이 파일 위치를 보고
채워 준다.** 우리가 직접 맞출 필요가 없고, 혹시 파일 위치와 어긋나면 타입 에러로 바로 잡아
준다. 즉 "파일을 옳은 곳에 두는 것"만 신경 쓰면 된다.

## 라우트 종류

같은 파일기반 규칙 안에서, 이름 형태만 조금씩 다르게 하면 성격이 다른 라우트가 만들어진다.
전체 지형을 먼저 표로 훑자. (각 항목의 실전 예제는 뒤 Chapter에서 다시 만난다.)

| 종류 | 파일 예 | URL | 설명 |
|------|---------|-----|------|
| Root | `__root.tsx` | (전체) | 모든 라우트의 조상. 공통 레이아웃/컨텍스트를 정의 |
| Index | `x.index.tsx` | `/x` | 부모 경로와 **정확히** 일치할 때만 렌더 |
| Static | `about.tsx` | `/about` | 고정 경로 |
| Layout | `x.tsx`(+자식) | `/x/*` | `Outlet` 으로 자식을 감싸는 공유 레이아웃 |
| Dynamic | `posts.$id.tsx` | `/posts/:id` | `params.id` 로 값 접근 (Chapter 03) |
| Pathless Layout | `_auth.tsx` | (URL 없음) | URL엔 안 붙지만 레이아웃/`beforeLoad` 만 공유 (Chapter 06) |
| Splat | `$.tsx` | `/*` | 남은 경로 전부 매칭 (404 등) |

→ 실행: `/routing/concepts` 가 이 표를 카드/테이블로 보여준다.

가장 헷갈리기 쉬운 짝은 **Layout 과 Index** 다. 바로 아래에서 이 둘을 갈라서 본다.

## Layout 라우트와 Outlet

레이아웃 라우트는 **자체 경로 + `<Outlet/>`** 을 함께 가진 라우트다. `Outlet` 은 "자식 라우트가
그려질 빈 자리"를 뜻한다. 핵심은 레이아웃이 **중첩**된다는 것이다. 이 앱에서도
`__root`(사이드바) → `routing`(헤더+서브탭) → `routing.matching`(링크들) → 리프 순으로 겹겹이
쌓인다. 위쪽 레이아웃은 자식이 바뀌어도 **그대로 유지되고**, `Outlet` 안쪽만 갈아 끼워진다.

```tsx
// app/src/routes/routing.tsx (발췌)
export const Route = createFileRoute('/routing')({ component: RoutingLayout })

function RoutingLayout() {
  return (
    <div>
      {/* 이 서브탭은 자식 경로를 오가도 유지된다 */}
      <Link to="/routing/concepts">라우트 종류</Link>
      <Outlet />   {/* 여기에 routing.index / concepts / matching 이 번갈아 렌더 */}
    </div>
  )
}
```

→ 실행: `/routing` 에서 서브탭을 눌러 보라. **헤더와 탭은 그대로인데 아래 카드 내용만** 바뀐다.
이게 바로 레이아웃 공유 + Outlet 교체의 동작이다.

## 동적 세그먼트 & 매칭

URL 중간에 "변하는 값"을 넣고 싶을 때 동적 세그먼트를 쓴다. 파일명에 `$` 를 붙이면 그 조각이
변수가 된다. `$productId` 세그먼트는 컴포넌트에서 `params.productId`(타입은 `string`으로 자동
추론) 로 꺼내 쓸 수 있다.

라우터가 URL을 고를 때는 **더 구체적인 것을 먼저** 본다. 예컨대 `/routing/matching`(정확히
그 경로)과 `/routing/matching/123`(동적 자식)이 있으면, 각각에 맞는 라우트가 정확히 갈린다.

```tsx
// app/src/routes/routing.matching.$productId.tsx (발췌)
export const Route = createFileRoute('/routing/matching/$productId')({
  loader: ({ params }) => getProduct(params.productId), // 진입 전에 데이터 미리 로드 (Chapter 04 맛보기)
  component: ProductDetail,
})

function ProductDetail() {
  const { productId } = Route.useParams()      // 이 라우트 전용, 타입 추론됨
  const product = Route.useLoaderData()          // 위 loader 가 돌려준 값
  // ...
}
```

`Route.useParams()` 와 `Route.useLoaderData()` 는 **"이 라우트에 한정된"** 값을 타입과 함께
돌려준다. 다른 라우트의 params를 잘못 참조할 일이 없다.

→ 실행: `/routing/matching` 에서 `#1` / `#2` / `#999` 링크를 눌러 보라. `#999` 는 라우트 자체는
매칭되지만 해당 데이터가 없다. "경로는 맞았는데 데이터가 없다"는 이 상황을 깔끔히 처리하는
법이 바로 Chapter 06의 Not Found 다.

## 옵션·변형 (다양한 결과)

같은 규칙 안에서 파일을 조금씩 바꾸면 결과가 이렇게 달라진다. 직접 상상하며 읽으면 규칙이
더 또렷해진다.

- `routing.tsx`(레이아웃) 없이 `routing.concepts.tsx` 만 두면 → `/routing/concepts` 는 되지만
  공유 헤더·서브탭이 없다. (레이아웃이 없으니 감쌀 껍데기가 없다.)
- `routing.index.tsx` 를 지우면 → `/routing` 을 직접 방문했을 때 `Outlet` 에 채울 자식이 없어
  빈 자리만 남는다.
- 폴더 방식 `routing/concepts.tsx` 로 바꿔도 URL은 동일하다 → 취향과 규모에 따라 고르면 된다.
- `$productId`(단일 세그먼트) 를 `$.tsx`(splat) 로 바꾸면
  `/routing/matching/무엇이든/여러/단계` 처럼 뒤에 남는 경로 전부를 흡수한다.

## 네이밍 규칙 정리

한 번에 외우려 하지 말고, 표를 옆에 두고 필요할 때 찾아보면 된다.

| 표기 | 의미 |
|------|------|
| `.` | 경로 구분자 (`a.b` → `/a/b`) |
| `index` | 부모 경로 자체에 매칭 |
| `$param` | 동적 세그먼트 → `params.param` |
| `$` (단독) | splat / catch-all (남은 경로 전부) |
| `_layout` (앞 밑줄) | pathless 레이아웃 (URL에는 안 붙음) |
| `-file` (앞 하이픈) | 라우트에서 제외되는 파일 (컴포넌트/유틸 보관용) |

## 흔한 실수 / 함정

- **Layout 과 Index 혼동.** `routing.tsx` 는 **레이아웃**이라 자식이 있으면 항상 함께 렌더되고,
  `routing.index.tsx` 는 `/routing` 에 **정확히** 왔을 때만 렌더된다. 역할이 다르다.
- **동적 파일에서 `$` 누락.** `productId.tsx`(점·달러 없이)로 쓰면 그냥 정적 경로
  `/routing/matching/productId` 가 되어 버린다. 값이 안 들어온다면 여기부터 의심한다.
- **레이아웃에 `<Outlet/>` 빠뜨림.** 매칭은 되는데 화면에 자식이 안 보인다면, 십중팔구
  레이아웃에서 `Outlet` 을 안 넣은 것이다.

## 🔗 시너지

라우팅 기초는 뒤 Chapter 전부의 바닥이다. 어디로 이어지는지 미리 표시해 둔다.

- 동적 세그먼트 + `loader` → [Chapter 04 Data Loading].
- Pathless Layout(`_auth.tsx`) + `beforeLoad` + context → [Chapter 06 Authenticated Routes].
- Splat + `notFound()` → [Chapter 06 Not Found Errors].
- 레이아웃의 서브탭 `<Link>` 와 active 표시 → [Chapter 02 Navigation].

## ▶ 실행 예제

- `/routing` — 개념·트리·Outlet 개요
- `/routing/concepts` — 라우트 종류 비교표(테이블)
- `/routing/matching`, `/routing/matching/$productId` — 매칭 & 동적 세그먼트
