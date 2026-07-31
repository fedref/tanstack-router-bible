import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'

// 루트 컨텍스트 타입. main.tsx 에서 { queryClient } 를 주입한다.
export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen">
      <nav className="flex gap-4 border-b px-6 py-3 text-sm">
        <Link to="/" className="hover:underline" activeProps={{ className: 'font-bold' }}>
          Home
        </Link>
      </nav>

      <main className="p-6">
        <Outlet />
      </main>

      {/* 좌하단 아이콘으로 매칭된 라우트 / loader / search 를 관찰한다. */}
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  )
}
