// Exports data/wetterdaten.db to src/data/readings.json.
//
// The site is a static export (next.config.mjs -> output: "export"), so there is no
// server at runtime that could query SQLite. Instead the database is read once at
// build time and the result is imported directly by the page, which means the
// history is already in the HTML and no client-side fetch is needed.
// Wired into `npm run dev` and `npm run build` through the predev/prebuild hooks.
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "wetterdaten.db");
const outPath = path.join(process.cwd(), "src", "data", "readings.json");

let rows = [];
if (fs.existsSync(dbPath)) {
  const db = new Database(dbPath, { readonly: true });
  rows = db
    .prepare(
      "SELECT time, temperature, humidity, lon, lat, battery FROM readings ORDER BY id DESC"
    )
    .all();
  db.close();
} else {
  console.warn(`export-readings: ${dbPath} not found, writing an empty list`);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(rows));
console.log(`export-readings: ${rows.length} readings -> src/data/readings.json`);
