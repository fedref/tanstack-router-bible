import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'
import { listTodos } from '@/lib/todos'

// ?slow / ?fail 플래그로 pending·error 상태를 직접 유발해 관찰한다.
// (파일명에 .loader.tsx 를 쓰면 라우터 예약 규칙과 충돌하므로 basics 로 둔다)
export const Route = createFileRoute('/data/basics')({
  validateSearch: (s: Record<string, unknown>): { slow: boolean; fail: boolean } => ({
    slow: s.slow === true || s.slow === 'true',
    fail: s.fail === true || s.fail === 'true',
  }),
  // loader 가 의존하는 search 값을 선언 → 값이 바뀌면 loader 재실행
  loaderDeps: ({ search }) => ({ slow: search.slow, fail: search.fail }),
  loader: async ({ deps }) => {
    if (deps.fail) throw new Error('의도적으로 던진 에러입니다')
    return listTodos(deps.slow ? 1500 : 300)
  },
  // 로딩이 pendingMs(기본 1s)를 넘기면 표시된다 → ?slow=true 로 확인
  pendingComponent: () => (
    <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      불러오는 중… (pendingComponent)
    </div>
  ),
  // loader 가 throw 하면 표시된다 → ?fail=true 로 확인
  errorComponent: ({ error }) => (
    <div className="space-y-2 p-4 text-sm">
      <p className="font-medium text-destructive">errorComponent: {error.message}</p>
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={<Link to="/data/basics" search={{ slow: false, fail: false }} />}
      >
        정상 상태로 복구
      </Button>
    </div>
  ),
  component: LoaderDemo,
})

const CODE_LOADER = `export const Route = createFileRoute('/data/basics')({
  loaderDeps: ({ search }) => ({ slow: search.slow, fail: search.fail }),
  loader: async ({ deps }) => {
    if (deps.fail) throw new Error('의도적으로 던진 에러입니다')
    return listTodos(deps.slow ? 1500 : 300)
  },
  pendingComponent: () => <Spinner />,        // 로딩이 1s 넘으면
  errorComponent: ({ error }) => <Err e={error} />, // loader throw 시
  component: LoaderDemo,
})

function LoaderDemo() {
  const todos = Route.useLoaderData()   // loader 반환값, 타입 추론됨
  return <ul>{todos.map(...)}</ul>
}`

function LoaderDemo() {
  const todos = Route.useLoaderData()

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">loader · pendingComponent · errorComponent</h3>
        <p className="text-muted-foreground leading-relaxed">
          아래 링크로 상태를 바꿔 보라. <strong>느리게</strong>(1.5s)는 로딩이 1초를 넘겨
          pendingComponent 를, <strong>에러</strong>는 loader 의 throw 로 errorComponent 를
          띄운다.
        </p>
      </div>

      <Example title="loader 상태" code={CODE_LOADER}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/data/basics" search={{ slow: false, fail: false }} />}
            >
              정상(300ms)
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/data/basics" search={{ slow: true, fail: false }} />}
            >
              느리게(1.5s) → pending
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/data/basics" search={{ slow: false, fail: true }} />}
            >
              에러 → error
            </Button>
          </div>

          <ul className="space-y-1">
            {todos.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <Badge variant={t.done ? 'default' : 'outline'}>
                  {t.done ? 'done' : 'todo'}
                </Badge>
                <span className={t.done ? 'text-muted-foreground line-through' : ''}>
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Example>
    </div>
  )
}
