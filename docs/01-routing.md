# 01 · 라우팅 기초

> 대응 예제: `/routing`, `/routing/concepts`, `/routing/matching`, `/routing/matching/$productId`
> 예제 파일: `apps/bible/src/routes/routing*.tsx`
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
`/routing/matching/:productId` 가 된다.

## 파일을 나누는 두 가지 방식 — 점(flat) vs 폴더(directory)

위에서 본 점 표기는 **두 가지 표기법 중 하나**일 뿐이다. 같은 라우트 트리를 폴더로 표현할
수도 있고, 둘을 섞을 수도 있다. **셋 다 완전히 같은 URL과 같은 부모-자식 관계를 만든다.**

```
── 점(flat) 방식 ──────────────    ── 폴더(directory) 방식 ────────
routes/                            routes/
├── routing.tsx        → /routing  └── routing/
├── routing.index.tsx  → /routing      ├── route.tsx   → /routing  ← 레이아웃
└── routing.concepts.tsx               ├── index.tsx   → /routing
                       → /routing/concepts└── concepts.tsx → /routing/concepts
```

### 폴더 방식의 레이아웃은 `route.tsx` 다

여기가 유일하고 결정적인 함정이다. 점 방식에서 레이아웃 역할을 하던 `routing.tsx` 는
폴더 방식에서 **`routing/route.tsx`** 가 된다. `routing/routing.tsx` 가 아니다.

파일 이름 `route` 는 제너레이터가 **"이 폴더 자체를 담당하는 라우트"** 로 알아보는
예약어다(`routeToken`, 기본값 `"route"`). 이름을 잘못 지으면 레이아웃이 되기는커녕
`/routing/routing` 이라는 엉뚱한 URL이 하나 생겨 버린다. 조용히 잘못되는 종류의 실수라
더 위험하다.

마찬가지로 `index` 도 예약어다(`indexToken`, 기본값 `"index"`). 두 토큰 모두
`vite.config.ts` 의 플러그인 옵션으로 바꿀 수 있지만(`routeToken: '_layout'` 처럼),
기본값을 그대로 쓰는 편이 협업에 낫다. 둘을 같은 값으로 지정하면 에러가 난다.

### 섞어 써도 된다

```
routes/
├── mix.tsx              → /mix         (점 방식 레이아웃)
├── mix/
│   ├── index.tsx        → /mix
│   └── deep/nested.tsx  → /mix/deep/nested
```

`mix.tsx` 가 부모 레이아웃이고 `mix/` 폴더 안의 파일들이 그 자식이 된다. 얕은 곳은 점으로,
깊어지는 곳부터 폴더로 — 이런 식의 점진적 전환이 가능하다.

### 폴더 방식의 진짜 장점 — co-location

URL만 놓고 보면 두 방식은 동등하다. 그럼에도 실무 프로젝트가 대개 폴더로 수렴하는 이유는
**그 라우트에서만 쓰는 파일을 옆에 둘 수 있기** 때문이다. `-`(하이픈)으로 시작하는 파일과
폴더는 라우팅에서 제외된다.

```
routes/products/
├── route.tsx            → /products        (레이아웃)
├── index.tsx            → /products        (목록)
├── $productId.tsx       → /products/:productId
└── -components/         ← 라우트 아님. URL이 생기지 않는다
    ├── product-card.tsx
    └── filter-bar.tsx
```

점 방식에서는 `-components` 를 놓을 자리가 마땅치 않아 `src/components/` 로 빼야 한다.
라우트가 수십 개로 늘고 각 라우트마다 전용 컴포넌트가 서너 개씩 붙으면 이 차이가 크게
벌어진다.

### 그래서 어느 쪽을 쓰나

| 상황 | 권장 |
|------|------|
| 라우트 목록을 한눈에 훑고 싶다 | **점** — 파일 목록이 곧 사이트맵이다 |
| 라우트당 전용 컴포넌트·훅·쿼리가 많다 | **폴더** + `-` co-location |
| 학습·데모용 예제 모음 | **점** — 이 저장소가 이 방식을 쓴다 |
| 규모가 커지는 실무 프로젝트 | **폴더** |

