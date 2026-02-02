// Temporary test file to diagnose blank page issue
// Replace App.tsx content with this to test

import { useState, useEffect } from 'react'

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('App mounted successfully!')
  }, [])

  if (!mounted) {
    return (
      <div
        style={{
          padding: '50px',
          background: '#000',
          color: '#fff',
          minHeight: '100vh',
          fontFamily: 'Arial',
        }}
      >
        <h1>Loading...</h1>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '50px',
        background: '#1a1a1a',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: 'Arial',
      }}
    >
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>✅ React is Working!</h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        If you see this, React is rendering correctly.
      </p>
      <p style={{ fontSize: '14px', color: '#888' }}>Check browser console (F12) for any errors.</p>
      <div
        style={{ marginTop: '30px', padding: '20px', background: '#2a2a2a', borderRadius: '8px' }}
      >
        <h2>Next Steps:</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Check browser console (F12) for errors</li>
          <li>Check Network tab for failed requests</li>
          <li>Restore original App.tsx to continue debugging</li>
        </ol>
      </div>
    </div>
  )
}

export default App
