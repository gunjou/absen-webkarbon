import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from './cn'

const VARIAN = {
  danger: { kelas: 'bg-danger/10 text-danger-fg', ikon: AlertCircle },
  warning: { kelas: 'bg-warning/10 text-warning-fg', ikon: AlertTriangle },
  info: { kelas: 'bg-accent-soft text-link', ikon: Info },
  neutral: { kelas: 'bg-surface-2 text-fg-muted', ikon: Info },
}

export function Alert({ variant = 'danger', className, children }) {
  const { kelas, ikon: Ikon } = VARIAN[variant]
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm', kelas, className)}
    >
      <Ikon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
