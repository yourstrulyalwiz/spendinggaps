import { useState } from "react";

interface SectorData {
  id: string;
  label: string;
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
    label: "Human Development",
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

const BAR_MAX_HEIGHT = 260;

export function BudgetExecutionSection() {
  const [activeBar, setActiveBar] = useState<SectorData | null>(null);
  const [hoveredBar, setHoveredBar] = useState<SectorData | null>(null);

  const focused = hoveredBar || activeBar;

  return (
    <section>
      {/* Section header */}
      <div className="econ-rule pb-4 mb-6">
        <h2 className="font-heading text-3xl font-bold mt-3" style={{ color: "var(--econ-dark-blue)" }}>
          The water sector faces low budget execution
        </h2>
        <p className="text-base mt-1" style={{ color: "var(--econ-gray)" }}>
          Average Budget Execution Rates by Sector, 2009–20
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Chart */}
        <div>
          <div
            className="relative p-6 rounded-sm"
            style={{
              background: "var(--econ-pale-blue)",
              border: "1px solid var(--econ-rule)",
            }}
          >
            {/* Y-axis gridlines */}
            <div className="relative" style={{ height: BAR_MAX_HEIGHT + 40 }}>
              {/* Gridlines at 25, 50, 75, 100 */}
              {[100, 75, 50, 25].map((v) => {
                const y = BAR_MAX_HEIGHT - (v / 100) * BAR_MAX_HEIGHT;
                return (
                  <div
                    key={v}
                    className="absolute w-full flex items-center"
                    style={{ top: y, left: 0 }}
                  >
                    <span
                      className="text-xs absolute"
                      style={{
                        left: -28,
                        color: "var(--econ-gray)",
                        transform: "translateY(-50%)",
                        fontSize: "11px",
                      }}
                    >
                      {v}%
                    </span>
                    <div
                      className="w-full"
                      style={{
                        borderTop: `1px ${v === 100 ? "solid" : "dashed"} var(--econ-rule)`,
                        opacity: v === 100 ? 1 : 0.6,
                      }}
                    />
                  </div>
                );
              })}

              {/* Bars */}
              <div
                className="flex items-end gap-4 absolute bottom-0 left-0 right-0"
                style={{ paddingLeft: 6, paddingRight: 6 }}
              >
                {sectors.map((s) => {
                  const execH = (s.executed / 100) * BAR_MAX_HEIGHT;
                  const unspentH = (s.unspent / 100) * BAR_MAX_HEIGHT;
                  const isActive = activeBar?.id === s.id;
                  const isHovered = hoveredBar?.id === s.id;
                  const isHighlighted = isActive || isHovered;

                  return (
                    <div
                      key={s.id}
                      className="flex-1 flex flex-col items-center cursor-pointer group"
                      onMouseEnter={() => setHoveredBar(s)}
                      onMouseLeave={() => setHoveredBar(null)}
                      onClick={() => setActiveBar((prev) => (prev?.id === s.id ? null : s))}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {/* Executed % label */}
                        <span
                          className="font-heading font-bold text-lg mb-1 block text-center"
                          style={{
                            color: isHighlighted ? s.color : s.color,
                            opacity: isHighlighted ? 1 : 0.85,
                            transition: "opacity 0.15s",
                          }}
                        >
                          {s.executed}%
                        </span>

                        {/* Stacked bar */}
                        <div
                          style={{
                            width: "100%",
                            height: BAR_MAX_HEIGHT,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            position: "relative",
                          }}
                        >
                          {/* Full bar container */}
                          <div
                            style={{
                              height: BAR_MAX_HEIGHT,
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: "3px 3px 0 0",
                              overflow: "hidden",
                              boxShadow: isHighlighted ? `0 0 0 2px ${s.color}` : "none",
                              transition: "box-shadow 0.15s",
                            }}
                          >
                            {/* Unspent (top) */}
                            <div
                              style={{
                                height: unspentH,
                                background: s.unspentColor,
                                transition: "height 0.3s ease",
                                flexShrink: 0,
                              }}
                            />
                            {/* Executed (bottom) */}
                            <div
                              style={{
                                flex: 1,
                                background: s.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.15s",
                              }}
                            >
                              {/* Executed % inside bar */}
                              {execH > 40 && (
                                <span
                                  style={{
                                    color: "rgba(255,255,255,0.9)",
                                    fontSize: "14px",
                                    fontFamily: "var(--app-font-heading)",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {s.executed}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* X-axis label */}
                      <p
                        className="text-center mt-2 leading-tight"
                        style={{
                          fontSize: "12px",
                          color: isHighlighted ? s.color : "var(--econ-gray)",
                          fontWeight: isHighlighted ? 600 : 400,
                          transition: "color 0.15s",
                          maxWidth: 80,
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "1px solid var(--econ-rule)" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: "var(--econ-dark-blue)" }} />
                <span style={{ fontSize: 11, color: "var(--econ-gray)" }}>Executed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: "var(--econ-light-blue)" }} />
                <span style={{ fontSize: 11, color: "var(--econ-gray)" }}>Unspent</span>
              </div>
              <span style={{ fontSize: 10, color: "var(--econ-gray)", marginLeft: "auto" }}>Click bar for details</span>
            </div>
          </div>
        </div>

        {/* Callout panel */}
        <div>
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
                className="font-heading font-black text-3xl leading-tight"
                style={{ color: focused.highlight ? "var(--econ-red)" : "var(--econ-dark-blue)" }}
              >
                {focused.executed}%
              </p>
              <p
                className="font-heading font-bold text-lg mt-0.5"
                style={{ color: focused.color }}
              >
                {focused.label}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide mt-1 mb-3" style={{ color: "var(--econ-gray)" }}>
                {focused.description}
              </p>
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
              <p className="text-sm leading-relaxed" style={{ color: "#444" }}>
                {focused.detail}
              </p>
            </div>
          ) : (
            <div>
              <div
                className="rounded-sm p-6"
                style={{
                  background: "white",
                  border: "1px solid var(--econ-rule)",
                  borderLeft: "4px solid var(--econ-red)",
                }}
              >
                <p className="font-heading font-black text-4xl leading-tight" style={{ color: "var(--econ-red)" }}>
                  In the water sector,<br />over 1/4 of funds<br />were not used
                </p>
                <p className="text-sm mt-4 leading-relaxed" style={{ color: "#555" }}>
                  Despite the need for increased spending, over a quarter of budgeted funds go
                  unspent in the water sector each year — highlighting the sector's limited
                  absorptive capacity and institutional constraints.
                </p>
                <p className="text-xs mt-3" style={{ color: "var(--econ-gray)" }}>
                  Hover over or click a bar to explore each sector.
                </p>
              </div>

              {/* Sector comparison quick stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {sectors.map((s) => (
                  <button
                    key={s.id}
                    onMouseEnter={() => setHoveredBar(s)}
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() => setActiveBar((prev) => (prev?.id === s.id ? null : s))}
                    className="text-left p-3 rounded-sm transition-all"
                    style={{
                      background: "white",
                      border: "1px solid var(--econ-rule)",
                      borderLeft: `3px solid ${s.color}`,
                      cursor: "pointer",
                    }}
                  >
                    <p className="font-heading font-bold text-xl" style={{ color: s.color }}>
                      {s.executed}%
                    </p>
                    <p className="text-xs" style={{ color: "var(--econ-gray)" }}>
                      {s.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Running text */}
      <div className="mt-8 prose prose-sm max-w-none" style={{ color: "var(--econ-gray)", fontFamily: "var(--app-font-sans)", fontSize: "0.95rem" }}>
        <p>
          Across sectors, budget execution rates in 2009–20 ranged from 99% (Human Development) to
          just{" "}
          <strong style={{ color: "var(--econ-red)" }}>72% for water</strong> — the weakest performer.
          While the human development and transport sectors demonstrate strong institutional capacity to
          absorb and deploy funds, the water sector's systemic underperformance points to deep structural
          constraints: limited project management capacity, complex procurement, and fragmented oversight.
          Closing this gap requires not just more financing but stronger systems to spend it effectively.
        </p>
      </div>
    </section>
  );
}
