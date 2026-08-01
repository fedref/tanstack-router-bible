#!/usr/bin/env node
/**
 * 문서 커버리지 검사
 *
 * "패키지가 제공하는 것"과 "docs/ 가 설명하는 것"을 이름 단위로 대조한다.
 * 눈으로 훑어서는 "무엇이 없는지" 알 수 없기 때문에(없는 것은 보이지 않는다)
 * 기계적으로 확인한다.
 *
 * 검사 대상
 *   ① public export      — @tanstack/react-router 가 export 하는 이름 전부
 *   ② RouterOptions      — createRouter({...}) 에 넣는 옵션 (core + React 어댑터)
 *   ③ Route 옵션         — createFileRoute(...)({...}) 에 넣는 옵션
 *   ④ Link/Active 옵션   — <Link> 와 activeOptions
 *   ⑤ loader/beforeLoad  — 콜백 인자로 들어오는 필드
 *
 * 사용법
 *   pnpm check:docs            # 누락이 있으면 exit 1
 *   pnpm check:docs --verbose  # 검사한 이름을 전부 출력
 *
 * 못 잡는 것 (한계)
 *   - 이름만 한 번 언급되고 설명이 부실한 경우
 *   - 기존 API 의 동작이 바뀐 경우 (이름은 그대로)
 *   - 제거·deprecated 된 API 가 문서에 남아 있는 경우
 *   즉 하한선을 지키는 장치이지 문서 품질을 보증하지는 않는다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCS_DIR = path.join(ROOT, 'docs')
const VERBOSE = process.argv.includes('--verbose')

// ── 패키지 위치 찾기 ────────────────────────────────────────────────
// router-core·history 는 직접 의존성이 아니므로 react-router 를 기준으로 찾는다.
const require = createRequire(path.join(ROOT, 'apps/bible/package.json'))
const reactRouterDir = path.dirname(require.resolve('@tanstack/react-router/package.json'))
const requireFromRR = createRequire(path.join(reactRouterDir, 'package.json'))

const pkgDir = (name, from = requireFromRR) =>
  path.dirname(from.resolve(`${name}/package.json`))

const RR = reactRouterDir
const RC = pkgDir('@tanstack/router-core')
const version = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version

const read = (dir, rel) => {
  const p = path.join(dir, 'dist/esm', rel)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''
}

// ── docs 전문 ──────────────────────────────────────────────────────
const docs = fs
  .readdirSync(DOCS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => fs.readFileSync(path.join(DOCS_DIR, f), 'utf8'))
  .join('\n')

const documented = (name) => new RegExp(`\\b${name.replace(/[$]/g, '\\$')}\\b`).test(docs)

// ── ① export 이름 추출 ─────────────────────────────────────────────
function collectExports() {
  const src = read(RR, 'index.d.ts')
  const names = new Set()
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (let n of m[1].split(',')) {
      n = n.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim()
      if (n && /^[A-Za-z_]/.test(n)) names.add(n)
    }
  }
  return [...names]
}

// ── 인터페이스의 최상위 필드만 뽑는 파서 ──────────────────────────
// 중괄호·괄호 깊이를 추적해 중첩 타입 안쪽 필드는 건너뛴다.
function topLevelFields(src, ifaceName) {
  const re = new RegExp(`(?:interface|type)\\s+${ifaceName}\\b[^{]*`)
  const m = re.exec(src)
  if (!m) return []
  const start = src.indexOf('{', m.index)
  if (start < 0) return []

  let depth = 0
  let end = start
  for (; end < src.length; end++) {
    if (src[end] === '{') depth++
    else if (src[end] === '}') {
      depth--
      if (depth === 0) break
    }
  }

  const body = src.slice(start + 1, end)
  const out = []
  let d = 0
  let line = ''
  for (const c of body) {
    if ('{(['.includes(c)) d++
    else if ('})]'.includes(c)) d--
    else if (c === '\n') {
      // 줄이 끝날 때 검사한다. depth 가 0 인 동안 모은 글자만 line 에 담기므로,
      // `Wrap?: (props: {` 처럼 여러 줄에 걸친 함수 타입도 앞부분("Wrap?: ")이
      // 남아 필드명을 뽑을 수 있다. 중첩 안쪽 줄은 line 이 비어 매칭되지 않는다.
      const f = /^\s*(?:readonly\s+)?([a-zA-Z_][\w]*)\s*\??\s*[:(]/.exec(line)
      if (f) out.push(f[1])
      line = ''
      continue
    }
    if (d === 0) line += c
  }
  return [...new Set(out)]
}

// ── ②~⑤ 옵션 필드 추출 ────────────────────────────────────────────
function collectOptions() {
  const coreRouter = read(RC, 'router.d.ts')
  const coreRoute = read(RC, 'route.d.ts')
  const coreLink = read(RC, 'link.d.ts')
  const rrRouter = read(RR, 'router.d.ts')

  return {
    'RouterOptions (core)': topLevelFields(coreRouter, 'RouterOptions'),
    // React 어댑터가 declaration merging 으로 덧붙이는 옵션
    // (defaultErrorComponent · Wrap · InnerWrap 등) — core 문서에는 나오지 않는다
    'RouterOptions (React)': topLevelFields(rrRouter, 'RouterOptionsExtensions'),
    'Route 옵션': topLevelFields(coreRoute, 'UpdatableRouteOptions'),
    'Link 옵션': topLevelFields(coreLink, 'LinkOptionsProps'),
    'activeOptions': topLevelFields(coreLink, 'ActiveOptions'),
    'loader/beforeLoad 인자': topLevelFields(coreRoute, 'ContextOptions'),
  }
}

// ── 실행 ───────────────────────────────────────────────────────────
console.log('문서 커버리지 검사')
console.log(`  @tanstack/react-router  ${version(RR)}`)
console.log(`  @tanstack/router-core   ${version(RC)}`)
console.log(`  docs/                   ${docs.length.toLocaleString()}자\n`)

const groups = [['public export', collectExports()], ...Object.entries(collectOptions())]

let totalAll = 0
let totalMissing = 0
const failures = []

for (const [label, names] of groups) {
  if (!names.length) {
    console.log(`  ⚠️  ${label.padEnd(24)} 추출 실패 — 타입 정의 구조가 바뀌었을 수 있다`)
    continue
  }
  const missing = names.filter((n) => !documented(n))
  totalAll += names.length
  totalMissing += missing.length

  const mark = missing.length ? '❌' : '✅'
  console.log(`  ${mark} ${label.padEnd(24)} ${names.length - missing.length}/${names.length}`)
  if (missing.length) failures.push([label, missing])
  if (VERBOSE) console.log(`       ${names.join(' ')}`)
}

console.log(`\n  합계 ${totalAll - totalMissing}/${totalAll}`)

if (failures.length) {
  console.log('\n누락 — 아래 이름이 docs/ 어디에도 등장하지 않는다:\n')
  for (const [label, missing] of failures) {
    console.log(`  [${label}]`)
    for (const n of missing) console.log(`    ${n}`)
  }
  console.log(
    '\n버전을 올린 뒤라면 새로 추가된 API 일 가능성이 높다.\n' +
      '해당 항목을 문서화한 뒤 다시 실행한다.',
  )
  process.exit(1)
}

console.log('\n누락 없음.')
