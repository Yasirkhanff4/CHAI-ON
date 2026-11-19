import { BackendUnavailableError } from '@/lib/firebase/config'
import { OrderError } from '@/lib/orders/errors'

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'That email and password do not match. Check them and try again.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-not-found': 'No account uses that email address.',
  'auth/wrong-password': 'That password is not correct.',
  'auth/admin-restricted-operation':
    'Guest sessions are disabled for this project. Enable Anonymous sign-in in Firebase Authentication.',
  'auth/weak-password': 'Choose a stronger password — at least 6 characters.',
  'auth/missing-password': 'Enter your password.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.',
  'auth/requires-recent-login': 'Please log in again to continue.',
  'auth/user-disabled': 'This account has been disabled. Call us if you need help.',
  'auth/operation-not-allowed':
    'Email and password sign-in is not enabled for this Firebase project yet.',
}

const FIRESTORE_MESSAGES: Record<string, string> = {
  'permission-denied':
    'Your order could not be saved. Refresh the page and try again, or order on WhatsApp.',
  'unavailable': 'Network problem. Check your connection and try again.',
  'deadline-exceeded': 'The request took too long. Check your connection and retry.',
  'failed-precondition': 'That action is not possible right now.',
  'resource-exhausted': 'Too many requests. Please wait a moment and try again.',
}

const FUNCTION_MESSAGES: Record<string, string> = {
  'functions/unauthenticated': 'Please log in to continue.',
  'functions/permission-denied': 'You do not have permission to do that.',
  'functions/not-found': 'We could not find that record.',
  'functions/failed-precondition': 'That action is not possible right now.',
  'functions/resource-exhausted': 'Too many attempts. Please wait and try again.',
  'functions/invalid-argument': 'Some of the details are invalid. Check and try again.',
  'functions/deadline-exceeded': 'The request took too long. Check your connection and retry.',
  'functions/unavailable': 'The service is temporarily unavailable. Please retry.',
  'functions/internal': 'Something went wrong on our side. Please retry.',
}

function codeOf(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code
    if (typeof code === 'string') return code
  }
  return ''
}

/** Customer-safe message for any Firebase error. */
export function describeFirebaseError(error: unknown, fallback: string): string {
  if (error instanceof BackendUnavailableError) return error.message

  const code = codeOf(error)
  if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code]
  if (FIRESTORE_MESSAGES[code]) return FIRESTORE_MESSAGES[code]
  if (FUNCTION_MESSAGES[code]) return FUNCTION_MESSAGES[code]

  if (error instanceof Error && error.message) return error.message
  return fallback
}

/** Payload carried by callable function errors (`error.details`). */
export function callableDetails(error: unknown): Record<string, unknown> {
  if (typeof error === 'object' && error !== null && 'details' in error) {
    const details = (error as { details?: unknown }).details
    if (details && typeof details === 'object') return details as Record<string, unknown>
  }
  return {}
}

/** Maps a callable failure onto the checkout error type. */
export function toOrderError(error: unknown): OrderError {
  if (error instanceof OrderError) return error

  if (error instanceof BackendUnavailableError) {
    return new OrderError('UNKNOWN', error.message, { cause: error })
  }

  const code = codeOf(error)
  const details = callableDetails(error)
  const message = describeFirebaseError(error, 'We could not place your order. Please try again.')

  const fieldErrors =
    details.fieldErrors && typeof details.fieldErrors === 'object'
      ? (details.fieldErrors as Record<string, string>)
      : undefined
  const unavailableProducts = Array.isArray(details.unavailableProducts)
    ? (details.unavailableProducts as string[])
    : []

  if (
    code === 'functions/unavailable' ||
    code === 'functions/deadline-exceeded' ||
    code === 'unavailable' ||
    code === 'deadline-exceeded'
  ) {
    return new OrderError('NETWORK', message, { cause: error })
  }

  if (unavailableProducts.length > 0) {
    return new OrderError('PRODUCT_UNAVAILABLE', message, {
      cause: error,
      unavailableProducts,
    })
  }

  if (fieldErrors) {
    return new OrderError('VALIDATION', message, { cause: error, fieldErrors })
  }

  return new OrderError('UNKNOWN', message, { cause: error })
}
