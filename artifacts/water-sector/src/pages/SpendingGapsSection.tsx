import { useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, Annotation } from "react-simple-maps";

const GEO_URL = "/wb-regions.geojson";
// Single merged land polygon — no internal country borders (generated locally)
const LAND_URL = "/world-land.geojson";

interface Region {
  id: string;
  label: string;
  amount: string;
  amountNum: number;
  currentSpend: number;
  highlight?: boolean;
  description: string;
  detail: string;
  fillColor: string;
  hoverColor: string;
  activeColor: string;
}

const REGIONS: Record<string, Region> = {
  // Ordinal colour scale: dark crimson → rust → terracotta → steel blue → medium navy → dark navy
  // ordered by spending gap (largest → smallest)
  SSA: {
    id: "SSA",
    label: "Sub-Saharan Africa",
    amount: "$73.5 billion",
    amountNum: 73.5,
    currentSpend: 4.6,
    highlight: true,
    description:
      "SSA has the largest annual water and sanitation spending gap — nearly half of the global total.",
    detail:
      "Sub-Saharan Africa needs $73.5 billion annually to close its water and sanitation financing gap. This represents over 52% of the global total, driven by rapid population growth, weak utilities, and large rural-urban service disparities.",
    fillColor: "#8b1a2d",
    hoverColor: "#a01f35",
    activeColor: "#75151f",
  },
  SA: {
    id: "SA",
    label: "South Asia",
    amount: "$36.1 billion",
    amountNum: 36.1,
    currentSpend: 4.7,
    description:
      "South Asia faces a $36.1 billion annual gap, driven by rapid population growth and expanding urban informal settlements.",
    detail:
      "South Asia requires $36.1 billion per year, with India and Pakistan accounting for the bulk of unmet needs. Rapid urbanisation and expanding peri-urban informal settlements outpace infrastructure investment.",
    fillColor: "#b85c70",
    hoverColor: "#c96880",
    activeColor: "#a54f62",
  },
  LAC: {
    id: "LAC",
    label: "Latin America & Caribbean",
    amount: "$13.1 billion",
    amountNum: 13.1,
    currentSpend: 8.0,
    description:
      "LAC requires $13.1 billion annually, with significant rural-urban disparities.",
    detail:
      "Latin America & Caribbean requires $13.1 billion annually. Despite better-than-average regional coverage, significant gaps persist in rural areas and among Indigenous and Afro-descendant communities in Bolivia, Haiti, and Central America.",
    fillColor: "#d4909e",
    hoverColor: "#dea0ac",
    activeColor: "#c07f8c",
  },
  MENA: {
    id: "MENA",
    label: "Middle East & North Africa",
    amount: "$12.1 billion",
    amountNum: 12.1,
    currentSpend: 5.0,
    description:
      "MENA faces a $12.1 billion gap, compounded by water scarcity and conflict.",
    detail:
      "The Middle East & North Africa region needs $12.1 billion annually. Extreme water scarcity, protracted conflicts, and displacement crises compound infrastructure underinvestment, particularly in Yemen, Libya, and Syria.",
    fillColor: "#6699cc",
    hoverColor: "#75a8d8",
    activeColor: "#5588b5",
  },
  ECA: {
    id: "ECA",
    label: "Europe & Central Asia",
    amount: "$3.2 billion",
    amountNum: 3.2,
    currentSpend: 15.0,
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
    currentSpend: 32.2,
    description:
      "EAP requires $2.9 billion annually, with large variation across the region.",
    detail:
      "East Asia & Pacific requires $2.9 billion annually — the smallest gap reflecting major gains from China and Southeast Asian economies. Remaining needs are concentrated in Pacific Island states and rural Myanmar and Timor-Leste.",
    fillColor: "#1a3a5c",
    hoverColor: "#1f4368",
    activeColor: "#152f4c",
  },
};

// Countries not in any WB region (high income, North America, etc.) - neutral color
const DEFAULT_FILL = "#c9dae8";
const DEFAULT_STROKE = "#fff";

// Navigation order for the overlay card (largest gap first)
const REGION_ORDER = ["SSA", "SA", "LAC", "MENA", "ECA", "EAP"];

