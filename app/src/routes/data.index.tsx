import { createFileRoute } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/data/')({
  component: DataOverview,
})

const ROWS: { step: string; what: string }[] = [
  { step: 'beforeLoad', what: '진입 전 가장 먼저. 인증 체크·컨텍스트 주입 (Chapter 06)' },
  { step: 'loaderDeps', what: 'loader 가 의존하는 값(주로 search) 선언 → 바뀌면 재실행' },
  { step: 'loader', what: '데이터 로드. 반환값은 useLoaderData() 로 읽는다' },
  { step: 'pendingComponent', what: '로딩이 pendingMs 를 넘기면 표시되는 대기 UI' },
  { step: 'errorComponent', what: 'loader 가 throw 하면 표시되는 에러 UI' },
  { step: 'component', what: '데이터가 준비된 뒤 렌더되는 실제 화면' },
]

function DataOverview() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">라우트 데이터 생명주기</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          라우트에 진입하면 아래 순서로 흐른다. 핵심은 <strong>컴포넌트보다 데이터가 먼저</strong>
          라는 것 — 그래서 “로딩 스피너를 컴포넌트 안에서 관리”하던 방식과 달라진다.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>단계</TableHead>
              <TableHead>하는 일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.step}>
                <TableCell className="whitespace-nowrap">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.step}</code>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.what}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-sm text-muted-foreground">
        서브탭에서 각 단계를 직접 관찰하라. Chapter 07에서는 이 loader 를 TanStack Query 와 엮어
        캐시를 공유하는 법을 다룬다.
      </div>
    </div>
  )
}
