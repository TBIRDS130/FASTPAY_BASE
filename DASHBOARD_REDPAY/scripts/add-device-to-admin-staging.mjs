/**
 * Add device a33efd901e1fb676 to admin@fastpay.com in staging Firebase
 *
 * Usage: node scripts/add-device-to-admin-staging.mjs
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set } from 'firebase/database'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DEVICE_ID = 'a33efd901e1fb676'
const ADMIN_EMAIL = 'admin@fastpay.com'
const ADMIN_EMAIL_PATH = ADMIN_EMAIL.replace(/\./g, "'dot'")

function loadFirebaseConfig() {
  for (const envFile of ['.env.staging', '.env.local']) {
    try {
      const envPath = join(__dirname, '..', envFile)
      const envContent = readFileSync(envPath, 'utf-8')
      const match = envContent.match(/VITE_FIREBASE_CONFIG=({.+})/)
      if (match && match[1]) return JSON.parse(match[1])
    } catch (_) {}
  }
  console.error('❌ VITE_FIREBASE_CONFIG not found in .env.staging or .env.local')
  process.exit(1)
}

const app = initializeApp(loadFirebaseConfig())
const database = getDatabase(app)

async function run() {
  const userDeviceRef = ref(database, `users/${ADMIN_EMAIL_PATH}/device`)
  await set(userDeviceRef, { [DEVICE_ID]: true })
  console.log(`✅ Added device ${DEVICE_ID} to ${ADMIN_EMAIL} (staging Firebase)`)
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
