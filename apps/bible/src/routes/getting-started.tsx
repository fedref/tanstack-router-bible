import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CodeBlock } from '@/components/code-block'

// 📖 대응 문서: docs/00-getting-started.md
//
// 00장은 설치·설정이라 "눌러 볼" 화면이 없다. 대신 이 앱이 실제로 어떻게 셋업됐는지
// 그 코드를 그대로 보여 준다 — 문서의 예제가 아니라 지금 이 화면을 돌리고 있는 코드다.
export const Route = createFileRoute('/getting-started')({
  component: GettingStarted,
})

const CODE_INSTALL = `# 라우터 본체 + 파일기반 라우팅 플러그인
pnpm add @tanstack/react-router
pnpm add -D @tanstack/router-plugin @tanstack/react-router-devtools

# 이 앱은 TanStack Query 도 함께 쓴다 (Chapter 07)
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools`

const CODE_VITE = `// apps/bible/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  // GitHub Pages 프로젝트 사이트는 /<repo>/ 하위에 배포된다.
  // CI 에서 VITE_BASE=/<repo>/ 를 주고, 로컬 개발에서는 '/' 를 쓴다.
  base: process.env.VITE_BASE || '/',
  plugins: [
    // 파일기반 라우팅: src/routes/** 를 스캔해 routeTree.gen.ts 를 자동 생성한다.
    // react() 앞에 두어야 생성된 트리를 react 플러그인이 인식한다.
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
})`

const CODE_MAIN = `// apps/bible/src/main.tsx (핵심 발췌)
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'   // ← 플러그인이 만든 파일

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000 } },
})

// GitHub Pages 대응: vite base(BASE_URL)와 라우터 basepath 를 맞춘다
const rawBase = import.meta.env.BASE_URL.replace(/\\/$/, '')

const router = createRouter({
  routeTree,
  context: { queryClient },      // 모든 loader/beforeLoad 에서 접근 (05 · 07장)
  defaultPreload: 'intent',      // hover 시 미리 로드 (02장)
  scrollRestoration: true,       // 뒤로가기 시 스크롤 복원 (15장)
  basepath: rawBase || undefined,
})

// 이 한 번의 선언으로 앱 전체에서 Link to, params, search 가 타입 추론된다
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
)`

const CODE_ROUTE = `// apps/bible/src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <h1>Home</h1>,
})`

const CODE_DEVTOOLS = `// apps/bible/src/routes/__root.tsx (발췌)
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function RootLayout() {
  return (
    <>
      {/* …레이아웃… */}
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}`

const STEPS: { no: string; title: string; code: string; lang?: string; body: React.ReactNode }[] = [
  {
    no: '1',
    title: '설치',
    code: CODE_INSTALL,
    lang: 'bash',
    body: (
      <>
        <code className="rounded bg-muted px-1">router-plugin</code> 은{' '}
        <strong className="text-foreground">개발 의존성</strong>이다. 빌드 시점에{' '}
        <code className="rounded bg-muted px-1">routeTree.gen.ts</code> 를 만들어 줄 뿐,
        런타임에는 관여하지 않는다. Devtools 도 마찬가지다.
      </>
    ),
  },
  {
    no: '2',
    title: '플러그인 셋업 — 순서가 중요하다',
    code: CODE_VITE,
    lang: 'ts',
    body: (
      <>
        <strong className="text-foreground">
          <code className="rounded bg-muted px-1">TanStackRouterVite()</code> 를{' '}
          <code className="rounded bg-muted px-1">react()</code> 앞에 둔다.
        </strong>{' '}
        뒤에 두면 생성된 <code className="rounded bg-muted px-1">routeTree.gen.ts</code> 가
        react 플러그인의 변환 대상에서 빠질 수 있다. Rspack · Webpack · Esbuild 용 진입점도
        같은 패키지에 들어 있다(18장).
      </>
    ),
  },
  {
    no: '3',
    title: '라우터 부트스트랩',
    code: CODE_MAIN,
    lang: 'tsx',
    body: (
      <>
        <code className="rounded bg-muted px-1">declare module</code> 블록이{' '}
        <strong className="text-foreground">앱 전역 타입 추론을 켜는 스위치</strong>다. 이걸
        빠뜨리면 <code className="rounded bg-muted px-1">Link</code> 의{' '}
        <code className="rounded bg-muted px-1">to</code> 가 그냥{' '}
        <code className="rounded bg-muted px-1">string</code> 이 되면서도{' '}
        <strong className="text-foreground">에러는 나지 않는다</strong> — "자동완성이 안
        되는데요"의 대부분이 이것이다(05 · 22장).
      </>
    ),
  },
  {
    no: '4',
    title: '첫 라우트',
    code: CODE_ROUTE,
    lang: 'tsx',
    body: (
      <>
        <code className="rounded bg-muted px-1">createFileRoute('/')</code> 의 경로 문자열은{' '}
        <strong className="text-foreground">플러그인이 파일 위치를 보고 채워 준다.</strong>{' '}
        직접 맞출 필요가 없고, 파일을 옮기면 자동으로 갱신된다. 어긋나면 타입 에러로
        잡힌다(01장).
      </>
    ),
  },
  {
    no: '5',
    title: 'Devtools 배치',
    code: CODE_DEVTOOLS,
    lang: 'tsx',
    body: (
      <>
        <code className="rounded bg-muted px-1">RouterProvider</code> 컨텍스트 안에 있어야
        라우터 상태를 읽을 수 있으므로{' '}
        <code className="rounded bg-muted px-1">__root.tsx</code> 에 둔다. 프로덕션 번들에서
        빼려면 조건부 lazy 로딩을 쓴다(20장).
      </>
    ),
  },
]

