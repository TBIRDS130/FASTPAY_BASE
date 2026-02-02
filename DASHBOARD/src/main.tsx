// CRITICAL: Import React first to ensure it's available before any other code
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/neumorphism.css'
import App from './App.tsx'
import { initTheme } from '@/lib/theme'
import { NeumorphismProvider } from '@/context/NeumorphismContext'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Initialize theme before rendering to prevent FOUC
initTheme()

createRoot(rootElement).render(
  <StrictMode>
    <NeumorphismProvider>
      <App />
    </NeumorphismProvider>
  </StrictMode>
)
