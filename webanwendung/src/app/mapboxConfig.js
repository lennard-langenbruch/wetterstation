// Mapbox-Konfiguration. Der Token ist ein "public" Client-Token (beginnt mit pk.),
// genau dafür gedacht, im Browser-Bundle zu stehen — kein Secret.
// Einschränken lässt er sich im Mapbox-Account über URL restrictions.
export const MAPBOX_TOKEN =
  "pk.eyJ1IjoibGVubmkyNjciLCJhIjoiY211OHd3eDc5MHlneDJ3c2xncnFhYWhjMSJ9.4nj9VhL_TBA3EoCHEADPaQ";

// Startposition, solange noch kein GPS-Fix von der Station vorliegt (Wuppertal)
export const DEFAULT_CENTER = { lon: 7.1508, lat: 51.2562 };
