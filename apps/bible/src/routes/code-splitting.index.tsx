import { createFileRoute, Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/09-code-splitting.md
export const Route = createFileRoute('/code-splitting/')({
  component: AutoSplitting,
})

const CODE_AUTO = `// apps/bible/vite.config.ts
TanStackRouterVite({
  target: 'react',
  autoCodeSplitting: true,   // ← 이 한 줄
})

// 우리 코드에는 'lazy' 라는 단어조차 등장하지 않는다.
// 빌드하면 라우트 이름이 그대로 붙은 청크가 생성된다:
//   dist/assets/auth.login-pXXmqstp.js
//   dist/assets/query.mutation-CyYrtquG.js`

const CODE_WHAT = `// 기본 분할 단위 — 네 컴포넌트가 각각 떨어져 나간다
[['component'], ['pendingComponent'], ['errorComponent'], ['notFoundComponent']]

// ❌ 분리되지 않고 초기 번들에 남는 것들
loader          // 코드를 기다린 뒤 데이터를 받으면 직렬이 된다
beforeLoad      // 가드 판단은 코드를 받기 전에 끝나야 한다
validateSearch  // 매칭 단계에서 즉시 필요하다`

const CODE_TRAP = `export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    // ❌ 파일 상단 정적 import → 초기 번들에 포함된다
    // import { marked } from 'marked'

    // ✅ 필요한 시점에 동적으로
    const { marked } = await import('marked')
    return { html: marked(await fetchBody(params.postId)) }
  },
})`

function AutoSplitting() {
  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">이 앱 전체가 예제다</h3>
          <p className="text-muted-foreground leading-relaxed">
            bible 은 <code className="rounded bg-muted px-1">autoCodeSplitting: true</code> 로
            돌아간다. 지금 <strong className="text-foreground">브라우저 개발자도구 Network
            탭</strong>을 열고 사이드바의 아무 링크에나{' '}
            <strong className="text-foreground">마우스만 올려 보라</strong>. 클릭하지 않아도
            해당 라우트의 <code className="rounded bg-muted px-1">.js</code> 청크를 받아 온다.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            이것이 코드 스플리팅(09장)과 Preloading(02장)의 조합이다. 코드 스플리팅만 켜면
            클릭 후 대기가 생기지만, preload 와 함께 쓰면 hover 시점에 코드와 데이터를 병렬로
            받아 대기가 사라진다. <strong className="text-foreground">둘은 세트로 켜는 것이
            기본에 가깝다.</strong>
          </p>
        </div>

        <Example title="설정은 한 줄이다" code={CODE_AUTO}>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              빌드 산출물을 직접 확인하려면:
            </p>
            <pre className="overflow-x-auto rounded border bg-muted/40 p-2 text-xs">
{`pnpm --filter bible build
ls apps/bible/dist/assets/ | head -20`}
            </pre>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">라우트 파일 전체가 분리되는 게 아니다</h3>
          <p className="text-muted-foreground leading-relaxed">
            여기가 핵심이다. 분리되는 것은{' '}
            <strong className="text-foreground">컴포넌트 4종</strong>뿐이고,{' '}
            <code className="rounded bg-muted px-1">loader</code> ·{' '}
            <code className="rounded bg-muted px-1">beforeLoad</code> ·{' '}
            <code className="rounded bg-muted px-1">validateSearch</code> 는{' '}
            <strong className="text-foreground">일부러 남긴다</strong>.
          </p>
        </div>

        <Example title="무엇이 남고 무엇이 떠나나" code={CODE_WHAT}>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border p-2">
              <Badge variant="secondary">분리됨</Badge>
              <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                <li>· component</li>
                <li>· pendingComponent</li>
                <li>· errorComponent</li>
                <li>· notFoundComponent</li>
              </ul>
            </div>
            <div className="rounded border p-2">
              <Badge variant="outline">초기 번들에 남음</Badge>
              <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                <li>· loader — 병렬 실행돼야 함</li>
                <li>· beforeLoad — 가드는 먼저 판단</li>
                <li>· validateSearch — 매칭 단계 필요</li>
              </ul>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">가장 흔한 함정</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">autoCodeSplitting</code> 을 켰는데 번들이
            안 줄어든다면, 라우트 파일 상단에서 무거운 라이브러리를{' '}
            <strong className="text-foreground">정적 import</strong> 하고 있을 확률이 높다.
            그 import 가 loader 나 모듈 최상위에서 쓰이면 초기 번들에 남는다.
          </p>
        </div>

        <Example title="loader 안에서 동적 import" code={CODE_TRAP}>
          <p className="text-muted-foreground">
            분할이 실제로 되고 있는지는 빌드 로그의 청크 목록으로 확인한다. 큰 청크가 어디에
            딸려 있는지 보면 원인이 드러난다.
          </p>
        </Example>
      </section>

      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground leading-relaxed">
          자동 분할이 아니라 <strong className="text-foreground">라우트별로 직접 고르고
          싶다면</strong> → <Link to="/code-splitting/manual" className="text-primary underline-offset-4 hover:underline">수동 분할 · lazy</Link>
        </p>
      </div>
    </div>
  )
}
