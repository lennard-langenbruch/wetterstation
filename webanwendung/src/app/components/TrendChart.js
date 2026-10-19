"use client";

import { useRef } from "react";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { accent } from "../accent";
import { formatShort } from "@/lib/format";

const TEMP_COLOR = accent.main;
const HUMIDITY_COLOR = "#0ca678";
const TITLE = "Temperature and humidity over time";

// Styles that MUI X Charts sets through CSS classes. A serialised SVG loses its stylesheet,
// so these are copied onto every element as inline styles before rendering the image.
const INLINE_PROPS = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-dasharray",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
  "visibility",
  "display"
];

/**
 * Draws the chart's SVG onto a canvas with a white background, a title and a legend
 * (the legend is HTML in MUI X Charts, not part of the SVG) and saves it as a JPG.
 */
function downloadAsJpg(container) {
  // The legend also contains small SVGs, so pick the chart's drawing surface explicitly.
  const svg = container?.querySelector("svg.MuiChartsSurface-root");
  if (!svg) return;

  const { width, height } = svg.getBoundingClientRect();
  const clone = svg.cloneNode(true);
  const source = [svg, ...svg.querySelectorAll("*")];
  const target = [clone, ...clone.querySelectorAll("*")];
  source.forEach((el, i) => {
    const computed = getComputedStyle(el);
    const style = INLINE_PROPS.map((p) => `${p}:${computed.getPropertyValue(p)}`).join(";");
    target[i].setAttribute("style", style);
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);

  const scale = 2;
  const header = 64;
  const pad = 24;
  const canvas = document.createElement("canvas");
  canvas.width = (width + pad * 2) * scale;
  canvas.height = (height + header + pad) * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 15px Inter, sans-serif";
  ctx.fillText(TITLE, pad, pad + 8);

  let x = pad;
  ctx.font = "12px Inter, sans-serif";
  for (const [label, color] of [
    ["Temperature (°C)", TEMP_COLOR],
    ["Humidity (%)", HUMIDITY_COLOR]
  ]) {
    ctx.fillStyle = color;
    ctx.fillRect(x, pad + 22, 10, 10);
    ctx.fillStyle = "#475569";
    ctx.fillText(label, x + 16, pad + 31);
    x += ctx.measureText(label).width + 36;
  }

  const image = new Image();
  const svgUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" })
  );
  image.onload = () => {
    ctx.drawImage(image, pad, header, width, height);
    URL.revokeObjectURL(svgUrl);
    canvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `weather-trend-${new Date().toISOString().slice(0, 10)}.jpg`;
        link.click();
        // Revoking right away can cancel the download in some browsers.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      "image/jpeg",
      0.92
    );
  };
  image.src = svgUrl;
}

/** Temperature and humidity over time. Two axes, because the ranges differ by a factor of four. */
export default function TrendChart({ data }) {
  const chartRef = useRef(null);

  if (!data || data.length < 2) {
    return null;
  }

  const temps = data.map((d) => d.temperature).filter((v) => typeof v === "number");

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        mb: 3,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
        bgcolor: "rgba(255,255,255,0.92)"
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
        {TITLE}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {data.length} points, oldest to newest · click the chart to download it as JPG
      </Typography>

      <Tooltip title="Download as JPG" followCursor>
        <Box
          ref={chartRef}
          role="button"
          tabIndex={0}
          aria-label="Download chart as JPG"
          onClick={() => downloadAsJpg(chartRef.current)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              downloadAsJpg(chartRef.current);
            }
          }}
          sx={{ height: 300, mt: 1.5, cursor: "pointer", borderRadius: 2, outline: "none" }}
        >
          <LineChart
            dataset={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            grid={{ horizontal: true }}
            xAxis={[
              {
                dataKey: "time",
                scaleType: "point",
                valueFormatter: formatShort,
                tickLabelStyle: { fontSize: 11, fill: "#64748b" },
                disableTicks: true
              }
            ]}
            yAxis={[
              {
                id: "temp",
                width: 44,
                min: temps.length ? Math.floor(Math.min(...temps) - 2) : undefined,
                max: temps.length ? Math.ceil(Math.max(...temps) + 2) : undefined,
                valueFormatter: (v) => `${v}°`,
                tickLabelStyle: { fontSize: 11, fill: "#64748b" },
                disableLine: true,
                disableTicks: true
              },
              {
                id: "humidity",
                position: "right",
                width: 44,
                min: 0,
                max: 100,
                valueFormatter: (v) => `${v}%`,
                tickLabelStyle: { fontSize: 11, fill: "#64748b" },
                disableLine: true,
                disableTicks: true
              }
            ]}
            series={[
              {
                dataKey: "temperature",
                label: "Temperature",
                yAxisId: "temp",
                color: TEMP_COLOR,
                area: true,
                curve: "monotoneX",
                showMark: false,
                connectNulls: true,
                valueFormatter: (v) => (v == null ? "–" : `${v} °C`)
              },
              {
                dataKey: "humidity",
                label: "Humidity",
                yAxisId: "humidity",
                color: HUMIDITY_COLOR,
                area: true,
                curve: "monotoneX",
                showMark: false,
                connectNulls: true,
                valueFormatter: (v) => (v == null ? "–" : `${v} %`)
              }
            ]}
            sx={{
              "& .MuiAreaElement-root": { fillOpacity: 0.15 },
              "& .MuiLineElement-root": { strokeWidth: 2 },
              "& .MuiChartsGrid-line": { stroke: "#eef2f6" },
              "& .MuiChartsAxis-bottom .MuiChartsAxis-line": { stroke: "#e2e8f0" }
            }}
          />
        </Box>
      </Tooltip>
    </Paper>
  );
}
