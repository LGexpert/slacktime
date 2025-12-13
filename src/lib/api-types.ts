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

export interface ApiLyricLine {
  id: string
  timeMs: number
  language: string
  text: string
}

export interface ApiVideoDetail extends ApiVideo {
  streamingSources: Array<{ type: string; url: string; quality?: string }>
  thumbnails: Array<{ url: string; width: number; height: number }>
  lyrics: ApiLyricLine[]
  relatedVideos: ApiVideo[]
}

export type ThemePreference = 'system' | 'light' | 'dark'

export interface ApiUserProfile {
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  themePreference: ThemePreference
}

export interface ApiUser {
  id: string
  email: string
  profile: ApiUserProfile | null
}

export interface ApiMeResponse {
  user: ApiUser | null
}

export interface ApiCollectionVideo extends ApiVideo {
  addedAt: string | null
}

export interface ApiPlaylistSummary {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  trackCount: number
  totalDurationSeconds: number
  createdAt: string
  updatedAt: string
}

export interface ApiPlaylistDetailResponse {
  playlist: {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    createdAt: string
    updatedAt: string
    isOwner: boolean
  }
  items: Array<{
    itemId: string
    position: number
    addedAt: string
    video: ApiVideo
  }>
}
