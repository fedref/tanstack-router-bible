import { createFileRoute } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/params/')({
  component: ParamsOverview,
})

const ROWS: { q: string; path: string; search: string }[] = [
  { q: '위치', path: '경로 조각 (/users/$id)', search: '? 뒤 (?page=2&sort=asc)' },
  { q: '성격', path: '리소스를 특정 (필수)', search: '표현/필터 상태 (보통 선택)' },
  { q: '정의', path: '파일명 $param', search: 'validateSearch 로 스키마 검증' },
  { q: '읽기', path: 'Route.useParams()', search: 'Route.useSearch()' },
  { q: '값 타입', path: '기본 string (parse 로 변환 가능)', search: '스키마대로 (number/boolean/배열/객체)' },
  { q: '바뀌면', path: '보통 새 리소스 → 새 로드', search: '같은 화면의 상태 갱신' },
]

function ParamsOverview() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Path vs Search 한눈에</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          둘 다 “URL에 담긴 값”이지만 역할이 다르다. <strong>무엇을</strong> 보느냐(리소스 식별)는
          Path, <strong>어떻게</strong> 보느냐(정렬·필터·페이지)는 Search 로 두는 게 일반적이다.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>구분</TableHead>
              <TableHead>Path Params</TableHead>
              <TableHead>Search Params</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.q}>
                <TableCell className="font-medium whitespace-nowrap">{r.q}</TableCell>
                <TableCell className="text-muted-foreground">{r.path}</TableCell>
                <TableCell className="text-muted-foreground">{r.search}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-sm text-muted-foreground">
        위 서브탭에서 각각을 직접 만져 보라. Search 는 특히 “URL이 곧 상태”라는 감각을 확실히
        체감하게 된다.
      </div>
    </div>
  )
}
