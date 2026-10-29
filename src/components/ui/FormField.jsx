import { Children, cloneElement, isValidElement, useId } from 'react'
import { cn } from './cn'

/**
 * Membungkus satu kontrol form: label, hint, pesan error.
 * Otomatis menghubungkan id, aria-invalid, dan aria-describedby ke anak.
 */
export function FormField({ label, required, error, hint, className, children }) {
  const id = useId()
  const idHint = hint ? `${id}-hint` : undefined
  const idError = error ? `${id}-error` : undefined
  const pesan = typeof error === 'string' ? error : error?.message

  const anak = Children.only(children)
  const kontrol = isValidElement(anak)
    ? cloneElement(anak, {
        id: anak.props.id ?? id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': [idError, idHint].filter(Boolean).join(' ') || undefined,
        'aria-required': required || undefined,
      })
    : anak

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={anak.props?.id ?? id} className="block text-sm font-semibold text-fg">
          {label}
          {required && (
            <span className="ml-0.5 text-danger-fg" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {kontrol}
      {pesan && (
        <p id={idError} className="text-sm text-danger-fg">
          {pesan}
        </p>
      )}
      {hint && (
        <p id={idHint} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
