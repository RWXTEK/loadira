import { createContext, useContext, useMemo } from 'react'

type DomainMode = 'main' | 'subdomain' | 'custom-domain'

interface DomainContextType {
  mode: DomainMode
  slug: string | null
  carrierHostname: string | null
}

const DomainContext = createContext<DomainContextType>({ mode: 'main', slug: null, carrierHostname: null })

const MAIN_DOMAINS = ['loadira.com', 'www.loadira.com', 'localhost', '127.0.0.1']
const RESERVED_SUBDOMAINS = ['www', 'app', 'api', 'admin', 'mail', 'ftp', 'staging', 'dev', 'test', 'cdn', 'assets', 'billing', 'support', 'docs', 'blog', 'status']

function parseDomain(hostname: string): DomainContextType {
  // Dev override
  const forceSubdomain = import.meta.env.VITE_FORCE_SUBDOMAIN
  if (forceSubdomain) {
    return { mode: 'subdomain', slug: forceSubdomain, carrierHostname: null }
  }

  // Localhost / main domain
  if (MAIN_DOMAINS.includes(hostname)) {
    return { mode: 'main', slug: null, carrierHostname: null }
  }

  // Localhost with port
  if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    return { mode: 'main', slug: null, carrierHostname: null }
  }

  // Netlify preview domains
  if (hostname.endsWith('.netlify.app')) {
    return { mode: 'main', slug: null, carrierHostname: null }
  }

  // *.loadira.com subdomain
  if (hostname.endsWith('.loadira.com')) {
    const sub = hostname.replace('.loadira.com', '')
    if (RESERVED_SUBDOMAINS.includes(sub)) {
      return { mode: 'main', slug: null, carrierHostname: null }
    }
    return { mode: 'subdomain', slug: sub, carrierHostname: null }
  }

  // Custom domain (anything else)
  return { mode: 'custom-domain', slug: null, carrierHostname: hostname }
}

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => parseDomain(window.location.hostname), [])

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  )
}

export function useDomainContext() {
  return useContext(DomainContext)
}
