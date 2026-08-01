import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/09-code-splitting.md
export const Route = createFileRoute('/code-splitting/manual')({
  component: ManualSplitting,
})

const CODE_SPLIT = `// posts.tsx — 즉시 로드되는 쪽
export const Route = createFileRoute('/posts')({
  loader: () => fetchPosts(),
  // component 를 여기 쓰지 않는다
})

// posts.lazy.tsx — 나중에 받는 쪽
export const Route = createLazyFileRoute('/posts')({
  component: PostsPage,
  pendingComponent: () => <div>불러오는 중…</div>,
  errorComponent: ({ error }) => <div>{error.message}</div>,
  notFoundComponent: () => <div>없는 글입니다</div>,
})

// 두 파일의 경로 문자열('/posts')이 같아야 한 라우트로 합쳐진다`

const CODE_TYPE = `// 타입이 규칙을 강제한다
type LazyRouteOptions = Pick<UpdatableRouteOptions<…>,
  'component' | 'errorComponent' | 'pendingComponent' | 'notFoundComponent'>

// loader, beforeLoad, validateSearch 는 넣을 수 없다 → 타입 에러
// "분리하면 안 되는 것"이 컴파일러 수준에서 차단된다`

const CODE_LRC = `import { lazyRouteComponent } from '@tanstack/react-router'

// default export
component: lazyRouteComponent(() => import('./-components/heavy-chart'))

// named export — 두 번째 인자로 이름
component: lazyRouteComponent(
  () => import('./-components/charts'),
  'RevenueChart',
)`

const CODE_GROUP = `// 라우트 하나만 — 세 컴포넌트를 한 청크로 묶는다
export const Route = createFileRoute('/dashboard')({
  codeSplitGroupings: [['component', 'pendingComponent', 'errorComponent']],
})

// 앱 전체 — 플러그인 옵션
TanStackRouterVite({
  autoCodeSplitting: true,
  codeSplittingOptions: {
    defaultBehavior: [['component'], ['errorComponent', 'notFoundComponent']],
    splitBehavior: ({ routeId }) => {
      if (routeId.startsWith('/admin')) {
        return [['component', 'pendingComponent', 'errorComponent']]
      }
      // undefined 를 반환하면 defaultBehavior 를 따른다
    },
  },
})`

function ManualSplitting() {
  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">
            <code className="rounded bg-muted px-1">.lazy.tsx</code> — 파일을 둘로 나눈다
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            자동 분할을 끄고 라우트별로 직접 고르고 싶을 때 쓴다. 규칙은 하나 —{' '}
            <strong className="text-foreground">한 라우트를 두 파일로</strong> 나누고, 두
            파일의 경로 문자열을 똑같이 맞춘다.
          </p>
        </div>

        <Example title="본체 + lazy 짝" code={CODE_SPLIT}>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border p-2">
              <Badge variant="outline">posts.tsx</Badge>
              <p className="mt-1.5 text-muted-foreground">
                즉시 로드 — loader · beforeLoad · validateSearch
              </p>
            </div>
            <div className="rounded border p-2">
              <Badge variant="secondary">posts.lazy.tsx</Badge>
              <p className="mt-1.5 text-muted-foreground">
                나중에 로드 — 컴포넌트 4종
              </p>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">규칙을 외울 필요가 없다 — 타입이 막는다</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">createLazyFileRoute</code> 에는 컴포넌트
            4종만 넣을 수 있다. 실수로 <code className="rounded bg-muted px-1">loader</code>{' '}
            를 넣으면 <strong className="text-foreground">타입 에러</strong>가 난다.
          </p>
        </div>
        <Example title="LazyRouteOptions 는 Pick 으로 제한된다" code={CODE_TYPE}>
          <p className="text-muted-foreground">
            코드기반 라우팅이라면 파일 경로 대신 라우트 id 로 짝을 짓는{' '}
            <code className="rounded bg-muted px-1">createLazyRoute('/posts')</code> 를 쓴다.
            받는 옵션은 동일하다.
          </p>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">
            <code className="rounded bg-muted px-1">lazyRouteComponent</code> vs React{' '}
            <code className="rounded bg-muted px-1">lazy</code>
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            둘 다 동적 import 를 감싸지만{' '}
            <strong className="text-foreground">라우터와의 협조 여부</strong>가 다르다. 이
            차이가 결정적이다.
          </p>
        </div>

        <Example title="컴포넌트 단위 지연 로드" code={CODE_LRC}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="pb-1"></th>
                  <th className="pb-1">React.lazy</th>
                  <th className="pb-1">lazyRouteComponent</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-t">
                  <td className="py-1 pr-2">Suspense</td>
                  <td>직접 감싸야 함</td>
                  <td>pendingComponent 가 처리</td>
                </tr>
                <tr className="border-t">
                  <td className="py-1 pr-2 font-medium">preload 연동</td>
                  <td className="text-muted-foreground">없음</td>
                  <td className="font-medium">hover 시 코드도 미리 받음</td>
                </tr>
                <tr className="border-t">
                  <td className="py-1 pr-2">에러 처리</td>
                  <td>직접 ErrorBoundary</td>
                  <td>errorComponent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">분할 단위를 직접 설계하기</h3>
          <p className="text-muted-foreground leading-relaxed">
            기본값은 컴포넌트 4종을 각각 떼는 것이다. 라우트가 100개면 최대 400개 청크가 될
            수 있고, HTTP/2 에서도 요청 수는 공짜가 아니다. 작은 컴포넌트끼리는 묶는 편이
            빠르다.
          </p>
        </div>
        <Example title="codeSplitGroupings · codeSplittingOptions" code={CODE_GROUP}>
          <p className="text-muted-foreground">
            지정 가능한 값은 다섯 가지다 —{' '}
            <code className="rounded bg-muted px-1">loader</code> ·{' '}
            <code className="rounded bg-muted px-1">component</code> ·{' '}
            <code className="rounded bg-muted px-1">pendingComponent</code> ·{' '}
            <code className="rounded bg-muted px-1">errorComponent</code> ·{' '}
            <code className="rounded bg-muted px-1">notFoundComponent</code>.{' '}
            <code className="rounded bg-muted px-1">splitBehavior</code> 의{' '}
            <code className="rounded bg-muted px-1">routeId</code> 는 타입 안전하므로 오타가
            타입 에러로 잡힌다.
          </p>
        </Example>
      </section>
    </div>
  )
}
