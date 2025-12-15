export function buildCanonicalUrl(origin: string, pathWithSearch: string) {
  const url = new URL(pathWithSearch, origin)

  if (url.searchParams.get('page') === '1') {
    url.searchParams.delete('page')
  }

  if (url.searchParams.get('pageSize') === '12') {
    url.searchParams.delete('pageSize')
  }

  url.searchParams.sort()

  const normalized = url.toString()
  return normalized.endsWith('?') ? normalized.slice(0, -1) : normalized
}

export function useCanonicalUrl() {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const search = typeof window !== 'undefined' ? window.location.search : ''
  return origin ? buildCanonicalUrl(origin, `${pathname}${search}`) : undefined
}
