type SectionDividerProps = {
  className?: string
}

/** Quiet spacer line for the rare place that needs an explicit break. */
export function SectionDivider({ className = '' }: SectionDividerProps) {
  return <div className={`h-px bg-brand-brown/10 ${className}`} aria-hidden="true" />
}
