import { Card, CardBody, CardHeader, Head } from '../components'

export default function Profile() {
  return (
    <>
      <Head
        title="Profile - Music Stream"
        description="View and manage your profile"
      />
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Your Profile</h1>
          <p className="text-xl text-secondary-light dark:text-secondary-dark">
            Manage your account and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mb-4" />
            </CardHeader>
            <CardBody>
              <h3 className="text-xl font-semibold text-center">User Profile</h3>
              <p className="text-sm text-secondary-light dark:text-secondary-dark text-center mt-2">
                member@email.com
              </p>
              <p className="text-sm text-secondary-light dark:text-secondary-dark text-center mt-1">
                Member since 2024
              </p>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">42</div>
                    <p className="text-sm text-secondary-light dark:text-secondary-dark">Playlists</p>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">256</div>
                    <p className="text-sm text-secondary-light dark:text-secondary-dark">Favorite Songs</p>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">18</div>
                    <p className="text-sm text-secondary-light dark:text-secondary-dark">Following</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Settings Section */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Account Settings</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value="member@email.com"
                    readOnly
                    className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    placeholder="Tell us about yourself"
                    className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
                    rows={3}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
