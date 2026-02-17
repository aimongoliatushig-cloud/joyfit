/**
 * Validation helpers for onboarding and forms.
 */

/** Mongolian phone: 8 digits. Accepts 8 digits or 976 + 8 digits. */
export function isValidPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 8) return /^\d{8}$/.test(digits);
  if (digits.length === 11 && digits.startsWith("976")) {
    return /^976\d{8}$/.test(digits);
  }
  return false;
}

/** Inviter: valid phone OR alphanumeric code (4–20 chars, optional hyphen). */
export function isValidInviter(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return true; // optional
  if (isValidPhone(trimmed)) return true;
  return /^[a-zA-Z0-9\-]{4,20}$/.test(trimmed);
}

/** PIN: 4–6 digits. */
export function isValidPin(input: string): boolean {
  return /^\d{4,6}$/.test(input);
}
