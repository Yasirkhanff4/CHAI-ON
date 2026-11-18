import type { InputHTMLAttributes } from 'react'

type FormFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  required?: boolean
  multiline?: boolean
  rows?: number
  className?: string
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'type'
  | 'placeholder'
  | 'autoComplete'
  | 'inputMode'
  | 'maxLength'
  | 'disabled'
> & {
  /** Called when the field loses focus, e.g. for field-level validation. */
  onBlur?: () => void
}

const controlClasses = [
  'w-full rounded-2xl border bg-cream-50 px-4 text-[14.5px] text-forest-900',
  'placeholder:text-forest-900/40 transition',
  'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500',
].join(' ')

export function FormField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  multiline = false,
  rows = 3,
  className = '',
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  disabled,
  onBlur,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const controlStyle = [
    controlClasses,
    'h-12',
    error
      ? 'border-red-500/70 focus-visible:outline-red-600'
      : 'border-forest-900/15 focus:border-forest-900/30',
  ].join(' ')

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-forest-900/70"
      >
        <span>
          {label}
          {required && (
            <span className="ml-1 text-tea-500" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {!required && <span className="text-[10px] font-medium tracking-normal text-forest-900/45">Optional</span>}
      </label>

      {multiline ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => onBlur?.()}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${controlStyle} mt-2 resize-y py-3 leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => onBlur?.()}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${controlStyle} mt-2`}
        />
      )}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[11.5px] leading-relaxed text-forest-900/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[12px] font-medium leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
