import { useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { cn, fieldBase, focusRing } from './cn'

export function Input({ className, ref, ...props }) {
  return <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...props} />
}

export function Textarea({ className, ref, rows = 3, ...props }) {
  return <textarea ref={ref} rows={rows} className={cn(fieldBase, 'py-2.5', className)} {...props} />
}

export function Select({ className, ref, options = [], placeholder, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select ref={ref} className={cn(fieldBase, 'h-11 appearance-none pr-10')} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden="true"
      />
    </div>
  )
}

export function PasswordInput({ className, ref, ...props }) {
  const [lihat, setLihat] = useState(false)
  const Ikon = lihat ? EyeOff : Eye
  return (
    <div className={cn('relative', className)}>
      <Input ref={ref} type={lihat ? 'text' : 'password'} className="pr-12" {...props} />
      <button
        type="button"
        onClick={() => setLihat((v) => !v)}
        aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        className={cn(
          'absolute top-1/2 right-1.5 -translate-y-1/2 rounded-lg p-2 text-fg-muted hover:text-fg',
          focusRing,
        )}
      >
        <Ikon className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
