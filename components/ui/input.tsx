'use client'

import { clsx } from 'clsx'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-lg border bg-white px-3 py-2 text-sm',
          'placeholder:text-calm-400',
          'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
          'disabled:cursor-not-allowed disabled:bg-calm-50 disabled:opacity-50',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30'
            : 'border-calm-200 hover:border-calm-300',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
