import 'dotenv/config'

import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  and,
  asc,
  desc,
  eq,
  exists,
  inArray,
  isNotNull,
  sql,
} from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import type { Plugin } from 'vite'

import { createDb, createPool, type DbClient } from '../db/client'
import {
  artists,
  genres,
  lyricLines,
  tags,
  videoArtists,
  videoGenres,
  videoRelations,
  videos,
  videoTags,
} from '../src/db/schema'

type ApiGenre = {
  id: string
  slug: string
  name: string
  videoCount?: number
}

type ApiMood = {
  id: string
  slug: string
  name: string
  videoCount?: number
}

type ApiArtist = {
  id: string
  slug: string
  name: string
  bio?: string | null
  avatarUrl?: string | null
  videoCount?: number
}

type ApiVideo = {
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

type PaginatedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

type SearchVideoHit = {
  video: ApiVideo
  highlightTitle?: string
  highlightDescription?: string
  rank: number
}

type SearchArtistHit = {
  artist: ApiArtist
  highlightName?: string
  highlightBio?: string
  rank: number
}

type SearchLyricHit = {
  lineId: string
  video: Pick<ApiVideo, 'slug' | 'title' | 'thumbnailUrl'>
  timeMs: number
  highlightText: string
  rank: number
}

type ApiLyricLine = {
  id: string
  timeMs: number
  language: string
  text: string
}

type ApiVideoDetail = ApiVideo & {
  streamingSources: Array<{ type: string; url: string; quality?: string }>
  thumbnails: Array<{ url: string; width: number; height: number }>
  lyrics: ApiLyricLine[]
  relatedVideos: ApiVideo[]
}

let _db: DbClient | undefined
let _pool: ReturnType<typeof createPool> | undefined

function getDb() {
  if (_db) return _db
  _pool = createPool()
  _db = createDb(_pool)
  return _db
}

function respondJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function parseIntParam(value: string | null, fallback: number) {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toIso(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function sanitizeHeadline(headline: string) {
  const escaped = headline
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

  return escaped
    .replaceAll('&lt;mark&gt;', '<mark>')
    .replaceAll('&lt;/mark&gt;', '</mark>')
}

function getVideoComputedColumns() {
  const thumbnailUrl = sql<string | null>`(${videos.thumbnails} -> 0 ->> 'url')`
  const views = sql<number>`coalesce((${videos.stats} ->> 'views')::int, 0)`
  const likes = sql<number>`coalesce((${videos.stats} ->> 'likes')::int, 0)`

  return { thumbnailUrl, views, likes }
}

type VideoFilters = {
  genre?: string
  mood?: string
  decade?: string
  duration?: string
  popularity?: string
  artist?: string
  sort?: string
  page?: string
  pageSize?: string
  q?: string
}

function buildVideoWhere(db: DbClient, filters: VideoFilters): SQL | undefined {
  const conditions: SQL[] = []

  if (filters.genre) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(videoGenres)
          .innerJoin(genres, eq(videoGenres.genreId, genres.id))
          .where(and(eq(videoGenres.videoId, videos.id), eq(genres.slug, filters.genre))),
      ),
    )
  }

  if (filters.mood) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(videoTags)
          .innerJoin(tags, eq(videoTags.tagId, tags.id))
          .where(and(eq(videoTags.videoId, videos.id), eq(tags.slug, filters.mood))),
      ),
    )
  }

  if (filters.artist) {
    conditions.push(
      exists(
        db
          .select({ one: sql`1` })
          .from(videoArtists)
          .innerJoin(artists, eq(videoArtists.artistId, artists.id))
          .where(and(eq(videoArtists.videoId, videos.id), eq(artists.slug, filters.artist))),
      ),
    )
  }

  if (filters.decade) {
    const decadeStart = Number.parseInt(filters.decade, 10)
    if (Number.isFinite(decadeStart)) {
      const start = new Date(`${decadeStart}-01-01T00:00:00.000Z`)
      const end = new Date(`${decadeStart + 10}-01-01T00:00:00.000Z`)
      conditions.push(sql`${videos.publishedAt} >= ${start} AND ${videos.publishedAt} < ${end}`)
    }
  }

  if (filters.duration === 'short') {
    conditions.push(sql`${videos.durationSeconds} < 180`)
  }
  if (filters.duration === 'medium') {
    conditions.push(sql`${videos.durationSeconds} >= 180 AND ${videos.durationSeconds} <= 300`)
  }
  if (filters.duration === 'long') {
    conditions.push(sql`${videos.durationSeconds} > 300`)
  }

  const { views } = getVideoComputedColumns()
  if (filters.popularity === 'popular') {
    conditions.push(sql`${views} >= 10000`)
  }
  if (filters.popularity === 'viral') {
    conditions.push(sql`${views} >= 20000`)
  }

  if (conditions.length === 0) return undefined
  return sql.join(conditions, sql` AND `)
}

