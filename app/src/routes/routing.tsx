import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/01-routing.md
//
// `routing.tsx` 는 **레이아웃 라우트**다. 자체 경로 `/routing` 을 가지며,
// 하위(`/routing/*`) 라우트가 렌더될 자리를 <Outlet/> 으로 제공한다.
// 이 컴포넌트의 서브탭은 하위 경로를 이동해도 그대로 유지된다(레이아웃 공유).
export const Route = createFileRoute('/routing')({
  component: RoutingLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/routing', label: '개념 개요', exact: true },
  { to: '/routing/concepts', label: '라우트 종류', exact: true },
  { to: '/routing/matching', label: '매칭 · 동적 세그먼트' },
]

function RoutingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 01</Badge>
        <h1 className="text-2xl font-bold tracking-tight">라우팅 기초</h1>
        <p className="text-muted-foreground leading-relaxed">
          이 영역 상단의 서브탭은 <code className="rounded bg-muted px-1 text-sm">routing.tsx</code>
          (레이아웃 라우트)가 그린다. 탭을 바꿔도 이 헤더와 탭은 유지되고, 아래{' '}
          <code className="rounded bg-muted px-1 text-sm">Outlet</code> 자리만 교체된다.
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
          {/* 하위 라우트가 여기에 렌더된다 */}
          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
