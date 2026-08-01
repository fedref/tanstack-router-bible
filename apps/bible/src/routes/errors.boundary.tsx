import { useState } from 'react'
import { CatchBoundary, createFileRoute, useLocation } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/12-error-boundaries.md
export const Route = createFileRoute('/errors/boundary')({
  component: BoundaryDemo,
})

const CODE_CB = `<CatchBoundary
  getResetKey={() => resetCount}        // 필수 — 이 값이 바뀌면 경계가 초기화된다
  errorComponent={({ error }) => <div>{error.message}</div>}
  onCatch={(error, info) => reportToSentry(error, info)}
>
  <RiskyWidget />
</CatchBoundary>`

const CODE_KEY = `// URL 이 바뀌면 에러 상태를 자동으로 푼다
const pathname = useLocation({ select: (l) => l.pathname })

<CatchBoundary getResetKey={() => pathname}>…</CatchBoundary>

// ❌ 고정값이면 경계가 영원히 초기화되지 않는다
<CatchBoundary getResetKey={() => 'x'}>…</CatchBoundary>`

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('위젯 내부에서 터진 렌더 에러')
  }
  return (
    <div className="rounded border bg-muted/40 px-2 py-1.5">
      정상 동작 중인 위젯
    </div>
  )
}

function BoundaryDemo() {
  const [broken, setBroken] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const pathname = useLocation({ select: (l) => l.pathname })

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">라우트가 아니라 영역을 감싼다</h3>
          <p className="text-muted-foreground leading-relaxed">
            라우트 옵션(<code className="rounded bg-muted px-1">errorComponent</code>)은{' '}
            <strong className="text-foreground">라우트 단위</strong>로만 경계를 만든다. 화면
            안의 일부 영역만 감싸려면 컴포넌트를 쓴다. 아래에서 위젯을 고장 내도{' '}
            <strong className="text-foreground">이 페이지의 나머지는 멀쩡하다.</strong>
          </p>
        </div>

        <Example title="CatchBoundary" code={CODE_CB}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={broken ? 'destructive' : 'outline'}
                onClick={() => setBroken((v) => !v)}
              >
                {broken ? '위젯 고장남 (누르면 고침)' : '위젯 고장내기'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setResetKey((k) => k + 1)}>
                resetKey 올리기 ({resetKey})
              </Button>
            </div>

            <CatchBoundary
              getResetKey={() => resetKey}
              errorComponent={({ error, reset }) => (
                <div className="space-y-2 rounded border border-destructive/40 bg-destructive/5 p-2">
                  <Badge variant="destructive">CatchBoundary 가 잡았다</Badge>
                  <p>{error.message}</p>
                  <p className="text-xs text-muted-foreground">
                    “위젯 고장내기”를 눌러 정상으로 되돌린 뒤 reset() 을 누르거나, resetKey 를
                    올리면 경계가 초기화된다.
                  </p>
                  <Button size="xs" onClick={reset}>
                    reset()
                  </Button>
                </div>
              )}
              onCatch={(error) => {
                // 실제 앱이라면 여기서 Sentry 등으로 보고한다
                console.warn('[demo] onCatch:', error.message)
              }}
            >
              <Boom shouldThrow={broken} />
            </CatchBoundary>

            <div className="rounded border bg-muted/40 px-2 py-1.5 text-muted-foreground">
              ↑ 위젯이 터져도 이 문단은 그대로 보인다. 사이드바도, 상단 탭도 살아 있다.
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">
            <code className="rounded bg-muted px-1">getResetKey</code> 가 필수인 이유
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            React 의 ErrorBoundary 는 한 번 에러가 나면 그 상태에 갇힌다. 이 키가 바뀌면
            자동으로 풀린다. 보통{' '}
            <strong className="text-foreground">URL 이나 카운터</strong>를 연결한다.
          </p>
        </div>

        <Example title="URL 을 키로 쓰기" code={CODE_KEY}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 rounded border px-2 py-1.5">
              <code className="text-xs">현재 pathname (키 후보)</code>
              <span className="ml-auto font-medium">{pathname}</span>
            </div>
            <div className="flex items-center gap-2 rounded border px-2 py-1.5">
              <code className="text-xs">이 데모의 resetKey</code>
              <Badge variant="outline" className="ml-auto">{resetKey}</Badge>
            </div>
          </div>
        </Example>
      </section>

      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Deferred 와의 관계:</strong> 10장에서 본{' '}
          <code className="rounded bg-muted px-1">&lt;Await&gt;</code> 의 에러는{' '}
          <code className="rounded bg-muted px-1">errorComponent</code> 가 잡지 못한다. loader
          단계가 아니라 렌더 단계에서 터지기 때문이다. 그래서{' '}
          <code className="rounded bg-muted px-1">CatchBoundary</code> 가 필요하다 —{' '}
          <code className="rounded bg-muted px-1">/deferred</code> 예제에서 실제로 그렇게
          쓰고 있다. 404 를 영역 단위로 잡는{' '}
          <code className="rounded bg-muted px-1">&lt;CatchNotFound&gt;</code> 도 같은 방식이며,{' '}
          <code className="rounded bg-muted px-1">fallback</code> 이 함수라는 점만 다르다.
        </p>
      </div>
    </div>
  )
}
