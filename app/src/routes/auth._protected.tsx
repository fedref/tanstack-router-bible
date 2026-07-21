import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

// pathless 레이아웃: 앞 밑줄(_protected)이라 URL에는 안 붙는다(/auth/dashboard 그대로).
// 하지만 beforeLoad 가드는 이 아래 모든 라우트에 공유된다 → "한 곳에서 보호".
export const Route = createFileRoute('/auth/_protected')({
  beforeLoad: ({ location }) => {
    if (!auth.isAuthenticated()) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href }, // 로그인 후 되돌아올 위치
      })
    }
  },
  component: () => <Outlet />,
})
