import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Videos from './pages/Videos'
import Artists from './pages/Artists'
import Genres from './pages/Genres'
import Playlists from './pages/Playlists'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/videos',
    element: <Layout><Videos /></Layout>,
  },
  {
    path: '/artists',
    element: <Layout><Artists /></Layout>,
  },
  {
    path: '/genres',
    element: <Layout><Genres /></Layout>,
  },
  {
    path: '/playlists',
    element: <Layout><Playlists /></Layout>,
  },
  {
    path: '/profile',
    element: <Layout><Profile /></Layout>,
  },
  {
    path: '/auth',
    element: <Layout><Auth /></Layout>,
  },
])

export default router
