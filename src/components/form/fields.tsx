import { Controller, get, useFormContext, type FieldPath } from 'react-hook-form'
import type { NotificationFormInput } from '../../features/notification/notification.schema'
import type { Option } from '../../features/notification/notification.options'
import { FieldShell, GroupShell } from './FieldShell'

export type FieldName = FieldPath<NotificationFormInput>

const useFieldError = (name: FieldName): string | undefined => {
  const {
    formState: { errors },
  } = useFormContext<NotificationFormInput>()
  const err = get(errors, name) as { message?: string } | undefined
  return err?.message
}

const idOf = (name: string) => name.replace(/\./g, '-')

/* ───────────── Texto / data / máscara ───────────── */

interface TextFieldProps {
  name: FieldName
  label: string
  /** Máscara/normalizador aplicado a cada alteração. */
  mask?: (value: string) => string
  type?: 'text' | 'date' | 'tel'
  inputMode?: 'text' | 'numeric' | 'tel'
  placeholder?: string
  hint?: string
  maxLength?: number
  className?: string
  autoComplete?: string
}

export function TextField({
  name,
  label,
  mask,
  type = 'text',
  inputMode,
  placeholder,
  hint,
  maxLength,
  className,
  autoComplete = 'off',
}: TextFieldProps) {
  const { control } = useFormContext<NotificationFormInput>()
  const error = useFieldError(name)
  return (
    <FieldShell id={idOf(name)} label={label} error={error} hint={hint} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input
            id={idOf(name)}
            ref={field.ref}
            name={field.name}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            placeholder={placeholder}
            maxLength={maxLength}
            value={typeof field.value === 'string' ? field.value : ''}
            onBlur={field.onBlur}
            onChange={(e) => field.onChange(mask ? mask(e.target.value) : e.target.value)}
            aria-invalid={error ? true : undefined}
            className={`input ${error ? 'input-error' : ''}`}
          />
        )}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  name,
  label,
  hint,
  maxLength,
  rows = 4,
}: {
  name: FieldName
  label: string
  hint?: string
  maxLength?: number
  rows?: number
}) {
  const { control } = useFormContext<NotificationFormInput>()
  const error = useFieldError(name)
  return (
    <FieldShell id={idOf(name)} label={label} error={error} hint={hint}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = typeof field.value === 'string' ? field.value : ''
          return (
            <>
              <textarea
                id={idOf(name)}
                ref={field.ref}
                rows={rows}
                maxLength={maxLength}
                value={value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                className={`input resize-y ${error ? 'input-error' : ''}`}
              />
              {maxLength && (
                <p className="mt-1 text-right text-xs text-slate-400">
                  {value.length}/{maxLength}
                </p>
              )}
            </>
          )
        }}
      />
    </FieldShell>
  )
}

export function SelectField({
  name,
  label,
  options,
  placeholder = 'Selecione',
  className,
}: {
  name: FieldName
  label: string
  options: readonly string[]
  placeholder?: string
  className?: string
}) {
  const { control } = useFormContext<NotificationFormInput>()
  const error = useFieldError(name)
  return (
    <FieldShell id={idOf(name)} label={label} error={error} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <select
            id={idOf(name)}
            ref={field.ref}
            value={typeof field.value === 'string' ? field.value : ''}
            onBlur={field.onBlur}
            onChange={field.onChange}
            className={`input ${error ? 'input-error' : ''}`}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
      />
    </FieldShell>
  )
}

/* ───────────── Sim / Não (boolean) ───────────── */

export function YesNoField({
  name,
  label,
  onChange,
}: {
  name: FieldName
  label: string
  /** Efeito colateral (ex.: limpar campos dependentes). */
  onChange?: (value: boolean | undefined) => void
}) {
  const { control } = useFormContext<NotificationFormInput>()
  const error = useFieldError(name)
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const set = (v: boolean | undefined) => {
          field.onChange(v)
          onChange?.(v)
        }
        return (
          <GroupShell label={label} error={error} onClear={field.value === undefined ? undefined : () => set(undefined)}>
            <div className="flex gap-4">
              {([true, false] as const).map((v) => (
                <label key={String(v)} className="inline-flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={field.name}
                    checked={field.value === v}
                    onChange={() => set(v)}
                    className="h-4 w-4 accent-teal-700"
                  />
                  {v ? 'Sim' : 'Não'}
                </label>
              ))}
            </div>
          </GroupShell>
        )
      }}
    />
  )
}

/* ───────────── Escolha única ───────────── */

export function RadioGroupField({
  name,
  label,
  options,
  columns = 1,
  onChange,
}: {
  name: FieldName
  label: string
  options: readonly Option[]
  columns?: 1 | 2 | 3
  onChange?: (value: string | undefined) => void
}) {
  const { control } = useFormContext<NotificationFormInput>()
  const error = useFieldError(name)
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns]
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const set = (v: string | undefined) => {
          field.onChange(v)
          onChange?.(v)
        }
        const current = typeof field.value === 'string' ? field.value : undefined
        return (
          <GroupShell label={label} error={error} onClear={current ? () => set(undefined) : undefined}>
            <div className={`grid grid-cols-1 gap-x-4 gap-y-1.5 ${cols}`}>
              {options.map((o) => (
                <label key={o.value} className="inline-flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name={field.name}
                    value={o.value}
                    checked={current === o.value}
                    onChange={() => set(o.value)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-teal-700"
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </GroupShell>
        )
      }}
    />
  )
}

/* ───────────── Seleção múltipla ───────────── */

export function CheckboxGroupField({
  name,
  label,
  options,
  columns = 1,
  hint,
}: {
  name: FieldName
  label: string
  options: readonly Option[]
  columns?: 1 | 2 | 3
  hint?: string
}) {
  const { control } = useFormContext<NotificationFormInput>()
  const error = useFieldError(name)
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns]
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = Array.isArray(field.value) ? (field.value as string[]) : []
        const toggle = (value: string) =>
          field.onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
        return (
          <GroupShell label={label} error={error} hint={hint}>
            <div className={`grid grid-cols-1 gap-x-4 gap-y-1.5 ${cols}`}>
              {options.map((o) => (
                <label key={o.value} className="inline-flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.value)}
                    onChange={() => toggle(o.value)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-teal-700"
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </GroupShell>
        )
      }}
    />
  )
}
