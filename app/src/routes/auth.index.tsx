import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/code-block'

export const Route = createFileRoute('/auth/')({
  component: AuthOverview,
})

const CODE_GUARD = `// pathless 레이아웃(_protected)에서 한 번만 가드를 건다.
// 이 레이아웃 아래 모든 라우트가 자동으로 보호된다.
export const Route = createFileRoute('/auth/_protected')({
  beforeLoad: ({ location }) => {
    if (!auth.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },   // 로그인 후 되돌아올 위치
      })
    }
  },
})`

function AuthOverview() {
  return (
    <div className="space-y-5 text-sm">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">beforeLoad = 진입 게이트</h2>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1">beforeLoad</code> 는 loader 보다도 먼저, 라우트에
          발을 들이기 직전에 실행된다. 여기서 <code className="rounded bg-muted px-1">redirect()</code>
          를 던지면 렌더가 시작되기도 전에 다른 곳으로 보내진다. 인증 게이트를 여기에 두는 이유다.
        </p>
        <CodeBlock code={CODE_GUARD} />
      </section>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-muted-foreground">
        위 상태 바에서 <strong>로그아웃</strong> 상태로 “대시보드(보호됨)” 탭을 눌러 보라 — 로그인
        페이지로 튕긴다. 로그인 후 다시 누르면 통과한다. “Not Found” 탭은{' '}
        <code className="rounded bg-muted px-1">notFound()</code> 흐름을 보여 준다.
      </div>
    </div>
  )
}
