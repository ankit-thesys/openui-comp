"use client";
import { useId } from "react";
import { z } from "zod/v4";
import { formatValue, type ValueFormat } from "../format";
import {
  toNumbers,
  TooltipCard,
  type GoodWhen,
  type LegendEntry,
  type TooltipRow,
} from "../shared";
import { MUTED_COLOR, textureOf, TEXTURES, seriesColor as themeSeriesColor } from "../theme";
import type { ReferenceProps, SeriesProps } from "../trends/charts";

export const seriesColor = (index: number): string => themeSeriesColor(index) ?? MUTED_COLOR;

/* ---------- Shared chart plumbing ---------- */

export const AXIS_TICK = { fill: "var(--openui-dashboard-ink-muted)", fontSize: 12 };

/** One bar thickness across every chart (TimeSeries, Bars, Waterfall); previous-period ghosts beside a bar run at half. */
export const BAR_SIZE = 12;

/**
 * No bar is drawn thinner than this. Past it, horizontal bars grow the chart
 * taller, and vertical bars give the plot a minimum width and scroll sideways
 * inside the card rather than shrink to slivers.
 */
export const BAR_MIN = 6;

/**
 * The band one category needs for `bars` side-by-side bars of BAR_MIN, 2px apart.
 * Recharts takes the category gap (a share of the band) from both sides, hence 1 - 2 × gap.
 */
export const bandFor = (bars: number, gap: number) =>
  (bars * BAR_MIN + Math.max(0, Math.ceil(bars) - 1) * 2) / (1 - 2 * gap);

/**
 * Vertical bars: the plot width that keeps every bar at BAR_MIN, or 0 when the
 * card is already wide enough. `chrome` is the axis and margins beside the bars.
 */
export function minPlotWidth(
  width: number,
  labels: number,
  bars: number,
  gap: number,
  chrome = 64,
) {
  if (!width || !bars) return 0;
  // One spare pixel per bar: Recharts rounds bar sizes down.
  const need = Math.ceil(labels * bandFor(bars, gap) * ((BAR_MIN + 1) / BAR_MIN) + chrome);
  return need > width ? need : 0;
}

/**
 * One texture tile (see TEXTURES): its size and turn, an optional base fill,
 * then its marks in `ink` at `opacity`. Dots sit on a 45° lattice; the line
 * textures are one 0.9px rule turned 45°, -45°, 90° or 0°; crosshatch is two.
 */
export function TextureTile({
  id,
  index,
  base,
  baseOpacity,
  ink,
  opacity,
}: {
  id: string;
  index: number;
  base?: string;
  baseOpacity?: string;
  ink: string;
  opacity: string;
}) {
  const kind = TEXTURES[textureOf(index)]!;
  const size = kind === "dots" ? 6 : kind === "crosshatch" ? 5 : 4.5;
  const turn = {
    dots: 45,
    slash: 45,
    "back-slash": -45,
    horizontal: 90,
    crosshatch: 45,
    vertical: 0,
  }[kind];
  const mark = { opacity };
  return (
    <pattern
      id={id}
      width={size}
      height={size}
      patternUnits="userSpaceOnUse"
      patternTransform={turn ? `rotate(${turn})` : undefined}
    >
      {base ? (
        <rect
          width={size}
          height={size}
          fill={base}
          style={baseOpacity ? { opacity: baseOpacity } : undefined}
        />
      ) : null}
      {kind === "dots" ? (
        <circle cx="1.8" cy="1.8" r="0.8" fill={ink} style={mark} />
      ) : (
        <line x1="0" y1="0" x2="0" y2={size} stroke={ink} strokeWidth="0.9" style={mark} />
      )}
      {kind === "crosshatch" ? (
        <line x1="0" y1="0" x2={size} y2="0" stroke={ink} strokeWidth="0.9" style={mark} />
      ) : null}
    </pattern>
  );
}

/** A line drawn over bars is in the same unit (the Series docs require it), so it
 *  summarises them, e.g. a 7-day average: neutral ink, not a category hue. */
export const SUMMARY_COLOR = "var(--openui-dashboard-ink-secondary)";

/** Per-series bar textures, cycling through TEXTURES as dark ink over the solid series fill. */
export function BarTexturePatterns({
  id,
  count,
  colors,
}: {
  id: string;
  count: number;
  colors?: string[];
}) {
  return (
    <>
      {Array.from({ length: colors?.length ?? count }, (_, i) => (
        <TextureTile
          key={i}
          id={`${id}-tex-${i}`}
          index={i}
          base={colors?.[i] ?? seriesColor(i)}
          ink="black"
          opacity="var(--openui-dashboard-bar-ink)"
        />
      ))}
    </>
  );
}

/** A reference line's label: an ink chip pinned to the line's start. */
export const CURSOR_CAP = 3;

/**
 * The one hover cursor for every cartesian chart: a 1px ink line with small
 * perpendicular caps at both ends. Recharts hands line charts the two end
 * points and bar charts the hovered band; for a band the line runs through
 * its centre, vertical for columns and horizontal for horizontal bars.
 */
