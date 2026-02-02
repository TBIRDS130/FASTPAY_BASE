import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

/**
 * Firebase Configuration
 *
 * All Firebase configuration values MUST be loaded from environment variables.
 *
 * REQUIRED Environment Variable:
 * - VITE_FIREBASE_CONFIG: JSON string containing all Firebase config values
 *   Format: {"apiKey":"...","authDomain":"...","databaseURL":"...",...}
 *
 * Setup:
 * - Local Development: Create .env.local file with VITE_FIREBASE_CONFIG variable
 * - Production: Set VITE_FIREBASE_CONFIG in your hosting platform's environment variables
 *
 * NOTE: Firebase client-side API keys are public by design (they're restricted
 * by Firebase Security Rules, not by keeping them secret). Using environment
 * variables allows different Firebase projects for different environments.
 */

// Get Firebase configuration from environment variable
const getFirebaseConfig = () => {
  const firebaseConfigString = import.meta.env.VITE_FIREBASE_CONFIG

  // Validate that VITE_FIREBASE_CONFIG is set
  if (!firebaseConfigString) {
    const errorMessage =
      `❌ Firebase configuration error: Missing required environment variable: VITE_FIREBASE_CONFIG\n\n` +
      `Setup Instructions:\n` +
      `  1. Create .env.local file in the project root\n` +
      `  2. Add VITE_FIREBASE_CONFIG with your Firebase config as JSON string\n` +
      `  3. See .env.example for the required format\n` +
      `  4. See ENV_SETUP.md for detailed instructions\n\n` +
      `Example:\n` +
      `  VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","databaseURL":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}\n\n` +
      `For production, set VITE_FIREBASE_CONFIG in your hosting platform's environment variables.`

    console.error(errorMessage)
    throw new Error(
      `Firebase configuration incomplete: VITE_FIREBASE_CONFIG environment variable is required. See console for details.`
    )
  }

  // Parse JSON string to Firebase config object
  try {
    // Trim whitespace and remove any newlines that might have been introduced
    const cleanedConfigString = firebaseConfigString.trim().replace(/\n/g, '').replace(/\r/g, '')
    
    // Validate that it looks like JSON (starts with { and ends with })
    if (!cleanedConfigString.startsWith('{') || !cleanedConfigString.endsWith('}')) {
      throw new Error(
        `Invalid JSON format: VITE_FIREBASE_CONFIG must be a complete JSON object. ` +
        `Received value starts with: "${cleanedConfigString.substring(0, 20)}..." ` +
        `(Expected JSON object like {"apiKey":"..."})`
      )
    }

    const config = JSON.parse(cleanedConfigString) as {
      apiKey: string
      authDomain: string
      databaseURL: string
      projectId: string
      storageBucket: string
      messagingSenderId: string
      appId: string
    }

    // Validate that all required fields are present
    const requiredFields = [
      'apiKey',
      'authDomain',
      'databaseURL',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
    ]
    const missingFields = requiredFields.filter(field => !config[field as keyof typeof config])

    if (missingFields.length > 0) {
      const errorMessage =
        `❌ Firebase configuration error: Missing required fields in VITE_FIREBASE_CONFIG:\n${missingFields.map(f => `  - ${f}`).join('\n')}\n\n` +
        `Please ensure your VITE_FIREBASE_CONFIG JSON contains all required fields.`

      console.error(errorMessage)
      throw new Error(
        `Firebase configuration incomplete: Missing ${missingFields.length} required field(s). See console for details.`
      )
    }

    return config
  } catch (parseError) {
    // Show first 100 characters of the actual value for debugging
    const previewValue = firebaseConfigString.substring(0, 100)
    const errorMessage =
      `❌ Firebase configuration error: Failed to parse VITE_FIREBASE_CONFIG as JSON.\n\n` +
      `Error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}\n\n` +
      `Received value (first 100 chars): "${previewValue}${firebaseConfigString.length > 100 ? '...' : ''}"\n\n` +
      `⚠️ IMPORTANT: VITE_FIREBASE_CONFIG must be a SINGLE LINE in your .env.local file.\n` +
      `Multi-line JSON is not supported in environment variables.\n\n` +
      `Please ensure VITE_FIREBASE_CONFIG is a valid JSON string on ONE line.\n` +
      `Example format:\n` +
      `  VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","databaseURL":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}`

    console.error(errorMessage)
    throw new Error(
      `Firebase configuration parse error: Invalid JSON format. See console for details.`
    )
  }
}

const firebaseConfig = getFirebaseConfig()

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database
export const database = getDatabase(app)
export const storage = getStorage(app)

export default app
