"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { accent } from "../accent";

const fontFamily =
  '"Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// One theme for the whole site, so components such as Pagination or Chip pick up the
// accent colour on their own instead of being overridden with sx at every call site.
const theme = createTheme({
  palette: {
    primary: { main: accent.main, dark: accent.dark, light: accent.soft },
    text: { primary: "#1a2027" }
  },
  typography: {
    fontFamily,
    button: { textTransform: "none", fontWeight: 600 }
  },
  shape: { borderRadius: 10 }
});

export default function Providers({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
