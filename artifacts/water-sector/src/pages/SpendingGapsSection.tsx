import { useState } from "react";
import { ComposableMap, Geographies, Geography, Annotation } from "react-simple-maps";

const GEO_URL = "/wb-regions.geojson";
// Single merged land polygon — no internal country borders (generated locally)
const LAND_URL = "/world-land.geojson";

interface Region {
  id: string;
  label: string;
  amount: string;
  amountNum: number;
  highlight?: boolean;
  description: string;
  detail: string;
  fillColor: string;
  hoverColor: string;
  activeColor: string;
}

const REGIONS: Record<string, Region> = {
  SSA: {
    id: "SSA",
    label: "Sub-Saharan Africa",
    amount: "$73.5 billion",
    amountNum: 73.5,
    highlight: true,
    description:
      "SSA has the largest annual water and sanitation spending gap — nearly half of the global total.",
    detail:
      "Sub-Saharan Africa needs $73.5 billion annually to close its water and sanitation financing gap. This represents over 52% of the global total, driven by rapid population growth, weak utilities, and large rural-urban service disparities.",
    fillColor: "#7a1128",
    hoverColor: "#8b1a2d",
    activeColor: "#6d0f22",
  },
  SA: {
    id: "SA",
    label: "South Asia",
    amount: "$36.1 billion",
    amountNum: 36.1,
    description:
      "South Asia faces a $36.1 billion annual gap, driven by rapid population growth and expanding urban informal settlements.",
    detail:
      "South Asia requires $36.1 billion per year, with India and Pakistan accounting for the bulk of unmet needs. Rapid urbanisation and expanding peri-urban informal settlements outpace infrastructure investment.",
    fillColor: "#1a3a5c",
    hoverColor: "#1e4570",
    activeColor: "#163256",
  },
  MENA: {
    id: "MENA",
    label: "Middle East & North Africa",
    amount: "$12.1 billion",
    amountNum: 12.1,
    description:
      "MENA faces a $12.1 billion gap, compounded by water scarcity and conflict.",
    detail:
      "The Middle East & North Africa region needs $12.1 billion annually. Extreme water scarcity, protracted conflicts, and displacement crises compound infrastructure underinvestment, particularly in Yemen, Libya, and Syria.",
    fillColor: "#2e6da4",
    hoverColor: "#3478b5",
    activeColor: "#265e90",
  },
  LAC: {
    id: "LAC",
    label: "Latin America & Caribbean",
    amount: "$13.1 billion",
    amountNum: 13.1,
    description:
      "LAC requires $13.1 billion annually, with significant rural-urban disparities.",
    detail:
      "Latin America & Caribbean requires $13.1 billion annually. Despite better-than-average regional coverage, significant gaps persist in rural areas and among Indigenous and Afro-descendant communities in Bolivia, Haiti, and Central America.",
    fillColor: "#2e6da4",
    hoverColor: "#3478b5",
    activeColor: "#265e90",
  },
  ECA: {
    id: "ECA",
    label: "Europe & Central Asia",
    amount: "$3.2 billion",
    amountNum: 3.2,
    description:
      "ECA has the smallest gap at $3.2 billion, reflecting higher baseline infrastructure coverage.",
    detail:
      "Europe & Central Asia has the smallest financing gap at $3.2 billion, reflecting relatively higher baseline infrastructure coverage. Remaining gaps are concentrated in Central Asian republics and the Western Balkans.",
    fillColor: "#2e6da4",
    hoverColor: "#3478b5",
    activeColor: "#265e90",
  },
  EAP: {
    id: "EAP",
    label: "East Asia & Pacific",
    amount: "$2.9 billion",
    amountNum: 2.9,
    description:
      "EAP requires $2.9 billion annually, with large variation across the region.",
    detail:
      "East Asia & Pacific requires $2.9 billion annually — the smallest gap reflecting major gains from China and Southeast Asian economies. Remaining needs are concentrated in Pacific Island states and rural Myanmar and Timor-Leste.",
    fillColor: "#2e6da4",
    hoverColor: "#3478b5",
    activeColor: "#265e90",
  },
};

// Countries not in any WB region (high income, North America, etc.) - neutral color
const DEFAULT_FILL = "#c9dae8";
const DEFAULT_STROKE = "#fff";

