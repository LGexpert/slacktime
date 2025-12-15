import { useEffect, useMemo, useState } from 'react'
import {
  Link,
  redirect,
  useLoaderData,
  useNavigate,
} from 'react-router-dom'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Head } from '../components'
import { ShareButton } from '../components/ShareButton'
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api'
import type { ApiPlaylistDetailResponse } from '../lib/api-types'
import { useCanonicalUrl } from '../lib/url'
import { formatDuration } from '../lib/format'
import { usePlaybackQueue } from '../context/PlaybackQueueContext'

type LoaderData = ApiPlaylistDetailResponse

export async function loader({ params, request }: LoaderFunctionArgs): Promise<LoaderData> {
  const playlistId = params.playlistId
  if (!playlistId) {
    throw new Response('Missing playlist id', { status: 400 })
  }

  // Extract baseUrl from request for SSR
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  try {
    return await apiGet<ApiPlaylistDetailResponse>(`/api/playlists/${encodeURIComponent(playlistId)}`, { baseUrl })
  } catch (err) {
    if ((err as Error).message.toLowerCase().includes('unauthorized')) {
      throw redirect('/auth/sign-in')
    }
    throw err
  }
}

export default function PlaylistDetail() {
  const data = useLoaderData() as LoaderData
  const navigate = useNavigate()
  const canonical = useCanonicalUrl()
  const { setQueue } = usePlaybackQueue()

  const [items, setItems] = useState(data.items)
  const [title, setTitle] = useState(data.playlist.title)
  const [description, setDescription] = useState(data.playlist.description || '')
  const [isPublic, setIsPublic] = useState(data.playlist.isPublic)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setItems(data.items)
    setTitle(data.playlist.title)
    setDescription(data.playlist.description || '')
    setIsPublic(data.playlist.isPublic)
  }, [data.items, data.playlist.description, data.playlist.isPublic, data.playlist.title])

  const videos = useMemo(() => items.map((i) => i.video), [items])
  const totalSeconds = useMemo(() => videos.reduce((sum, v) => sum + v.durationSeconds, 0), [videos])

  const handleSaveMeta = async () => {
    setBusy(true)
    setError(null)

    try {
      await apiPut(`/api/playlists/${encodeURIComponent(data.playlist.id)}`, {
        title: title.trim(),
        description: description.trim() || null,
        isPublic,
      })
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleDeletePlaylist = async () => {
    if (!confirm('Delete this playlist?')) return

    setBusy(true)
    try {
      await apiDelete(`/api/playlists/${encodeURIComponent(data.playlist.id)}`)
      navigate('/playlists')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const moveItem = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return

    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)

    setItems(next)

    if (!data.playlist.isOwner) return

    try {
      await apiPost(`/api/playlists/${encodeURIComponent(data.playlist.id)}/reorder`, {
        orderedItemIds: next.map((i) => i.itemId),
      })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!data.playlist.isOwner) return

    setBusy(true)
    setError(null)

    try {
      await apiDelete(`/api/playlists/${encodeURIComponent(data.playlist.id)}/items/${encodeURIComponent(itemId)}`)
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handlePlayAll = () => {
    setQueue(videos, 0)
    const first = videos[0]
    if (first) {
      navigate(`/videos/${encodeURIComponent(first.slug)}`)
    }
  }

  return (
    <>
      <Head
        title={`${data.playlist.title} - Playlist - Music Stream`}
        description={data.playlist.description || `Playlist with ${videos.length} tracks.`}
        canonical={canonical}
      />

      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="heading-h1">{data.playlist.title}</h1>
            <p className="text-secondary-light dark:text-secondary-dark">
              {videos.length} tracks • {formatDuration(totalSeconds)}
              {data.playlist.isPublic ? ' • Public' : ' • Private'}
            </p>
            {data.playlist.description ? (
              <p className="text-secondary-light dark:text-secondary-dark whitespace-pre-wrap">{data.playlist.description}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {canonical ? <ShareButton url={canonical} title={data.playlist.title} /> : null}
            <Button variant="primary" onClick={handlePlayAll} disabled={videos.length === 0}>
              Play all
            </Button>
            <Link to="/playlists">
              <Button variant="outline">Back</Button>
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        {data.playlist.isOwner ? (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Edit playlist</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="title">Title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Public (shareable link)
              </label>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void handleSaveMeta()} disabled={busy}>
                  {busy ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => void handleDeletePlaylist()} disabled={busy}>
                  Delete playlist
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Tracks</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {items.length === 0 ? (
              <p className="text-secondary-light dark:text-secondary-dark">No tracks yet.</p>
            ) : (
              <ol className="space-y-2">
                {items.map((item, idx) => (
                  <li
                    key={item.itemId}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border-light dark:border-border-dark p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/videos/${encodeURIComponent(item.video.slug)}`}
                        className="font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {item.video.title}
                      </Link>
                      <div className="text-xs text-secondary-light dark:text-secondary-dark">
                        {formatDuration(item.video.durationSeconds)}
                      </div>
                    </div>

                    {data.playlist.isOwner ? (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => void moveItem(idx, idx - 1)}>
                          Up
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void moveItem(idx, idx + 1)}>
                          Down
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void handleRemoveItem(item.itemId)} disabled={busy}>
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
