import { cn } from './cn'

export function StatCard({ label, value, icon: Icon, hint, className }) {
  return (
    <div className={cn('rounded-2xl bg-surface p-4 shadow-card sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-wider text-fg-muted uppercase">{label}</p>
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-link">
            <Icon className="size-5" aria-hidden="true" />
          </div>
        )}
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-accent tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </div>
  )
}
