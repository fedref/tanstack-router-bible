# 13 · Search 미들웨어 & 직렬화

> 대응 예제: `/search-mw` · `/params/search` · `/params/serialization`
> 예제 파일: `apps/bible/src/routes/params.search.tsx`, `apps/bible/src/routes/params.serialization.tsx`
> 📖 공식: [search-params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params) ·
> [custom-search-param-serialization](https://tanstack.com/router/latest/docs/framework/react/guide/custom-search-param-serialization)

## 한 줄 정의 & 언제 쓰나

03장이 "search를 **검증**하는 법"이었다면, 이 장은 **"search를 이동할 때마다 자동으로
가공하는 법"** 이다.

`validateSearch` 는 들어온 값을 검사할 뿐, **이동할 때 무엇을 남기고 무엇을 버릴지**는
관여하지 않는다. 그래서 이런 문제가 생긴다:

```
/products?category=shoes&sort=price&page=3
   ↓ 사용자가 상세 페이지로 이동
/products/abc123                              ← 필터가 전부 사라진다
   ↓ 뒤로 가기
/products                                     ← 처음부터 다시 필터링
```

search 미들웨어는 이 지점을 자동화한다. **"이 값은 이동해도 따라다녀라"**,
**"기본값이면 URL에서 지워라"** 같은 규칙을 라우트에 한 번 선언해 둔다.

## 최소 예제 — 필터 유지하기

```tsx
import { createFileRoute, retainSearchParams } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['price', 'name']).catch('name'),
  page: z.number().catch(1),
})

export const Route = createFileRoute('/products')({
  validateSearch: searchSchema,
  search: {
    middlewares: [retainSearchParams(['category', 'sort'])],
  },
})
```

이제 이 라우트 안에서 어디로 이동하든 `category` 와 `sort` 는 **자동으로 따라간다.**
`<Link to="/products/$id">` 에 search를 적어 주지 않아도 유지된다. `page` 는 목록에서만
의미 있으므로 제외했다.

## `retainSearchParams` — 값을 붙들어 두기

```tsx
retainSearchParams(['category', 'sort'])   // 지정한 키만 유지
retainSearchParams(true)                   // 현재 search 전부 유지
```

`true` 는 강력하지만 조심해야 한다. **모든 값이 모든 이동에 따라붙어** URL이 지저분해지고,
의도치 않은 곳까지 필터가 전파된다. 대개는 키를 명시하는 편이 낫다.

전형적인 사용처는 **전역 설정성 search** 다.

```tsx
// __root.tsx 또는 최상위 레이아웃
export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: z.object({
    locale: z.enum(['ko', 'en']).catch('ko'),
    debug: z.boolean().optional(),
  }),
  search: {
    middlewares: [retainSearchParams(['locale', 'debug'])],
  },
})
```

루트에 걸어 두면 `?locale=en` 이 앱 전체를 따라다닌다. 언어 설정을 URL로 관리하는 앱에서
쓰는 패턴이다.

## `stripSearchParams` — 값을 지우기

반대 방향이다. **URL을 깨끗하게 유지**한다. 입력 형태가 세 가지다.

```tsx
// ① 기본값과 같으면 지운다 (가장 많이 쓰는 형태)
stripSearchParams({ page: 1, sort: 'name' })

// ② 지정한 선택적 키를 항상 지운다
stripSearchParams(['debug', 'trace'])

// ③ 전부 지운다 (필수 search가 하나도 없을 때만 허용)
stripSearchParams(true)
```

①이 핵심이다. 기본값이 `page: 1` 인데 URL에 `?page=1` 이 붙어 있을 이유가 없다.

```tsx
export const Route = createFileRoute('/products')({
  validateSearch: searchSchema,
  search: {
    middlewares: [stripSearchParams({ page: 1, sort: 'name' })],
  },
})
```

```
/products?page=1&sort=name&category=shoes
   ↓ 미들웨어 적용
/products?category=shoes                    ← 기본값은 사라진다
```

**깊은 비교**로 판정하므로 객체나 배열도 기본값과 같으면 지워진다.

③의 `true` 는 타입 수준에서 제한된다. 필수 search 파라미터가 있는 라우트에서는 전부 지울
수 없으므로 타입 에러가 난다.

### 둘을 함께 쓰기

```tsx
search: {
  middlewares: [
    retainSearchParams(['category', 'sort']),
    stripSearchParams({ page: 1 }),
  ],
},
```

**순서대로 실행된다.** 먼저 유지할 것을 채우고, 그다음 기본값을 지운다. 순서를 뒤집으면
지운 값을 다시 채워 넣는 셈이 되어 의도대로 동작하지 않는다.

## 직접 미들웨어 만들기

`SearchMiddleware` 는 **함수 하나**다.

```ts
type SearchMiddleware<T> = (ctx: {
  search: T                      // 들어온 search
  next: (newSearch: T) => T      // 다음 미들웨어로 넘긴다
  meta?: SearchMiddlewareMeta    // 앞 미들웨어가 무엇을 지웠는지 등
}) => T
```

`next` 를 호출하는 구조가 서버 미들웨어와 같다. **먼저 가공하고 넘기거나, 넘긴 결과를
후처리하거나, 둘 다 할 수 있다.**

```tsx
// 예: 항상 소문자로 정규화하는 미들웨어
const lowercaseCategory: SearchMiddleware<{ category?: string }> = ({ search, next }) => {
  const result = next({
    ...search,
    category: search.category?.toLowerCase(),
  })
  return result
}

// 예: 결과를 후처리 — 빈 문자열을 undefined 로
const dropEmpty: SearchMiddleware<any> = ({ search, next }) => {
  const result = next(search)
  for (const key of Object.keys(result)) {
    if (result[key] === '') delete result[key]
  }
  return result
}

search: { middlewares: [lowercaseCategory, dropEmpty] }
```

`meta` 에는 앞선 미들웨어의 작업 내역이 담긴다 — `removed`(지워진 키와 값),
`defaulted`(기본값으로 채워진 키) 등. `stripSearchParams` 가 지운 값을 다른 미들웨어가
참고해야 하는 드문 경우에 쓴다.

### `preSearchFilters` / `postSearchFilters` 는 deprecated

옛 API다. 타입 정의에 이렇게 적혀 있다:

```ts
/** @deprecated Use search.middlewares instead */
preSearchFilters?: Array<SearchFilter<…>>
/** @deprecated Use search.middlewares instead */
postSearchFilters?: Array<SearchFilter<…>>
```

기존 코드에서 보이면 `search.middlewares` 로 옮긴다. 동작은 유지되지만 새로 쓰지 않는다.

## URL 직렬화 방식 바꾸기

여기부터는 **search 객체가 URL 문자열로 바뀌는 방식** 자체를 다룬다. 라우터 전역 설정이다.

### 기본 동작

```tsx
import { defaultParseSearch, defaultStringifySearch } from '@tanstack/react-router'

// 라우터가 기본으로 쓰는 함수들
defaultParseSearch('?a=1&b=hello')   // { a: 1, b: 'hello' }
defaultStringifySearch({ a: 1 })     // '?a=1'
```

기본 구현은 값에 `JSON.parse`/`JSON.stringify` 를 시도한다. 그래서 숫자·불리언·배열·객체가
자연스럽게 왕복한다.

```
{ page: 2, tags: ['a','b'] }  ⇄  ?page=2&tags=%5B%22a%22%2C%22b%22%5D
```

객체가 URL 인코딩된 JSON이 되어 **읽기 어렵다.** 이걸 바꾸고 싶을 때 아래를 쓴다.

### `parseSearchWith` / `stringifySearchWith`

파서를 갈아 끼운다. 대표적으로 **JSURL2** 같은 라이브러리로 사람이 읽을 수 있게 만든다.

```tsx
import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router'
import { parse, stringify } from 'jsurl2'

const router = createRouter({
  routeTree,
  parseSearch: parseSearchWith(parse),
  stringifySearch: stringifySearchWith(stringify, parse),
})
```

```
기본:    ?filters=%7B%22min%22%3A10%2C%22max%22%3A50%7D
JSURL2:  ?filters=(min:10,max:50)          ← 읽을 수 있다
```

`stringifySearchWith` 의 **두 번째 인자(parser)** 를 빠뜨리기 쉬운데, 이건 "이 문자열이
파싱 가능한 값인지" 판정하는 데 쓰인다. 넘기지 않으면 문자열 값이 불필요하게 인코딩될 수
있다.

Base64로 감싸는 것도 가능하다.

```tsx
parseSearch: parseSearchWith((v) => JSON.parse(atob(v))),
stringifySearch: stringifySearchWith((v) => btoa(JSON.stringify(v))),
```

다만 **URL이 사람에게 완전히 불투명**해지고 디버깅이 어려워지므로, 값을 숨기는 목적이라면
애초에 search에 두지 않는 편이 낫다.

## `createSerializationAdapter` — 커스텀 타입 직렬화

> **🚫 SSR 전용 — 실행 예제 없음.** 이 저장소는 GitHub Pages 정적 배포(CSR)라 하이드레이션
> 경계가 없어 이 기능이 동작하지 않는다. 아래는 **설명과 예시 코드**이며, TanStack Start나
> 자체 SSR을 붙일 때 그대로 쓸 수 있는 형태다.

앞의 것이 **URL 문자열**에 관한 것이었다면, 이건 **SSR 하이드레이션**에 관한 것이다.
서버의 loader가 반환한 값을 클라이언트로 넘길 때 어떻게 직렬화할지 정의한다.

### 기본으로 넘어가는 타입

```ts
number · string · boolean · null · undefined · bigint
Date · Uint8Array · RawStream
```

`Map`, `Set`, `Promise`, 중첩 객체·배열도 처리된다. 하지만 **커스텀 클래스**는 그냥
넘어가지 않는다. 서버에서 `new Money(1000, 'KRW')` 를 반환하면 클라이언트에서는 평범한
객체가 되어 메서드가 사라진다.

### 어댑터 만들기

```tsx
import { createSerializationAdapter } from '@tanstack/react-router'

class Money {
  constructor(public amount: number, public currency: string) {}
  format() { return `${this.amount.toLocaleString()} ${this.currency}` }
}

const moneyAdapter = createSerializationAdapter({
  key: 'Money',                                   // 고유 식별자
  test: (v): v is Money => v instanceof Money,    // 이 타입인지 판정
  toSerializable: (m) => ({ amount: m.amount, currency: m.currency }),
  fromSerializable: (o) => new Money(o.amount, o.currency),
})

const router = createRouter({
  routeTree,
  serializationAdapters: [moneyAdapter],
})
```

이제 loader가 `Money` 인스턴스를 반환해도 클라이언트에서 **메서드까지 살아 있는**
`Money` 로 복원된다.

**`toSerializable` 의 반환 타입은 검사된다.** 직렬화 불가능한 것(함수, JSX 등)을 반환하면
타입 에러가 나며, 에러 메시지가 이유를 알려 준다(`'Function may not be serializable'`).

### `extends` — 어댑터 조합

한 타입 안에 다른 커스텀 타입이 들어 있을 때 쓴다.

```tsx
const invoiceAdapter = createSerializationAdapter({
  key: 'Invoice',
  extends: [moneyAdapter],        // Invoice 안에 Money 가 들어간다
  test: (v): v is Invoice => v instanceof Invoice,
  toSerializable: (inv) => ({ id: inv.id, total: inv.total }),  // total 이 Money
  fromSerializable: (o) => new Invoice(o.id, o.total),
})
```

`extends` 에 등록해 두면 `toSerializable` 이 `Money` 를 반환값에 포함해도 타입 검사를
통과한다.

> 정리하면, 이 절(`createSerializationAdapter` · `serializationAdapters`)은 **SSR을 쓸
> 때만 의미가 있다.** 이 장의 나머지 — `retainSearchParams`, `stripSearchParams`,
> 커스텀 미들웨어, `parseSearchWith`/`stringifySearchWith` — 는 **전부 CSR에서 동작하며
> `/search-mw` 에 실행 예제가 있다.**

## 흔한 실수 / 함정

**1. `retainSearchParams(true)` 를 습관적으로 쓴다**
모든 값이 모든 링크에 따라붙는다. URL이 길어지고, 상세 페이지에 목록의 `page` 가 남는
등 의미 없는 값이 전파된다.

**2. 미들웨어 순서를 뒤집는다**
`stripSearchParams` 를 먼저 두고 `retainSearchParams` 를 나중에 두면, 지운 값이 다시
채워진다. 유지 → 제거 순서가 기본이다.

**3. `stripSearchParams` 의 기본값이 스키마 기본값과 다르다**
```tsx
validateSearch: z.object({ page: z.number().catch(1) }),
search: { middlewares: [stripSearchParams({ page: 0 })] },   // ❌ 1 이어야 한다
```
불일치하면 URL에서 지워지지 않거나, 지운 뒤 다른 값으로 복원되어 무한 이동이 생길 수 있다.

**4. 커스텀 미들웨어에서 `next` 를 부르지 않는다**
체인이 끊겨 뒤의 미들웨어가 실행되지 않는다. 값을 바꾸지 않더라도 `return next(search)` 는
호출해야 한다.

**5. `stringifySearchWith` 의 두 번째 인자를 빠뜨린다**
문자열 값 처리가 어긋난다. 파서를 함께 넘긴다.

**6. 직렬화 방식을 도중에 바꾼다**
사용자의 북마크나 공유된 링크가 전부 깨진다. 배포 전에 결정한다.

## 🔗 시너지

- **03장 `validateSearch`** — 검증(03) → 미들웨어(13) 순서로 실행된다. 검증이 타입을
  보장하고, 미들웨어가 그 타입 위에서 값을 가공한다.
- **02장 `<Link search>`** — 미들웨어를 걸어 두면 링크마다 search를 적을 필요가 없어진다.
  "링크에서 손으로 넘기던 것"을 "라우트에 선언"으로 옮기는 셈이다.
- **07장 Query 통합** — search가 곧 `queryKey` 인 패턴에서, `stripSearchParams` 로 URL을
  정리해도 **queryKey는 기본값이 채워진 검증 후 값**이라 캐시가 갈라지지 않는다.
- **11장 `useLocation`** — `location.searchStr` 로 직렬화된 원문을, `location.search` 로
  파싱된 객체를 볼 수 있다. 직렬화 방식을 바꿨을 때 확인하는 자리다.
- **15장 Route Masking** — URL에 무엇을 보여 줄지를 다루는 또 다른 층위다. 미들웨어가
  "값을 가공"한다면 마스킹은 "다른 URL로 위장"한다.

## ▶ 실행 예제

- `/params/search` — `validateSearch` 와 zod/manual 검증 비교
- `/params/serialization` — 배열·객체 search의 직렬화 관찰

미들웨어는 `apps/playground` 에서 실습하기 좋다. 목록·상세 라우트를 만들고
`retainSearchParams` 를 켜기 전후로 이동해 보면 차이가 즉시 보인다.

## 📖 공식 문서

- [`retainSearchParams`](https://tanstack.com/router/latest/docs/framework/react/api/router/retainSearchParamsFunction)
- [`stripSearchParams`](https://tanstack.com/router/latest/docs/framework/react/api/router/stripSearchParamsFunction)
- [Custom Search Param Serialization](https://tanstack.com/router/latest/docs/framework/react/guide/custom-search-param-serialization)
