import { accent } from "../accent";

// SVG-Spinner (SMIL-Animation, braucht kein CSS)
export default function Spinner({ size = 48, label = "Waiting for data" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" role="status" aria-label={label}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={accent.soft}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="31.4 125.66"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
