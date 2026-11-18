import { createContext, useContext } from 'react'
import type { StoreSettings } from '@/data/settings'

export type SettingsContextValue = {
  settings: StoreSettings
  loading: boolean
  /** True when the values are the built-in launch defaults. */
  isDefault: boolean
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)

export function useStoreSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useStoreSettings must be used inside a SettingsProvider')
  return context
}
