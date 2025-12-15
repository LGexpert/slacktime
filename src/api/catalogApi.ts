import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import { Pool } from 'pg'

// JSON response helper
function respondJson(res: ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body)
  if (!res.headersSent) {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Content-Length', Buffer.byteLength(json))
  }
  res.end(json)
}

// TODO: replace this stub with your actual implementation or import:
// import { handleApiRequest } from './handleApiRequest'
async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const db = getPool() // obtain the shared pool for any queries
  // ...existing code...
  const url = req.url || ''
  if (url.startsWith('/api/videos')) {
    // example: await db.query('SELECT ...')
    respondJson(res, 200, { items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 })
    return
  }
  respondJson(res, 404, { error: 'Not Found' })
}

// Minimal NextFunction type
type NextFunction = (err?: any) => void

// Minimal SSR render stub. Replace with your actual renderer.
async function render(url: string, baseUrl: string, cookies: string): Promise<Response> {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Slacktime</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${baseUrl}/src/main.tsx"></script>
  </body>
</html>`
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // ...any other pg options...
    })
  }
  return _pool
}

// Use getPool() wherever you run queries

export default {
  name: 'catalog-api',
  configureServer(server: ViteDevServer) {
    // API routes
    server.middlewares.use(
      (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
        if (!req.url?.startsWith('/api/')) return next()
        void handleApiRequest(req, res).catch((err) => {
          if (!(res as ServerResponse).headersSent) {
            respondJson(res, 500, { error: (err as Error).message })
          }
        })
      }
    )

    // HTML route handler (was app.use)
    server.middlewares.use(
      async (req: IncomingMessage, res: ServerResponse, next: (err?: any) => void) => {
        const accept = req.headers.accept || ''
        if (!accept.includes('text/html')) return next()

        const cookies = req.headers.cookie || ''
        const url = (req as any).originalUrl || req.url
        const baseUrl = `http://localhost:5173`

        const result = await render(url, baseUrl, cookies)

        if (result instanceof Response) {
          res.statusCode = result.status
          const body = await result.text()
          res.setHeader('Content-Type', result.headers.get('Content-Type') || 'text/html; charset=utf-8')
          res.end(body)
          return
        }
        return next()
      }
    )

    server.httpServer?.once('close', () => {
      void _pool?.end()
    })
  },
}