export function InkCursor(props: {
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const { points, x, y, width, height } = props;
  const fadeId = `openui-dashboard-cursor-${useId().replace(/:/g, "")}`;
  let line: [number, number, number, number] | null = null;
  if (points && points.length >= 2) line = [points[0]!.x, points[0]!.y, points[1]!.x, points[1]!.y];
  else if (x != null && y != null && width != null && height != null)
    line =
      width > height
        ? [x, y + height / 2, x + width, y + height / 2]
        : [x + width / 2, y, x + width / 2, y + height];
  if (!line) return null;
  const [x1, y1, x2, y2] = line;
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  const cap = (cx: number, cy: number) =>
    vertical
      ? `M${cx - CURSOR_CAP},${cy}H${cx + CURSOR_CAP}`
      : `M${cx},${cy - CURSOR_CAP}V${cy + CURSOR_CAP}`;
  // Full ink at the middle, fading to 20% at both ends (caps included).
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={fadeId} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0%" stopColor="var(--openui-dashboard-ink)" stopOpacity={0.2} />
          <stop offset="50%" stopColor="var(--openui-dashboard-ink)" stopOpacity={1} />
          <stop offset="100%" stopColor="var(--openui-dashboard-ink)" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <path
        d={`M${x1},${y1}L${x2},${y2}${cap(x1, y1)}${cap(x2, y2)}`}
        fill="none"
        stroke={`url(#${fadeId})`}
        strokeWidth={1}
      />
    </g>
  );
}

/** Top margin a chart leaves when a vertical line's chip sits above its plot: the 18px chip, less its 3px overlap, plus 9px of air above. */
export const CHIP_ROOM = 24;

/** The reference chip's measurements, shared by the SVG chip on chart lines and the HTML chip on row charts. */
/** The least height a plot keeps: below it, a card grows rather than squash the chart. Rows set the real height. */
export const PLOT_FLOOR = 200;

export const CHIP = { height: 18, radius: 5, fontSize: 11 } as const;

export function ReferenceChipLabel({
  viewBox,
  text,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
  text?: string;
}) {
  if (!viewBox || !text) return null;
  const vertical = (viewBox.height ?? 0) > (viewBox.width ?? 0);
  const h = CHIP.height;
  const w = Math.round(text.length * 6.1) + 14;
  const x = vertical ? viewBox.x - w / 2 : viewBox.x;
  // A vertical line's chip sits above the plot, covering only the line's first 3px,
  // so about 4px of air remains above the first bar. Charts leave CHIP_ROOM at the top for it.
  const y = vertical ? viewBox.y - h + 3 : viewBox.y - h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={CHIP.radius} fill="var(--openui-dashboard-ink)" />
      <text
        x={x + w / 2}
        y={y + h / 2}
        dy={3.5}
        textAnchor="middle"
        fontSize={CHIP.fontSize}
        fontWeight={500}
        fill="var(--openui-dashboard-surface)"
      >
        {text}
      </text>
    </g>
  );
}

export type Row = Record<string, string | number | null>;

export const DURATION_STEPS = [
  1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, 86400, 172800,
  604800,
];

/** Zero-based ticks on whole durations (30s, 1m, 5m, 1h, …) instead of 65s, 130s. */
export function durationTicks(
  rows: Row[],
  keys: string[],
  extra: number[] = [],
): number[] | undefined {
  let max = Math.max(0, ...extra);
  for (const row of rows)
    for (const key of keys)
      if (typeof row[key] === "number") max = Math.max(max, row[key] as number);
  if (!max) return undefined;
  const step = DURATION_STEPS.find((candidate) => max / candidate <= 5) ?? Math.ceil(max / 5);
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

/** Whole-number data gets whole-number ticks (no "0.2 signups"). */
export function allIntegers(rows: Row[], keys: string[]) {
  return rows.every((row) =>
    keys.every((key) => typeof row[key] !== "number" || Number.isInteger(row[key])),
  );
}

export function buildRows(labels: string[], series: SeriesProps[]): Row[] {
  return labels.map((label, i) => {
    const row: Row = { label };
    series.forEach((s, index) => {
      row[`s${index}`] = toNumbers(s.values)[i] ?? null;
      row[`p${index}`] = toNumbers(s.previous)[i] ?? null;
      if (s.lows || s.highs) {
        row[`lo${index}`] = toNumbers(s.lows)[i] ?? null;
        row[`hi${index}`] = toNumbers(s.highs)[i] ?? null;
      }
    });
    return row;
  });
}

export function yAxisWidth(rows: Row[], keys: string[], format?: ValueFormat | null) {
  let longest = 0;
  for (const row of rows) {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === "number")
        longest = Math.max(longest, formatValue(value, format, { axis: true }).length);
    }
  }
  // Ticks are rounder (and often one step past) the data, and % or $ glyphs run
  // wide, so leave a character of slack.
  return Math.min(80, Math.max(40, (longest + 1) * 7 + 8));
}

