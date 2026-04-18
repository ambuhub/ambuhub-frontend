"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Ambulance,
  Package,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AMBUHUB_SERVICES } from "@/lib/ambuhub-services";

const cx = 500;
const cy = 552;
const rOuter = 332;
const rInner = 142;
const rHub = 100;
const rRing = (rInner + rHub) / 2 + 10;

const VB_X = 168;
const VB_Y = 228;
const VB_W = 664;
const VB_H = 648;

const totalSpan = 4.48;
const gap = 0.038;
const wedgeCount = AMBUHUB_SERVICES.length;
const wedgeAngle = (totalSpan - (wedgeCount + 1) * gap) / wedgeCount;
const arcStart = -Math.PI / 2 - totalSpan / 2;

/** Stable coords across Node/browser so SVG path `d` matches after SSR. */
function polar(r: number, a: number) {
  const p = 1e5;
  return {
    x: Math.round((cx + r * Math.cos(a)) * p) / p,
    y: Math.round((cy + r * Math.sin(a)) * p) / p,
  };
}

function wedgePath(a0: number, a1: number) {
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const o0 = polar(rOuter, a0);
  const o1 = polar(rOuter, a1);
  const i1 = polar(rInner, a1);
  const i0 = polar(rInner, a0);
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${i0.x} ${i0.y}`,
    "Z",
  ].join(" ");
}

const R_PAD = 6;

function inAnnulusSector(
  px: number,
  py: number,
  a0: number,
  a1: number,
): boolean {
  const dx = px - cx;
  const dy = py - cy;
  const r = Math.hypot(dx, dy);
  if (r < rInner + R_PAD || r > rOuter - R_PAD) return false;
  const ap = Math.atan2(dy, dx);
  const span = a1 - a0;
  let t = ap - a0;
  const twoPi = 2 * Math.PI;
  while (t < 0) t += twoPi;
  while (t > twoPi) t -= twoPi;
  return t <= span + 1e-4;
}

function rectInsideWedge(
  left: number,
  top: number,
  w: number,
  h: number,
  a0: number,
  a1: number,
): boolean {
  const pts: [number, number][] = [
    [left, top],
    [left + w, top],
    [left, top + h],
    [left + w, top + h],
    [left + w / 2, top],
    [left + w / 2, top + h],
    [left, top + h / 2],
    [left + w, top + h / 2],
  ];
  return pts.every(([px, py]) => inAnnulusSector(px, py, a0, a1));
}

function bestForeignObjectBox(a0: number, a1: number, mid: number) {
  const band = rOuter - rInner;
  let best = { x: 0, y: 0, w: 200, h: 150, area: 0 };
  for (const rFrac of [0.67, 0.69, 0.71, 0.73]) {
    const r = rInner + band * rFrac;
    const c = polar(r, mid);
    for (let w = 252; w >= 168; w -= 6) {
      for (let h = 192; h >= 128; h -= 6) {
        const left = c.x - w / 2;
        const top = c.y - h / 2;
        if (rectInsideWedge(left, top, w, h, a0, a1)) {
          const area = w * h;
          if (area > best.area) best = { x: left, y: top, w, h, area };
        }
      }
    }
  }
  if (best.area === 0) {
    const r = rInner + band * 0.69;
    const c = polar(r, mid);
    const w = 176;
    const h = 136;
    return { x: c.x - w / 2, y: c.y - h / 2, w, h };
  }
  return { x: best.x, y: best.y, w: best.w, h: best.h };
}

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  fill: string;
  icon: LucideIcon;
  fo: { x: number; y: number; w: number; h: number };
};

const wedgeFills = [
  "#0069b4",
  "#0284c7",
  "#c2410c",
  "#059669",
] as const satisfies readonly string[];
const wedgeIcons = [Ambulance, Users, Package, ShoppingCart] as const;

const services: Omit<ServiceItem, "fo">[] = AMBUHUB_SERVICES.map((s, i) => ({
  id: s.slug,
  title: s.title,
  description: s.description,
  fill: wedgeFills[i],
  icon: wedgeIcons[i],
}));

function computeForeignObjects(): ServiceItem[] {
  return services.map((s, i) => {
    const a0 = arcStart + i * (wedgeAngle + gap) + gap;
    const a1 = a0 + wedgeAngle;
    const mid = (a0 + a1) / 2;
    let fo = bestForeignObjectBox(a0, a1, mid);

    if (i === 0) {
      const trimLeft = 28;
      const narrowed = {
        ...fo,
        x: fo.x + trimLeft,
        w: fo.w - trimLeft,
      };
      if (rectInsideWedge(narrowed.x, narrowed.y, narrowed.w, narrowed.h, a0, a1)) {
        fo = narrowed;
      }
      const step = 4;
      for (let k = 0; k < 40; k++) {
        const nudged = { ...fo, x: fo.x + step };
        if (!rectInsideWedge(nudged.x, nudged.y, nudged.w, nudged.h, a0, a1)) {
          break;
        }
        fo = nudged;
      }
    }

    if (i === services.length - 1) {
      const trimRight = 16;
      const narrowed = {
        ...fo,
        w: fo.w - trimRight,
      };
      if (rectInsideWedge(narrowed.x, narrowed.y, narrowed.w, narrowed.h, a0, a1)) {
        fo = narrowed;
      }
      for (const dx of [28, 22, 16, 10, 6]) {
        const nudged = { ...fo, x: fo.x - dx };
        if (rectInsideWedge(nudged.x, nudged.y, nudged.w, nudged.h, a0, a1)) {
          fo = nudged;
          break;
        }
      }
    }

    return {
      ...s,
      fo,
    };
  });
}

const wedgeAngles = services.map((_, i) => {
  const a0 = arcStart + i * (wedgeAngle + gap) + gap;
  return { a0, a1: a0 + wedgeAngle, mid: a0 + wedgeAngle / 2 };
});

export function ServiceHubGraphic() {
  const reduceMotion = useReducedMotion();
  const items = computeForeignObjects();

  const hubTransition = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 260, damping: 22 };

  const wedgeTransition = (delay: number) =>
    reduceMotion
      ? { duration: 0.01 }
      : { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const };

  const entranceProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: 48 },
        animate: { opacity: 1, x: 0 },
        transition: {
          duration: 0.6,
          delay: 0.12,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <motion.svg
      className="hidden h-auto w-full min-w-0 max-w-none justify-self-stretch drop-shadow-lg lg:block"
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMaxYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="ambuhub-services-heading"
      {...entranceProps}
    >
      <title id="ambuhub-services-heading">Ambuhub service branches</title>
      <desc>
        {services.map((s) => `${s.title}: ${s.description}`).join(". ")}
      </desc>
        <defs>
          <filter
            id="ambuhub-hub-shadow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="14"
              floodOpacity="0.12"
            />
          </filter>
          <filter
            id="ambuhub-wedge-shadow"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
          >
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="10"
              floodOpacity="0.14"
            />
          </filter>
          {items.map((_, i) => (
            <clipPath key={`clip-${items[i].id}`} id={`ambuhub-clip-${i}`}>
              <path d={wedgePath(wedgeAngles[i].a0, wedgeAngles[i].a1)} />
            </clipPath>
          ))}
        </defs>

        <motion.circle
          cx={cx}
          cy={cy}
          r={rRing}
          stroke="rgb(0 105 180 / 0.22)"
          strokeWidth="2"
          strokeDasharray="10 14"
          fill="none"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.15 }}
        />

        {wedgeAngles.map((wa, i) => {
          const dot = polar(rRing, wa.mid);
          return (
            <motion.circle
              key={`dot-${items[i].id}`}
              cx={dot.x}
              cy={dot.y}
              r={7}
              fill={items[i].fill}
              stroke="white"
              strokeWidth="2"
              initial={reduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={wedgeTransition(0.2 + i * 0.06)}
            />
          );
        })}

        {items.map((item, i) => {
          const wa = wedgeAngles[i];
          const d = wedgePath(wa.a0, wa.a1);
          return (
            <g
              key={`${item.id}-fill`}
              clipPath={`url(#ambuhub-clip-${i})`}
              className="group"
            >
              <motion.g
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={wedgeTransition(0.08 + i * 0.07)}
              >
                <path
                  d={d}
                  fill={item.fill}
                  strokeWidth={2}
                  filter="url(#ambuhub-wedge-shadow)"
                  className={
                    reduceMotion
                      ? "stroke-transparent"
                      : "stroke-transparent transition-[stroke] duration-200 ease-out group-hover:stroke-white/45"
                  }
                />
              </motion.g>
            </g>
          );
        })}

        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <foreignObject
              key={`${item.id}-label`}
              x={item.fo.x}
              y={item.fo.y}
              width={item.fo.w}
              height={item.fo.h}
              className="pointer-events-none overflow-visible"
            >
              <div
                className={
                  i === 0
                    ? "relative box-border flex h-full min-h-0 w-full flex-col items-end justify-center gap-1 py-2 pl-5 pr-2 text-left text-white"
                    : i === 1
                      ? "relative box-border flex h-full min-h-0 w-full flex-col items-start justify-center gap-1 py-2 pl-1 pr-3 text-left text-white"
                      : i === 2
                        ? "relative box-border flex h-full min-h-0 w-full flex-col items-center justify-center gap-1 py-2 pl-2 pr-3 text-center text-white"
                        : "relative box-border flex h-full min-h-0 w-full flex-col items-center justify-center gap-1 py-2 pl-2 pr-3 text-center text-white"
                }
                style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.35)" }}
              >
                <span
                  className={`pointer-events-none absolute select-none text-3xl font-bold leading-none text-white/25 ${
                    i === 0
                      ? "bottom-4 right-1 top-auto -translate-y-1 sm:bottom-5 sm:-translate-y-20"
                      : i === 2
                        ? "left-1/2 top-5 -translate-x-1/2 sm:top-4"
                        : "left-13 top-5.5"
                  }`}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 sm:h-11 sm:w-11 ${
                    i === 0
                      ? "-translate-x-2 sm:-translate-x-9"
                      : i === 1
                        ? "-translate-x-1.5 sm:-translate-x-2.5"
                        : i === 2
                          ? "translate-x-0"
                          : "translate-x-1.5 sm:-translate-x-18"
                  }`}
                >
                  <Icon
                    className="h-5 w-5 text-white sm:h-6 sm:w-6"
                    strokeWidth={1.75}
                  />
                </span>
                <p
                  className={`relative z-[1] min-w-0 max-w-full break-words text-[11px] font-bold leading-snug sm:text-xs ${
                    i === 0
                      ? "w-full text-left translate-x-2 text-balance sm:translate-x-10"
                      : i === 1
                        ? "w-full text-balance text-left -translate-x-1 sm:-translate-x-1.5"
                        : i === 2
                          ? "w-full text-balance text-center"
                          : "w-full text-balance text-right translate-x-1 sm:-translate-x-9"
                  }`}
                >
                  {item.title}
                </p>
                <p
                  className={`relative z-[1] min-w-0 max-w-full break-words text-[9px] leading-snug text-white/95 sm:text-[10px] ${
                    i === 0
                      ? "w-full text-left translate-x-2 text-pretty sm:translate-x-7"
                      : i === 1
                        ? "w-full text-left text-pretty -translate-x-1 sm:-translate-x-2"
                        : i === 2
                          ? "w-full text-pretty text-center"
                          : "w-full text-right text-pretty translate-x-1 sm:-translate-x-10"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </foreignObject>
          );
        })}

        <motion.g
          filter="url(#ambuhub-hub-shadow)"
          initial={reduceMotion ? false : { scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={hubTransition}
        >
          <circle cx={cx} cy={cy} r={rHub} fill="white" />
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            className="text-[32px] font-bold tracking-tight sm:text-[38px]"
            style={{
              fontFamily: "inherit",
              fill: "var(--color-ambuhub-900)",
            }}
          >
            Ambuhub
          </text>
        </motion.g>
    </motion.svg>
  );
}
