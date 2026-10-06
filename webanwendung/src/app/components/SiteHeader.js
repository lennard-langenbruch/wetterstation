"use client";

import Link from "next/link";
import { Box } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { accent } from "../accent";

// `short` = compact label for narrow screens (below md)
const items = [
  { key: "live", href: "/live", label: "Live Dashboard", short: "Live" },
  { key: "history", href: "/", label: "History", short: "History" },
  { key: "hardware", href: "/hardware", label: "Hardware", short: "Hardware", icon: true }
];

/**
 * Site header: pill navigation on the left, station name on the right.
 * The background is a CSS gradient rather than a hotlinked stock photo, so the header
 * paints immediately and the page has no third-party dependency.
 * `active` = "live" | "history" | "hardware"
 */
export default function SiteHeader({ active }) {
  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        height: 90,
        px: { xs: 2, sm: 3 },
        color: "white",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        backgroundColor: accent.ink,
        backgroundImage: `
          radial-gradient(900px 300px at 85% -40%, rgba(116,143,252,0.55), transparent 70%),
          radial-gradient(600px 260px at 10% 130%, rgba(66,99,235,0.45), transparent 70%),
          linear-gradient(115deg, #070c1f 0%, ${accent.ink} 55%, ${accent.dark} 100%)
        `
      }}
    >
      <Box
        sx={{
          height: "100%",
          maxWidth: 1000,
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", md: "space-between" },
          gap: 2
        }}
      >
        <Box
          component="nav"
          aria-label="Main navigation"
          sx={{
            display: "flex",
            gap: 0.5,
            p: 0.5,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >
          {items.map(({ key, href, label, short, icon }) => {
            const isActive = active === key;
            return (
              <Box
                key={key}
                component={Link}
                href={href}
                aria-current={isActive ? "page" : undefined}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: { xs: 1.5, md: 2.5 },
                  py: 1,
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  color: isActive ? "white" : "rgba(255,255,255,0.82)",
                  bgcolor: isActive ? "rgba(66,99,235,0.88)" : "transparent",
                  boxShadow: isActive ? "0 4px 14px rgba(66,99,235,0.45)" : "none",
                  transition: "background-color .2s, color .2s",
                  "&:hover": {
                    color: "white",
                    bgcolor: isActive ? "rgba(66,99,235,0.95)" : "rgba(255,255,255,0.14)"
                  },
                  "&:focus-visible": { outline: "2px solid white", outlineOffset: 2 }
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>{label}</Box>
                <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>{short}</Box>
                {icon && <InfoOutlinedIcon aria-hidden="true" sx={{ fontSize: 17 }} />}
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1.25,
            fontWeight: 700,
            fontSize: { md: 16, lg: 18 },
            letterSpacing: "0.02em",
            whiteSpace: "nowrap"
          }}
        >
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: accent.soft,
              boxShadow: "0 0 0 4px rgba(116,143,252,0.25)"
            }}
          />
          Weather Station (Wuppertal)
        </Box>
      </Box>
    </Box>
  );
}
