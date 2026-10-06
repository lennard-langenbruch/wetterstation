"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import dynamic from "next/dynamic";
import DownloadIcon from "@mui/icons-material/Download";
import StatCard from "./StatCard";
import useLiveReading from "../hooks/useLiveReading";
import { accent } from "../accent";
import { formatDate, formatShort, formatTime, isNum } from "@/lib/format";

// recharts is around a third of this page's JavaScript and is below the fold, so it is
// loaded after hydration instead of being part of the initial bundle.
const TrendChart = dynamic(() => import("./TrendChart"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 372,
        mb: 3,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "rgba(255,255,255,0.6)"
      }}
    />
  )
});

const ROWS_PER_PAGE = 15;

/**
 * The readings are already in the browser (they ship with the page), so the export needs no
 * server: the file is built from the data in memory and handed to the browser as a download.
 */
function exportReadings(rows) {
  const payload = rows.map(({ time, temperature, humidity, lon, lat, battery }) => ({
    time,
    temperature,
    humidity,
    lon,
    lat,
    battery
  }));

  const url = URL.createObjectURL(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `weather-readings-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function temperatureColor(value) {
  if (value < 10) return "info";
  if (value <= 25) return "success";
  if (value <= 30) return "warning";
  return "error";
}

function batteryColor(value) {
  if (value < 20) return "error";
  if (value < 50) return "warning";
  return "success";
}

const headCellSx = {
  bgcolor: "#f8fafc",
  color: "text.secondary",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap"
};

const numSx = { fontVariantNumeric: "tabular-nums" };

function Empty() {
  return (
    <Box component="span" sx={{ color: "text.disabled" }}>
      –
    </Box>
  );
}

function BatteryBar({ value }) {
  if (!isNum(value)) return <Empty />;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        color={batteryColor(value)}
        aria-label={`Battery ${value} percent`}
        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#e9eef3" }}
      />
      <Box component="span" sx={{ ...numSx, fontSize: 13, minWidth: 34, textAlign: "right" }}>
        {value} %
      </Box>
    </Box>
  );
}

/**
 * History table, key figures and chart.
 * `readings` comes from the build-time export and is already in the HTML; readings that
 * arrive over MQTT while the page is open are prepended to it.
 */
export default function HistoryView({ readings, series }) {
  const { latest, connected, liveReadings } = useLiveReading();
  const [page, setPage] = useState(1);

  const rows = useMemo(() => [...liveReadings, ...readings], [liveReadings, readings]);
  const current = latest ?? readings[0] ?? null;

  const chartData = useMemo(
    () => [...series, ...[...liveReadings].reverse()],
    [series, liveReadings]
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const paginatedRows = rows.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
          gap: 2,
          mb: 3
        }}
      >
        <StatCard
          label="Temperature"
          value={isNum(current?.temperature) ? current.temperature.toFixed(1) : null}
          unit="°C"
          hint={latest ? "live from the station" : "last recorded value"}
        />
        <StatCard
          label="Humidity"
          value={isNum(current?.humidity) ? current.humidity.toFixed(0) : null}
          unit="%"
          color="#0ca678"
          hint={latest ? "live from the station" : "last recorded value"}
        />
        <StatCard
          label="Battery"
          value={isNum(current?.battery) ? current.battery.toFixed(0) : null}
          unit="%"
          color={isNum(current?.battery) && current.battery < 20 ? "#e03131" : accent.main}
          hint={isNum(current?.battery) && current.battery < 20 ? "charge needed" : "of nominal capacity"}
        />
        <StatCard
          label="Last reading"
          compact
          value={current ? formatShort(current.time) : null}
          hint={connected ? "connected to the broker" : "waiting for the broker"}
        />
      </Box>

      <TrendChart data={chartData} />

      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={rows.length === 0}
          onClick={() => exportReadings(rows)}
        >
          Export all as JSON
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
          bgcolor: "rgba(255,255,255,0.92)"
        }}
      >
        {/* Table from the small breakpoint upwards */}
        <TableContainer sx={{ display: { xs: "none", sm: "block" } }}>
          <Table sx={{ minWidth: 720 }}>
            <caption style={{ captionSide: "top", padding: 0, height: 0, overflow: "hidden" }}>
              Recorded weather readings, newest first
            </caption>
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Date</TableCell>
                <TableCell sx={headCellSx}>Time</TableCell>
                <TableCell sx={headCellSx}>Temperature</TableCell>
                <TableCell sx={headCellSx}>Humidity</TableCell>
                <TableCell sx={headCellSx} align="right">Latitude</TableCell>
                <TableCell sx={headCellSx} align="right">Longitude</TableCell>
                <TableCell sx={headCellSx}>Battery</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((row, index) => (
                <TableRow
                  key={`${row.time}-${index}`}
                  hover
                  sx={{
                    "&:nth-of-type(even)": { bgcolor: "#fafbfc" },
                    "&:last-child td": { borderBottom: 0 },
                    "& td": { borderBottom: "1px solid #eef2f6", py: 1.5 }
                  }}
                >
                  <TableCell sx={{ ...numSx, fontWeight: 600 }}>{formatDate(row.time)}</TableCell>
                  <TableCell sx={{ ...numSx, color: "text.secondary" }}>{formatTime(row.time)}</TableCell>
                  <TableCell>
                    {isNum(row.temperature) ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        color={temperatureColor(row.temperature)}
                        label={`${row.temperature} °C`}
                        sx={{ fontWeight: 600, ...numSx }}
                      />
                    ) : (
                      <Empty />
                    )}
                  </TableCell>
                  <TableCell sx={numSx}>
                    {isNum(row.humidity) ? `${row.humidity} %` : <Empty />}
                  </TableCell>
                  <TableCell align="right" sx={{ ...numSx, color: "text.secondary" }}>
                    {isNum(row.lat) ? row.lat : <Empty />}
                  </TableCell>
                  <TableCell align="right" sx={{ ...numSx, color: "text.secondary" }}>
                    {isNum(row.lon) ? row.lon : <Empty />}
                  </TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <BatteryBar value={row.battery} />
                  </TableCell>
                </TableRow>
              ))}

              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No readings yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* One card per reading on phones, so nothing has to be scrolled sideways */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          {paginatedRows.map((row, index) => (
            <Box
              key={`${row.time}-${index}`}
              sx={{ px: 2, py: 1.75, borderBottom: "1px solid #eef2f6" }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                <Box sx={{ ...numSx, fontSize: 13, color: "text.secondary" }}>
                  {formatDate(row.time)} · {formatTime(row.time)}
                </Box>
                {isNum(row.temperature) && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color={temperatureColor(row.temperature)}
                    label={`${row.temperature} °C`}
                    sx={{ fontWeight: 600, ...numSx }}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 2, mt: 1, fontSize: 13, ...numSx }}>
                <Box>
                  <Box component="span" sx={{ color: "text.secondary" }}>Humidity </Box>
                  {isNum(row.humidity) ? `${row.humidity} %` : "–"}
                </Box>
                <Box>
                  <Box component="span" sx={{ color: "text.secondary" }}>Position </Box>
                  {isNum(row.lat) && isNum(row.lon) ? `${row.lat}, ${row.lon}` : "–"}
                </Box>
              </Box>
              <Box sx={{ mt: 1.25 }}>
                <BatteryBar value={row.battery} />
              </Box>
            </Box>
          ))}

          {paginatedRows.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>No readings yet</Box>
          )}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
            justifyItems: { xs: "center", sm: "stretch" },
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#f8fafc"
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {rows.length === 0
              ? "0 entries"
              : `${(safePage - 1) * ROWS_PER_PAGE + 1}–${Math.min(safePage * ROWS_PER_PAGE, rows.length)} of ${rows.length}`}
          </Typography>
          <Pagination
            count={pageCount}
            page={safePage}
            onChange={(event, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="small"
            sx={{ order: { xs: -1, sm: 0 } }}
          />
        </Box>
      </Paper>
    </>
  );
}
