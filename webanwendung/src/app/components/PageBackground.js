import { accent } from "../accent";

// Fixierter Hintergrund: Rautenmuster in Indigo, das zur Seitenmitte hin ausblendet
// variant "light" = helle Seite, "dark" = invertierte, dunkle Variante
const themes = {
  light: {
    stroke: accent.main,
    strokeOpacity: 0.35,
    fillOpacity: 0.12,
    base: "radial-gradient(1200px 500px at 50% -10%, rgba(66,99,235,0.10), transparent 70%), #f3f6fd"
  },
  dark: {
    stroke: accent.soft,
    strokeOpacity: 0.32,
    fillOpacity: 0.1,
    base: "radial-gradient(1200px 600px at 50% -10%, rgba(66,99,235,0.30), transparent 70%), #0a1026"
  }
};

const edgeMask =
  "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.55) 12%, transparent 30%, transparent 70%, rgba(0,0,0,0.55) 88%, #000 100%)";

export default function PageBackground({ variant = "light" }) {
  const t = themes[variant] ?? themes.light;
  const tile = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
      <path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke="${t.stroke}" stroke-opacity="${t.strokeOpacity}" stroke-width="1.5"/>
      <path d="M28 14 L42 28 L28 42 L14 28 Z" fill="${t.stroke}" fill-opacity="${t.fillOpacity}"/>
    </svg>`
  );

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        background: t.base
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,${tile}")`,
          backgroundSize: "56px 56px",
          WebkitMaskImage: edgeMask,
          maskImage: edgeMask
        }}
      />
    </div>
  );
}
