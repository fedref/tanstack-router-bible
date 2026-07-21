import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// 파일 경로 `routes/index.tsx` → URL `/` (index 라우트)
export const Route = createFileRoute('/')({
  component: Home,
})

const MODULES: { id: string; title: string; desc: string; done: boolean }[] = [
  { id: '00', title: 'Getting Started', desc: '왜 TanStack Router · DX 결정 · Vite/플러그인 셋업 · Devtools', done: true },
  { id: '01', title: '라우팅 기초', desc: '라우팅 개념 · 라우트 트리 · 매칭 · 파일 네이밍 · Outlet', done: true },
  { id: '02', title: '네비게이션', desc: 'Link · useNavigate · active · Link Options · Preloading · Events', done: true },
  { id: '03', title: '파라미터', desc: 'Path Params · Search Params(검증/타입) · 직렬화', done: true },
  { id: '04', title: '데이터 로딩/변경', desc: 'loader · loaderDeps · staleness · Mutations · Not Found', done: true },
  { id: '05', title: '타입 안전성 & 컨텍스트', desc: 'Type Safety · Type Utilities · Router Context', done: true },
  { id: '06', title: '라이프사이클 & 인증', desc: 'beforeLoad · Not Found Errors · Authenticated Routes', done: true },
  { id: '07', title: 'TanStack Query 통합', desc: 'queryOptions · ensureQueryData · useSuspenseQuery', done: true },
  { id: '08', title: '시너지 종합', desc: 'auth + context + search + loader + query 를 한 앱에', done: true },
]

function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">v1.170 · React · 파일기반 + Base UI</Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          TanStack Router 학습 바이블
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          각 Chapter은 <code className="rounded bg-muted px-1.5 py-0.5 text-sm">docs/</code>
          의 Markdown 문서와 이 앱의 실행 예제가 짝을 이룬다. 문서에서 개념을 읽고, 여기서
          직접 눌러보며 확인하라. 좌하단 Devtools로 매칭된 라우트·loader·search 상태를
          관찰할 수 있다.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <strong>00 ~ 08 전 Chapter 구현 완료.</strong> 왼쪽 사이드바에서 원하는 Chapter을 눌러
        시작하라. 마지막 08은 앞 기능을 한 앱에 합친 미니 카탈로그다.
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">학습 Chapter</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODULES.map((m) => (
            <Card key={m.id} className="gap-0 py-4">
              <CardHeader className="px-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {m.done ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/50" />
                    )}
                    {m.id} · {m.title}
                  </CardTitle>
                  <Badge variant={m.done ? 'default' : 'outline'}>
                    {m.done ? '구현됨' : '예정'}
                  </Badge>
                </div>
                <CardDescription className="pt-1">{m.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <div>
        <Button nativeButton={false} render={<Link to="/routing" />}>
          01. 라우팅 기초 시작
          <ArrowRight />
        </Button>
      </div>
    </div>
  )
}
