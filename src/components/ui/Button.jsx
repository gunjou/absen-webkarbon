import { Link } from 'react-router-dom'
import { cn, focusRing } from './cn'
import { Spinner } from './Spinner'

const VARIAN = {
  primary: 'bg-accent-gradient text-accent-fg shadow-glow hover:brightness-110',
  secondary: 'bg-surface-2 text-fg hover:bg-border/70',
  ghost: 'text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white shadow-[0_6px_16px_-6px_rgb(185_28_28/0.55)] hover:brightness-110',
}

const UKURAN = {
  md: 'h-11 px-5 text-sm gap-2',
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  icon: 'size-10',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled,
  to,
  type = 'button',
  className,
  children,
  ...props
}) {
  const kelas = cn(
    'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition',
    'disabled:pointer-events-none disabled:opacity-60',
    VARIAN[variant],
    UKURAN[size],
    focusRing,
    className,
  )
  const isi = (
    <>
      {loading ? <Spinner /> : Icon && <Icon className="size-4" aria-hidden="true" />}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={kelas} {...props}>
        {isi}
      </Link>
    )
  }

  return (
    <button type={type} className={kelas} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {isi}
    </button>
  )
}
