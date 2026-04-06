import { useState, useRef } from "react";

interface SectorData {
  id: string;
  label: string;
  sublabel?: string;
  executed: number;
  unspent: number;
  color: string;
  unspentColor: string;
  highlight?: boolean;
  description: string;
  detail: string;
}

const sectors: SectorData[] = [
  {
    id: "human",
    label: "Human",
    sublabel: "Development",
    executed: 99,
    unspent: 1,
    color: "#1a3a5c",
    unspentColor: "#8da8be",
    description: "Near-perfect budget utilisation",
    detail:
      "The Human Development sector consistently achieves near-complete budget execution, reflecting strong institutional capacity, well-established project pipelines, and predictable expenditure patterns.",
  },
  {
    id: "transport",
    label: "Transport",
    executed: 91,
    unspent: 9,
    color: "#2e6da4",
    unspentColor: "#a5bdd6",
    description: "Strong execution with minor slippage",
    detail:
      "Transport infrastructure spending reaches 91% execution on average — a strong result reflecting mature procurement processes, though some capital projects face end-of-year absorption delays.",
  },
  {
    id: "agriculture",
    label: "Agriculture",
    executed: 89,
    unspent: 11,
    color: "#8b1a2d",
    unspentColor: "#c9a0a8",
    description: "Moderate absorption constraints",
    detail:
      "Agriculture spending execution reaches 89%, with unspent funds often linked to weather-dependent project timelines, complex land-use approvals, and fragmented implementation across multiple agencies.",
  },
  {
    id: "water",
    label: "Water",
    executed: 72,
    unspent: 28,
    color: "#b85c70",
    unspentColor: "#e8b4c0",
    highlight: true,
    description: "Significant absorption gap — over 1/4 unspent",
    detail:
      "The water sector has the lowest budget execution rate at 72%. Over a quarter of budgeted funds go unspent each year, pointing to structural weaknesses in project management, procurement, and technical capacity. This is particularly stark given the sector's large financing gap.",
  },
];

const CHART_H = 280; // total chart drawing area height
const GRIDLINES = [0, 25, 50, 75, 100];

const SECTOR_ORDER = sectors.map((s) => s.id);

