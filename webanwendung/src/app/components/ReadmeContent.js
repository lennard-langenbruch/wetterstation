"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";

// GitHub renders the README itself and returns sanitised HTML, so no markdown parser is
// needed in the browser. The endpoint allows cross-origin requests; unauthenticated calls
// are limited to 60 per hour per visitor IP, which is plenty for a page view.
const README_API = "https://api.github.com/repos/lennard-langenbruch/wetterstation/readme";

/**
 * Shows the README rendered at build time first, then swaps in the current version from
 * GitHub once it has loaded. A README change on GitHub therefore shows up on the next page
 * view without a rebuild, and if GitHub is slow or unreachable the page still has content.
 */
export default function ReadmeContent({ initialHtml, sx }) {
  const [html, setHtml] = useState(initialHtml);

  useEffect(() => {
    const controller = new AbortController();
    fetch(README_API, {
      headers: { Accept: "application/vnd.github.html" },
      signal: controller.signal
    })
      .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
      .then(setHtml)
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.warn("README could not be loaded from GitHub, showing the built-in copy:", error);
      });
    return () => controller.abort();
  }, []);

  return <Box sx={sx} dangerouslySetInnerHTML={{ __html: html }} />;
}
