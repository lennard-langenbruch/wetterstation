import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { accent } from "../accent";

/** Single key figure: label, large value with unit, and one line of context below. */
export default function StatCard({ label, value, unit, hint, color = accent.main, compact = false }) {
  const hasValue = value !== null && value !== undefined && value !== "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
        bgcolor: "rgba(255,255,255,0.92)"
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "text.secondary",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase"
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mt: 0.5 }}>
        <Typography
          component="span"
          sx={{
            fontSize: compact ? 22 : 30,
            fontWeight: 700,
            lineHeight: 1.1,
            color: hasValue ? color : "text.disabled",
            fontVariantNumeric: "tabular-nums"
          }}
        >
          {hasValue ? value : "–"}
        </Typography>
        {unit && hasValue && (
          <Typography component="span" sx={{ fontSize: 15, fontWeight: 600, color: "text.secondary" }}>
            {unit}
          </Typography>
        )}
      </Box>
      {hint && (
        <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Paper>
  );
}
