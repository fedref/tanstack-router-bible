import { useEffect, useState } from 'react'

// <html> 의 .dark 클래스 변화를 구독해, 테마 토글 시 코드 하이라이트 테마도 함께 바뀌게 한다.
export function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
