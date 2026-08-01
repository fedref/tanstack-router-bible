import { Await, CatchBoundary, createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Example } from '@/components/example'

// 📖 대응 문서: docs/10-deferred-streaming.md
//
// 핵심은 "await 를 붙이느냐 마느냐" 한 글자다.
// 빠른 것은 await 해서 화면을 그리고, 느린 것은 Promise 그대로 넘겨 <Await> 가 받는다.
export const Route = createFileRoute('/deferred/')({
  loader: () => {
    // 빠른 데이터: 기다린다 → 이게 있어야 화면을 그린다
    const post = { title: '느린 댓글이 빠른 본문을 막지 않는다', body: '본문은 즉시 렌더된다.' }

    // 느린 데이터: await 하지 않는다 → Promise 그대로 반환
    const commentsPromise = sleep(1500).then(() => [
      { id: 1, text: '1.5초 뒤에 도착한 댓글' },
      { id: 2, text: '본문은 이미 보이고 있었다' },
    ])

    // 실패하는 Promise 도 하나 — 부분 실패를 부분적으로 처리하는 것을 보여 준다
    const flakyPromise = sleep(900).then(() => {
      throw new Error('이 영역만 실패했다')
    })

    return { post, commentsPromise, flakyPromise }
  },
  component: DeferredDemo,
})

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

const CODE_DEFER = `loader: () => {
  // 빠른 것: await 한다 → 이게 준비돼야 화면을 그린다
  const post = getPost()

  // 느린 것: await 하지 않는다 → Promise 그대로 반환
  const commentsPromise = fetchComments()

  return { post, commentsPromise }
}

function Page() {
  const { post, commentsPromise } = Route.useLoaderData()
  return (
    <>
      <h1>{post.title}</h1>          {/* 즉시 렌더 */}

      <Await promise={commentsPromise} fallback={<Skeleton />}>
        {(comments) => <CommentList comments={comments} />}
      </Await>
    </>
  )
}`

const CODE_CATCH = `// Deferred 의 에러는 errorComponent 가 잡지 못한다.
// loader 단계가 아니라 렌더 단계에서 터지기 때문이다.
<CatchBoundary
  getResetKey={() => 'flaky'}
  errorComponent={({ error }) => <div>{error.message}</div>}
>
  <Await promise={flakyPromise} fallback={<Skeleton />}>
    {(data) => <div>{data}</div>}
  </Await>
</CatchBoundary>`

function DeferredDemo() {
  const { post, commentsPromise, flakyPromise } = Route.useLoaderData()

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">빠른 것 먼저, 느린 것은 자리만 잡고</h3>
          <p className="text-muted-foreground leading-relaxed">
            이 페이지에 들어온 순간 본문은 <strong className="text-foreground">이미
            보였다</strong>. 댓글은 1.5초 뒤에 그 자리에만 채워진다. 전부{' '}
            <code className="rounded bg-muted px-1">await</code> 했다면 본문도 1.5초를
            기다려야 했다. <strong className="text-foreground">탭을 다시 눌러</strong>{' '}
            처음부터 관찰해 보라.
          </p>
        </div>

        <Example title="defer 없이도 동작한다 — Promise 를 그대로 반환" code={CODE_DEFER}>
          <article className="space-y-3">
            <div className="rounded border p-3">
              <Badge variant="secondary">즉시</Badge>
              <h4 className="mt-1.5 font-medium">{post.title}</h4>
              <p className="text-muted-foreground">{post.body}</p>
            </div>

            <div className="rounded border p-3">
              <Badge variant="outline">1.5초 뒤</Badge>
              <div className="mt-1.5">
                <Await
                  promise={commentsPromise}
                  fallback={
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  }
                >
                  {(comments) => (
                    <ul className="space-y-1">
                      {comments.map((c) => (
                        <li key={c.id}>· {c.text}</li>
                      ))}
                    </ul>
                  )}
                </Await>
              </div>
            </div>
          </article>
        </Example>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold">부분 실패는 부분적으로 처리한다</h3>
          <p className="text-muted-foreground leading-relaxed">
            아래 영역의 Promise 는 0.9초 뒤 <strong className="text-foreground">실패</strong>
            한다. 그런데 위의 본문과 댓글은 멀쩡하다.{' '}
            <code className="rounded bg-muted px-1">errorComponent</code> 로는 잡히지 않고{' '}
            <code className="rounded bg-muted px-1">CatchBoundary</code> 가 받는다 — 12장에서
            다룬 내용이다.
          </p>
        </div>

        <Example title="CatchBoundary 로 영역만 감싸기" code={CODE_CATCH}>
          <div className="rounded border p-3">
            <Badge variant="outline">실패하는 영역</Badge>
            <div className="mt-1.5">
              <CatchBoundary
                getResetKey={() => 'flaky'}
                errorComponent={({ error }) => (
                  <p className="text-destructive">⚠ {error.message}</p>
                )}
              >
                <Await promise={flakyPromise} fallback={<Skeleton className="h-4 w-1/2" />}>
                  {() => <p>여기까지 오지 않는다</p>}
                </Await>
              </CatchBoundary>
            </div>
          </div>
        </Example>
      </section>

      <section className="rounded-lg border bg-muted/40 p-3">
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">언제 쓰나:</strong> 판단 기준은 하나다 —{' '}
          <em>“이것 때문에 나머지가 막히는가?”</em> 그렇지 않다면 그냥{' '}
          <code className="rounded bg-muted px-1">await</code> 한다. 모든 걸 defer 하면 화면이
          조각조각 나타나 오히려 어수선하다. TanStack Query(07장)를 쓴다면 Deferred 없이도
          같은 효과를 낼 수 있다.
        </p>
      </section>
    </div>
  )
}
