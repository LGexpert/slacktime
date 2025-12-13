import { useState } from 'react'
import { Card, CardBody, CardHeader, Button, Head } from '../components'

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <>
      <Head
        title={`${isSignUp ? 'Sign Up' : 'Sign In'} - Music Stream`}
        description="Join Music Stream or sign in to your account"
      />
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-center text-secondary-light dark:text-secondary-dark mt-2">
              {isSignUp ? 'Join Music Stream today' : 'Welcome back'}
            </p>
          </CardHeader>

          <CardBody className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-border-light dark:border-border-dark"
                  />
                  <span className="ml-2 text-sm">Remember me</span>
                </label>
                <a href="#forgot" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-border-dark" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-light dark:bg-surface-dark text-secondary-light dark:text-secondary-dark">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">
                <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.852v3.608h5.337c-0.676,1.782-2.596,2.955-5.337,2.955c-3.287,0-5.95-2.686-5.95-6c0-3.313,2.663-6,5.95-6c1.867,0,3.505,0.891,4.557,2.258l2.869-2.869C17.905,2.773,15.694,0,12.545,0C6.871,0,2.5,4.371,2.5,10c0,5.629,4.371,10,10.045,10c5.165,0,9.6-3.834,9.6-9.354c0-0.643-0.062-1.265-0.568-1.794H12.545Z" />
                </svg>
              </Button>
              <Button variant="outline">
                <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
