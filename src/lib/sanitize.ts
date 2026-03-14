// Input sanitization and validation utilities

/** Strip HTML tags to prevent XSS */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/** Sanitize general text input - strip HTML and trim */
export function sanitizeText(input: string, maxLength?: number): string {
  let clean = stripHtml(input).trim()
  if (maxLength) {
    clean = clean.slice(0, maxLength)
  }
  return clean
}

/** Sanitize MC number - digits only, max 7 chars */
export function sanitizeMcNumber(input: string): string {
  return input.replace(/\D/g, '').slice(0, 7)
}

/** Validate MC number format */
export function isValidMcNumber(mc: string): boolean {
  const clean = mc.replace(/\D/g, '')
  return clean.length >= 1 && clean.length <= 7
}

/** Email regex validation */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

/** Password validation: min 8 chars, at least one uppercase, at least one number */
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
}

export function getPasswordErrors(password: string): string[] {
  const errors: string[] = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter')
  if (!/[0-9]/.test(password)) errors.push('At least one number')
  return errors
}

/** Sanitize hex color input */
export function sanitizeHexColor(input: string): string {
  const clean = input.replace(/[^#a-fA-F0-9]/g, '').slice(0, 7)
  return clean
}

/** Sanitize an object's string values recursively before DB insert */
export function sanitizeForDb<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }
  for (const key in result) {
    const val = result[key]
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[key] = stripHtml(val)
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      (result as Record<string, unknown>)[key] = sanitizeForDb(val as Record<string, unknown>)
    } else if (Array.isArray(val)) {
      (result as Record<string, unknown>)[key] = val.map(item =>
        typeof item === 'string' ? stripHtml(item) : item
      )
    }
  }
  return result
}
