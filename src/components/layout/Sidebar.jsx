import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn, focusRing } from '@/components/ui'
import { NAV_GROUPS } from './nav'
import { Logo } from './Logo'

function NavItems({ ciut, onNavigate }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Menu utama">
      {NAV_GROUPS.map((grup) => (
        <div key={grup.label}>
          <p
            className={cn(
              'mb-2 px-3 text-[11px] font-semibold tracking-wider text-fg-muted uppercase',
              ciut && 'sr-only',
            )}
          >
            {grup.label}
          </p>
          <ul className="space-y-1">
            {grup.items.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  title={ciut ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition',
                      ciut && 'justify-center',
                      isActive
                        ? 'bg-accent-gradient font-semibold text-accent-fg shadow-glow'
                        : 'text-sidebar-fg hover:bg-surface-2',
                      focusRing,
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'size-[18px] shrink-0',
                          isActive ? 'text-accent-fg' : 'text-fg-muted group-hover:text-accent',
                        )}
                        aria-hidden="true"
                      />
                      <span className={cn('truncate', ciut && 'sr-only')}>{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function Sidebar({ ciut, mobileOpen, onCloseMobile }) {
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e) => e.key === 'Escape' && onCloseMobile()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen, onCloseMobile])

  return (
    <>
      {/* Desktop (lg+) */}
      <aside
        className={cn(
          'sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col bg-sidebar transition-[width] lg:top-[72px] lg:flex lg:h-[calc(100dvh-72px)]',
          ciut ? 'w-[88px]' : 'w-64',
        )}
      >
        <NavItems ciut={ciut} />
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-bahari-950/50 backdrop-blur-[2px]" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar shadow-pop">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Tutup menu"
                className={cn('rounded-xl p-2.5 text-fg-muted hover:bg-surface-2 hover:text-fg', focusRing)}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <NavItems onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  )
}
