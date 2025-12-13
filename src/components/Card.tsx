import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-darkSurface rounded-lg shadow-md border border-lightBorder dark:border-darkBorder p-6 ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 pb-4 border-b border-lightBorder dark:border-darkBorder ${className}`}>
      {children}
    </div>
  )
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`pt-4 border-t border-lightBorder dark:border-darkBorder ${className}`}>
      {children}
    </div>
  )
}
