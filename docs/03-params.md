# 03 · 파라미터 (Path · Search)

> 대응 예제: `/params`, `/params/path`, `/params/path/$userId`, `/params/search`,
> `/params/serialization`
> 예제 파일: `apps/bible/src/routes/params*.tsx`
> 📖 공식: [path-params](https://tanstack.com/router/latest/docs/framework/react/guide/path-params) ·
> [search-params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params) ·
> [custom-search-param-serialization](https://tanstack.com/router/latest/docs/framework/react/guide/custom-search-param-serialization)

Chapter 02에서 "화면 사이를 오가는 법"을 배웠다면, 이번엔 그 이동에 **값을 실어 보내는 법**이다.
URL에는 두 종류의 변수가 있다 — 경로 조각인 **Path Params** 와 `?` 뒤의 **Search Params**.
TanStack Router의 진짜 강점은 이 둘을 문자열이 아니라 **검증된 타입 값**으로 다룬다는 데 있다.

## 한 줄 정의 & 언제 쓰나

- **Path Params** (`/users/$id`) — "무엇을" 보는지, 즉 리소스를 특정한다. 보통 필수다.
- **Search Params** (`?page=2&sort=asc`) — "어떻게" 보는지, 즉 정렬·필터·페이지 같은 표현 상태.
  보통 선택적이다.

기준은 간단하다. **리소스 식별이면 Path, 그 리소스를 보는 방식이면 Search.**

## Path Params

### 최소 예제 & 타입 변환

파일명에 `$` 를 붙이면 그 세그먼트가 params 가 된다. 기본 타입은 `string` 이지만,
`params.parse` 를 주면 원하는 타입으로 바꿀 수 있다.

```tsx
// params.path.$userId.tsx → /params/path/:userId
export const Route = createFileRoute('/params/path/$userId')({
  // 원시 string → number 로 변환
  params: {
    parse: (raw) => ({ userId: Number(raw.userId) }),
    stringify: (p) => ({ userId: String(p.userId) }),
  },
  loader: ({ params }) => getUser(params.userId),   // params.userId 는 number
  component: UserDetail,
})

function UserDetail() {
  const { userId } = Route.useParams()   // number, 타입 추론됨
  const user = Route.useLoaderData()
}
```

- `parse` 는 URL → 앱, `stringify` 는 앱 → URL 방향의 변환이다. 둘은 짝이다.
- `Link` 도 이 타입을 따른다: `<Link to="/params/path/$userId" params={{ userId: 7 }} />`
  (여기서 `userId` 는 number).

→ 실행: `/params/path` 에서 `user #7` 을 눌러 보라. 상세에 `params.userId = 7 (number)` 로
나온다 — parse 가 string "7" 을 number 7 로 바꿨다.

### 옵션·변형 (다양한 결과)

- **여러 params**: 파일을 중첩해 `posts.$postId.tsx` 처럼 두면 `params.postId` 가 추가된다.
- **parse 없이**: `params.parse` 를 생략하면 값은 그대로 `string` 이다(가장 흔함).
- **loader/beforeLoad 에서**: 두 훅 모두 `({ params }) => …` 로 같은 값을 받는다.

### Path Param 문법 총정리

`$param` 하나만 있는 게 아니다. **다섯 가지 문법**이 있고, 조합도 된다.

| 문법 | 이름 | 매칭 예 | `useParams()` 결과 |
|------|------|---------|---------------------|
| `$postId` | 필수(required) | `/posts/123` | `{ postId: '123' }` |
| `{-$category}` | **선택(optional)** | `/posts` 또는 `/posts/tech` | `{ category: undefined \| 'tech' }` |
| `$` | splat / wildcard | `/docs/a/b/c` | `{ _splat: 'a/b/c' }` |
| `post-{$postId}` | **prefix** | `/posts/post-123` | `{ postId: '123' }` |
| `{$fileName}.txt` | **suffix** | `/files/doc.txt` | `{ fileName: 'doc' }` |

### 선택적 Path Param — `{-$param}`

**하나의 라우트로 "있을 때와 없을 때"를 모두 처리한다.** 없으면 값이 `undefined` 다.

```tsx
// /posts 와 /posts/tech 둘 다 이 라우트가 받는다
export const Route = createFileRoute('/posts/{-$category}')({
  loader: ({ params }) => fetchPosts({ category: params.category }),  // undefined 가능
  component: Posts,
})

function Posts() {
  const { category } = Route.useParams()
  return <h1>{category ? `${category} 글 목록` : '전체 글 목록'}</h1>
}
```

여러 개를 이어 붙일 수도 있고, 필수와 섞을 수도 있다.

```tsx
// /posts · /posts/tech · /posts/tech/hello 전부 매칭
createFileRoute('/posts/{-$category}/{-$slug}')

// /users/123 · /users/123/settings 매칭 (id 는 필수, tab 은 선택)
createFileRoute('/users/$id/{-$tab}')
```

**이동할 때는 `undefined` 를 넘겨 생략한다.**

```tsx
<Link to="/posts/{-$category}" params={{ category: 'tech' }}>기술 글</Link>
<Link to="/posts/{-$category}" params={{ category: undefined }}>전체 글</Link>
```

이 문법이 가장 빛나는 곳이 **다국어 URL**이다. `/{-$locale}/about` 하나로 `/about`,
`/en/about`, `/ko/about` 을 전부 처리한다 — 자세한 내용은 19장에서 다룬다.

### Prefix · Suffix — 세그먼트 일부만 변수로

세그먼트 전체가 아니라 **일부만** 변수로 잡는다. 중괄호로 감싼 부분이 변수다.

```tsx
createFileRoute('/posts/post-{$postId}')        // /posts/post-123  → postId: '123'
createFileRoute('/files/{$fileName}.txt')       // /files/doc.txt   → fileName: 'doc'
createFileRoute('/users/user-{$userId}.json')   // /users/user-1.json → userId: '1'
```

선택적 param과도 조합된다.

```tsx
createFileRoute('/files/prefix{-$name}.txt')    // /files/prefix.txt · /files/prefixdoc.txt
```

파일 확장자를 URL에 노출하는 API 스타일 경로나, `post-`, `user-` 같은 접두사를 쓰는
레거시 URL 구조를 그대로 옮길 때 쓴다.

### Splat — 남은 경로 전부 (`_splat`)

```tsx
// /docs/guides/getting-started 처럼 몇 단계든 받는다
export const Route = createFileRoute('/docs/$')({
  component: () => {
    const { _splat } = Route.useParams()   // 'guides/getting-started'
    return <div>{_splat}</div>
  },
})
```

**변수 이름이 `_splat` 으로 고정**이라는 점을 기억한다. splat도 prefix/suffix와 조합된다.

```tsx
createFileRoute('/files/{$}.txt')          // /files/a/b.txt → _splat: 'a/b'
createFileRoute('/docs/{-$version}/$')     // /docs/v2/a/b   → version: 'v2', _splat: 'a/b'
```

### `params.priority` — 매칭 후보가 겹칠 때

`params.parse` 가 **`false` 를 반환하면 "이 라우트는 아니다"** 라는 뜻이 되어, 라우터가
다음 후보로 넘어간다. `priority` 는 어느 후보를 먼저 시도할지 정한다(기본 `0`, 클수록 먼저).

```tsx
// 숫자 id 전용 라우트 — 숫자가 아니면 매칭을 포기한다
export const Route = createFileRoute('/posts/$postId')({
  params: {
    priority: 10,                       // 다른 후보보다 먼저 시도
    parse: ({ postId }) => {
      if (!/^\d+$/.test(postId)) return false   // ← 매칭 포기, 다음 후보로
      return { postId: Number(postId) }
    },
    stringify: ({ postId }) => ({ postId: String(postId) }),
  },
})
```

`/posts/123` 은 이 라우트가, `/posts/hello-world` 는 slug를 받는 다른 라우트가 처리하도록
갈라놓는 식으로 쓴다.

### `pathParamsAllowedCharacters` — 이스케이프 예외

path param 값은 기본적으로 `encodeURIComponent` 로 인코딩된다. 그래서 이메일 주소 같은
값을 넣으면 `@` 가 `%40` 이 되어 URL이 지저분해진다. 특정 문자를 그대로 두려면 라우터
옵션에 등록한다.

```tsx
createRouter({ routeTree, pathParamsAllowedCharacters: ['@', '+'] })
```

지정 가능한 문자는 여덟 개다: `;` `:` `@` `&` `=` `+` `$` `,`

### 라우트 밖에서 params 읽기

```tsx
import { useParams } from '@tanstack/react-router'

// 특정 라우트를 지정 — 타입이 정확하다 (권장)
const { postId } = useParams({ from: '/posts/$postId' })

// 어느 라우트인지 모를 때 — 전부 optional 이 된다
const { postId } = useParams({ strict: false })
```

## Search Params — 1급 검증/타입

Search 는 이 라우터의 간판 기능이다. `validateSearch` 에 **"검증 후 값을 돌려주는 함수"** 를
주면, 그 반환 타입이 `useSearch` · `Link` · `loader` 까지 그대로 흐른다.

```tsx
import { z } from 'zod'

const searchSchema = z.object({
  q: z.string().catch(''),
  page: z.coerce.number().int().min(1).catch(1),
  sort: z.enum(['asc', 'desc']).catch('asc'),
})

export const Route = createFileRoute('/params/search')({
  validateSearch: (search) => searchSchema.parse(search),
  component: SearchParams,
})

function SearchParams() {
  const { q, page, sort } = Route.useSearch()   // 전부 타입 추론됨
  const navigate = Route.useNavigate()

  // 이전 값 기준으로 갱신
  navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
}
```

- `z.coerce.number()` — URL 값은 근본이 문자열이라, 숫자로 강제 변환해 두면 안전하다.
- `.catch(기본값)` — 잘못된/빈 값이 와도 **던지지 않고** 기본값으로 떨어진다. 사용자가 주소창에
  `?page=abc` 를 넣어도 앱이 깨지지 않는다. (이게 "1급"의 실전 이점이다.)
- 값은 컴포넌트 state 가 아니라 **URL에 산다.** 새로고침·링크 공유 후에도 보존된다.

→ 실행: `/params/search` 에서 q·page·sort 를 바꾸며 주소창을 지켜보라.

### 옵션·변형 — 같은 검증, 다른 방법

`validateSearch` 는 함수이기만 하면 되므로 검증 도구는 자유다. 결과 타입은 모두 동일하다.

```tsx
// A. 직접(manual) — 라이브러리 없이
validateSearch: (search: Record<string, unknown>) => ({
  q: typeof search.q === 'string' ? search.q : '',
  page: Number(search.page) >= 1 ? Number(search.page) : 1,
  sort: search.sort === 'desc' ? 'desc' : 'asc',
})

// B. valibot (pnpm add valibot)
import * as v from 'valibot'
const schema = v.object({
  q: v.optional(v.string(), ''),
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  sort: v.optional(v.picklist(['asc', 'desc']), 'asc'),
})
validateSearch: (search) => v.parse(schema, search)
```

## 커스텀 직렬화 (Custom Serialization)

Search 값은 문자열만이 아니다. **배열과 중첩 객체**도 1급으로 담을 수 있고, URL로의 직렬화는
라우터가 기본으로 처리한다.

```tsx
const schema = z.object({
  tags: z.array(z.string()).catch([]),
  filters: z.object({
    inStock: z.boolean().catch(false),
    min: z.coerce.number().catch(0),
  }).catch({ inStock: false, min: 0 }),
})

navigate({ search: (prev) => ({ ...prev, tags: [...prev.tags, 'react'] }) })
// URL:  ?tags=["react"]&filters={"inStock":false,"min":0}  (URL-인코딩되어 실림)
```

URL 모양 자체를 바꾸고 싶으면 `createRouter` 에서 직렬화기를 교체한다(앱 전역):

```tsx
import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  parseSearch: parseSearchWith((v) => JSON.parse(decodeFromBinary(v))),
  stringifySearch: stringifySearchWith((v) => encodeToBinary(JSON.stringify(v))),
})
```

→ 실행: `/params/serialization` 에서 tags·filters 를 바꾸며 맨 밑의 실제 URL 문자열이 어떻게
인코딩되는지 확인.

## 흔한 실수 / 함정

- **Search 를 useState 로 관리.** 필터/정렬을 컴포넌트 state 로 두면 새로고침·공유에서 사라진다.
  URL(Search)로 올리면 공짜로 지속성과 공유 가능성을 얻는다.
- **검증에서 그냥 throw.** `.parse` 가 던지면 에러 화면이 뜬다. 사용자 입력이 닿는 값은
  `.catch()`(zod) 같은 폴백으로 감싸 앱이 죽지 않게 한다.
- **문자열 가정.** `?page=2` 를 `page` 로 받을 때 문자열 `'2'` 로 오해하기 쉽다. 스키마에서
  `z.coerce.number()` 로 명시하면 숫자가 보장된다.
- **params.parse 짝 안 맞춤.** `parse` 만 두고 `stringify` 를 빠뜨리면 Link 로 되돌릴 때
  타입이 어긋난다. 둘은 항상 짝으로.

## 🔗 시너지

- Search 갱신 방식(updater) → [Chapter 02 useNavigate] 에서 이미 맛봤다. 여기서 검증으로 완성.
- Path/Search + `loader` → [Chapter 04 Data Loading] 에서 `loaderDeps` 로 연결된다(search 가
  바뀌면 다시 로드).
- 검증 실패 → [Chapter 06 Not Found / Errors] 의 에러 처리와 이어진다.
- 스키마 타입이 앱 전체로 흐르는 원리 → [Chapter 05 Type Safety].

## ▶ 실행 예제

- `/params` — Path vs Search 비교표
- `/params/path`, `/params/path/$userId` — Path Params · params.parse(number)
- `/params/search` — zod 검증 · useSearch · updater · manual/valibot 변형
- `/params/serialization` — 배열·객체 Search · 직렬화된 URL 관찰 · 커스텀 직렬화