function GettingStarted() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 00</Badge>
        <h1 className="text-2xl font-bold tracking-tight">Getting Started</h1>
        <p className="text-muted-foreground leading-relaxed">
          설치와 설정은 <strong className="text-foreground">눌러 볼 화면이 없다.</strong>{' '}
          대신 아래 코드는 문서용 예제가 아니라{' '}
          <strong className="text-foreground">지금 이 화면을 돌리고 있는 실제 코드</strong>다.
          `apps/bible/` 에서 그대로 확인할 수 있다.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 text-sm">
          {STEPS.map((s) => (
            <section key={s.no} className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <span className="flex size-5 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
                  {s.no}
                </span>
                {s.title}
              </h3>
              <CodeBlock code={s.code} language={s.lang ?? 'tsx'} />
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </section>
          ))}

          <section className="space-y-2">
            <h3 className="font-semibold">Devtools 읽는 법</h3>
            <p className="text-muted-foreground leading-relaxed">
              좌하단 아이콘을 눌러 보라. 정보가 많아 처음엔 압도되는데,{' '}
              <strong className="text-foreground">실제로 자주 보게 되는 것은 네 가지</strong>다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="pb-1 pr-3">패널</th>
                    <th className="pb-1 pr-3">볼 것</th>
                    <th className="pb-1">언제 유용한가</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-1 pr-3 font-medium">Matches</td>
                    <td className="pr-3">매칭된 라우트와 status</td>
                    <td>왜 이 컴포넌트가 안 뜨지?</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-1 pr-3 font-medium">Loader Data</td>
                    <td className="pr-3">각 매치의 loaderData</td>
                    <td>데이터가 왜 undefined 지?</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-1 pr-3 font-medium">Search Params</td>
                    <td className="pr-3">검증 후의 search 값</td>
                    <td>validateSearch 가 기대대로 도나?</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-1 pr-3 font-medium">Route Tree</td>
                    <td className="pr-3">전체 라우트 트리</td>
                    <td>파일 이름이 의도한 URL 이 됐나?</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              11장의 Match API 가 코드로 읽는 것을 Devtools 는 화면으로 보여 준다. 둘을 함께
              알면 디버깅이 빨라진다(21장 디버깅 레시피).
            </p>
          </section>

          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">
                <code className="rounded bg-muted px-1">routeTree.gen.ts</code> 는 커밋할까?
              </strong>{' '}
              공식은 <strong className="text-foreground">"커밋하라"</strong> 고 답한다 —
              빌드 산출물이 아니라 런타임의 일부라는 이유다. 이 저장소는 학습용이라
              생성물 diff 를 피하려고 `.gitignore` 에 넣었고, 그 대가로 clone 직후
              typecheck 가 실패한다(<code className="rounded bg-muted px-1">pnpm build</code>{' '}
              를 한 번 돌려야 한다). 자세한 트레이드오프는 22장에 있다.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link to="/routing" />}>
          01. 라우팅 기초로 →
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
          전체 Chapter 목차
        </Button>
      </div>
    </div>
  )
}
