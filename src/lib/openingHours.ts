import type { StoreSettings } from '@/data/settings'

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function minutesInKarachi(now: Date): number {
  const parts = clock.formatToParts(now)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0')
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0')
  return hour * 60 + minute
}

function parseClock(value: string, fallback: number): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return fallback
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return fallback
  return hours * 60 + minutes
}

/** Mirrors the trusted check in functions/src/order.ts, for UI messaging. */
export function isOrderingOpen(settings: StoreSettings, now: Date = new Date()): boolean {
  if (settings.isOrderingOpen === false) return false

  const current = minutesInKarachi(now)
  const open = parseClock(settings.openingTime, 9 * 60)
  const close = parseClock(settings.closingTime, 23 * 60)

  if (open === close) return true
  if (open < close) return current >= open && current < close
  return current >= open || current < close
}

/** "09:00" -> "9:00 AM" */
export function formatClock(value: string): string {
  const minutes = parseClock(value, -1)
  if (minutes < 0) return value
  const hours24 = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`
}
