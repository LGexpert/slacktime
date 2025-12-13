import { type LoaderFunctionArgs, useLoaderData } from 'react-router-dom'
import { Head } from '../components'
import { ArtistCard } from '../components/catalog'
import type { ApiArtist } from '../lib/api-types'
import { apiGet } from '../lib/api'
import { useCanonicalUrl } from '../lib/url'

type ArtistsLoaderData = {
  artists: ApiArtist[]
}

export async function loader(_args: LoaderFunctionArgs): Promise<ArtistsLoaderData> {
  const artists = await apiGet<ApiArtist[]>('/api/artists')
  return { artists }
}

export default function Artists() {
  const { artists } = useLoaderData() as ArtistsLoaderData
  const canonical = useCanonicalUrl()

  return (
    <>
      <Head
        title="Artists - Music Stream"
        description="Browse artists and discover their videos."
        canonical={canonical}
      />

      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="heading-h1">Artists</h1>
          <p className="text-xl text-secondary-light dark:text-secondary-dark">
            Discover artists in the catalog and browse their featured videos.
          </p>
        </header>

        {artists.length === 0 ? (
          <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold">No artists yet</h2>
            <p className="mt-2 text-secondary-light dark:text-secondary-dark">
              Seed sample data using <code className="px-1">pnpm db:seed</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
