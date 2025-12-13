import { Card, CardBody, CardHeader, Head } from '../components'

export default function Playlists() {
  return (
    <>
      <Head
        title="Playlists - Music Stream"
        description="Browse and create playlists"
      />
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Playlists</h1>
          <p className="text-xl text-lightSecondary dark:text-darkSecondary">
            Browse playlists or create your own.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-full h-40 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg mb-4" />
                <h3 className="text-lg font-semibold">Playlist {i}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-lightSecondary dark:text-darkSecondary">
                  {10 * i} songs • {2 * i} hours
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
