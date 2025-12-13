import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'
export type ThemePreference = 'system' | Theme

interface ThemeContextType {
  theme: Theme
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [mounted, setMounted] = useState(false)

  const theme = useMemo<Theme>(() => {
    return preference === 'system' ? (mounted ? getSystemTheme() : 'light') : preference
  }, [mounted, preference])

  useEffect(() => {
    const stored = localStorage.getItem('themePreference') as ThemePreference | null
    const initialPreference = stored || 'system'

    setPreferenceState(initialPreference)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    applyTheme(theme)
    localStorage.setItem('themePreference', preference)
  }, [mounted, preference, theme])

  useEffect(() => {
    if (!mounted || preference !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      applyTheme(getSystemTheme())
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [mounted, preference])

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next)
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setPreferenceState(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
