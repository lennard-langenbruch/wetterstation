import Box from "@mui/material/Box";
import PageBackground from "../components/PageBackground";
import SiteHeader from "../components/SiteHeader";
import PageHeading from "../components/PageHeading";
import InfoCard from "../components/InfoCard";

export const metadata = {
  title: "Hardware",
  description:
    "The parts the weather station is built from: a BME680 environmental sensor, a T-SIM7000G board with LTE and GPS, and an 18650 lithium-ion cell."
};

export default function Hardware() {
  return (
    <Box>
      <PageBackground />
      <SiteHeader active="hardware" />

      <Box component="main" sx={{ minHeight: "calc(100vh - 90px)", px: { xs: 1.5, sm: 3 }, py: 6 }}>
        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          <PageHeading
            eyebrow="Weather Station"
            title="Hardware"
            subtitle="The station runs off a single 18650 cell and reports over the mobile network, so it does not depend on Wi-Fi and can be placed anywhere with LTE coverage."
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))"
              },
              gap: 3,
              alignItems: "start"
            }}
          >
            <InfoCard
              image="/images/bme680.webp"
              alt="BME680 sensor board"
              eyebrow="Sensor"
              title="BME680"
              text="Measures temperature, humidity and air pressure on one I2C board."
              groupLabel="Deviation"
              rows={[
                ["Temperature", "±1.0 °C"],
                ["Humidity", "±3 % RH"],
                ["Pressure", "±1 hPa"]
              ]}
            />
            <InfoCard
              image="/images/t-sim7000g.webp"
              alt="T-SIM7000G board"
              eyebrow="Hardware"
              title="T-SIM7000G"
              text="ESP32 board with a built-in LTE modem and GPS receiver. It publishes every reading to the MQTT broker."
              rows={[
                ["Cores", "2 (dual-core)"],
                ["Clock", "80 MHz"],
                ["Cellular", "LTE"],
                ["Positioning", "GPS"]
              ]}
            />
            <InfoCard
              image="/images/inr18650.webp"
              alt="INR18650-35E lithium-ion cell"
              eyebrow="Battery"
              title="INR18650-35E"
              text="Powers the station between charges. Its charge level is sent with every reading."
              rows={[
                ["Capacity", "3450 mAh"],
                ["Voltage", "3.6 V"],
                ["Charge to", "4.2 V"],
                ["Max. discharge", "8 A"]
              ]}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
