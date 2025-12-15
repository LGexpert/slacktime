import { useState } from 'react'
import { Link, redirect, useLoaderData, useNavigate } from 'react-router-dom'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Head } from '../components'
import { apiDelete, apiGet, apiPost } from '../lib/api'
import type { ApiMeResponse, ApiPlaylistSummary } from '../lib/api-types'

type LoaderData = {
  playlists: ApiPlaylistSummary[]
}

export async function loader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  const me = await apiGet<ApiMeResponse>('/api/me', { baseUrl })
  if (!me.user) {
    throw redirect('/auth/sign-in')
  }

  const playlists = await apiGet<ApiPlaylistSummary[]>('/api/playlists', { baseUrl })
  return { playlists }
}

export default function Playlists() {
  const { playlists } = useLoaderData() as LoaderData
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setError('Title is required.')
      return
    }

    setBusy(true)
    try {
      const res = await apiPost<{ id?: string }>('/api/playlists', { title: trimmed, isPublic })
      if (!res.id) {
        throw new Error('Failed to create playlist')
      }
      navigate(`/playlists/${res.id}`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (playlistId: string) => {
    if (!confirm('Delete this playlist?')) return

    setBusy(true)
    try {
      await apiDelete(`/api/playlists/${encodeURIComponent(playlistId)}`)
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Head title="Playlists - Music Stream" description="Browse and create playlists" />

      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="heading-h1">Playlists</h1>
          <p className="text-xl text-secondary-light dark:text-secondary-dark">Create, edit, and share your playlists.</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Create playlist</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
            ) : null}

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My playlist"
                className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Public (shareable link)
              </label>
              <Button type="submit" disabled={busy}>
                {busy ? 'Creating…' : 'Create'}
              </Button>
            </form>
          </CardBody>
        </Card>

        {playlists.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-secondary-light dark:text-secondary-dark">You have no playlists yet.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm text-secondary-light dark:text-secondary-dark">
                    {p.trackCount} tracks • {Math.round(p.totalDurationSeconds / 60)} min
                    {p.isPublic ? ' • Public' : ' • Private'}
                  </p>
                </CardHeader>
                <CardBody className="flex items-center gap-2">
                  <Link to={`/playlists/${p.id}`} className="flex-1">
                    <Button variant="primary" className="w-full">Open</Button>
                  </Link>
                  <Button variant="outline" onClick={() => void handleDelete(p.id)} disabled={busy}>
                    Delete
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
