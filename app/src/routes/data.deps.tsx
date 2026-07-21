import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'
import { listProducts } from '@/lib/products'

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  category: z.enum(['all', 'keyboard', 'mouse', 'monitor']).catch('all'),
})

const PAGE_SIZE = 1

export const Route = createFileRoute('/data/deps')({
  validateSearch: (s) => searchSchema.parse(s),
  // loader 가 의존하는 값을 명시한다. 이 값이 바뀔 때만 loader 가 다시 실행된다.
  loaderDeps: ({ search }) => ({ page: search.page, category: search.category }),
  loader: async ({ deps }) => {
    const all = await listProducts()
    const filtered =
      deps.category === 'all'
        ? all
        : all.filter((p) => p.category === deps.category)
    const start = (deps.page - 1) * PAGE_SIZE
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      total: filtered.length,
      loadedAt: new Date().toLocaleTimeString('ko-KR'),
    }
  },
  // 5초 동안은 같은 deps 재방문 시 loader 를 다시 돌리지 않고 캐시를 쓴다.
  staleTime: 5000,
  component: DepsDemo,
})

const CODE_DEPS = `export const Route = createFileRoute('/data/deps')({
  validateSearch: (s) => searchSchema.parse(s),   // { page, category }
  // loader 가 의존하는 값 선언 → 바뀔 때만 재실행
  loaderDeps: ({ search }) => ({ page: search.page, category: search.category }),
  loader: async ({ deps }) => {
    const all = await listProducts()
    const filtered = deps.category === 'all'
      ? all : all.filter((p) => p.category === deps.category)
    return { items: paginate(filtered, deps.page), loadedAt: now() }
  },
  staleTime: 5000,   // 5초 내 같은 deps 재방문 → 캐시 사용(재로드 X)
})`

const CATS = ['all', 'keyboard', 'mouse', 'monitor'] as const

function DepsDemo() {
  const { page, category } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { items, total, loadedAt } = Route.useLoaderData()
  const maxPage = Math.max(1, total)

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">loaderDeps 로 search 연동 + staleTime 캐시</h3>
        <p className="text-muted-foreground leading-relaxed">
          <code className="rounded bg-muted px-1">loaderDeps</code> 로 선언한 값(page·category)이
          바뀌면 loader 가 다시 돈다. 아래 <strong>불러온 시각</strong>을 보라 — deps 를 바꾸면
          갱신되지만, <strong>5초 안에 같은 조합으로 돌아오면</strong> staleTime 덕에 시각이
          그대로다(재로드 안 함).
        </p>
      </div>

      <Example title="loaderDeps · staleTime" code={CODE_DEPS}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? 'default' : 'outline'}
                onClick={() => navigate({ search: { page: 1, category: c } })}
              >
                {c}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }) })
              }
            >
              ◀ 이전
            </Button>
            <span className="font-mono">
              page {page} / {maxPage}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate({
                  search: (prev) => ({ ...prev, page: Math.min(maxPage, prev.page + 1) }),
                })
              }
            >
              다음 ▶
            </Button>
          </div>

          <ul className="space-y-1">
            {items.length === 0 ? (
              <li className="text-muted-foreground">이 페이지에 항목이 없다.</li>
            ) : (
              items.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <Badge variant="outline">{p.category}</Badge>
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">${p.price}</span>
                </li>
              ))
            )}
          </ul>

          <p className="text-xs text-muted-foreground">
            불러온 시각: <code className="rounded bg-muted px-1">{loadedAt}</code> — deps 를 바꾸면
            갱신, 5초 내 같은 deps 는 그대로.
          </p>
        </div>
      </Example>
    </div>
  )
}
