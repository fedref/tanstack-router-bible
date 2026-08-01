#!/usr/bin/env node
/**
 * 문서 코드 예제의 import 검증
 *
 * `docs/*.md` 의 코드 블록은 대부분 발췌라 통째로 컴파일할 수 없다(import 생략,
 * 가상의 `fetchPost()` 참조 등). 그래도 **존재하지 않는 API 를 import 하는 것**은
 * 잡을 수 있고, 이게 독자에게 가장 치명적인 오류다 — 그대로 따라 하면 실패한다.
 *
 * 검사 내용
 *   ① `@tanstack/react-router` 에서 import 하는 이름이 실제 export 인가
 *   ② `@tanstack/router-plugin/*` 의 진입점이 실제로 존재하는가
 *
 * 사용법
 *   pnpm check:imports
 *
 * 잡지 못하는 것
 *   - 시그니처 불일치(인자 개수·타입)
 *   - 옵션 이름 오타 (별도 커버리지 스크립트가 이름 존재 여부만 본다)
 *   - 코드의 논리 오류
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(path.join(process.cwd(), 'apps/bible/package.json'))
const RR = path.dirname(require.resolve('@tanstack/react-router/package.json'))

// 실제 export 목록 — 값(`export {}`)과 타입 전용(`export type {}`) 을 모두 모은다.
// 타입 전용을 빠뜨리면 `import type { LinkProps }` 같은 정상 코드를 오류로 잡는다.
const exportNames = new Set()
const dts = fs.readFileSync(path.join(RR, 'dist/esm/index.d.ts'), 'utf8')
for (const m of dts.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g))
  for (let n of m[1].split(',')) {
    n = n.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim()
    if (n && /^[A-Za-z_]/.test(n)) exportNames.add(n)
  }

// 서브패스(ssr/server · ssr/client)가 제공하는 이름
const subpathNames = new Map()
for (const sub of ['ssr/server', 'ssr/client']) {
  const p = path.join(RR, 'dist/esm', sub + '.d.ts')
  if (!fs.existsSync(p)) continue
  const names = new Set()
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g))
    for (let n of m[1].split(',')) {
      n = n.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop().trim()
      if (n) names.add(n)
    }
  subpathNames.set(sub, names)
}

// router-plugin 의 실제 진입점
const pluginEntries = new Set()
try {
  const pluginDir = path.dirname(
    createRequire(path.join(RR, 'package.json')).resolve('@tanstack/router-plugin/package.json'),
  )
  const pkg = JSON.parse(fs.readFileSync(path.join(pluginDir, 'package.json'), 'utf8'))
  for (const key of Object.keys(pkg.exports ?? {})) {
    const clean = key.replace(/^\.\/?/, '')
    if (clean) pluginEntries.add(clean)
  }
} catch {
  // 플러그인을 못 찾으면 ② 검사는 건너뛴다
}

const problems = []
let checkedBlocks = 0
let checkedImports = 0

for (const f of fs.readdirSync('docs').filter((x) => x.endsWith('.md'))) {
  const src = fs.readFileSync(path.join('docs', f), 'utf8')
  const lines = src.split('\n')

  for (const m of src.matchAll(/```(tsx?|ts)\n([\s\S]*?)```/g)) {
    checkedBlocks++
    const code = m[2]
    const lineNo = src.slice(0, m.index).split('\n').length

    // ① @tanstack/react-router 에서 가져오는 이름
    for (const im of code.matchAll(/import\s*(?:type\s+)?\{([^}]+)\}\s*from\s*'@tanstack\/react-router'/g)) {
      for (let name of im[1].split(',')) {
        name = name.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
        if (!name) continue
        checkedImports++
        if (!exportNames.has(name)) {
          problems.push({ f, lineNo, kind: 'export 아님', detail: name })
        }
      }
    }

    // ② router-plugin 진입점
    for (const im of code.matchAll(/from\s*'@tanstack\/router-plugin\/([\w-]+)'/g)) {
      checkedImports++
      if (pluginEntries.size && !pluginEntries.has(im[1])) {
        problems.push({ f, lineNo, kind: '플러그인 진입점 없음', detail: im[1] })
      }
    }

    // ③ react-router 서브패스(ssr/server · ssr/client)
    for (const im of code.matchAll(
      /import\s*(?:type\s+)?\{([^}]+)\}\s*from\s*'@tanstack\/react-router\/([\w/]+)'/g,
    )) {
      const sub = im[2]
      const known = subpathNames.get(sub)
      if (!known) {
        checkedImports++
        problems.push({ f, lineNo, kind: '서브패스 없음', detail: sub })
        continue
      }
      for (let name of im[1].split(',')) {
        name = name.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
        if (!name) continue
        checkedImports++
        if (!known.has(name)) {
          problems.push({ f, lineNo, kind: `${sub} 에 없음`, detail: name })
        }
      }
    }
  }
}

console.log(`코드 블록 ${checkedBlocks}개에서 import ${checkedImports}건 검사`)
if (pluginEntries.size) console.log(`  router-plugin 진입점: ${[...pluginEntries].join(' ')}`)

if (!problems.length) {
  console.log('✅ 존재하지 않는 API 를 가져오는 곳 없음')
  process.exit(0)
}

console.log(`❌ 문제 ${problems.length}건\n`)
for (const p of problems) console.log(`  ${p.f}:${p.lineNo}  ${p.kind}: ${p.detail}`)
console.log('\n문서의 예제를 그대로 복사하면 실패한다. 이름을 확인한다.')
process.exit(1)
