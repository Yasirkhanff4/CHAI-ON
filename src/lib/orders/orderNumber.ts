/**
 * Human-readable order numbers: CO-YYMMDD-XXXX
 * e.g. CO-261118-7K4Q
 *
 * The date uses Asia/Karachi (the business timezone) and the suffix avoids
 * characters that are easy to misread over the phone (0/O, 1/I).
 */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const SUFFIX_LENGTH = 4

const karachiDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
})

function randomSuffix(): string {
  const bytes = new Uint8Array(SUFFIX_LENGTH)

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  let suffix = ''
  for (const byte of bytes) {
    suffix += ALPHABET[byte % ALPHABET.length]
  }
  return suffix
}

export function generateOrderNumber(now: Date = new Date()): string {
  const parts = karachiDate.formatToParts(now)
  const year = parts.find((part) => part.type === 'year')?.value ?? '00'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'

  return `CO-${year}${month}${day}-${randomSuffix()}`
}

/** Normalises typed input so pasted numbers with spaces still match. */
export function normalizeOrderNumber(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase()
}
