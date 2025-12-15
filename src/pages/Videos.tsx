import {
  type LoaderFunctionArgs,
  Link,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom'
import { Head } from '../components'
import { FacetPills, FilterBar, Pagination, SearchBar, VideoCard } from '../components/catalog'
import type { ApiGenre, ApiMood, VideosResponse } from '../lib/api-types'
import { apiGet } from '../lib/api'
import { useCanonicalUrl } from '../lib/url'

type VideosLoaderData = {
  videos: VideosResponse
  facets: {
    genres: ApiGenre[]
    moods: ApiMood[]
    decades: number[]
  }
}

export async function loader({ request }: LoaderFunctionArgs): Promise<VideosLoaderData> {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  
  const [videos, facets] = await Promise.all([
    apiGet<VideosResponse>(`/api/videos${url.search}`, { baseUrl }),
    apiGet<VideosLoaderData['facets']>('/api/facets', { baseUrl }),
  ])

  return { videos, facets }
}

export default function Videos() {
  const data = useLoaderData() as VideosLoaderData
  const canonical = useCanonicalUrl()
  const [searchParams] = useSearchParams()

  const activeMood = searchParams.get('mood')
  const activeGenre = searchParams.get('genre')

  return (
    <>
      <Head
        title="Videos - Music Stream"
        description="Browse music videos with filters for genre, mood, decade, duration, and popularity."
        canonical={canonical}
      />

      <div className="space-y-8">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="heading-h1">Videos</h1>
            <p className="text-xl text-secondary-light dark:text-secondary-dark">
              Filter by genre, mood, decade, duration, and popularity.
            </p>
          </div>

          <SearchBar className="max-w-2xl" />

          {(activeGenre || activeMood) ? (
            <p className="text-sm text-secondary-light dark:text-secondary-dark">
              Looking for something else? Try the{' '}
              <Link to="/search" className="text-blue-600 hover:underline">search page</Link>.
            </p>
          ) : null}
        </header>

        <FilterBar genres={data.facets.genres} moods={data.facets.moods} decades={data.facets.decades} />
        <FacetPills genres={data.facets.genres} moods={data.facets.moods} />

        <section className="space-y-4" aria-label="Video results">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <p className="text-sm text-secondary-light dark:text-secondary-dark">
              {data.videos.total} result{data.videos.total === 1 ? '' : 's'}
            </p>
            <p className="text-sm text-secondary-light dark:text-secondary-dark">
              Page {data.videos.page} of {data.videos.totalPages}
            </p>
          </div>

          {data.videos.items.length === 0 ? (
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
              <h2 className="text-lg font-semibold">No videos match these filters</h2>
              <p className="mt-2 text-secondary-light dark:text-secondary-dark">
                Clear filters or seed sample content using <code className="px-1">pnpm db:seed</code>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.videos.items.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}

          <Pagination page={data.videos.page} totalPages={data.videos.totalPages} />
        </section>
      </div>
    </>
  )
}
