import { Card, CardBody, CardHeader, Head } from '../components'

export default function Home() {
  return (
    <>
      <Head
        title="Home - Music Stream"
        description="Discover and stream your favorite music"
      />
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="space-y-4">
            <h1 className="heading-h1">Welcome to Music Stream</h1>
            <p className="text-xl text-lightSecondary dark:text-darkSecondary max-w-2xl">
              Discover endless music, create playlists, and share with friends.
            </p>
          </div>
        </section>

        {/* Featured Content */}
        <section className="space-y-6">
          <h2 className="heading-h2">Featured Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4" />
                  <h3 className="text-lg font-semibold">Featured Track {i}</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-lightSecondary dark:text-darkSecondary">
                    Artist Name • {i} min
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
