import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/10-*.md
export const Route = createFileRoute('/deferred')({
  component: ChapterLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/deferred', label: 'Await · 부분 스트리밍', exact: true },
]

function ChapterLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 10</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Deferred & 스트리밍</h1>
        <p className="text-muted-foreground leading-relaxed">
          느린 데이터 때문에 빠른 데이터까지 기다리게 하지 않는다. loader 에서 await 를 붙이느냐 마느냐 — 그 한 글자가 갈림길이다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.to}
            size="sm"
            variant={isActive(t.to, t.exact) ? 'secondary' : 'ghost'}
            nativeButton={false}
            render={<Link to={t.to} />}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
