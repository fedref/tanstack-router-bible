import * as React from 'react'
import { createFileRoute, createLink, useLinkProps } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/16-custom-link-utils.md
export const Route = createFileRoute('/custom-link/')({
  component: CustomLinkDemo,
})

// ① 기반 컴포넌트 — a 태그 속성을 받고 forwardRef 로 ref 를 넘긴다
interface FancyLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: 'primary' | 'ghost'
}

const FancyAnchor = React.forwardRef<HTMLAnchorElement, FancyLinkProps>(
  ({ tone = 'primary', className, ...props }, ref) => (
    <a
      ref={ref}
      className={
        'inline-flex items-center gap-1 rounded border px-2 py-1 text-xs transition ' +
        (tone === 'primary'
          ? 'bg-primary text-primary-foreground hover:opacity-90 '
          : 'hover:bg-muted ') +
        (className ?? '')
      }
      {...props}
    />
  ),
)
FancyAnchor.displayName = 'FancyAnchor'

// ② 라우터 링크로 승격 — 이제 to/params/activeProps 를 타입 안전하게 받는다
const FancyLink = createLink(FancyAnchor)

const CODE_CREATE = `// ① 기반 컴포넌트 — forwardRef 가 사실상 필수다
const FancyAnchor = React.forwardRef<HTMLAnchorElement, FancyLinkProps>(
  ({ tone = 'primary', ...props }, ref) => <a ref={ref} {...props} />,
)

// ② 라우터 링크로 승격
const FancyLink = createLink(FancyAnchor)

// ③ 사용 — 자체 props 와 라우터 props 를 모두 가진다
<FancyLink
  to="/matches"                       // ✅ 자동완성 + 오타 검사
  tone="ghost"                        // ✅ 원래 컴포넌트의 props
  activeProps={{ className: 'ring-2' }}
/>`

const CODE_PROPS = `const linkProps = useLinkProps({
  to: '/query',
  activeProps: { className: 'text-primary' },
})

// 반환 타입은 React.ComponentPropsWithRef<'a'> — 완성된 <a> props 다
// href · onClick · onMouseEnter(preload) · aria-current · data-status 포함
return <a {...linkProps}>Query 챕터</a>`

function CustomLinkDemo() {
  const linkProps = useLinkProps({ to: '/query' })

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">디자인 시스템과 라우터를 붙이기</h3>
          <p className="text-muted-foreground leading-relaxed">
            앱에는 이미{' '}
            <code className="rounded bg-muted px-1">&lt;Button&gt;</code>,{' '}
            <code className="rounded bg-muted px-1">&lt;MenuItem&gt;</code> 같은 컴포넌트가
            있다. 이것들을 라우터 링크로 만들 때{' '}
            <code className="rounded bg-muted px-1">onClick={'{'}() =&gt; navigate(…){'}'}</code>{' '}
            로 처리하면 <strong className="text-foreground">타입 안전성이 통째로
            사라진다</strong> — 자동완성도, 오타 검사도, params 검증도 없다.
          </p>
        </div>

        <Example title="createLink 로 승격시키기" code={CODE_CREATE}>
          <div className="flex flex-wrap items-center gap-2">
            <FancyLink to="/matches" tone="primary">
              Match API 로
            </FancyLink>
            <FancyLink to="/deferred" tone="ghost">
              Deferred 로
            </FancyLink>
            <FancyLink to="/errors" tone="ghost" activeProps={{ className: 'ring-2 ring-primary' }}>
              Errors 로 (활성 시 링 표시)
            </FancyLink>
          </div>
          <p className="mt-2 text-muted-foreground">
            위 세 링크는 모두 우리가 만든{' '}
            <code className="rounded bg-muted px-1">FancyAnchor</code> 를 렌더하면서도{' '}
            <code className="rounded bg-muted px-1">Link</code> 의 모든 기능(preload · active
            상태 · 타입 안전 to)을 그대로 갖는다.
          </p>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">
            <code className="rounded bg-muted px-1">useLinkProps</code> — props 만 뽑아 쓰기
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            컴포넌트를 새로 만들 것 없이 <code className="rounded bg-muted px-1">&lt;a&gt;</code>{' '}
            에 필요한 props 객체만 얻는다. 일회성이거나 조건부로 렌더할 때 적합하다.
          </p>
        </div>

        <Example title="props 객체 받기" code={CODE_PROPS}>
          <div className="space-y-2">
            <a {...linkProps} className="text-primary underline-offset-4 hover:underline">
              이 링크는 useLinkProps 로 만들었다 → /query
            </a>
            <div className="rounded border bg-muted/40 px-2 py-1.5">
              <span className="text-xs text-muted-foreground">계산된 href:</span>{' '}
              <code className="text-xs">{String(linkProps.href)}</code>
            </div>
          </div>
        </Example>
      </section>

      <section className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground leading-relaxed">
          <Badge variant="outline">주의</Badge>{' '}
          <strong className="text-foreground">forwardRef 를 빠뜨리면</strong> 라우터가 요소에
          접근하지 못해 preload(hover 감지) 같은 기능이 조용히 빠진다. 동작은 하므로 발견이
          늦다. 서드파티 컴포넌트라면{' '}
          <code className="rounded bg-muted px-1">asChild</code> 패턴과 조합한다.
        </p>
      </section>
    </div>
  )
}
