import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'
import { productsByCategoryQuery } from '@/lib/queries'

const searchSchema = z.object({
  category: z.enum(['all', 'keyboard', 'mouse', 'monitor']).catch('all'),
})

export const Route = createFileRoute('/query/search')({
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => ({ category: search.category }),
  // search 의 category 가 그대로 queryKey 로 들어간다 → 조합마다 캐시 항목이 생긴다.
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(productsByCategoryQuery(deps.category)),
  component: QuerySearchDemo,
})

const CODE_QS = `// queryKey 에 search 값을 넣는다 → search 가 바뀌면 다른 캐시
export function productsByCategoryQuery(category: string) {
  return queryOptions({
    queryKey: ['products', category],
    queryFn: () => fetchByCategory(category),
  })
}

export const Route = createFileRoute('/query/search')({
  validateSearch: (s) => searchSchema.parse(s),   // { category }
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(productsByCategoryQuery(deps.category)),
})

function QuerySearchDemo() {
  const { category } = Route.useSearch()
  const { data } = useSuspenseQuery(productsByCategoryQuery(category))
}`

const CATS = ['all', 'keyboard', 'mouse', 'monitor'] as const

function QuerySearchDemo() {
  const { category } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data } = useSuspenseQuery(productsByCategoryQuery(category))

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">Search Params ↔ queryKey</h3>
        <p className="text-muted-foreground leading-relaxed">
          URL의 <code className="rounded bg-muted px-1">?category</code> 가 그대로{' '}
          <code className="rounded bg-muted px-1">queryKey</code> 에 들어간다. 카테고리를 바꾸면 새
          키로 loader 가 프리페치하고, 한 번 본 카테고리는 캐시로 즉시 열린다(Devtools 에서 키가
          쌓이는 걸 보라).
        </p>
      </div>

      <Example title="search → queryKey" code={CODE_QS}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? 'default' : 'outline'}
                onClick={() => navigate({ search: { category: c } })}
              >
                {c}
              </Button>
            ))}
          </div>
          <ul className="space-y-1">
            {data.length === 0 ? (
              <li className="text-muted-foreground">이 카테고리에 항목이 없다.</li>
            ) : (
              data.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <Badge variant="outline">{p.category}</Badge>
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">${p.price}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </Example>
    </div>
  )
}