export function BudgetExecutionSection() {
  const [activeBar, setActiveBar] = useState<SectorData | null>(null);
  const [displayedActiveBar, setDisplayedActiveBar] = useState<SectorData | null>(null);
  const [hoveredBar, setHoveredBar] = useState<SectorData | null>(null);
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focused = hoveredBar || displayedActiveBar;

  const transitionTo = (next: SectorData | null) => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setFading(true);
    setActiveBar(next);
    fadeTimer.current = setTimeout(() => {
      setDisplayedActiveBar(next);
      setFading(false);
    }, 220);
  };

  const navigateNext = () => {
    const currentIdx = activeBar ? SECTOR_ORDER.indexOf(activeBar.id) : -1;
    const nextIdx = currentIdx + 1;
    transitionTo(nextIdx >= SECTOR_ORDER.length ? null : sectors[nextIdx]);
  };

  return (
    <section>
      {/* Section header */}
      <div className="econ-rule pb-4 mb-6">
        <h2
          className="font-heading text-3xl font-bold mt-3"
          style={{ color: "var(--econ-dark-blue)" }}
        >
          The water sector faces low budget execution
        </h2>
        <p className="text-base mt-1" style={{ color: "var(--econ-gray)" }}>
          Average Budget Execution Rates by Sector, 2009–20
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* ── Bar chart ── */}
        <div
          className="rounded-sm p-6"
          style={{
            background: "var(--econ-pale-blue)",
            border: "1px solid var(--econ-rule)",
          }}
        >
          {/* Chart area */}
          <div
            className="relative"
            style={{ height: CHART_H }}
          >
            {/* Y-axis gridlines + labels */}
            {GRIDLINES.map((pct) => {
              const topPx = CHART_H - (pct / 100) * CHART_H;
              return (
                <div
                  key={pct}
                  className="absolute left-0 right-0 flex items-center"
                  style={{ top: topPx }}
                >
                  {/* Y label */}
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--econ-gray)",
                      width: 28,
                      textAlign: "right",
                      flexShrink: 0,
                      transform: "translateY(-50%)",
                      lineHeight: 1,
                      paddingRight: 4,
                    }}
                  >
                    {pct}%
                  </span>
                  {/* Gridline */}
                  <div
                    style={{
                      flex: 1,
                      borderTop: `1px ${pct === 100 ? "solid" : "dashed"} var(--econ-rule)`,
                      opacity: pct === 100 ? 0.9 : 0.55,
                    }}
                  />
                </div>
              );
            })}

            {/* Bars — sit inside the chart area, left-padded past Y labels */}
            <div
              className="absolute inset-0 flex items-end"
              style={{ paddingLeft: 34, gap: 16 }}
            >
              {sectors.map((s) => {
                const isHovered = hoveredBar?.id === s.id;
                const isActive = activeBar?.id === s.id;
                const isHighlighted = isHovered || isActive;

                const execFrac = s.executed / 100;
                const unspentFrac = s.unspent / 100;

                return (
                  <div
                    key={s.id}
                    className="flex-1 cursor-pointer"
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "3px 3px 0 0",
                      overflow: "hidden",
                      outline: isHighlighted
                        ? `2px solid ${s.color}`
                        : "2px solid transparent",
                      transition: "outline 0.15s",
                    }}
                    onMouseEnter={() => setHoveredBar(s)}
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() =>
                      transitionTo(activeBar?.id === s.id ? null : s)
                    }
                  >
                    {/* Unspent (top portion) */}
                    <div
                      style={{
                        height: `${unspentFrac * 100}%`,
                        background: s.unspentColor,
                        flexShrink: 0,
                      }}
                    />

                    {/* Executed (bottom portion) */}
                    <div
                      style={{
                        flex: 1,
                        background: s.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255,255,255,0.95)",
                          fontSize: 15,
                          fontFamily: "var(--app-font-heading)",
                          fontWeight: "bold",
                        }}
                      >
                        {s.executed}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels — outside chart area, below baseline */}
          <div
            className="flex mt-2"
            style={{ paddingLeft: 34, gap: 16 }}
          >
            {sectors.map((s) => (
              <div
                key={s.id}
                className="flex-1 text-center"
                style={{
                  fontSize: 12,
                  color:
                    (hoveredBar?.id === s.id || activeBar?.id === s.id)
                      ? s.color
                      : "var(--econ-gray)",
                  fontWeight:
                    hoveredBar?.id === s.id || activeBar?.id === s.id
                      ? 600
                      : 400,
                  transition: "color 0.15s",
                  lineHeight: 1.3,
                }}
              >
                {s.label}
                {s.sublabel && (
                  <>
                    <br />
                    {s.sublabel}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div
            className="flex items-center gap-4 mt-4 pt-3"
            style={{ borderTop: "1px solid var(--econ-rule)" }}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: "var(--econ-dark-blue)" }}
              />
              <span style={{ fontSize: 11, color: "var(--econ-gray)" }}>
                Executed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: "var(--econ-light-blue)" }}
              />
              <span style={{ fontSize: 11, color: "var(--econ-gray)" }}>
                Unspent
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                color: "var(--econ-gray)",
                marginLeft: "auto",
              }}
            >
              Click bar for details
            </span>
          </div>
        </div>

        {/* ── Detail / callout panel + nav button ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            flex: 1,
            opacity: hoveredBar ? 1 : fading ? 0 : 1,
            transition: hoveredBar ? "none" : "opacity 0.22s ease",
          }}>
          {focused ? (
            <div
              className="rounded-sm p-6"
              style={{
                background: "white",
                border: "1px solid var(--econ-rule)",
                borderLeft: `4px solid ${focused.color}`,
              }}
            >
              <p
                className="font-heading font-black text-4xl leading-tight"
                style={{
                  color: focused.highlight
                    ? "var(--econ-red)"
                    : "var(--econ-dark-blue)",
                }}
              >
                {focused.executed}%
              </p>
              <p
                className="font-heading font-bold text-lg mt-0.5"
                style={{ color: focused.color }}
              >
                {focused.label}
                {focused.sublabel ? ` ${focused.sublabel}` : ""}
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-wide mt-1 mb-3"
                style={{ color: "var(--econ-gray)" }}
              >
                {focused.description}
              </p>
              {/* Progress bar */}
              <div
                className="rounded-sm overflow-hidden mb-3"
                style={{ height: 8, background: focused.unspentColor }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${focused.executed}%`,
                    background: focused.color,
                    borderRadius: "3px 0 0 3px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#444" }}
              >
                {focused.detail}
              </p>
            </div>
          ) : (
            <div>
              {/* Default callout */}
              <div
                className="rounded-sm p-6"
                style={{
                  background: "white",
                  border: "1px solid var(--econ-rule)",
                  borderLeft: "4px solid var(--econ-red)",
                }}
              >
                <p
                  className="font-heading font-black text-4xl leading-tight"
                  style={{ color: "var(--econ-red)" }}
                >
                  In the water sector,
                  <br />
                  over 1/4 of funds
                  <br />
                  were not used
                </p>
                <p
                  className="text-sm mt-4 leading-relaxed"
                  style={{ color: "#555" }}
                >
                  Despite the need for increased spending, over a quarter of
                  budgeted funds go unspent in the water sector each year —
                  highlighting the sector's limited absorptive capacity and
                  institutional constraints.
                </p>
                <p
                  className="text-xs mt-3"
                  style={{ color: "var(--econ-gray)" }}
                >
                  Hover over or click a bar to explore each sector.
                </p>
              </div>

            </div>
          )}
          </div>

          {/* Circular next button */}
          <button
            onClick={navigateNext}
            title={
              activeBar && SECTOR_ORDER.indexOf(activeBar.id) >= SECTOR_ORDER.length - 1
                ? "Reset"
                : "Next sector"
            }
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--econ-dark-blue)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}
          >
            ›
          </button>
        </div>
      </div>

    </section>
  );
}
