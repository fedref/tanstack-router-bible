import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/routing/matching/')({
  component: () => (
    <p className="text-sm text-muted-foreground leading-relaxed">
      위 링크에서 상품을 선택하면{' '}
      <code className="rounded bg-muted px-1 text-sm">/routing/matching/$productId</code> 동적
      라우트가 매칭된다. <code className="rounded bg-muted px-1 text-sm">#999</code> 는 존재하지
      않는 id로, 라우트는 매칭되지만 데이터가 없어 “없음” 처리가 필요하다 — 이 흐름은 Chapter 06의
      Not Found 로 이어진다.
    </p>
  ),
})
