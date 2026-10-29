import { cn } from './cn'

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-2xl bg-surface shadow-card', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5', className)}>
      <div className="min-w-0">
        <h2 className="text-[13px] font-bold tracking-[0.06em] text-heading uppercase">{title}</h2>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('px-4 py-4 sm:px-6', className)}>{children}</div>
}

export function DetailList({ items, className }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4 sm:grid-cols-2', className)}>
      {items.filter(Boolean).map((it) => (
        <div key={it.label} className={cn(it.full && 'sm:col-span-2')}>
          <dt className="text-[11px] font-semibold tracking-wider text-fg-muted uppercase">{it.label}</dt>
          <dd className="mt-1 text-sm text-fg">{it.value ?? '–'}</dd>
        </div>
      ))}
    </dl>
  )
}
