// Path Params 데모용 mock. id 를 number 로 다루는 예를 위해 숫자 키를 쓴다.
export interface User {
  id: number
  name: string
  role: 'admin' | 'member'
}

const USERS: User[] = [
  { id: 1, name: 'Ada', role: 'admin' },
  { id: 7, name: 'Linus', role: 'member' },
  { id: 42, name: 'Grace', role: 'admin' },
]

export function getUser(id: number): User | undefined {
  return USERS.find((u) => u.id === id)
}

export const USER_IDS = USERS.map((u) => u.id)
