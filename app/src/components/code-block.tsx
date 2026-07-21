import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Check, Copy } from 'lucide-react'
import { useIsDark } from '@/hooks/use-is-dark'
import { Button } from '@/components/ui/button'

// prism-react-renderer 기반 코드 하이라이터. 외부 CDN 없이 자체 완결.
// 테마는 <html>.dark 를 따라 라이트/다크로 전환된다.
export function CodeBlock({
  code,
  language = 'tsx',
}: {
  code: string
  language?: string
}) {
  const isDark = useIsDark()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="relative">
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="코드 복사"
        onClick={copy}
        className="absolute top-2 right-2 z-10"
      >
        {copied ? <Check className="text-primary" /> : <Copy />}
      </Button>
      <Highlight
        theme={isDark ? themes.vsDark : themes.github}
        code={code.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} overflow-x-auto rounded-lg p-4 text-xs leading-relaxed`}
            style={style}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line })
              return (
                <div key={i} {...lineProps}>
                  <span className="mr-4 inline-block w-5 select-none text-right opacity-30">
                    {i + 1}
                  </span>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token })
                    return <span key={key} {...tokenProps} />
                  })}
                </div>
              )
            })}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
