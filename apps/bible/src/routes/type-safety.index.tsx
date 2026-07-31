import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/code-block'

export const Route = createFileRoute('/type-safety/')({
  component: TypeSafetyOverview,
})

const CODE_REGISTER = `// main.tsx — 이 한 번의 선언이 앱 전체 타입 추론의 스위치다
const router = createRouter({ routeTree, context: { queryClient } })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}`

const CODE_FAIL = `// 아래는 전부 "컴파일 에러"로 잡힌다 (런타임까지 안 간다)
<Link to="/nope" />                       // ❌ 없는 경로
<Link to="/params/path/$userId" />        // ❌ params 누락
<Link to="/params/search" search={{ page: 'x' }} />  // ❌ page 는 number

const { userId } = Route.useParams()      // ✅ userId: number (자동 추론)
const { q } = Route.useSearch()           // ✅ q: string`

function TypeSafetyOverview() {
  return (
    <div className="space-y-5 text-sm">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">타입은 어떻게 흐르는가</h2>
        <p className="text-muted-foreground leading-relaxed">
          비결은 <strong>단 한 번의 등록</strong>이다. <code className="rounded bg-muted px-1">Register</code>
          인터페이스에 라우터 타입을 꽂아 두면, 라우터는 파일기반으로 생성된 라우트 트리에서 모든
          경로·params·search·context 타입을 알게 된다. 그 뒤부터 <code className="rounded bg-muted px-1">Link</code>,{' '}
          <code className="rounded bg-muted px-1">useNavigate</code>, <code className="rounded bg-muted px-1">useParams</code>,{' '}
          <code className="rounded bg-muted px-1">useSearch</code> 가 전부 그 타입을 따른다.
        </p>
        <CodeBlock code={CODE_REGISTER} />
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold">실수는 에디터에서 먼저 잡힌다</h3>
        <p className="text-muted-foreground leading-relaxed">
          덕분에 오타·빠진 params·잘못된 search 타입은 화면이 아니라 <strong>빨간 줄</strong>로
          먼저 드러난다. 이 바이블의 모든 <code className="rounded bg-muted px-1">&lt;Link&gt;</code> 가
          이 안전망 위에 있다.
        </p>
        <CodeBlock code={CODE_FAIL} />
      </section>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-muted-foreground">
        서브탭에서 두 가지를 더 본다. <strong>Router Context</strong>(타입 있는 의존성 주입)와{' '}
        <strong>getRouteApi</strong>(라우트 컴포넌트 밖에서도 같은 타입 유지).
      </div>
    </div>
  )
}
