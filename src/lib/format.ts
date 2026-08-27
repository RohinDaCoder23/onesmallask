const usdWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plain = new Intl.NumberFormat("en-US");

export function usd(amount: number, opts?: { cents?: boolean }): string {
  if (!Number.isFinite(amount)) return "$0";
  return opts?.cents ? usdCents.format(amount) : usdWhole.format(amount);
}

export function num(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return plain.format(value);
}

/** 1 -> "1", 2.5 -> "2.5". Keeps published ratios exactly as the org states them. */
export function ratioNum(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : String(value);
}

/** "2026-08-26" -> "August 26, 2026". Never throws on a bad input. */
export function longDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Strips a URL down to its hostname for display. Falls back to the raw string. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function cadenceLabel(cadence: "once" | "monthly"): string {
  return cadence === "monthly" ? "per month" : "one time";
}
