import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/12-*.md
export const Route = createFileRoute('/errors')({
  component: ChapterLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/errors', label: '세 흐름 구분', exact: true },
  { to: '/errors/boundary', label: 'CatchBoundary' },
]

function ChapterLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 12</Badge>
        <h1 className="text-2xl font-bold tracking-tight">에러 · NotFound 경계</h1>
        <p className="text-muted-foreground leading-relaxed">
          라우터에서 정상이 아닌 흐름은 세 종류다 — Error(실패) · NotFound(없음) · Redirect(이동). 셋은 서로 다르게 다뤄야 한다.
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