// Geographic centroids [lon, lat] for callout labels on the map
const CALLOUTS: { id: string; subject: [number, number]; dx: number; dy: number }[] = [
  { id: "SSA",  subject: [22,  -4],  dx:  0,  dy: 0  },
  { id: "SA",   subject: [80,  27],  dx:  0,  dy: 0  },
  { id: "LAC",  subject: [-60, -16], dx:  0,  dy: 0  },
  { id: "MENA", subject: [27,  22],  dx:  0,  dy: 0  },
  { id: "ECA",  subject: [62,  54],  dx:  0,  dy: 0  },
  { id: "EAP",  subject: [130, 20],  dx:  0,  dy: 0  },
];

export function SpendingGapsSection() {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  // Keeps last selected region visible while the overlay fades out
  const [displayRegion, setDisplayRegion] = useState<Region | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (activeRegion) setDisplayRegion(activeRegion); }, [activeRegion]);

  const FADE_MS = 350; // must match the CSS transition duration

  const transitionTo = (next: Region | null) => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setActiveRegion(null); // triggers fade-out (opacity → 0)
    fadeTimer.current = setTimeout(() => {
      setActiveRegion(next); // triggers fade-in with new content
    }, FADE_MS);
  };

  const navigateNext = () => {
    const currentId = activeRegion?.id ?? REGION_ORDER[0];
    const idx = REGION_ORDER.indexOf(currentId);
    if (idx >= REGION_ORDER.length - 1) {
      transitionTo(null); // close after last region
    } else {
      transitionTo(REGIONS[REGION_ORDER[idx + 1]]);
    }
  };

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

      <div className="relative">
        {/* Map — full width */}
        <div
          className="rounded-sm overflow-hidden"
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
                      style={{
                        default: { outline: "none", cursor: "default" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Region callout labels — rounded badge, uniform navy */}
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
                  {/* Badge background */}
                  <rect
                    x={-64}
                    y={-22}
                    width={128}
                    height={44}
                    rx={6}
                    ry={6}
                    fill="#1a3a5c"
                    opacity={faded ? 0.25 : 0.88}
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Amount */}
                  <text
                    textAnchor="middle"
                    y={-2}
                    fill="white"
                    opacity={faded ? 0.3 : 1}
                    style={{
                      fontSize: "15px",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 800,
                      pointerEvents: "none",
                    }}
                  >
                    {region.amount}
                  </text>
                  {/* Region code */}
                  <text
                    textAnchor="middle"
                    y={16}
                    fill="rgba(255,255,255,0.8)"
                    opacity={faded ? 0.3 : 1}
                    style={{
                      fontSize: "11px",
                      fontFamily: "Nunito, sans-serif",
                      fontWeight: 600,
                      pointerEvents: "none",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {id}
                  </text>
                </Annotation>
              );
            })}
          </ComposableMap>

          {/* Map footer — "more info" trigger button */}
          <div className="px-4 py-2 flex items-center">
            <button
              onClick={() =>
                activeRegion ? transitionTo(null) : transitionTo(REGIONS[REGION_ORDER[0]])
              }
              style={{
                fontSize: 12,
                fontFamily: "Nunito, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: "#fff",
                background: "var(--econ-dark-blue)",
                border: "none",
                borderRadius: 20,
                padding: "7px 18px",
                cursor: "pointer",
              }}
            >
              Click here for more information
            </button>
          </div>
        </div>

        {/* Detail overlay — flex row: [card] + [circular next button] */}
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: activeRegion ? 1 : 0,
            pointerEvents: activeRegion ? "auto" : "none",
            transition: "opacity 0.35s ease",
            zIndex: 10,
          }}
        >
          {/* Card */}
          {displayRegion && (
            <div
              className="rounded-sm p-7"
              style={{
                width: 364,
                background: "rgba(255,255,255,0.96)",
                border: "1px solid var(--econ-rule)",
                borderLeft: `4px solid ${displayRegion.fillColor}`,
                boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                position: "relative",
              }}
            >
              {/* Counter — top right of card */}
              <span
                style={{
                  position: "absolute",
                  top: 14,
                  right: 17,
                  fontSize: 14,
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 700,
                  color: "var(--econ-gray)",
                  letterSpacing: "0.05em",
                }}
              >
                {REGION_ORDER.indexOf(displayRegion.id) + 1} / {REGION_ORDER.length}
              </span>

              {/* Amount */}
              <p
                className="font-heading font-black text-4xl leading-tight"
                style={{
                  color: "var(--econ-red)",
                  paddingRight: 50,
                }}
              >
                {displayRegion.amount}
              </p>
              <p className="font-heading font-semibold text-xl mt-0.5" style={{ color: "var(--econ-dark-blue)" }}>
                {displayRegion.label}
              </p>
              <p className="text-sm uppercase tracking-wide font-semibold mt-1 mb-4" style={{ color: "var(--econ-gray)" }}>
                Annual spending gap
              </p>

              {/* Dumbbell: current spend → required spend */}
              {(() => {
                const current = displayRegion.currentSpend;
                const required = current + displayRegion.amountNum;
                const multiplier = required / current;
                const multiplierLabel =
                  multiplier >= 10
                    ? `${Math.round(multiplier)}×`
                    : `${multiplier.toFixed(1)}×`;
                return (
                  <div className="mb-5">
                    <div className="text-sm mb-3" style={{ color: "var(--econ-gray)" }}>
                      Current vs. required annual spending
                    </div>
                    {/* Dollar labels above dots */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--econ-red)" }}>
                        ${current}bn
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--econ-dark-blue)" }}>
                        ${required % 1 === 0 ? required.toFixed(0) : required.toFixed(1)}bn
                      </span>
                    </div>
                    {/* Dumbbell track */}
                    <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
                      {/* Multiplier badge centred above the line */}
                      <div style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        top: -28,
                        fontSize: 21,
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900,
                        color: "var(--econ-dark-blue)",
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.01em",
                      }}>
                        {multiplierLabel}
                      </div>
                      {/* Connecting line */}
                      <div style={{
                        position: "absolute",
                        left: 10,
                        right: 10,
                        height: 3,
                        background: "#d0d5dd",
                      }} />
                      {/* Left dot — current spend */}
                      <div style={{
                        position: "absolute",
                        left: 0,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "var(--econ-red)",
                        border: "2px solid #fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                      }} />
                      {/* Right dot — required spend */}
                      <div style={{
                        position: "absolute",
                        right: 0,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "var(--econ-dark-blue)",
                        border: "2px solid #fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                      }} />
                    </div>
                    {/* Legend labels */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                      <span style={{ fontSize: 13, color: "var(--econ-gray)" }}>Current</span>
                      <span style={{ fontSize: 13, color: "var(--econ-gray)" }}>Required for SDGs</span>
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const current = displayRegion.currentSpend;
                const required = current + displayRegion.amountNum;
                const multiplier = required / current;
                const mult =
                  multiplier >= 10
                    ? `${Math.round(multiplier)}×`
                    : `${multiplier.toFixed(1)}×`;
                const reqStr =
                  required % 1 === 0 ? required.toFixed(0) : required.toFixed(1);
                return (
                  <p className="text-sm leading-relaxed" style={{ color: "#444" }}>
                    <strong>{displayRegion.id}</strong> currently spends <strong>${current}bn</strong> per year on water and
                    sanitation. Closing the <strong>{displayRegion.amount}</strong> annual gap
                    requires <strong>${reqStr}bn</strong> — <strong>{mult}</strong> more than
                    current spending levels.
                  </p>
                );
              })()}

              {/* Close button — bottom right */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <button
                  onClick={() => setActiveRegion(null)}
                  style={{
                    fontSize: 14,
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "var(--econ-gray)",
                    textTransform: "uppercase",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Close ✕
                </button>
              </div>
            </div>
          )}

          {/* Circular next button — outside card, vertically centred by flex */}
          <button
            onClick={navigateNext}
            title={
              activeRegion && REGION_ORDER.indexOf(activeRegion.id) >= REGION_ORDER.length - 1
                ? "Close"
                : "Next region"
            }
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "#1a3a5c",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Notes */}
      <p className="mt-6 text-xs leading-relaxed" style={{ color: "var(--econ-gray)" }}>
        <span className="font-semibold">Notes:</span> Lower estimates for 113 countries in 2017 constant prices. Regional boundaries are for illustration purposes only.
      </p>

      {/* Source citation */}
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--econ-gray)" }}>
        <span className="font-semibold">Source:</span> Joseph, George; Hoo, Yi Rong; Wang, Qiao; Bahuguna, Aroha; Andres, Luis Alberto.{" "}
        <em>Funding a Water-Secure Future: An Assessment of Global Public Spending</em> (English).
        Washington, D.C.: World Bank Group.{" "}
        <a
          href="http://documents.worldbank.org/curated/en/099050624154572979"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--econ-mid-blue)", textDecoration: "underline" }}
        >
          documents.worldbank.org
        </a>
      </p>
    </section>
  );
}
