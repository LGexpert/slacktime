import { Form, Link, redirect, useActionData, useNavigation, useSearchParams } from 'react-router-dom'
import type { ActionFunctionArgs } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Head } from '../components'
import { apiPost } from '../lib/api'

type ActionData = {
  error?: string
  success?: string
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = String(formData.get('token') || '').trim()

  if (token) {
    const password = String(formData.get('password') || '')

    if (!password || password.length < 8) {
      return { error: 'Password must be at least 8 characters.' } satisfies ActionData
    }

    try {
      await apiPost('/api/auth/password-reset/confirm', { token, password })
      return redirect('/profile')
    } catch (err) {
      return { error: (err as Error).message } satisfies ActionData
    }
  }

  const email = String(formData.get('email') || '').trim()
  if (!email) {
    return { error: 'Email is required.' } satisfies ActionData
  }

  try {
    await apiPost('/api/auth/password-reset/request', { email })
    return { success: 'If an account exists, a reset link was generated (check the server console logs).' } satisfies ActionData
  } catch (err) {
    return { error: (err as Error).message } satisfies ActionData
  }
}

export default function AuthReset() {
  const data = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()

  const busy = navigation.state === 'submitting'
  const token = searchParams.get('token')

  return (
    <>
      <Head title="Reset Password - Music Stream" description="Reset your Music Stream password" />
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Reset Password</h1>
            <p className="text-center text-secondary-light dark:text-secondary-dark mt-2">
              {token ? 'Choose a new password' : 'Request a password reset link'}
            </p>
          </CardHeader>

          <CardBody className="space-y-4">
            {data?.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {data.error}
              </div>
            ) : null}

            {data?.success ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {data.success}
              </div>
            ) : null}

            {token ? (
              <Form method="post" className="space-y-4">
                <input type="hidden" name="token" value={token} />
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="password">New password</label>
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
                  {busy ? 'Saving…' : 'Set new password'}
                </Button>
              </Form>
            ) : (
              <Form method="post" className="space-y-4">
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
                <Button variant="primary" size="lg" className="w-full" disabled={busy}>
                  {busy ? 'Sending…' : 'Send reset link'}
                </Button>
              </Form>
            )}

            <div className="text-center">
              <Link to="/auth/sign-in" className="text-sm text-blue-600 hover:text-blue-700">
                Back to sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
