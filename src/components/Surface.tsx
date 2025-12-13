import React from 'react'

interface SurfaceProps {
  children: React.ReactNode
  variant?: 'elevated' | 'tonal' | 'flat'
  className?: string
}

export function Surface({ children, variant = 'flat', className = '' }: SurfaceProps) {
  const variantStyles = {
    elevated: 'bg-surface-light dark:bg-surface-dark shadow-lg border border-border-light dark:border-border-dark',
    tonal: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark',
    flat: 'bg-transparent',
  }

  return (
    <div className={`${variantStyles[variant]} rounded-lg p-4 ${className}`}>
      {children}
    </div>
  )
}
