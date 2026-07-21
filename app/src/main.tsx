import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { routeTree } from './routeTree.gen'

// 렌더 전에 저장된 테마를 적용해 다크/라이트 깜빡임을 방지한다.
function initTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = saved ? saved === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', dark)
}
initTheme()

// Router Context 로 queryClient 를 내려주면 모든 loader/beforeLoad 에서 접근할 수 있다.
// (Chapter 05 Router Context, Chapter 07 Query 통합에서 본격적으로 활용)
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
})

// GitHub Pages 프로젝트 사이트 대응: vite base(BASE_URL)와 라우터 basepath 를 맞춘다.
const rawBase = import.meta.env.BASE_URL.replace(/\/$/, '')

const router = createRouter({
  routeTree,
  context: { queryClient },
  // 링크에 마우스를 올리면(intent) 미리 로드 → 체감 속도 향상 (Chapter 02 Preloading)
  defaultPreload: 'intent',
  scrollRestoration: true,
  basepath: rawBase || undefined,
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
