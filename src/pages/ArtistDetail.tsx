import {
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom'
import { Head } from '../components'
import { Pagination, VideoCard } from '../components/catalog'
import type { ApiArtist, VideosResponse } from '../lib/api-types'
import { apiGet } from '../lib/api'
import { useCanonicalUrl } from '../lib/url'

type ArtistDetailLoaderData = {
  artist: ApiArtist
  videos: VideosResponse
}

export async function loader({ request, params }: LoaderFunctionArgs): Promise<ArtistDetailLoaderData> {
  const slug = params.slug
  if (!slug) {
    throw new Response('Missing artist slug', { status: 400 })
  }

  const url = new URL(request.url)
  url.searchParams.set('artist', slug)

  const [artist, videos] = await Promise.all([
    apiGet<ApiArtist>(`/api/artists/${encodeURIComponent(slug)}`),
    apiGet<VideosResponse>(`/api/videos?${url.searchParams.toString()}`),
  ])

  return { artist, videos }
}

export default function ArtistDetail() {
  const data = useLoaderData() as ArtistDetailLoaderData
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
        title={`${data.artist.name} - Artists - Music Stream`}
        description={data.artist.bio || `Browse videos from ${data.artist.name}.`}
        canonical={canonical}
        ogImage={data.artist.avatarUrl || undefined}
      />

      <div className="space-y-8">
        <header className="space-y-4">
          <p className="text-sm text-secondary-light dark:text-secondary-dark">
            <Link to="/artists" className="text-blue-600 hover:underline">Artists</Link> / {data.artist.name}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {data.artist.avatarUrl ? (
              <img
                src={data.artist.avatarUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500/30 to-red-500/30" />
            )}

            <div className="flex-1 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <h1 className="heading-h1">{data.artist.name}</h1>

                <div className="min-w-[14rem]">
                  <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="artist-sort">Sort</label>
                  <select
                    id="artist-sort"
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

              {data.artist.bio ? (
                <p className="text-secondary-light dark:text-secondary-dark max-w-3xl">
                  {data.artist.bio}
                </p>
              ) : null}

              <p className="text-sm text-secondary-light dark:text-secondary-dark">
                {data.artist.videoCount ?? data.videos.total} videos
              </p>
            </div>
          </div>
        </header>

        {data.videos.items.length === 0 ? (
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold">No videos found</h2>
            <p className="mt-2 text-secondary-light dark:text-secondary-dark">
              Try another artist or seed the database.
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
