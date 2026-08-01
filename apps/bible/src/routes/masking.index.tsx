import { createFileRoute, useLocation } from '@tanstack/react-router'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/15-masking-scroll.md
export const Route = createFileRoute('/masking/')({
  component: MaskingDemo,
})

const CODE_LINK = `<Link
  to="/feed"                        // 실제로 갈 곳 — 피드 + 모달
  search={{ photoId: '123' }}
  mask={{
    to: '/photos/$photoId',         // 주소창에 보일 것
    params: { photoId: '123' },
  }}
>
  사진 열기
</Link>`

const CODE_GLOBAL = `const photoModalMask = createRouteMask({
  routeTree,                        // 타입 추론용 (필수)
  from: '/feed',                    // 이 라우트로 갈 때
  to: '/photos/$photoId',           // 이렇게 보이게 한다
  params: (prev) => ({ photoId: prev.search.photoId }),
  unmaskOnReload: true,
})

createRouter({ routeTree, routeMasks: [photoModalMask] })`

const CODE_READ = `const location = useLocation()

location.href            // '/feed?photoId=123'   ← 실제 라우트
location.maskedLocation  // { href: '/photos/123' } ← 주소창에 보이는 것
location.unmaskOnReload  // 새로고침 시 마스크 해제 여부`

function MaskingDemo() {
  const location = useLocation()

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">주소창과 화면을 분리한다</h3>
          <p className="text-muted-foreground leading-relaxed">
            인스타그램에서 사진을 클릭하면 세 가지가 동시에 일어난다 — 주소창은{' '}
            <code className="rounded bg-muted px-1">/photos/123</code> 이 되고(공유 가능),
            화면은 피드 위 모달로 뜨고(맥락 유지), 그 URL 을{' '}
            <strong className="text-foreground">새 탭에서 열면 전체 페이지</strong>가 된다.
            셋을 함께 만족시키려면 “URL” 과 “렌더할 라우트” 를 분리해야 한다.
          </p>
        </div>
        <Example title="링크 단위 마스킹" code={CODE_LINK}>
          <div className="space-y-1.5">
            <div className="rounded border px-2 py-1.5">
              <span className="text-xs text-muted-foreground">현재 href</span>{' '}
              <code className="text-xs">{location.href}</code>
            </div>
            <div className="rounded border px-2 py-1.5">
              <span className="text-xs text-muted-foreground">maskedLocation</span>{' '}
              <code className="text-xs">
                {location.maskedLocation ? location.maskedLocation.href : '(마스킹 중 아님)'}
              </code>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">전역 규칙으로 선언하기</h3>
          <p className="text-muted-foreground leading-relaxed">
            링크마다 <code className="rounded bg-muted px-1">mask</code> 를 적는 대신 규칙을 한
            번 선언해 둔다. <code className="rounded bg-muted px-1">from</code> 은 타입
            안전하므로 없는 경로를 쓰면 컴파일 에러가 난다.
          </p>
        </div>
        <Example title="createRouteMask" code={CODE_GLOBAL}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr><th className="pb-1">unmaskOnReload</th><th className="pb-1">새로고침하면</th></tr>
              </thead>
              <tbody>
                <tr className="border-t"><td className="py-1 pr-3"><code>false</code> (기본)</td><td>마스킹된 URL 이 <strong>실제 라우트로</strong> 해석 → 전체 페이지</td></tr>
                <tr className="border-t"><td className="py-1 pr-3"><code>true</code></td><td>마스크가 벗겨지고 <strong>원래 라우트로</strong> 복귀</td></tr>
              </tbody>
            </table>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <Example title="마스킹 상태 읽기" code={CODE_READ}>
          <p className="text-muted-foreground">
            <strong className="text-foreground">함정 셋:</strong> ① 마스킹된 URL 의 라우트가{' '}
            <strong className="text-foreground">실제로 존재해야</strong> 한다 — 없으면
            새로고침 시 404 다. ② 마스킹은 URL 을 감추는 것이지 보호가 아니다. 보호는{' '}
            <code className="rounded bg-muted px-1">beforeLoad</code> 가드로 한다(06장).
            ③ 마스킹된 이동도 히스토리 항목을 만든다 — 모달을 닫을 때{' '}
            <code className="rounded bg-muted px-1">back()</code> 을 쓸지{' '}
            <code className="rounded bg-muted px-1">navigate</code> 를 쓸지 정해 둔다.
          </p>
        </Example>
      </section>
    </div>
  )
}
