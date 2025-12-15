import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { getClientRouter } from './router'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

declare global {
  interface Window {
    __staticRouterHydrationData?: unknown
  }
}

const router = getClientRouter(window.__staticRouterHydrationData)

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
