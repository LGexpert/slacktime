import { useEffect, useRef, useState } from 'react'
import type { ApiVideoDetail } from '../lib/api-types'

interface VideoPlayerProps {
  video: ApiVideoDetail
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [selectedQuality, setSelectedQuality] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sources = video.streamingSources
  const currentSource = sources[selectedQuality] || sources[0]

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const handleTimeUpdate = () => {
      setCurrentTime(videoEl.currentTime)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('videotimeupdate', { detail: { currentTime: videoEl.currentTime * 1000 } }))
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(videoEl.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => {
      setVolume(videoEl.volume)
      setIsMuted(videoEl.muted)
    }

    videoEl.addEventListener('timeupdate', handleTimeUpdate)
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata)
    videoEl.addEventListener('play', handlePlay)
    videoEl.addEventListener('pause', handlePause)
    videoEl.addEventListener('volumechange', handleVolumeChange)

    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate)
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata)
      videoEl.removeEventListener('play', handlePlay)
      videoEl.removeEventListener('pause', handlePause)
      videoEl.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (typeof document !== 'undefined') {
        setIsFullscreen(!!document.fullscreenElement)
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
      }
    }
    return () => {}
  }, [])

  useEffect(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }

    if (isPlaying && !showControls) {
      return
    }

    if (isPlaying) {
      hideControlsTimeoutRef.current = (typeof window !== 'undefined' ? window.setTimeout : setTimeout)(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControls])

  const handlePlayPause = () => {
    const videoEl = videoRef.current
    if (!videoEl) return

    if (isPlaying) {
      videoEl.pause()
    } else {
      videoEl.play()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const newTime = Number.parseFloat(e.target.value)
    videoEl.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const newVolume = Number.parseFloat(e.target.value)
    videoEl.volume = newVolume
    videoEl.muted = newVolume === 0
  }

  const toggleMute = () => {
    const videoEl = videoRef.current
    if (!videoEl) return

    videoEl.muted = !videoEl.muted
  }

  const handlePlaybackRateChange = (rate: number) => {
    const videoEl = videoRef.current
    if (!videoEl) return

    videoEl.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleQualityChange = (index: number) => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const currentTimeBeforeSwitch = videoEl.currentTime
    setSelectedQuality(index)

    setTimeout(() => {
      if (videoEl) {
        videoEl.currentTime = currentTimeBeforeSwitch
        if (isPlaying) {
          videoEl.play()
        }
      }
    }, 100)
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (typeof document !== 'undefined') {
        if (!document.fullscreenElement) {
          await container.requestFullscreen()
        } else {
          await document.exitFullscreen()
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
  }

  const handleSeekBySeconds = (seconds: number) => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    videoEl.currentTime = newTime
    setCurrentTime(newTime)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          handlePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleSeekBySeconds(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          handleSeekBySeconds(5)
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
    return () => {}
  }, [currentTime, duration, isPlaying])

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={video.thumbnailUrl || undefined}
        onClick={handlePlayPause}
      >
        <source src={currentSource.url} type={currentSource.type === 'hls' ? 'application/x-mpegURL' : 'video/mp4'} />
        Your browser does not support the video tag.
      </video>

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <button
              type="button"
              onClick={handlePlayPause}
              className="rounded-full bg-white/20 p-6 hover:bg-white/30 transition-colors"
              aria-label="Play"
            >
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`,
            }}
          />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePlayPause}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-3">
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(Number.parseFloat(e.target.value))}
                className="bg-white/20 text-white text-sm rounded px-2 py-1 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              {sources.length > 1 && (
                <select
                  value={selectedQuality}
                  onChange={(e) => handleQualityChange(Number.parseInt(e.target.value, 10))}
                  className="bg-white/20 text-white text-sm rounded px-2 py-1 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sources.map((source, index) => (
                    <option key={index} value={index}>
                      {source.quality || source.type.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
