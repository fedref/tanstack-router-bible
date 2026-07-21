import { createFileRoute, Link, linkOptions } from '@tanstack/react-router'
import { Example } from '@/components/example'

export const Route = createFileRoute('/navigation/link')({
  component: LinkDeepDive,
})

// linkOptions: 재사용할 링크 설정을 "타입 안전하게" 묶어 두는 헬퍼.
const productLink = linkOptions({
  to: '/routing/matching/$productId',
  params: { productId: '1' },
})

const chipActive = {
  className:
    'rounded-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground',
}
const chipInactive = {
  className:
    'rounded-md border px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted',
}

// ── 아래 CODE_* 는 각 예제 박스의 "코드" 탭에 보여줄 소스다 ──────────────
const CODE_ACTIVE = `<Link
  to="/navigation/link"
  activeProps={{ className: 'bg-primary text-primary-foreground ...' }}
  inactiveProps={{ className: 'border text-muted-foreground ...' }}
>
  /navigation/link
</Link>`

const CODE_EXACT = `{/* 기본: 자식 경로에 있어도 active 로 친다 */}
<Link to="/navigation" activeProps={chipActive}>
  /navigation
</Link>

{/* exact: 정확히 일치할 때만 active */}
<Link
  to="/navigation"
  activeOptions={{ exact: true }}
  activeProps={chipActive}
>
  /navigation (exact)
</Link>`

const CODE_RENDER = `{/* children 을 함수로 주면 isActive 를 받아 내용을 바꾼다 */}
<Link to="/navigation/link">
  {({ isActive }) => (
    <span>{isActive ? '● 현재 위치' : '○ 여기로'} · link</span>
  )}
</Link>`

const CODE_OPTIONS = `import { linkOptions } from '@tanstack/react-router'

// 재사용할 링크 설정을 타입 안전하게 묶는다
const productLink = linkOptions({
  to: '/routing/matching/$productId',
  params: { productId: '1' },
})

<Link {...productLink}>linkOptions 로 상품 #1</Link>
<Link to="/routing/matching/$productId" params={{ productId: '2' }}>
  params 로 상품 #2
</Link>
<Link to="/navigation" hash="events">hash 로 이동 (#events)</Link>`

function LinkDeepDive() {
  return (
    <div className="space-y-8 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">1. active 상태 스타일링</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">activeProps</code> /{' '}
            <code className="rounded bg-muted px-1">inactiveProps</code> 로 현재 위치와 그렇지
            않은 링크를 다르게 꾸민다. 지금 이 페이지가{' '}
            <code className="rounded bg-muted px-1">/navigation/link</code> 이므로, 아래에서 그
            링크만 강조된다.
          </p>
        </div>
        <Example code={CODE_ACTIVE}>
          <div className="flex flex-wrap gap-2">
            <Link to="/navigation" activeProps={chipActive} inactiveProps={chipInactive}>
              /navigation
            </Link>
            <Link to="/navigation/link" activeProps={chipActive} inactiveProps={chipInactive}>
              /navigation/link
            </Link>
            <Link
              to="/navigation/imperative"
              search={{ count: 0 }}
              activeProps={chipActive}
              inactiveProps={chipInactive}
            >
              /navigation/imperative
            </Link>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">2. activeOptions — 정확히 vs 접두</h3>
          <p className="text-muted-foreground leading-relaxed">
            기본적으로 부모 경로 링크는 자식에 있을 때도 active 로 친다. 정확히 일치할 때만
            active 로 보려면{' '}
            <code className="rounded bg-muted px-1">activeOptions=&#123;&#123; exact: true &#125;&#125;</code>
            를 준다. 지금은 <code className="rounded bg-muted px-1">/navigation/link</code> 에
            있으므로 exact 쪽만 꺼진다.
          </p>
        </div>
        <Example code={CODE_EXACT}>
          <div className="flex flex-wrap gap-2">
            <Link to="/navigation" activeProps={chipActive} inactiveProps={chipInactive}>
              /navigation (기본: 접두 매칭)
            </Link>
            <Link
              to="/navigation"
              activeOptions={{ exact: true }}
              activeProps={chipActive}
              inactiveProps={chipInactive}
            >
              /navigation (exact)
            </Link>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">3. render-prop 으로 isActive 직접 쓰기</h3>
          <p className="text-muted-foreground leading-relaxed">
            children 을 함수로 주면 <code className="rounded bg-muted px-1">isActive</code> 를
            받아 내용 자체를 바꿀 수 있다(아이콘 토글 등).
          </p>
        </div>
        <Example code={CODE_RENDER}>
          <div className="flex flex-wrap gap-2">
            <Link to="/navigation/link" className="underline-offset-4 hover:underline">
              {({ isActive }) => <span>{isActive ? '● 현재 위치' : '○ 여기로'} · link</span>}
            </Link>
            <Link
              to="/navigation/events"
              search={{ tick: 0 }}
              className="underline-offset-4 hover:underline"
            >
              {({ isActive }) => <span>{isActive ? '● 현재 위치' : '○ 여기로'} · events</span>}
            </Link>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">4. params · hash · linkOptions</h3>
          <p className="text-muted-foreground leading-relaxed">
            동적 경로로 갈 땐 <code className="rounded bg-muted px-1">params</code> 를, 앵커로 갈
            땐 <code className="rounded bg-muted px-1">hash</code> 를 준다.{' '}
            <code className="rounded bg-muted px-1">linkOptions()</code> 로 미리 묶어 두면 여러
            곳에서 재사용하면서도 타입 검증을 받는다.
          </p>
        </div>
        <Example code={CODE_OPTIONS}>
          <div className="flex flex-wrap gap-2">
            <Link {...productLink} {...chipInactive}>
              linkOptions 로 상품 #1
            </Link>
            <Link
              to="/routing/matching/$productId"
              params={{ productId: '2' }}
              {...chipInactive}
            >
              params 로 상품 #2
            </Link>
            <Link to="/navigation" hash="events" {...chipInactive}>
              hash 로 이동 (#events)
            </Link>
          </div>
        </Example>
      </section>
    </div>
  )
}
