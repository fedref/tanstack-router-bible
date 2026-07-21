import { useSyncExternalStore } from 'react'

// 아주 단순한 인증 스토어(인메모리). beforeLoad 는 isAuthenticated() 로 동기 확인하고,
// UI는 useAuth() 훅으로 로그인 상태 변화에 반응한다.
let authed = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export const auth = {
  isAuthenticated: () => authed,
  login: () => {
    authed = true
    emit()
  },
  logout: () => {
    authed = false
    emit()
  },
  subscribe: (cb: () => void) => {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}

export function useAuth() {
  return useSyncExternalStore(auth.subscribe, auth.isAuthenticated)
}
