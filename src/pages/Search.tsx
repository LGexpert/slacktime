import {
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom'
import { Head } from '../components'
import { FacetPills, FilterBar, Pagination, SearchBar } from '../components/catalog'
import type {
  ApiGenre,
  ApiMood,
  SearchArtistHit,
  SearchLyricHit,
  SearchResponse,
  SearchVideoHit,
} from '../lib/api-types'
import { apiGet } from '../lib/api'
import { formatDuration } from '../lib/format'
import { useCanonicalUrl } from '../lib/url'

type SearchLoaderData = {
  results: SearchResponse
  facets: {
    genres: ApiGenre[]
    moods: ApiMood[]
    decades: number[]
  }
}

export async function loader({ request }: LoaderFunctionArgs): Promise<SearchLoaderData> {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const [results, facets] = await Promise.all([
    apiGet<SearchResponse>(`/api/search${url.search}`, { baseUrl }),
    apiGet<SearchLoaderData['facets']>('/api/facets', { baseUrl }),
  ])

  return { results, facets }
}

function Highlight({ html }: { html?: string }) {
  if (!html) return null
  return (
    <span
      className="[&>mark]:bg-yellow-200 [&>mark]:text-black dark:[&>mark]:bg-yellow-400 dark:[&>mark]:text-black"
      // html is sanitized on the server (only <mark> tags remain)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function SearchVideoRow({ hit }: { hit: SearchVideoHit }) {
  const v = hit.video
  const primaryArtist = v.artists[0]

  return (
    <article className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-[12rem_1fr]">
        <Link
          to={`/videos?play=${encodeURIComponent(v.slug)}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={`Open ${v.title}`}
        >
          <div className="relative aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            {v.thumbnailUrl ? (
              <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : null}
            <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
              {formatDuration(v.durationSeconds)}
            </div>
          </div>
        </Link>

        <div className="p-4 space-y-2">
          <h3 className="font-semibold leading-tight">
            <Link
              to={`/videos?play=${encodeURIComponent(v.slug)}`}
              className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Highlight html={hit.highlightTitle} />
            </Link>
          </h3>

          <p className="text-sm text-secondary-light dark:text-secondary-dark">
            {primaryArtist ? (
              <Link to={`/artists/${primaryArtist.slug}`} className="hover:underline">{primaryArtist.name}</Link>
            ) : (
              'Unknown artist'
            )}
            {v.genres[0] ? (
              <>
                {' • '}
                <Link to={`/genres/${v.genres[0].slug}`} className="hover:underline">{v.genres[0].name}</Link>
              </>
            ) : null}
          </p>

          {hit.highlightDescription ? (
            <p className="text-sm text-secondary-light dark:text-secondary-dark">
              <Highlight html={hit.highlightDescription} />
            </p>
          ) : null}

          <p className="text-xs text-secondary-light dark:text-secondary-dark">
            Match score: {hit.rank.toFixed(3)}
          </p>
        </div>
      </div>
    </article>
  )
}

function ArtistHitRow({ hit }: { hit: SearchArtistHit }) {
  return (
    <li className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
      <Link
        to={`/artists/${hit.artist.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      >
        <div className="flex items-start gap-4">
          {hit.artist.avatarUrl ? (
            <img src={hit.artist.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" loading="lazy" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500/30 to-red-500/30" />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold truncate">
              <Highlight html={hit.highlightName} />
            </h3>
            {hit.highlightBio ? (
              <p className="mt-1 text-sm text-secondary-light dark:text-secondary-dark">
                <Highlight html={hit.highlightBio} />
              </p>
            ) : null}
            <p className="mt-2 text-xs text-secondary-light dark:text-secondary-dark">Match score: {hit.rank.toFixed(3)}</p>
          </div>
        </div>
      </Link>
    </li>
  )
}

function LyricHitRow({ hit }: { hit: SearchLyricHit }) {
  return (
    <li className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
      <div className="flex items-start gap-4">
        {hit.video.thumbnailUrl ? (
          <img src={hit.video.thumbnailUrl} alt="" className="h-16 w-28 rounded object-cover" loading="lazy" />
        ) : (
          <div className="h-16 w-28 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium">
            <Link to={`/videos?play=${encodeURIComponent(hit.video.slug)}`} className="hover:underline">
              {hit.video.title}
            </Link>
          </p>
          <p className="mt-1 text-sm text-secondary-light dark:text-secondary-dark">
            <Highlight html={hit.highlightText} />
          </p>
          <p className="mt-2 text-xs text-secondary-light dark:text-secondary-dark">Match score: {hit.rank.toFixed(3)}</p>
        </div>
      </div>
    </li>
  )
}

export default function Search() {
  const { results, facets } = useLoaderData() as SearchLoaderData
  const canonical = useCanonicalUrl()
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''

  const hasResults =
    results.videos.items.length > 0 || results.artists.length > 0 || results.lyrics.length > 0

  return (
    <>
      <Head
        title={q ? `Search “${q}” - Music Stream` : 'Search - Music Stream'}
        description={q ? `Search results for ${q}.` : 'Search videos, lyrics, and artists.'}
        canonical={canonical}
      />

      <div className="space-y-8">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="heading-h1">Search</h1>
            <p className="text-xl text-secondary-light dark:text-secondary-dark">
              Try queries like <span className="font-medium">neon</span>, <span className="font-medium">drive</span>, or <span className="font-medium">Examplettes</span>.
            </p>
          </div>

          <SearchBar className="max-w-2xl" autoFocus />
        </header>

        <FilterBar
          genres={facets.genres}
          moods={facets.moods}
          decades={facets.decades}
          showSearchQuery
        />
        <FacetPills genres={facets.genres} moods={facets.moods} />

        {!q ? (
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold">Start typing to search</h2>
            <p className="mt-2 text-secondary-light dark:text-secondary-dark">
              Search runs on Postgres full-text indexes (videos, artists, and lyric lines).
            </p>
          </div>
        ) : !hasResults ? (
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold">No matches for “{q}”</h2>
            <p className="mt-2 text-secondary-light dark:text-secondary-dark">
              Try a different keyword or remove filters.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <section className="space-y-4" aria-label="Video matches">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <h2 className="heading-h2">Videos</h2>
                <p className="text-sm text-secondary-light dark:text-secondary-dark">
                  {results.videos.total} match{results.videos.total === 1 ? '' : 'es'} • page {results.videos.page} of {results.videos.totalPages}
                </p>
              </div>

              {results.videos.items.length === 0 ? (
                <p className="text-secondary-light dark:text-secondary-dark">No video title/description matches.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {results.videos.items.map((hit) => (
                    <SearchVideoRow key={hit.video.id} hit={hit} />
                  ))}
                </div>
              )}

              <Pagination page={results.videos.page} totalPages={results.videos.totalPages} />
            </section>

            <section className="space-y-4" aria-label="Artist matches">
              <h2 className="heading-h2">Artists</h2>
              {results.artists.length === 0 ? (
                <p className="text-secondary-light dark:text-secondary-dark">No artist matches.</p>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.artists.map((hit) => (
                    <ArtistHitRow key={hit.artist.id} hit={hit} />
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-4" aria-label="Lyric matches">
              <h2 className="heading-h2">Lyrics</h2>
              {results.lyrics.length === 0 ? (
                <p className="text-secondary-light dark:text-secondary-dark">No lyric matches.</p>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.lyrics.map((hit) => (
                    <LyricHitRow key={hit.lineId} hit={hit} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  )
}
