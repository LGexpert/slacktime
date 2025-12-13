import { redirect, useLoaderData, Link } from 'react-router-dom'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Card, CardBody, CardHeader, Head, Button } from '../components'
import { apiGet } from '../lib/api'
import type { ApiMeResponse, ApiUser } from '../lib/api-types'

type LoaderData = {
  user: ApiUser
  playlistCount: number
  favoritesCount: number
  watchlistCount: number
}

export async function loader(_args: LoaderFunctionArgs): Promise<LoaderData> {
  const me = await apiGet<ApiMeResponse>('/api/me')
  if (!me.user) {
    throw redirect('/auth/sign-in')
  }

  const [favoritesRes, watchlistRes, playlistsRes] = await Promise.all([
    apiGet<{ ids: string[] }>('/api/favorites/ids'),
    apiGet<{ ids: string[] }>('/api/watchlist/ids'),
    apiGet<unknown[]>('/api/playlists'),
  ])

  return {
    user: me.user,
    favoritesCount: favoritesRes.ids.length,
    watchlistCount: watchlistRes.ids.length,
    playlistCount: playlistsRes.length,
  }
}

export default function Profile() {
  const { user, favoritesCount, watchlistCount, playlistCount } = useLoaderData() as LoaderData

  return (
    <>
      <Head title="Profile - Music Stream" description="View and manage your profile" />
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Your Profile</h1>
          <p className="text-xl text-secondary-light dark:text-secondary-dark">Manage your account and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              {user.profile?.avatarUrl ? (
                <img
                  src={user.profile.avatarUrl}
                  alt=""
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
                />
              ) : (
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mb-4" />
              )}
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="text-center">
                <h3 className="text-xl font-semibold">{user.profile?.displayName || 'Member'}</h3>
                <p className="text-sm text-secondary-light dark:text-secondary-dark mt-1">{user.email}</p>
              </div>

              {user.profile?.bio ? (
                <p className="text-sm text-secondary-light dark:text-secondary-dark whitespace-pre-wrap">{user.profile.bio}</p>
              ) : null}

              <div className="flex justify-center gap-2">
                <Link to="/settings">
                  <Button variant="outline" size="sm">Edit profile</Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="outline" size="sm">Favorites</Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{playlistCount}</div>
                    <p className="text-sm text-secondary-light dark:text-secondary-dark">Playlists</p>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{favoritesCount}</div>
                    <p className="text-sm text-secondary-light dark:text-secondary-dark">Favorites</p>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{watchlistCount}</div>
                    <p className="text-sm text-secondary-light dark:text-secondary-dark">Watchlist</p>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick links</h3>
              </CardHeader>
              <CardBody className="flex flex-wrap gap-3">
                <Link to="/playlists">
                  <Button variant="secondary">Manage playlists</Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="secondary">Favorites dashboard</Button>
                </Link>
                <Link to="/settings">
                  <Button variant="primary">Account settings</Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
