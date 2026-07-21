import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Example } from '@/components/example'
import { CodeBlock } from '@/components/code-block'

// 1급 Search Params: 스키마로 검증하면 그 타입이 useSearch/Link/loader 까지 흐른다.
// .catch(...) 는 잘못된/빈 값일 때 던지지 않고 기본값으로 떨어지게 한다.
const searchSchema = z.object({
  q: z.string().catch(''),
  page: z.coerce.number().int().min(1).catch(1),
  sort: z.enum(['asc', 'desc']).catch('asc'),
})

export const Route = createFileRoute('/params/search')({
  validateSearch: (search) => searchSchema.parse(search),
  component: SearchParams,
})

const CODE_SEARCH = `const searchSchema = z.object({
  q: z.string().catch(''),
  page: z.coerce.number().int().min(1).catch(1),
  sort: z.enum(['asc', 'desc']).catch('asc'),
})

export const Route = createFileRoute('/params/search')({
  validateSearch: (search) => searchSchema.parse(search),
  component: SearchParams,
})

function SearchParams() {
  const { q, page, sort } = Route.useSearch()   // 전부 타입 추론됨
  const navigate = Route.useNavigate()

  // search 에 함수를 주면 이전 값 기준으로 갱신
  navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
}`

const CODE_MANUAL = `// 라이브러리 없이 직접 검증 — 반환 타입이 곧 search 타입이 된다
validateSearch: (search: Record<string, unknown>) => ({
  q: typeof search.q === 'string' ? search.q : '',
  page: Number(search.page) >= 1 ? Number(search.page) : 1,
  sort: search.sort === 'desc' ? 'desc' : 'asc',
})`

const CODE_VALIBOT = `import * as v from 'valibot'   // pnpm add valibot

const schema = v.object({
  q: v.optional(v.string(), ''),
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  sort: v.optional(v.picklist(['asc', 'desc']), 'asc'),
})

validateSearch: (search) => v.parse(schema, search)`

function SearchParams() {
  const { q, page, sort } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <div className="space-y-8 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">1. 검증된 Search 를 상태로</h3>
          <p className="text-muted-foreground leading-relaxed">
            아래 컨트롤이 URL의 <code className="rounded bg-muted px-1">?q&amp;page&amp;sort</code> 를
            바꾼다. 이 값들은 <strong>스키마대로 타입이 보장</strong>되고 URL에 산다 — 새로고침·공유
            후에도 그대로다. 주소창을 함께 지켜보라.
          </p>
        </div>
        <Example code={CODE_SEARCH}>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">q (문자열)</span>
                <Input
                  value={q}
                  placeholder="검색어…"
                  onChange={(e) =>
                    navigate({
                      search: (prev) => ({ ...prev, q: e.target.value, page: 1 }),
                      replace: true,
                    })
                  }
                />
              </label>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">page (숫자)</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate({
                        search: (prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }),
                      })
                    }
                  >
                    −
                  </Button>
                  <span className="min-w-8 text-center font-mono">{page}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">sort (enum)</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        sort: prev.sort === 'asc' ? 'desc' : 'asc',
                      }),
                    })
                  }
                >
                  {sort} ↕
                </Button>
              </div>
            </div>

            <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
              {JSON.stringify({ q, page, sort }, null, 2)}
            </pre>
          </div>
        </Example>
        <p className="text-xs text-muted-foreground">
          빈 검색어로 지운 뒤 주소창에 <code className="rounded bg-muted px-1">?page=abc</code> 처럼
          엉뚱한 값을 넣어 보라. <code className="rounded bg-muted px-1">.catch()</code> 가 잘못된
          값을 기본값으로 눌러 준다(앱이 깨지지 않는다).
        </p>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">2. 같은 검증, 다른 방법</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">validateSearch</code> 는 “검증 후 값을 돌려주는
            함수”면 무엇이든 된다. 위 예제는 zod 를 썼지만, 라이브러리 없이도 valibot 으로도 된다.
            결과 타입은 모두 <code className="rounded bg-muted px-1">&#123; q, page, sort &#125;</code>
            로 동일하다.
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">A. 직접(manual)</p>
            <CodeBlock code={CODE_MANUAL} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">B. valibot</p>
            <CodeBlock code={CODE_VALIBOT} />
          </div>
        </div>
      </section>
    </div>
  )
}
