import { cn } from './cn'

const VARIAN = {
  neutral: 'bg-surface-2 text-fg-muted',
  info: 'bg-accent-soft text-link',
  success: 'bg-success/10 text-success-fg',
  warning: 'bg-warning/10 text-warning-fg',
  danger: 'bg-danger/10 text-danger-fg',
}

export function Badge({ variant = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide',
        VARIAN[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
