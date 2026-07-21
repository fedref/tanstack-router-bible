import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'
import { auth, useAuth } from '@/lib/auth'

export const Route = createFileRoute('/auth/login')({
  // 어디서 튕겨 왔는지 기억한다. 없으면 대시보드로.
  validateSearch: (s: Record<string, unknown>): { redirect: string } => ({
    redirect: typeof s.redirect === 'string' ? s.redirect : '/auth/dashboard',
  }),
  component: LoginPage,
})

const CODE_LOGIN = `function LoginPage() {
  const { redirect } = Route.useSearch()   // 가드가 넣어 준 원래 위치
  const router = useRouter()

  function onLogin() {
    auth.login()
    router.history.push(redirect)   // 원래 가려던 곳으로 되돌려보낸다
  }
}`

function LoginPage() {
  const { redirect } = Route.useSearch()
  const router = useRouter()
  const authed = useAuth()

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">로그인</h3>
        <p className="text-muted-foreground leading-relaxed">
          가드가 튕겨 보낸 원래 위치는 <code className="rounded bg-muted px-1">?redirect</code> 에
          담겨 있다. 로그인하면 그곳으로 되돌려보낸다.
        </p>
      </div>

      <Example title="로그인 → 원래 위치 복귀" code={CODE_LOGIN}>
        <div className="space-y-3">
          <p className="text-muted-foreground">
            돌아갈 곳: <code className="rounded bg-muted px-1">{redirect}</code>
          </p>
          <Button
            size="sm"
            disabled={authed}
            onClick={() => {
              auth.login()
              router.history.push(redirect)
            }}
          >
            {authed ? '이미 로그인됨' : '로그인하고 돌아가기'}
          </Button>
        </div>
      </Example>
    </div>
  )
}
