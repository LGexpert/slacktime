import { Link, type LoaderFunctionArgs, useLoaderData } from 'react-router-dom'
import { Head } from '../components'
import { SearchBar, VideoCard } from '../components/catalog'
import type { ApiGenre, ApiMood, ApiVideo, FeaturedResponse } from '../lib/api-types'
import { apiGet } from '../lib/api'
import { useCanonicalUrl } from '../lib/url'

type HomeLoaderData = {
  featured: ApiVideo[]
  genres: ApiGenre[]
  moods: ApiMood[]
}

export async function loader({ request }: LoaderFunctionArgs): Promise<HomeLoaderData> {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const [featured, genres, moods] = await Promise.all([
    apiGet<FeaturedResponse>('/api/featured', { baseUrl }),
    apiGet<ApiGenre[]>('/api/genres', { baseUrl }),
    apiGet<ApiMood[]>('/api/moods', { baseUrl }),
  ])

  return {
    featured: featured.items,
    genres,
    moods,
  }
}

export default function Home() {
  const data = useLoaderData() as HomeLoaderData
  const canonical = useCanonicalUrl()
  const ogImage = data.featured[0]?.thumbnailUrl || undefined

  return (
    <>
      <Head
        title="Home - Music Stream"
        description="Discover featured music videos, explore genres, and search lyrics."
        canonical={canonical}
        ogImage={ogImage}
      />

      <div className="space-y-12">
        <section className="space-y-6">
          <div className="space-y-3">
            <h1 className="heading-h1">Discover music videos</h1>
            <p className="text-xl text-secondary-light dark:text-secondary-dark max-w-2xl">
              Browse featured videos, drill into genres and artists, and search across titles, bios, and lyrics.
            </p>
          </div>

          <SearchBar className="max-w-2xl" />

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              to="/auth"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Sign in to create playlists
            </Link>
            <span className="text-secondary-light dark:text-secondary-dark">
              (Authentication actions are placeholders in this build.)
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="heading-h2">Featured now</h2>
            <Link to="/videos" className="text-sm text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
              View all
            </Link>
          </div>

          {data.featured.length === 0 ? (
            <p className="text-secondary-light dark:text-secondary-dark">
              No featured videos yet. Seed the database with <code className="px-1">pnpm db:seed</code>.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.featured.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="heading-h3">Explore by genre</h2>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((genre) => (
                <Link
                  key={genre.slug}
                  to={`/genres/${genre.slug}`}
                  className="rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-3 py-1 text-sm hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="heading-h3">Browse by mood</h2>
            <div className="flex flex-wrap gap-2">
              {data.moods.map((mood) => (
                <Link
                  key={mood.slug}
                  to={`/videos?mood=${encodeURIComponent(mood.slug)}`}
                  className="rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-3 py-1 text-sm hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {mood.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
