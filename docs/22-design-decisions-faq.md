# 22 · 설계 철학 & FAQ

> 대응 예제: (예제 없음 — 배경 지식)
> 📖 공식: [decisions-on-dx](https://tanstack.com/router/latest/docs/framework/react/decisions-on-dx) ·
> [faq](https://tanstack.com/router/latest/docs/framework/react/faq) ·
> [comparison](https://tanstack.com/router/latest/docs/framework/react/comparison)

앞 장들이 **"어떻게 쓰나"** 였다면 이 장은 **"왜 이렇게 생겼나"** 다. 처음 쓸 때 드는
불만 — *왜 이렇게 해야 하지? 다른 라우터는 안 이런데?* — 에 답한다.

이 배경을 알면 이상해 보이던 규칙들이 하나의 목적에서 나왔다는 게 보인다.

---

# 1부 · 설계 철학

## 출발점 — 대시보드의 search params

TanStack Router는 [Nozzle.io](https://nozzle.io) 의 필요에서 시작했다. 복잡한 대시보드를
만드는데, **URL search params 를 제대로 다루면서도 타입 안전성을 잃지 않는** 라우터가
없었다.

그래서 처음부터 목표가 하나였다. **타입 안전성을 최우선에 두고, 나머지를 거기 맞춘다.**
03장에서 search params 가 유독 정교하게 설계된 이유, `validateSearch` 가 1급 시민인 이유가
여기 있다. 곁다리 기능이 아니라 **이 라이브러리가 태어난 이유**다.

## 왜 라우트 설정이 이렇게 생겼나

핵심은 하나다 — **TypeScript 가 추론할 수 있어야 한다.**

### JSX로 라우트를 정의할 수 없는 이유

```tsx
// ⛔️ TanStack Router 에는 이런 API 가 없다
<Router>
  <Route path="/posts" component={PostsPage} />
  <Route path="/posts/$postId" component={PostIdPage} />
</Router>
```

이 형태에서는 **TypeScript 가 라우트 구성을 추론하지 못한다.** 그러면
`<Link to="/posts/$postId">` 의 `to` 를 직접 타이핑해야 하고, 오타는 런타임에야 드러난다.
02장에서 `to` 자동완성이 되는 것, 없는 경로를 쓰면 컴파일 에러가 나는 것 — 그게 JSX를
포기한 대가로 얻은 것이다.

### 중첩 객체도 안 되는 이유

```tsx
// ⛔️ 파일 하나가 끝없이 커진다
createRouter({
  routes: {
    posts: { component: PostsPage, children: { $postId: { … } } },
  },
})
```

타입은 추론되지만 **파일 하나에 앱 전체 라우트가 쌓인다.** 라우트가 100개인 앱에서
이 파일은 관리 불가능해진다.

### 그래서 나온 답

**라우트마다 독립된 객체를 만들고, 트리는 따로 조립한다.** 코드기반이면
`createRoute` + `addChildren`(17장), 파일기반이면 **파일 위치가 곧 트리**다(01장).

`createFileRoute('/posts/$postId')` 의 경로 문자열이 어색해 보이지만, 저것이
**TypeScript 에게 "이 파일은 이 경로다" 라고 알려 주는 유일한 수단**이다. 그리고
플러그인이 그 문자열을 자동으로 채워 주므로 우리가 관리할 필요가 없다.

## `Register` 선언이 필요한 이유

05장에서 본 이 선언이 처음엔 이상하게 느껴진다.

```ts
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

라우터 인스턴스는 **앱 어딘가에서 만들어지는 값**이다. 그런데 `<Link>` 는
`@tanstack/react-router` 에서 import 한 컴포넌트다. 이 둘이 서로를 알 방법이 없다.

props 로 넘기면 될까? `<Link router={router} to="...">` — 모든 링크마다 넘겨야 한다.
현실적이지 않다.

**모듈 선언 병합(declaration merging)** 이 이 문제를 푼다. 한 번 선언해 두면 라이브러리
쪽 타입이 우리 라우터를 알게 되고, 앱 전체의 `Link` · `useNavigate` · `useSearch` 가
전부 정확한 타입을 갖는다. **한 줄로 앱 전역 타입 추론을 켜는 스위치**다.

이 선언을 빠뜨리면 모든 게 `any` 가 되면서도 에러는 나지 않는다. "왜 자동완성이 안
되지?" 의 대부분이 이것이다(21장 디버깅 참조).

## 왜 파일기반을 권하나

코드기반도 완전히 지원한다(17장). 그럼에도 파일기반을 권하는 이유는 셋이다.

| | 코드기반 | 파일기반 |
|---|---|---|
| 라우트 구조 파악 | 트리 조립 코드를 읽어야 함 | **파일 목록이 곧 사이트맵** |
| 보일러플레이트 | `getParentRoute` 등 수동 | 플러그인이 생성 |
| 코드 스플리팅 | 직접 설정 | `autoCodeSplitting` 한 줄(09장) |

핵심은 **"타입 안전성을 위해 필요했던 보일러플레이트를 플러그인이 대신 써 준다"** 는
것이다. 우리는 파일을 옳은 곳에 두기만 하면 된다.

## 정리 — 하나의 목적, 여러 결과

```
타입 안전성을 최우선에 둔다
  ├─ JSX 라우트 정의 포기        → to 자동완성 · 오타 컴파일 에러
  ├─ 라우트별 독립 객체           → 파일 하나가 비대해지지 않음
  ├─ Register 모듈 선언          → 앱 전역 타입 추론
  └─ 파일기반 권장               → 보일러플레이트를 플러그인이 처리
```

낯선 규칙을 만나면 **"이게 타입 추론과 무슨 상관이지?"** 를 먼저 물어보면 대개 답이
나온다.

---

# 2부 · FAQ

## 다른 라우터 대신 이걸 쓸 이유가 있나

공식 문서가 비교하는 대상은 둘이다.

**Next.js** — React 프로젝트 시작의 사실상 표준. 성능·개발 워크플로·최신 기술에 초점.
다만 API와 추상화가 때때로 비표준적이고, 빠른 성장과 넓은 채택의 결과로 학습 곡선과
오버헤드가 커졌다.

**Remix / React Router** — 웹 표준(Request/Response)에 뿌리를 둔 설계. 여러 JS 환경에
적응하는 것을 중시한다. 잘 설계된 API가 많고 **TanStack Router 도 여기서 영향을
받았다.** 다만 설계가 경직된 면이 있고, 타입 안전성이 나중에 얹힌 것이라는 한계가 있다.

TanStack Router 의 위치는 **"유연성과 성능을 희생하지 않으면서 개발 경험을 개선하는
라우팅 API"** 다. 특히 **URL을 상태로 다루는 앱**(대시보드·필터·검색)에서 차이가 크다.

## 프레임워크인가

**아니다.** 번들링·배포·서버 기능을 다루지 않는다. 라우팅만 한다.

다만 다른 도구와 결합해 풀스택으로 올라갈 수 있게 설계됐고, 그것을 실제로 구현한 것이
**TanStack Start**(Router + Vite 기반 풀스택 프레임워크)다.

## `routeTree.gen.ts` 를 커밋해야 하나

**공식 답변은 "Yes" 다.**

> 생성된 파일이지만 **빌드 산출물이 아니라 애플리케이션 런타임의 일부**다. 소스 코드의
> 핵심적인 부분이며, 다른 개발자가 앱을 빌드할 수 있도록 커밋해야 한다.

> ### ⚠️ 이 저장소는 공식 권장을 따르지 않는다
>
> `.gitignore` 에 `**/src/routeTree.gen.ts` 를 넣어 **커밋하지 않는다.** 학습용 저장소라
> 생성물 diff 가 리뷰를 방해하는 것을 피하려는 선택이다. 대신 대가가 있다.
>
> - clone 직후 `pnpm typecheck` 가 **실패한다.** 파일이 없기 때문이다.
>   → `pnpm build` 를 한 번 돌려 생성해야 한다.
> - CI 에서도 빌드가 생성을 겸한다.
>
> 실무 프로젝트라면 **공식 권장대로 커밋하는 편이 낫다.** 새 팀원이 clone 하자마자
> 타입 에러를 만나는 경험은 좋지 않고, CI 순서 의존성도 사라진다.

## 루트 라우트를 조건부로 렌더할 수 있나

**없다.** 루트는 앱의 진입점이라 항상 렌더된다.

"로그인 여부에 따라 다른 화면을 보여주고 싶다"면 루트가 아니라 **Layout 라우트** 또는
**Pathless Layout 라우트**를 쓴다(01·06장).

```tsx
// routes/_authenticated.tsx — URL 에 나타나지 않는 레이아웃
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    if (!(await isAuthenticated())) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: () => <Outlet />,
})
```

이 아래 놓인 라우트가 전부 보호된다. 조건 분기를 **컴포넌트가 아니라 라우트 트리**로
표현하는 것이 이 라우터의 방식이다.

## 자주 만나는 나머지 질문들

| 질문 | 답 | 상세 |
|------|-----|------|
| 자동완성이 안 된다 | `Register` 선언을 빠뜨렸다 | 05장 |
| 파일을 만들었는데 404 | 파일명 규칙 위반. Devtools 의 Route Tree 확인 | 01 · 20장 |
| `useLoaderData()` 가 undefined | loader 가 실행되지 않았거나 다른 라우트를 참조 | 04 · 21장 |
| search 값이 사라진다 | `validateSearch` 스키마 또는 미들웨어 확인 | 03 · 13장 |
| 새로고침하면 404 | SPA 폴백(서버 rewrite)이 없다 | 21장 |
| 리렌더가 너무 잦다 | `select` 로 구독 범위를 좁힌다 | 11장 |
| `redirect()` 가 린트 에러 | `only-throw-error` 예외 등록 | 20장 |

## Parallel Routes 는 어떻게 쓰나

**공식 문서가 아직 작성되지 않았다.** `guide/parallel-routes` 페이지는 존재하지만 내용이
*"We haven't covered this yet. Stay tuned!"* 한 줄이다.

Next.js 의 Parallel Routes 같은 기능을 기대하고 찾는 사람이 많은데, 현재로서는 **문서도
안정된 API도 없다.** 한 화면에 여러 영역을 독립적으로 라우팅해야 한다면 지금은
search params 로 각 영역의 상태를 관리하는 편이 현실적이다(03·13장).

## 📖 공식 문서

- [Decisions on Developer Experience](https://tanstack.com/router/latest/docs/framework/react/decisions-on-dx)
- [FAQ](https://tanstack.com/router/latest/docs/framework/react/faq)
- [Comparison](https://tanstack.com/router/latest/docs/framework/react/comparison)