이 저장소의 `apps/bible` 이 점 방식으로 통일된 것은 **43개 라우트를 한 화면에서 훑기
위해서**다. 챕터별로 `params.*`, `query.*` 처럼 접두사가 모여 보이는 편이 학습에 낫다는
판단이지, 점 방식이 더 우월해서가 아니다. 실제 프로젝트를 시작한다면 폴더 방식을 권한다.

직접 확인해 보려면 `apps/playground/src/routes/` 에 세 방식을 각각 만들고
`pnpm --filter playground build` 를 돌린 뒤 생성된 `routeTree.gen.ts` 의
`FileRoutesByFullPath` 를 열어 보면 된다. 세 방식이 같은 트리를 만드는 것을 눈으로 볼 수 있다.

## 최소 예제

라우트 하나는 이렇게 단출하다.

```tsx
// apps/bible/src/routes/index.tsx
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
| Root | `__root.tsx` | (전체) | 모든 라우트의 최상위 부모. 공통 레이아웃/컨텍스트를 정의 |
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
// apps/bible/src/routes/routing.tsx (발췌)
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

### 매칭 우선순위 — 파일을 쓴 순서는 상관없다

여기가 중요하다. **라우트를 어떤 순서로 정의했든 라우터가 알아서 정렬한다.** React Router의
옛 버전처럼 "위에 쓴 게 먼저 매칭된다" 같은 규칙이 없다. 정렬 기준은 **구체적인 것부터**이며,
순서는 다음 네 단계로 고정되어 있다.

| 순위 | 종류 | 예 |
|:---:|------|-----|
| 1 | **Index 라우트** | `posts.index.tsx` → `/posts` |
| 2 | **정적 라우트** (세그먼트가 많을수록 먼저) | `posts.new.tsx` → `/posts/new` |
| 3 | **동적 라우트** (경로가 길수록 먼저) | `posts.$postId.tsx` → `/posts/:postId` |
| 4 | **Splat 라우트** | `posts.$.tsx` → `/posts/*` |

라우터는 정렬된 트리를 훑다가 **처음 매칭되는 곳에서 멈춘다.**

```
/posts/new  →  ① posts.index    ✕ (index 는 /posts 에만)
               ② posts.new      ✓ 여기서 멈춘다
                  posts.$postId   (도달하지 않음)
```

이 규칙 덕분에 `/posts/new`(정적)와 `/posts/$postId`(동적)를 함께 둬도 `new` 가 postId로
잘못 해석되는 일이 없다. **정적이 항상 동적을 이긴다.** 정적끼리는 세그먼트가 많은 쪽
(`about/us`)이 적은 쪽(`about`)보다 먼저다.

> 이 자동 정렬을 무시하고 직접 개입하고 싶다면 `params.priority` 를 쓴다(03장). 다만
> 실제로 필요한 경우는 드물다.

```tsx
// apps/bible/src/routes/routing.matching.$productId.tsx (발췌)
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

한 번에 외우려 하지 말고, 표를 옆에 두고 필요할 때 찾아보면 된다. **이 표가 파일기반
라우팅 규칙의 전부다.**

| 표기 | 의미 | URL에 나타나나 | 예 |
|------|------|:---:|-----|
| `.` | 경로 구분자 (`a.b` → `/a/b`) | — | `params.search.tsx` → `/params/search` |
| `index` | 부모 경로 **자체**에 매칭 | ✕ | `posts.index.tsx` → `/posts` |
| `route` | **폴더 자체**를 담당하는 라우트(=레이아웃) | ✕ | `posts/route.tsx` → `/posts` |
| `__root` | 모든 라우트의 최상위 부모. 파일 하나만 존재 | ✕ | `__root.tsx` |
| `$param` | 동적 세그먼트 → `params.param` | ✓ | `$postId.tsx` → `/:postId` |
| `{-$param}` | **선택적** 동적 세그먼트 (없으면 `undefined`) | 선택 | `{-$category}.tsx` → `/posts` · `/posts/tech` |
| `$` (단독) | splat / catch-all (남은 경로 전부) → `params._splat` | ✓ | `docs.$.tsx` → `/docs/*` |
| `pre-{$param}` | prefix — 세그먼트 앞부분은 고정 | ✓ | `post-{$id}.tsx` → `/post-123` |
| `{$param}.ext` | suffix — 세그먼트 뒷부분은 고정 | ✓ | `{$name}.txt` → `/doc.txt` |
| `_layout` (**앞** 밑줄) | pathless 레이아웃 — 감싸되 URL엔 안 붙음 | ✕ | `_auth.tsx` + `_auth.me.tsx` → `/me` |
| `layout_` (**뒤** 밑줄) | un-nesting — URL은 유지하되 부모 레이아웃에서 **탈출** | ✓ | `posts_.$id.tsx` → `/posts/:id` (posts 레이아웃 없이) |
| `(group)` | 괄호 폴더/세그먼트 — 이름이 URL에서 **삭제**됨 | ✕ | `(marketing)/about.tsx` → `/about` |
| `-file`, `-folder` (앞 하이픈) | 라우팅에서 제외 (co-location용) | ✕ | `-components/card.tsx` |
| `.lazy` | 컴포넌트를 분리 번들로 — 09장 참조 | — | `posts.lazy.tsx` |

### 앞 밑줄과 뒤 밑줄은 정반대다

혼동하기 쉬워서 따로 떼어 설명한다. 둘 다 밑줄이지만 **하는 일이 반대**다.

```
_auth.tsx + _auth.dashboard.tsx      → URL: /dashboard
                                       레이아웃: _auth 가 감싼다      ← URL만 숨김

posts.tsx + posts_.$postId.tsx       → URL: /posts/:postId
                                       레이아웃: posts 가 안 감싼다   ← 레이아웃만 탈출
```

- **앞 밑줄(`_auth`)**: "레이아웃은 공유하고 싶은데 URL에 한 단계 늘리긴 싫다."
  인증 가드를 여러 라우트에 한 번에 걸 때 쓴다(06장).
- **뒤 밑줄(`posts_`)**: "URL 구조는 `/posts/:id` 로 두고 싶은데, 목록 화면의 사이드바
  레이아웃까지 상속받긴 싫다." 상세 페이지를 전체 화면으로 띄울 때 쓴다.

### 괄호 그룹 `(group)` 은 순수하게 정리용이다

```
routes/
├── (marketing)/
│   ├── about.tsx      → /about
│   └── pricing.tsx    → /pricing
└── (app)/
    └── dashboard.tsx  → /dashboard
```

괄호 안 이름은 URL에 **전혀 나타나지 않고**, 레이아웃도 만들지 않는다. 파일을 주제별로
묶어 두기만 하는 장치다. 레이아웃까지 공유하고 싶다면 괄호가 아니라 앞 밑줄
(`_marketing.tsx`)을 써야 한다. 이 둘을 헷갈리면 "왜 레이아웃이 안 걸리지?" 로 시간을
쓰게 된다.

### 토큰은 바꿀 수 있다

`index` 와 `route` 라는 이름 자체를 바꾸고 싶다면 플러그인 옵션으로 가능하다.

```ts
TanStackRouterVite({
  target: 'react',
  indexToken: 'index',   // 기본값
  routeToken: 'route',   // 기본값 — '_layout' 등으로 변경 가능
})
```

둘을 **같은 값으로 지정하면 에러**가 난다(`The "indexToken" and "routeToken" options must be
different.`). 특별한 이유가 없다면 기본값을 유지하는 편이 좋다 — 남이 읽을 때 표준 규칙이
통하지 않게 되기 때문이다.

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
