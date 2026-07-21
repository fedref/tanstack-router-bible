import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { auth, useAuth } from '@/lib/auth'

// 📖 대응 문서: docs/08-synergy.md
// 여러 Chapter의 기능을 한 흐름에 엮은 미니 앱.
export const Route = createFileRoute('/kitchen-sink')({
  component: KitchenSinkLayout,
})

const COMBINED = [
  '인증 가드(06)',
  'Router Context · queryClient(05)',
  '검증된 Search Params(03)',
  'loaderDeps + 프리페치(04)',
  'Query 캐시 · useSuspenseQuery(07)',
  'Path Params · notFound(03·06)',
]

function KitchenSinkLayout() {
  const authed = useAuth()

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 08</Badge>
        <h1 className="text-2xl font-bold tracking-tight">시너지 종합 — 미니 카탈로그</h1>
        <p className="text-muted-foreground leading-relaxed">
          지금까지의 기능을 하나의 화면 흐름으로 합쳐 본다. <strong>로그인 → 검색/필터 → 상세</strong>
          로 이어지는 이 작은 앱 안에서 각 기능이 어떻게 맞물리는지 느껴 보라.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMBINED.map((c) => (
            <Badge key={c} variant="outline">
              {c}
            </Badge>
          ))}
        </div>
      </div>

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

      <Card>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
