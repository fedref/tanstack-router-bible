import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Example } from '@/components/example'
import { USER_IDS } from '@/lib/users'

export const Route = createFileRoute('/params/path')({
  component: PathLayout,
})

const CODE_PATH = `// params.path.$userId.tsx → /params/path/:userId
export const Route = createFileRoute('/params/path/$userId')({
  // params.parse 로 원시 string 을 number 로 변환한다(선택).
  // 이후 params.userId 의 타입은 number 가 된다.
  params: {
    parse: (raw) => ({ userId: Number(raw.userId) }),
    stringify: (p) => ({ userId: String(p.userId) }),
  },
  loader: ({ params }) => getUser(params.userId),  // number
  component: UserDetail,
})

function UserDetail() {
  const { userId } = Route.useParams()   // number, 타입 추론됨
  const user = Route.useLoaderData()
  // ...
}`

function PathLayout() {
  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Path Params</h2>
        <p className="text-muted-foreground leading-relaxed">
          파일명 <code className="rounded bg-muted px-1">$userId</code> 가 동적 세그먼트가 되고,{' '}
          <code className="rounded bg-muted px-1">Route.useParams()</code> 로 값을 읽는다. 기본
          타입은 string 이지만, <code className="rounded bg-muted px-1">params.parse</code> 를 주면{' '}
          <strong>number 등 원하는 타입으로 변환</strong>할 수 있다(아래 예제는 number 로 바꾼다).
        </p>
      </div>

      <Example title="params.parse 로 number 변환" code={CODE_PATH}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {USER_IDS.map((id) => (
              <Button
                key={id}
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link to="/params/path/$userId" params={{ userId: id }} />}
              >
                user #{id}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/params/path/$userId" params={{ userId: 999 }} />}
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
