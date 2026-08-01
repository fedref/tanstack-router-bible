import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, MousePointerClick } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// 파일 경로 `routes/index.tsx` → URL `/` (index 라우트)
export const Route = createFileRoute('/')({
  component: Home,
})

type Module = {
  id: string
  title: string
  desc: string
  /** 실행 예제 라우트. 없으면 문서 전용 */
  to?: string
  doc: string
}

// 기초 — 쓰는 순서
const BASICS: Module[] = [
  { id: '00', title: 'Getting Started', desc: '설치 · 플러그인 셋업 · 라우터 부트스트랩 · Devtools', to: '/getting-started', doc: '00-getting-started' },
  { id: '01', title: '라우팅 기초', desc: '라우트 트리 · 매칭 우선순위 · 파일 네이밍 · Outlet', to: '/routing', doc: '01-routing' },
  { id: '02', title: '네비게이션', desc: 'Link · useNavigate · 상대 경로 · Preloading · Events', to: '/navigation', doc: '02-navigation' },
  { id: '03', title: '파라미터', desc: 'Path/Search Params · optional · prefix/suffix · 직렬화', to: '/params', doc: '03-params' },
  { id: '04', title: '데이터 로딩/변경', desc: 'loader · loaderDeps · staleTime · shouldReload · Mutations', to: '/data', doc: '04-data-loading' },
  { id: '05', title: '타입 안전성 & 컨텍스트', desc: 'Register · Router Context · getRouteApi', to: '/type-safety', doc: '05-type-safety-context' },
  { id: '06', title: '라이프사이클 & 인증', desc: 'beforeLoad · pathless 가드 · redirect · notFound', to: '/auth', doc: '06-lifecycle-auth' },
  { id: '07', title: 'TanStack Query 통합', desc: 'queryOptions · ensureQueryData · useSuspenseQuery', to: '/query', doc: '07-query-integration' },
  { id: '08', title: '시너지 종합', desc: 'auth + context + search + loader + query 를 한 앱에', to: '/kitchen-sink', doc: '08-synergy' },
]

// 심화 — 남김없이
const ADVANCED: Module[] = [
  { id: '09', title: '코드 스플리팅 & Lazy', desc: 'autoCodeSplitting · createLazyFileRoute · codeSplitGroupings', to: '/code-splitting', doc: '09-code-splitting' },
  { id: '10', title: 'Deferred & 스트리밍', desc: 'defer · Await · useAwaited', to: '/deferred', doc: '10-deferred-streaming' },
  { id: '11', title: 'Match API & 라우터 상태', desc: 'useMatch(es) · useMatchRoute · useLocation · select', to: '/matches', doc: '11-match-api' },
  { id: '12', title: '에러 · NotFound 경계', desc: 'CatchBoundary · onError · notFoundMode · isRedirect', to: '/errors', doc: '12-error-boundaries' },
  { id: '13', title: 'Search 미들웨어 & 직렬화', desc: 'retainSearchParams · stripSearchParams · 직렬화 어댑터', to: '/search-mw', doc: '13-search-middleware' },
  { id: '14', title: '네비게이션 차단 & History', desc: 'useBlocker · Block · createMemoryHistory', to: '/blocking', doc: '14-blocking-history' },
  { id: '15', title: 'Masking · 스크롤 · 전환', desc: 'createRouteMask · ScrollRestoration · View Transitions', to: '/masking', doc: '15-masking-scroll' },
  { id: '16', title: '커스텀 Link · SSR API · 유틸', desc: 'createLink · useLinkProps · 경로 유틸 · protocolAllowlist', to: '/custom-link', doc: '16-custom-link-utils' },
  { id: '17', title: '옵션 전수 레퍼런스', desc: 'RouterOptions · Route/Link 옵션 · 타입 export 총람', doc: '17-options-reference' },
  { id: '18', title: '생성기 설정 · CLI · Virtual Routes', desc: 'tsr.config.json · 번들러별 설정 · Virtual File Routes', doc: '18-generator-config' },
  { id: '19', title: '국제화 (i18n)', desc: '{-$locale} optional param · rewrite · 언어 전환', doc: '19-i18n' },
  { id: '20', title: 'ESLint & Devtools', desc: '라우트 속성 순서 규칙 · Devtools 읽는 법', doc: '20-eslint-devtools' },
  { id: '21', title: '실전 레시피 (How-To)', desc: '테스트 · 디버깅 · 배포 · 환경변수 · RBAC · 마이그레이션', doc: '21-recipes' },
  { id: '22', title: '설계 철학 & FAQ', desc: '왜 이렇게 생겼나 · routeTree.gen.ts 커밋 여부 · FAQ', doc: '22-design-decisions-faq' },
]

const DOC_BASE =
  'https://github.com/fedref/tanstack-router-bible/blob/main/docs'

function ModuleCard({ m }: { m: Module }) {
  const inner = (
    <Card className="h-full gap-0 py-4 transition hover:border-primary/50">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            {m.to ? (
              <MousePointerClick className="size-4 text-primary" />
            ) : (
              <BookOpen className="size-4 text-muted-foreground/60" />
            )}
            {m.id} · {m.title}
          </CardTitle>
          <Badge variant={m.to ? 'default' : 'outline'}>
            {m.to ? '예제 있음' : '문서 전용'}
          </Badge>
        </div>
        <CardDescription className="pt-1">{m.desc}</CardDescription>
      </CardHeader>
    </Card>
  )

  // 예제가 있으면 카드를 그 라우트로, 없으면 문서로 보낸다
  return m.to ? (
    <Link to={m.to} className="block">
      {inner}
    </Link>
  ) : (
    <a
      href={`${DOC_BASE}/${m.doc}.md`}
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      {inner}
    </a>
  )
}

function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">v1.170 · React · 파일기반 + Base UI</Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          TanStack Router 학습 바이블
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          각 Chapter은 <code className="rounded bg-muted px-1.5 py-0.5 text-sm">docs/</code>
          의 Markdown 문서와 이 앱의 실행 예제가 짝을 이룬다. 문서에서 개념을 읽고, 여기서
          직접 눌러보며 확인하라. 좌하단 Devtools로 매칭된 라우트·loader·search 상태를
          관찰할 수 있다.
        </p>
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
        <p>
          <strong>Chapter 00 ~ 22.</strong> 00~08 이 “쓰는 순서”라면 09~22 는{' '}
          <strong>“남김없이”</strong> 를 담당한다.{' '}
          <code className="rounded bg-muted px-1">@tanstack/react-router</code> 가 export
          하는 <strong>값 100개 전부</strong>와 라우터·라우트·Link 옵션{' '}
          <strong>192개 전부</strong>를 다룬다.
        </p>
        <p className="text-muted-foreground">
          <MousePointerClick className="inline size-3.5" /> 예제 있음 — 카드를 누르면 실행
          화면으로. <BookOpen className="ml-2 inline size-3.5" /> 문서 전용 — 옵션 표·빌드
          설정처럼 눌러 볼 것이 없는 주제는 문서로 연결된다.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">기초 — 쓰는 순서</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {BASICS.map((m) => (
            <ModuleCard key={m.id} m={m} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">심화 — 남김없이</h2>
          <p className="text-sm text-muted-foreground">
            기초 8장에 담기지 않는 것들. 순서대로 읽어도 되고 필요할 때 골라 봐도 된다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ADVANCED.map((m) => (
            <ModuleCard key={m.id} m={m} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link to="/getting-started" />}>
          00. 설치와 셋업부터 시작
          <ArrowRight />
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to="/routing" />}
        >
          01. 라우팅 기초로 바로
        </Button>
      </div>
    </div>
  )
}
