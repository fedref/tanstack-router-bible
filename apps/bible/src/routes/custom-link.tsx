import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/16-*.md
export const Route = createFileRoute('/custom-link')({
  component: ChapterLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/custom-link', label: 'createLink · useLinkProps', exact: true },
]

function ChapterLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 16</Badge>
        <h1 className="text-2xl font-bold tracking-tight">커스텀 Link & 유틸</h1>
        <p className="text-muted-foreground leading-relaxed">
          디자인 시스템 컴포넌트를 타입 안전한 라우터 링크로 승격시킨다. createLink 와 useLinkProps.
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
