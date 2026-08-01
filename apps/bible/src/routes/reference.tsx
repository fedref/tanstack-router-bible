import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// 📖 대응 문서: docs/17-options-reference.md · 18 · 19 · 20
//
// 실행 예제로 만들 것이 없는(또는 SSR 이 필요한) 챕터들의 안내 페이지.
export const Route = createFileRoute('/reference')({
  component: ReferenceIndex,
})

const CHAPTERS: {
  no: string
  title: string
  doc: string
  why: string
  points: string[]
}[] = [
  {
    no: '17',
    title: '옵션 전수 레퍼런스',
    doc: 'docs/17-options-reference.md',
    why: '표를 눌러 볼 일은 없다. 찾는 문서라 실행 예제가 무의미하다.',
    points: [
      'RouterOptions — core 43 + React 어댑터 7 = 49개',
      'Route 옵션 — 매칭 · 데이터 · 컴포넌트 · 라이프사이클',
      'Link / Navigate 옵션 · loader 인자 14개',
      '코드기반 라우팅 API (createRoute · RouteApi · createRootRoute)',
    ],
  },
  {
    no: '18',
    title: '생성기 설정 · CLI · Virtual Routes',
    doc: 'docs/18-generator-config.md',
    why: '빌드 시점 설정이라 런타임 화면으로 보여 줄 것이 없다. vite.config.ts 를 열어 보는 편이 빠르다.',
    points: [
      'tsr.config.json / 플러그인 옵션 18개 전수',
      'routeFileIgnorePattern · routeToken 정규식',
      'tsr generate · tsr watch (번들러 없을 때)',
      'Virtual File Routes — 파일 구조와 URL 을 분리',
    ],
  },
  {
    no: '19',
    title: '국제화 (i18n)',
    doc: 'docs/19-i18n.md',
    why: '이 저장소는 한국어 단일 언어다. 언어 전환 예제를 만들면 그것 자체가 별도 앱이 된다.',
    points: [
      '{-$locale} optional path param — 라우트 하나로 /about · /en/about',
      'params={(prev) => ({ ...prev, locale })} 로 나머지 유지',
      'beforeLoad + notFound() 로 locale 검증',
      'rewrite 옵션으로 라우트 트리에서 locale 걷어내기',
    ],
  },
  {
    no: '20',
    title: 'ESLint & Devtools',
    doc: 'docs/20-eslint-devtools.md',
    why: 'Devtools 는 좌하단 아이콘으로 이미 쓰고 있다. ESLint 는 에디터·CI 에서 동작한다.',
    points: [
      '라우트 속성 순서가 타입 추론을 바꾼다 (params → loaderDeps → context → beforeLoad → loader)',
      '@tanstack/eslint-plugin-router — 자동 수정 가능',
      'only-throw-error 와의 충돌 해결 (redirect/notFound 는 throw 다)',
      'Devtools 읽는 법 — Matches · Loader Data · Search Params · Route Tree',
    ],
  },
  {
    no: '21',
    title: '실전 레시피 (How-To)',
    doc: 'docs/21-recipes.md',
    why: '“이 기능은 무엇인가”가 아니라 “이걸 하려면 어떻게 하나”에 답하는 장이다. 앞 장들의 조합이라 새 API 예제가 없다.',
    points: [
      '테스트 — createMemoryHistory + renderWithRouter 헬퍼, router.state 검증',
      '디버깅 — 증상 → 원인 → 해결 표, window.router 노출',
      '배포 — 플랫폼별 SPA 폴백 (이 저장소 = GitHub Pages 404.html)',
      '환경변수 — VITE_ 접두사는 보안이 아니다',
      'Date in search — ISO 문자열로 (Date 객체는 [object Object] 가 된다)',
      'RBAC — 401(미인증) 과 403(권한없음) 을 구분한다',
      'React Router 마이그레이션 — 개념 대응표 + 점진 이전',
    ],
  },
]

function ReferenceIndex() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="secondary">Chapter 17–21</Badge>
        <h1 className="text-2xl font-bold tracking-tight">문서 전용 챕터</h1>
        <p className="text-muted-foreground leading-relaxed">
          이 저장소의 원칙은 “빠짐없이”다. 다만{' '}
          <strong className="text-foreground">실행 예제를 만드는 것이 오히려 이해를 방해하는
          주제</strong>가 있다. 옵션 표, 빌드 설정, 단일 언어 앱의 i18n, 에디터에서 동작하는
          린터가 그렇다. 이런 챕터는 문서에서 자세히 다루고 여기서는 길만 안내한다.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3">
          {CHAPTERS.map((c) => (
            <div key={c.no} className="rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{c.no}</Badge>
                <span className="font-medium">{c.title}</span>
                <code className="ml-auto text-xs text-muted-foreground">{c.doc}</code>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{c.why}</p>
              <ul className="mt-2 space-y-0.5 text-muted-foreground">
                {c.points.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">SSR 전용 기능</strong>(🚫 표시)도 같은
              이유로 실행 예제가 없다. bible 은 GitHub Pages 정적 배포(CSR)라 서버가 없다.
              해당 항목은 설명과 예시 코드로만 다룬다 — 자세한 목록은 README 의 “SSR 전용
              기능은 설명 + 예시 코드까지만” 절을 참고한다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
