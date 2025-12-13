import { Form, useSearchParams } from 'react-router-dom'

interface SearchBarProps {
  action?: string
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export function SearchBar({
  action = '/search',
  placeholder = 'Search videos, lyrics, and artists…',
  autoFocus,
  className = '',
}: SearchBarProps) {
  const [params] = useSearchParams()
  const currentQuery = params.get('q') || ''

  const preservedKeys = ['genre', 'mood', 'decade', 'duration', 'popularity', 'sort', 'pageSize'] as const

  return (
    <Form
      action={action}
      method="get"
      role="search"
      className={`flex items-center gap-2 ${className}`}
    >
      {preservedKeys.map((key) => {
        const value = params.get(key)
        return value ? <input key={key} type="hidden" name={key} value={value} /> : null
      })}

      <label className="sr-only" htmlFor="global-search">Search</label>
      <input
        id="global-search"
        name="q"
        defaultValue={currentQuery}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Search
      </button>
    </Form>
  )
}
