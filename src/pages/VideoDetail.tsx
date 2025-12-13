import { type LoaderFunctionArgs, useLoaderData, Link } from 'react-router-dom'
import { Head } from '../components'
import { VideoCard } from '../components/catalog'
import { VideoPlayer } from '../components/VideoPlayer'
import { LyricsPanel } from '../components/LyricsPanel'
import { ShareButton } from '../components/ShareButton'
import { CollectionActions } from '../components/CollectionActions'
import type { ApiVideoDetail } from '../lib/api-types'
import { apiGet } from '../lib/api'
import { useCanonicalUrl } from '../lib/url'
import { formatCompactNumber, formatDuration } from '../lib/format'

type VideoDetailLoaderData = {
  video: ApiVideoDetail
}

export async function loader({ params }: LoaderFunctionArgs): Promise<VideoDetailLoaderData> {
  const slug = params.slug
  if (!slug) {
    throw new Response('Missing video slug', { status: 400 })
  }

  const video = await apiGet<ApiVideoDetail>(`/api/videos/${encodeURIComponent(slug)}`)

  return { video }
}

export default function VideoDetail() {
  const data = useLoaderData() as VideoDetailLoaderData
  const canonical = useCanonicalUrl()
  const { video } = data

  const primaryArtist = video.artists[0]

  return (
    <>
      <Head
        title={`${video.title} - Music Stream`}
        description={video.description || `Watch ${video.title} by ${primaryArtist?.name || 'Unknown artist'}.`}
        canonical={canonical}
        ogImage={video.thumbnailUrl || undefined}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer video={video} />

            <div className="space-y-3">
              <h1 className="heading-h1">{video.title}</h1>

              <div className="flex items-center gap-3 text-sm text-secondary-light dark:text-secondary-dark">
                {primaryArtist ? (
                  <Link
                    to={`/artists/${primaryArtist.slug}`}
                    className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {primaryArtist.name}
                  </Link>
                ) : (
                  <span>Unknown artist</span>
                )}
                <span>•</span>
                <span>{formatCompactNumber(video.views)} views</span>
                <span>•</span>
                <span>{formatDuration(video.durationSeconds)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {video.genres.map((genre) => (
                  <Link
                    key={genre.slug}
                    to={`/genres/${genre.slug}`}
                    className="rounded-full border border-border-light dark:border-border-dark px-3 py-1 text-sm text-secondary-light dark:text-secondary-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {genre.name}
                  </Link>
                ))}
                {video.moods.map((mood) => (
                  <Link
                    key={mood.slug}
                    to={`/videos?mood=${encodeURIComponent(mood.slug)}`}
                    className="rounded-full border border-border-light dark:border-border-dark px-3 py-1 text-sm text-secondary-light dark:text-secondary-dark hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {mood.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <ShareButton url={canonical || ''} title={video.title} />
                <CollectionActions videoId={video.id} />
                <span className="ml-auto text-sm text-secondary-light dark:text-secondary-dark">
                  {formatCompactNumber(video.likes)} likes
                </span>
              </div>

              {video.description ? (
                <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
                  <p className="text-secondary-light dark:text-secondary-dark whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-1">
            <LyricsPanel lyrics={video.lyrics} />
          </div>
        </div>

        {video.relatedVideos.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Related Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {video.relatedVideos.map((relatedVideo) => (
                <VideoCard key={relatedVideo.id} video={relatedVideo} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  )
}
