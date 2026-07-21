import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// validateSearch 로 ?count=숫자 를 검증한다. (검증의 본격 내용은 Chapter 03)
export const Route = createFileRoute('/navigation/imperative')({
  validateSearch: (search: Record<string, unknown>): { count: number } => ({
    count: Number(search.count ?? 0),
  }),
  component: Imperative,
})

const CODE_COUNTER = `const { count } = Route.useSearch()
const navigate = Route.useNavigate()

// search 에 함수를 주면 "이전 값 기준"으로 갱신된다
<Button onClick={() => navigate({ search: (prev) => ({ count: prev.count - 1 }) })}>
  −1
</Button>

<span>count = {count}</span>

<Button onClick={() => navigate({ search: (prev) => ({ count: prev.count + 1 }) })}>
  +1
</Button>

{/* replace: true → 히스토리에 안 쌓임(뒤로가기에 안 남음) */}
<Button onClick={() => navigate({ search: { count: 0 }, replace: true })}>
  리셋 (replace)
</Button>`

const CODE_GO = `// 라우트에 묶이지 않은 범용 navigate
const go = useNavigate()

<Button onClick={() => go({ to: '/navigation/link' })}>
  → Link 심화로
</Button>

<Button
  onClick={() =>
    go({ to: '/routing/matching/$productId', params: { productId: '3' } })
  }
>
  → 상품 #3 상세로
</Button>`

function Imperative() {
  const { count } = Route.useSearch()
  const navigate = Route.useNavigate()
  const go = useNavigate()

  return (
    <div className="space-y-8 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">1. search 를 상태처럼 — updater 함수</h3>
          <p className="text-muted-foreground leading-relaxed">
            아래 버튼은 <code className="rounded bg-muted px-1">navigate(&#123; search &#125;)</code>{' '}
            로 URL의 <code className="rounded bg-muted px-1">?count</code> 를 바꾼다. search 에
            함수를 주면 <strong>이전 값 기준</strong>으로 갱신할 수 있다. 값은 컴포넌트 state 가
            아니라 <strong>URL에 산다</strong> — 새로고침해도, 링크를 공유해도 그대로다.
          </p>
        </div>
        <Example code={CODE_COUNTER}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ search: (prev) => ({ count: prev.count - 1 }) })}
              >
                −1
              </Button>
              <span className="min-w-16 rounded-md border bg-muted/40 px-3 py-1 text-center font-mono">
                count = {count}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ search: (prev) => ({ count: prev.count + 1 }) })}
              >
                +1
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate({ search: { count: 0 }, replace: true })}
              >
                리셋 (replace)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              주소창의 <code className="rounded bg-muted px-1">?count=</code> 가 함께 바뀌는지
              보라.
            </p>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">2. 코드로 다른 화면 보내기</h3>
          <p className="text-muted-foreground leading-relaxed">
            제출 후 이동, 조건 분기 이동처럼 <em>로직이 판단하는 이동</em>은 범용{' '}
            <code className="rounded bg-muted px-1">useNavigate()</code> 로 한다. 경로·params 는
            여기서도 전부 타입 검증된다.
          </p>
        </div>
        <Example code={CODE_GO}>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => go({ to: '/navigation/link' })}>
              → Link 심화로
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                go({ to: '/routing/matching/$productId', params: { productId: '3' } })
              }
            >
              → 상품 #3 상세로
            </Button>
          </div>
        </Example>
      </section>
    </div>
  )
}
