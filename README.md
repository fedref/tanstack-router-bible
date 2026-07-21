# TanStack Router 학습 바이블

TanStack Router(React · 파일기반)를 **공식 문서 수준으로 전부** 익히되, 단일 기능을 넘어
**기능 조합의 시너지**까지 체득하기 위한 개인 학습용 참고서다.

- 성격: **커리큘럼**(순차 학습 경로) + **사전**(주제별 빠른 조회)을 겸한다.
- 구성: `docs/` 의 Markdown 문서 ↔ `app/` 의 **실제 구동되는 예제** 가 짝을 이룬다.
- 학습법: 문서에서 개념을 읽고 → `app` 에서 직접 눌러보고 → Devtools로 내부 상태를 관찰한다.

> 범위: **React 코어 + 파일기반 라우팅 + TanStack Query 통합.**
> SSR / TanStack Start / Solid / 고급 조합(Deferred, Route Masking, View Transitions 등)은
> Phase 2로 보류. 문서 구조는 이후 확장 가능하게 설계됨.

---

## 실행법

```bash
cd app
pnpm install
pnpm dev          # http://localhost:5173  — 좌하단 Devtools로 라우터 상태 관찰
pnpm typecheck    # 파일기반 라우팅의 타입 추론(1급 타입 안전성) 검증
pnpm build        # 타입체크 + 프로덕션 빌드
```

버전: `@tanstack/react-router ^1.170` · `router-plugin ^1.168` · `react 19` · `vite 6` · `react-query ^5`
UI: `shadcn/ui`(Base UI 기반, radix 아님) + Tailwind v4 + 라이트/다크 테마. shadcn studio 스타일 대시보드 쉘.

---

## 커리큘럼 (순차 학습 경로)

| # | Chapter | 문서 | 예제 라우트 | 상태 |
|---|------|------|-------------|------|
| 00 | Getting Started | [docs/00-getting-started.md](docs/00-getting-started.md) | `/` | ✅ |
| 01 | 라우팅 기초 | [docs/01-routing.md](docs/01-routing.md) | `/routing/*` | ✅ |
| 02 | 네비게이션 | [docs/02-navigation.md](docs/02-navigation.md) | `/navigation/*` | ✅ |
| 03 | 파라미터 (Path/Search) | [docs/03-params.md](docs/03-params.md) | `/params/*` | ✅ |
| 04 | 데이터 로딩/변경 | [docs/04-data-loading.md](docs/04-data-loading.md) | `/data/*` | ✅ |
| 05 | 타입 안전성 & 컨텍스트 | [docs/05-type-safety-context.md](docs/05-type-safety-context.md) | `/type-safety/*` | ✅ |
| 06 | 라이프사이클 & 인증 | [docs/06-lifecycle-auth.md](docs/06-lifecycle-auth.md) | `/auth/*` | ✅ |
| 07 | TanStack Query 통합 | [docs/07-query-integration.md](docs/07-query-integration.md) | `/query/*` | ✅ |
| 08 | 시너지 종합 (kitchen-sink) | [docs/08-synergy.md](docs/08-synergy.md) | `/kitchen-sink/*` | ✅ |

## 사전 (주제별 조회)

빠른 조회는 **[docs/INDEX.md](docs/INDEX.md)** 참고 — API/기능명으로 문서와 예제 라우트를 역인덱싱한다.

---

## 문서 규약

모든 주제는 다음 7섹션 템플릿을 따른다:
**① 한 줄 정의 & 언제 쓰나 → ② 최소 예제 → ③ 옵션·변형(다양한 결과) → ④ 흔한 실수/함정 →
⑤ 🔗 시너지(다른 기능과의 조합) → ▶ 실행 예제(앱 라우트) → 📖 공식 문서 링크.**

문서 서술은 한국어, 코드 식별자·기술 용어는 원문 유지.
