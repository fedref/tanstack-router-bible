import { z } from 'zod'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'
import { CodeBlock } from '@/components/code-block'

export const Route = createFileRoute('/type-safety/utils')({
  validateSearch: (s) => z.object({ n: z.coerce.number().catch(0) }).parse(s),
  component: UtilsDemo,
})

// getRouteApi: 라우트 "밖"의 컴포넌트에서도 그 라우트의 훅을 "타입과 함께" 쓴다.
// Route 객체를 import 하거나 props 로 넘기지 않아도 된다.
const utilsApi = getRouteApi('/type-safety/utils')

const CODE_API = `// 라우트 파일이 아닌 다른 컴포넌트에서도 타입 안전하게 접근
import { getRouteApi } from '@tanstack/react-router'

const api = getRouteApi('/type-safety/utils')

function Panel() {
  const { n } = api.useSearch()       // number, 타입 추론됨
  const navigate = api.useNavigate()
  // api.useParams() / api.useLoaderData() 도 동일
}`

const CODE_STRICT = `// A. from 으로 특정 라우트 기준 (권장 — 정확한 타입)
const { n } = useSearch({ from: '/type-safety/utils' })

// B. strict: false — 아무 라우트에서나 느슨하게 (타입은 넓어짐)
const search = useSearch({ strict: false })

// 자주 쓰는 타입 유틸
import type { LinkProps } from '@tanstack/react-router'
type MyLink = LinkProps            // Link 에 넘길 수 있는 props 타입`

// 라우트 컴포넌트가 아닌 별도 컴포넌트 — getRouteApi 로 search 를 읽는다
function Panel() {
  const { n } = utilsApi.useSearch()
  const navigate = utilsApi.useNavigate()
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate({ search: { n: n - 1 } })}
      >
        −
      </Button>
      <span className="min-w-8 text-center font-mono">n = {n}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate({ search: { n: n + 1 } })}
      >
        +
      </Button>
    </div>
  )
}

function UtilsDemo() {
  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">getRouteApi — 컴포넌트 밖에서도 타입 유지</h3>
          <p className="text-muted-foreground leading-relaxed">
            아래 <code className="rounded bg-muted px-1">&lt;Panel /&gt;</code> 은 라우트 컴포넌트가
            아니다. 그런데도 <code className="rounded bg-muted px-1">getRouteApi('/type-safety/utils')</code>
            로 이 라우트의 <code className="rounded bg-muted px-1">?n</code> 을 타입과 함께 읽고
            갱신한다. props 드릴링 없이 깊은 컴포넌트에서 라우트 상태를 쓸 때 유용하다.
          </p>
        </div>
        <Example title="getRouteApi" code={CODE_API}>
          <Panel />
        </Example>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold">strict / from · 타입 유틸</h3>
        <p className="text-muted-foreground leading-relaxed">
          훅을 라우트 밖에서 쓸 땐 <code className="rounded bg-muted px-1">from</code> 으로 기준
          라우트를 알려 정확한 타입을 얻거나, <code className="rounded bg-muted px-1">strict: false</code>
          로 느슨하게 받는다.
        </p>
        <CodeBlock code={CODE_STRICT} />
      </section>
    </div>
  )
}
