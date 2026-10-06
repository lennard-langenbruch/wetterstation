import Box from "@mui/material/Box";
import PageBackground from "../components/PageBackground";
import SiteHeader from "../components/SiteHeader";
import LiveDashboard from "../components/LiveDashboard";

export const metadata = {
  title: "Live Dashboard",
  description:
    "Current temperature, humidity, battery level and GPS position of the weather station, streamed over MQTT."
};

export default function LivePage() {
  return (
    <Box>
      <PageBackground variant="dark" />
      <SiteHeader active="live" />
      <LiveDashboard />
    </Box>
  );
}
