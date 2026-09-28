import crypto from 'crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generate a cryptographically secure, URL-safe short identifier.
 * @param {number} length - Desired length of the ID (default 7)
 * @returns {string} - Generated short ID
 */
export function generateShortId(length = 7) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}

/**
 * Generate a cryptographically secure token for private snippet deletion.
 * @returns {string} - Hex-encoded deletion token
 */
export function generateDeleteToken() {
  return crypto.randomBytes(24).toString('hex');
}
