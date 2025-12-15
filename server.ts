import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import type { ViteDevServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

const templateHtml = isProduction
  ? fs.readFileSync('./dist/client/index.html', 'utf-8')
  : ''

const ssrManifest = isProduction
  ? fs.readFileSync('./dist/client/.vite/ssr-manifest.json', 'utf-8')
  : undefined

async function createServer() {
  const app = express()

  let vite: ViteDevServer | undefined

  if (!isProduction) {
    const { createServer } = await import('vite')
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base,
    })
    app.use(vite.middlewares)
  } else {
    const compression = (await import('compression')).default
    const sirv = (await import('sirv')).default
    app.use(compression())
    app.use(base, sirv('./dist/client', { extensions: [] }))
  }

  app.use('*', async (req, res, next) => {
    try {
      if (!vite) {
        return res.status(500).end('SSR server not available in production mode')
      }

      let url = req.originalUrl || req.url || '/'
      if (!url.startsWith('/')) url = `/${url}`

      const template = await vite.transformIndexHtml(url, fs.readFileSync('index.html', 'utf-8'))
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')

      const result = await render(url, process.env.VITE_API_BASE_URL || 'http://localhost:5173')

      // Handle redirects/responses
      if (result?.status && result.status >= 300 && result.status < 400) {
        const location = result.headers?.get('Location')
        if (location) return res.redirect(result.status, location)
      }

      const html = template
        .replace('<!--app-html-->', result.html ?? '')
        .replace(
          '<!--app-data-->',
          `<script>window.__staticRouterHydrationData=${JSON.stringify(result.hydrationData ?? null)}</script>`,
        )

      res.status(result.status ?? 200).set(Object.fromEntries((result.headers ?? new Headers()).entries())).end(html)
    } catch (e) {
      next(e)
    }
  })

  return { app, vite }
}

createServer().then(({ app }) =>
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
)
