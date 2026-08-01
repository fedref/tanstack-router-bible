import {
  createFileRoute,
  isMatch,
  useCanGoBack,
  useLocation,
  useMatchRoute,
  useMatches,
  useRouter,
} from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/11-match-api.md
//
// loader 가 crumb 을 흘려 주면 useMatches 로 브레드크럼을 자동 생성할 수 있다.
export const Route = createFileRoute('/matches/')({
  loader: () => ({ crumb: 'Match API' }),
  component: MatchesDemo,
})

const CODE_CRUMBS = `// 각 라우트가 loader 에서 자기 이름을 흘려 준다
export const Route = createFileRoute('/matches/')({
  loader: () => ({ crumb: 'Match API' }),
})

// 공용 브레드크럼: crumb 을 가진 매치만 골라낸다
const matches = useMatches()

// ⚠️ filter 에 인라인 화살표로 넘기면 타입 술어가 전파되지 않는다.
//    반환 타입을 명시해야 loaderData 가 좁혀진 채로 넘어온다.
const crumbs = matches.filter(
  (m): m is typeof m & { loaderData: { crumb: string } } =>
    isMatch(m, 'loaderData.crumb'),
)

crumbs.map((m) => m.loaderData.crumb)   // ✅ 옵셔널 체이닝 없이 접근된다`

const CODE_MATCHROUTE = `const matchRoute = useMatchRoute()

// 매칭되면 params 객체를, 아니면 false 를 반환한다
matchRoute({ to: '/matches' })        // 정확 매칭
matchRoute({ to: '/matches', fuzzy: true })   // 하위 경로 포함
matchRoute({ to: '/query', pending: true })    // 이동 중인 것도 포함`

const CODE_SELECT = `// ❌ 매치의 어느 필드가 바뀌어도 리렌더된다
const matches = useMatches()

// ✅ 필요한 것만 구독 — 값이 바뀔 때만 리렌더된다
const isAnyLoading = useMatches({
  select: (matches) => matches.some((m) => m.isFetching),
})`

function MatchesDemo() {
  const matches = useMatches()
  const matchRoute = useMatchRoute()
  const canGoBack = useCanGoBack()
  const router = useRouter()

  // select 로 좁혀 구독한다 — boolean 이 바뀔 때만 리렌더
  const isAnyLoading = useMatches({
    select: (ms) => ms.some((m) => m.isFetching !== false),
  })

  // location 도 필요한 조각만 구독한다
  const pathname = useLocation({ select: (l) => l.pathname })

  // isMatch 는 타입 가드지만, filter 에 인라인 화살표로 넘기면 술어가 전파되지 않는다.
  // 반환 타입을 명시해 좁혀진 타입을 filter 결과까지 끌고 온다.
  const crumbs = matches.filter(
    (m): m is typeof m & { loaderData: { crumb: string } } =>
      isMatch(m, 'loaderData.crumb'),
  )

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">매치 배열은 곧 계층 구조다</h3>
          <p className="text-muted-foreground leading-relaxed">
            URL 하나에 매칭되는 라우트는 여러 개다. 지금 이 화면만 해도{' '}
            <code className="rounded bg-muted px-1">__root</code> →{' '}
            <code className="rounded bg-muted px-1">/matches</code> →{' '}
            <code className="rounded bg-muted px-1">/matches</code> 세 개가 동시에
            살아 있다. 이 배열을 그대로 쓰면 브레드크럼이 된다.
          </p>
        </div>

        <Example title="현재 매치 전부 (useMatches)" code={CODE_CRUMBS}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              {matches.map((m, i) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center gap-2 rounded border px-2 py-1.5"
                >
                  <Badge variant="outline">{i}</Badge>
                  <code className="text-xs">{m.routeId}</code>
                  <Badge
                    variant={m.status === 'success' ? 'secondary' : 'outline'}
                    className="ml-auto"
                  >
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="rounded border bg-muted/40 px-2 py-1.5">
              <span className="text-xs text-muted-foreground">
                crumb 을 가진 매치로 만든 브레드크럼:
              </span>{' '}
              <span className="font-medium">
                {crumbs.length
                  ? crumbs.map((m) => m.loaderData.crumb).join(' / ')
                  : '(없음)'}
              </span>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">useMatchRoute — “지금 여기 있나?”</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">Link</code> 의{' '}
            <code className="rounded bg-muted px-1">activeProps</code> 로는 부족할 때, 즉
            링크가 아닌 UI를 경로에 따라 바꿀 때 쓴다. 매칭되면{' '}
            <strong className="text-foreground">params 객체</strong>를, 아니면{' '}
            <code className="rounded bg-muted px-1">false</code> 를 반환한다.
          </p>
        </div>

        <Example title="경로 판정" code={CODE_MATCHROUTE}>
          <div className="space-y-1.5">
            {[
              { label: "matchRoute({ to: '/matches' })", v: matchRoute({ to: '/matches' }) },
              { label: "matchRoute({ to: '/matches' })", v: matchRoute({ to: '/matches' }) },
              { label: "matchRoute({ to: '/matches', fuzzy: true })", v: matchRoute({ to: '/matches', fuzzy: true }) },
              { label: "matchRoute({ to: '/query' })", v: matchRoute({ to: '/query' }) },
            ].map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap items-center gap-2 rounded border px-2 py-1.5"
              >
                <code className="text-xs">{row.label}</code>
                <Badge variant={row.v ? 'secondary' : 'outline'} className="ml-auto">
                  {row.v ? 'match' : 'false'}
                </Badge>
              </div>
            ))}
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">select 로 리렌더 줄이기</h3>
          <p className="text-muted-foreground leading-relaxed">
            이 장의 훅들은 대부분{' '}
            <code className="rounded bg-muted px-1">select</code> 를 받는다. 없이 쓰면 매치의
            아주 작은 변화에도 리렌더된다.{' '}
            <strong className="text-foreground">select 를 기본값처럼 쓰는 것</strong>이 요령이다.
          </p>
        </div>

        <Example title="좁혀 구독하기" code={CODE_SELECT}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 rounded border px-2 py-1.5">
              <code className="text-xs">useLocation({'{ select: l =&gt; l.pathname }'})</code>
              <span className="ml-auto font-medium">{pathname}</span>
            </div>
            <div className="flex items-center gap-2 rounded border px-2 py-1.5">
              <code className="text-xs">useMatches({'{ select: … isFetching }'})</code>
              <Badge variant="outline" className="ml-auto">
                {isAnyLoading ? '로딩 중' : 'idle'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 rounded border px-2 py-1.5">
              <code className="text-xs">useCanGoBack()</code>
              <Badge variant="outline" className="ml-auto">
                {String(canGoBack)}
              </Badge>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!canGoBack}
              onClick={() => router.history.back()}
            >
              뒤로 (useCanGoBack 으로 비활성화)
            </Button>
            <span className="text-xs text-muted-foreground">
              첫 진입 화면이면 비활성화된다 — 확인 없이 back() 하면 앱 밖으로 나간다.
            </span>
          </div>
        </Example>
      </section>
    </div>
  )
}
