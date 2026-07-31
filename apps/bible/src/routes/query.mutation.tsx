import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Example } from '@/components/example'
import { todosQuery } from '@/lib/queries'
import { addTodo, removeTodo, toggleTodo } from '@/lib/todos'

export const Route = createFileRoute('/query/mutation')({
  loader: ({ context }) => context.queryClient.ensureQueryData(todosQuery),
  component: MutationDemo,
})

const CODE_MUT = `const qc = useQueryClient()
const { data: todos } = useSuspenseQuery(todosQuery)

const addMut = useMutation({
  mutationFn: (title: string) => addTodo(title),
  // 변경 성공 → 관련 쿼리를 무효화하면 자동으로 다시 가져온다
  onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
})

<button onClick={() => addMut.mutate('새 할 일')} disabled={addMut.isPending}>
  추가
</button>`

function MutationDemo() {
  const qc = useQueryClient()
  const { data: todos } = useSuspenseQuery(todosQuery)
  const [title, setTitle] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['todos'] })

  const addMut = useMutation({
    mutationFn: (t: string) => addTodo(t),
    onSuccess: invalidate,
  })
  const toggleMut = useMutation({
    mutationFn: (id: number) => toggleTodo(id),
    onSuccess: invalidate,
  })
  const removeMut = useMutation({
    mutationFn: (id: number) => removeTodo(id),
    onSuccess: invalidate,
  })

  const busy = addMut.isPending || toggleMut.isPending || removeMut.isPending

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h3 className="font-semibold">useMutation + invalidateQueries</h3>
        <p className="text-muted-foreground leading-relaxed">
          Query 를 얹으면 변경은 <code className="rounded bg-muted px-1">useMutation</code> 으로,
          갱신은 <code className="rounded bg-muted px-1">invalidateQueries</code> 로 한다. Chapter 04의
          <code className="rounded bg-muted px-1">router.invalidate()</code> 와 목적은 같지만, 캐시
          단위로 더 정밀하게(키별로) 무효화한다.
        </p>
      </div>

      <Example title="useMutation → invalidateQueries" code={CODE_MUT}>
        <div className="space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!title.trim()) return
              addMut.mutate(title.trim(), { onSuccess: () => setTitle('') })
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
                  onClick={() => toggleMut.mutate(t.id)}
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
                  onClick={() => removeMut.mutate(t.id)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">{busy ? '처리 중…' : ' '}</p>
        </div>
      </Example>
    </div>
  )
}
