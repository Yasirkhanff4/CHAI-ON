const pkrFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
})

/** Formats an amount in Pakistani Rupees, e.g. 1500 -> "Rs 1,500" */
export function formatPKR(amount: number): string {
  return `Rs ${pkrFormatter.format(amount)}`
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-PK', {
  timeZone: 'Asia/Karachi',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/** Formats an ISO timestamp in Pakistan Standard Time, e.g. "18 Nov 2026, 4:05 PM" */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return dateTimeFormatter.format(date)
}
