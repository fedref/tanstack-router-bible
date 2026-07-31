import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Playground</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        docs/ 를 읽으면서 여기서 직접 구현해 본다. 참고 구현이 필요하면 bible 앱(5173)을 함께 띄운다.
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-sm">
        <li>
          <code>src/routes/</code> 에 파일을 만들면 URL 이 생긴다. (예: <code>about.tsx</code> → <code>/about</code>)
        </li>
        <li>
          저장하면 <code>routeTree.gen.ts</code> 가 자동 갱신된다 — 직접 수정하지 않는다.
        </li>
        <li>
          <code>pnpm --filter playground typecheck</code> 로 타입 추론이 살아 있는지 확인한다.
        </li>
      </ol>
    </div>
  )
}
