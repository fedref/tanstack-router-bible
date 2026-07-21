import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// 파일 `routing.concepts.tsx` → URL `/routing/concepts`
export const Route = createFileRoute('/routing/concepts')({
  component: Concepts,
})

const ROWS: { kind: string; file: string; url: string; note: string }[] = [
  { kind: 'Root', file: '__root.tsx', url: '(전체)', note: '모든 라우트의 조상. 공통 레이아웃/컨텍스트 정의' },
  { kind: 'Index', file: 'x.index.tsx', url: '/x', note: '부모 경로와 정확히 일치할 때 렌더' },
  { kind: 'Static', file: 'about.tsx', url: '/about', note: '고정 경로' },
  { kind: 'Layout', file: 'x.tsx (+자식)', url: '/x/*', note: 'Outlet 으로 자식을 감싸는 공유 레이아웃' },
  { kind: 'Dynamic', file: 'posts.$id.tsx', url: '/posts/:id', note: 'params.id 로 값 접근 (Chapter 03)' },
  { kind: 'Pathless Layout', file: '_auth.tsx', url: '(URL 없음)', note: 'URL엔 안 나오지만 레이아웃/beforeLoad 공유 (Chapter 06)' },
  { kind: 'Splat', file: '$.tsx', url: '/*', note: '남은 경로 전부 매칭 (404 등)' },
]

function Concepts() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">라우트 종류 한눈에</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          같은 파일기반 규칙에서 파일 이름 형태만 바꾸면 아래처럼 서로 다른 성격의 라우트가
          된다. 이 표로 “다양한 결과”를 한눈에 비교할 수 있다.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>종류</TableHead>
              <TableHead>파일 예</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>설명</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.kind}>
                <TableCell className="font-medium">{r.kind}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.file}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{r.url}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-sm text-muted-foreground">
        Pathless Layout, Splat, Dynamic 라우트는 각각 Chapter 06/04/03 에서 실제 동작 예제로
        다시 등장한다. 여기서는 “전체 지형”만 잡는다.
      </div>
    </div>
  )
}