export function ChartTooltip({
  active,
  payload,
  label,
  series,
  format,
  goodWhen,
  showPrevious,
  previousLabel,
  colorOf = seriesColor,
}: {
  active?: boolean;
  payload?: Array<{ payload: Row }>;
  label?: string;
  series: SeriesProps[];
  format?: ValueFormat | null;
  goodWhen?: GoodWhen;
  showPrevious: boolean;
  previousLabel: string;
  /** A series' swatch colour; gets the hovered row too, for marks coloured per value (diverging bars). */
  colorOf?: (i: number, row: Row) => string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]!.payload;
  const rows: TooltipRow[] = series.map((s, i) => ({
    name: s.name,
    color: colorOf(i, row),
    // A projected period keeps its value in f{i} (see forecastFrom).
    value: (row[`s${i}`] ?? row[`f${i}`] ?? null) as number | null,
    previous: showPrevious ? (row[`p${i}`] as number | null) : null,
  }));
  if (showPrevious && series.length === 1 && typeof row["p0"] === "number") {
    rows.push({
      name: previousLabel,
      color: MUTED_COLOR,
      value: row["p0"] as number,
      dashed: true,
    });
  }
  return (
    <TooltipCard
      title={String(label ?? row["label"])}
      rows={rows}
      format={format}
      goodWhen={goodWhen}
    />
  );
}

export function hasPrevious(series: SeriesProps[]) {
  return series.some((s) => toNumbers(s.previous).some((value) => value !== null));
}

export function legendFor(
  series: SeriesProps[],
  showPrevious: boolean,
  previousLabel: string,
  bars = false,
  references: ReferenceProps[] = [],
  summary: (i: number) => boolean = () => false,
): LegendEntry[] {
  // A summary line (a line over bars) is keyed as the neutral line it draws.
  const entries: LegendEntry[] = series
    .slice(0, 8)
    .map((s, i) =>
      summary(i)
        ? { name: s.name, color: SUMMARY_COLOR, line: true }
        : { name: s.name, color: seriesColor(i) },
    );
  if (series.length > 8) entries.push({ name: `${series.length - 8} more`, color: MUTED_COLOR });
  // A chart with previous data always carries the previous-period key, hidden
  // while compare is off, so switching compare on never changes card height.
  if (hasPrevious(series)) {
    // Bars draw the previous period as faded bars, lines as dashed lines: the key matches the mark.
    // With several series, previous bars are each series' own hue, faded; the key shows a faded swatch.
    const color =
      series.length === 1
        ? MUTED_COLOR
        : bars
          ? "color-mix(in srgb, var(--openui-dashboard-series-1) 40%, transparent)"
          : "var(--openui-dashboard-ink-muted)";
    entries.push({
      name: series.length > 1 && bars ? `${previousLabel} (faded)` : previousLabel,
      color,
      dashed: !bars,
      hidden: !showPrevious,
    });
  }
  // Reference lines (Plan, Target, SLO) are keyed as the dotted line they draw.
  for (const reference of references)
    entries.push({
      name: reference.label,
      color: "var(--openui-dashboard-ink-muted)",
      dotted: true,
    });
  return entries;
}

/** The previous-period mark colour: the muted grey for one series, a faded own hue for several. */
export const previousColor = (index: number, count: number) =>
  count === 1 ? MUTED_COLOR : seriesColor(index);

/* ---------- TimeSeries ---------- */

export const stackedSchema = z.union([z.boolean(), z.literal("percent")]);

/** Width of a label once WrappedTick splits it onto two lines, in px at 11px. */
export function wrappedLabelWidth(label: string) {
  const words = label.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines =
    words.length > 1 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : words;
  return Math.max(...lines.map((line) => line.length)) * 6.4;
}

/** An x-axis tick that wraps a multi-word label onto two lines instead of colliding. */
export function WrappedTick({
  x,
  y,
  payload,
  angled,
  band,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  angled?: boolean;
  band?: number;
}) {
  if (angled) {
    return (
      <text
        x={x}
        y={y}
        dy={10}
        textAnchor="end"
        fill="var(--openui-dashboard-ink-muted)"
        fontSize={11}
        transform={`rotate(-35 ${x} ${y})`}
      >
        {payload?.value}
      </text>
    );
  }
  const text = String(payload?.value ?? "");
  const words = text.split(" ");
  // Split onto two lines only when the label doesn't fit its column on one.
  const fits = !band || text.length * 6.4 <= band - 6;
  const lines =
    !fits && words.length > 1
      ? [
          words.slice(0, Math.ceil(words.length / 2)).join(" "),
          words.slice(Math.ceil(words.length / 2)).join(" "),
        ]
      : [text];
  return (
    <text x={x} y={y} textAnchor="middle" fill="var(--openui-dashboard-ink-muted)" fontSize={11}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 12 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
