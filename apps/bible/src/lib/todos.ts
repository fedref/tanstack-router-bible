// Chapter 04 데이터 로딩/변경 데모용 인메모리 스토어(가변).
// mutation 후 router.invalidate() 로 loader 를 다시 돌리는 흐름을 보여준다.

export interface Todo {
  id: number
  title: string
  done: boolean
}

let SEQ = 3
let TODOS: Todo[] = [
  { id: 1, title: 'loader 이해하기', done: true },
  { id: 2, title: 'loaderDeps 로 검색 연동', done: false },
  { id: 3, title: 'mutation 후 invalidate', done: false },
]

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// loader 가 몇 번 실행됐는지 관찰하기 위한 카운터.
let LOAD_COUNT = 0

export function listTodos(ms = 300): Promise<Todo[]> {
  LOAD_COUNT += 1
  return delay([...TODOS], ms)
}

export function getLoadCount() {
  return LOAD_COUNT
}

export function addTodo(title: string): Promise<Todo> {
  const todo: Todo = { id: ++SEQ, title, done: false }
  TODOS = [...TODOS, todo]
  return delay(todo, 200)
}

export function toggleTodo(id: number): Promise<void> {
  TODOS = TODOS.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
  return delay(undefined, 200)
}

export function removeTodo(id: number): Promise<void> {
  TODOS = TODOS.filter((t) => t.id !== id)
  return delay(undefined, 200)
}
