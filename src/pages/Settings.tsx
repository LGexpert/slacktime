import { Form, redirect, useActionData, useLoaderData, useNavigation } from 'react-router-dom'
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Head } from '../components'
import { apiGet, apiPost } from '../lib/api'
import type { ApiMeResponse, ApiUser, ThemePreference } from '../lib/api-types'

type LoaderData = {
  user: ApiUser
}

type ActionData = {
  error?: string
}

export async function loader(_args: LoaderFunctionArgs): Promise<LoaderData> {
  const me = await apiGet<ApiMeResponse>('/api/me')
  if (!me.user) {
    throw redirect('/auth/sign-in')
  }
  return { user: me.user }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const displayName = String(formData.get('displayName') || '').trim()
  const avatarUrl = String(formData.get('avatarUrl') || '').trim()
  const bio = String(formData.get('bio') || '').trim()
  const themePreference = String(formData.get('themePreference') || 'system') as ThemePreference

  try {
    await apiPost('/api/profile', {
      displayName: displayName || null,
      avatarUrl: avatarUrl || null,
      bio: bio || null,
      themePreference,
    })

    return redirect('/profile')
  } catch (err) {
    return { error: (err as Error).message } satisfies ActionData
  }
}

export default function Settings() {
  const { user } = useLoaderData() as LoaderData
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()

  const busy = navigation.state === 'submitting'

  return (
    <>
      <Head title="Settings - Music Stream" description="Update your profile and preferences" />

      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Settings</h1>
          <p className="text-xl text-secondary-light dark:text-secondary-dark">Update your profile and theme preference.</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Profile</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {actionData?.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {actionData.error}
              </div>
            ) : null}

            <Form method="post" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                <input
                  id="email"
                  value={user.email}
                  readOnly
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light/50 dark:bg-bg-dark/50 text-text-light dark:text-text-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="displayName">Display name</label>
                <input
                  id="displayName"
                  name="displayName"
                  defaultValue={user.profile?.displayName || ''}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="avatarUrl">Avatar URL</label>
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  defaultValue={user.profile?.avatarUrl || ''}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={user.profile?.bio || ''}
                  rows={4}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="themePreference">Theme preference</label>
                <select
                  id="themePreference"
                  name="themePreference"
                  defaultValue={user.profile?.themePreference || 'system'}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <Button variant="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save changes'}
              </Button>
            </Form>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
