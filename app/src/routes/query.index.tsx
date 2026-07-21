import { createFileRoute } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/query/')({
  component: QueryOverview,
})

const ROWS: { q: string; router: string; query: string }[] = [
  { q: '언제', router: '라우트 진입 시(loader)', query: '컴포넌트가 필요할 때(hook)' },
  { q: '역할', router: '진입 전 프리페치 · 블로킹', query: '캐시 · 재검증 · 공유' },
  { q: '접점', router: 'context.queryClient', query: '같은 queryClient 인스턴스' },
  { q: '프리페치', router: 'ensureQueryData(opts)', query: '캐시에 채워 둠' },
  { q: '읽기', router: '—', query: 'useSuspenseQuery(opts) → 즉시' },
]

function QueryOverview() {
  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Router loader × Query 캐시</h2>
        <p className="text-muted-foreground leading-relaxed">
          왜 둘을 같이 쓰나? loader 는 “진입 전에 막고 받는” 데 강하고, Query 는 “받은 걸 캐시하고
          여러 화면이 공유·재검증” 하는 데 강하다. 접점은 <strong>context 에 넣어 둔 하나의
          queryClient</strong> 다.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>구분</TableHead>
              <TableHead>Router loader</TableHead>
              <TableHead>TanStack Query</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.q}>
                <TableCell className="whitespace-nowrap font-medium">{r.q}</TableCell>
                <TableCell className="text-muted-foreground">{r.router}</TableCell>
                <TableCell className="text-muted-foreground">{r.query}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-muted-foreground">
        우하단 <strong>React Query Devtools</strong> 를 열어 두고 서브탭을 다니면, loader 가 채운
        캐시와 무효화가 실시간으로 보인다.
      </div>
    </div>
  )
}
