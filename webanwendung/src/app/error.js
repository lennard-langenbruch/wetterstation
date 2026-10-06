"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

/** Catches rendering errors so a broken reading cannot take the whole page down. */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        gap: 2
      }}
    >
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
        Something went wrong
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420 }}>
        The page could not be rendered. Reloading usually helps; if it does not, the broker is
        probably unreachable.
      </Typography>
      <Button onClick={reset} variant="contained" disableElevation>
        Try again
      </Button>
    </Box>
  );
}
