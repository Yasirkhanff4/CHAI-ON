import { validatePakistaniPhone } from '@/lib/phone'
import type {
  CustomerDetails,
  CustomerDetailsErrors,
  CustomerDetailsField,
  OrderSubmissionItem,
} from '@/types/order'

/** Trims and collapses runs of whitespace so values are stored consistently. */
export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export const DETAIL_FIELD_ORDER: CustomerDetailsField[] = [
  'fullName',
  'phone',
  'building',
  'floor',
  'officeOrShop',
  'deliveryInstructions',
]

const limits = {
  fullName: { min: 2, max: 60 },
  building: { min: 2, max: 80 },
  floor: { min: 1, max: 20 },
  officeOrShop: { min: 1, max: 30 },
  deliveryInstructions: { min: 0, max: 300 },
}

function required(value: string, message: string): string | null {
  return value.length === 0 ? message : null
}

/**
 * Validates the delivery details. Runs in the browser for fast feedback and
 * again inside the order service, which is what actually writes the order.
 */
export function validateCustomerDetails(raw: CustomerDetails): CustomerDetailsErrors {
  const errors: CustomerDetailsErrors = {}
  const details = normalizeCustomerDetails(raw)

  const nameError = required(details.fullName, 'Enter the name we should ask for on delivery.')
  if (nameError) {
    errors.fullName = nameError
  } else if (details.fullName.length < limits.fullName.min) {
    errors.fullName = 'Enter your full name (at least 2 characters).'
  } else if (details.fullName.length > limits.fullName.max) {
    errors.fullName = `Keep the name under ${limits.fullName.max} characters.`
  } else if (!/[\p{L}]/u.test(details.fullName)) {
    errors.fullName = 'Enter a name using letters.'
  }

  const phoneError = validatePakistaniPhone(details.phone)
  if (phoneError) errors.phone = phoneError

  const buildingError = required(details.building, 'Enter the building or plaza name.')
  if (buildingError) {
    errors.building = buildingError
  } else if (details.building.length < limits.building.min) {
    errors.building = 'Enter the building or plaza name (at least 2 characters).'
  } else if (details.building.length > limits.building.max) {
    errors.building = `Keep the building name under ${limits.building.max} characters.`
  }

  const floorError = required(details.floor, 'Enter your floor, e.g. 3rd Floor.')
  if (floorError) {
    errors.floor = floorError
  } else if (details.floor.length > limits.floor.max) {
    errors.floor = `Keep the floor under ${limits.floor.max} characters.`
  }

  const officeError = required(details.officeOrShop, 'Enter your office or shop number.')
  if (officeError) {
    errors.officeOrShop = officeError
  } else if (details.officeOrShop.length > limits.officeOrShop.max) {
    errors.officeOrShop = `Keep the office or shop number under ${limits.officeOrShop.max} characters.`
  }

  if (details.deliveryInstructions.length > limits.deliveryInstructions.max) {
    errors.deliveryInstructions = `Keep instructions under ${limits.deliveryInstructions.max} characters.`
  }

  return errors
}

export function normalizeCustomerDetails(details: CustomerDetails): CustomerDetails {
  return {
    fullName: normalizeText(details.fullName),
    phone: normalizeText(details.phone),
    building: normalizeText(details.building),
    floor: normalizeText(details.floor),
    officeOrShop: normalizeText(details.officeOrShop),
    deliveryInstructions: normalizeText(details.deliveryInstructions),
  }
}

export function hasErrors(errors: CustomerDetailsErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Sends focus to the first field with an error. Used after a submit attempt
 * so keyboard and screen-reader users are not left at the submit button.
 */
export function focusFirstError(errors: CustomerDetailsErrors): void {
  const field = DETAIL_FIELD_ORDER.find((name) => errors[name])
  if (!field) return

  const element = document.getElementById(field)
  if (element instanceof HTMLElement) {
    element.focus()
    element.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

/**
 * Validates the cart lines the customer is submitting. This is a shape check
 * only. Quantities are clamped and prices are read server-side.
 */
export function validateSubmissionItems(items: OrderSubmissionItem[]): string | null {
  if (items.length === 0) return 'Your cart is empty.'

  for (const item of items) {
    if (typeof item.productId !== 'string' || item.productId.length === 0) {
      return 'A product in your cart is no longer available.'
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return 'Each item needs a quantity of at least 1.'
    }
  }

  return null
}
