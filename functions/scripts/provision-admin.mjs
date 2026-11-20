#!/usr/bin/env node
/**
 * Secure staff provisioning. There is no public admin signup. This script is
 * the only way the first admin exists.
 *
 * It needs a Firebase service account key (Project settings → Service accounts
 * → Generate new private key). Keep that file outside the repo.
 *
 * Usage (from the project root):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json \
 *     node functions/scripts/provision-admin.mjs --email owner@chaion.pk --role SUPER_ADMIN
 *
 * Roles: SUPER_ADMIN | ADMIN | DELIVERY_STAFF | CUSTOMER
 *
 * The account is created without a password; use "Forgot password" on the
 * login page to set one. The role is written as a custom claim (the source of
 * truth for Firestore and Storage rules) and mirrored in users/{uid}.
 */
import { readFileSync } from 'node:fs'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_STAFF', 'CUSTOMER']

function arg(name) {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}

const email = (arg('email') ?? '').trim().toLowerCase()
const role = (arg('role') ?? '').trim().toUpperCase()
const name = (arg('name') ?? email.split('@')[0]).trim()

if (!email || !ALLOWED_ROLES.includes(role)) {
  console.error(
    'Usage: node functions/scripts/provision-admin.mjs --email owner@chaion.pk --role SUPER_ADMIN [--name "Owner"]',
  )
  process.exit(1)
}

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

const app = initializeApp(
  serviceAccountPath
    ? { credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8'))) }
    : { credential: applicationDefault() },
)

const auth = getAuth(app)
const db = getFirestore(app)

let user
try {
  user = await auth.getUserByEmail(email)
  console.log(`Existing account found for ${email} (${user.uid}).`)
} catch {
  user = await auth.createUser({ email, displayName: name, emailVerified: false })
  console.log(`Created account ${email} (${user.uid}). No password set yet.`)
}

await auth.setCustomUserClaims(user.uid, { role })

await db.doc(`users/${user.uid}`).set(
  {
    uid: user.uid,
    name,
    email,
    phone: '',
    role,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
)

console.log(`Role ${role} granted to ${email}.`)
console.log('The user must sign in again (or refresh their token) for the new claim to apply.')
console.log('Ask them to use "Forgot password" on the login page to set a password.')
