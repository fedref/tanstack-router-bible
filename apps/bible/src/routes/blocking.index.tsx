import { useState } from 'react'
import { createFileRoute, Link, useBlocker } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/14-blocking-history.md
export const Route = createFileRoute('/blocking/')({
  component: BlockingDemo,
})

const CODE_BLOCKER = `const [isDirty, setIsDirty] = useState(false)

// withResolver: true → 커스텀 UI 를 쓰기 위해 상태 객체를 돌려받는다
const { status, proceed, reset, next } = useBlocker({
  shouldBlockFn: () => isDirty,
  enableBeforeUnload: () => isDirty,   // 탭 닫기/새로고침도 막는다
  withResolver: true,
})

{status === 'blocked' && (
  <Dialog>
    <p>{next.pathname} 으로 이동하시겠습니까?</p>
    <button onClick={proceed}>나가기</button>
    <button onClick={reset}>계속 편집</button>
  </Dialog>
)}`

const CODE_ARGS = `useBlocker({
  shouldBlockFn: ({ current, next, action }) => {
    // 같은 섹션 안에서 움직이는 건 허용
    if (next.routeId.startsWith('/blocking')) return false
    // 뒤로가기만 막고 싶다면
    if (action === 'BACK') return isDirty
    return isDirty
  },
})`

function BlockingDemo() {
  const [text, setText] = useState('')
  const isDirty = text.length > 0

  // withResolver: true 면 status/proceed/reset/next 가 담긴 객체를 돌려준다.
  // status 로 좁히면 나머지 필드가 타입상 확정된다(판별 유니온).
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  })

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">저장하지 않고 나가려 할 때</h3>
          <p className="text-muted-foreground leading-relaxed">
            아래 입력란에 <strong className="text-foreground">아무 글자나 입력한 뒤</strong>{' '}
            사이드바나 상단 탭의 다른 링크를 눌러 보라. 이동이 막히고 확인 UI가 뜬다.
            브라우저 탭을 닫거나 새로고침해도 경고가 뜬다.
          </p>
        </div>

        <Example title="useBlocker + withResolver" code={CODE_BLOCKER}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">
                편집 중인 내용 (입력하면 dirty 상태가 된다)
              </label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="여기에 입력한 뒤 다른 메뉴를 눌러 보라"
              />
              <div className="flex items-center gap-2">
                <Badge variant={isDirty ? 'default' : 'outline'}>
                  {isDirty ? 'dirty — 이동이 막힌다' : 'clean — 자유롭게 이동'}
                </Badge>
                <Button size="xs" variant="outline" onClick={() => setText('')}>
                  저장한 셈 치고 비우기
                </Button>
              </div>
            </div>

            {/* 실제 차단 UI */}
            {blocker.status === 'blocked' && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                <p className="font-medium">저장하지 않은 변경이 있습니다.</p>
                <p className="mt-1 text-muted-foreground">
                  <code className="rounded bg-muted px-1">{blocker.next.pathname}</code> 으로
                  이동하시겠습니까?{' '}
                  <span className="text-xs">(action: {blocker.action})</span>
                </p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="destructive" onClick={blocker.proceed}>
                    나가기
                  </Button>
                  <Button size="sm" variant="outline" onClick={blocker.reset}>
                    계속 편집
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" nativeButton={false} render={<Link to="/query" />}>
                /query 로 이동 시도
              </Button>
              <Button size="sm" variant="outline" nativeButton={false} render={<Link to="/matches" />}>
                /matches 로 이동 시도
              </Button>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">shouldBlockFn 은 “어디로 가는지”를 안다</h3>
          <p className="text-muted-foreground leading-relaxed">
            인자로 <code className="rounded bg-muted px-1">current</code> ·{' '}
            <code className="rounded bg-muted px-1">next</code> ·{' '}
            <code className="rounded bg-muted px-1">action</code> 이 들어오고, 전부 타입
            안전하다. 특정 경로로 가는 것만 허용하거나 뒤로가기만 막는 식으로 세밀하게
            제어할 수 있다. 비동기(<code className="rounded bg-muted px-1">Promise&lt;boolean&gt;</code>)
            도 가능하다.
          </p>
        </div>

        <Example title="목적지에 따라 다르게 판정" code={CODE_ARGS}>
          <p className="text-muted-foreground">
            현재 상태:{' '}
            <Badge variant="outline">{blocker.status}</Badge>
            {blocker.status === 'blocked' && (
              <>
                {' '}→ <code className="rounded bg-muted px-1">{blocker.next.routeId}</code>
              </>
            )}
          </p>
        </Example>
      </section>

      <section className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">한계:</strong> 브라우저 이탈(탭 닫기·새로고침)은
          커스텀 UI로 바꿀 수 없다.{' '}
          <code className="rounded bg-muted px-1">enableBeforeUnload</code> 는 브라우저의 표준
          경고창만 띄우며 메시지도 바꿀 수 없다. 위에서 만든 모달은{' '}
          <strong className="text-foreground">앱 내부 이동에만</strong> 적용된다.
        </p>
      </section>
    </div>
  )
}
