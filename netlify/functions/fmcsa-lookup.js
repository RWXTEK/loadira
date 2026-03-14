// Netlify serverless function — proxies FMCSA API calls so the API key stays server-side

const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services'
const API_KEY = 'af364bfcf52400b1696c2d1848aa6c143d155d9c'

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    }
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    const { mcNumber, dotNumber, endpoint } = JSON.parse(event.body || '{}')

    // Validate input
    if (!mcNumber && !dotNumber) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'MC or DOT number required' }) }
    }

    // Sanitize — digits only
    const cleanNumber = (mcNumber || dotNumber).replace(/\D/g, '')
    if (!cleanNumber || cleanNumber.length > 10) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid number format' }) }
    }

    let url
    if (endpoint === 'cargo-carried' && dotNumber) {
      url = `${FMCSA_BASE}/carriers/${cleanNumber}/cargo-carried?webKey=${API_KEY}`
    } else if (endpoint === 'basics' && dotNumber) {
      url = `${FMCSA_BASE}/carriers/${cleanNumber}/basics?webKey=${API_KEY}`
    } else if (endpoint === 'carrier' && dotNumber) {
      url = `${FMCSA_BASE}/carriers/${cleanNumber}?webKey=${API_KEY}`
    } else if (mcNumber) {
      url = `${FMCSA_BASE}/carriers/docket-number/${cleanNumber}?webKey=${API_KEY}`
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) }
    }

    const res = await fetch(url)
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: `FMCSA API returned ${res.status}` }),
      }
    }

    const data = await res.json()
    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
