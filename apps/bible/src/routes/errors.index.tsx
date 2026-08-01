import {
  createFileRoute,
  isNotFound,
  isRedirect,
  Link,
  notFound,
} from '@tanstack/react-router'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/12-error-boundaries.md
//
// mode 에 따라 loader 가 각각 다른 방식으로 "정상이 아닌 흐름"을 만든다.
export const Route = createFileRoute('/errors/')({
  validateSearch: z.object({
    mode: z.enum(['ok', 'error', 'notfound']).catch('ok'),
  }),
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ deps }) => {
    if (deps.mode === 'error') {
      throw new Error('서버에서 데이터를 가져오지 못했습니다')
    }
    if (deps.mode === 'notfound') {
      // notFound 는 에러가 아니다 — data 를 실어 보낼 수 있다
      throw notFound({ data: { searched: 'abc123' } })
    }
    return { items: ['첫 번째', '두 번째', '세 번째'] }
  },
  errorComponent: ({ error, reset }) => (
    <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
      <Badge variant="destructive">errorComponent</Badge>
      <p className="font-medium">{error.message}</p>
      <p className="text-xs text-muted-foreground">
        reset() 은 경계를 초기화하고 loader 를 다시 실행한다.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={reset}>
          다시 시도 (reset)
        </Button>
        <Button size="sm" variant="outline" nativeButton={false} render={<Link to="/errors" search={{ mode: 'ok' }} />}>
          정상 상태로
        </Button>
      </div>
    </div>
  ),
  notFoundComponent: ({ data }) => (
    <div className="space-y-2 rounded-lg border p-3">
      <Badge variant="outline">notFoundComponent</Badge>
      <p className="font-medium">그런 데이터는 없습니다.</p>
      <p className="text-xs text-muted-foreground">
        notFound({'{ data }'}) 로 넘긴 값: <code>{JSON.stringify(data)}</code>
      </p>
      <Button size="sm" variant="outline" nativeButton={false} render={<Link to="/errors" search={{ mode: 'ok' }} />}>
        정상 상태로
      </Button>
    </div>
  ),
  component: ErrorsDemo,
})

const CODE_THREE = `// ① 진짜 실패 → errorComponent 가 받는다
throw new Error('서버에서 데이터를 가져오지 못했습니다')

// ② 없음 → notFoundComponent 가 받는다 (에러가 아니다!)
throw notFound({ data: { searched: params.id } })

// ③ 이동 → 라우터가 처리한다 (컴포넌트 불필요)
throw redirect({ to: '/login' })`

const CODE_GUARD = `// redirect 와 notFound 도 throw 로 구현된다.
// 순진하게 로깅하면 정상 흐름이 전부 에러로 집계된다.
try {
  await router.load()
} catch (err) {
  if (isRedirect(err)) return       // 정상 — 보고하지 않는다
  if (isNotFound(err)) return       // 정상 — 404 다
  reportToSentry(err)               // 진짜 에러만
}`

function ErrorsDemo() {
  const { mode } = Route.useSearch()
  const data = Route.useLoaderData()

  // 판별 함수가 실제로 어떻게 동작하는지 보여 준다
  const samples = [
    { label: 'new Error("boom")', v: new Error('boom') },
    { label: '{ isNotFound: true } 유사 객체', v: { data: {} } },
  ]

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">셋은 다르게 다뤄야 한다</h3>
          <p className="text-muted-foreground leading-relaxed">
            없는 상품 페이지에 “서버 오류가 발생했습니다”를 띄우는 앱을 흔히 본다. 그건 이
            셋을 구분하지 않아서 생기는 일이다.{' '}
            <strong className="text-foreground">404 는 실패가 아니라 정상적인 응답이다.</strong>
          </p>
        </div>

        <Example title="세 가지 흐름" code={CODE_THREE}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['ok', 'error', 'notfound'] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={mode === m ? 'secondary' : 'outline'}
                  nativeButton={false}
                  render={<Link to="/errors" search={{ mode: m }} />}
                >
                  {m === 'ok' ? '정상' : m === 'error' ? 'Error 던지기' : 'notFound 던지기'}
                </Button>
              ))}
            </div>

            {/* mode 가 ok 일 때만 여기 도달한다 */}
            <div className="rounded border p-3">
              <Badge variant="secondary">정상 렌더</Badge>
              <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
                {data.items.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </div>
          </div>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">판별 함수 — 모니터링이 오염되지 않게</h3>
          <p className="text-muted-foreground leading-relaxed">
            <code className="rounded bg-muted px-1">redirect()</code> 와{' '}
            <code className="rounded bg-muted px-1">notFound()</code> 는 내부적으로 throw 로
            구현된다. 에러 로깅을 순진하게 짜면{' '}
            <strong className="text-foreground">정상적인 리다이렉트가 전부 에러로 집계된다.</strong>{' '}
            대시보드가 404 와 로그인 리다이렉트로 가득 차는 흔한 사고다.
          </p>
        </div>

        <Example title="isRedirect · isNotFound 로 먼저 거른다" code={CODE_GUARD}>
          <div className="space-y-1.5">
            {samples.map((s) => (
              <div key={s.label} className="flex flex-wrap items-center gap-2 rounded border px-2 py-1.5">
                <code className="text-xs">{s.label}</code>
                <span className="ml-auto flex gap-1.5">
                  <Badge variant={isRedirect(s.v) ? 'default' : 'outline'}>
                    isRedirect: {String(isRedirect(s.v))}
                  </Badge>
                  <Badge variant={isNotFound(s.v) ? 'default' : 'outline'}>
                    isNotFound: {String(isNotFound(s.v))}
                  </Badge>
                </span>
              </div>
            ))}
          </div>
        </Example>
      </section>

      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground leading-relaxed">
          화면 <strong className="text-foreground">일부 영역</strong>만 감싸는 경계가 필요하다면{' '}
          <Link to="/errors/boundary" className="text-primary underline-offset-4 hover:underline">
            CatchBoundary
          </Link>{' '}
          로. 라우트 옵션은 라우트 단위로만 경계를 만든다.
        </p>
      </div>
    </div>
  )
}
