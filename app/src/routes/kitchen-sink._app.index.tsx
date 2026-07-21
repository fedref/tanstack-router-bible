import { z } from 'zod'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { catalogQuery } from '@/lib/queries'

// 카탈로그: 검증된 search(03) → loaderDeps 프리페치(04) → queryKey 캐시(07)
const searchSchema = z.object({
  q: z.string().catch(''),
  category: z.enum(['all', 'keyboard', 'mouse', 'monitor']).catch('all'),
})

export const Route = createFileRoute('/kitchen-sink/_app/')({
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => ({ q: search.q, category: search.category }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(catalogQuery(deps)),
  component: Catalog,
})

const CATS = ['all', 'keyboard', 'mouse', 'monitor'] as const

function Catalog() {
  const { q, category } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data } = useSuspenseQuery(catalogQuery({ q, category }))

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          value={q}
          placeholder="상품명 검색…"
          onChange={(e) =>
            navigate({ search: (prev) => ({ ...prev, q: e.target.value }), replace: true })
          }
        />
        <div className="flex flex-wrap gap-1.5">
          {CATS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? 'default' : 'outline'}
              onClick={() => navigate({ search: (prev) => ({ ...prev, category: c }) })}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <ul className="divide-y rounded-lg border">
        {data.length === 0 ? (
          <li className="p-3 text-muted-foreground">조건에 맞는 상품이 없다.</li>
        ) : (
          data.map((p) => (
            <li key={p.id}>
              <Link
                to="/kitchen-sink/$productId"
                params={{ productId: p.id }}
                className="flex items-center gap-2 p-3 hover:bg-muted"
              >
                <Badge variant="outline">{p.category}</Badge>
                <span className="flex-1">{p.name}</span>
                <span className="text-muted-foreground">${p.price}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            </li>
          ))
        )}
      </ul>

      <p className="text-xs text-muted-foreground">
        검색어·카테고리는 URL(<code className="rounded bg-muted px-1">?q&amp;category</code>)에 살아
        있어 새로고침·공유에도 유지된다. 항목을 누르면 상세로 간다.
      </p>
    </div>
  )
}
