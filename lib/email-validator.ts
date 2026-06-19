/**
 * Email Validator
 *
 * SEC-FIX 2026-06-19 (ChatGPT audit Finding #8):
 * The previous newsletter endpoint accepted any string containing '@'. That is
 * an enumeration / abuse vector — attackers can pump junk strings, generate
 * Resend deliverability incidents, and pollute the subscriber table.
 *
 * This module replaces the includes('@') check with a proper RFC 5322-aligned
 * regex + length cap (320 chars per RFC). MX-record check is intentionally
 * deferred: it is slow (DNS roundtrip), can rate-limit our edge runtime, and
 * primarily catches the same false-positives the regex already catches. Mark
 * as future enhancement to be revisited if Resend bounce rate spikes.
 *
 * Usage:
 *   const result = validateEmail(input);
 *   if (!result.valid) return reject(result.reason);
 *   // use result.normalized (lowercased, trimmed)
 */

// RFC 5322-aligned pragmatic regex. Source: HTML5 spec recommended regex
// (https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address),
// itself derived from RFC 5322. Catches > 99.9% of real-world bad inputs
// without the false-positives of the full RFC 5322 grammar.
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// RFC 5321 §4.5.3.1.3 — max 320 chars total (64 local + @ + 255 domain)
const MAX_EMAIL_LENGTH = 320;
const MAX_LOCAL_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 255;

export interface EmailValidationResult {
  valid: boolean;
  normalized?: string;
  reason?: string;
}

export function validateEmail(input: unknown): EmailValidationResult {
  if (typeof input !== 'string') {
    return { valid: false, reason: 'Email must be a string' };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, reason: 'Email is required' };
  }

  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return { valid: false, reason: 'Email exceeds maximum length' };
  }

  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) {
    return { valid: false, reason: 'Email missing @ separator' };
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (local.length === 0 || local.length > MAX_LOCAL_LENGTH) {
    return { valid: false, reason: 'Invalid local part length' };
  }

  if (domain.length === 0 || domain.length > MAX_DOMAIN_LENGTH) {
    return { valid: false, reason: 'Invalid domain length' };
  }

  // Domain must contain at least one dot (no bare hostnames for public newsletter)
  if (!domain.includes('.')) {
    return { valid: false, reason: 'Domain must contain a dot' };
  }

  // Normalize before regex (lowercased for storage; preserves case-sensitivity
  // technically violates RFC for local-part but is universal industry practice)
  const normalized = trimmed.toLowerCase();

  if (!EMAIL_REGEX.test(normalized)) {
    return { valid: false, reason: 'Email format invalid' };
  }

  return { valid: true, normalized };
}

/**
 * FUTURE ENHANCEMENT (not implemented):
 * Optional MX-record validation. Requires DNS lookup which adds 50-500ms per
 * request and may be rate-limited at the edge. Re-evaluate if Resend bounce
 * rate > 2% or after observed deliverability issues.
 *
 *   export async function validateEmailMx(email: string): Promise<boolean> { ... }
 */
