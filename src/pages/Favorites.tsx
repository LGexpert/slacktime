import { Link, redirect, useLoaderData } from 'react-router-dom'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Card, CardBody, Head } from '../components'
import { VideoCard } from '../components/catalog'
import { apiGet } from '../lib/api'
import type { ApiCollectionVideo, ApiMeResponse } from '../lib/api-types'

type LoaderData = {
  tab: 'favorites' | 'watchlist'
  sort: string
  q: string
  items: ApiCollectionVideo[]
}

export async function loader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  // Extract baseUrl from request for SSR
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const me = await apiGet<ApiMeResponse>('/api/me', { baseUrl })
  if (!me.user) {
    throw redirect('/auth/sign-in')
  }

  const tab = (url.searchParams.get('tab') || 'favorites') as LoaderData['tab']
  const sort = url.searchParams.get('sort') || 'added'
  const q = url.searchParams.get('q') || ''

  const endpoint = tab === 'watchlist' ? '/api/watchlist' : '/api/favorites'

  const items = await apiGet<ApiCollectionVideo[]>(
    `${endpoint}?sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`,
    { baseUrl },
  )

  return { tab, sort, q, items }
}

export default function Favorites() {
  const { tab, sort, q, items } = useLoaderData() as LoaderData

  return (
    <>
      <Head title="Favorites - Music Stream" description="Your favorites and watchlist" />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="heading-h1">Your Collections</h1>
            <p className="text-secondary-light dark:text-secondary-dark">Sort and filter your favorites and watchlist.</p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/favorites?tab=favorites&sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium border ${
                tab === 'favorites'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-border-light dark:border-border-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'
              }`}
            >
              Favorites
            </Link>
            <Link
              to={`/favorites?tab=watchlist&sort=${encodeURIComponent(sort)}&q=${encodeURIComponent(q)}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium border ${
                tab === 'watchlist'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-border-light dark:border-border-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'
              }`}
            >
              Watchlist
            </Link>
          </div>
        </div>

        <Card>
          <CardBody>
            <form method="get" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="hidden" name="tab" value={tab} />
              <input
                name="q"
                defaultValue={q}
                placeholder="Filter by title"
                className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
              />
              <select
                name="sort"
                defaultValue={sort}
                className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
              >
                <option value="added">Recently added</option>
                <option value="title">Title</option>
                <option value="popular">Most viewed</option>
                <option value="likes">Most liked</option>
              </select>
              <button
                type="submit"
                className="rounded-md bg-blue-600 text-white font-medium px-4 py-2 hover:bg-blue-700"
              >
                Apply
              </button>
            </form>
          </CardBody>
        </Card>

        {items.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-secondary-light dark:text-secondary-dark">
                {tab === 'favorites' ? 'No favorites yet.' : 'Your watchlist is empty.'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((video) => (
              <div key={video.id} className="space-y-2">
                <VideoCard video={video} />
                {video.addedAt ? (
                  <p className="text-xs text-secondary-light dark:text-secondary-dark">
                    Added {new Date(video.addedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
