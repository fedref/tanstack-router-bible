# 18 · 라우트 생성기 설정 · CLI · Virtual File Routes

> 대응 예제: `apps/bible/vite.config.ts` (플러그인 설정)
> 📖 공식: [file-based-routing API](https://tanstack.com/router/latest/docs/api/file-based-routing) ·
> [virtual-file-routes](https://tanstack.com/router/latest/docs/framework/react/routing/virtual-file-routes) ·
> [Router CLI](https://tanstack.com/router/latest/docs/framework/react/installation/with-router-cli)

## 한 줄 정의 & 언제 쓰나

01장이 "파일 이름을 어떻게 짓느냐"였다면, 이 장은 **"그 규칙 자체를 어떻게 바꾸느냐"** 다.

`routeTree.gen.ts` 를 만들어 주는 것은 **generator** 이고, 이 generator는 두 가지 방법으로
돌린다.

| 방법 | 언제 | 설정 위치 |
|------|------|-----------|
| **번들러 플러그인** (권장) | Vite · Rspack · Webpack · Esbuild를 쓸 때 | `vite.config.ts` 등 |
| **Router CLI** (`tsr`) | 지원되는 번들러가 없을 때 | `tsr.config.json` |

옵션 이름과 의미는 **양쪽이 동일**하다. 아래 표는 두 방법 모두에 적용된다.

## 설정 옵션 전수

```ts
// apps/bible/vite.config.ts
TanStackRouterVite({
  target: 'react',
  autoCodeSplitting: true,
  // …아래 옵션들
})
```

### 경로 · 파일 인식

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `routesDirectory` | `string` | `'./src/routes'` | 라우트 파일이 있는 디렉터리 |
| `generatedRouteTree` | `string` | `'./src/routeTree.gen.ts'` | 생성될 트리 파일 위치 |
| `routeFilePrefix` | `string` | `''` | 이 접두사로 시작하는 파일만 라우트로 인식. 빈 값이면 전부 |
| `routeFileIgnorePrefix` | `string` | `'-'` | 이 접두사면 무시 (co-location용) |
| `routeFileIgnorePattern` | `string` | — | 정규식으로 제외. 예: `'\\.(css\|test)\\.ts'` |
| `routeToken` | `string \| RegExp` | `'route'` | 폴더 레이아웃 파일 이름 |
| `indexToken` | `string \| RegExp` | `'index'` | index 라우트 파일 이름 |
| `virtualRouteConfig` | `object \| string` | — | Virtual File Routes 설정 (아래) |

**`routeFileIgnorePattern` 이 실무에서 유용하다.** 라우트 폴더에 테스트 파일이나 스토리를
같이 두면 그것들이 라우트로 잡히는데, 이 정규식으로 걸러낸다.

```ts
routeFileIgnorePattern: '\\.(test|spec|stories)\\.tsx?$'
```

`routeToken` 과 `indexToken` 이 **정규식도 받는다**는 점은 잘 알려져 있지 않다. 여러 이름을
동시에 허용하고 싶을 때 쓴다.

```ts
routeToken: /^(route|_layout)$/     // route.tsx 와 _layout.tsx 둘 다 레이아웃으로
```

### 생성 코드 스타일

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `quoteStyle` | `'single' \| 'double'` | `'single'` | 따옴표 스타일 |
| `semicolons` | `boolean` | `false` | 세미콜론 추가 |
| `disableTypes` | `boolean` | `false` | 타입 생성 끄기 → `.js` 로 출력 |
| `addExtensions` | `boolean \| string` | `false` | import에 확장자 유지(`true`) / 제거(`false`) / 교체(문자열) |
| `enableRouteTreeFormatting` | `boolean` | `true` | 생성 파일 포맷팅 (큰 프로젝트에서는 끄면 빨라진다) |
| `routeTreeFileHeader` | `string[]` | ESLint/TS 지시문 | 파일 맨 앞에 붙일 줄 |
| `routeTreeFileFooter` | `string[]` | `[]` | 파일 맨 뒤에 붙일 줄 |

`routeTreeFileHeader` 의 기본값은 생성 파일에 린터를 끄는 지시문을 넣는 용도다. 커스텀
린터를 쓴다면 여기에 자기 지시문을 넣는다.

```ts
routeTreeFileHeader: [
  '/* eslint-disable */',
  '// @ts-nocheck',
  '// biome-ignore-all',
]
```

### 동작 제어

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `autoCodeSplitting` | `boolean` | `false` | 자동 코드 스플리팅 (09장) |
| `codeSplittingOptions` | `object` | — | 분할 정책 (09장) |
| `disableLogging` | `boolean` | `false` | 생성 로그 끄기 |
| `tmpDir` | `string` | `.tanstack/tmp` | 임시 디렉터리. `TSR_TMP_DIR` 환경변수 우선 |

`tmpDir` 은 generator가 파일을 **원자적으로 쓰기 위해** 쓰는 공간이다. 이 저장소의
`.gitignore` 에 `**/.tanstack` 이 들어 있는 이유가 이것이다.

## Router CLI — 번들러 없이 쓰기

지원되는 번들러가 없을 때만 쓴다. **route tree 생성만** 하고 코드 스플리팅 등 플러그인
기능은 제공하지 않는다.

```bash
pnpm add -D @tanstack/router-cli

tsr generate     # 한 번 생성
tsr watch        # 파일 변경 감시하며 자동 재생성
```

설정은 프로젝트 루트의 `tsr.config.json` 에 둔다. 키 이름은 플러그인 옵션과 같다.

```json
{
  "routesDirectory": "./src/routes",
  "generatedRouteTree": "./src/routeTree.gen.ts",
  "routeFileIgnorePrefix": "-",
  "quoteStyle": "single",
  "target": "react"
}
```

> 번들러 플러그인을 쓸 수 있다면 그쪽이 낫다. CLI는 별도 프로세스를 계속 띄워야 하고,
> HMR 연동도 없다.

## Virtual File Routes — 파일 구조와 URL을 분리하기

### 왜 필요한가

파일기반 라우팅의 전제는 **"파일 위치 = URL"** 이다. 대부분은 이게 편하지만, 어긋나는
경우가 있다.

- 파일은 도메인별로 묶고 싶은데(`features/billing/…`) URL은 평평해야 한다
- 기존 프로젝트의 파일 구조를 바꾸지 않고 TanStack Router로 옮기고 싶다
- URL 구조를 코드 한곳에서 **한눈에 보고 싶다**

Virtual File Routes는 **"어떤 파일이 어떤 URL을 담당하는지"를 코드로 직접 선언**한다.
파일 위치는 자유로워진다.

### API 네 개 + 하나

```tsx
import {
  rootRoute, route, index, layout, physical,
} from '@tanstack/virtual-file-routes'
```

| 함수 | 시그니처 | 하는 일 |
|------|----------|---------|
| `rootRoute` | `(fileName, children?)` | 루트 라우트 |
| `route` | `(path, fileName?, children?)` | 경로를 가진 라우트. **fileName 생략 시 경로 접두사만** |
| `index` | `(fileName)` | 부모 경로 자체에 매칭 |
| `layout` | `(fileName, children)` 또는 `(id, fileName, children)` | pathless 레이아웃 |
| `physical` | `(path?, directoryName?)` | **그 하위는 기존 파일기반 규칙으로** |

```tsx
// routes.ts
import { rootRoute, route, index, layout, physical } from '@tanstack/virtual-file-routes'

export const routes = rootRoute('root.tsx', [
  index('index.tsx'),                                    // /
  route('/about', 'about.tsx'),                          // /about

  layout('pathlessLayout.tsx', [                         // URL 없는 레이아웃
    route('/dashboard', 'app/dashboard.tsx', [           // /dashboard
      index('app/dashboard-index.tsx'),                  // /dashboard
    ]),
    physical('/posts', 'posts'),                         // /posts/** ← 파일기반으로
  ]),

  route('/hello', [                                      // 파일 없이 경로 접두사만
    route('/world', 'world.tsx'),                        // /hello/world
  ]),
])
```

`physical('/posts', 'posts')` 가 핵심이다. **가상 설정과 파일기반 규칙을 섞을 수 있다.**
복잡한 곳만 가상으로 선언하고 나머지는 평소대로 두면 된다.

### 설정에 연결하기

```ts
// vite.config.ts — 파일 경로로 지정
TanStackRouterVite({ target: 'react', virtualRouteConfig: './routes.ts' })

// 또는 객체를 직접 넘긴다
import { routes } from './routes'
TanStackRouterVite({ target: 'react', virtualRouteConfig: routes })
```

CLI라면 `tsr.config.json` 에 `"virtualRouteConfig": "./routes.ts"` 를 넣는다.

### 하위 트리만 가상으로 — `__virtual.ts`

전체를 가상으로 바꾸지 않고, **특정 폴더 아래만** 가상 설정을 쓸 수도 있다. 그 폴더에
`__virtual.ts` 를 두면 된다.

```tsx
// src/routes/foo/bar/__virtual.ts
import { defineVirtualSubtreeConfig, index, route } from '@tanstack/virtual-file-routes'

export default defineVirtualSubtreeConfig([
  index('home.tsx'),
  route('$id', 'details.tsx'),
])
```

가상 ↔ 파일기반을 **원하는 깊이만큼 번갈아** 쓸 수 있다.

### 언제 쓰지 말아야 하나

Virtual File Routes는 **파일기반 라우팅의 가장 큰 장점(파일만 보면 URL을 안다)을 포기**하는
선택이다. 라우트 구조를 알려면 `routes.ts` 를 열어야 한다. 새 팀원이 헤맬 수 있다.

- ✅ 기존 코드베이스를 마이그레이션하는 중이다
- ✅ 파일 구조가 URL과 근본적으로 달라야 하는 이유가 명확하다
- ❌ "폴더가 좀 지저분해서" — 01장의 `-` co-location이나 `(group)` 으로 충분하다

## 흔한 실수 / 함정

**1. `routeFileIgnorePattern` 없이 테스트 파일을 라우트 폴더에 둔다**
`posts.test.tsx` 가 `/posts/test` 라우트로 잡힌다. 정규식으로 걸러내거나 `-` 접두사를 쓴다.

**2. `routeToken` 과 `indexToken` 을 같은 값으로 지정**
에러가 난다(`The "indexToken" and "routeToken" options must be different.`).

**3. CLI와 플러그인을 동시에 돌린다**
같은 파일을 두 프로세스가 쓰면서 충돌한다. 하나만 쓴다.

**4. `generatedRouteTree` 를 커밋한다**
생성물이므로 `.gitignore` 에 넣는다. 이 저장소도 `**/src/routeTree.gen.ts` 를 무시한다.
단, CI에서 빌드 전에 생성되는지 확인해야 한다 — 이 저장소는 플러그인이 빌드 시 만든다.

**5. Virtual Routes에서 파일 경로를 `routesDirectory` 기준이 아닌 절대 경로로 쓴다**
`rootRoute('root.tsx')` 의 `root.tsx` 는 `routesDirectory` 기준 상대 경로다.

## 🔗 시너지

- **01장 파일 규약** — 이 장은 그 규약의 **설정 가능한 부분**을 다룬다. `routeToken` 을
  바꾸면 01장의 `route.tsx` 규칙 자체가 달라진다.
- **09장 코드 스플리팅** — `autoCodeSplitting`, `codeSplittingOptions` 가 여기 설정에 들어간다.
- **17장 코드기반 라우팅** — Virtual File Routes는 "파일기반과 코드기반의 중간"이다.
  코드로 트리를 선언하되 컴포넌트는 파일에 둔다.

## ▶ 실행 예제

`apps/bible/vite.config.ts` 가 실제 설정이다. 현재는 `target` 과 `autoCodeSplitting` 만
쓰고 나머지는 기본값이다.

```ts
TanStackRouterVite({ target: 'react', autoCodeSplitting: true })
```

`apps/playground` 에서 `routeFileIgnorePattern` 이나 `routeToken` 을 바꿔 보면 생성되는
`routeTree.gen.ts` 가 어떻게 달라지는지 바로 확인할 수 있다.

## 📖 공식 문서

- [File-Based Routing API (옵션 전체)](https://tanstack.com/router/latest/docs/api/file-based-routing)
- [Virtual File Routes](https://tanstack.com/router/latest/docs/framework/react/routing/virtual-file-routes)
- [Router CLI](https://tanstack.com/router/latest/docs/framework/react/installation/with-router-cli)
