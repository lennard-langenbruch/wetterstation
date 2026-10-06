import rawReadings from "@/data/readings.json";
import { toNumber } from "./format";

/**
 * Readings exported from the SQLite database at build time, newest first.
 * Imported statically so the history ends up in the generated HTML.
 */
function normalise(row) {
  return {
    time: row.time,
    temperature: toNumber(row.temperature),
    humidity: toNumber(row.humidity),
    lon: toNumber(row.lon),
    lat: toNumber(row.lat),
    battery: toNumber(row.battery)
  };
}

export function getReadings() {
  return rawReadings.map(normalise);
}

/** Oldest to newest, thinned out to at most `limit` points for the chart. */
export function getChartSeries(readings, limit = 120) {
  const ordered = [...readings].reverse();
  if (ordered.length <= limit) return ordered;
  const step = Math.ceil(ordered.length / limit);
  return ordered.filter((_, index) => index % step === 0);
}
