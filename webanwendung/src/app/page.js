import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import PageBackground from "./components/PageBackground";
import SiteHeader from "./components/SiteHeader";
import PageHeading from "./components/PageHeading";
import HistoryView from "./components/HistoryView";
import { accent } from "./accent";
import { getChartSeries, getReadings } from "@/lib/readings";

export const metadata = {
  // absolute, because the template of the root layout does not apply to its own segment
  title: { absolute: "Mobile Weather Station — live ESP32 sensor data" },
  description:
    "Every reading the weather station has recorded so far: temperature, humidity, battery level and GPS position."
};

// Server component: the history is read at build time and rendered into the HTML.
// Only the live part (MQTT, pagination, chart) runs in the browser.
export default function Home() {
  const readings = getReadings();
  const series = getChartSeries(readings);

  return (
    <Box>
      <PageBackground />
      <SiteHeader active="history" />

      <Box
        component="main"
        sx={{ minHeight: "calc(100vh - 90px)", px: { xs: 1.5, sm: 3 }, py: 6 }}
      >
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <PageHeading
            eyebrow="Sensor Data"
            title="Weather History Log"
            subtitle="Temperature, humidity and battery level over time. New readings appear at the top as soon as the station publishes them."
            action={
              <Chip
                label={`${readings.length} recorded`}
                sx={{
                  bgcolor: accent.tint,
                  color: accent.dark,
                  fontWeight: 600,
                  border: `1px solid ${accent.border}`
                }}
              />
            }
          />

          <HistoryView readings={readings} series={series} />
        </Box>
      </Box>
    </Box>
  );
}
