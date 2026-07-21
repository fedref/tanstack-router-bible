import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/05-type-safety-context.md
export const Route = createFileRoute('/type-safety')({
  component: TypeSafetyLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/type-safety', label: '개요', exact: true },
  { to: '/type-safety/context', label: 'Router Context' },
  { to: '/type-safety/utils', label: 'getRouteApi · 유틸' },
]

function TypeSafetyLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 05</Badge>
        <h1 className="text-2xl font-bold tracking-tight">타입 안전성 &amp; 컨텍스트</h1>
        <p className="text-muted-foreground leading-relaxed">
          이 라우터의 정체성이다. <code className="rounded bg-muted px-1 text-sm">Register</code> 선언
          한 번으로 경로·params·search·context 의 타입이 앱 전체로 흐른다. 여기에{' '}
          <strong>Router Context</strong>(의존성 주입)와{' '}
          <code className="rounded bg-muted px-1 text-sm">getRouteApi</code>(컴포넌트 밖에서도 타입
          유지)를 익힌다.
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
