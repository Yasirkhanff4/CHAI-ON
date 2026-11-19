import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { AuthContext, isAdminRole, isStaffRole } from '@/context/authContext'
import type { AuthProfile, AuthStatus, Role } from '@/context/authContext'
import { BackendUnavailableError, getDb, getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/config'
import { describeFirebaseError } from '@/lib/firebase/errors'

type AuthProviderProps = {
  children: ReactNode
}

/**
 * Customer and staff sessions.
 *
 * The role always comes from the Firebase ID token's custom claim — never from
 * localStorage or a field the account holder can edit. The Firestore `users`
 * document supplies the display name and phone number.
 *
 * A guest who checks out gets a short-lived anonymous session so the order has
 * an owner. Registering while that session is active links the email/password
 * credential to the same uid, so guest orders stay in the new account.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>(isFirebaseConfigured ? 'loading' : 'unconfigured')
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const loadProfile = useCallback(async (fbUser: User | null): Promise<AuthProfile | null> => {
    if (!fbUser) {
      setProfile(null)
      setStatus('ready')
      return null
    }

    try {
      if (fbUser.isAnonymous) {
        const guest: AuthProfile = {
          uid: fbUser.uid,
          email: '',
          name: 'Guest',
          phone: '',
          role: 'CUSTOMER',
          isAnonymous: true,
        }
        setProfile(guest)
        setAuthError(null)
        return guest
      }

      const token = await fbUser.getIdTokenResult()
      const claim = token.claims.role
      const role: Role =
        claim === 'ADMIN' || claim === 'SUPER_ADMIN' || claim === 'DELIVERY_STAFF'
          ? claim
          : 'CUSTOMER'

      let name = fbUser.displayName ?? ''
      let phone = ''

      try {
        const snapshot = await getDoc(doc(getDb(), 'users', fbUser.uid))
        if (snapshot.exists()) {
          const data = snapshot.data()
          if (typeof data.name === 'string' && data.name) name = data.name
          if (typeof data.phone === 'string') phone = data.phone
        }
      } catch {
        // Reading the profile can fail while offline; the session still works.
      }

      const nextProfile: AuthProfile = {
        uid: fbUser.uid,
        email: fbUser.email ?? '',
        name: name || (fbUser.email ?? '').split('@')[0],
        phone,
        role,
        isAnonymous: false,
      }

      setProfile(nextProfile)
      setAuthError(null)
      return nextProfile
    } catch (error) {
      setAuthError(describeFirebaseError(error, 'Your session could not be loaded.'))
      return null
    } finally {
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured) return

    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (fbUser) => {
        void loadProfile(fbUser)
      },
      (error) => {
        setAuthError(describeFirebaseError(error, 'Sign-in state could not be read.'))
        setStatus('ready')
      },
    )

    return unsubscribe
  }, [loadProfile])

  const register = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      if (!isFirebaseConfigured) throw new BackendUnavailableError()

      const auth = getFirebaseAuth()
      const trimmedName = name.trim()
      const trimmedEmail = email.trim().toLowerCase()
      const currentUser = auth.currentUser

      let user: User

      if (currentUser?.isAnonymous) {
        // Upgrade the guest session in place: same uid, same order history.
        const credential = EmailAuthProvider.credential(trimmedEmail, password)
        const linked = await linkWithCredential(currentUser, credential)
        user = linked.user
      } else {
        const created = await createUserWithEmailAndPassword(auth, trimmedEmail, password)
        user = created.user
      }

      await updateAuthProfile(user, { displayName: trimmedName })
      await user.getIdToken(true)

      // The default role is set here once; rules reject any other role value
      // and no customer can escalate it later.
      await setDoc(doc(getDb(), 'users', user.uid), {
        uid: user.uid,
        name: trimmedName,
        email: user.email ?? trimmedEmail,
        phone: '',
        role: 'CUSTOMER',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await loadProfile(user)
    },
    [loadProfile],
  )

  const login = useCallback(
    async (email: string, password: string): Promise<AuthProfile> => {
      if (!isFirebaseConfigured) throw new BackendUnavailableError()
      const credentials = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password)
      const nextProfile = await loadProfile(credentials.user)

      if (!nextProfile) {
        throw new Error('We could not read your account. Please try again.')
      }

      return nextProfile
    },
    [loadProfile],
  )

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured) return
    await signOut(getFirebaseAuth())
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    if (!isFirebaseConfigured) throw new BackendUnavailableError()
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim())
  }, [])

  const updateProfile = useCallback(
    async ({ name, phone }: { name: string; phone: string }) => {
      if (!isFirebaseConfigured || !profile || profile.isAnonymous) throw new BackendUnavailableError()

      await updateDoc(doc(getDb(), 'users', profile.uid), {
        name: name.trim(),
        phone: phone.trim(),
        updatedAt: serverTimestamp(),
      })

      const fbUser = getFirebaseAuth().currentUser
      if (fbUser) await updateAuthProfile(fbUser, { displayName: name.trim() })

      setProfile((current) => (current ? { ...current, name: name.trim(), phone: phone.trim() } : current))
    },
    [profile],
  )

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) return
    await loadProfile(getFirebaseAuth().currentUser)
  }, [loadProfile])

  const value = useMemo(
    () => ({
      status,
      profile,
      authError,
      isSignedIn: Boolean(profile && !profile.isAnonymous),
      isAnonymous: Boolean(profile?.isAnonymous),
      isAdmin: isAdminRole(profile?.role),
      isSuperAdmin: profile?.role === 'SUPER_ADMIN',
      isDeliveryStaff: isStaffRole(profile?.role) && profile?.role === 'DELIVERY_STAFF',
      register,
      login,
      logout,
      resetPassword,
      updateProfile,
      refresh,
    }),
    [status, profile, authError, register, login, logout, resetPassword, updateProfile, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
