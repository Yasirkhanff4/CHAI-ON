import { Minus, Plus } from 'lucide-react'

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  /** Describes what is being counted, e.g. "Karak Chai quantity" (screen readers). */
  label: string
  min?: number
  max?: number
  size?: 'sm' | 'md'
}

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 99,
  size = 'md',
}: QuantityStepperProps) {
  const isSmall = size === 'sm'
  const buttonSize = isSmall ? 'h-10 w-10' : 'h-11 w-11'
  const valueWidth = isSmall ? 'min-w-8 text-[13px]' : 'min-w-10 text-sm'

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full border border-forest-900/15 bg-cream-50 p-0.5"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className={`inline-flex ${buttonSize} items-center justify-center rounded-full text-forest-900 transition hover:bg-cream-200 disabled:pointer-events-none disabled:opacity-35`}
      >
        <Minus className={isSmall ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className={`${valueWidth} text-center font-semibold tabular-nums text-forest-900`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className={`inline-flex ${buttonSize} items-center justify-center rounded-full text-forest-900 transition hover:bg-cream-200 disabled:pointer-events-none disabled:opacity-35`}
      >
        <Plus className={isSmall ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      </button>
    </div>
  )
}
