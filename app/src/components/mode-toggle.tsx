import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 아주 가벼운 다크모드 토글. next-themes 없이 <html> 의 .dark 클래스를 직접 켜고 끈다.
// 초기값은 main.tsx 의 initTheme() 가 이미 적용해 둔다(깜빡임 방지).
export function ModeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="테마 전환"
      onClick={() => setIsDark((v) => !v)}
    >
      <Sun className="size-4 scale-100 dark:scale-0 transition-transform" />
      <Moon className="absolute size-4 scale-0 dark:scale-100 transition-transform" />
    </Button>
  )
}
