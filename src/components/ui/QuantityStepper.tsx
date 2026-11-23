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
  const buttonSize = 'h-10 w-10'
  const valueWidth = isSmall ? 'min-w-7 text-[13px]' : 'min-w-8 text-sm'

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-xl border border-brand-brown/15 bg-off-white"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className={`inline-flex ${buttonSize} items-center justify-center rounded-l-[9px] text-brand-brown transition hover:bg-soft-pink disabled:pointer-events-none disabled:opacity-35`}
      >
        <Minus className={isSmall ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className={`${valueWidth} text-center font-semibold tabular-nums text-brand-brown`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className={`inline-flex ${buttonSize} items-center justify-center rounded-r-[9px] text-brand-brown transition hover:bg-soft-pink disabled:pointer-events-none disabled:opacity-35`}
      >
        <Plus className={isSmall ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      </button>
    </div>
  )
}
