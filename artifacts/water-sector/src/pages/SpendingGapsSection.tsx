import { useState, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Region {
  id: string;
  label: string;
  amount: string;
  amountNum: number;
  coordinates: [number, number];
  labelOffset: [number, number];
  highlight?: boolean;
  description: string;
}

const regions: Region[] = [
  {
    id: "SSA",
    label: "SSA",
    amount: "$73.5 billion",
    amountNum: 73.5,
    coordinates: [20, 2],
    labelOffset: [0, 24],
    highlight: true,
    description: "Sub-Saharan Africa has the largest annual water and sanitation spending gap — nearly half of the global total.",
  },
  {
    id: "SA",
    label: "SA",
    amount: "$36.1 billion",
    amountNum: 36.1,
    coordinates: [78, 22],
    labelOffset: [0, 22],
    description: "South Asia faces a $36.1 billion annual gap, driven by rapid population growth and expanding urban informal settlements.",
  },
  {
    id: "MENA",
    label: "MENA",
    amount: "$12.1 billion",
    amountNum: 12.1,
    coordinates: [38, 30],
    labelOffset: [0, -18],
    description: "The Middle East & North Africa region faces a $12.1 billion gap, compounded by water scarcity and conflict.",
  },
  {
    id: "LAC",
    label: "LAC",
    amount: "$13.1 billion",
    amountNum: 13.1,
    coordinates: [-65, -10],
    labelOffset: [0, 22],
    description: "Latin America & Caribbean requires $13.1 billion annually, with significant disparities between rural and urban areas.",
  },
  {
    id: "ECA",
    label: "ECA",
    amount: "$3.2 billion",
    amountNum: 3.2,
    coordinates: [55, 54],
    labelOffset: [0, -18],
    description: "Europe & Central Asia has the smallest gap at $3.2 billion, reflecting relatively higher baseline infrastructure coverage.",
  },
  {
    id: "EAP",
    label: "EAP",
    amount: "$2.9 billion",
    amountNum: 2.9,
    coordinates: [118, 18],
    labelOffset: [0, 22],
    description: "East Asia & Pacific requires $2.9 billion annually, with large variation between high-growth economies and island states.",
  },
];

function getLabelColor(r: Region) {
  if (r.highlight) return "#fff";
  return "#fff";
}

function getBoxColor(r: Region) {
  if (r.highlight) return "var(--econ-red)";
  return "var(--econ-dark-blue)";
}

export function SpendingGapsSection() {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMarkerEnter(region: Region, e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setActiveRegion(region);
  }

  function handleMarkerLeave() {
    setActiveRegion(null);
  }

  function handleMarkerClick(region: Region) {
    setActiveRegion((prev) => (prev?.id === region.id ? null : region));
  }

  const total = 140.8;

  return (
    <section>
      {/* Section header */}
      <div className="econ-rule pb-4 mb-6">
        <h1 className="font-heading text-5xl font-black mt-3 leading-tight" style={{ color: "var(--econ-red)" }}>
          ${total} billion
        </h1>
        <h2 className="font-heading text-2xl font-bold mt-1" style={{ color: "var(--econ-dark-blue)" }}>
          Annual Spending Gap in Water Supply and Sanitation
        </h2>
        <p className="text-base mt-1" style={{ color: "var(--econ-gray)" }}>
          To achieve SDG Targets 6.1 and 6.2 (2017–30). Lower estimates for 113 countries in 2017 constant prices.
        </p>
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        className="relative rounded-sm overflow-hidden"
        style={{ background: "var(--econ-pale-blue)", border: "1px solid var(--econ-rule)" }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [20, 10] }}
          style={{ width: "100%", height: "auto" }}
          height={420}
        >
          <ZoomableGroup zoom={1} center={[20, 10]} disablePanning={true}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#c9dae8"
                    stroke="#fff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#b8cedd" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {regions.map((region) => {
              const isActive = activeRegion?.id === region.id;
              const boxColor = isActive ? "var(--econ-red)" : getBoxColor(region);
              const boxW = region.amountNum > 30 ? 110 : region.amountNum > 10 ? 104 : 100;
              const boxH = 36;

              return (
                <Marker
                  key={region.id}
                  coordinates={region.coordinates}
                  onMouseEnter={(e) => handleMarkerEnter(region, e as unknown as React.MouseEvent)}
                  onMouseLeave={handleMarkerLeave}
                  onClick={() => handleMarkerClick(region)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Dot */}
                  <circle
                    r={4 + region.amountNum / 14}
                    fill={isActive ? "var(--econ-red)" : "var(--econ-dark-blue)"}
                    stroke="white"
                    strokeWidth={1.5}
                    opacity={0.9}
                  />

                  {/* Label box */}
                  <rect
                    x={region.labelOffset[0] - boxW / 2}
                    y={
                      region.labelOffset[1] < 0
                        ? region.labelOffset[1] - boxH
                        : region.labelOffset[1]
                    }
                    width={boxW}
                    height={boxH}
                    fill={boxColor}
                    rx={2}
                    opacity={0.92}
                    style={{ transition: "fill 0.2s" }}
                  />

                  {/* Amount text */}
                  <text
                    x={region.labelOffset[0]}
                    y={
                      region.labelOffset[1] < 0
                        ? region.labelOffset[1] - boxH + 14
                        : region.labelOffset[1] + 14
                    }
                    textAnchor="middle"
                    fill={getLabelColor(region)}
                    fontSize={11}
                    fontWeight="bold"
                    fontFamily="'Playfair Display', serif"
                  >
                    {region.amount}
                  </text>

                  {/* Region label text */}
                  <text
                    x={region.labelOffset[0]}
                    y={
                      region.labelOffset[1] < 0
                        ? region.labelOffset[1] - boxH + 26
                        : region.labelOffset[1] + 26
                    }
                    textAnchor="middle"
                    fill={getLabelColor(region)}
                    fontSize={9.5}
                    fontFamily="'Source Serif 4', serif"
                    opacity={0.85}
                  >
                    {region.label}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {activeRegion && (
          <div
            className="tooltip-box"
            style={{
              left: tooltipPos.x + 14,
              top: tooltipPos.y - 20,
              maxWidth: 220,
            }}
          >
            <p className="font-heading font-bold text-base" style={{ color: "var(--econ-red)" }}>
              {activeRegion.amount}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--econ-dark-blue)" }}>
              {activeRegion.label}
            </p>
            <p className="text-xs leading-snug" style={{ color: "#444" }}>
              {activeRegion.description}
            </p>
          </div>
        )}

        {/* Legend note */}
        <div className="absolute bottom-3 left-3 text-xs" style={{ color: "#555" }}>
          <span>Hover or click a region for details</span>
        </div>
      </div>

      {/* Callout panel */}
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3">
        {regions.map((r) => (
          <button
            key={r.id}
            onClick={() => handleMarkerClick(r)}
            onMouseEnter={() => setActiveRegion(r)}
            onMouseLeave={() => setActiveRegion(null)}
            className="text-left p-4 rounded-sm transition-all duration-150"
            style={{
              background:
                activeRegion?.id === r.id ? "var(--econ-pale-blue)" : "white",
              border:
                activeRegion?.id === r.id
                  ? "1px solid var(--econ-mid-blue)"
                  : "1px solid var(--econ-rule)",
              borderLeft: `3px solid ${r.highlight ? "var(--econ-red)" : "var(--econ-dark-blue)"}`,
            }}
          >
            <p
              className="font-heading font-bold text-lg"
              style={{ color: r.highlight ? "var(--econ-red)" : "var(--econ-dark-blue)" }}
            >
              {r.amount}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--econ-gray)" }}>
              {r.label}
            </p>
          </button>
        ))}
      </div>

      {/* Running text */}
      <div className="mt-8 prose prose-sm max-w-none" style={{ color: "var(--econ-gray)", fontFamily: "var(--app-font-sans)", fontSize: "0.95rem" }}>
        <p>
          The global annual financing gap to achieve universal access to safe water and sanitation (SDG 6.1 and 6.2) amounts to{" "}
          <strong style={{ color: "var(--econ-dark-blue)" }}>${total} billion</strong> per year through 2030.
          Sub-Saharan Africa alone accounts for more than half this gap, at $73.5 billion annually.
          South Asia follows at $36.1 billion — together, these two regions represent over 77% of global unmet financing needs.
        </p>
      </div>
    </section>
  );
}
