import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { getProduct } from '@/lib/products'

// `routing.matching.$productId.tsx` → `/routing/matching/:productId`
// `$productId` 세그먼트가 params.productId 로 들어온다 (타입: string, 자동 추론).
// loader 로 데이터를 미리 받는 건 Chapter 04의 맛보기다.
export const Route = createFileRoute('/routing/matching/$productId')({
  loader: ({ params }) => getProduct(params.productId),
  component: ProductDetail,
})

function ProductDetail() {
  // useParams / useLoaderData 모두 이 라우트에 한정된 타입을 돌려준다.
  const { productId } = Route.useParams()
  const product = Route.useLoaderData()

  if (!product) {
    return (
      <p className="text-sm text-muted-foreground leading-relaxed">
        id=<code className="rounded bg-muted px-1 text-sm">{productId}</code> 에 해당하는 상품이
        없다. (라우트는 매칭됨 · 데이터 없음 → Chapter 06 Not Found 로 개선)
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{product.name}</span>
        <Badge>{product.category}</Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        id: <code className="rounded bg-muted px-1 text-xs">{product.id}</code> · $
        {product.price}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        URL의 <code className="rounded bg-muted px-1 text-xs">$productId</code> 가{' '}
        <code className="rounded bg-muted px-1 text-xs">params.productId = "{productId}"</code>{' '}
        로 전달됐고, loader가 이를 받아 상품을 조회했다.
      </p>
    </div>
  )
}
