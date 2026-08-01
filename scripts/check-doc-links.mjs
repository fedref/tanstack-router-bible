#!/usr/bin/env node
/**
 * 문서 내부 링크 검사
 *
 * `docs/*.md` 안의 상대 링크가 실제 파일과 헤딩(앵커)을 가리키는지 확인한다.
 * INDEX.md 는 "이거 어디서 봤더라"를 위한 색인이므로, 링크가 엉뚱한 곳으로
 * 떨어지면 존재 이유가 사라진다. 그런데 깨진 앵커는 에러를 내지 않고 그냥
 * 페이지 최상단으로 보내 버리기 때문에 눈으로는 발견되지 않는다.
 *
 * 사용법
 *   pnpm check:links
 *
 * 슬러그 규칙 (github-slugger 와 동일하게 맞춘 것)
 *   ① 소문자화
 *   ② 마크다운 강조 문자(` * ~) 제거 — 언더스코어는 남긴다(`_splat` 처럼 식별자의 일부)
 *   ③ Letter · Number · Mark · Connector(_) · 하이픈 · 공백 외 제거
 *      → `①` 은 Number 라 살아남고, `—`(em dash)·`🚫` 는 사라진다
 *   ④ 공백을 각각 하이픈으로 — 연속 공백을 하나로 합치지 않는다
 *      → "A — B" 는 하이픈 3개(`a---b`)가 된다
 *
 * 이 네 가지를 하나라도 다르게 구현하면 멀쩡한 링크를 깨졌다고 오판한다.
 */
import fs from 'node:fs'
import path from 'node:path'

const DOCS = 'docs'
const files = fs.readdirSync(DOCS).filter((f) => f.endsWith('.md'))

const slugify = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[`*~]/g, '')
    .replace(/[^\p{L}\p{N}\p{M}\p{Pc}\s-]/gu, '')
    .trim()
    .replace(/ /g, '-')

const anchors = new Map()
for (const f of files) {
  const src = fs.readFileSync(path.join(DOCS, f), 'utf8')
  const set = new Set()
  for (const m of src.matchAll(/^#{1,6}\s+(.+)$/gm)) set.add(slugify(m[1]))
  anchors.set(f, set)
}

const broken = []
let total = 0

for (const f of files) {
  const src = fs.readFileSync(path.join(DOCS, f), 'utf8')
  for (const m of src.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)) {
    const [, label, href] = m
    if (/^https?:/.test(href)) continue // 외부 링크는 검사하지 않는다
    total++
    const [target, anchor] = href.split('#')

    // docs 밖(../)을 가리키는 링크는 파일 존재만 확인한다
    if (target.startsWith('../')) {
      if (!fs.existsSync(path.join(DOCS, target))) broken.push({ from: f, href, why: '파일 없음' })
      continue
    }

    const file = target === '' ? f : target
    if (!files.includes(file)) {
      broken.push({ from: f, href, why: '파일 없음' })
      continue
    }
    if (anchor && !anchors.get(file).has(anchor)) {
      broken.push({ from: f, href, why: '앵커 없음', label: label.slice(0, 24) })
    }
  }
}

console.log(`문서 내부 링크 ${total}개 검사`)
if (!broken.length) {
  console.log('✅ 깨진 링크 없음')
  process.exit(0)
}

console.log(`❌ 깨짐 ${broken.length}개\n`)
const byFile = {}
for (const b of broken) (byFile[b.from] ??= []).push(b)
for (const [f, list] of Object.entries(byFile)) {
  console.log(`  ${f} (${list.length}건)`)
  for (const b of list) console.log(`    ${b.why}  ${b.href}`)
}
console.log('\n헤딩을 고쳤다면 그 헤딩을 가리키던 링크도 함께 고쳐야 한다.')
process.exit(1)
