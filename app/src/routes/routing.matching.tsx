import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// `routing.matching.tsx` → `/routing/matching` (또 다른 레이아웃 라우트)
// 레이아웃은 중첩될 수 있다: __root → routing → routing.matching → 그 자식.
export const Route = createFileRoute('/routing/matching')({
  component: MatchingLayout,
})

const CODE_DYNAMIC = `// routing.matching.$productId.tsx → /routing/matching/:productId
export const Route = createFileRoute('/routing/matching/$productId')({
  loader: ({ params }) => getProduct(params.productId),
  component: ProductDetail,
})

function ProductDetail() {
  const { productId } = Route.useParams()   // 이 라우트 전용, 타입 추론
  const product = Route.useLoaderData()      // loader 반환값
  if (!product) return <p>없음</p>
  return <div>{product.name}</div>
}`

function MatchingLayout() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">라우트 매칭 & 동적 세그먼트</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          라우터는 URL을 위에서 아래로(구체적 → 일반적) 매칭한다. 아래 링크로 정적 index와
          동적 <code className="rounded bg-muted px-1 text-sm">$productId</code> 라우트가
          어떻게 다르게 매칭되는지 확인하라. 이동할 때 좌하단 Devtools의 “Matches” 패널이
          실시간으로 바뀐다.
        </p>
      </div>

      <Example title="동적 라우트" code={CODE_DYNAMIC}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" render={<Link to="/routing/matching" />}>
              목록 (index)
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={
                <Link to="/routing/matching/$productId" params={{ productId: '1' }} />
              }
            >
              #1
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={
                <Link to="/routing/matching/$productId" params={{ productId: '2' }} />
              }
            >
              #2
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={
                <Link to="/routing/matching/$productId" params={{ productId: '999' }} />
              }
            >
              #999 (없음)
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <Outlet />
          </div>
        </div>
      </Example>
    </div>
  )
}
