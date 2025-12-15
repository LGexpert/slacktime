import {
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom'
import { Head } from '../components'
import { Pagination, VideoCard } from '../components/catalog'
import type { ApiGenre, VideosResponse } from '../lib/api-types'
import { apiGet } from '../lib/api'
import { useCanonicalUrl } from '../lib/url'

type GenreDetailLoaderData = {
  genre: ApiGenre
  videos: VideosResponse
}

export async function loader({ request, params }: LoaderFunctionArgs): Promise<GenreDetailLoaderData> {
  const slug = params.slug
  if (!slug) {
    throw new Response('Missing genre slug', { status: 400 })
  }

  // Extract baseUrl from request for SSR
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  url.searchParams.set('genre', slug)

  const [genre, videos] = await Promise.all([
    apiGet<ApiGenre>(`/api/genres/${encodeURIComponent(slug)}`, { baseUrl }),
    apiGet<VideosResponse>(`/api/videos?${url.searchParams.toString()}`, { baseUrl }),
  ])

  return { genre, videos }
}

export default function GenreDetail() {
  const data = useLoaderData() as GenreDetailLoaderData
  const canonical = useCanonicalUrl()
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = searchParams.get('sort') || 'popular'

  const updateSort = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'popular') {
      next.delete('sort')
    } else {
      next.set('sort', value)
    }
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  return (
    <>
      <Head
        title={`${data.genre.name} - Genres - Music Stream`}
        description={`Browse ${data.genre.name} music videos.`}
        canonical={canonical}
      />

      <div className="space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-secondary-light dark:text-secondary-dark">
                <Link to="/genres" className="text-blue-600 hover:underline">Genres</Link> / {data.genre.name}
              </p>
              <h1 className="heading-h1">{data.genre.name}</h1>
            </div>
            <div className="min-w-[14rem]">
              <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="genre-sort">Sort</label>
              <select
                id="genre-sort"
                value={sort}
                onChange={(e) => updateSort(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="title">Title</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          <p className="text-secondary-light dark:text-secondary-dark">
            {data.genre.videoCount ?? data.videos.total} videos
          </p>
        </header>

        {data.videos.items.length === 0 ? (
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold">No videos yet</h2>
            <p className="mt-2 text-secondary-light dark:text-secondary-dark">
              Seed the database or pick another genre.
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
      </div>
    </>
  )
}
