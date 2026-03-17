import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { DomainProvider } from './hooks/useDomainContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DomainProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DomainProvider>
    </BrowserRouter>
  </StrictMode>,
)
