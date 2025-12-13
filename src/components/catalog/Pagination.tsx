import { Link, useSearchParams } from 'react-router-dom'

interface PaginationProps {
  page: number
  totalPages: number
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const [searchParams] = useSearchParams()

  if (totalPages <= 1) return null

  const createHref = (nextPage: number) => {
    const p = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      p.delete('page')
    } else {
      p.set('page', String(nextPage))
    }
    const qs = p.toString()
    return qs ? `?${qs}` : ''
  }

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1)
    .filter((p) => {
      if (totalPages <= 7) return true
      if (p === 1 || p === totalPages) return true
      return Math.abs(p - page) <= 1
    })

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      <Link
        to={createHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-lg border border-border-light dark:border-border-dark px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${page === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'}`}
      >
        Prev
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          to={createHref(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`rounded-lg border px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${p === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-border-light dark:border-border-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'}`}
        >
          {p}
        </Link>
      ))}

      <Link
        to={createHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-lg border border-border-light dark:border-border-dark px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${page === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-bg-light/50 dark:hover:bg-bg-dark/50'}`}
      >
        Next
      </Link>
    </nav>
  )
}
