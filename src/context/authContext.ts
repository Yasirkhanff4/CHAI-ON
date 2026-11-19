import { createContext, useContext } from 'react'

export const ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'DELIVERY_STAFF'] as const
export type Role = (typeof ROLES)[number]

export type AuthProfile = {
  uid: string
  email: string
  name: string
  phone: string
  role: Role
  /** True for the short-lived session a guest gets at checkout. */
  isAnonymous: boolean
}

export type AuthStatus = 'loading' | 'ready' | 'unconfigured'

export type AuthContextValue = {
  status: AuthStatus
  profile: AuthProfile | null
  /** Set when the session could not be read; the site keeps working. */
  authError: string | null
  /** True for the short-lived anonymous session a guest gets at checkout. */
  isAnonymous: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  isDeliveryStaff: boolean
  login: (email: string, password: string) => Promise<AuthProfile>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}

/** Admins and delivery staff share one admin panel; customers never do. */
export function isAdminRole(role: Role | null | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export function isStaffRole(role: Role | null | undefined): boolean {
  return isAdminRole(role) || role === 'DELIVERY_STAFF'
}
