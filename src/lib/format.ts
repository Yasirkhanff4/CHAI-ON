const pkrFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 0,
})

/** Formats an amount in Pakistani Rupees, e.g. 1500 -> "Rs 1,500" */
export function formatPKR(amount: number): string {
  return `Rs ${pkrFormatter.format(amount)}`
}
