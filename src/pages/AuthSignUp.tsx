import { Form, Link, redirect, useActionData, useNavigation } from 'react-router-dom'
import type { ActionFunctionArgs } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Head } from '../components'
import { apiPost } from '../lib/api'

type ActionData = {
  error?: string
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const displayName = String(formData.get('displayName') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Email and password are required.' } satisfies ActionData
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' } satisfies ActionData
  }

  try {
    await apiPost('/api/auth/sign-up', { email, password, displayName: displayName || undefined })
    return redirect('/profile')
  } catch (err) {
    return { error: (err as Error).message } satisfies ActionData
  }
}

export default function AuthSignUp() {
  const data = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const busy = navigation.state === 'submitting'

  return (
    <>
      <Head title="Sign Up - Music Stream" description="Create your Music Stream account" />
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Create Account</h1>
            <p className="text-center text-secondary-light dark:text-secondary-dark mt-2">Join Music Stream today</p>
          </CardHeader>

          <CardBody className="space-y-4">
            {data?.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {data.error}
              </div>
            ) : null}

            <Form method="post" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="displayName">Display name</label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button variant="primary" size="lg" className="w-full" disabled={busy}>
                {busy ? 'Creating…' : 'Create Account'}
              </Button>

              <div className="text-center">
                <Link to="/auth/sign-in" className="text-sm text-blue-600 hover:text-blue-700">
                  Already have an account? Sign In
                </Link>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
