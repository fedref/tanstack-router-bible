import {
  createFileRoute,
  Link,
  retainSearchParams,
  stripSearchParams,
  useLocation,
} from '@tanstack/react-router'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/13-search-middleware.md
//
// retain → strip 순서가 중요하다. 유지할 것을 먼저 채우고, 그다음 기본값을 지운다.
const searchSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(['price', 'name']).catch('name'),
  page: z.number().catch(1),
})

const DEFAULTS = { sort: 'name' as const, page: 1 }

export const Route = createFileRoute('/search-mw/')({
  validateSearch: searchSchema,
  search: {
    middlewares: [
      // category 와 sort 는 이 라우트 안에서 이동해도 따라다닌다
      retainSearchParams(['category', 'sort']),
      // 기본값이면 URL 에서 지운다
      stripSearchParams(DEFAULTS),
    ],
  },
  component: SearchMiddlewareDemo,
})

const CODE_MW = `export const Route = createFileRoute('/search-mw/')({
  validateSearch: searchSchema,
  search: {
    middlewares: [
      retainSearchParams(['category', 'sort']),  // 유지
      stripSearchParams({ sort: 'name', page: 1 }),  // 기본값 제거
    ],
  },
})

// 순서가 중요하다. strip 을 먼저 두면 지운 값을 retain 이 다시 채운다.`

function SearchMiddlewareDemo() {
  const search = Route.useSearch()
  // searchStr 은 직렬화된 원문, search 는 검증된 객체다
  const searchStr = useLocation({ select: (l) => l.searchStr })

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">URL은 짧게, 상태는 유지되게</h3>
          <p className="text-muted-foreground leading-relaxed">
            아래 버튼으로 값을 바꿔 가며{' '}
            <strong className="text-foreground">주소창을 관찰</strong>하라. 기본값
            (<code className="rounded bg-muted px-1">sort=name</code>,{' '}
            <code className="rounded bg-muted px-1">page=1</code>)은 URL에 나타나지 않고,
            <code className="mx-1 rounded bg-muted px-1">category</code>는 다른 링크로
            이동해도 따라온다.
          </p>
        </div>

        <Example title="retainSearchParams + stripSearchParams" code={CODE_MW}>
          <div className="space-y-3">
            <div className="rounded border bg-muted/40 px-2 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">실제 URL의 search:</span>
                <code className="text-xs font-medium">
                  {searchStr || '(비어 있음 — 전부 기본값)'}
                </code>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">검증된 값(useSearch):</span>
                <code className="text-xs">{JSON.stringify(search)}</code>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 text-xs text-muted-foreground">category</span>
                {['shoes', 'bags', undefined].map((c) => (
                  <Button
                    key={String(c)}
                    size="xs"
                    variant={search.category === c ? 'secondary' : 'outline'}
                    nativeButton={false}
                    render={
                      <Link
                        to="/search-mw"
                        search={(prev) => ({ ...prev, category: c })}
                      />
                    }
                  >
                    {c ?? '(없음)'}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 text-xs text-muted-foreground">sort</span>
                {(['name', 'price'] as const).map((s) => (
                  <Button
                    key={s}
                    size="xs"
                    variant={search.sort === s ? 'secondary' : 'outline'}
                    nativeButton={false}
                    render={
                      <Link
                        to="/search-mw"
                        search={(prev) => ({ ...prev, sort: s })}
                      />
                    }
                  >
                    {s}
                    {s === DEFAULTS.sort && <Badge variant="outline">기본값</Badge>}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="w-16 text-xs text-muted-foreground">page</span>
                {[1, 2, 3].map((p) => (
                  <Button
                    key={p}
                    size="xs"
                    variant={search.page === p ? 'secondary' : 'outline'}
                    nativeButton={false}
                    render={
                      <Link
                        to="/search-mw"
                        search={(prev) => ({ ...prev, page: p })}
                      />
                    }
                  >
                    {p}
                    {p === DEFAULTS.page && <Badge variant="outline">기본값</Badge>}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">retain 의 효과 — 나갔다 돌아와 보라</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">category</code> 를 고른 뒤 아래 링크로
            이 라우트 안을 오가면, 적어 주지 않아도{' '}
            <code className="rounded bg-muted px-1">category</code> 와{' '}
            <code className="rounded bg-muted px-1">sort</code> 가 따라온다.{' '}
            <code className="rounded bg-muted px-1">page</code> 는 유지 대상이 아니라 사라진다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link to="/search-mw" search={{ sort: 'name', page: 1 }} />}
          >
            search 를 비운 링크로 이동
          </Button>
          <Button size="sm" variant="ghost" nativeButton={false} render={<Link to="/search-mw" />}>
            /search-mw 로 나가기 (retain 범위 밖)
          </Button>
        </div>
      </section>

      <section className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">함정:</strong>{' '}
          <code className="rounded bg-muted px-1">stripSearchParams</code> 에 넘긴 기본값이
          스키마의 <code className="rounded bg-muted px-1">.catch()</code> 기본값과{' '}
          <strong className="text-foreground">일치해야 한다</strong>. 어긋나면 URL에서
          지워지지 않거나, 지운 뒤 다른 값으로 복원되어 무한 이동이 생길 수 있다. 이 예제는
          <code className="mx-1 rounded bg-muted px-1">DEFAULTS</code> 상수 하나를 양쪽에서
          공유해 그 위험을 없앴다.
        </p>
      </section>
    </div>
  )
}
