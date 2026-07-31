import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { Example } from '@/components/example'

// 파일: auth._protected.dashboard.tsx → URL: /auth/dashboard
// (_protected 는 pathless 라 URL에서 사라진다)
export const Route = createFileRoute('/auth/_protected/dashboard')({
  component: Dashboard,
})

const CODE_DASH = `// 이 파일에는 인증 코드가 한 줄도 없다.
// 보호는 부모 pathless 레이아웃(auth._protected.tsx)이 전담한다.
export const Route = createFileRoute('/auth/_protected/dashboard')({
  component: Dashboard,   // 여기까지 왔다면 이미 로그인된 상태
})`

function Dashboard() {
  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">보호된 대시보드</h3>
        <p className="text-muted-foreground leading-relaxed">
          이 화면이 보인다면 <code className="rounded bg-muted px-1">_protected</code> 가드를 통과한
          것이다. 정작 이 라우트 파일에는 인증 코드가 없다 — 보호 로직은 부모 pathless 레이아웃에
          모여 있다. 위 상태 바에서 <strong>로그아웃</strong> 후 이 탭을 다시 누르면 로그인으로
          튕긴다.
        </p>
      </div>

      <Example title="보호된 라우트" code={CODE_DASH}>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-4">
          <CheckCircle2 className="size-5 text-primary" />
          <span>인증됨 — 비밀 데이터에 접근 중</span>
        </div>
      </Example>
    </div>
  )
}
