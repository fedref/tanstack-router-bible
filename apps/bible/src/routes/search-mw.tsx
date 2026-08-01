import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/13-*.md
export const Route = createFileRoute('/search-mw')({
  component: ChapterLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/search-mw', label: 'retain · strip', exact: true },
]

function ChapterLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 13</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Search 미들웨어 & 직렬화</h1>
        <p className="text-muted-foreground leading-relaxed">
          validateSearch 가 값을 검사한다면, 미들웨어는 이동할 때마다 값을 가공한다. 값을 따라다니게 하거나, 기본값이면 URL 에서 지운다.
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
