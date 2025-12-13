import React from 'react'

interface SurfaceProps {
  children: React.ReactNode
  variant?: 'elevated' | 'tonal' | 'flat'
  className?: string
}

export function Surface({ children, variant = 'flat', className = '' }: SurfaceProps) {
  const variantStyles = {
    elevated: 'bg-white dark:bg-darkSurface shadow-lg border border-lightBorder dark:border-darkBorder',
    tonal: 'bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder',
    flat: 'bg-transparent',
  }

  return (
    <div className={`${variantStyles[variant]} rounded-lg p-4 ${className}`}>
      {children}
    </div>
  )
}
