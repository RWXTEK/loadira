// Netlify serverless function — proxies FMCSA API calls so the API key stays server-side

const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services'

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // CORS headers
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

    const apiKey = process.env.FMCSA_API_KEY
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) }
    }

    // Sanitize — digits only
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
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: `FMCSA API returned ${res.status}` }),
      }
    }

    const data = await res.json()
    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
