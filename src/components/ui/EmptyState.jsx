import { AlertTriangle, RotateCw } from 'lucide-react'
import { cn } from './cn'
import { Button } from './Button'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-link">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="font-bold text-heading">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message = 'Terjadi kesalahan saat memuat data.', onRetry, className }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Gagal memuat"
      description={message}
      className={className}
      action={
        onRetry && (
          <Button variant="secondary" icon={RotateCw} onClick={onRetry}>
            Coba lagi
          </Button>
        )
      }
    />
  )
}
