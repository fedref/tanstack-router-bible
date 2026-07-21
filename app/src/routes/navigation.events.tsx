import { useEffect, useState } from 'react'
import { createFileRoute, useRouter, useRouterState } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// tick 을 올리며 "같은 라우트 안에서" 이동을 일으켜, 이벤트 로그가 쌓이는 걸 관찰한다.
export const Route = createFileRoute('/navigation/events')({
  validateSearch: (search: Record<string, unknown>): { tick: number } => ({
    tick: Number(search.tick ?? 0),
  }),
  component: Events,
})

const CODE_EVENTS = `const router = useRouter()
const status = useRouterState({ select: (s) => s.status })

useEffect(() => {
  // router.subscribe(type, cb) 는 해지 함수를 돌려준다
  const unsubBefore = router.subscribe('onBeforeNavigate', (e) => {
    push(\`onBeforeNavigate → \${e.toLocation.href}\`)
  })
  const unsubResolved = router.subscribe('onResolved', (e) => {
    push(\`onResolved → \${e.toLocation.href}\`)
  })
  return () => {
    unsubBefore()
    unsubResolved()
  }
}, [router])`

function Events() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const { tick } = Route.useSearch()
  const status = useRouterState({ select: (s) => s.status })
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    const push = (label: string) =>
      setLog((prev) => [`${label}`, ...prev].slice(0, 8))

    const unsubBefore = router.subscribe('onBeforeNavigate', (e) => {
      push(`onBeforeNavigate → ${e.toLocation.href}`)
    })
    const unsubResolved = router.subscribe('onResolved', (e) => {
      push(`onResolved → ${e.toLocation.href}`)
    })

    return () => {
      unsubBefore()
      unsubResolved()
    }
  }, [router])

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">라우터 이벤트 구독하기</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">router.subscribe(type, cb)</code> 로 이동
            생명주기를 관찰한다. 분석 로깅, 진행 표시줄, 스크롤 처리 등에 쓴다. 아래 버튼으로{' '}
            <strong>같은 라우트</strong>의 <code className="rounded bg-muted px-1">?tick</code>{' '}
            만 바꿔 이동을 일으켜 보라(컴포넌트가 유지돼 로그가 쌓인다).
          </p>
        </div>
        <Example code={CODE_EVENTS}>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ search: { tick: tick + 1 } })}
              >
                이동 일으키기 (tick +1)
              </Button>
              <span className="font-mono text-muted-foreground">tick = {tick}</span>
              <Badge variant={status === 'pending' ? 'default' : 'secondary'}>
                router.status: {status}
              </Badge>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                이벤트 로그 (최근 8개)
              </p>
              <div className="min-h-24 space-y-1 rounded-lg border bg-muted/30 p-3 font-mono text-xs">
                {log.length === 0 ? (
                  <span className="text-muted-foreground">
                    아직 없음 — 위 버튼을 누르거나 서브탭을 오가 보라.
                  </span>
                ) : (
                  log.map((line, i) => (
                    <div key={i} className="text-muted-foreground">
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Example>

        <p className="text-xs text-muted-foreground">
          구독할 수 있는 이벤트: <code className="rounded bg-muted px-1">onBeforeNavigate</code>,{' '}
          <code className="rounded bg-muted px-1">onBeforeLoad</code>,{' '}
          <code className="rounded bg-muted px-1">onLoad</code>,{' '}
          <code className="rounded bg-muted px-1">onResolved</code> 등.
        </p>
      </section>
    </div>
  )
}
