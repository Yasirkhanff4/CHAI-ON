import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { getDb, isFirebaseConfigured } from '@/lib/firebase/config'

/**
 * Live new-order signal for the admin header.
 *
 * Firestore's onSnapshot (no server polling, no Cloud Functions) watches up to
 * 20 NEW orders. A new id plays a two-tone Web Audio beep and prefixes the tab
 * title with "(n) New Orders". Browsers block audio until a gesture, so the
 * admin taps "Enable sound" once; the count badge still works without it.
 */
export function NewOrderAlerts() {
  const [soundOn, setSoundOn] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const soundRef = useRef(false)
  const knownRef = useRef<Set<string> | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const previousTitleRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    const newOrdersQuery = query(
      collection(getDb(), 'orders'),
      where('orderStatus', '==', 'NEW'),
      orderBy('createdAt', 'desc'),
      limit(20),
    )

    const unsubscribe = onSnapshot(
      newOrdersQuery,
      (snapshot) => {
        const ids = new Set(snapshot.docs.map((entry) => entry.id))
        const known = knownRef.current
        knownRef.current = ids

        // First snapshot is the existing backlog, not "new" orders.
        if (!known) return

        let arrived = 0
        ids.forEach((id) => {
          if (!known.has(id)) arrived += 1
        })
        if (arrived === 0) return

        setNewCount((current) => current + arrived)
        if (soundRef.current) playChime(audioRef.current)
      },
      () => {
        // A failed listener leaves the header badge at zero; orders still work.
      },
    )

    return unsubscribe
  }, [])

  // Only touch the title while there is something to announce, then put the
  // page's own title back. This keeps every admin page title intact.
  useEffect(() => {
    if (newCount > 0) {
      if (previousTitleRef.current === null) previousTitleRef.current = document.title
      document.title = `(${newCount}) New Orders · CHAI ON Admin`
    } else if (previousTitleRef.current !== null) {
      document.title = previousTitleRef.current
      previousTitleRef.current = null
    }
  }, [newCount])

  useEffect(() => {
    return () => {
      void audioRef.current?.close().catch(() => undefined)
      audioRef.current = null
    }
  }, [])

  const enableSound = async () => {
    try {
      const AudioCtor = window.AudioContext ?? window.webkitAudioContext
      if (!AudioCtor) return

      if (!audioRef.current) audioRef.current = new AudioCtor()
      await audioRef.current.resume()
      soundRef.current = true
      setSoundOn(true)
      playChime(audioRef.current)
    } catch {
      soundRef.current = false
      setSoundOn(false)
    }
  }

  const dismiss = () => setNewCount(0)

  return (
    <div className="flex items-center gap-2">
      {newCount > 0 && (
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-400 px-3 text-[12px] font-semibold text-forest-950 transition hover:bg-gold-300"
          title="Clear the new-order count"
        >
          <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
          {newCount} new
        </button>
      )}
      <button
        type="button"
        onClick={() => void enableSound()}
        disabled={soundOn}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cream-50/20 px-3 text-[12px] font-medium text-cream-100 transition hover:bg-cream-50/10 disabled:opacity-70"
      >
        {soundOn ? (
          <Bell className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <BellOff className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{soundOn ? 'Sound on' : 'Enable sound'}</span>
      </button>
    </div>
  )
}

/** Short two-tone chime, synthesised — no audio file, no external service. */
function playChime(context: AudioContext | null) {
  if (!context || context.state !== 'running') return

  try {
    const start = context.currentTime
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
    gain.connect(context.destination)

    ;[880, 1174.7].forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(gain)
      oscillator.start(start + index * 0.16)
      oscillator.stop(start + 0.2 + index * 0.16)
    })
  } catch {
    // Audio is a convenience; the count badge still warns the admin.
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
