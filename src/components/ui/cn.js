export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Cincin fokus keyboard standar untuk semua elemen interaktif
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

// Dasar semua input/select/textarea
export const fieldBase =
  'block w-full rounded-xl border border-transparent bg-surface-2 px-3.5 py-2 text-base text-fg placeholder:text-fg-muted/80 sm:text-sm transition-colors ' +
  'hover:border-border focus:outline-none focus:border-ring focus:bg-surface focus:ring-4 focus:ring-ring/15 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-transparent ' +
  'aria-[invalid=true]:border-danger-fg aria-[invalid=true]:bg-surface aria-[invalid=true]:focus:ring-danger-fg/15'