async function hydrateVideos(db: DbClient, baseVideos: Array<Omit<ApiVideo, 'artists' | 'genres' | 'moods'>>) {
  const videoIds = baseVideos.map((v) => v.id)
  if (videoIds.length === 0) {
    return [] as ApiVideo[]
  }

  const artistRows = await db
    .select({
      videoId: videoArtists.videoId,
      slug: artists.slug,
      name: artists.name,
      position: videoArtists.position,
    })
    .from(videoArtists)
    .innerJoin(artists, eq(videoArtists.artistId, artists.id))
    .where(inArray(videoArtists.videoId, videoIds))
    .orderBy(asc(videoArtists.position), asc(artists.name))

  const genreRows = await db
    .select({
      videoId: videoGenres.videoId,
      slug: genres.slug,
      name: genres.name,
    })
    .from(videoGenres)
    .innerJoin(genres, eq(videoGenres.genreId, genres.id))
    .where(inArray(videoGenres.videoId, videoIds))
    .orderBy(asc(genres.name))

  const moodRows = await db
    .select({
      videoId: videoTags.videoId,
      slug: tags.slug,
      name: tags.name,
    })
    .from(videoTags)
    .innerJoin(tags, eq(videoTags.tagId, tags.id))
    .where(inArray(videoTags.videoId, videoIds))
    .orderBy(asc(tags.name))

  const artistsByVideo = new Map<string, Array<Pick<ApiArtist, 'slug' | 'name'>>>()
  for (const row of artistRows) {
    const list = artistsByVideo.get(row.videoId) ?? []
    list.push({ slug: row.slug, name: row.name })
    artistsByVideo.set(row.videoId, list)
  }

  const genresByVideo = new Map<string, Array<Pick<ApiGenre, 'slug' | 'name'>>>()
  for (const row of genreRows) {
    const list = genresByVideo.get(row.videoId) ?? []
    list.push({ slug: row.slug, name: row.name })
    genresByVideo.set(row.videoId, list)
  }

  const moodsByVideo = new Map<string, Array<Pick<ApiMood, 'slug' | 'name'>>>()
  for (const row of moodRows) {
    const list = moodsByVideo.get(row.videoId) ?? []
    list.push({ slug: row.slug, name: row.name })
    moodsByVideo.set(row.videoId, list)
  }

  return baseVideos.map((v) => ({
    ...v,
    artists: artistsByVideo.get(v.id) ?? [],
    genres: genresByVideo.get(v.id) ?? [],
    moods: moodsByVideo.get(v.id) ?? [],
  }))
}

async function listVideos(db: DbClient, filters: VideoFilters): Promise<PaginatedResponse<ApiVideo>> {
  const page = Math.max(1, parseIntParam(filters.page ?? null, 1))
  const pageSize = Math.min(50, Math.max(1, parseIntParam(filters.pageSize ?? null, 12)))
  const offset = (page - 1) * pageSize

  const where = buildVideoWhere(db, filters)
  const { thumbnailUrl, views, likes } = getVideoComputedColumns()

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(videos)
    .where(where)

  const sort = filters.sort || 'popular'
  const orderBy =
    sort === 'newest'
      ? sql`${videos.publishedAt} DESC NULLS LAST`
      : sort === 'title'
        ? asc(videos.title)
        : sort === 'duration'
          ? desc(videos.durationSeconds)
          : sql`${views} DESC`

  const rows = await db
    .select({
      id: videos.id,
      slug: videos.slug,
      title: videos.title,
      description: videos.description,
      durationSeconds: videos.durationSeconds,
      publishedAt: videos.publishedAt,
      thumbnailUrl,
      views,
      likes,
    })
    .from(videos)
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset)

  const baseVideos = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    durationSeconds: row.durationSeconds,
    publishedAt: toIso(row.publishedAt),
    thumbnailUrl: row.thumbnailUrl,
    views: row.views,
    likes: row.likes,
  }))

  const hydrated = await hydrateVideos(db, baseVideos)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    items: hydrated,
    page,
    pageSize,
    total,
    totalPages,
  }
}

