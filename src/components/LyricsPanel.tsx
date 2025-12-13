import { useEffect, useRef, useState } from 'react'
import type { ApiLyricLine } from '../lib/api-types'

interface LyricsPanelProps {
  lyrics: ApiLyricLine[]
}

export function LyricsPanel({ lyrics }: LyricsPanelProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1)
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ currentTime: number }>
      const currentTimeMs = customEvent.detail.currentTime

      const newIndex = findCurrentLineIndex(currentTimeMs)
      setCurrentLineIndex(newIndex)
    }

    window.addEventListener('videotimeupdate', handleTimeUpdate)

    return () => {
      window.removeEventListener('videotimeupdate', handleTimeUpdate)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [lyrics])

  useEffect(() => {
    if (isAutoScrollEnabled && currentLineIndex >= 0) {
      scrollToLine(currentLineIndex)
    }
  }, [currentLineIndex, isAutoScrollEnabled])

  const findCurrentLineIndex = (timeMs: number): number => {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (timeMs >= lyrics[i].timeMs) {
        return i
      }
    }
    return -1
  }

  const scrollToLine = (index: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const lineElement = lineRefs.current[index]
      const container = containerRef.current

      if (lineElement && container) {
        const containerHeight = container.clientHeight
        const lineTop = lineElement.offsetTop
        const lineHeight = lineElement.clientHeight

        const scrollTarget = lineTop - containerHeight / 2 + lineHeight / 2

        container.scrollTo({
          top: scrollTarget,
          behavior: 'smooth',
        })
      }
    })
  }

  const handleLineClick = (index: number) => {
    const timeMs = lyrics[index].timeMs

    window.dispatchEvent(
      new CustomEvent('seekvideo', {
        detail: { timeMs },
      }),
    )

    setCurrentLineIndex(index)
  }

  const handleScroll = () => {
    setIsAutoScrollEnabled(false)

    setTimeout(() => {
      setIsAutoScrollEnabled(true)
    }, 3000)
  }

  useEffect(() => {
    const handleSeekVideo = (e: Event) => {
      const customEvent = e as CustomEvent<{ timeMs: number }>
      const timeMs = customEvent.detail.timeMs

      const videoElements = document.querySelectorAll('video')
      if (videoElements.length > 0) {
        const video = videoElements[0]
        video.currentTime = timeMs / 1000
      }
    }

    window.addEventListener('seekvideo', handleSeekVideo)
    return () => {
      window.removeEventListener('seekvideo', handleSeekVideo)
    }
  }, [])

  if (lyrics.length === 0) {
    return (
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
        <h2 className="text-lg font-semibold mb-4">Lyrics</h2>
        <p className="text-sm text-secondary-light dark:text-secondary-dark">
          No lyrics available for this video.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Lyrics</h2>
        <button
          type="button"
          onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            isAutoScrollEnabled
              ? 'bg-blue-500 text-white'
              : 'bg-bg-light dark:bg-bg-dark text-secondary-light dark:text-secondary-dark'
          }`}
          title={isAutoScrollEnabled ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
        >
          {isAutoScrollEnabled ? 'Auto' : 'Manual'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
        onScroll={handleScroll}
      >
        {lyrics.map((line, index) => (
          <div
            key={line.id}
            ref={(el) => {
              lineRefs.current[index] = el
            }}
            onClick={() => handleLineClick(index)}
            className={`cursor-pointer rounded-lg p-3 transition-all duration-300 ${
              index === currentLineIndex
                ? 'bg-blue-500/20 border-l-4 border-blue-500 text-text-light dark:text-text-dark font-semibold'
                : 'hover:bg-bg-light/50 dark:hover:bg-bg-dark/50 text-secondary-light dark:text-secondary-dark'
            }`}
          >
            <div className="text-sm">{line.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
