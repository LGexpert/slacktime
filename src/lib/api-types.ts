export interface ApiGenre {
  id: string
  slug: string
  name: string
  videoCount?: number
}

export interface ApiMood {
  id: string
  slug: string
  name: string
  videoCount?: number
}

export interface ApiArtist {
  id: string
  slug: string
  name: string
  bio?: string | null
  avatarUrl?: string | null
  videoCount?: number
}

export interface ApiVideo {
  id: string
  slug: string
  title: string
  description?: string | null
  durationSeconds: number
  publishedAt?: string | null
  thumbnailUrl?: string | null
  views: number
  likes: number
  artists: Array<Pick<ApiArtist, 'slug' | 'name'>>
  genres: Array<Pick<ApiGenre, 'slug' | 'name'>>
  moods: Array<Pick<ApiMood, 'slug' | 'name'>>
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type VideosResponse = PaginatedResponse<ApiVideo>

export interface FeaturedResponse {
  items: ApiVideo[]
}

export interface SearchVideoHit {
  video: ApiVideo
  highlightTitle?: string
  highlightDescription?: string
  rank: number
}

export interface SearchArtistHit {
  artist: ApiArtist
  highlightName?: string
  highlightBio?: string
  rank: number
}

export interface SearchLyricHit {
  lineId: string
  video: Pick<ApiVideo, 'slug' | 'title' | 'thumbnailUrl'>
  timeMs: number
  highlightText: string
  rank: number
}

export interface SearchResponse {
  query: string
  videos: PaginatedResponse<SearchVideoHit>
  artists: SearchArtistHit[]
  lyrics: SearchLyricHit[]
}
