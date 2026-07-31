import { createFileRoute } from '@tanstack/react-router'

// 파일 `routing.index.tsx` → URL `/routing` (레이아웃의 index 자식)
// 부모 `routing.tsx` 의 <Outlet/> 자리에 렌더된다.
export const Route = createFileRoute('/routing/')({
  component: RoutingOverview,
})

function RoutingOverview() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">라우트 트리는 파일 구조가 곧 URL</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          파일기반 라우팅에서 <code className="rounded bg-muted px-1 text-sm">src/routes/**</code>
          의 파일 이름이 그대로 URL 트리로 변환된다. 저장하면 플러그인이{' '}
          <code className="rounded bg-muted px-1 text-sm">routeTree.gen.ts</code> 를 다시 생성한다.
        </p>
      </div>

      <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
        {`src/routes/
├── __root.tsx            → 모든 라우트의 최상위 (공통 레이아웃)
├── index.tsx             → /
├── routing.tsx           → /routing        (레이아웃: <Outlet/> 보유)
├── routing.index.tsx     → /routing        (이 화면, index 자식)
├── routing.concepts.tsx  → /routing/concepts
└── routing.matching.tsx  → /routing/matching (+ 하위 매칭 데모)`}
      </pre>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-sm">
        <p className="font-medium">네이밍 규칙 핵심</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1 text-xs">.</code> 은 경로 구분자다.{' '}
            <code className="rounded bg-muted px-1 text-xs">a.b.tsx</code> →{' '}
            <code className="rounded bg-muted px-1 text-xs">/a/b</code>
          </li>
          <li>
            <code className="rounded bg-muted px-1 text-xs">index</code> 는 부모 경로 자체
            (<code className="rounded bg-muted px-1 text-xs">/routing</code>)에 매칭된다.
          </li>
          <li>
            <code className="rounded bg-muted px-1 text-xs">$param</code> 은 동적 세그먼트,
            앞 밑줄 <code className="rounded bg-muted px-1 text-xs">_layout</code> 은 URL에 안
            붙는 pathless 레이아웃, 앞 하이픈 <code className="rounded bg-muted px-1 text-xs">-file</code>
            은 라우트에서 제외되는 파일이다.
          </li>
        </ul>
      </div>
    </div>
  )
}
