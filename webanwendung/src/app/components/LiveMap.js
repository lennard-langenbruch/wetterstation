"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Box } from "@mui/material";
import { accent } from "../accent";
import { MAPBOX_TOKEN, DEFAULT_CENTER } from "../mapboxConfig";

mapboxgl.accessToken = MAPBOX_TOKEN;

// Kartenausschnitt für die Live-Seite. Die Karte wird sofort mit der Startposition
// gerendert; sobald ein gültiger GPS-Fix (lon/lat) reinkommt, bekommt sie einen
// Marker und fliegt dorthin. `lon`/`lat` dürfen fehlen oder "-" sein (noch kein Fix).
export default function LiveMap({ lon, lat }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const hasFix = typeof lon === "number" && typeof lat === "number" && !Number.isNaN(lon) && !Number.isNaN(lat);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [DEFAULT_CENTER.lon, DEFAULT_CENTER.lat],
      zoom: 12,
      attributionControl: false
    });
    mapRef.current.addControl(new mapboxgl.AttributionControl({ compact: true }));
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasFix) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "50%";
      el.style.background = accent.soft;
      el.style.border = "2px solid white";
      el.style.boxShadow = `0 0 0 6px ${accent.main}55`;
      markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map);
    } else {
      markerRef.current.setLngLat([lon, lat]);
    }

    map.flyTo({ center: [lon, lat], zoom: 15, duration: 1200 });
  }, [hasFix, lon, lat]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        mt: 3,
        height: 260,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)"
      }}
    >
      <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />
    </Box>
  );
}
