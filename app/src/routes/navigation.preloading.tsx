import { createFileRoute, Link } from '@tanstack/react-router'
import { Example } from '@/components/example'

export const Route = createFileRoute('/navigation/preloading')({
  component: Preloading,
})

const chip =
  'rounded-md border px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted'

const CODE_PRELOAD = `{/* preload 미지정 → 라우터 기본값('intent')을 따름 */}
<Link to="/routing/matching/$productId" params={{ productId: '1' }}>
  기본(intent)
</Link>

{/* viewport: 링크가 화면에 보이기만 해도 미리 로드 */}
<Link to="..." preload="viewport">viewport</Link>

{/* preloadDelay: hover 후 이 시간이 지나야 로드 */}
<Link to="..." preload="intent" preloadDelay={200}>intent + 200ms</Link>

{/* false: 이 링크만 프리로드 끔 */}
<Link to="..." preload={false}>preload 끔</Link>`

function Preloading() {
  return (
    <div className="space-y-8 text-sm">
      <section className="space-y-2">
        <h3 className="font-semibold">미리 로드(Preloading)란</h3>
        <p className="text-muted-foreground leading-relaxed">
          사용자가 링크를 <strong>클릭하기 전에</strong> 그 라우트의 loader 데이터를 미리 받아
          두는 기능이다. 실제 클릭 순간엔 데이터가 이미 준비돼 있어 “즉시 열리는” 느낌을 준다.
          이 앱은 <code className="rounded bg-muted px-1">main.tsx</code> 에서{' '}
          <code className="rounded bg-muted px-1">defaultPreload: 'intent'</code> 를 켜 두었다 —
          링크에 <strong>마우스만 올려도</strong> 미리 로드된다.
        </p>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">직접 관찰하기</h3>
          <p className="text-muted-foreground leading-relaxed">
            아래 상품 링크(각각 loader 가 약 300ms 걸린다)에 마우스를 올린 뒤{' '}
            <strong>좌하단 Router Devtools</strong> 를 열어 보라. 클릭하지 않아도 해당 라우트가
            미리 로드되어 캐시에 들어가는 것을 볼 수 있다.
          </p>
        </div>
        <Example code={CODE_PRELOAD}>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/routing/matching/$productId"
              params={{ productId: '1' }}
              className={chip}
            >
              기본(intent) · 상품 #1
            </Link>
            <Link
              to="/routing/matching/$productId"
              params={{ productId: '2' }}
              preload="viewport"
              className={chip}
            >
              viewport · 상품 #2
            </Link>
            <Link
              to="/routing/matching/$productId"
              params={{ productId: '3' }}
              preload="intent"
              preloadDelay={200}
              className={chip}
            >
              intent + 200ms 지연 · 상품 #3
            </Link>
            <Link
              to="/routing/matching/$productId"
              params={{ productId: '1' }}
              preload={false}
              className={chip}
            >
              preload 끔 · 상품 #1
            </Link>
          </div>
        </Example>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold">preload 값 정리</h3>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1">'intent'</code> — hover/touch/focus 시 (가장 흔함)
          </li>
          <li>
            <code className="rounded bg-muted px-1">'viewport'</code> — 링크가 화면에 들어올 때
          </li>
          <li>
            <code className="rounded bg-muted px-1">'render'</code> — 링크가 렌더되는 즉시
          </li>
          <li>
            <code className="rounded bg-muted px-1">false</code> — 끔
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          전역은 <code className="rounded bg-muted px-1">createRouter</code> 의{' '}
          <code className="rounded bg-muted px-1">defaultPreload</code> / 개별은 각 Link 의{' '}
          <code className="rounded bg-muted px-1">preload</code> 로 덮어쓴다.
        </p>
      </section>
    </div>
  )
}
