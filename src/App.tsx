import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { getClientRouter } from './router'

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={getClientRouter()} />
      </Suspense>
    </ThemeProvider>
  )
}

export default App