async function listGenres(db: DbClient): Promise<ApiGenre[]> {
  const rows = await db
    .select({
      id: genres.id,
      slug: genres.slug,
      name: genres.name,
      videoCount: sql<number>`count(distinct ${videoGenres.videoId})`,
    })
    .from(genres)
    .leftJoin(videoGenres, eq(videoGenres.genreId, genres.id))
    .groupBy(genres.id)
    .orderBy(asc(genres.name))

  return rows
}

async function listMoods(db: DbClient): Promise<ApiMood[]> {
  const rows = await db
    .select({
      id: tags.id,
      slug: tags.slug,
      name: tags.name,
      videoCount: sql<number>`count(distinct ${videoTags.videoId})`,
    })
    .from(tags)
    .leftJoin(videoTags, eq(videoTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.name))

  return rows
}

async function listArtists(db: DbClient): Promise<ApiArtist[]> {
  const rows = await db
    .select({
      id: artists.id,
      slug: artists.slug,
      name: artists.name,
      bio: artists.bio,
      avatarUrl: artists.avatarUrl,
      videoCount: sql<number>`count(distinct ${videoArtists.videoId})`,
    })
    .from(artists)
    .leftJoin(videoArtists, eq(videoArtists.artistId, artists.id))
    .groupBy(artists.id)
    .orderBy(asc(artists.name))

  return rows
}

async function listDecades(db: DbClient): Promise<number[]> {
  const years = await db
    .selectDistinct({
      year: sql<number>`extract(year from ${videos.publishedAt})::int`,
    })
    .from(videos)
    .where(isNotNull(videos.publishedAt))

  const decades = new Set<number>()
  for (const { year } of years) {
    decades.add(Math.floor(year / 10) * 10)
  }

  return Array.from(decades).sort((a, b) => b - a)
}

async function getGenre(db: DbClient, slug: string) {
  const [genre] = await db.select().from(genres).where(eq(genres.slug, slug)).limit(1)
  if (!genre) return null

  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct ${videoGenres.videoId})` })
    .from(videoGenres)
    .innerJoin(genres, eq(videoGenres.genreId, genres.id))
    .where(eq(genres.slug, slug))

  return {
    id: genre.id,
    slug: genre.slug,
    name: genre.name,
    videoCount: count,
  } satisfies ApiGenre
}

async function getArtist(db: DbClient, slug: string) {
  const [artist] = await db.select().from(artists).where(eq(artists.slug, slug)).limit(1)
  if (!artist) return null

  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct ${videoArtists.videoId})` })
    .from(videoArtists)
    .innerJoin(artists, eq(videoArtists.artistId, artists.id))
    .where(eq(artists.slug, slug))

  return {
    id: artist.id,
    slug: artist.slug,
    name: artist.name,
    bio: artist.bio,
    avatarUrl: artist.avatarUrl,
    videoCount: count,
  } satisfies ApiArtist
}

