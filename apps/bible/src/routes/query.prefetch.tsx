import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/components/example'
import { productsQuery } from '@/lib/queries'

// loader 에서 프리페치 → 컴포넌트에서 useSuspenseQuery 로 즉시 사용.
export const Route = createFileRoute('/query/prefetch')({
  // context.queryClient 는 루트에서 주입한 것(Chapter 05)
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: PrefetchDemo,
})

const CODE_PREFETCH = `// lib/queries.ts — queryOptions 로 한 번만 정의
export const productsQuery = queryOptions({
  queryKey: ['products'],
  queryFn: () => listProducts(),
})

// 라우트: loader 가 진입 전에 캐시를 채운다
export const Route = createFileRoute('/query/prefetch')({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: PrefetchDemo,
})

// 컴포넌트: 이미 캐시됐으므로 즉시 반환(suspend 안 함)
function PrefetchDemo() {
  const { data } = useSuspenseQuery(productsQuery)
}`

function PrefetchDemo() {
  // loader 가 미리 채웠으므로 여기서는 즉시 데이터가 나온다.
  const { data } = useSuspenseQuery(productsQuery)

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">loader 프리페치 + useSuspenseQuery</h3>
        <p className="text-muted-foreground leading-relaxed">
          loader 가 <code className="rounded bg-muted px-1">ensureQueryData</code> 로 진입 전에
          캐시를 채워 두면, 컴포넌트의 <code className="rounded bg-muted px-1">useSuspenseQuery</code>
          는 <strong>기다리지 않고 즉시</strong> 데이터를 돌려준다. 로딩 스피너 없이 열리는 이유다.
          우하단 Query Devtools 에서 <code className="rounded bg-muted px-1">['products']</code> 캐시를
          확인하라.
        </p>
      </div>

      <Example title="ensureQueryData → useSuspenseQuery" code={CODE_PREFETCH}>
        <ul className="space-y-1">
          {data.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <Badge variant="outline">{p.category}</Badge>
              <span>{p.name}</span>
              <span className="text-muted-foreground">${p.price}</span>
            </li>
          ))}
        </ul>
      </Example>
    </div>
  )
}
