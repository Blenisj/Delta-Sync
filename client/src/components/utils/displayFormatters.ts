const PREFIXES_TO_DROP = new Set(["ks", "rt", "ac", "cf"]);

function formatToken(token: string): string {
  if (!token) return "";

  const expanded = token
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
    .trim();

  return expanded
    .split(/\s+/)
    .map((part) => {
      if (/^[0-9]+$/.test(part)) return part;

      if (/[a-zA-Z]/.test(part) && /[0-9]/.test(part)) {
        return part.toUpperCase();
      }

      if (part.length <= 3) {
        return part.toUpperCase();
      }

      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatIdentifierLabel(value?: string | null): string {
  if (!value) return "Unknown";

  const normalized = value
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const words = normalized.split(" ").filter(Boolean);

  const trimmedWords =
    words.length > 1 && PREFIXES_TO_DROP.has(words[0].toLowerCase())
      ? words.slice(1)
      : words;

  return trimmedWords.map(formatToken).join(" ");
}

export function formatWeatherLabel(weather?: string | null): string {
  if (!weather) return "Unknown";
  const lower = weather.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
