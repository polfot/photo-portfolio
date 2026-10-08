// Reads a time token from app/globals.css (e.g. --motion-fade-out) in milliseconds.
// Handles both "300ms" and ".3s", since CSS minification may rewrite the unit.
export function cssTimeMs(variable: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  const amount = parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.endsWith("ms") ? amount : amount * 1000;
}
