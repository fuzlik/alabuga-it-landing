import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pagesBase = process.env.VITE_BASE || '/'

/** Prefix root-absolute /assets and /fonts so GitHub Pages project URLs resolve. */
function prefixPublicAssets(base: string): Plugin | null {
  const prefix = base === '/' ? '' : base.replace(/\/$/, '')
  if (!prefix) return null

  const rewrite = (code: string) =>
    code
      .replaceAll('"/assets/', `"${prefix}/assets/`)
      .replaceAll("'/assets/", `'${prefix}/assets/`)
      .replaceAll('"/fonts/', `"${prefix}/fonts/`)
      .replaceAll("'/fonts/", `'${prefix}/fonts/`)
      .replaceAll('url("/fonts/', `url("${prefix}/fonts/`)
      .replaceAll("url('/fonts/", `url('${prefix}/fonts/`)

  return {
    name: 'prefix-public-assets',
    transform(code, id) {
      if (id.includes('node_modules')) return null
      if (!/\.(tsx?|jsx?|css)$/.test(id)) return null
      return rewrite(code)
    },
    transformIndexHtml(html) {
      return rewrite(html)
    },
  }
}

export default defineConfig({
  base: pagesBase,
  plugins: [prefixPublicAssets(pagesBase), react(), tailwindcss()].filter(
    Boolean,
  ),
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
