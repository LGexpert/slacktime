import { Card, CardBody, CardHeader, Head } from '../components'

export default function Artists() {
  return (
    <>
      <Head
        title="Artists - Music Stream"
        description="Browse and follow your favorite artists"
      />
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Artists</h1>
          <p className="text-xl text-lightSecondary dark:text-darkSecondary">
            Discover and follow your favorite artists.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-full aspect-square bg-gradient-to-br from-pink-400 to-red-500 rounded-full mb-4" />
              </CardHeader>
              <CardBody>
                <h3 className="font-semibold text-center">Artist {i}</h3>
                <p className="text-sm text-lightSecondary dark:text-darkSecondary text-center mt-2">
                  {100000 * i} followers
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
