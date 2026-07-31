import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/components/example'

// Router Context: 루트에서 주입한 값(queryClient)에 beforeLoad 로 값을 더해 자식으로 내려보낸다.
export const Route = createFileRoute('/type-safety/context')({
  // 부모 context(=루트의 { queryClient })에 값을 병합해 이 라우트와 하위로 전달
  beforeLoad: ({ context }) => {
    // context.queryClient 는 여기서 이미 타입과 함께 접근 가능(루트에서 주입됨)
    void context.queryClient
    return {
      role: 'admin' as const,
      loadedAt: new Date().toLocaleTimeString('ko-KR'),
    }
  },
  component: ContextDemo,
})

const CODE_CONTEXT = `// 1) 루트에서 최초 주입 (main.tsx / __root.tsx)
createRouter({ routeTree, context: { queryClient } })
createRootRouteWithContext<{ queryClient: QueryClient }>()({ ... })

// 2) beforeLoad 로 값을 "더해" 자식에게 전달
export const Route = createFileRoute('/type-safety/context')({
  beforeLoad: ({ context }) => {
    void context.queryClient          // 부모 context, 타입 있음
    return { role: 'admin' as const, loadedAt: now() }
  },
  component: ContextDemo,
})

// 3) 어디서든 병합된 context 를 타입과 함께 읽는다
function ContextDemo() {
  const ctx = Route.useRouteContext()  // { queryClient, role, loadedAt }
}`

function ContextDemo() {
  const ctx = Route.useRouteContext()

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">Router Context — 타입 있는 의존성 주입</h3>
        <p className="text-muted-foreground leading-relaxed">
          루트에서 <code className="rounded bg-muted px-1">queryClient</code> 를 주입했고, 이
          라우트의 <code className="rounded bg-muted px-1">beforeLoad</code> 가 거기에{' '}
          <code className="rounded bg-muted px-1">role</code>·<code className="rounded bg-muted px-1">loadedAt</code>
          을 더했다. 그 병합 결과를 <code className="rounded bg-muted px-1">useRouteContext()</code>
          로 읽는다. loader 와 beforeLoad 에서도 같은 context 를 쓸 수 있다(그래서 Chapter 06 인증,
          Chapter 07 Query 의 토대가 된다).
        </p>
      </div>

      <Example title="병합된 context" code={CODE_CONTEXT}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              queryClient: {ctx.queryClient ? '있음 (루트 주입)' : '없음'}
            </Badge>
            <Badge>role: {ctx.role}</Badge>
            <Badge variant="outline">loadedAt: {ctx.loadedAt}</Badge>
          </div>
          <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
            {JSON.stringify(
              {
                queryClient: ctx.queryClient ? '[QueryClient]' : null,
                role: ctx.role,
                loadedAt: ctx.loadedAt,
              },
              null,
              2,
            )}
          </pre>
          <p className="text-xs text-muted-foreground">
            queryClient 는 루트에서, role·loadedAt 은 이 라우트의 beforeLoad 에서 왔다. 둘이
            하나의 타입으로 합쳐졌다.
          </p>
        </div>
      </Example>
    </div>
  )
}
