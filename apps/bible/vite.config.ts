import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // GitHub Pages 프로젝트 사이트는 /<repo>/ 하위에 배포된다.
  // CI에서 VITE_BASE=/<repo>/ 를 주고, 로컬 개발에서는 '/' 를 쓴다.
  base: process.env.VITE_BASE || '/',
  plugins: [
    // 파일기반 라우팅: src/routes/** 를 스캔해 routeTree.gen.ts 를 자동 생성한다.
    // react() 앞에 두어야 생성된 트리를 react 플러그인이 인식한다.
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
