import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/15-masking-scroll.md
export const Route = createFileRoute('/masking/scroll')({
  component: ScrollDemo,
})

const CODE_BASIC = `createRouter({
  routeTree,
  scrollRestoration: true,      // ← 이 앱에 이미 켜져 있다 (main.tsx)
})`

const CODE_OPTS = `createRouter({
  routeTree,
  scrollRestoration: true,

  // ① 어떤 키로 스크롤 위치를 저장할지 (기본: location.href)
  getScrollRestorationKey: (location) => location.pathname,

  // ② 복원할 때의 동작 (기본 'auto'; 'instant' 가 가장 자연스럽다)
  scrollRestorationBehavior: 'instant',

  // ③ window 외에 맨 위로 올릴 요소들 (기본 ['window'])
  scrollToTopSelectors: ['#content-scroll-area'],
})`

const CODE_ELEM = `const scrollRef = useRef<HTMLDivElement>(null)

const entry = useElementScrollRestoration({
  id: 'chat-panel',                        // id 와 getElement 중 하나는 필수
  getElement: () => scrollRef.current,
  getKey: (location) => location.pathname,
})

<div ref={scrollRef} data-scroll-restoration-id="chat-panel" style={{ overflowY: 'auto' }}>`

function ScrollDemo() {
  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">SPA 에서는 직접 구현해야 한다</h3>
          <p className="text-muted-foreground leading-relaxed">
            브라우저는 전체 페이지 이동에서 스크롤을 복원해 준다. 그런데 SPA 는 페이지가 실제로
            다시 로드되지 않으므로{' '}
            <strong className="text-foreground">그 복원이 자동으로 일어나지 않는다.</strong>{' '}
            목록에서 한참 스크롤한 뒤 상세로 갔다가 돌아왔는데 맨 위로 튀면, 사용자는 다시
            스크롤해야 한다. 이 기능이 SSR 앱보다 SPA 에 더 절실한 이유다.
          </p>
        </div>
        <Example title="옵션 한 줄" code={CODE_BASIC}>
          <p className="text-muted-foreground">
            이 앱은 이미 켜져 있다. 긴 페이지에서 스크롤한 뒤 다른 라우트로 갔다가 뒤로 오면
            위치가 유지되는 것을 확인할 수 있다.
          </p>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">세부 옵션 세 가지</h3>
          <p className="text-muted-foreground leading-relaxed">
            기본 키가 <code className="rounded bg-muted px-1">location.href</code> 라{' '}
            <strong className="text-foreground">search 까지 포함</strong>된다. 그래서 필터를
            바꾸면 다른 위치로 취급되어 스크롤이 초기화된다. 목록 페이지에서{' '}
            <code className="rounded bg-muted px-1">?page=2</code> 로 넘어갈 때 위치를
            유지하려면 <code className="rounded bg-muted px-1">pathname</code> 만 쓴다.
          </p>
        </div>
        <Example title="키 · 동작 · 대상 요소" code={CODE_OPTS}>
          <div className="space-y-1.5">
            <div className="rounded border px-2 py-1.5">
              <Badge variant="outline">가장 흔한 문제</Badge>
              <p className="mt-1 text-muted-foreground">
                “켰는데 안 된다” → 스크롤되는 요소가 window 가 아닐 확률이 높다. 대시보드
                레이아웃에서는 대개 내부 div 가 스크롤된다.{' '}
                <code className="rounded bg-muted px-1">scrollToTopSelectors</code> 나 아래
                훅을 쓴다.
              </p>
            </div>
            <div className="rounded border px-2 py-1.5">
              <Badge variant="outline">복원이 어긋난다면</Badge>
              <p className="mt-1 text-muted-foreground">
                복원 시점에 콘텐츠 높이가 0 이면 스크롤할 곳이 없다. loader 로 데이터를 먼저
                받아 두면(04장) 렌더 시점에 높이가 확보된다. Deferred(10장)를 남용하면 이
                문제가 생긴다.
              </p>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <Example title="개별 요소 복원 — useElementScrollRestoration" code={CODE_ELEM}>
          <p className="text-muted-foreground">
            가로 캐러셀, 사이드바, 채팅창처럼{' '}
            <code className="rounded bg-muted px-1">window</code> 가 아닌 요소의 스크롤을
            복원한다. 반환된{' '}
            <code className="rounded bg-muted px-1">ScrollRestorationEntry</code> 에는 저장된{' '}
            <code className="rounded bg-muted px-1">scrollX/scrollY</code> 가 들어 있어 직접
            적용할 수도 있다.
          </p>
        </Example>
      </section>
    </div>
  )
}
