import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { auth, useAuth } from '@/lib/auth'

// 📖 대응 문서: docs/06-lifecycle-auth.md
export const Route = createFileRoute('/auth')({
  component: AuthLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/auth', label: '개요', exact: true },
  { to: '/auth/login', label: '로그인' },
  { to: '/auth/dashboard', label: '대시보드 (보호됨)' },
  { to: '/auth/notfound', label: 'Not Found' },
]

function AuthLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const authed = useAuth()
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 06</Badge>
        <h1 className="text-2xl font-bold tracking-tight">라이프사이클 &amp; 인증</h1>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1 text-sm">beforeLoad</code> 는 라우트 진입 전에 가장
          먼저 실행된다. 여기서 인증을 검사해 로그인 페이지로 <code className="rounded bg-muted px-1 text-sm">redirect</code>
          하거나, 데이터가 없으면 <code className="rounded bg-muted px-1 text-sm">notFound()</code> 로
          없음 상태를 만든다.
        </p>
      </div>

      {/* 로그인 상태 바 — 여기서 토글하고 보호된 라우트의 반응을 관찰하라 */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-2 text-sm">
        <span className="text-muted-foreground">인증 상태:</span>
        <Badge variant={authed ? 'default' : 'outline'}>
          {authed ? '로그인됨' : '로그아웃'}
        </Badge>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" disabled={authed} onClick={() => auth.login()}>
            로그인
          </Button>
          <Button size="sm" variant="outline" disabled={!authed} onClick={() => auth.logout()}>
            로그아웃
          </Button>
        </div>
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
