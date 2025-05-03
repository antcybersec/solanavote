/**
 * Shortens a Solana public key string for display.
 * e.g., "So1ana...Vote"
 * @param address The public key string.
 * @param charsToShow The number of characters to show at the beginning and end.
 * @returns The shortened address string.
 */
export function shortenAddress(address: string, charsToShow: number = 4): string {
  if (!address) return "";
  if (address.length <= charsToShow * 2 + 3) {
    return address; // Address is too short to shorten effectively
  }
  const start = address.substring(0, charsToShow);
  const end = address.substring(address.length - charsToShow);
  return `${start}...${end}`;
}
