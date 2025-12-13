import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { IconButton } from './IconButton'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      <header className="sticky top-0 z-50 bg-bg-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center" aria-hidden>
                <span className="text-white font-bold">♪</span>
              </div>
              <span className="text-xl font-bold hidden sm:inline">Music Stream</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/videos" className="hover:text-blue-600 transition-colors">Videos</Link>
              <Link to="/artists" className="hover:text-blue-600 transition-colors">Artists</Link>
              <Link to="/genres" className="hover:text-blue-600 transition-colors">Genres</Link>
              <Link to="/search" className="hover:text-blue-600 transition-colors">Search</Link>
              <Link to="/playlists" className="hover:text-blue-600 transition-colors">Playlists</Link>
            </nav>

            <div className="flex items-center space-x-3 shrink-0">
              <IconButton
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </IconButton>

              <Link
                to="/profile"
                className="hidden sm:inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Profile
              </Link>

              <Link
                to="/auth"
                className="sm:hidden inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Sign In
              </Link>
            </div>
          </div>

          <nav className="md:hidden border-t border-border-light dark:border-border-dark py-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Link to="/videos" className="hover:text-blue-600 transition-colors py-2">Videos</Link>
              <Link to="/artists" className="hover:text-blue-600 transition-colors py-2">Artists</Link>
              <Link to="/genres" className="hover:text-blue-600 transition-colors py-2">Genres</Link>
              <Link to="/search" className="hover:text-blue-600 transition-colors py-2">Search</Link>
              <Link to="/playlists" className="hover:text-blue-600 transition-colors py-2">Playlists</Link>
              <Link to="/profile" className="hover:text-blue-600 transition-colors py-2">Profile</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children ?? <Outlet />}
      </main>

      <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Music Stream</h3>
              <p className="text-sm text-secondary-light dark:text-secondary-dark">
                Discover and stream your favorite music.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Home</Link></li>
                <li><Link to="/videos" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Videos</Link></li>
                <li><Link to="/artists" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Artists</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/genres" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Genres</Link></li>
                <li><Link to="/search" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Search</Link></li>
                <li><Link to="/playlists" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Playlists</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Sign In</Link></li>
                <li><a href="#signup" className="text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Sign Up</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border-light dark:border-border-dark pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-secondary-light dark:text-secondary-dark">
                © 2024 Music Stream. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#privacy" className="text-sm text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Privacy Policy</a>
                <a href="#terms" className="text-sm text-secondary-light dark:text-secondary-dark hover:text-text-light dark:hover:text-text-dark transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
