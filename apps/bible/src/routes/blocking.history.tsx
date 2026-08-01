import { createFileRoute, useCanGoBack, useRouter } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/14-blocking-history.md
export const Route = createFileRoute('/blocking/history')({
  component: HistoryDemo,
})

const CODE_TYPES = `import {
  createBrowserHistory,   // 기본값 — /posts/1 (서버 SPA fallback 필요)
  createHashHistory,      // /#/posts/1 (서버 설정 불필요)
  createMemoryHistory,    // 주소창 없음 — 테스트 · SSR · 임베드 UI
} from '@tanstack/react-router'

createRouter({ routeTree, history: createHashHistory() })

// 테스트에서 특정 URL 상태 만들기
createMemoryHistory({
  initialEntries: ['/', '/posts', '/posts/1'],
  initialIndex: 2,     // /posts/1 에서 시작, 뒤로 두 번 갈 수 있다
})`

const CODE_API = `const router = useRouter()

router.history.push('/posts/1')      // 이동 (기록 추가)
router.history.replace('/posts/1')   // 이동 (기록 교체)
router.history.go(-2)                // 두 단계 뒤로
router.history.back() / forward()
router.history.canGoBack()           // boolean
router.history.createHref('/posts')  // 최종 href 계산
router.history.location              // 현재 위치 (파싱 전)
router.history.length                // 기록 개수
router.history.subscribe((e) => …)   // 변경 구독 (해제 함수 반환)`

const CODE_SAFE = `// ⚠️ 오픈 리다이렉트 취약점
router.history.push(search.redirect)          // ❌ 외부 URL 이 들어올 수 있다

const target = search.redirect ?? '/'
router.history.push(
  target.startsWith('/') && !target.startsWith('//') ? target : '/',
)                                             // ✅ 내부 경로만 허용`

function HistoryDemo() {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">세 가지 History 구현</h3>
          <p className="text-muted-foreground leading-relaxed">
            라우터는 셋 중 하나 위에서 돈다. 이 앱은 기본값인{' '}
            <code className="rounded bg-muted px-1">createBrowserHistory</code> 를 쓰고,
            그래서 GitHub Pages 배포 시{' '}
            <code className="rounded bg-muted px-1">404.html</code> 을 복사하는 우회책이
            필요하다. <code className="rounded bg-muted px-1">createHashHistory</code> 를
            썼다면 그 우회가 필요 없었을 것이다.
          </p>
        </div>
        <Example title="history 종류 고르기" code={CODE_TYPES}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr><th className="pb-1"></th><th className="pb-1">URL</th><th className="pb-1">서버 설정</th><th className="pb-1">SEO</th></tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="py-1 pr-2 font-medium">Browser</td><td>/posts/1</td><td>필요</td><td>유리</td></tr>
                <tr className="border-t"><td className="py-1 pr-2 font-medium">Hash</td><td>/#/posts/1</td><td>불필요</td><td>불리</td></tr>
                <tr className="border-t"><td className="py-1 pr-2 font-medium">Memory</td><td>(없음)</td><td>—</td><td>—</td></tr>
              </tbody>
            </table>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">router.history 직접 조작</h3>
          <p className="text-muted-foreground leading-relaxed">
            평소 이동은 <code className="rounded bg-muted px-1">navigate</code> 를 쓴다. 타입
            안전하기 때문이다.{' '}
            <code className="rounded bg-muted px-1">history.push</code> 는{' '}
            <strong className="text-foreground">경로를 문자열로만 알 수 있을 때</strong> —
            예컨대 로그인 후 <code className="rounded bg-muted px-1">?redirect=</code> 로 받은
            임의 경로로 돌려보낼 때 쓴다.
          </p>
        </div>
        <Example title="history API" code={CODE_API}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">canGoBack: {String(canGoBack)}</Badge>
              <Badge variant="outline">length: {router.history.length}</Badge>
              <code className="text-xs">{router.history.location.href}</code>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!canGoBack} onClick={() => router.history.back()}>
                back()
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.history.forward()}>
                forward()
              </Button>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">문자열 경로를 쓸 때의 보안</h3>
          <p className="text-muted-foreground leading-relaxed">
            사용자 입력을 그대로{' '}
            <code className="rounded bg-muted px-1">history.push</code> 에 넣으면{' '}
            <strong className="text-foreground">오픈 리다이렉트</strong> 취약점이 된다. 외부
            URL 로 보내져 피싱에 악용될 수 있다.
          </p>
        </div>
        <Example title="내부 경로만 허용하기" code={CODE_SAFE}>
          <p className="text-muted-foreground">
            <code className="rounded bg-muted px-1">/auth/login</code> 라우트가 이 패턴을 실제로
            쓰고 있다. 라우터 레벨에서는{' '}
            <code className="rounded bg-muted px-1">protocolAllowlist</code> 가{' '}
            <code className="rounded bg-muted px-1">javascript:</code> 같은 위험한 스킴을 막는다(16장).
          </p>
        </Example>
      </section>
    </div>
  )
}
