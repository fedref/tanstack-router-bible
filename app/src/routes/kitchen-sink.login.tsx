import { createFileRoute, useRouter } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth, useAuth } from '@/lib/auth'

// 공개 라우트(_app 밖) — 가드가 여기로 튕겨 보낸다.
export const Route = createFileRoute('/kitchen-sink/login')({
  validateSearch: (s: Record<string, unknown>): { redirect: string } => ({
    redirect: typeof s.redirect === 'string' ? s.redirect : '/kitchen-sink',
  }),
  component: LoginGate,
})

function LoginGate() {
  const { redirect } = Route.useSearch()
  const router = useRouter()
  const authed = useAuth()

  return (
    <div className="space-y-3 text-sm">
      <h3 className="font-semibold">로그인이 필요합니다</h3>
      <p className="text-muted-foreground leading-relaxed">
        카탈로그는 보호된 영역이다. 로그인하면 원래 가려던{' '}
        <code className="rounded bg-muted px-1">{redirect}</code> 로 돌아간다.
      </p>
      <Button
        size="sm"
        disabled={authed}
        onClick={() => {
          auth.login()
          router.history.push(redirect)
        }}
      >
        <LogIn className="size-4" />
        {authed ? '이미 로그인됨' : '로그인하고 계속'}
      </Button>
    </div>
  )
}
