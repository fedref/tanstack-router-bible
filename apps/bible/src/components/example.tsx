import { useState } from 'react'
import { Code2, Eye, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/code-block'

// 설명(프로즈)과 "실행되는 예제"를 시각적으로 분리하기 위한 컨테이너.
// 헤더에 "예제" 라벨을 달고, [미리보기 | 코드] 토글로 렌더 결과와 소스를 오간다.
export function Example({
  title,
  code,
  language = 'tsx',
  children,
}: {
  title?: string
  code: string
  language?: string
  children: React.ReactNode
}) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview')

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FlaskConical className="size-3.5" />
          예제{title ? ` · ${title}` : ''}
        </span>
        <div className="flex gap-1">
          <Button
            size="xs"
            variant={tab === 'preview' ? 'secondary' : 'ghost'}
            onClick={() => setTab('preview')}
          >
            <Eye />
            미리보기
          </Button>
          <Button
            size="xs"
            variant={tab === 'code' ? 'secondary' : 'ghost'}
            onClick={() => setTab('code')}
          >
            <Code2 />
            코드
          </Button>
        </div>
      </div>

      {tab === 'preview' ? (
        <div className="bg-background p-4">{children}</div>
      ) : (
        <CodeBlock code={code} language={language} />
      )}
    </div>
  )
}
