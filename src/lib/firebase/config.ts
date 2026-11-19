/**
 * Firebase client setup.
 *
 * The web config values are public identifiers, not secrets. If they are not
 * present the app runs in local mode: the storefront, cart and checkout keep
 * working against local storage while accounts, admin and tracking show a
 * clear setup notice instead of failing silently.
 *
 * Only Authentication and Firestore are used — no Storage, no Cloud Functions
 * and no Cloud Messaging — so the project runs entirely on the free Spark plan.
 */
import { getApps, initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'

const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

const useEmulators = env.VITE_FIREBASE_USE_EMULATORS === 'true'

export class BackendUnavailableError extends Error {
  constructor() {
    super(
      'Firebase is not configured for this build. Add the VITE_FIREBASE_* variables to enable accounts, secure orders and the admin panel.',
    )
    this.name = 'BackendUnavailableError'
  }
}

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let emulatorsConnected = false

function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new BackendUnavailableError()
  if (app) return app

  app = getApps()[0] ?? initializeApp(firebaseConfig as Required<typeof firebaseConfig>)

  if (useEmulators && !emulatorsConnected) {
    emulatorsConnected = true
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
    connectAuthEmulator(authInstance, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(dbInstance, '127.0.0.1', 8080)
  }

  return app
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getApp())
  return authInstance
}

export function getDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getApp())
  return dbInstance
}
