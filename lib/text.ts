// Keeps the first `limit` words and adds "..." when the text was longer.
export function truncateWords(text: string, limit: number): string {
  const words = text.trim().split(/\s+/);
  return words.length > limit ? `${words.slice(0, limit).join(" ")}...` : text;
}