// Geographic centroids [lon, lat] for callout labels on the map
const CALLOUTS: { id: string; subject: [number, number]; dx: number; dy: number }[] = [
  { id: "SSA",  subject: [22,  -5],  dx:  0,  dy: 0  },
  { id: "SA",   subject: [79,  26],  dx:  0,  dy: 0  },
  { id: "LAC",  subject: [-57, -12], dx:  0,  dy: 0  },
  { id: "MENA", subject: [38,  28],  dx:  0,  dy: 0  },
  { id: "ECA",  subject: [54,  52],  dx:  0,  dy: 0  },
  { id: "EAP",  subject: [118, 18],  dx:  0,  dy: 0  },
];

export function SpendingGapsSection() {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);

  const total = 140.8;

  return (
    <section>
      {/* Section header */}
      <div className="econ-rule pb-4 mb-6">
        <h1
          className="font-heading text-5xl font-black mt-3 leading-tight"
          style={{ color: "var(--econ-red)" }}
        >
          ${total} billion
        </h1>
        <h2
          className="font-heading text-2xl font-bold mt-1"
          style={{ color: "var(--econ-dark-blue)" }}
        >
          Annual Spending Gap in Water Supply and Sanitation
        </h2>
        <p className="text-base mt-1" style={{ color: "var(--econ-gray)" }}>
          To achieve SDG Targets 6.1 and 6.2 (2017–30). Lower estimates for
          113 countries in 2017 constant prices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Map — takes 2/3 */}
        <div
          className="lg:col-span-2 rounded-sm overflow-hidden"
          style={{ background: "#f8f5f0" }}
        >
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{ scale: 195, center: [10, 15] }}
            style={{ width: "100%", height: "auto", display: "block" }}
            width={960}
            height={490}
          >
            {/* Base land layer — single merged polygon, no internal borders */}
            <Geographies geography={LAND_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#c8d8e4"
                    stroke="#a8bfce"
                    strokeWidth={0.3}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* WB region layer — dissolved regions, coloured and clickable */}
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const regionId: string = geo.properties?.region;
                  const region = REGIONS[regionId];
                  const isActive = activeRegion?.id === regionId;
                  const isOther =
                    activeRegion && activeRegion.id !== regionId;

                  const fill = region
                    ? isActive
                      ? region.activeColor
                      : region.fillColor
                    : DEFAULT_FILL;

                  const opacity = isOther ? 0.45 : 1;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      fillOpacity={opacity}
                      stroke={DEFAULT_STROKE}
                      strokeWidth={0.6}
                      onClick={() => {
                        if (!region) return;
                        setActiveRegion((prev) =>
                          prev?.id === regionId ? null : region
                        );
                      }}
                      style={{
                        default: { outline: "none", cursor: region ? "pointer" : "default" },
                        hover: {
                          outline: "none",
                          fill: region ? region.hoverColor : "#b8cedd",
                          fillOpacity: 1,
                          cursor: region ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Region callout labels */}
            {CALLOUTS.map(({ id, subject, dx, dy }) => {
              const region = REGIONS[id];
              if (!region) return null;
              const faded = activeRegion && activeRegion.id !== id;
              return (
                <Annotation
                  key={id}
                  subject={subject}
                  dx={dx}
                  dy={dy}
                  connectorProps={{ stroke: "none" }}
                >
                  <text
                    textAnchor="middle"
                    fill="white"
                    opacity={faded ? 0.3 : 1}
                    style={{
                      fontSize: "13px",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 800,
                      pointerEvents: "none",
                    }}
                  >
                    {region.amount}
                  </text>
                  <text
                    textAnchor="middle"
                    y={16}
                    fill="rgba(255,255,255,0.85)"
                    opacity={faded ? 0.3 : 1}
                    style={{
                      fontSize: "9px",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600,
                      pointerEvents: "none",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {id}
                  </text>
                </Annotation>
              );
            })}
          </ComposableMap>

          {/* Map footer note */}
          <div
            className="px-4 py-2 text-xs flex justify-between"
            style={{ color: "var(--econ-gray)" }}
          >
            <span>Click a region to see details</span>
            {activeRegion && (
              <button
                className="underline"
                style={{ color: "var(--econ-mid-blue)" }}
                onClick={() => setActiveRegion(null)}
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Side panel — takes 1/3 */}
        <div className="flex flex-col gap-4">
          {activeRegion ? (
            /* Selected region detail card */
            <div
              className="rounded-sm p-5"
              style={{
                background: "white",
                border: "1px solid var(--econ-rule)",
                borderLeft: `4px solid ${activeRegion.fillColor}`,
              }}
            >
              <p
                className="font-heading font-black text-3xl leading-tight"
                style={{
                  color: activeRegion.highlight
                    ? "var(--econ-red)"
                    : "var(--econ-dark-blue)",
                }}
              >
                {activeRegion.amount}
              </p>
              <p
                className="font-heading font-semibold text-base mt-0.5"
                style={{ color: activeRegion.fillColor }}
              >
                {activeRegion.label}
              </p>
              <p
                className="text-xs uppercase tracking-wide font-semibold mt-1 mb-3"
                style={{ color: "var(--econ-gray)" }}
              >
                Annual spending gap
              </p>
              {/* Share of global total bar */}
              <div className="mb-3">
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--econ-gray)" }}
                >
                  Share of $140.8bn global gap
                </div>
                <div
                  style={{
                    height: 6,
                    background: "#e5e7eb",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(activeRegion.amountNum / 140.8) * 100}%`,
                      background: activeRegion.fillColor,
                      borderRadius: 3,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <div
                  className="text-xs mt-0.5 text-right"
                  style={{ color: "var(--econ-gray)" }}
                >
                  {((activeRegion.amountNum / 140.8) * 100).toFixed(1)}%
                </div>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#444" }}
              >
                {activeRegion.detail}
              </p>
            </div>
          ) : (
            /* Default summary card */
            <div
              className="rounded-sm p-5"
              style={{
                background: "white",
                border: "1px solid var(--econ-rule)",
                borderLeft: "4px solid var(--econ-red)",
              }}
            >
              <p
                className="font-heading font-black text-3xl leading-tight"
                style={{ color: "var(--econ-red)" }}
              >
                ${total}bn
              </p>
              <p
                className="font-heading font-semibold text-lg mt-0.5"
                style={{ color: "var(--econ-dark-blue)" }}
              >
                Global annual gap
              </p>
              <p
                className="text-sm mt-3 leading-relaxed"
                style={{ color: "#555" }}
              >
                Select a coloured region on the map to explore its spending
                gap, context, and share of the global total.
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--econ-gray)" }}
              >
                Regions shown: SSA · SA · MENA · LAC · ECA · EAP
              </p>
            </div>
          )}

          {/* Region quick-select list */}
          <div className="flex flex-col gap-2">
            {Object.values(REGIONS)
              .sort((a, b) => b.amountNum - a.amountNum)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() =>
                    setActiveRegion((prev) =>
                      prev?.id === r.id ? null : r
                    )
                  }
                  className="text-left px-3 py-2 rounded-sm flex items-center justify-between transition-all"
                  style={{
                    background:
                      activeRegion?.id === r.id
                        ? "var(--econ-pale-blue)"
                        : "white",
                    border: "1px solid var(--econ-rule)",
                    borderLeft: `3px solid ${r.fillColor}`,
                  }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--econ-gray)" }}
                  >
                    {r.id}
                  </span>
                  <span
                    className="font-heading font-bold text-sm"
                    style={{
                      color: r.highlight ? "var(--econ-red)" : "var(--econ-dark-blue)",
                    }}
                  >
                    {r.amount}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Running text */}
      <div
        className="mt-8"
        style={{
          color: "var(--econ-gray)",
          fontFamily: "var(--app-font-sans)",
          fontSize: "0.95rem",
          lineHeight: 1.7,
        }}
      >
        <p>
          The global annual financing gap to achieve universal access to safe
          water and sanitation (SDG 6.1 and 6.2) amounts to{" "}
          <strong style={{ color: "var(--econ-dark-blue)" }}>
            ${total} billion
          </strong>{" "}
          per year through 2030. Sub-Saharan Africa alone accounts for more
          than half this gap, at $73.5 billion annually. South Asia follows
          at $36.1 billion — together, these two regions represent over 77%
          of global unmet financing needs.
        </p>
      </div>
    </section>
  );
}
