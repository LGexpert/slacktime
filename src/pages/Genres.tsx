import { Link, type LoaderFunctionArgs, useLoaderData } from 'react-router-dom'
import { Head } from '../components'
import type { ApiGenre } from '../lib/api-types'
import { apiGet } from '../lib/api'
import { useCanonicalUrl } from '../lib/url'

type GenresLoaderData = {
  genres: ApiGenre[]
}

export async function loader({ request }: LoaderFunctionArgs): Promise<GenresLoaderData> {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const genres = await apiGet<ApiGenre[]>('/api/genres', { baseUrl })
  return { genres }
}

export default function Genres() {
  const { genres } = useLoaderData() as GenresLoaderData
  const canonical = useCanonicalUrl()

  return (
    <>
      <Head
        title="Genres - Music Stream"
        description="Explore music videos by genre."
        canonical={canonical}
      />

      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="heading-h1">Genres</h1>
          <p className="text-xl text-secondary-light dark:text-secondary-dark">
            Pick a genre to browse featured videos.
          </p>
        </header>

        {genres.length === 0 ? (
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold">No genres yet</h2>
            <p className="mt-2 text-secondary-light dark:text-secondary-dark">
              Seed the database using <code className="px-1">pnpm db:seed</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {genres.map((genre) => (
              <Link
                key={genre.slug}
                to={`/genres/${genre.slug}`}
                className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                    {genre.name}
                  </h2>
                  <span className="text-sm text-secondary-light dark:text-secondary-dark">
                    {genre.videoCount ?? 0} videos
                  </span>
                </div>
                <p className="mt-3 text-sm text-secondary-light dark:text-secondary-dark">
                  Browse {genre.name} tracks and discover related artists.
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
