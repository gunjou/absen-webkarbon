import { cn, focusRing } from './cn'

export function SegmentedControl({ label, options, value, onChange, size = 'md', className }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex gap-1 rounded-xl bg-surface-2 p-1', className)}>
      {options.map((o) => {
        const aktif = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={aktif}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition',
              size === 'sm' ? 'h-8' : 'h-9',
              aktif ? 'bg-accent-gradient text-accent-fg shadow-glow' : 'text-fg-muted hover:text-fg',
              focusRing,
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
