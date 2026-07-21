import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/02-navigation.md
//
// `navigation.tsx` 는 Chapter 02의 레이아웃 라우트다. 상단 서브탭 + <Outlet/> 구조는
// Chapter 01의 routing.tsx 와 동일한 패턴이다(레이아웃 공유).
export const Route = createFileRoute('/navigation')({
  component: NavigationLayout,
})

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: '/navigation', label: '개요', exact: true },
  { to: '/navigation/link', label: 'Link 심화' },
  { to: '/navigation/imperative', label: 'useNavigate' },
  { to: '/navigation/preloading', label: 'Preloading' },
  { to: '/navigation/events', label: 'Router Events' },
]

function NavigationLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 02</Badge>
        <h1 className="text-2xl font-bold tracking-tight">네비게이션</h1>
        <p className="text-muted-foreground leading-relaxed">
          화면을 옮기는 방법은 크게 둘이다. 선언형{' '}
          <code className="rounded bg-muted px-1 text-sm">&lt;Link&gt;</code> 와 명령형{' '}
          <code className="rounded bg-muted px-1 text-sm">useNavigate()</code>. 여기에 미리
          로드(Preloading)와 이동 이벤트 관찰(Router Events)까지 익히면, 사용자가 “빠르다”고
          느끼는 이동을 만들 수 있다.
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
