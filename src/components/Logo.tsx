import type { FC } from "react";

// ─── Types ────────────────────────────────────────────────────
interface LogoProps {
  /** Size in pixels for both width and height */
  size?: number;
  /** Optional extra CSS classes */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────

/**
 * SKA brand monogram — stylised "S" formed by rising bar-chart
 * bars inside a hexagonal frame, using the site's warm palette:
 *   mocha brown  #8B6F5C
 *   terracotta   #C4705A
 *   warm gold    #C9A84C
 */
const Logo: FC<LogoProps> = ({ size = 36, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Sohila Khaled Abbas — data analytics logo"
    className={className}
  >
    <defs>
      {/* Hexagon border gradient: gold → terracotta */}
      <linearGradient id="ska-hex-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#C9A84C" />
        <stop offset="55%"  stopColor="#C4705A" />
        <stop offset="100%" stopColor="#8B6F5C" />
      </linearGradient>

      {/* Bar fill gradient: mocha base → terracotta → gold tip */}
      <linearGradient id="ska-bar-grad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%"   stopColor="#8B6F5C" stopOpacity="0.85" />
        <stop offset="55%"  stopColor="#C4705A" />
        <stop offset="100%" stopColor="#C9A84C" />
      </linearGradient>

      {/* Soft glow filter behind bars */}
      <filter id="ska-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* ── Hexagon frame ── */}
    {/* points at 0°,60°,120°,180°,240°,300° on a r=22 circle centred 24,24 */}
    <polygon
      points="24,3 43,13.5 43,34.5 24,45 5,34.5 5,13.5"
      stroke="url(#ska-hex-grad)"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />

    {/* ── Rising bar chart bars (form an S-curve trend) ── */}
    {/*  bar 1 — shortest, left                          */}
    <rect x="10" y="30" width="5"   height="10" rx="1.5" fill="url(#ska-bar-grad)" filter="url(#ska-glow)" />
    {/*  bar 2                                           */}
    <rect x="17" y="23" width="5"   height="17" rx="1.5" fill="url(#ska-bar-grad)" filter="url(#ska-glow)" />
    {/*  bar 3 — mid                                     */}
    <rect x="24" y="17" width="5"   height="23" rx="1.5" fill="url(#ska-bar-grad)" filter="url(#ska-glow)" />
    {/*  bar 4 — tallest, right (anchored to same baseline) */}
    <rect x="31" y="11" width="5"   height="29" rx="1.5" fill="url(#ska-bar-grad)" filter="url(#ska-glow)" />

    {/* ── Trend line connecting bar tops ── */}
    <polyline
      points="12.5,30 19.5,23 26.5,17 33.5,11"
      stroke="#C9A84C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.75"
    />

    {/* ── Gold dot at peak ── */}
    <circle cx="33.5" cy="11" r="2" fill="#C9A84C" />
  </svg>
);

export default Logo;
