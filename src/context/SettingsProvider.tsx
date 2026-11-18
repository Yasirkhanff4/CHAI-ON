import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { SettingsContext } from '@/context/settingsContext'
import { DEFAULT_STORE_SETTINGS } from '@/data/settings'
import type { StoreSettings } from '@/data/settings'
import { isFirebaseConfigured } from '@/lib/firebase/config'
import { subscribeSettings } from '@/services/settings'

type SettingsProviderProps = {
  children: ReactNode
}

/** Storefront settings managed from the admin panel. Falls back to defaults. */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [isDefault, setIsDefault] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    return subscribeSettings(
      (next) => {
        setSettings(next)
        setIsDefault(false)
        setLoading(false)
      },
      () => {
        // The storefront must keep working if settings cannot be read.
        setLoading(false)
      },
    )
  }, [])

  const value = useMemo(() => ({ settings, loading, isDefault }), [settings, loading, isDefault])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
