import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// notFound() 를 던지면 가장 가까운 notFoundComponent 로 간다.
export const Route = createFileRoute('/auth/notfound')({
  validateSearch: (s: Record<string, unknown>): { missing: boolean } => ({
    missing: s.missing === true || s.missing === 'true',
  }),
  loaderDeps: ({ search }) => ({ missing: search.missing }),
  loader: ({ deps }) => {
    if (deps.missing) throw notFound() // 데이터 없음 → notFoundComponent 로
    return { title: '찾은 항목입니다' }
  },
  notFoundComponent: () => (
    <div className="space-y-2 p-4">
      <p className="font-medium text-destructive">notFoundComponent: 항목을 찾지 못했습니다</p>
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={<Link to="/auth/notfound" search={{ missing: false }} />}
      >
        정상 항목 보기
      </Button>
    </div>
  ),
  component: NotFoundDemo,
})

const CODE_NF = `export const Route = createFileRoute('/auth/notfound')({
  loader: ({ deps }) => {
    const item = findItem(...)
    if (!item) throw notFound()      // 없음 → notFoundComponent
    return item
  },
  notFoundComponent: () => <p>항목을 찾지 못했습니다</p>,
  component: NotFoundDemo,
})`

function NotFoundDemo() {
  const data = Route.useLoaderData()

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">notFound() · notFoundComponent</h3>
        <p className="text-muted-foreground leading-relaxed">
          loader 에서 <code className="rounded bg-muted px-1">throw notFound()</code> 하면, 에러가
          아니라 <strong>“없음”</strong> 전용 UI(<code className="rounded bg-muted px-1">notFoundComponent</code>)
          로 넘어간다. 라우트별로 두거나 라우터 전역(<code className="rounded bg-muted px-1">defaultNotFoundComponent</code>)
          으로 둘 수 있다.
        </p>
      </div>

      <Example title="notFound 흐름" code={CODE_NF}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/auth/notfound" search={{ missing: false }} />}
            >
              정상 항목
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/auth/notfound" search={{ missing: true }} />}
            >
              없는 항목 → notFound
            </Button>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">{data.title}</div>
        </div>
      </Example>
    </div>
  )
}
