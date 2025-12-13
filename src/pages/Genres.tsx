import { Card, CardBody, CardHeader, Head } from '../components'

export default function Genres() {
  return (
    <>
      <Head
        title="Genres - Music Stream"
        description="Explore music by genre"
      />
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Genres</h1>
          <p className="text-xl text-lightSecondary dark:text-darkSecondary">
            Explore music by your favorite genres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Folk'].map((genre, i) => (
            <Card key={i}>
              <CardHeader>
                <div className={`w-full h-40 rounded-lg mb-4 flex items-center justify-center ${
                  i % 3 === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                  i % 3 === 1 ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
                  'bg-gradient-to-br from-purple-400 to-pink-500'
                }`} />
              </CardHeader>
              <CardBody>
                <h3 className="text-xl font-semibold text-center">{genre}</h3>
                <p className="text-sm text-lightSecondary dark:text-darkSecondary text-center mt-2">
                  {50 + i * 10} playlists
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
