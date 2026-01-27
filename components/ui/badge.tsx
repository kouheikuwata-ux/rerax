import { clsx } from 'clsx'
import { HTMLAttributes, forwardRef } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-accent-light text-accent-dark',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  muted: 'bg-calm-100 text-calm-600',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'
