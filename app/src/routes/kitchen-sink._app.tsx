import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

// pathless 가드(06). 카탈로그와 상세 모두 이 아래라 자동 보호된다.
export const Route = createFileRoute('/kitchen-sink/_app')({
  beforeLoad: ({ location }) => {
    if (!auth.isAuthenticated()) {
      throw redirect({ to: '/kitchen-sink/login', search: { redirect: location.href } })
    }
  },
  component: () => <Outlet />,
})
