// Netlify serverless function — proxies FMCSA API calls server-side

const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services'
const ALLOWED_ORIGIN = 'https://loadira.com'

// Server-side rate limiting: per-IP, 10 requests per minute
const ipRequestMap = new Map()
const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 10

function checkServerRateLimit(ip) {
  const now = Date.now()
  const entry = ipRequestMap.get(ip) || { timestamps: [] }

  // Purge old entries periodically
  if (ipRequestMap.size > 10000) ipRequestMap.clear()

  entry.timestamps = entry.timestamps.filter(t => t > now - RATE_LIMIT_WINDOW)
  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return false
  }
  entry.timestamps.push(now)
  ipRequestMap.set(ip, entry)
  return true
}

function corsHeaders(origin) {
  const isAllowed = !origin
    || origin === ALLOWED_ORIGIN
    || origin?.startsWith('http://localhost')
    || (origin?.startsWith('https://') && origin.endsWith('.loadira.com'))
  // For custom domains, we allow any HTTPS origin (the profile pages need FMCSA data)
  // The function itself doesn't expose sensitive data — only public FMCSA info
  const allowedOrigin = isAllowed ? (origin || ALLOWED_ORIGIN) : (origin?.startsWith('https://') ? origin : ALLOWED_ORIGIN)
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
}

export async function handler(event) {
  const origin = event.headers.origin || event.headers.Origin || ''
  const headers = corsHeaders(origin)

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS' },
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Server-side rate limit
  const clientIp = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || event.headers['client-ip'] || 'unknown'
  if (!checkServerRateLimit(clientIp)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }) }
  }

  // API key from environment variable
  const apiKey = process.env.FMCSA_API_KEY
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Service configuration error' }) }
  }

  try {
    const { mcNumber, dotNumber, endpoint } = JSON.parse(event.body || '{}')

    if (!mcNumber && !dotNumber) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'MC or DOT number required' }) }
    }

    const cleanNumber = (mcNumber || dotNumber).replace(/\D/g, '')
    if (!cleanNumber || cleanNumber.length > 10) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid number format' }) }
    }

    let url
    if (endpoint === 'cargo-carried' && dotNumber) {
      url = `${FMCSA_BASE}/carriers/${cleanNumber}/cargo-carried?webKey=${apiKey}`
    } else if (endpoint === 'basics' && dotNumber) {
      url = `${FMCSA_BASE}/carriers/${cleanNumber}/basics?webKey=${apiKey}`
    } else if (endpoint === 'carrier' && dotNumber) {
      url = `${FMCSA_BASE}/carriers/${cleanNumber}?webKey=${apiKey}`
    } else if (mcNumber) {
      url = `${FMCSA_BASE}/carriers/docket-number/${cleanNumber}?webKey=${apiKey}`
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }
    }

    const res = await fetch(url)
    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ error: 'Carrier lookup failed' }) }
    }

    const data = await res.json()
    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
