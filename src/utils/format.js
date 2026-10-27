export const CURRENCIES = {
  usd: { code: "USD", symbol: "$", locale: "en-US" },
  ngn: { code: "NGN", symbol: "₦", locale: "en-NG" },
  eur: { code: "EUR", symbol: "€", locale: "de-DE" },
  gbp: { code: "GBP", symbol: "£", locale: "en-GB" },
};

export function money(value, vs = "usd", { compact = false } = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  const { code, locale } = CURRENCIES[vs] ?? CURRENCIES.usd;
  const n = Number(value);
  if (compact) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }
  // Small prices need more precision (e.g. SHIB, PEPE)
  const abs = Math.abs(n);
  const digits = abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: abs >= 1 ? 2 : 2,
    maximumFractionDigits: digits,
  }).format(n);
}

export function compact(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(Number(value));
}

export function percent(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `${Math.abs(Number(value)).toFixed(digits)}%`;
}

export function number(value, digits = 6) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(Number(value));
}

export function timeAgo(date) {
  const d = new Date(String(date).replace(" ", "T") + (String(date).includes("Z") ? "" : "Z"));
  const diff = (d.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "just now";
}
