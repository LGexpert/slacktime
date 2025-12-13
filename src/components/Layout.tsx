import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { IconButton } from './IconButton'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">♪</span>
              </div>
              <span className="text-xl font-bold hidden sm:inline">Music Stream</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/videos" className="hover:text-blue-600 transition-colors">Videos</Link>
              <Link to="/artists" className="hover:text-blue-600 transition-colors">Artists</Link>
              <Link to="/genres" className="hover:text-blue-600 transition-colors">Genres</Link>
              <Link to="/playlists" className="hover:text-blue-600 transition-colors">Playlists</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <IconButton
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" clipRule="evenodd" />
                  </svg>
                )}
              </IconButton>

              {/* Profile Link */}
              <Link
                to="/profile"
                className="hidden sm:block px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Profile
              </Link>

              {/* Auth Link - Mobile */}
              <Link
                to="/auth"
                className="md:hidden px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden border-t border-lightBorder dark:border-darkBorder py-3 px-0">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/videos" className="hover:text-blue-600 transition-colors py-2">Videos</Link>
              <Link to="/artists" className="hover:text-blue-600 transition-colors py-2">Artists</Link>
              <Link to="/genres" className="hover:text-blue-600 transition-colors py-2">Genres</Link>
              <Link to="/playlists" className="hover:text-blue-600 transition-colors py-2">Playlists</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-lightSurface dark:bg-darkSurface border-t border-lightBorder dark:border-darkBorder mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="font-bold text-lg mb-4">Music Stream</h3>
              <p className="text-sm text-lightSecondary dark:text-darkSecondary">
                Discover and stream your favorite music.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Home</Link></li>
                <li><Link to="/videos" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Videos</Link></li>
                <li><Link to="/artists" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Artists</Link></li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/genres" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Genres</Link></li>
                <li><Link to="/playlists" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Playlists</Link></li>
                <li><Link to="/profile" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Profile</Link></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Sign In</Link></li>
                <li><a href="#signup" className="text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Sign Up</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-lightBorder dark:border-darkBorder pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-lightSecondary dark:text-darkSecondary">
                © 2024 Music Stream. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#privacy" className="text-sm text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Privacy Policy</a>
                <a href="#terms" className="text-sm text-lightSecondary dark:text-darkSecondary hover:text-lightText dark:hover:text-darkText transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
