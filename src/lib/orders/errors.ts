import type { CustomerDetailsErrors } from '@/types/order'

export type OrderErrorCode =
  | 'VALIDATION'
  | 'PRODUCT_UNAVAILABLE'
  | 'MINIMUM_NOT_MET'
  | 'NETWORK'
  | 'STORAGE'
  | 'UNKNOWN'

type OrderErrorDetails = {
  fieldErrors?: CustomerDetailsErrors
  /** Names of products that are no longer orderable. */
  unavailableProducts?: string[]
  cause?: unknown
}

/**
 * A single error type for order placement so the checkout UI can decide what
 * to show without parsing error messages.
 */
export class OrderError extends Error {
  readonly code: OrderErrorCode
  readonly fieldErrors: CustomerDetailsErrors
  readonly unavailableProducts: string[]

  constructor(code: OrderErrorCode, message: string, details: OrderErrorDetails = {}) {
    super(message)
    this.name = 'OrderError'
    this.code = code
    this.fieldErrors = details.fieldErrors ?? {}
    this.unavailableProducts = details.unavailableProducts ?? []
    if (details.cause !== undefined) {
      this.cause = details.cause
    }
  }
}

/** Turns any thrown value into something safe to show a customer. */
export function toOrderError(error: unknown): OrderError {
  if (error instanceof OrderError) return error

  return new OrderError(
    'UNKNOWN',
    'We could not place your order just now. Please try again. Nothing has been charged.',
    { cause: error },
  )
}