async function getVideo(db: DbClient, slug: string): Promise<ApiVideoDetail | null> {
  const { thumbnailUrl, views, likes } = getVideoComputedColumns()

  const [videoRow] = await db
    .select({
      id: videos.id,
      slug: videos.slug,
      title: videos.title,
      description: videos.description,
      durationSeconds: videos.durationSeconds,
      publishedAt: videos.publishedAt,
      thumbnailUrl,
      views,
      likes,
      thumbnails: videos.thumbnails,
      streamingSources: videos.streamingSources,
    })
    .from(videos)
    .where(eq(videos.slug, slug))
    .limit(1)

  if (!videoRow) return null

  const baseVideo = {
    id: videoRow.id,
    slug: videoRow.slug,
    title: videoRow.title,
    description: videoRow.description,
    durationSeconds: videoRow.durationSeconds,
    publishedAt: toIso(videoRow.publishedAt),
    thumbnailUrl: videoRow.thumbnailUrl,
    views: videoRow.views,
    likes: videoRow.likes,
  }

  const [hydrated] = await hydrateVideos(db, [baseVideo])

  const lyricsRows = await db
    .select({
      id: lyricLines.id,
      timeMs: lyricLines.timeMs,
      language: lyricLines.language,
      text: lyricLines.text,
    })
    .from(lyricLines)
    .where(eq(lyricLines.videoId, videoRow.id))
    .orderBy(asc(lyricLines.timeMs))

  const relatedVideoIds = await db
    .select({
      relatedVideoId: videoRelations.relatedVideoId,
      weight: videoRelations.weight,
    })
    .from(videoRelations)
    .where(eq(videoRelations.videoId, videoRow.id))
    .orderBy(desc(videoRelations.weight))
    .limit(6)

  let relatedVideos: ApiVideo[] = []
  if (relatedVideoIds.length > 0) {
    const relatedRows = await db
      .select({
        id: videos.id,
        slug: videos.slug,
        title: videos.title,
        description: videos.description,
        durationSeconds: videos.durationSeconds,
        publishedAt: videos.publishedAt,
        thumbnailUrl,
        views,
        likes,
      })
      .from(videos)
      .where(inArray(videos.id, relatedVideoIds.map((r) => r.relatedVideoId)))

    const baseRelatedVideos = relatedRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      durationSeconds: row.durationSeconds,
      publishedAt: toIso(row.publishedAt),
      thumbnailUrl: row.thumbnailUrl,
      views: row.views,
      likes: row.likes,
    }))

    relatedVideos = await hydrateVideos(db, baseRelatedVideos)
  } else {
    const genreIds = await db
      .select({ genreId: videoGenres.genreId })
      .from(videoGenres)
      .where(eq(videoGenres.videoId, videoRow.id))
      .limit(1)

    const artistIds = await db
      .select({ artistId: videoArtists.artistId })
      .from(videoArtists)
      .where(eq(videoArtists.videoId, videoRow.id))
      .limit(1)

    const fallbackConditions: SQL[] = [sql`${videos.id} != ${videoRow.id}`]
    if (genreIds.length > 0) {
      fallbackConditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(videoGenres)
            .where(
              and(
                eq(videoGenres.videoId, videos.id),
                inArray(videoGenres.genreId, genreIds.map((g) => g.genreId)),
              ),
            ),
        ),
      )
    }
    if (artistIds.length > 0) {
      fallbackConditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(videoArtists)
            .where(
              and(
                eq(videoArtists.videoId, videos.id),
                inArray(videoArtists.artistId, artistIds.map((a) => a.artistId)),
              ),
            ),
        ),
      )
    }

    const fallbackRows = await db
      .select({
        id: videos.id,
        slug: videos.slug,
        title: videos.title,
        description: videos.description,
        durationSeconds: videos.durationSeconds,
        publishedAt: videos.publishedAt,
        thumbnailUrl,
        views,
        likes,
      })
      .from(videos)
      .where(fallbackConditions.length > 1 ? and(...fallbackConditions) : fallbackConditions[0])
      .orderBy(desc(views))
      .limit(6)

    const baseFallbackVideos = fallbackRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      durationSeconds: row.durationSeconds,
      publishedAt: toIso(row.publishedAt),
      thumbnailUrl: row.thumbnailUrl,
      views: row.views,
      likes: row.likes,
    }))

    relatedVideos = await hydrateVideos(db, baseFallbackVideos)
  }

  return {
    ...hydrated,
    thumbnails: (videoRow.thumbnails as Array<{ url: string; width: number; height: number }>) || [],
    streamingSources: (videoRow.streamingSources as Array<{ type: string; url: string; quality?: string }>) || [],
    lyrics: lyricsRows,
    relatedVideos,
  }
}

