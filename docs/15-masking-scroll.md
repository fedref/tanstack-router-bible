# 15 · Route Masking · 스크롤 복원 · View Transitions

> 대응 예제: `/masking` · `/masking/scroll`
> 예제 파일: `apps/bible/src/main.tsx`
> 📖 공식: [route-masking](https://tanstack.com/router/latest/docs/framework/react/guide/route-masking) ·
> [scroll-restoration](https://tanstack.com/router/latest/docs/framework/react/guide/scroll-restoration)

이 장은 **"URL과 화면 사이의 어긋남을 다루는 세 가지 기능"** 을 묶었다. 서로 독립적이지만,
셋 다 "사용자에게 보이는 것"과 "라우터가 아는 것"을 분리한다는 공통점이 있다.

---

# 1부 · Route Masking

## 한 줄 정의 & 언제 쓰나

**주소창에는 A를 보여 주면서 실제로는 B 라우트를 렌더하는 기능이다.**

가장 흔한 사용처는 **사진 모달**이다. 인스타그램에서 사진을 클릭하면:

- 주소창은 `/photos/123` 으로 바뀐다 (공유·북마크 가능)
- 화면은 피드 위에 모달로 뜬다 (맥락 유지)
- 그 URL을 **새 탭에서 열면** 전체 페이지로 뜬다

세 가지를 동시에 만족시키려면 "URL"과 "렌더할 라우트"를 분리해야 한다. 그게 마스킹이다.

## 최소 예제 — 링크 단위 마스킹

`Link` 에 `mask` 를 주는 방식이 가장 간단하다.

```tsx
<Link
  to="/feed"                        // 실제로 갈 곳 — 피드 + 모달
  search={{ photoId: '123' }}
  mask={{
    to: '/photos/$photoId',         // 주소창에 보일 것
    params: { photoId: '123' },
  }}
>
  사진 열기
</Link>
```

클릭하면:
- 주소창: `/photos/123`
- 렌더: `/feed?photoId=123` (피드 위에 모달)
- 새로고침하면: 주소창의 `/photos/123` 이 실제 라우트가 되어 **전체 페이지**로 뜬다

이 "새로고침하면 진짜 URL이 뜬다"가 마스킹의 핵심 동작이다.

## 라우터 전역 마스킹 — `createRouteMask`

링크마다 `mask` 를 적는 대신, 규칙을 한 번 선언해 둘 수 있다.

```tsx
import { createRouteMask, createRouter } from '@tanstack/react-router'

const photoModalMask = createRouteMask({
  routeTree,                        // 필수: 타입 추론용
  from: '/feed',                    // 이 라우트로 갈 때
  to: '/photos/$photoId',           // 이렇게 보이게 한다
  params: (prev) => ({ photoId: prev.search.photoId }),
  unmaskOnReload: true,             // 새로고침 시 마스크 해제
})

const router = createRouter({
  routeTree,
  routeMasks: [photoModalMask],
  unmaskOnReload: false,            // 전역 기본값
})
```

`from` 은 타입 안전하다 — 존재하지 않는 경로를 쓰면 컴파일 에러가 난다. `to`, `params`,
`search`, `hash`, `state` 를 모두 지정할 수 있다.

## `unmaskOnReload` — 새로고침 시 동작

| 값 | 새로고침하면 |
|---|---|
| `false` (기본) | 마스킹된 URL이 **실제 라우트로** 해석된다 → 전체 페이지 |
| `true` | 마스크가 벗겨지고 **원래 라우트로** 돌아간다 |

기본값 `false` 가 대부분의 경우 옳다. 사진 URL을 공유받은 사람이 열었을 때 전체 페이지가
떠야 하기 때문이다. `true` 는 "마스킹은 순전히 눈속임이고 새로고침하면 원래대로" 를
원할 때만 쓴다.

라우터 전역(`createRouter({ unmaskOnReload })`)과 마스크별
(`createRouteMask({ unmaskOnReload })`) 양쪽에서 지정할 수 있고, **마스크별 설정이
우선**한다.

## 현재 마스킹 상태 읽기

11장의 `useLocation()` 에서 확인할 수 있다.

```tsx
const location = useLocation()

location.href              // '/feed?photoId=123'  ← 실제 라우트
location.maskedLocation    // { href: '/photos/123', … }  ← 주소창에 보이는 것
location.unmaskOnReload    // 이 위치의 마스크 해제 설정
```

`maskedLocation` 이 `undefined` 면 마스킹 중이 아니다.

## 함정

**1. 마스킹된 URL의 라우트가 실제로 존재해야 한다**
`/photos/$photoId` 라우트를 만들지 않으면, 새로고침했을 때 404가 뜬다. **두 경로 모두
동작해야** 마스킹이 완성된다.

**2. 마스킹을 인증에 쓰려 한다**
URL을 감추는 것이지 보호하는 게 아니다. 사용자는 개발자도구로 실제 위치를 볼 수 있다.
보호는 `beforeLoad` 가드(06장)로 한다.

**3. 뒤로가기 동작이 헷갈린다**
마스킹된 이동도 히스토리 항목을 만든다. 모달을 닫을 때 `history.back()` 을 쓸지
`navigate({ to: '/feed' })` 를 쓸지 설계해 두지 않으면 기록이 지저분해진다.

---

# 2부 · 스크롤 복원

## 한 줄 정의 & 언제 쓰나

**뒤로 갔을 때 보던 위치로 되돌려 주는 기능이다.**

기본 브라우저는 전체 페이지 이동에서 이걸 해 준다. 그러나 SPA에서는 페이지가 실제로
다시 로드되지 않으므로 **직접 구현해야 한다.** 목록에서 500px 스크롤한 뒤 상세로 갔다가
뒤로 왔을 때 맨 위로 튀어 오르면, 사용자는 다시 스크롤해야 한다.

## 최소 예제 — 옵션 한 줄

```tsx
const router = createRouter({
  routeTree,
  scrollRestoration: true,      // ← 이것만으로 window 스크롤이 복원된다
})
```

이 저장소의 `apps/bible/src/main.tsx` 에 이미 켜져 있다.

> 예전에는 `<ScrollRestoration />` 컴포넌트를 루트에 두는 방식이었다. 지금은 라우터
> 옵션이 권장되며, 컴포넌트는 호환을 위해 남아 있다.

## 세부 옵션 세 가지

```tsx
createRouter({
  routeTree,
  scrollRestoration: true,

  // ① 어떤 키로 스크롤 위치를 저장할지
  getScrollRestorationKey: (location) => location.pathname,   // 기본: location.href

  // ② 복원할 때의 스크롤 동작
  scrollRestorationBehavior: 'instant',   // 기본: 'auto' ('smooth' 도 가능)

  // ③ window 외에 맨 위로 올릴 요소들
  scrollToTopSelectors: ['#main-content', () => document.querySelector('.panel')],
})
```

### ① `getScrollRestorationKey` — 언제 바꾸나

기본값은 `location.href` 다. **search까지 포함**하므로, 필터를 바꾸면 다른 위치로 취급되어
스크롤이 초기화된다.

목록에서 `?page=2` 로 넘어갔을 때 스크롤을 유지하고 싶다면 pathname만 쓴다:

```tsx
getScrollRestorationKey: (location) => location.pathname
```

반대로 탭마다 스크롤을 따로 기억하고 싶다면 특정 search만 포함시킨다:

```tsx
getScrollRestorationKey: (location) =>
  `${location.pathname}?tab=${location.search.tab ?? ''}`
```

### ② `scrollRestorationBehavior`

`'auto'`(기본) · `'instant'` · `'smooth'` 중 하나다. `'smooth'` 는 복원 과정이 애니메이션으로
보이는데, 뒤로가기에서는 대개 어색하다. **`'instant'` 가 가장 자연스럽다**는 의견이 많다.

### ③ `scrollToTopSelectors`

전체 화면이 아니라 **내부 패널이 스크롤되는 레이아웃**에서 필요하다. 기본값은
`['window']` 라서, `overflow: auto` 인 div 안쪽은 새 페이지로 가도 스크롤이 남는다.

```tsx
scrollToTopSelectors: ['#content-scroll-area']
```

문자열 선택자뿐 아니라 **함수**도 받으므로, 동적으로 요소를 찾아 넘길 수 있다.

## `useElementScrollRestoration` — 개별 요소 복원

`window` 가 아닌 특정 요소의 스크롤을 복원한다. 가로 스크롤 캐러셀, 사이드바, 채팅창
같은 것들이다.

```tsx
import { useElementScrollRestoration } from '@tanstack/react-router'

function ChatPanel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const entry = useElementScrollRestoration({
    id: 'chat-panel',                        // 고유 id
    getElement: () => scrollRef.current,     // 대상 요소
    getKey: (location) => location.pathname, // 선택: 키 계산
  })

  return (
    <div
      ref={scrollRef}
      style={{ overflowY: 'auto', height: 400 }}
      // 반환된 항목으로 초기 스크롤 위치를 지정한다
      data-scroll-restoration-id="chat-panel"
    >
      …
    </div>
  )
}
```

`id` 와 `getElement` 중 **최소 하나는 필수**다(타입이 유니온으로 강제한다). 반환값
`ScrollRestorationEntry` 에는 저장된 `scrollX`/`scrollY` 가 들어 있어, 직접 적용할 수도 있다.

## 함정

**1. `scrollRestoration` 을 켰는데 안 된다**
스크롤되는 요소가 `window` 가 아닐 확률이 높다. 대시보드 레이아웃에서는 대개 내부 div가
스크롤된다. `scrollToTopSelectors` 나 `useElementScrollRestoration` 을 쓴다.

**2. 필터를 바꿀 때마다 맨 위로 튄다**
`getScrollRestorationKey` 기본값이 `href` 라서 그렇다. `pathname` 으로 바꾼다.

**3. 데이터가 늦게 오면 복원이 어긋난다**
복원 시점에 콘텐츠 높이가 0이면 스크롤할 곳이 없다. loader로 데이터를 먼저 받아 두면
(04장) 렌더 시점에 높이가 확보되어 정확히 복원된다. **Deferred(10장)를 남용하면 이
문제가 생긴다.**

---

# 3부 · View Transitions

## 한 줄 정의 & 언제 쓰나

**브라우저의 View Transitions API로 라우트 전환에 애니메이션을 입힌다.** 페이지가 바뀔 때
요소가 부드럽게 이어지는 효과를 CSS만으로 만들 수 있다.

## 최소 예제

```tsx
// 전역으로 켜기
const router = createRouter({
  routeTree,
  defaultViewTransition: true,
})

// 또는 링크별로
<Link to="/posts/$postId" params={{ postId: '1' }} viewTransition>
  자세히
</Link>

// navigate 에서도
navigate({ to: '/posts/1', viewTransition: true })
```

CSS로 이름을 붙여 요소를 이어 준다.

```css
.post-thumbnail {
  view-transition-name: post-image;
}
```

목록의 썸네일과 상세의 큰 이미지에 같은 이름을 주면, 브라우저가 둘 사이를 자동으로
보간한다.

## `types` — 전환 종류 구분하기

boolean 대신 객체를 주면 전환에 **type 을** 붙일 수 있다.

```tsx
defaultViewTransition: {
  types: ({ fromLocation, toLocation, pathChanged, hashChanged }) => {
    // 뒤로 가는지 앞으로 가는지에 따라 다른 애니메이션
    if (!fromLocation) return ['initial']
    const goingDeeper = toLocation.pathname.length > fromLocation.pathname.length
    return goingDeeper ? ['forward'] : ['back']
  },
}
```

콜백은 `fromLocation`, `toLocation`, `pathChanged`, `hrefChanged`, `hashChanged` 를 받는다.
반환한 이름은 CSS에서 잡을 수 있다.

```css
html:active-view-transition-type(forward) {
  &::view-transition-old(root) { animation: slide-out-left 300ms; }
  &::view-transition-new(root) { animation: slide-in-right 300ms; }
}
html:active-view-transition-type(back) {
  &::view-transition-old(root) { animation: slide-out-right 300ms; }
  &::view-transition-new(root) { animation: slide-in-left 300ms; }
}
```

`types` 에 배열을 직접 줄 수도 있다(`types: ['fade']`).

## 함정

**1. 브라우저 지원을 확인하지 않는다**
미지원 브라우저에서는 애니메이션 없이 즉시 전환된다 — 즉 **안전하게 무시된다.**
폴백을 따로 만들 필요는 없지만, 애니메이션에 의존하는 UX 설계는 피한다.

**2. `view-transition-name` 이 동시에 두 개 이상 존재한다**
같은 이름을 가진 요소가 화면에 둘 이상 있으면 전환이 실패한다. 목록에서 각 항목에
같은 이름을 주면 이 문제가 생긴다 — **id를 섞어 고유하게** 만든다.
```css
view-transition-name: post-image-123;
```

**3. `prefers-reduced-motion` 을 무시한다**
접근성 문제다. 미디어 쿼리로 애니메이션을 끄는 처리를 넣는다.

**4. 스크롤 복원과 겹쳐 어색해진다**
전환 애니메이션 중에 스크롤이 튀면 산만하다. `scrollRestorationBehavior: 'instant'` 와
함께 쓰는 편이 낫다.

## `defaultHashScrollIntoView`

같은 계열의 옵션이라 여기서 함께 다룬다. URL에 `#section` 이 있을 때 해당 요소로
스크롤할지 정한다.

```tsx
createRouter({
  routeTree,
  defaultHashScrollIntoView: true,                        // 기본 동작
  // 또는 세부 지정
  defaultHashScrollIntoView: { behavior: 'smooth', block: 'center' },
})
```

객체를 주면 그대로 `scrollIntoView(options)` 에 전달된다. 링크별로는
`<Link hashScrollIntoView={false}>` 로 끌 수 있다.

## 🔗 시너지

- **11장 `useLocation`** — `maskedLocation` 으로 마스킹 상태를 읽는다.
- **02장 `Link`** — `mask`, `viewTransition`, `hashScrollIntoView` 는 모두 `Link` prop 으로도
  존재한다. 전역 기본값을 링크 단위로 덮어쓰는 구조다.
- **04장 loader** — 스크롤 복원이 정확하려면 렌더 시점에 콘텐츠 높이가 확보되어야 한다.
  loader로 미리 받는 것이 복원 품질에 직접 영향을 준다.
- **13장 search 미들웨어** — `getScrollRestorationKey` 를 pathname으로 좁히는 것과,
  `stripSearchParams` 로 URL을 정리하는 것은 같은 문제(불필요한 URL 변화)를 다른 층위에서
  다룬다.

## ▶ 실행 예제

`apps/bible/src/main.tsx` 에 `scrollRestoration: true` 가 적용되어 있다. 긴 문서 페이지에서
스크롤한 뒤 다른 라우트로 갔다가 뒤로 오면 위치가 유지되는 것을 볼 수 있다.

마스킹과 View Transitions는 `apps/playground` 에서 실습하기 좋은 주제다. 특히 마스킹은
**두 라우트를 모두 만들어야** 동작하므로, 직접 만들어 보면 구조가 확실히 이해된다.

## 📖 공식 문서

- [Route Masking](https://tanstack.com/router/latest/docs/framework/react/guide/route-masking)
- [Scroll Restoration](https://tanstack.com/router/latest/docs/framework/react/guide/scroll-restoration)
- [View Transitions](https://tanstack.com/router/latest/docs/framework/react/guide/view-transitions)
