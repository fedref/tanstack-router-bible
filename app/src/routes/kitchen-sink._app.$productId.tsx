import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { productQuery } from '@/lib/queries'

// 상세: Path Param(03) → 프리페치(04·07) → 없으면 notFound(06)
export const Route = createFileRoute('/kitchen-sink/_app/$productId')({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      productQuery(params.productId),
    )
    if (!product) throw notFound()
  },
  notFoundComponent: () => (
    <div className="space-y-2 text-sm">
      <p className="font-medium text-destructive">이 상품을 찾을 수 없습니다 (notFound)</p>
      <Button size="sm" variant="outline" nativeButton={false} render={<Link to="/kitchen-sink" search={{ q: '', category: 'all' }} />}>
        <ArrowLeft className="size-4" />
        카탈로그로
      </Button>
    </div>
  ),
  component: Detail,
})

function Detail() {
  const { productId } = Route.useParams()
  const { data: product } = useSuspenseQuery(productQuery(productId))
  if (!product) return null // notFound 가 이미 처리하지만 타입 좁히기용

  return (
    <div className="space-y-4 text-sm">
      <Button size="sm" variant="ghost" nativeButton={false} render={<Link to="/kitchen-sink" search={{ q: '', category: 'all' }} />}>
        <ArrowLeft className="size-4" />
        카탈로그로
      </Button>

      <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <Badge>{product.category}</Badge>
        </div>
        <p className="text-muted-foreground">가격: ${product.price}</p>
        <p className="text-xs text-muted-foreground">
          id <code className="rounded bg-muted px-1">{product.id}</code> 를 Path Param 으로 받아,
          Query 캐시(<code className="rounded bg-muted px-1">['product', id]</code>)로 프리페치한 뒤
          useSuspenseQuery 로 즉시 렌더했다.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link to="/kitchen-sink/$productId" params={{ productId: '999' }} />}
        >
          없는 상품(#999) 열기 → notFound
        </Button>
      </div>
    </div>
  )
}
