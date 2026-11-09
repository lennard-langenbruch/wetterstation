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
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
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

// Fixed decimals so values line up: "24.0 °C" next to "24.2 °C", coordinates to ~1 m
const formatTemp = (value) => `${value.toFixed(1)} °C`;
const formatCoord = (value) => value.toFixed(5);

/** Humidity in the same pill style as the temperature, always in the accent blue. */
function HumidityChip({ value, icon }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color="primary"
      icon={icon}
      label={`${value} %`}
      sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", ...chipIconSx }}
    />
  );
}

// Small icon inside the mobile pills, same colour as the pill text
const chipIconSx = { "& .MuiChip-icon": { fontSize: 15, ml: "6px", mr: "-2px", color: "inherit" } };

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

      {/* Phones: export and count on one line, pagination centred below.
          Larger screens: everything on one line, pagination on the right. */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", sm: "auto 1fr auto" },
          gridTemplateAreas: { xs: '"export count" "pages pages"', sm: '"export count pages"' },
          alignItems: "center",
          columnGap: 1.5,
          rowGap: 1.5,
          mb: 1.5
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={rows.length === 0}
          onClick={() => exportReadings(rows)}
          sx={{ gridArea: "export", justifySelf: "start" }}
        >
          Export all as JSON
        </Button>

        <Typography
          variant="body2"
          sx={{ gridArea: "count", justifySelf: "end", color: "text.secondary", ...numSx }}
        >
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
          siblingCount={0}
          sx={{
            gridArea: "pages",
            justifySelf: { xs: "center", sm: "end" },
            "& .MuiPagination-ul": { flexWrap: "nowrap" }
          }}
        />
      </Box>

      <Paper
        elevation={0}
        // On phones the frame goes away and each reading is its own card (see below)
        sx={{
          borderRadius: 3,
          border: { xs: "none", sm: "1px solid #e2e8f0" },
          overflow: "hidden",
          boxShadow: { xs: "none", sm: "0 4px 24px rgba(15, 23, 42, 0.06)" },
          bgcolor: { xs: "transparent", sm: "rgba(255,255,255,0.92)" }
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
                        label={formatTemp(row.temperature)}
                        sx={{ fontWeight: 600, ...numSx }}
                      />
                    ) : (
                      <Empty />
                    )}
                  </TableCell>
                  <TableCell>
                    {isNum(row.humidity) ? <HumidityChip value={row.humidity} /> : <Empty />}
                  </TableCell>
                  <TableCell align="right" sx={{ ...numSx, color: "text.secondary" }}>
                    {isNum(row.lat) ? formatCoord(row.lat) : <Empty />}
                  </TableCell>
                  <TableCell align="right" sx={{ ...numSx, color: "text.secondary" }}>
                    {isNum(row.lon) ? formatCoord(row.lon) : <Empty />}
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
        <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
          {paginatedRows.map((row, index) => (
            <Box
              key={`${row.time}-${index}`}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2.5,
                border: "1px solid #e2e8f0",
                bgcolor: "rgba(255,255,255,0.95)",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)"
              }}
            >
              {/* Values stacked as label/value rows; temperature stays a chip on the right */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                  component="dl"
                  sx={{
                    flex: 1,
                    m: 0,
                    display: "grid",
                    gridTemplateColumns: "84px 1fr",
                    rowGap: 0.5,
                    fontSize: 13,
                    lineHeight: 1.5,
                    ...numSx,
                    "& dt": { color: "text.secondary" },
                    "& dd": { m: 0 }
                  }}
                >
                  <dt>Date</dt>
                  <dd>{formatDate(row.time)}</dd>
                  <dt>Time</dt>
                  <dd>{formatTime(row.time)}</dd>
                  <dt>Latitude</dt>
                  <dd>{isNum(row.lat) ? formatCoord(row.lat) : "–"}</dd>
                  <dt>Longitude</dt>
                  <dd>{isNum(row.lon) ? formatCoord(row.lon) : "–"}</dd>
                </Box>
                {/* Measured values as pills on the right, temperature above humidity */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75 }}>
                  {isNum(row.temperature) && (
                    <Chip
                      size="small"
                      variant="outlined"
                      color={temperatureColor(row.temperature)}
                      icon={<DeviceThermostatIcon />}
                      label={formatTemp(row.temperature)}
                      sx={{ fontWeight: 600, ...numSx, ...chipIconSx }}
                    />
                  )}
                  {isNum(row.humidity) && (
                    <HumidityChip value={row.humidity} icon={<WaterDropOutlinedIcon />} />
                  )}
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
