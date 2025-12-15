import { renderToString } from 'react-dom/server'
import { routes } from './router'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom'

export async function render(url: string, baseUrl: string = 'http://localhost:5173', cookies?: string) {
  const handler = createStaticHandler(routes)

  const requestUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  const request = new Request(requestUrl, {
    headers: {
      ...(cookies ? { Cookie: cookies } : {}),
    },
  })
  const context = await handler.query(request)
  if (context instanceof Response) {
    return { html: '', status: context.status, headers: context.headers, hydrationData: null }
  }

  const router = createStaticRouter(handler.dataRoutes, context)
  const html = renderToString(
    <ThemeProvider>
      <StaticRouterProvider router={router} context={context} hydrate />
    </ThemeProvider>
  )

  const hydrationData = {
    loaderData: context.loaderData,
    actionData: context.actionData,
    errors: context.errors,
  }

  return { html, status: 200, headers: new Headers(), hydrationData }
}

