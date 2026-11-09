"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
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
import useLiveReading from "../hooks/useLiveReading";
import { formatDate, formatTime, hasPosition, isNum } from "@/lib/format";

// The chart library is a large part of this page's JavaScript and is below the fold, so it is
// loaded after hydration instead of being part of the initial bundle.
const TrendChart = dynamic(() => import("./TrendChart"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 432,
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

const headCellSx = {
  bgcolor: "#f8fafc",
  color: "text.primary",
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

/**
 * History chart and table.
 * `readings` comes from the build-time export and is already in the HTML; readings that
 * arrive over MQTT while the page is open are prepended to it.
 */
export default function HistoryView({ readings, series }) {
  const { liveReadings: allLiveReadings } = useLiveReading();
  const [page, setPage] = useState(1);

  // Same rule as the build-time readings: no position, no row.
  const liveReadings = useMemo(() => allLiveReadings.filter(hasPosition), [allLiveReadings]);

  const rows = useMemo(() => [...liveReadings, ...readings], [liveReadings, readings]);

  const chartData = useMemo(
    () => [...series, ...[...liveReadings].reverse()],
    [series, liveReadings]
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const paginatedRows = rows.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  return (
    <>
      <TrendChart data={chartData} />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          mb: 1.5
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={rows.length === 0}
          onClick={() => exportReadings(rows)}
        >
          Export all as JSON
        </Button>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", ...numSx }}>
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
          />
        </Box>
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
                  <TableCell sx={numSx}>{formatDate(row.time)}</TableCell>
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
                </TableRow>
              ))}

              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
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
            </Box>
          ))}

          {paginatedRows.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>No readings yet</Box>
          )}
        </Box>
      </Paper>
    </>
  );
}
