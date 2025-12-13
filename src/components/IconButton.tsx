import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function IconButton({
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  return (
    <button
      className={`${sizeStyles[size]} rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}
