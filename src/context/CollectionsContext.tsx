import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import type { ApiPlaylistSummary } from '../lib/api-types'
import { useAuth } from './AuthContext'

type CollectionsContextValue = {
  favorites: Set<string>
  watchlist: Set<string>
  playlists: ApiPlaylistSummary[]
  refreshCollections: () => Promise<void>
  toggleFavorite: (videoId: string) => Promise<boolean>
  toggleWatchlist: (videoId: string) => Promise<boolean>
  addToPlaylist: (playlistId: string, videoId: string) => Promise<void>
  createPlaylist: (input: { title: string; description?: string | null; isPublic?: boolean }) => Promise<string>
}

const CollectionsContext = createContext<CollectionsContextValue | undefined>(undefined)

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.VITE_API_BASE_URL || 'http://localhost:5173'
}

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const baseUrl = getBaseUrl()

  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([])

  const refreshCollections = async () => {
    if (!user) {
      setFavorites(new Set())
      setWatchlist(new Set())
      setPlaylists([])
      return
    }

    const [favoritesRes, watchlistRes, playlistsRes] = await Promise.all([
      apiGet<{ ids: string[] }>('/api/favorites/ids', { baseUrl }),
      apiGet<{ ids: string[] }>('/api/watchlist/ids', { baseUrl }),
      apiGet<ApiPlaylistSummary[]>('/api/playlists', { baseUrl }),
    ])

    setFavorites(new Set(favoritesRes.ids))
    setWatchlist(new Set(watchlistRes.ids))
    setPlaylists(playlistsRes)
  }

  useEffect(() => {
    void refreshCollections()
  }, [user?.id])

  const toggleFavorite = async (videoId: string) => {
    const res = await apiPost<{ isFavorited: boolean }>('/api/favorites/toggle', { videoId }, { baseUrl })
    setFavorites((prev) => {
      const next = new Set(prev)
      if (res.isFavorited) {
        next.add(videoId)
      } else {
        next.delete(videoId)
      }
      return next
    })
    return res.isFavorited
  }

  const toggleWatchlist = async (videoId: string) => {
    const res = await apiPost<{ isWatchlisted: boolean }>('/api/watchlist/toggle', { videoId }, { baseUrl })
    setWatchlist((prev) => {
      const next = new Set(prev)
      if (res.isWatchlisted) {
        next.add(videoId)
      } else {
        next.delete(videoId)
      }
      return next
    })
    return res.isWatchlisted
  }

  const addToPlaylist = async (playlistId: string, videoId: string) => {
    await apiPost(`/api/playlists/${encodeURIComponent(playlistId)}/items`, { videoId }, { baseUrl })
    await refreshCollections()
  }

  const createPlaylist = async (input: { title: string; description?: string | null; isPublic?: boolean }) => {
    const res = await apiPost<{ id?: string }>(
      '/api/playlists',
      {
        title: input.title,
        description: input.description ?? null,
        isPublic: Boolean(input.isPublic),
      },
      { baseUrl },
    )

    if (!res.id) {
      throw new Error('Failed to create playlist')
    }

    await refreshCollections()
    return res.id
  }

  const value = useMemo<CollectionsContextValue>(
    () => ({
      favorites,
      watchlist,
      playlists,
      refreshCollections,
      toggleFavorite,
      toggleWatchlist,
      addToPlaylist,
      createPlaylist,
    }),
    [favorites, watchlist, playlists],
  )

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>
}

export function useCollections() {
  const ctx = useContext(CollectionsContext)
  if (!ctx) {
    throw new Error('useCollections must be used within a CollectionsProvider')
  }
  return ctx
}
