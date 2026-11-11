"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useId, useMemo } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod/v4";

import {
  formatSchema,
  formatValue,
  isDurationFormat,
  isRateFormat,
  isRatioFormat,
  type ValueFormat,
} from "../format";
import { goodWhenSchema, numbersSchema } from "../schema";
import {
  Empty,
  Legend,
  niceStep,
  nodeList,
  seriesNote,
  SrTable,
  toNumbers,
  TooltipCard,
  toStrings,
  unusableSeries,
  useCompare,
  useWidth,
  type GoodWhen,
  type LegendEntry,
  type TooltipRow,
} from "../shared";
import { MUTED_COLOR, textureOf, TEXTURES, seriesColor as themeSeriesColor } from "../theme";

const seriesColor = (index: number): string => themeSeriesColor(index) ?? MUTED_COLOR;

/* ---------- Data components ---------- */

const seriesSchema = z.object({
  name: z.string(),
  values: numbersSchema,
  previous: numbersSchema.optional(),
  mark: z.enum(["line", "area", "bar"]).optional(),
  lows: numbersSchema.optional(),
  highs: numbersSchema.optional(),
});
type SeriesProps = z.infer<typeof seriesSchema>;

export const Series = defineComponent({
  name: "Series",
  props: seriesSchema,
  description:
    'One series; previous is the same points for the previous period. Use null for gaps. mark overrides the chart type to mix bars and a line in the same unit, e.g. Series("7-day average", avg, null, "line"). lows/highs shade a band such as a 95% interval: Series("Lift", lift, null, "line", lower, upper).',
  component: () => null,
});

const referenceSchema = z.object({
  label: z.string(),
  value: z.number(),
  axis: z.enum(["x", "y"]).optional(),
});
export type ReferenceProps = z.infer<typeof referenceSchema>;

export const Reference = defineComponent({
  name: "Reference",
  props: referenceSchema,
  description:
    'A target or SLO line: Reference("Target", 99.5). axis "x" draws a vertical line (Scatter only), e.g. an average on the x measure.',
  component: () => null,
});

const markerSchema = z.object({
  label: z.string(),
  at: z.string(),
});
type MarkerProps = z.infer<typeof markerSchema>;

export const Marker = defineComponent({
  name: "Marker",
  props: markerSchema,
  description:
    'An event on a TimeSeries\' time axis (a deploy, incident or launch) at one of its labels: Marker("Deploy v2.4", "Oct 12").',
  component: () => null,
});

/* ---------- Shared chart plumbing ---------- */

export const AXIS_TICK = { fill: "var(--openui-dashboard-ink-muted)", fontSize: 12 };

/** One bar thickness across every chart (TimeSeries, Bars, Waterfall); previous-period ghosts beside a bar run at half. */
const BAR_SIZE = 12;
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

/**
 * Stacked areas carry the same cycling textures as stacked bars, in each
 * band's own hue over its fill, so neighbouring bands differ by more than
 * colour. No fade: every band keeps its texture.
 */
function StackTexturePatterns({ id, count }: { id: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <TextureTile
          key={i}
          id={`${id}-stack-${i}`}
          index={i}
          ink={seriesColor(i)}
          opacity="var(--openui-dashboard-area-stack-tex)"
        />
      ))}
    </>
  );
}

/** A line drawn over bars is in the same unit (the Series docs require it), so it
 *  summarises them, e.g. a 7-day average: neutral ink, not a category hue. */
const SUMMARY_COLOR = "var(--openui-dashboard-ink-secondary)";
const isSummaryLine = (series: SeriesProps[], type: string, i: number) =>
  (series[i]?.mark ?? type) === "line" && series.some((s) => (s.mark ?? type) === "bar");
const markColor = (series: SeriesProps[], type: string, i: number) =>
  isSummaryLine(series, type, i) ? SUMMARY_COLOR : seriesColor(i);

