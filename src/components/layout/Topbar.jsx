import { ChevronsLeft, ChevronsRight, Menu } from 'lucide-react'
import { cn, focusRing } from '@/components/ui'
import { inisial } from '@/lib/format'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const tombolIkon = cn('rounded-xl p-2.5 text-fg-muted hover:bg-surface-2 hover:text-fg', focusRing)

export function Topbar({ ciut, onToggleCiut, onOpenMobile, pengguna }) {
  const IkonCiut = ciut ? ChevronsRight : ChevronsLeft
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 bg-surface/90 px-3 backdrop-blur sm:px-4 lg:h-[72px]">
      <button type="button" onClick={onOpenMobile} aria-label="Buka menu" className={cn(tombolIkon, 'lg:hidden')}>
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className={cn('flex items-center', !ciut && 'lg:w-[232px]')}>
        <Logo ringkas={ciut} className="hidden sm:flex lg:flex" />
        <Logo ringkas className="sm:hidden" />
      </div>

      <div className="hidden lg:block">
        <button
          type="button"
          onClick={onToggleCiut}
          aria-label={ciut ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
          className={tombolIkon}
        >
          <IkonCiut className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {pengguna && (
          <div className="ml-1 flex items-center gap-3 rounded-xl py-1 pr-1 pl-1 sm:pr-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-xs font-bold text-link">
              {inisial(pengguna.nama)}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-heading">{pengguna.nama}</p>
              <p className="text-xs text-fg-muted">{pengguna.peran}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
