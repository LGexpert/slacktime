import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ApiGenre, ApiMood } from '../../lib/api-types'
import { formatDecadeLabel } from '../../lib/format'

interface FacetPillsProps {
  genres: ApiGenre[]
  moods: ApiMood[]
}

interface Pill {
  key: string
  label: string
  onRemove: () => void
}

export function FacetPills({ genres, moods }: FacetPillsProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const pills = useMemo<Pill[]>(() => {
    const next: Pill[] = []

    const genreSlug = searchParams.get('genre')
    if (genreSlug) {
      const genre = genres.find((g) => g.slug === genreSlug)
      next.push({
        key: 'genre',
        label: genre ? `Genre: ${genre.name}` : `Genre: ${genreSlug}`,
        onRemove: () => {
          const p = new URLSearchParams(searchParams)
          p.delete('genre')
          p.delete('page')
          setSearchParams(p, { replace: true })
        },
      })
    }

    const moodSlug = searchParams.get('mood')
    if (moodSlug) {
      const mood = moods.find((m) => m.slug === moodSlug)
      next.push({
        key: 'mood',
        label: mood ? `Mood: ${mood.name}` : `Mood: ${moodSlug}`,
        onRemove: () => {
          const p = new URLSearchParams(searchParams)
          p.delete('mood')
          p.delete('page')
          setSearchParams(p, { replace: true })
        },
      })
    }

    const decade = searchParams.get('decade')
    if (decade) {
      next.push({
        key: 'decade',
        label: `Decade: ${formatDecadeLabel(Number(decade))}`,
        onRemove: () => {
          const p = new URLSearchParams(searchParams)
          p.delete('decade')
          p.delete('page')
          setSearchParams(p, { replace: true })
        },
      })
    }

    const duration = searchParams.get('duration')
    if (duration) {
      next.push({
        key: 'duration',
        label: `Duration: ${duration}`,
        onRemove: () => {
          const p = new URLSearchParams(searchParams)
          p.delete('duration')
          p.delete('page')
          setSearchParams(p, { replace: true })
        },
      })
    }

    const popularity = searchParams.get('popularity')
    if (popularity && popularity !== 'any') {
      next.push({
        key: 'popularity',
        label: `Popularity: ${popularity}`,
        onRemove: () => {
          const p = new URLSearchParams(searchParams)
          p.delete('popularity')
          p.delete('page')
          setSearchParams(p, { replace: true })
        },
      })
    }

    return next
  }, [genres, moods, searchParams, setSearchParams])

  if (pills.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Selected filters">
      {pills.map((pill) => (
        <button
          key={pill.key}
          type="button"
          onClick={pill.onRemove}
          className="inline-flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark bg-bg-light/50 dark:bg-bg-dark/50 px-3 py-1 text-sm hover:bg-bg-light dark:hover:bg-bg-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {pill.label}
          <span aria-hidden className="text-secondary-light dark:text-secondary-dark">×</span>
        </button>
      ))}
    </div>
  )
}
