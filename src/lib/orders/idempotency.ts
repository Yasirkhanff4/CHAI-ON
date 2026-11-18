const REQUEST_KEY_STORAGE = 'chai-on:checkout-request:v1'

function newKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * One request key per checkout attempt, kept in sessionStorage so a page
 * reload mid-submit still retries with the same key and cannot create a
 * duplicate order. Cleared after a successful order.
 */
export function getCheckoutRequestKey(): string {
  try {
    const stored = window.sessionStorage.getItem(REQUEST_KEY_STORAGE)
    if (stored) return stored

    const created = newKey()
    window.sessionStorage.setItem(REQUEST_KEY_STORAGE, created)
    return created
  } catch {
    return newKey()
  }
}

export function resetCheckoutRequestKey(): void {
  try {
    window.sessionStorage.removeItem(REQUEST_KEY_STORAGE)
  } catch {
    // Session storage can be unavailable; the key is then per page load only.
  }
}
