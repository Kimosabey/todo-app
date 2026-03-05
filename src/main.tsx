import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'

function applyInitialTheme() {
  try {
    const raw = localStorage.getItem('todo.theme')
    const stored = raw ? (JSON.parse(raw) as unknown) : 'system'
    const theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const isDark = theme === 'dark' || (theme === 'system' && media.matches)

    document.documentElement.classList.toggle('dark', isDark)
  } catch {
    // ignore
  }
}

applyInitialTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
