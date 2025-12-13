import { Link } from 'react-router-dom'
import type { ApiArtist } from '../../lib/api-types'

interface ArtistCardProps {
  artist: ApiArtist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <article className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 shadow-sm">
      <Link
        to={`/artists/${artist.slug}`}
        className="flex items-start gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
      >
        <div className="shrink-0">
          {artist.avatarUrl ? (
            <img
              src={artist.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500/30 to-red-500/30" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold truncate">{artist.name}</h3>
          {artist.bio ? (
            <p className="mt-1 text-sm text-secondary-light dark:text-secondary-dark line-clamp-2">
              {artist.bio}
            </p>
          ) : (
            <p className="mt-1 text-sm text-secondary-light dark:text-secondary-dark">
              Artist profile
            </p>
          )}
          {typeof artist.videoCount === 'number' ? (
            <p className="mt-2 text-xs text-secondary-light dark:text-secondary-dark">
              {artist.videoCount} videos
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
