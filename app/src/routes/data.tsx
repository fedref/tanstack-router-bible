import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/04-data-loading.md
export const Route = createFileRoute('/data')({
  component: DataLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/data', label: '개요', exact: true },
  { to: '/data/basics', label: 'loader · pending · error' },
  { to: '/data/deps', label: 'loaderDeps · staleTime' },
  { to: '/data/mutations', label: 'Mutations · invalidate' },
]

function DataLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 04</Badge>
        <h1 className="text-2xl font-bold tracking-tight">데이터 로딩 / 변경</h1>
        <p className="text-muted-foreground leading-relaxed">
          라우트마다 <code className="rounded bg-muted px-1 text-sm">loader</code> 를 달면, 컴포넌트가
          그려지기 <strong>전에</strong> 데이터를 받아 둘 수 있다. 여기에 캐시(staleTime),
          로딩/에러 상태, 그리고 변경 후 다시 로드하는 <code className="rounded bg-muted px-1 text-sm">invalidate</code>
          까지 익히면 데이터 흐름의 뼈대가 완성된다.
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
