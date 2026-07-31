import { z } from 'zod'
import { createFileRoute, useRouterState } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'
import { CodeBlock } from '@/components/code-block'

// Search 는 문자열만이 아니다 — 배열·객체도 1급으로 다룬다.
// 기본 직렬화가 이런 복합 값을 URL에 넣고 빼는 걸 알아서 해 준다.
const schema = z.object({
  tags: z.array(z.string()).catch([]),
  filters: z
    .object({
      inStock: z.boolean().catch(false),
      min: z.coerce.number().catch(0),
    })
    .catch({ inStock: false, min: 0 }),
})

export const Route = createFileRoute('/params/serialization')({
  validateSearch: (search) => schema.parse(search),
  component: Serialization,
})

const ALL_TAGS = ['react', 'vite', 'router']

const CODE_COMPLEX = `const schema = z.object({
  tags: z.array(z.string()).catch([]),
  filters: z.object({
    inStock: z.boolean().catch(false),
    min: z.coerce.number().catch(0),
  }).catch({ inStock: false, min: 0 }),
})

// 배열/객체를 그대로 넣는다 — 직렬화는 라우터가 처리
navigate({ search: (prev) => ({ ...prev, tags: [...prev.tags, 'react'] }) })`

const CODE_CUSTOM = `// createRouter (main.tsx) 에서 직렬화 방식을 통째로 바꿀 수 있다.
// 예: query-string / base64 등으로 URL 모양을 커스터마이즈
import { parseSearchWith, stringifySearchWith } from '@tanstack/react-router'

const router = createRouter({
  routeTree,
  parseSearch: parseSearchWith((value) => JSON.parse(decodeFromBinary(value))),
  stringifySearch: stringifySearchWith(
    (value) => encodeToBinary(JSON.stringify(value)),
  ),
})`

function Serialization() {
  const { tags, filters } = Route.useSearch()
  const navigate = Route.useNavigate()
  // 실제 URL에 직렬화된 search 문자열을 그대로 보여 준다.
  const searchStr = useRouterState({ select: (s) => s.location.searchStr })

  const toggleTag = (tag: string) =>
    navigate({
      search: (prev) => ({
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      }),
    })

  return (
    <div className="space-y-8 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">1. 배열·객체도 1급 Search</h3>
          <p className="text-muted-foreground leading-relaxed">
            Search 값은 문자열만이 아니다. <strong>배열(tags)</strong> 과{' '}
            <strong>중첩 객체(filters)</strong> 도 그대로 담을 수 있고, URL로의 직렬화는 라우터가
            알아서 한다. 아래에서 값을 바꾸며 맨 밑의 <em>실제 URL 문자열</em>이 어떻게 인코딩되는지
            보라.
          </p>
        </div>
        <Example title="복합 Search" code={CODE_COMPLEX}>
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">tags (배열)</span>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => {
                  const on = tags.includes(tag)
                  return (
                    <Button
                      key={tag}
                      size="sm"
                      variant={on ? 'default' : 'outline'}
                      onClick={() => toggleTag(tag)}
                    >
                      {on ? '✓ ' : ''}
                      {tag}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">filters (객체)</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={filters.inStock ? 'default' : 'outline'}
                  onClick={() =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        filters: { ...prev.filters, inStock: !prev.filters.inStock },
                      }),
                    })
                  }
                >
                  inStock: {String(filters.inStock)}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        filters: { ...prev.filters, min: prev.filters.min + 10 },
                      }),
                    })
                  }
                >
                  min +10
                </Button>
                <Badge variant="secondary">min = {filters.min}</Badge>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">직렬화된 URL 문자열</span>
              <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
                {searchStr || '(비어 있음)'}
              </pre>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">2. 커스텀 직렬화 (라우터 레벨)</h3>
          <p className="text-muted-foreground leading-relaxed">
            기본 직렬화 대신 URL 모양을 직접 정하고 싶다면{' '}
            <code className="rounded bg-muted px-1">createRouter</code> 에{' '}
            <code className="rounded bg-muted px-1">parseSearch</code> /{' '}
            <code className="rounded bg-muted px-1">stringifySearch</code> 를 준다. 앱 전역에
            적용되므로 이 바이블에서는 코드로만 소개한다.
          </p>
        </div>
        <CodeBlock code={CODE_CUSTOM} />
      </section>
    </div>
  )
}