async function search(db: DbClient, filters: VideoFilters) {
  const query = filters.q?.trim() || ''
  if (!query) {
    return {
      query: '',
      videos: { items: [], page: 1, pageSize: 12, total: 0, totalPages: 1 },
      artists: [],
      lyrics: [],
    }
  }

  const page = Math.max(1, parseIntParam(filters.page ?? null, 1))
  const pageSize = Math.min(50, Math.max(1, parseIntParam(filters.pageSize ?? null, 12)))
  const offset = (page - 1) * pageSize

  const tsQuery = sql`websearch_to_tsquery('english', ${query})`

  const { thumbnailUrl, views, likes } = getVideoComputedColumns()
  const whereFilters = buildVideoWhere(db, filters)
  const videoMatch = sql`${videos.searchVector} @@ ${tsQuery}`
  const combinedVideoWhere = whereFilters ? sql`${videoMatch} AND ${whereFilters}` : videoMatch

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(videos)
    .where(combinedVideoWhere)

  const videoRows = await db
    .select({
      id: videos.id,
      slug: videos.slug,
      title: videos.title,
      description: videos.description,
      durationSeconds: videos.durationSeconds,
      publishedAt: videos.publishedAt,
      thumbnailUrl,
      views,
      likes,
      rank: sql<number>`ts_rank(${videos.searchVector}, ${tsQuery})`,
      highlightTitle: sql<string>`ts_headline('english', ${videos.title}, ${tsQuery}, 'StartSel=<mark>, StopSel=</mark>')`,
      highlightDescription: sql<string>`ts_headline('english', coalesce(${videos.description}, ''), ${tsQuery}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=8')`,
    })
    .from(videos)
    .where(combinedVideoWhere)
    .orderBy(sql`rank DESC`, sql`${views} DESC`)
    .limit(pageSize)
    .offset(offset)

  const baseVideos = videoRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    durationSeconds: row.durationSeconds,
    publishedAt: toIso(row.publishedAt),
    thumbnailUrl: row.thumbnailUrl,
    views: row.views,
    likes: row.likes,
  }))

  const hydratedVideos = await hydrateVideos(db, baseVideos)
  const hydratedMap = new Map(hydratedVideos.map((v) => [v.id, v]))

  const videoHits: SearchVideoHit[] = videoRows.map((row) => ({
    video: hydratedMap.get(row.id)!,
    rank: row.rank,
    highlightTitle: sanitizeHeadline(row.highlightTitle),
    highlightDescription: sanitizeHeadline(row.highlightDescription),
  }))

  const artistRows = await db
    .select({
      id: artists.id,
      slug: artists.slug,
      name: artists.name,
      bio: artists.bio,
      avatarUrl: artists.avatarUrl,
      rank: sql<number>`ts_rank(${artists.searchVector}, ${tsQuery})`,
      highlightName: sql<string>`ts_headline('english', ${artists.name}, ${tsQuery}, 'StartSel=<mark>, StopSel=</mark>')`,
      highlightBio: sql<string>`ts_headline('english', coalesce(${artists.bio}, ''), ${tsQuery}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=18, MinWords=8')`,
    })
    .from(artists)
    .where(sql`${artists.searchVector} @@ ${tsQuery}`)
    .orderBy(sql`rank DESC`, asc(artists.name))
    .limit(8)

  const artistHits: SearchArtistHit[] = artistRows.map((row) => ({
    artist: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      bio: row.bio,
      avatarUrl: row.avatarUrl,
    },
    rank: row.rank,
    highlightName: sanitizeHeadline(row.highlightName),
    highlightBio: sanitizeHeadline(row.highlightBio),
  }))

  const lyricWhere = sql`${lyricLines.searchVector} @@ ${tsQuery}`
  const lyricRows = await db
    .select({
      lineId: lyricLines.id,
      videoId: lyricLines.videoId,
      timeMs: lyricLines.timeMs,
      rank: sql<number>`ts_rank(${lyricLines.searchVector}, ${tsQuery})`,
      highlightText: sql<string>`ts_headline('english', ${lyricLines.text}, ${tsQuery}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=18, MinWords=6')`,
    })
    .from(lyricLines)
    .where(lyricWhere)
    .orderBy(sql`rank DESC`, asc(lyricLines.timeMs))
    .limit(8)

  const lyricVideoIds = Array.from(new Set(lyricRows.map((r) => r.videoId)))
  const lyricVideoRows = lyricVideoIds.length
    ? await db
        .select({ id: videos.id, slug: videos.slug, title: videos.title, thumbnailUrl })
        .from(videos)
        .where(inArray(videos.id, lyricVideoIds))
    : []

  const lyricVideosById = new Map(
    lyricVideoRows.map((row) => [row.id, { slug: row.slug, title: row.title, thumbnailUrl: row.thumbnailUrl }]),
  )

  const lyricHits = lyricRows
    .map((row) => {
      const video = lyricVideosById.get(row.videoId)
      if (!video) return null

      return {
        lineId: row.lineId,
        video: {
          slug: video.slug,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl ?? undefined,
        },
        timeMs: row.timeMs,
        rank: row.rank,
        highlightText: sanitizeHeadline(row.highlightText),
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  return {
    query,
    videos: {
      items: videoHits,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    artists: artistHits,
    lyrics: lyricHits as SearchLyricHit[],
  }
}

function getFiltersFromUrl(url: URL): VideoFilters {
  const params = url.searchParams

  return {
    q: params.get('q') ?? undefined,
    genre: params.get('genre') ?? undefined,
    mood: params.get('mood') ?? undefined,
    decade: params.get('decade') ?? undefined,
    duration: params.get('duration') ?? undefined,
    popularity: params.get('popularity') ?? undefined,
    sort: params.get('sort') ?? undefined,
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
    artist: params.get('artist') ?? undefined,
  }
}

async function handleApiRequest(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const pathname = url.pathname

  if (req.method !== 'GET') {
    respondJson(res, 405, { error: 'Method Not Allowed' })
    return
  }

  let db: DbClient
  try {
    db = getDb()
  } catch (err) {
    respondJson(res, 500, { error: (err as Error).message })
    return
  }

  if (pathname === '/api/featured') {
    const videosResponse = await listVideos(db, { ...getFiltersFromUrl(url), sort: 'popular', pageSize: '6', page: '1' })
    respondJson(res, 200, { items: videosResponse.items })
    return
  }

  if (pathname === '/api/videos') {
    const data = await listVideos(db, getFiltersFromUrl(url))
    respondJson(res, 200, data)
    return
  }

  if (pathname === '/api/genres') {
    respondJson(res, 200, await listGenres(db))
    return
  }

  if (pathname === '/api/moods') {
    respondJson(res, 200, await listMoods(db))
    return
  }

  if (pathname === '/api/artists') {
    respondJson(res, 200, await listArtists(db))
    return
  }

  if (pathname === '/api/facets') {
    const [genreList, moodList, decadeList] = await Promise.all([
      listGenres(db),
      listMoods(db),
      listDecades(db),
    ])

    respondJson(res, 200, { genres: genreList, moods: moodList, decades: decadeList })
    return
  }

  if (pathname === '/api/search') {
    const data = await search(db, getFiltersFromUrl(url))
    respondJson(res, 200, data)
    return
  }

  const genreMatch = pathname.match(/^\/api\/genres\/([^/]+)$/)
  if (genreMatch) {
    const genre = await getGenre(db, decodeURIComponent(genreMatch[1]))
    if (!genre) {
      respondJson(res, 404, { error: 'Genre not found' })
      return
    }
    respondJson(res, 200, genre)
    return
  }

  const artistMatch = pathname.match(/^\/api\/artists\/([^/]+)$/)
  if (artistMatch) {
    const artist = await getArtist(db, decodeURIComponent(artistMatch[1]))
    if (!artist) {
      respondJson(res, 404, { error: 'Artist not found' })
      return
    }
    respondJson(res, 200, artist)
    return
  }

  const videoMatch = pathname.match(/^\/api\/videos\/([^/]+)$/)
  if (videoMatch) {
    const video = await getVideo(db, decodeURIComponent(videoMatch[1]))
    if (!video) {
      respondJson(res, 404, { error: 'Video not found' })
      return
    }
    respondJson(res, 200, video)
    return
  }

  respondJson(res, 404, { error: 'Not Found' })
}

export function catalogApiPlugin(): Plugin {
  return {
    name: 'catalog-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        void handleApiRequest(req, res).catch((err) => {
          if (!res.headersSent) {
            respondJson(res, 500, { error: (err as Error).message })
          }
        })
      })

      server.httpServer?.once('close', () => {
        void _pool?.end()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        void handleApiRequest(req, res).catch((err) => {
          if (!res.headersSent) {
            respondJson(res, 500, { error: (err as Error).message })
          }
        })
      })

      server.httpServer?.once('close', () => {
        void _pool?.end()
      })
    },
  }
}
