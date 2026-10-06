// Fixed locale and time zone on purpose: the history is rendered at build time on the
// server and hydrated in the browser. Using the visitor's locale would produce different
// strings on both sides and trigger a React hydration mismatch.
const LOCALE = "en-GB";
const TIME_ZONE = "Europe/Berlin";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

const shortFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

export const formatDate = (iso) => (iso ? dateFormatter.format(new Date(iso)) : "–");
export const formatTime = (iso) => (iso ? timeFormatter.format(new Date(iso)) : "–");
export const formatShort = (iso) => (iso ? shortFormatter.format(new Date(iso)) : "–");

export const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Turns anything the sensor may send into a number, or null when it is unusable. */
export function toNumber(value) {
  const n = typeof value === "string" ? Number(value) : value;
  return isNum(n) ? n : null;
}

export const formatValue = (value, unit, digits = 1) =>
  isNum(value) ? `${value.toFixed(digits)} ${unit}` : "–";
