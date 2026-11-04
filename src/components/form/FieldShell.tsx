import type { ReactNode } from 'react'

interface FieldShellProps {
  id?: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FieldShell({ id, label, error, hint, children, className = '' }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

/** Legenda de grupos de opções (radio/checkbox). */
export function GroupShell({
  label,
  error,
  hint,
  children,
  onClear,
}: {
  label: string
  error?: string
  hint?: string
  children: ReactNode
  onClear?: () => void
}) {
  return (
    <fieldset>
      <div className="mb-1 flex items-center justify-between gap-2">
        <legend className="text-sm font-medium text-slate-700">{label}</legend>
        {onClear && (
          <button type="button" onClick={onClear} className="text-xs text-slate-500 underline hover:text-slate-800">
            Limpar
          </button>
        )}
      </div>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  )
}
