import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/15-*.md
export const Route = createFileRoute('/masking')({
  component: ChapterLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/masking', label: 'Route Masking', exact: true },
  { to: '/masking/scroll', label: '스크롤 복원' },
]

function ChapterLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 15</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Masking · 스크롤 · 전환</h1>
        <p className="text-muted-foreground leading-relaxed">
          URL 과 화면 사이의 어긋남을 다룬다. 주소창에는 A 를 보여 주면서 실제로는 B 를 렌더하거나, 뒤로 갔을 때 보던 위치로 되돌린다.
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
