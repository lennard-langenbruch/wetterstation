import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";

const REPO_URL = "https://github.com/lennard-langenbruch/wetterstation";

/** Shared by every page through the root layout. */
export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#000",
        color: "#fff",
        py: 2.5,
        px: 2,
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Link
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{ color: "#fff", display: "inline-flex", alignItems: "center", gap: 1, fontSize: 14 }}
      >
        <GitHubIcon fontSize="small" aria-hidden />
        View on GitHub
      </Link>
    </Box>
  );
}
