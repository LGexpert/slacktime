import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home, { loader as homeLoader } from './pages/Home'
import Videos, { loader as videosLoader } from './pages/Videos'
import Artists, { loader as artistsLoader } from './pages/Artists'
import ArtistDetail, { loader as artistDetailLoader } from './pages/ArtistDetail'
import Genres, { loader as genresLoader } from './pages/Genres'
import GenreDetail, { loader as genreDetailLoader } from './pages/GenreDetail'
import Search, { loader as searchLoader } from './pages/Search'
import Playlists from './pages/Playlists'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
        path: 'playlists',
        element: <Playlists />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'auth',
        element: <Auth />,
      },
    ],
  },
])

export default router
