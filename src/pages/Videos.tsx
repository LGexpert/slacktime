import { Card, CardBody, CardHeader, Head } from '../components'

export default function Videos() {
  return (
    <>
      <Head
        title="Videos - Music Stream"
        description="Watch music videos"
      />
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Music Videos</h1>
          <p className="text-xl text-lightSecondary dark:text-darkSecondary">
            Explore the latest music videos from your favorite artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="w-full h-40 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">▶</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold">Video {i}</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-lightSecondary dark:text-darkSecondary">
                  Artist Name • Views: {10000 * i}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
