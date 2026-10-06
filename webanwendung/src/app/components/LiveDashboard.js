"use client";

import { Box, Paper, Typography } from "@mui/material";
import Spinner from "./Spinner";
import ExportedLiveMap from "./ExportedLiveMap";
import useLiveReading, { MQTT_TOPIC } from "../hooks/useLiveReading";
import { accent } from "../accent";
import { formatDate, formatTime, formatValue, isNum } from "@/lib/format";

const cardSx = {
  bgcolor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 3,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  color: "#f1f5f9"
};

function LiveStat({ label, value }) {
  return (
    <Paper elevation={0} sx={{ ...cardSx, p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "rgba(241,245,249,0.65)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase"
        }}
      >
        {label}
      </Typography>
      <Typography
        component="p"
        sx={{ fontSize: 28, fontWeight: 700, mt: 0.5, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 2,
        py: 1.25,
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        "&:last-of-type": { borderBottom: 0 }
      }}
    >
      <Box component="dt" sx={{ color: "rgba(241,245,249,0.65)", fontSize: 14 }}>{label}</Box>
      <Box
        component="dd"
        sx={{ m: 0, fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Box>
    </Box>
  );
}

/** Shows only what is currently coming in over MQTT. No stored data on this page. */
export default function LiveDashboard() {
  const { latest, connected } = useLiveReading();

  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 90px)",
        px: { xs: 2, sm: 3 },
        py: 6,
        color: "#f1f5f9"
      }}
    >
      <Box sx={{ maxWidth: 560, mx: "auto" }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: "-0.01em", color: "#f8fafc" }}
          >
            Live Dashboard
          </Typography>
          <Box
            role="status"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              mt: 1.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              fontSize: 13,
              border: "1px solid rgba(255,255,255,0.16)",
              bgcolor: "rgba(255,255,255,0.06)",
              color: connected ? "#4ade80" : "rgba(241,245,249,0.7)"
            }}
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "currentColor",
                boxShadow: connected ? "0 0 0 4px rgba(74,222,128,0.20)" : "none"
              }}
            />
            {connected ? `Connected to ${MQTT_TOPIC}` : `Connecting to ${MQTT_TOPIC}`}
          </Box>
        </Box>

        {!latest ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 6 }}>
            <Spinner />
            <Typography variant="body2" sx={{ color: "rgba(241,245,249,0.7)" }}>
              Waiting for the first message from the station
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
                gap: 2,
                mb: 2
              }}
            >
              <LiveStat label="Temperature" value={formatValue(latest.temperature, "°C")} />
              <LiveStat label="Humidity" value={formatValue(latest.humidity, "%", 0)} />
              <LiveStat label="Battery" value={formatValue(latest.battery, "%", 0)} />
            </Box>

            <Paper elevation={0} sx={{ ...cardSx, px: 2.5, py: 1 }}>
              <Box component="dl" sx={{ m: 0 }}>
                <DetailRow label="Received" value={`${formatDate(latest.time)} · ${formatTime(latest.time)}`} />
                <DetailRow label="GPS status" value={latest.gps ?? "–"} />
                <DetailRow label="Latitude" value={isNum(latest.lat) ? latest.lat : "–"} />
                <DetailRow label="Longitude" value={isNum(latest.lon) ? latest.lon : "–"} />
              </Box>
            </Paper>
          </>
        )}

      </Box>

      {/* Outside the data column, so its width is independent of the cards above */}
      <Box sx={{ width: "70%", mx: "auto", mt: 3 }}>
        <ExportedLiveMap
          lon={isNum(latest?.lon) ? latest.lon : undefined}
          lat={isNum(latest?.lat) ? latest.lat : undefined}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{ display: "block", textAlign: "center", color: "rgba(241,245,249,0.55)", mt: 2 }}
      >
        Values are not stored on this page. The recorded history lives under History.
      </Typography>
    </Box>
  );
}
