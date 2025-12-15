import { Link } from 'react-router-dom'
import type { ApiVideo } from '../../lib/api-types'
import { formatCompactNumber, formatDuration } from '../../lib/format'
import { useAuth } from '../../context/AuthContext'
import { useCollections } from '../../context/CollectionsContext'

interface VideoCardProps {
  video: ApiVideo
}

export function VideoCard({ video }: VideoCardProps) {
  const { user } = useAuth()
  const collectionsContext = useCollections()
  const isFavorited = collectionsContext.favorites?.has(video.id) ?? false
  const toggleFavorite = collectionsContext.toggleFavorite || (() => {})
  const primaryArtist = video.artists[0]

  return (
    <article className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
      <Link
        to={`/videos/${encodeURIComponent(video.slug)}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Open ${video.title}`}
      >
        <div className="relative aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.durationSeconds)}
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold leading-tight">
            <Link
              to={`/videos/${encodeURIComponent(video.slug)}`}
              className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {video.title}
            </Link>
          </h3>
          <p className="text-sm text-secondary-light dark:text-secondary-dark">
            {primaryArtist ? (
              <Link
                to={`/artists/${primaryArtist.slug}`}
                className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {primaryArtist.name}
              </Link>
            ) : (
              'Unknown artist'
            )}
            {' • '}
            {formatCompactNumber(video.views)} views
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {video.genres.slice(0, 2).map((genre) => (
            <Link
              key={genre.slug}
              to={`/genres/${genre.slug}`}
              className="rounded-full border border-border-light dark:border-border-dark px-2 py-0.5 text-xs text-secondary-light dark:text-secondary-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {genre.name}
            </Link>
          ))}
          {video.moods.slice(0, 1).map((mood) => (
            <Link
              key={mood.slug}
              to={`/videos?mood=${encodeURIComponent(mood.slug)}`}
              className="rounded-full border border-border-light dark:border-border-dark px-2 py-0.5 text-xs text-secondary-light dark:text-secondary-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {mood.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          {user ? (
            <button
              onClick={() => toggleFavorite(video.id)}
              className={`text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isFavorited
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {isFavorited ? '❤ Saved' : '♡ Save'}
            </button>
          ) : (
            <Link
              to="/auth/sign-in"
              className="text-xs font-medium text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Sign in to save
            </Link>
          )}
          <span className="text-xs text-secondary-light dark:text-secondary-dark">
            {formatCompactNumber(video.likes)} likes
          </span>
        </div>
      </div>
    </article>
  )
}
