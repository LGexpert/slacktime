import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ApiGenre, ApiMood } from '../../lib/api-types'
import { formatDecadeLabel } from '../../lib/format'

export type DurationFilter = 'short' | 'medium' | 'long'
export type PopularityFilter = 'any' | 'popular' | 'viral'
export type SortOption = 'popular' | 'newest' | 'title' | 'duration'

interface FilterBarProps {
  genres: ApiGenre[]
  moods: ApiMood[]
  decades: number[]
  showSearchQuery?: boolean
}

export function FilterBar({ genres, moods, decades, showSearchQuery }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const values = useMemo(() => {
    return {
      q: searchParams.get('q') || '',
      genre: searchParams.get('genre') || '',
      mood: searchParams.get('mood') || '',
      decade: searchParams.get('decade') || '',
      duration: (searchParams.get('duration') || '') as DurationFilter | '',
      popularity: (searchParams.get('popularity') || 'any') as PopularityFilter,
      sort: (searchParams.get('sort') || 'popular') as SortOption,
    }
  }, [searchParams])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)

    const shouldDelete =
      !value ||
      value === 'any' ||
      (key === 'sort' && value === 'popular')

    if (shouldDelete) {
      next.delete(key)
    } else {
      next.set(key, value)
    }

    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const clearAll = () => {
    const next = new URLSearchParams(searchParams)
    for (const key of ['genre', 'mood', 'decade', 'duration', 'popularity', 'sort'] as const) {
      next.delete(key)
    }
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  return (
    <section aria-label="Filters" className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Filter & sort</h2>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {showSearchQuery ? (
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="filter-q">Query</label>
              <input
                id="filter-q"
                value={values.q}
                readOnly
                className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="filter-genre">Genre</label>
            <select
              id="filter-genre"
              value={values.genre}
              onChange={(e) => updateParam('genre', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {genres.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="filter-mood">Mood</label>
            <select
              id="filter-mood"
              value={values.mood}
              onChange={(e) => updateParam('mood', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              {moods.map((m) => (
                <option key={m.slug} value={m.slug}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="filter-decade">Decade</label>
            <select
              id="filter-decade"
              value={values.decade}
              onChange={(e) => updateParam('decade', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              {decades.map((d) => (
                <option key={d} value={String(d)}>{formatDecadeLabel(d)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="filter-duration">Duration</label>
            <select
              id="filter-duration"
              value={values.duration}
              onChange={(e) => updateParam('duration', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              <option value="short">Short (&lt; 3m)</option>
              <option value="medium">Medium (3–5m)</option>
              <option value="long">Long (&gt; 5m)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="filter-sort">Sort</label>
            <select
              id="filter-sort"
              value={values.sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="title">Title</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-light dark:text-secondary-dark" htmlFor="filter-popularity">Popularity</label>
            <select
              id="filter-popularity"
              value={values.popularity}
              onChange={(e) => updateParam('popularity', e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-3 py-2 text-sm"
            >
              <option value="any">Any</option>
              <option value="popular">Popular</option>
              <option value="viral">Viral</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}
