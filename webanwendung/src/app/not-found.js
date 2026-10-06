import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PageBackground from "./components/PageBackground";
import SiteHeader from "./components/SiteHeader";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Box>
      <PageBackground />
      <SiteHeader />
      <Box
        component="main"
        sx={{
          minHeight: "calc(100vh - 90px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
          gap: 2
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Page not found
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 420 }}>
          This address does not exist. The station is fine, the link is not.
        </Typography>
        <Button component={Link} href="/" variant="contained" disableElevation>
          Back to the history
        </Button>
      </Box>
    </Box>
  );
}
