import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { routeTree } from './routeTree.gen'

// Router Context 로 queryClient 를 내려주면 모든 loader/beforeLoad 에서 접근할 수 있다.
// (docs/05-type-safety-context.md, docs/07-query-integration.md 참고)
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

// 전역 타입 등록: 이 한 번의 선언으로 앱 전체에서 Link `to`, params, search 가 타입 추론된다.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
