"use client";

import { Box, Paper, Typography } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { accent } from "../accent";
import { formatShort } from "@/lib/format";

const TEMP_COLOR = accent.main;
const HUMIDITY_COLOR = "#0ca678";

/** Temperature and humidity over time. Two axes, because the ranges differ by a factor of four. */
export default function TrendChart({ data }) {
  if (!data || data.length < 2) {
    return null;
  }

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
        Temperature and humidity over time
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {data.length} points, oldest to newest
      </Typography>

      <Box sx={{ height: 280, mt: 1.5, ml: -1.5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEMP_COLOR} stopOpacity={0.35} />
                <stop offset="100%" stopColor={TEMP_COLOR} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="humidityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={HUMIDITY_COLOR} stopOpacity={0.28} />
                <stop offset="100%" stopColor={HUMIDITY_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#eef2f6" vertical={false} />
            <XAxis
              dataKey="time"
              tickFormatter={formatShort}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              minTickGap={32}
            />
            <YAxis
              yAxisId="temp"
              width={44}
              unit="°"
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="humidity"
              orientation="right"
              width={44}
              unit="%"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={formatShort}
              formatter={(value, name) => [
                name === "Temperature" ? `${value} °C` : `${value} %`,
                name
              ]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                fontSize: 13
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />

            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke={TEMP_COLOR}
              strokeWidth={2}
              fill="url(#tempFill)"
              connectNulls
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              yAxisId="humidity"
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke={HUMIDITY_COLOR}
              strokeWidth={2}
              fill="url(#humidityFill)"
              connectNulls
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
