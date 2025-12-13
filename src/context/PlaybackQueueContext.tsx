import React, { createContext, useContext, useMemo, useState } from 'react'
import type { ApiVideo } from '../lib/api-types'

type PlaybackQueueContextValue = {
  queue: ApiVideo[]
  currentIndex: number
  setQueue: (queue: ApiVideo[], startIndex?: number) => void
  setCurrentIndex: (index: number) => void
  clear: () => void
}

const PlaybackQueueContext = createContext<PlaybackQueueContextValue | undefined>(undefined)

export function PlaybackQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueueState] = useState<ApiVideo[]>([])
  const [currentIndex, setCurrentIndexState] = useState(0)

  const setQueue = (nextQueue: ApiVideo[], startIndex = 0) => {
    setQueueState(nextQueue)
    setCurrentIndexState(Math.max(0, Math.min(startIndex, Math.max(0, nextQueue.length - 1))))
  }

  const setCurrentIndex = (index: number) => {
    setCurrentIndexState(index)
  }

  const clear = () => {
    setQueueState([])
    setCurrentIndexState(0)
  }

  const value = useMemo<PlaybackQueueContextValue>(
    () => ({ queue, currentIndex, setQueue, setCurrentIndex, clear }),
    [queue, currentIndex],
  )

  return <PlaybackQueueContext.Provider value={value}>{children}</PlaybackQueueContext.Provider>
}

export function usePlaybackQueue() {
  const ctx = useContext(PlaybackQueueContext)
  if (!ctx) {
    throw new Error('usePlaybackQueue must be used within a PlaybackQueueProvider')
  }
  return ctx
}
