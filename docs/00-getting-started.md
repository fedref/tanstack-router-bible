# 00 · Getting Started

> 대응 예제: `/getting-started` — 이 앱의 실제 셋업 코드를 단계별로 보여 준다
> 예제 파일: `apps/bible/vite.config.ts`, `src/main.tsx`, `src/routes/__root.tsx`
> 📖 공식: [overview](https://tanstack.com/router/latest/docs/framework/react/overview) ·
> [decisions-on-dx](https://tanstack.com/router/latest/docs/framework/react/decisions-on-dx) ·
> [installation/with-vite](https://tanstack.com/router/latest/docs/framework/react/installation/with-vite)

이 Chapter의 목표는 딱 하나다. **"왜 이 라우터를 쓰는지" 감을 잡고, 앱이 뜨는 최소 골격을
직접 세워 보는 것.** 개념을 깊게 파기 전에, 손에 잡히는 실행 환경을 먼저 만든다.

## 1. 왜 TanStack Router 인가 (언제 쓰나)

**한 줄 정의:** URL(경로와 검색 파라미터)을 **타입이 보장되는 애플리케이션 상태**로 다루는,
100% 타입 추론 중심의 클라이언트 라우터다.

말이 조금 추상적이니 풀어 보자. 보통 라우터에서 우리는 URL을 "문자열"로 다룬다.
`?page=2&sort=asc` 같은 쿼리스트링을 직접 파싱하고, 값이 맞는지 일일이 확인하고, 오타가 나도
런타임에서야 안다. TanStack Router는 이 지점을 뒤집는다. URL의 각 조각(경로 파라미터,
검색 파라미터)을 **미리 정의한 스키마로 검증**하고, 그 타입이 `Link` → `useNavigate` →
`loader` → 컴포넌트까지 **끊기지 않고 흐르게** 한다.

React Router / Next App Router와 특히 갈리는 지점을 네 가지로 요약하면:

- **1급(first-class) Search Params.** `?page=2` 를 문자열이 아니라 **검증된 객체**로 다룬다.
  다른 라우터에서 가장 손이 많이 가고 자주 깨지는 부분을 라우터가 책임진다. (Chapter 03에서 집중)
- **타입 안전한 내비게이션.** 존재하지 않는 경로로 `<Link to="...">` 를 쓰면 화면이 아니라
  **에디터에서 빨간 줄**이 먼저 뜬다. 오타로 인한 깨진 링크가 원천 차단된다.
- **내장 데이터 로딩.** 라우트마다 `loader` 를 달 수 있고, 캐시·프리로드가 기본으로 붙어 온다
  (SWR과 비슷한 감각). 데이터 패칭을 위해 별도 라이브러리부터 깔 필요가 없다.
- **파일기반 ↔ 코드기반 둘 다 지원.** 이 바이블은 파일기반을 주력으로 다룬다.

> Next.js를 주로 쓰던 입장에서 체감 포인트는 두 가지다. 첫째, "라우팅은 곧 상태"라는 사고방식.
> 둘째, `?query` 를 문자열이 아니라 **검증된 객체**로 다룬다는 점. 지금은 "그렇구나" 정도로
> 넘어가도 된다. Chapter 03에서 이 두 가지가 왜 강력한지 몸으로 느끼게 된다.

## 2. 설치 (Vite)

필요한 패키지는 크게 세 묶음이다. 라우터 본체, 개발용 플러그인/도구, 그리고 (나중에 쓸)
Query 연동이다.

```bash
# 1) 라우터 본체
pnpm add @tanstack/react-router

# 2) 개발 편의 (파일기반 자동 생성 플러그인 + 인스펙터)
pnpm add -D @tanstack/router-plugin @tanstack/react-router-devtools

# 3) TanStack Query 통합용 — Chapter 07에서 사용
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

이 저장소는 이미 다 깔려 있다 → [`apps/bible/package.json`](../apps/bible/package.json). 디자인 쪽은
`shadcn/ui`(Base UI 기반) + Tailwind v4 를 함께 쓰지만, 라우터 학습과는 독립적이니 지금은
신경 쓰지 않아도 된다.

## 3. 플러그인 셋업

파일기반 라우팅의 핵심 마법은 이 플러그인 하나에서 나온다. `TanStackRouterVite` 가
`src/routes/**` 폴더를 **지켜보다가**, 파일을 추가·수정할 때마다 `src/routeTree.gen.ts` 라는
라우트 트리를 **자동으로 다시 그린다.** 우리가 라우트를 코드로 일일이 등록하지 않아도 되는
이유가 여기 있다.

```ts
// apps/bible/vite.config.ts
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(), // ← 반드시 라우터 플러그인 "뒤"에 온다
  ],
})
```

- 플러그인을 `react()` **앞**에 둬야 한다. 순서가 바뀌면 react 플러그인이 생성된 트리를
  제때 못 읽어 빌드가 꼬인다. (이유를 외울 필요는 없고 "순서 고정"만 기억하면 된다.)
- `autoCodeSplitting: true` 를 켜면 라우트별로 자동 코드 스플리팅이 된다. `pnpm build` 로그를
  보면 라우트마다 별도 청크로 쪼개진 것을 확인할 수 있다.
- `routeTree.gen.ts` 는 **기계가 만든 산출물**이다. 직접 고치지 말고(다음 생성 때 덮어써진다),
  보통 버전 관리에서도 제외한다.

## 4. 라우터 부트스트랩

이제 생성된 라우트 트리(`routeTree`)를 실제 라우터로 만들어 앱에 꽂는다.

```tsx
// apps/bible/src/main.tsx (핵심 발췌)
const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: { queryClient },   // 모든 loader/beforeLoad 에서 접근 (Chapter 05·07)
  defaultPreload: 'intent',   // 링크에 마우스만 올려도 미리 로드 (Chapter 02)
  scrollRestoration: true,
})

// 전역 타입 등록 — 이 "한 번의" 선언이 앱 전체의 타입 추론을 켜는 스위치다.
declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
```

마지막 `declare module` 블록이 처음엔 낯설 수 있다. 이건 "이 앱의 라우터는 바로 이 타입이야"
라고 TypeScript에게 **한 번** 알려 주는 등록 절차다. 이 선언 덕분에 앱 어디서든 `<Link to>`,
`params`, `search` 가 자동완성되고 타입 검사를 받는다. **빠뜨리면 타입 안전성이 통째로 꺼지니**
꼭 넣는다.

### 옵션·변형 (다양한 결과)

`createRouter` 는 옵션 하나만 바꿔도 앱 전체 동작이 달라진다. 자주 쓰는 것만 추리면:

| 옵션 | 효과 |
|------|------|
| `defaultPreload: 'intent'` | 링크에 hover/touch 하면 미리 로드 (가장 흔한 선택) |
| `defaultPreload: 'viewport'` | 링크가 화면에 들어오면 미리 로드 |
| `defaultPreload: false` | 프리로드를 끔 |
| `defaultPreloadStaleTime` | 미리 로드한 데이터를 얼마나 신선하게 유지할지 |
| `context: {...}` | 의존성 주입(queryClient, auth 등)을 라우트 트리 전역에 공유 |
| `scrollRestoration: true` | 뒤로가기 시 스크롤 위치 복원 |

## 5. Devtools 읽는 법

`__root.tsx` 하단에 `<TanStackRouterDevtools />` 를 달아 두면, 실행 중 화면 좌하단에
작은 아이콘이 뜬다. **이 인스펙터가 라우팅 학습에서 가장 강력한 관찰 도구다.**

- **Matches** 패널: 지금 URL이 매칭한 라우트 체인(루트 → 리프)과 각 라우트의 loader·context
  상태를 실시간으로 보여준다. 링크를 눌러 이동하면서 이 패널이 **어떻게 바뀌는지 지켜보는 것**이
  이후 모든 Chapter의 이해를 빠르게 한다.
- 우하단의 `<ReactQueryDevtools />` 는 Chapter 07에서 캐시 키·프리페치를 관찰할 때 쓴다.

## 흔한 실수 / 함정

처음 세팅할 때 거의 모두가 한 번씩 겪는 것들이다. 미리 알아 두면 시간을 아낀다.

- 플러그인을 `react()` **뒤**에 두면 생성 트리를 못 잡는다 → 순서를 지킨다.
- `Register` 선언을 빠뜨리면 `<Link to>` 자동완성·타입 검사가 **아예 작동하지 않는다.**
- `routeTree.gen.ts` 를 손으로 고치면 다음 생성 때 사라진다.
- dev 서버를 처음 켜거나 `vite build` 를 돌리기 **전**에는 `routeTree.gen.ts` 가 없어서
  `tsc` 가 실패할 수 있다 → 한 번 `pnpm dev` 또는 `pnpm build` 로 파일을 생성한 뒤 타입체크한다.

## 🔗 시너지

지금 심어 둔 두 옵션이 뒤 Chapter에서 어떻게 열매를 맺는지 미리 표시해 둔다.

- `context: { queryClient }` → [Chapter 05 Router Context] 와 [Chapter 07 Query 통합] 의 토대가 된다.
- `defaultPreload: 'intent'` → [Chapter 02 Preloading] · [Chapter 04 Data Loading] 과 맞물려 체감
  속도를 끌어올린다.

## ▶ 실행 예제

- 홈: `/` — Chapter 목차
- 셋업 파일: [`apps/bible/vite.config.ts`](../apps/bible/vite.config.ts),
  [`apps/bible/src/main.tsx`](../apps/bible/src/main.tsx), [`apps/bible/src/routes/__root.tsx`](../apps/bible/src/routes/__root.tsx)
