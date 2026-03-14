// Simple in-memory rate limiter for FMCSA API calls
// Max 5 lookups per minute per session

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 5

const timestamps: number[] = []

export function checkRateLimit(): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()

  // Remove timestamps outside the window
  while (timestamps.length > 0 && timestamps[0] <= now - WINDOW_MS) {
    timestamps.shift()
  }

  if (timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = timestamps[0]
    const retryAfterMs = oldestInWindow + WINDOW_MS - now
    return { allowed: false, retryAfterMs }
  }

  timestamps.push(now)
  return { allowed: true, retryAfterMs: 0 }
}

export function getRemainingRequests(): number {
  const now = Date.now()
  const active = timestamps.filter(t => t > now - WINDOW_MS)
  return Math.max(0, MAX_REQUESTS - active.length)
}
