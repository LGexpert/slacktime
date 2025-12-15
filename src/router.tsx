import { createBrowserRouter, redirect, type RouteObject } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home, { loader as homeLoader } from './pages/Home'
import Videos, { loader as videosLoader } from './pages/Videos'
import VideoDetail, { loader as videoDetailLoader } from './pages/VideoDetail'
import Artists, { loader as artistsLoader } from './pages/Artists'
import ArtistDetail, { loader as artistDetailLoader } from './pages/ArtistDetail'
import Genres, { loader as genresLoader } from './pages/Genres'
import GenreDetail, { loader as genreDetailLoader } from './pages/GenreDetail'
import Search, { loader as searchLoader } from './pages/Search'
import Profile, { loader as profileLoader } from './pages/Profile'
import Settings, { loader as settingsLoader } from './pages/Settings'
import Favorites, { loader as favoritesLoader } from './pages/Favorites'
import Playlists, { loader as playlistsLoader } from './pages/Playlists'
import PlaylistDetail, { loader as playlistDetailLoader } from './pages/PlaylistDetail'
import AuthSignIn, { action as signInAction } from './pages/AuthSignIn'
import AuthSignUp, { action as signUpAction } from './pages/AuthSignUp'
import AuthReset, { action as resetAction } from './pages/AuthReset'
import { apiGet } from './lib/api'
import type { ApiMeResponse } from './lib/api-types'

export async function rootLoader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  try {
    const res = await apiGet<ApiMeResponse>('/api/me', { baseUrl })
    return { user: res.user }
  } catch {
    return { user: null }
  }
}

export async function requireAuthLoader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  const res = await apiGet<ApiMeResponse>('/api/me', { baseUrl })
  if (!res.user) throw redirect('/auth/sign-in')
  return { user: res.user }
}

export const routes: RouteObject[] = [
  {
    id: 'root',
    path: '/',
    element: <Layout />,
    loader: rootLoader,
    errorElement: <div style={{ padding: 24 }}>Unexpected error. Please try again.</div>,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader,
      },
      {
        path: 'videos',
        element: <Videos />,
        loader: videosLoader,
      },
      {
        path: 'videos/:slug',
        element: <VideoDetail />,
        loader: videoDetailLoader,
      },
      {
        path: 'artists',
        element: <Artists />,
        loader: artistsLoader,
      },
      {
        path: 'artists/:slug',
        element: <ArtistDetail />,
        loader: artistDetailLoader,
      },
      {
        path: 'genres',
        element: <Genres />,
        loader: genresLoader,
      },
      {
        path: 'genres/:slug',
        element: <GenreDetail />,
        loader: genreDetailLoader,
      },
      {
        path: 'search',
        element: <Search />,
        loader: searchLoader,
      },
      {
        path: 'favorites',
        element: <Favorites />,
        loader: favoritesLoader,
      },
      {
        path: 'playlists',
        element: <Playlists />,
        loader: playlistsLoader,
      },
      {
        path: 'playlists/:playlistId',
        element: <PlaylistDetail />,
        loader: playlistDetailLoader,
      },
      {
        path: 'profile',
        element: <Profile />,
        loader: profileLoader,
      },
      {
        path: 'settings',
        element: <Settings />,
        loader: settingsLoader,
      },
      {
        path: 'auth',
        children: [
          {
            index: true,
            loader: () => redirect('/auth/sign-in'),
          },
          {
            path: 'sign-in',
            element: <AuthSignIn />,
            action: signInAction,
          },
          {
            path: 'sign-up',
            element: <AuthSignUp />,
            action: signUpAction,
          },
          {
            path: 'reset',
            element: <AuthReset />,
            action: resetAction,
          },
        ],
      },
      {
        path: '*',
        element: <div style={{ padding: 24 }}>Page not found</div>,
      },
    ],
  },
]

export function getClientRouter(hydrationData?: unknown) {
  // IMPORTANT: only call createBrowserRouter on the client
  return createBrowserRouter(routes, hydrationData ? { hydrationData } : undefined)
}
