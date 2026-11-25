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
  'w-full rounded-control border bg-off-white px-4 text-base text-brand-brown',
  'placeholder:text-brand-brown/35 transition duration-200 ease-smooth',
  'hover:border-brand-brown/25 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red',
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
      ? 'border-brand-red/70 focus-visible:outline-brand-red'
      : 'border-brand-brown/15 focus:border-brand-brown/40',
  ].join(' ')

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 text-[13px] font-medium text-brand-brown/80"
      >
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-brand-red" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {!required && (
          <span className="text-[12px] font-normal text-brand-brown/50">Optional</span>
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
        <p id={hintId} className="mt-1.5 text-[12px] leading-relaxed text-brand-brown/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-brand-red">
          {error}
        </p>
      )}
    </div>
  )
}
