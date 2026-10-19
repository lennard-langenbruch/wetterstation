"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Paper, Slider, Tooltip, Typography } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { LineChart } from "@mui/x-charts/LineChart";
import { accent } from "../accent";
import { formatShort } from "@/lib/format";

const TEMP_COLOR = accent.main;
const HUMIDITY_COLOR = "#0ca678";
const TITLE = "Temperature and humidity over time";

const MIN_SPAN = 10;
const DEFAULT_SPAN = 96;
const ZOOM_STEP = 1.5;
// Pointer movement (px) below which a press counts as a click and downloads the chart.
const CLICK_TOLERANCE = 5;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

/**
 * Temperature and humidity over time. Two axes, because the ranges differ by a factor of four.
 * Opens on the newest readings; drag, scroll sideways or use the slider to move into the
 * history, Ctrl/⌘ + wheel (or pinch) to zoom. MUI X only ships zoom in its Pro package, so
 * the visible window is handled here by slicing the dataset.
 */
export default function TrendChart({ data }) {
  const chartRef = useRef(null);
  const dragRef = useRef(null);
  // `end === null` means the window sticks to the newest reading as live data arrives.
  const [span, setSpan] = useState(DEFAULT_SPAN);
  const [end, setEnd] = useState(null);

  const n = data?.length ?? 0;
  const minSpan = Math.min(MIN_SPAN, n);
  const visibleSpan = clamp(span, minSpan, n);
  const visibleEnd = end === null ? n - 1 : clamp(end, visibleSpan - 1, n - 1);
  const start = visibleEnd - visibleSpan + 1;

  const setView = useCallback(
    (nextStart, nextSpan) => {
      const s = clamp(Math.round(nextSpan), minSpan, n);
      const first = clamp(Math.round(nextStart), 0, n - s);
      const last = first + s - 1;
      setSpan(s);
      setEnd(last >= n - 1 ? null : last);
    },
    [n, minSpan]
  );

  /** Zooms by `factor` (>1 zooms out) around a point given as a fraction of the chart width. */
  const zoom = useCallback(
    (factor, anchor = 0.5) => {
      const nextSpan = clamp(visibleSpan * factor, minSpan, n);
      const pivot = start + anchor * (visibleSpan - 1);
      setView(pivot - anchor * (nextSpan - 1), nextSpan);
    },
    [visibleSpan, start, n, minSpan, setView]
  );

  const pan = useCallback(
    (points) => setView(start + points, visibleSpan),
    [start, visibleSpan, setView]
  );

  // Wheel listeners have to be non-passive to keep the page from scrolling, which React's
  // onWheel cannot do. Plain vertical scrolling is left to the page.
  const latest = useRef({ zoom, pan, visibleSpan });
  latest.current = { zoom, pan, visibleSpan };
  const hasChart = n >= 2;
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      const { zoom: zoomBy, pan: panBy, visibleSpan: shown } = latest.current;
      const rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomBy(Math.exp(e.deltaY * 0.003), clamp((e.clientX - rect.left) / (rect.width || 1), 0, 1));
      } else if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const delta = e.deltaX || e.deltaY;
        panBy(Math.round((delta / (rect.width || 1)) * shown) || Math.sign(delta));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [hasChart]);

  const visible = useMemo(
    () => (data ?? []).slice(start, visibleEnd + 1),
    [data, start, visibleEnd]
  );

  if (!hasChart) {
    return null;
  }

  const temps = visible.map((d) => d.temperature).filter((v) => typeof v === "number");
  const zoomedOut = visibleSpan >= n;
  const atDefault = end === null && visibleSpan === Math.min(DEFAULT_SPAN, n);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    try {
      // Keeps the drag going when the pointer leaves the chart.
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not every pointer can be captured; the drag still works inside the chart.
    }
    dragRef.current = { x: e.clientX, start, moved: false };
  };
  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > CLICK_TOLERANCE) drag.moved = true;
    if (drag.moved) {
      const width = chartRef.current.getBoundingClientRect().width || 1;
      setView(drag.start - (dx / width) * visibleSpan, visibleSpan);
    }
  };
  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved) downloadAsJpg(chartRef.current);
  };

  const onKeyDown = (e) => {
    const step = Math.max(1, Math.round(visibleSpan / 10));
    const actions = {
      Enter: () => downloadAsJpg(chartRef.current),
      " ": () => downloadAsJpg(chartRef.current),
      ArrowLeft: () => pan(-step),
      ArrowRight: () => pan(step),
      "+": () => zoom(1 / ZOOM_STEP),
      "=": () => zoom(1 / ZOOM_STEP),
      "-": () => zoom(ZOOM_STEP)
    };
    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  };

  const controls = [
    ["Zoom in", <ZoomInIcon key="i" fontSize="small" />, visibleSpan <= minSpan, () => zoom(1 / ZOOM_STEP, 1)],
    ["Zoom out", <ZoomOutIcon key="o" fontSize="small" />, zoomedOut, () => zoom(ZOOM_STEP, 1)],
    ["Show whole history", <ZoomOutMapIcon key="a" fontSize="small" />, zoomedOut, () => setView(0, n)],
    [
      "Back to latest readings",
      <RestartAltIcon key="r" fontSize="small" />,
      atDefault,
      () => {
        setSpan(DEFAULT_SPAN);
        setEnd(null);
      }
    ]
  ];

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
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
            {TITLE}
          </Typography>
          <Typography variant="caption" component="p" sx={{ color: "text.secondary" }}>
            {visibleSpan} of {n} points · drag to pan, Ctrl/⌘ + scroll to zoom, click to
            download as JPG
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexShrink: 0 }}>
          {controls.map(([label, icon, disabled, onClick]) => (
            <Tooltip key={label} title={label}>
              <span>
                <IconButton size="small" aria-label={label} disabled={disabled} onClick={onClick}>
                  {icon}
                </IconButton>
              </span>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Box
        ref={chartRef}
        role="button"
        tabIndex={0}
        aria-label="Temperature and humidity chart. Arrow keys pan, plus and minus zoom, Enter downloads it as JPG"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragRef.current = null)}
        onKeyDown={onKeyDown}
        sx={{
          height: 300,
          mt: 1.5,
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          touchAction: "pan-y",
          userSelect: "none",
          borderRadius: 2,
          outline: "none",
          "&:focus-visible": { boxShadow: `0 0 0 2px ${TEMP_COLOR}` }
        }}
      >
        <LineChart
          dataset={visible}
          skipAnimation
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

      <Box sx={{ px: { xs: 1, sm: 5.5 }, mt: 1 }}>
        <Slider
          size="small"
          min={0}
          max={n - 1}
          value={[start, visibleEnd]}
          disableSwap
          valueLabelDisplay="auto"
          valueLabelFormat={(i) => formatShort(data[i]?.time)}
          getAriaLabel={(i) => (i === 0 ? "Start of visible range" : "End of visible range")}
          getAriaValueText={(i) => formatShort(data[i]?.time)}
          onChange={(_, [from, to], thumb) => {
            // Keep at least MIN_SPAN points visible; the dragged thumb gives way.
            if (to - from + 1 < minSpan) {
              if (thumb === 0) from = to - minSpan + 1;
              else to = from + minSpan - 1;
            }
            setView(from, to - from + 1);
          }}
        />
      </Box>
    </Paper>
  );
}
