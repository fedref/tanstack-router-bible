import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/07-query-integration.md
export const Route = createFileRoute('/query')({
  component: QueryLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/query', label: '개요', exact: true },
  { to: '/query/prefetch', label: 'loader 프리페치' },
  { to: '/query/search', label: 'Search ↔ queryKey' },
  { to: '/query/mutation', label: 'Mutation' },
]

function QueryLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 07</Badge>
        <h1 className="text-2xl font-bold tracking-tight">TanStack Query 통합</h1>
        <p className="text-muted-foreground leading-relaxed">
          Router 의 loader 로 <strong>미리 받고</strong>, Query 의 캐시로 <strong>공유·갱신</strong>
          한다. 둘의 접점은 하나 — 라우트 context 에 넣어 둔{' '}
          <code className="rounded bg-muted px-1 text-sm">queryClient</code>. loader 에서 프리페치하고
          컴포넌트에서 <code className="rounded bg-muted px-1 text-sm">useSuspenseQuery</code> 로 꺼내
          쓰는 게 핵심 패턴이다.
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
