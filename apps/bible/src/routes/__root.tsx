import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Braces,
  Database,
  DatabaseZap,
  Filter,
  FunnelPlus,
  Hash,
  Home,
  KeyRound,
  Layers,
  Link2,
  LogIn,
  MousePointerClick,
  Navigation,
  Pencil,
  Puzzle,
  Radio,
  Route as RouteIcon,
  Search,
  Shield,
  Sparkles,
  SlidersHorizontal,
  Target,
  Wrench,
  Zap,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'

// 루트 컨텍스트 타입. main.tsx 에서 { queryClient } 를 주입한다.
// createRootRouteWithContext 로 선언하면 모든 하위 라우트의 beforeLoad/loader 에서
// context.queryClient 가 타입과 함께 노출된다. (Chapter 05 · 07)
export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

type NavItem = {
  title: string
  to: string
  icon: typeof Home
  exact?: boolean
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: 'Home',
    items: [{ title: '개요 · Chapter 목차', to: '/', icon: Home, exact: true }],
  },
  {
    label: '01 · 라우팅 기초',
    items: [
      { title: '개념 · 트리 · Outlet', to: '/routing', icon: RouteIcon, exact: true },
      { title: '라우트 종류', to: '/routing/concepts', icon: Layers, exact: true },
      { title: '매칭 · 동적 세그먼트', to: '/routing/matching', icon: Target },
    ],
  },
  {
    label: '02 · 네비게이션',
    items: [
      { title: '개요', to: '/navigation', icon: Navigation, exact: true },
      { title: 'Link 심화', to: '/navigation/link', icon: Link2, exact: true },
      { title: 'useNavigate', to: '/navigation/imperative', icon: MousePointerClick, exact: true },
      { title: 'Preloading', to: '/navigation/preloading', icon: Zap, exact: true },
      { title: 'Router Events', to: '/navigation/events', icon: Radio, exact: true },
    ],
  },
  {
    label: '03 · 파라미터',
    items: [
      { title: '개요', to: '/params', icon: SlidersHorizontal, exact: true },
      { title: 'Path Params', to: '/params/path', icon: Hash },
      { title: 'Search Params', to: '/params/search', icon: Search, exact: true },
      { title: '커스텀 직렬화', to: '/params/serialization', icon: Braces, exact: true },
    ],
  },
  {
    label: '04 · 데이터 로딩/변경',
    items: [
      { title: '개요', to: '/data', icon: Database, exact: true },
      { title: 'loader · pending · error', to: '/data/basics', icon: Database, exact: true },
      { title: 'loaderDeps · staleTime', to: '/data/deps', icon: Filter, exact: true },
      { title: 'Mutations · invalidate', to: '/data/mutations', icon: Pencil, exact: true },
    ],
  },
  {
    label: '05 · 타입 안전성 & 컨텍스트',
    items: [
      { title: '개요', to: '/type-safety', icon: Shield, exact: true },
      { title: 'Router Context', to: '/type-safety/context', icon: Puzzle, exact: true },
      { title: 'getRouteApi · 유틸', to: '/type-safety/utils', icon: Wrench, exact: true },
    ],
  },
  {
    label: '06 · 라이프사이클 & 인증',
    items: [
      { title: '개요', to: '/auth', icon: KeyRound, exact: true },
      { title: '로그인', to: '/auth/login', icon: LogIn, exact: true },
      { title: '대시보드 (보호됨)', to: '/auth/dashboard', icon: Shield, exact: true },
      { title: 'Not Found', to: '/auth/notfound', icon: Target, exact: true },
    ],
  },
  {
    label: '07 · TanStack Query 통합',
    items: [
      { title: '개요', to: '/query', icon: DatabaseZap, exact: true },
      { title: 'loader 프리페치', to: '/query/prefetch', icon: Zap, exact: true },
      { title: 'Search ↔ queryKey', to: '/query/search', icon: FunnelPlus, exact: true },
      { title: 'Mutation', to: '/query/mutation', icon: Pencil, exact: true },
    ],
  },
  {
    label: '08 · 시너지 종합',
    items: [
      { title: '미니 카탈로그', to: '/kitchen-sink', icon: Sparkles, exact: true },
    ],
  },
]

function RootLayout() {
  // 현재 경로를 구독해 사이드바 active 상태를 계산한다.
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(item.to + '/')

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Router Bible</p>
              <p className="text-xs text-muted-foreground">v1.170 · React</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      {/* Base UI 패턴: asChild 대신 render prop 으로 Link 를 주입한다.
                          아래 children(아이콘·라벨)은 Link 안으로 병합된다. */}
                      <SidebarMenuButton
                        isActive={isActive(item)}
                        render={<Link to={item.to} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            TanStack Router 학습 바이블
          </span>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto w-full max-w-3xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>

      {/* 개발 중에만 보이는 라우터/쿼리 상태 인스펙터 */}
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </SidebarProvider>
  )
}
