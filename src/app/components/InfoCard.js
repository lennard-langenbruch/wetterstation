"use client";

import { Box, Paper, Typography } from "@mui/material";
import { accent } from "../accent";

// Karte mit Bild (oder Platzhalter), Titel, optionalem Text und Datenzeilen
export default function InfoCard({ image, alt, eyebrow, title, text, groupLabel, rows }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)"
      }}
    >
      {image ? (
        // feste Bildfläche (wie die 750x422-Fotos), damit alle Karten gleich hoch starten
        <Box sx={{ aspectRatio: "750 / 422", bgcolor: "white" }}>
          <Box
            component="img"
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${image}`}
            alt={alt}
            sx={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
      ) : (
        <Box
          aria-hidden="true"
          sx={{
            aspectRatio: "750 / 422",
            background: `linear-gradient(135deg, ${accent.tint} 0%, ${accent.border} 100%)`
          }}
        />
      )}

      <Box sx={{ p: 2 }}>
        <Typography
          variant="overline"
          sx={{ display: "block", lineHeight: 1.6, color: accent.main, fontWeight: 700, letterSpacing: "0.14em" }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </Typography>

        {text && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {text}
          </Typography>
        )}

        {rows && (
          <Box sx={{ mt: 1.5 }}>
            {groupLabel && (
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.5 }}
              >
                {groupLabel}
              </Typography>
            )}
            <Box component="dl" sx={{ m: 0 }}>
              {rows.map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 1,
                    py: 0.75,
                    borderTop: "1px solid #eef2f6",
                    fontSize: 13
                  }}
                >
                  <Box component="dt" sx={{ color: "text.secondary" }}>{label}</Box>
                  <Box component="dd" sx={{ m: 0, fontWeight: 700, textAlign: "right" }}>{value}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
