import { createFileRoute } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/navigation/')({
  component: NavigationOverview,
})

const ROWS: { api: string; kind: string; when: string }[] = [
  { api: '<Link>', kind: '선언형', when: '사용자가 클릭할 링크. 렌더 트리에 그대로 둔다 (대부분의 이동)' },
  { api: 'useNavigate()', kind: '명령형', when: '이벤트 핸들러/로직 안에서 코드로 이동 (제출 후, 조건 분기 등)' },
  { api: '<Navigate>', kind: '선언형', when: '렌더 시점에 즉시 리다이렉트하는 컴포넌트' },
  { api: 'redirect()', kind: '로직', when: 'beforeLoad/loader 안에서 던져 이동 (Chapter 06 인증)' },
  { api: 'linkOptions()', kind: '헬퍼', when: '재사용할 링크 설정을 타입 안전하게 묶어 두는 도구' },
]

function NavigationOverview() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">이동 방법 고르기</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          상황에 맞는 도구를 고르는 게 먼저다. “클릭해서 가는 링크”라면 거의 항상{' '}
          <code className="rounded bg-muted px-1 text-sm">&lt;Link&gt;</code>, “코드가 판단해서
          보내는 이동”이라면 <code className="rounded bg-muted px-1 text-sm">useNavigate()</code>
          다. 나머지는 특수한 경우에 쓴다.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>API</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>언제 쓰나</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((r) => (
              <TableRow key={r.api}>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.api}</code>
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">{r.kind}</TableCell>
                <TableCell className="text-muted-foreground">{r.when}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border-l-2 border-primary bg-muted/40 p-3 text-sm text-muted-foreground">
        공통점 하나. 이 모든 API는 <strong>같은 타입 안전성</strong>을 공유한다. 존재하지 않는
        경로나 빠진 params 는 전부 컴파일 단계에서 걸린다. 위 서브탭에서 각 방법을 직접 눌러
        보라.
      </div>
    </div>
  )
}
