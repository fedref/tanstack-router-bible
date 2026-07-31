import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/params/path/')({
  component: () => (
    <p className="text-sm text-muted-foreground leading-relaxed">
      위 <code className="rounded bg-muted px-1 text-sm">user #id</code> 버튼을 눌러 보라. URL의{' '}
      <code className="rounded bg-muted px-1 text-sm">$userId</code> 조각이{' '}
      <code className="rounded bg-muted px-1 text-sm">params.userId</code> 로 전달되고,{' '}
      <code className="rounded bg-muted px-1 text-sm">params.parse</code> 덕분에 그 타입은 number
      다.
    </p>
  ),
})
