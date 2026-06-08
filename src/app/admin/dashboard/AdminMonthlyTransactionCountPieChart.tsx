"use client";

import type { AdminTransactionsMonthBucket } from "@/lib/admin-stats";
import type { SupportedCurrency } from "@/lib/currency";

const MONTH_SLICE_COLORS = [
  "#3379ff",
  "#f5cb5c",
  "#f28482",
  "#9b59b6",
  "#2ecc71",
  "#e67e22",
  "#1abc9c",
  "#3498db",
  "#e74c3c",
  "#8e44ad",
  "#16a085",
  "#d35400",
] as const;

const numberFmt = new Intl.NumberFormat("en-NG");

const CX = 140;
const CY = 126;
const RADIUS = 94;
const PIE_DEPTH = 16;
const LABEL_RADIUS = RADIUS + 24;
const VALUE_RADIUS = RADIUS * 0.58;

type Props = {
  year: number;
  currency: SupportedCurrency;
  months: AdminTransactionsMonthBucket[];
  loading: boolean;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
}

function adjustHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const mix = amount >= 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  const r = Math.round(rgb.r + (mix - rgb.r) * ratio);
  const g = Math.round(rgb.g + (mix - rgb.g) * ratio);
  const b = Math.round(rgb.b + (mix - rgb.b) * ratio);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describePieSlice(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  if (endAngle - startAngle >= 359.99) {
    return [
      `M ${cx} ${cy - radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`,
      "Z",
    ].join(" ");
  }

  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function describeSliceSideWall(
  cx: number,
  cy: number,
  radius: number,
  depth: number,
  startAngle: number,
  endAngle: number,
): string {
  const topStart = polarToCartesian(cx, cy, radius, startAngle);
  const topEnd = polarToCartesian(cx, cy, radius, endAngle);
  const bottomEnd = polarToCartesian(cx, cy + depth, radius, endAngle);
  const bottomStart = polarToCartesian(cx, cy + depth, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${topStart.x} ${topStart.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${topEnd.x} ${topEnd.y}`,
    `L ${bottomEnd.x} ${bottomEnd.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${bottomStart.x} ${bottomStart.y}`,
    "Z",
  ].join(" ");
}

function sliceShowsSideWall(midAngle: number): boolean {
  const normalized = ((midAngle % 360) + 360) % 360;
  return normalized >= 15 && normalized <= 195;
}

function labelAnchor(midAngle: number): "start" | "end" | "middle" {
  const normalized = ((midAngle % 360) + 360) % 360;
  if (normalized > 30 && normalized < 150) return "start";
  if (normalized > 210 && normalized < 330) return "end";
  return "middle";
}

export function AdminMonthlyTransactionCountPieChart({
  year,
  currency,
  months,
  loading,
}: Props) {
  const yearTotalCount = months.reduce((s, m) => s + m.orderCount, 0);
  const activeMonths = months.filter((m) => m.orderCount > 0);

  let cursorAngle = 0;
  const slices = activeMonths.map((m) => {
    const monthIndex = months.findIndex((row) => row.yearMonth === m.yearMonth);
    const sliceAngle =
      yearTotalCount > 0 ? (m.orderCount / yearTotalCount) * 360 : 0;
    const startAngle = cursorAngle;
    const endAngle = cursorAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;
    cursorAngle = endAngle;
    const color = MONTH_SLICE_COLORS[monthIndex % MONTH_SLICE_COLORS.length];

    return {
      ...m,
      startAngle,
      endAngle,
      midAngle,
      sliceAngle,
      percent:
        yearTotalCount > 0
          ? Math.round((m.orderCount / yearTotalCount) * 100)
          : 0,
      color,
      depthColor: adjustHex(color, -0.42),
      sideColor: adjustHex(color, -0.28),
      highlightColor: adjustHex(color, 0.28),
      labelPos: polarToCartesian(CX, CY, LABEL_RADIUS, midAngle),
      valuePos: polarToCartesian(CX, CY, VALUE_RADIUS, midAngle),
    };
  });

  const depthCy = CY + PIE_DEPTH;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Transactions by month
        </h3>
        <span className="text-xs uppercase tracking-wide text-slate-400">
          Order count ({currency}, UTC)
        </span>
      </div>
      <div className="mt-4 flex h-52 items-center justify-center rounded-xl bg-gradient-to-b from-violet-50/60 via-white to-white px-2">
        {loading ? (
          <div className="h-40 w-40 animate-pulse rounded-full bg-slate-200" />
        ) : months.length === 0 ? (
          <p className="text-sm text-slate-500">No chart data loaded.</p>
        ) : (
          <svg
            viewBox="0 0 280 280"
            className="h-full max-h-[13.5rem] w-full max-w-[13.5rem]"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Transaction count distribution for ${year}`}
          >
            <defs>
              <radialGradient id="pie-floor-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(15,23,42,0.18)" />
                <stop offset="100%" stopColor="rgba(15,23,42,0)" />
              </radialGradient>
              {slices.map((slice) => (
                <linearGradient
                  key={`grad-${slice.yearMonth}`}
                  id={`pie-top-${slice.yearMonth}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={slice.highlightColor} />
                  <stop offset="45%" stopColor={slice.color} />
                  <stop offset="100%" stopColor={adjustHex(slice.color, -0.16)} />
                </linearGradient>
              ))}
            </defs>

            {yearTotalCount === 0 ? (
              <>
                <ellipse
                  cx={CX}
                  cy={depthCy + 8}
                  rx={RADIUS * 0.82}
                  ry={12}
                  fill="url(#pie-floor-shadow)"
                />
                <circle cx={CX} cy={depthCy} r={RADIUS} fill="#cbd5e1" />
                <circle cx={CX} cy={CY} r={RADIUS} fill="#e2e8f0" />
              </>
            ) : (
              <>
                <ellipse
                  cx={CX}
                  cy={depthCy + RADIUS * 0.12}
                  rx={RADIUS * 0.88}
                  ry={14}
                  fill="url(#pie-floor-shadow)"
                />

                {slices.map((slice) => (
                  <path
                    key={`depth-${slice.yearMonth}`}
                    d={describePieSlice(
                      CX,
                      depthCy,
                      RADIUS,
                      slice.startAngle,
                      slice.endAngle,
                    )}
                    fill={slice.depthColor}
                  />
                ))}

                {slices.map(
                  (slice) =>
                    sliceShowsSideWall(slice.midAngle) && (
                      <path
                        key={`side-${slice.yearMonth}`}
                        d={describeSliceSideWall(
                          CX,
                          CY,
                          RADIUS,
                          PIE_DEPTH,
                          slice.startAngle,
                          slice.endAngle,
                        )}
                        fill={slice.sideColor}
                      />
                    ),
                )}

                {slices.map((slice) => (
                  <path
                    key={`top-${slice.yearMonth}`}
                    d={describePieSlice(
                      CX,
                      CY,
                      RADIUS,
                      slice.startAngle,
                      slice.endAngle,
                    )}
                    fill={`url(#pie-top-${slice.yearMonth})`}
                    stroke="rgba(255,255,255,0.65)"
                    strokeWidth="1.5"
                  >
                    <title>
                      {slice.label} {year}: {numberFmt.format(slice.orderCount)}{" "}
                      orders ({slice.percent}%)
                    </title>
                  </path>
                ))}

                {slices.map((slice) => (
                  <g key={`labels-${slice.yearMonth}`}>
                    {slice.sliceAngle >= 12 ? (
                      <text
                        x={slice.valuePos.x}
                        y={slice.valuePos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontWeight="700"
                        style={{ textShadow: "0 1px 2px rgba(15,23,42,0.35)" }}
                      >
                        {numberFmt.format(slice.orderCount)}
                      </text>
                    ) : null}
                    <text
                      x={slice.labelPos.x}
                      y={slice.labelPos.y}
                      textAnchor={labelAnchor(slice.midAngle)}
                      dominantBaseline="middle"
                      fill="#334155"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {slice.label}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
        )}
      </div>
      {!loading && yearTotalCount === 0 && months.length > 0 ? (
        <p className="mt-3 text-center text-xs text-slate-500">
          No {currency} transactions in this year (UTC). Use Prev/Next to browse other
          years.
        </p>
      ) : null}
      {!loading && yearTotalCount > 0 ? (
        <p className="mt-3 text-center text-xs text-slate-600">
          {year} total ({currency}):{" "}
          <span className="font-semibold text-slate-800">
            {numberFmt.format(yearTotalCount)} orders
          </span>
        </p>
      ) : null}
    </section>
  );
}
