import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/03-params.md
export const Route = createFileRoute('/params')({
  component: ParamsLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/params', label: '개요', exact: true },
  { to: '/params/path', label: 'Path Params' },
  { to: '/params/search', label: 'Search Params' },
  { to: '/params/serialization', label: '커스텀 직렬화' },
]

function ParamsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 03</Badge>
        <h1 className="text-2xl font-bold tracking-tight">파라미터</h1>
        <p className="text-muted-foreground leading-relaxed">
          URL의 두 종류 변수를 다룬다. 경로 조각인{' '}
          <strong>Path Params</strong>(<code className="rounded bg-muted px-1 text-sm">/users/$id</code>)
          와 <code className="rounded bg-muted px-1 text-sm">?</code> 뒤의{' '}
          <strong>Search Params</strong>. TanStack Router의 진짜 강점은 이 둘을 문자열이 아니라{' '}
          <strong>검증된 타입 값</strong>으로 다룬다는 데 있다.
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
