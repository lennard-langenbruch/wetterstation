import dynamic from "next/dynamic";

// mapbox-gl braucht `window`, daher nur clientseitig laden (wie bei der Leaflet-Karte)
const ExportedLiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  suspense: false
});

export default ExportedLiveMap;
