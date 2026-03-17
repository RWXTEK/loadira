// Netlify function to add/remove custom domains via Netlify API
// Requires NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID env vars

const NETLIFY_API = 'https://api.netlify.com/api/v1'

function corsHeaders(origin) {
  const allowed = !origin || origin === 'https://loadira.com' || origin?.startsWith('http://localhost')
  return {
    'Access-Control-Allow-Origin': allowed ? (origin || 'https://loadira.com') : 'https://loadira.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

export async function handler(event) {
  const origin = event.headers.origin || ''
  const headers = corsHeaders(origin)

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS' } }
  }

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const authToken = process.env.NETLIFY_AUTH_TOKEN
  const siteId = process.env.NETLIFY_SITE_ID
  if (!authToken || !siteId) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Domain provisioning not configured' }) }
  }

  try {
    const { domain } = JSON.parse(event.body || '{}')

    if (!domain || typeof domain !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Domain required' }) }
    }

    // Sanitize domain
    const cleanDomain = domain.toLowerCase().replace(/[^a-z0-9.-]/g, '')
    if (!cleanDomain || cleanDomain.length > 253 || !cleanDomain.includes('.')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid domain format' }) }
    }

    // Block loadira.com subdomains from being added as custom domains
    if (cleanDomain.endsWith('.loadira.com') || cleanDomain === 'loadira.com') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Cannot use loadira.com as custom domain' }) }
    }

    if (event.httpMethod === 'POST') {
      // Add domain to Netlify site
      const res = await fetch(`${NETLIFY_API}/sites/${siteId}/domains`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostname: cleanDomain }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        // Domain might already exist, which is fine
        if (res.status === 422 && err.message?.includes('already')) {
          return { statusCode: 200, headers, body: JSON.stringify({ status: 'already_exists', domain: cleanDomain }) }
        }
        return { statusCode: res.status, headers, body: JSON.stringify({ error: 'Failed to provision domain' }) }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ status: 'provisioned', domain: cleanDomain }) }
    }

    if (event.httpMethod === 'DELETE') {
      // Remove domain from Netlify site
      const res = await fetch(`${NETLIFY_API}/sites/${siteId}/domains/${cleanDomain}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (!res.ok && res.status !== 404) {
        return { statusCode: res.status, headers, body: JSON.stringify({ error: 'Failed to remove domain' }) }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ status: 'removed', domain: cleanDomain }) }
    }
  } catch {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
