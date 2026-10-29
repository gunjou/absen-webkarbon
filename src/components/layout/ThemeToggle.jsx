import { Moon, Sun } from 'lucide-react'
import { cn, focusRing } from '@/components/ui'
import { useTheme } from '@/context/ThemeContext'

/** Tombol bulat untuk berganti tema terang ↔ gelap. */
export function ThemeToggle({ className }) {
  const { theme, setPilihan } = useTheme()
  const gelap = theme === 'dark'
  const Ikon = gelap ? Sun : Moon
  const label = gelap ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'

  return (
    <button
      type="button"
      onClick={() => setPilihan(gelap ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={cn('grid size-11 shrink-0 place-items-center rounded-full bg-surface text-heading shadow-card', focusRing, className)}
    >
      <Ikon className="size-5" aria-hidden="true" />
    </button>
  )
}
