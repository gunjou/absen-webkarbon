import { cn } from '@/components/ui'
import logoDesa from '@/assets/logo-karang-bongkot.png'

export function Logo({ ringkas = false, className }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <img src={logoDesa} alt="Logo Desa Karang Bongkot" className="h-10 w-auto shrink-0" />
      {!ringkas && (
        <div className="min-w-0 leading-tight">
          <p className="text-[11px] font-semibold tracking-wider text-fg-muted uppercase">Desa</p>
          <p className="truncate text-sm font-extrabold tracking-tight text-heading">Karang Bongkot</p>
        </div>
      )}
    </div>
  )
}
