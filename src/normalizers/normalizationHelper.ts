/**
 * Normalizes whitespace by trimming the string
 * and collapsing multiple spaces into one.
 */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Lightweight normalization for names.
 * Only removes unnecessary whitespace.
 */
export function normalizeName(name: string): string {
  return normalizeWhitespace(name);
}

/**
 * Normalizes a single email.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes a list of emails.
 */
export function normalizeEmails(emails: string[]): string[] {
  return [...new Set(emails.map(normalizeEmail).filter(Boolean))];
}

/**
 * Normalizes a single phone number.
 */
export function normalizePhone(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    digits = "91" + digits;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return "+" + digits;
  }

  return null;
}

export function normalizePhones(
  phones: string[] = []
): string[] {
  return [
    ...new Set(
      phones
        .map(normalizePhone)
        .filter((p): p is string => p !== null)
    )
  ];
}