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
  'w-full rounded-[10px] border bg-cream-50 px-3.5 text-base text-forest-900',
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
      : 'border-forest-900/15 focus:border-forest-900/40',
  ].join(' ')

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 text-[13px] font-medium text-forest-900/80"
      >
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-tea-600" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {!required && (
          <span className="text-[12px] font-normal text-forest-900/50">Optional</span>
        )}
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
          className={`${controlStyle} mt-1.5 resize-y py-2.5 leading-relaxed`}
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
          className={`${controlStyle} mt-1.5`}
        />
      )}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[12px] leading-relaxed text-forest-900/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
