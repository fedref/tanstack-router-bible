import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { getUser } from '@/lib/users'

export const Route = createFileRoute('/params/path/$userId')({
  // 원시 string → number 로 변환. 이후 params.userId 는 number 타입이다.
  params: {
    parse: (raw) => ({ userId: Number(raw.userId) }),
    stringify: (p) => ({ userId: String(p.userId) }),
  },
  loader: ({ params }) => getUser(params.userId),
  component: UserDetail,
})

function UserDetail() {
  const { userId } = Route.useParams()
  const user = Route.useLoaderData()

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">params.userId =</span>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {userId} ({typeof userId})
        </code>
      </div>
      {user ? (
        <div className="flex items-center gap-2">
          <strong>{user.name}</strong>
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
        </div>
      ) : (
        <p className="text-muted-foreground">
          해당 유저가 없다. (Chapter 06 Not Found 로 개선 가능)
        </p>
      )}
    </div>
  )
}
