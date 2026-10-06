import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { accent } from "../accent";

/** Shared page title block: small eyebrow, gradient headline, one line of context. */
export default function PageHeading({ eyebrow, title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        mb: 3
      }}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            display: "block",
            lineHeight: 1.6,
            color: accent.main,
            fontWeight: 700,
            letterSpacing: "0.14em"
          }}
        >
          {eyebrow}
        </Typography>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            background: `linear-gradient(90deg, ${accent.ink} 0%, ${accent.main} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, maxWidth: 560 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
