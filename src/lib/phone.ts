/**
 * Pakistani mobile numbers only: 03XX XXXXXXX (11 digits, local format).
 * Accepted input includes +92 300 1234567, 0092 300 1234567, 3001234567 and
 * numbers with spaces, dashes or brackets — they are normalised first.
 */
const PK_MOBILE_PATTERN = /^03\d{9}$/

/**
 * Converts user input into the local 11-digit form, or returns the digits
 * unchanged when the number cannot be interpreted as a Pakistani mobile.
 */
export function normalizePakistaniPhone(input: string): string {
  let digits = input.replace(/\D/g, '')

  if (digits.startsWith('0092')) {
    digits = digits.slice(4)
  } else if (digits.startsWith('92')) {
    digits = digits.slice(2)
  }

  // 3001234567 (national significant number without the leading zero)
  if (digits.length === 10 && digits.startsWith('3')) {
    digits = `0${digits}`
  }

  return digits
}

export function isValidPakistaniPhone(input: string): boolean {
  return PK_MOBILE_PATTERN.test(normalizePakistaniPhone(input))
}

/** Returns a human error message, or null when the number is valid. */
export function validatePakistaniPhone(input: string): string | null {
  if (!input.trim()) return 'Enter your mobile number so we can call about your order.'
  if (!isValidPakistaniPhone(input)) {
    return 'Enter a valid Pakistani mobile number, for example 0300 1234567.'
  }
  return null
}

/** 03001234567 -> 0300 1234567 */
export function formatPakistaniPhone(value: string): string {
  const digits = normalizePakistaniPhone(value)
  if (!PK_MOBILE_PATTERN.test(digits)) return value
  return `${digits.slice(0, 4)} ${digits.slice(4)}`
}

/**
 * Converts a local number to E.164 (+923001234567) for storage and for
 * future integrations such as SMS notifications.
 */
export function toE164(value: string): string {
  const digits = normalizePakistaniPhone(value)
  if (!PK_MOBILE_PATTERN.test(digits)) return value
  return `+92${digits.slice(1)}`
}
