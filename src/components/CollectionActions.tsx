import { useState } from 'react'

interface CollectionActionsProps {
  videoId: string
}

export function CollectionActions({ videoId }: CollectionActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)

  const isAuthenticated = false

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth'
      return
    }

    setIsFavorited(!isFavorited)
    console.log('Stub: Toggle favorite for video', videoId)
  }

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth'
      return
    }

    setIsInWatchlist(!isInWatchlist)
    console.log('Stub: Toggle watchlist for video', videoId)
  }

  const handleAddToPlaylist = async (playlistName: string) => {
    if (!isAuthenticated) {
      window.location.href = '/auth'
      return
    }

    console.log('Stub: Add video', videoId, 'to playlist', playlistName)
    setShowPlaylistMenu(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleFavorite}
        disabled={!isAuthenticated}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isFavorited
            ? 'border-red-500 bg-red-500/10 text-red-500'
            : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'
        } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!isAuthenticated ? 'Sign in to favorite' : isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="text-sm font-medium">Favorite</span>
      </button>

      <button
        type="button"
        onClick={handleWatchlist}
        disabled={!isAuthenticated}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isInWatchlist
            ? 'border-blue-500 bg-blue-500/10 text-blue-500'
            : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'
        } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={!isAuthenticated ? 'Sign in to add to watchlist' : isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium">Watchlist</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
          disabled={!isAuthenticated}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            !isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={!isAuthenticated ? 'Sign in to add to playlist' : 'Add to playlist'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm font-medium">Playlist</span>
        </button>

        {showPlaylistMenu && isAuthenticated && (
          <div className="absolute top-full mt-2 right-0 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg p-2 min-w-[200px] z-10">
            <div className="text-sm text-secondary-light dark:text-secondary-dark p-2">
              No playlists available
            </div>
            <button
              type="button"
              onClick={() => handleAddToPlaylist('New Playlist')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 rounded transition-colors"
            >
              Create new playlist
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