/** Per-series bar textures, cycling through TEXTURES as dark ink over the solid series fill. */
function BarTexturePatterns({
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
const CURSOR_CAP = 3;

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

type Row = Record<string, string | number | null>;

/** A rounded y-range around the values, kept at or above zero for positive data. */
function lineDomain(
  rows: Row[],
  keys: string[],
  extra: number[],
  ceiling?: number,
  integers = false,
): [number, number] | undefined {
  const values = [...extra.filter((v) => typeof v === "number")];
  for (const row of rows)
    for (const key of keys) if (typeof row[key] === "number") values.push(row[key] as number);
  if (!values.length) return undefined;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const spread = high - low || Math.abs(high) || 1;
  const step = integers ? Math.max(1, niceStep((spread * 1.6) / 4)) : niceStep((spread * 1.6) / 4);
  let min = Math.floor((low - spread * 0.3) / step) * step;
  if (low >= 0) min = Math.max(0, min);
  let max = Math.ceil((high + spread * 0.15) / step) * step;
  // Shares can't pass 100%: stop the axis there rather than padding to 150%.
  if (ceiling !== undefined && high <= ceiling) max = Math.min(max, ceiling);
  return [min, max];
}

function domainTicks([min, max]: [number, number], integers = false) {
  const step = integers ? Math.max(1, niceStep((max - min) / 4)) : niceStep((max - min) / 4);
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step / 1000; t += step)
    ticks.push(Number(t.toFixed(10)));
  return ticks;
}

const DURATION_STEPS = [
  1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, 86400, 172800,
  604800,
];

/** Zero-based ticks on whole durations (30s, 1m, 5m, 1h, …) instead of 65s, 130s. */
function durationTicks(rows: Row[], keys: string[], extra: number[] = []): number[] | undefined {
  let max = Math.max(0, ...extra);
  for (const row of rows)
    for (const key of keys)
      if (typeof row[key] === "number") max = Math.max(max, row[key] as number);
  if (!max) return undefined;
  const step = DURATION_STEPS.find((candidate) => max / candidate <= 5) ?? Math.ceil(max / 5);
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

/**
 * Dots only where a line can't show a value: a lone point between gaps, or a
 * series too short to draw a line. Elsewhere the line carries the data.
 */
function sparseDot(rows: Row[], key: string, color: string) {
  return function SparseDot(props: { cx?: number; cy?: number; index?: number }) {
    const { cx, cy, index = 0 } = props;
    const value = rows[index]?.[key];
    const before = rows[index - 1]?.[key];
    const after = rows[index + 1]?.[key];
    const lone =
      typeof value === "number" &&
      (rows.length <= 2 || (typeof before !== "number" && typeof after !== "number"));
    if (!lone || cx === undefined || cy === undefined) return <g key={`${key}-${index}`} />;
    return (
      <circle
        key={`${key}-${index}`}
        cx={cx}
        cy={cy}
        r={3.5}
        fill={color}
        stroke="var(--openui-dashboard-surface)"
        strokeWidth={1.5}
      />
    );
  };
}

/** Whole-number data gets whole-number ticks (no "0.2 signups"). */
function allIntegers(rows: Row[], keys: string[]) {
  return rows.every((row) =>
    keys.every((key) => typeof row[key] !== "number" || Number.isInteger(row[key])),
  );
}

function buildRows(labels: string[], series: SeriesProps[]): Row[] {
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

function yAxisWidth(rows: Row[], keys: string[], format?: ValueFormat | null) {
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

function ChartTooltip({
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

function hasPrevious(series: SeriesProps[]) {
  return series.some((s) => toNumbers(s.previous).some((value) => value !== null));
}

function legendFor(
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
const previousColor = (index: number, count: number) =>
  count === 1 ? MUTED_COLOR : seriesColor(index);
const previousOpacity = (count: number) => (count === 1 ? 1 : 0.45);

/* ---------- TimeSeries ---------- */

const stackedSchema = z.union([z.boolean(), z.literal("percent")]);

const timeSeriesSchema = z.object({
  labels: z.array(z.string()),
  series: z.array(Series.ref),
  type: z.enum(["line", "area", "bar"]).optional(),
  format: formatSchema.optional(),
  stacked: stackedSchema.optional(),
  references: z.array(Reference.ref).optional(),
  goodWhen: goodWhenSchema.optional(),
  markers: z.array(Marker.ref).optional(),
  curve: z.enum(["smooth", "linear", "step"]).optional(),
  forecastFrom: z.string().optional(),
});

export const TimeSeries = defineComponent({
  name: "TimeSeries",
  props: timeSeriesSchema,
  description:
    'A metric over time. type "line" (default) for rates, "area" for volumes (stacked for parts of a whole; stacked "percent" for each part\'s share over time), "bar" for counts per period. markers flag events on the time axis. curve "step" for values that change in steps (prices, limits, plan tiers). forecastFrom is the first projected label: from there the line is dashed and the region shaded.',
  component: function TimeSeriesView({
    props,
  }: ComponentRenderProps<z.infer<typeof timeSeriesSchema>>) {
    const compare = useCompare();
    const [plotRef, plotWidth] = useWidth<HTMLDivElement>();
    const gradientId = useId().replace(/:/g, "");
    const labels = toStrings(props.labels);
    const series = useMemo(() => nodeList<SeriesProps>(props.series), [props.series]);
    const references = nodeList<ReferenceProps>(props.references);
    const markers = nodeList<MarkerProps>(props.markers);
    // Keyed on the prop itself: toStrings returns a new array every render.
    const baseRows = useMemo(
      () => buildRows(toStrings(props.labels), series),
      [props.labels, series],
    );
    if (!labels.length || !series.length) return <Empty />;
    // Every series without a single value: nothing to draw, so the empty state, not bare axes.
    const allMissing = unusableSeries(series).length === series.length;
    if (allMissing) return <Empty />;

    const type = props.type ?? "line";
    const stacked = !!props.stacked;
    const percent = props.stacked === "percent";
    const curve =
      props.curve === "step" ? "stepAfter" : props.curve === "linear" ? "linear" : "monotone";
    // Forecast: from forecastFrom on, line/area values move to f{i}, drawn
    // dashed; one shared point keeps the actual and projected lines joined.
    const forecastAt = props.forecastFrom ? labels.indexOf(props.forecastFrom) : -1;
    const forecast = forecastAt > 0;
    const rows = forecast
      ? baseRows.map((row, j) => {
          const next: Row = { ...row };
          series.forEach((s, i) => {
            if ((s.mark ?? type) === "bar") return;
            next[`f${i}`] = j >= forecastAt - 1 ? (row[`s${i}`] ?? null) : null;
            if (j >= forecastAt) next[`s${i}`] = null;
          });
          return next;
        })
      : baseRows;
    const showPrevious = compare.enabled && hasPrevious(series);
    const keys = series.flatMap((s, i) => [
      `s${i}`,
      ...(forecast ? [`f${i}`] : []),
      ...(showPrevious ? [`p${i}`] : []),
      ...(s.lows || s.highs ? [`lo${i}`, `hi${i}`] : []),
    ]);
    // The plot fills its card (rows set the height); this is only its floor.
    const height = PLOT_FLOOR;
    const stackId = stacked ? "stack" : undefined;
    const count = series.length;
    const lastBar = series.reduce((last, s, i) => ((s.mark ?? type) === "bar" ? i : last), -1);
    // Bars and areas encode size from zero; a line only encodes change, so zoom
    // to the data (plus references) or every rate looks flat.
    const linesOnly = series.every((s) => (s.mark ?? type) === "line");
    const dense = labels.length > 14;
    const overlapGhosts =
      showPrevious &&
      dense &&
      !stacked &&
      series.filter((s) => (s.mark ?? type) === "bar").length === 1;
    // Columns side by side in one period: a stack is one; previous bars sit beside unless they overlap.
    const barSeries = series.filter((s) => (s.mark ?? type) === "bar").length;
    const columns = barSeries
      ? (stacked ? 1 : barSeries) * (showPrevious && !overlapGhosts ? 2 : 1)
      : 0;
    const plotMin = minPlotWidth(plotWidth, labels.length, columns, dense ? 0.18 : 0.28);
    const domain = percent
      ? undefined
      : linesOnly
        ? lineDomain(
            rows,
            keys,
            references.map((reference) => reference.value),
            isRateFormat(props.format) ? (isRatioFormat(props.format) ? 1 : 100) : undefined,
            allIntegers(rows, keys),
          )
        : undefined;

    return (
      <div className="openui-dashboard-chart">
        <SrTable
          caption="Chart data by period"
          head={["Period", ...series.map((s) => s.name)]}
          rows={baseRows.map((row) => [
            String(row["label"]),
            ...series.map((_, i) => formatValue(row[`s${i}`], props.format)),
          ])}
        />
        <Legend
          entries={[
            ...legendFor(series, showPrevious, compare.label, type === "bar", references, (i) =>
              isSummaryLine(series, type, i),
            ),
            ...(forecast
              ? [{ name: "Forecast", color: "var(--openui-dashboard-ink-muted)", dashed: true }]
              : []),
          ]}
        />
        <div
          ref={plotRef}
          className="openui-dashboard-chart-plot"
          style={{ minHeight: height, marginTop: 4, overflowX: plotMin ? "auto" : undefined }}
        >
          {/* Past BAR_MIN the chart takes a fixed width and the plot scrolls sideways (a number, since a
              responsive container keeps its first measurement when only its parent widens). */}
          <ResponsiveContainer width={plotMin || "100%"} height="100%">
            {/* Recharts orders bars by mount order: remount when ghost bars come and go so previous stays first. */}
            <ComposedChart
              key={showPrevious ? "compare" : "plain"}
              data={rows}
              stackOffset={percent ? "expand" : undefined}
              margin={{ top: markers.length ? CHIP_ROOM : 12, right: 8, bottom: 0, left: 0 }}
              barGap={2}
              barCategoryGap={dense ? "18%" : "28%"}
            >
              {/* Dense series draw the previous period behind each bar on its own hidden axis, not beside it. */}
              {overlapGhosts ? <XAxis xAxisId="ghost" dataKey="label" hide /> : null}
              <defs>
                {series.map((_, i) => (
                  <linearGradient key={i} id={`${gradientId}-${i}`} x1="0" x2="0" y1="0" y2="1">
                    {/* Unstacked fills are a whisper of a wash fading to nothing at the baseline. */}
                    <stop
                      offset="0%"
                      stopColor={seriesColor(i)}
                      style={{
                        stopOpacity: stacked
                          ? "var(--openui-dashboard-area-stack-top)"
                          : "var(--openui-dashboard-area-wash)",
                      }}
                    />
                    <stop
                      offset="100%"
                      stopColor={seriesColor(i)}
                      style={{
                        stopOpacity: stacked ? "var(--openui-dashboard-area-stack-bottom)" : "0",
                      }}
                    />
                  </linearGradient>
                ))}
                {/* Dot texture under unstacked area fills, in the series' own hue,
                    fading out toward the baseline. */}
                {series.map((_, i) => (
                  <pattern
                    key={`d${i}`}
                    id={`${gradientId}-dots-${i}`}
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <circle
                      cx="1.8"
                      cy="1.8"
                      r="0.8"
                      fill={seriesColor(i)}
                      style={{ opacity: "var(--openui-dashboard-area-dot)" }}
                    />
                  </pattern>
                ))}
                <linearGradient id={`${gradientId}-dotfade`} x1="0" x2="0" y1="0" y2="1">
                  {/* Dots fade out across the full height, gone by the baseline. */}
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <mask id={`${gradientId}-dotmask`}>
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill={`url(#${gradientId}-dotfade)`}
                  />
                </mask>
                <BarTexturePatterns id={gradientId} count={series.length} />
                {stacked ? <StackTexturePatterns id={gradientId} count={series.length} /> : null}
              </defs>
              <CartesianGrid vertical={false} stroke="var(--openui-dashboard-grid)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                tickMargin={10}
                minTickGap={20}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                tickMargin={6}
                tickCount={5}
                domain={percent ? [0, 1] : domain}
                allowDecimals={percent || !allIntegers(rows, keys)}
                ticks={
                  percent
                    ? [0, 0.25, 0.5, 0.75, 1]
                    : domain
                      ? domainTicks(domain, allIntegers(rows, keys))
                      : isDurationFormat(props.format)
                        ? durationTicks(
                            rows,
                            keys,
                            references.map((r) => r.value),
                          )
                        : undefined
                }
                width={percent ? 44 : yAxisWidth(rows, keys, props.format)}
                tickFormatter={(value: number) =>
                  percent
                    ? `${Math.round(value * 100)}%`
                    : formatValue(value, props.format, { axis: true })
                }
              />
              <Tooltip
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 5 }}
                cursor={<InkCursor />}
                content={(tooltip) => (
                  <ChartTooltip
                    {...(tooltip as object)}
                    series={series}
                    format={props.format}
                    goodWhen={props.goodWhen}
                    showPrevious={showPrevious}
                    previousLabel={compare.label}
                    colorOf={(i: number) => markColor(series, type, i)}
                  />
                )}
              />
              {references.map((reference) => (
                <ReferenceLine
                  key={`${reference.label}-${reference.value}`}
                  // A percent stack plots shares on a 0 to 1 axis; a target past the data widens the axis.
                  y={percent ? reference.value / 100 : reference.value}
                  ifOverflow="extendDomain"
                  stroke="var(--openui-dashboard-ink-muted)"
                  strokeWidth={1.5}
                  strokeDasharray="0.1 4"
                  strokeLinecap="round"
                  label={
                    <ReferenceChipLabel
                      text={`${reference.label} · ${formatValue(reference.value, props.format)}`}
                    />
                  }
                />
              ))}
              {forecast ? (
                // The projected stretch sits on a whisper of a tint.
                <ReferenceArea
                  x1={labels[forecastAt]}
                  x2={labels[labels.length - 1]}
                  fill="var(--openui-dashboard-ink)"
                  fillOpacity={0.03}
                  stroke="none"
                  ifOverflow="hidden"
                />
              ) : null}
              {markers.map((marker) => (
                <ReferenceLine
                  key={`${marker.label}-${marker.at}`}
                  x={marker.at}
                  stroke="var(--openui-dashboard-ink-muted)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  label={<ReferenceChipLabel text={marker.label} />}
                />
              ))}
              {showPrevious
                ? series.map((s, i) =>
                    (s.mark ?? type) === "bar" ? (
                      // Stacked charts get one stacked ghost per category, not one ghost per series.
                      <Bar
                        key={`p${i}`}
                        dataKey={`p${i}`}
                        xAxisId={overlapGhosts ? "ghost" : undefined}
                        stackId={stacked ? "previous" : undefined}
                        fill={previousColor(i, count)}
                        fillOpacity={count === 1 ? 0.55 : 0.3}
                        stroke={stacked ? "var(--openui-dashboard-surface)" : undefined}
                        strokeWidth={stacked ? 2 : 0}
                        radius={percent || (stacked && i < lastBar) ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                        maxBarSize={BAR_SIZE}
                        isAnimationActive={false}
                      />
                    ) : null,
                  )
                : null}
              {/* Dots render under the translucent gradient, so the stroke stays clean on top. */}
              {!stacked
                ? series.map((s, i) =>
                    (s.mark ?? type) === "area" ? (
                      <Area
                        key={`dots${i}`}
                        dataKey={`s${i}`}
                        type={curve}
                        stroke="none"
                        fill={`url(#${gradientId}-dots-${i})`}
                        mask={`url(#${gradientId}-dotmask)`}
                        connectNulls={false}
                        dot={false}
                        activeDot={false}
                        legendType="none"
                        tooltipType="none"
                        isAnimationActive={false}
                      />
                    ) : null,
                  )
                : null}
              {series.map((s, i) => {
                const mark = s.mark ?? type;
                return mark === "bar" ? (
                  <Bar
                    key={`s${i}`}
                    dataKey={`s${i}`}
                    name={s.name}
                    stackId={stackId}
                    fill={`url(#${gradientId}-tex-${i})`}
                    stroke={stacked ? "var(--openui-dashboard-surface)" : undefined}
                    strokeWidth={stacked ? 2 : 0}
                    radius={percent || (stacked && i < lastBar) ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                    maxBarSize={BAR_SIZE}
                    isAnimationActive={false}
                  />
                ) : mark === "area" ? (
                  <Area
                    key={`s${i}`}
                    dataKey={`s${i}`}
                    name={s.name}
                    type={curve}
                    stackId={stackId}
                    stroke={seriesColor(i)}
                    strokeWidth={stacked ? 2 : 2.5}
                    fill={`url(#${gradientId}-${i})`}
                    connectNulls={false}
                    dot={sparseDot(rows, `s${i}`, seriesColor(i))}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--openui-dashboard-surface)" }}
                    isAnimationActive={false}
                  />
                ) : isSummaryLine(series, type, i) ? null : (
                  <Line
                    key={`s${i}`}
                    dataKey={`s${i}`}
                    name={s.name}
                    type={curve}
                    stroke={seriesColor(i)}
                    strokeWidth={i < 8 ? 2.5 : 1.25}
                    connectNulls={false}
                    dot={sparseDot(rows, `s${i}`, seriesColor(i))}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--openui-dashboard-surface)" }}
                    isAnimationActive={false}
                  />
                );
              })}
              {/* Summary lines (an average over bars) draw after the bars, with a 1px
                  surface-coloured line along their lower edge so the neutral stroke stays
                  distinct where it crosses them, in both themes. */}
              {series.map((s, i) =>
                isSummaryLine(series, type, i) ? (
                  <Line
                    key={`halo${i}`}
                    className="openui-dashboard-summary-edge"
                    dataKey={`s${i}`}
                    type={curve}
                    stroke="var(--openui-dashboard-surface)"
                    strokeWidth={1}
                    connectNulls={false}
                    dot={false}
                    activeDot={false}
                    legendType="none"
                    tooltipType="none"
                    isAnimationActive={false}
                  />
                ) : null,
              )}
              {series.map((s, i) =>
                isSummaryLine(series, type, i) ? (
                  <Line
                    key={`s${i}`}
                    dataKey={`s${i}`}
                    name={s.name}
                    type={curve}
                    stroke={SUMMARY_COLOR}
                    strokeWidth={2}
                    connectNulls={false}
                    dot={sparseDot(rows, `s${i}`, SUMMARY_COLOR)}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--openui-dashboard-surface)" }}
                    isAnimationActive={false}
                  />
                ) : null,
              )}
              {/* Stacked areas: each band's texture, stacked on its own so it sits exactly over the band. */}
              {stacked
                ? series.map((s, i) =>
                    (s.mark ?? type) === "area" ? (
                      <Area
                        key={`tex${i}`}
                        dataKey={`s${i}`}
                        type={curve}
                        stackId={`${stackId}-texture`}
                        stroke="none"
                        fill={`url(#${gradientId}-stack-${i})`}
                        dot={false}
                        activeDot={false}
                        legendType="none"
                        tooltipType="none"
                        isAnimationActive={false}
                      />
                    ) : null,
                  )
                : null}
              {forecast
                ? series.map((s, i) =>
                    (s.mark ?? type) === "bar" ? null : (
                      <Line
                        key={`f${i}`}
                        dataKey={`f${i}`}
                        name={`${s.name} (forecast)`}
                        type={curve}
                        stroke={markColor(series, type, i)}
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        dot={false}
                        activeDot={{
                          r: 4,
                          strokeWidth: 2,
                          stroke: "var(--openui-dashboard-surface)",
                        }}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    ),
                  )
                : null}
              {series.map((s, i) =>
                s.lows || s.highs ? (
                  // A range band (e.g. a 95% interval) under its line, in the line's hue.
                  <Area
                    key={`band${i}`}
                    dataKey={(row: Row) => [row[`lo${i}`], row[`hi${i}`]]}
                    type={curve}
                    stroke="none"
                    fill={seriesColor(i)}
                    fillOpacity={0.14}
                    activeDot={false}
                    legendType="none"
                    tooltipType="none"
                    isAnimationActive={false}
                  />
                ) : null,
              )}
              {showPrevious
                ? series.map((s, i) =>
                    // Bar-marked series compare with ghost bars (above); lines and areas with a dashed line.
                    (s.mark ?? type) === "bar" ? null : stacked ? (
                      // Stacked series compare stacked: each dashed edge sits on the previous period's stack.
                      <Area
                        key={`p${i}`}
                        dataKey={`p${i}`}
                        type={curve}
                        stackId="previous"
                        stroke={previousColor(i, count)}
                        strokeOpacity={previousOpacity(count)}
                        strokeWidth={1.75}
                        strokeDasharray="4 4"
                        fill="none"
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                      />
                    ) : (
                      <Line
                        key={`p${i}`}
                        dataKey={`p${i}`}
                        type={curve}
                        stroke={previousColor(i, count)}
                        strokeOpacity={previousOpacity(count)}
                        strokeWidth={1.75}
                        strokeDasharray="4 4"
                        dot={sparseDot(rows, `p${i}`, previousColor(i, count))}
                        activeDot={false}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    ),
                  )
                : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {seriesNote(unusableSeries(series))}
      </div>
    );
  },
});
