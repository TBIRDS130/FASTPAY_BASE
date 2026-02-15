/**
 * Script to set RedPay staging Firebase user device lists to only a33efd901e1fb676
 *
 * This script:
 * 1. Loads Firebase config from .env.staging (staging Firebase project)
 * 2. Lists all users under users/
 * 3. For each user, sets users/{emailPath}/device to { "a33efd901e1fb676": true }
 *    (replacing all other device IDs)
 *
 * Usage: node scripts/set-staging-redpay-single-device.mjs
 *        Run from DASHBOARD_REDPAY/ with .env.staging present
 */

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set } from 'firebase/database'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const TARGET_DEVICE_ID = 'a33efd901e1fb676'

// Load Firebase config from .env.staging
function loadFirebaseConfig() {
  const envFiles = ['.env.staging', '.env.local']
  for (const envFile of envFiles) {
    try {
      const envPath = join(__dirname, '..', envFile)
      const envContent = readFileSync(envPath, 'utf-8')
      const match = envContent.match(/VITE_FIREBASE_CONFIG=({.+})/)

      if (match && match[1]) {
        return JSON.parse(match[1])
      }
    } catch (_) {
      continue
    }
  }
  console.error('❌ VITE_FIREBASE_CONFIG not found in .env.staging or .env.local')
  console.error('   Make sure one exists and contains VITE_FIREBASE_CONFIG')
  process.exit(1)
}

const firebaseConfig = loadFirebaseConfig()
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

async function setStagingRedPaySingleDevice() {
  try {
    console.log(`🔍 Listing users under users/...`)
    console.log(`   Target device: ${TARGET_DEVICE_ID}\n`)

    const usersRef = ref(database, 'users')
    const usersSnapshot = await get(usersRef)

    if (!usersSnapshot.exists()) {
      console.log('⚠️  No users found under users/')
      return
    }

    const usersData = usersSnapshot.val()
    const userPaths = Object.keys(usersData)
    let updated = 0

    for (const emailPath of userPaths) {
      const userDeviceRef = ref(database, `users/${emailPath}/device`)
      await set(userDeviceRef, { [TARGET_DEVICE_ID]: true })
      updated++
      console.log(`  ✓ Set users/${emailPath}/device to only ${TARGET_DEVICE_ID}`)
    }

    console.log(`\n✨ Done: updated ${updated} user(s) to device list { ${TARGET_DEVICE_ID}: true }`)
  } catch (error) {
    console.error('\n❌ Error:', error)
    console.error('Error details:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

setStagingRedPaySingleDevice()
  .then(() => {
    console.log('\n✅ Script completed successfully\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
