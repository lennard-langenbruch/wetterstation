import fs from "fs";
import path from "path";
import { marked } from "marked";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import PageBackground from "../components/PageBackground";
import SiteHeader from "../components/SiteHeader";

export const metadata = {
  title: "README",
  description:
    "Hardware, setup and architecture of the mobile weather station, taken from the project README."
};

// The README lives at the repository root, one level above the Next.js app. It is read at
// build time, so the static export contains the rendered HTML and no markdown parser ships
// to the browser. The README is our own file, so its inline HTML (images, captions) is kept.
function readmeHtml() {
  const file = path.join(process.cwd(), "..", "README.md");
  return marked.parse(fs.readFileSync(file, "utf8"));
}

const markdownSx = {
  color: "text.primary",
  fontSize: 15,
  lineHeight: 1.7,
  overflowWrap: "anywhere",
  "& h1": {
    mt: 0, fontSize: { xs: 28, sm: 34 }, fontWeight: 800, letterSpacing: "-0.02em", mb: 2 },
  "& h2": {
    fontSize: 22,
    fontWeight: 700,
    mt: 5,
    mb: 1.5,
    pb: 1,
    borderBottom: "1px solid #e2e8f0"
  },
  "& h3": { fontSize: 17, fontWeight: 700, mt: 3, mb: 1 },
  "& p, & ul": { my: 1.5 },
  "& a": { color: "primary.main" },
  "& img": {
    display: "block",
    maxWidth: "100%",
    borderRadius: 2,
    my: 2
  },
  // Images with a width attribute scale down with the column; images that only set a height
  // (the hardware photos) keep that height, as on GitHub.
  "& img[width]": { height: "auto" },
  "& sub": { color: "text.secondary" },
  "& code": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: "0.9em",
    bgcolor: "#f1f5f9",
    px: 0.5,
    borderRadius: 0.5
  },
  "& pre": {
    bgcolor: "#0f172a",
    color: "#e2e8f0",
    p: 2,
    borderRadius: 2,
    overflowX: "auto",
    "& code": { bgcolor: "transparent", color: "inherit", p: 0, fontSize: 13 }
  }
};

export default function Hardware() {
  return (
    <Box>
      <PageBackground />
      <SiteHeader active="hardware" />

      <Box component="main" sx={{ px: { xs: 1.5, sm: 3 }, py: 6 }}>
        <Paper
          elevation={0}
          component="article"
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: { xs: 2.5, sm: 5 },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
            bgcolor: "rgba(255,255,255,0.95)"
          }}
        >
          <Box sx={markdownSx} dangerouslySetInnerHTML={{ __html: readmeHtml() }} />
        </Paper>
      </Box>
    </Box>
  );
}
