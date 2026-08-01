import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/09-*.md
export const Route = createFileRoute('/code-splitting')({
  component: ChapterLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/code-splitting', label: '개요 · 자동 분할', exact: true },
  { to: '/code-splitting/manual', label: '수동 분할 · lazy' },
]

function ChapterLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 09</Badge>
        <h1 className="text-2xl font-bold tracking-tight">코드 스플리팅 & Lazy</h1>
        <p className="text-muted-foreground leading-relaxed">
          지금 필요 없는 화면의 코드를 나중에 받게 만든다. 라우터는 어차피 URL 단위로 화면을 나누므로, 코드도 같은 경계로 나누기에 가장 자연스러운 지점이다.
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
