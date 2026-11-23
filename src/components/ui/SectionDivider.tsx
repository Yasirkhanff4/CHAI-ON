type SectionDividerProps = {
  className?: string
}

/** Thin poster divider: a soft line with a small red diamond in the middle. */
export function SectionDivider({ className = '' }: SectionDividerProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-soft-pink" />
      <span className="h-2 w-2 rotate-45 bg-brand-red" />
      <span className="h-px flex-1 bg-soft-pink" />
    </div>
  )
}
