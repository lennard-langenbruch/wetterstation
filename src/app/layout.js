import "@fontsource-variable/inter";
import "./globals.css";
import Providers from "./components/Providers";

const siteUrl = "https://lennard-langenbruch.github.io/wetterstation";
const description =
  "A battery-powered ESP32 weather station in Wuppertal publishes temperature, humidity, battery level and GPS position over LTE. This site shows the live feed and the recorded history.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mobile Weather Station",
    template: "%s · Mobile Weather Station"
  },
  description,
  applicationName: "Mobile Weather Station",
  authors: [{ name: "Lennard Langenbruch", url: "https://github.com/lennard-langenbruch" }],
  creator: "Lennard Langenbruch",
  keywords: ["ESP32", "MQTT", "weather station", "IoT", "Next.js", "LTE", "GPS"],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Mobile Weather Station",
    title: "Mobile Weather Station",
    description,
    locale: "en_GB"
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Weather Station",
    description
  }
};

export const viewport = {
  themeColor: "#4263eb",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
