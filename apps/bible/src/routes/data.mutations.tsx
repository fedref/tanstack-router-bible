import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Example } from '@/components/example'
import { addTodo, getLoadCount, listTodos, removeTodo, toggleTodo } from '@/lib/todos'

export const Route = createFileRoute('/data/mutations')({
  loader: () => listTodos(),
  component: MutationsDemo,
})

const CODE_MUT = `const router = useRouter()

async function onAdd(title: string) {
  await addTodo(title)        // 1) 서버/스토어를 변경
  await router.invalidate()   // 2) 관련 loader 를 다시 실행 → 화면 갱신
}

// TanStack Router 자체에는 useMutation 이 없다.
// "변경 → invalidate" 가 기본 패턴이고, 서버 상태 캐시가 필요하면
// TanStack Query 를 얹는다(Chapter 07).`

function MutationsDemo() {
  const todos = Route.useLoaderData()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<unknown>) {
    setBusy(true)
    await fn()
    await router.invalidate() // loader 를 다시 돌려 최신 데이터로 화면 갱신
    setBusy(false)
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">변경 후 invalidate 로 다시 로드</h3>
        <p className="text-muted-foreground leading-relaxed">
          라우터에는 별도의 mutation API 가 없다. <strong>스토어를 바꾸고</strong>{' '}
          <code className="rounded bg-muted px-1">router.invalidate()</code> 로 loader 를 다시
          돌리는 게 기본이다. 추가/토글/삭제할 때마다 아래 <em>loader 실행 횟수</em>가 늘어난다.
        </p>
      </div>

      <Example title="mutation → invalidate" code={CODE_MUT}>
        <div className="space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!title.trim()) return
              void run(() => addTodo(title.trim())).then(() => setTitle(''))
            }}
          >
            <Input
              value={title}
              placeholder="새 할 일…"
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={busy}>
              추가
            </Button>
          </form>

          <ul className="space-y-1">
            {todos.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="완료 토글"
                  disabled={busy}
                  onClick={() => void run(() => toggleTodo(t.id))}
                >
                  <Check className={t.done ? 'text-primary' : 'opacity-30'} />
                </Button>
                <span
                  className={`flex-1 ${t.done ? 'text-muted-foreground line-through' : ''}`}
                >
                  {t.title}
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="삭제"
                  disabled={busy}
                  onClick={() => void run(() => removeTodo(t.id))}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            loader 실행 횟수:{' '}
            <code className="rounded bg-muted px-1">{getLoadCount()}</code>
            {busy ? ' · 처리 중…' : ''}
          </p>
        </div>
      </Example>
    </div>
  )
}
