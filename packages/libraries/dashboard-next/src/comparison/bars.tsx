"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useId, useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod/v4";
import { formatSchema, formatValue, isDurationFormat, type ValueFormat } from "../format";
import { goodWhenSchema, numbersSchema } from "../schema";
import {
  Empty,
  Legend,
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
import { MUTED_COLOR, seriesColor, textureOf, TEXTURES } from "../theme";
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

const SUMMARY_COLOR = "var(--openui-dashboard-ink-secondary)";

/** The diverging palette's two poles, at full strength: ahead (cool) and behind (warm). */
export const DIVERGING_POLES = {
  above: "var(--openui-dashboard-div-9)",
  below: "var(--openui-dashboard-div-1)",
} as const;

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

function allIntegers(rows: Row[], keys: string[]) {
  return rows.every((row) =>
    keys.every((key) => typeof row[key] !== "number" || Number.isInteger(row[key])),
  );
}

/** Width of a label once WrappedTick splits it onto two lines, in px at 11px. */
function wrappedLabelWidth(label: string) {
  const words = label.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines =
    words.length > 1 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : words;
  return Math.max(...lines.map((line) => line.length)) * 6.4;
}

/** An x-axis tick that wraps a multi-word label onto two lines instead of colliding. */
function WrappedTick({
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
  colorOf = (index: number) => seriesColor(index)!,
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
        : { name: s.name, color: seriesColor(i)! },
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

const stackedSchema = z.union([z.boolean(), z.literal("percent")]);

/* ---------- Bars: categorical comparison ---------- */

const barsSchema = z.object({
  labels: z.array(z.string()),
  series: z.array(Series.ref),
  format: formatSchema.optional(),
  orientation: z.enum(["vertical", "horizontal"]).optional(),
  stacked: stackedSchema.optional(),
  goodWhen: goodWhenSchema.optional(),
  references: z.array(Reference.ref).optional(),
  diverging: z.array(z.string()).optional(),
});

/**
 * A bar with the previous period marked across it: the Funnel's dashed tick,
 * placed at the previous value on the bar's own scale and running 3px past its
 * edges, so it reads on 6px bars and beyond the bar's end when the value fell.
 */
function PreviousTickBar(
  props: Record<string, unknown> & { previousKey: string; valueKey: string; horizontal: boolean },
) {
  const { previousKey, valueKey, horizontal, ...rect } = props;
  const x = Number(rect["x"]),
    y = Number(rect["y"]),
    width = Number(rect["width"]),
    height = Number(rect["height"]);
  const payload = rect["payload"] as Row | undefined;
  const value = payload?.[valueKey];
  const previous = payload?.[previousKey];
  const tick =
    typeof value === "number" && typeof previous === "number" && value !== 0
      ? horizontal
        ? {
            x1: x + (width * previous) / value,
            x2: x + (width * previous) / value,
            y1: y - 3,
            y2: y + height + 3,
          }
        : {
            y1: y + height - (height * previous) / value,
            y2: y + height - (height * previous) / value,
            x1: x - 3,
            x2: x + width + 3,
          }
      : null;
  return (
    <g>
      <Rectangle {...(rect as object)} />
      {tick ? (
        <line
          {...tick}
          stroke="var(--openui-dashboard-ink-secondary)"
          strokeWidth={2}
          strokeDasharray="2 2"
          strokeOpacity={0.7}
        />
      ) : null}
    </g>
  );
}

export const Bars = defineComponent({
  name: "Bars",
  props: barsSchema,
  description:
    'Values across categories. For periods such as weeks or months, use TimeSeries with type "bar". Horizontal (default) for long labels and rankings; vertical for short labels and ordered buckets (histograms). Several series group side by side, or stack (stacked "percent" for each part\'s share). references draw lines such as a 1.0x break-even. diverging [aboveLabel, belowLabel] colours one series by sign around zero, e.g. ["Ahead of plan", "Behind plan"].',
  component: function BarsView({ props }: ComponentRenderProps<z.infer<typeof barsSchema>>) {
    const [chartRef, width] = useWidth<HTMLDivElement>();
    const texId = useId().replace(/:/g, "");
    const compare = useCompare();
    const labels = toStrings(props.labels);
    const series = useMemo(() => nodeList<SeriesProps>(props.series), [props.series]);
    // Keyed on the prop itself: toStrings returns a new array every render.
    const rows = useMemo(() => buildRows(toStrings(props.labels), series), [props.labels, series]);
    const references = nodeList<ReferenceProps>(props.references);
    // Horizontal single-series bars print their value at the bar's end, so small
    // bars next to an outlier stay readable without hovering.
    const diverging = props.diverging && props.diverging.length >= 2 ? props.diverging : null;
    const valueLabels =
      (props.orientation ?? "horizontal") === "horizontal" &&
      series.length === 1 &&
      !props.stacked &&
      !diverging &&
      labels.length <= 16;
    const chartRows = valueLabels
      ? rows.map((row) => ({
          ...row,
          t0:
            typeof row["s0"] === "number"
              ? formatValue(row["s0"], props.format).replace(/ /g, "\u00a0")
              : "",
        }))
      : rows;
    if (!labels.length || !series.length) return <Empty />;
    if (unusableSeries(series).length === series.length) return <Empty />;
    // All zeros is not empty: a zero is a real value, so the bars draw at zero.

    const horizontal = (props.orientation ?? "horizontal") === "horizontal";
    const showPrevious = compare.enabled && hasPrevious(series);
    // Faded previous bars only for a single series: beside several series they double the bars
    // per category past reading. With several, the previous period shows as each series' change in the tooltip.
    const ghostBars = showPrevious && series.length === 1;
    // Several series side by side: the previous period is a dashed tick across each bar, as on Funnel.
    const tickPrevious = showPrevious && series.length > 1 && !props.stacked;
    const count = series.length;
    const stacked = !!props.stacked;
    const percent = props.stacked === "percent";
    const stackId = stacked ? "stack" : undefined;
    const longestLabel = Math.max(...labels.map((label) => label.length));
    // Vertical bars: tilt category labels only when a wrapped label is wider than its column.
    const column = width ? (width - 64) / Math.max(1, labels.length) : 0;
    const angled =
      !horizontal && column > 0 && Math.max(...labels.map(wrappedLabelWidth)) > column - 6;
    // Bars side by side in one category: a stack is one bar; a faded previous bar adds half of one.
    const barsPerBand = stacked ? 1 : count + (ghostBars ? 0.5 : 0);
    // Horizontal: the usual height, grown only when a category needs more room to keep every bar at BAR_MIN.
    // The plot is the bands plus the top margin (room for a reference chip) and the 30px value axis.
    const usual = Math.max(160, labels.length * (count > 1 || hasPrevious(series) ? 44 : 34) + 24);
    const needed =
      labels.length * bandFor(barsPerBand, 0.24) + (references.length ? CHIP_ROOM : 12) + 30;
    // Vertical bars fill the card down to the plot floor; horizontal bars need room per category.
    const height = horizontal ? Math.ceil(Math.max(usual, needed)) : PLOT_FLOOR;
    // Vertical: the plot keeps a width that holds BAR_MIN, scrolling sideways when the card is narrower.
    const plotMin = horizontal ? 0 : minPlotWidth(width, labels.length, barsPerBand, 0.24);
    const radius = (i: number): [number, number, number, number] =>
      // 100% stacks all end on the same line, so no segment rounds, the outer one included.
      percent || (stacked && i < count - 1)
        ? [0, 0, 0, 0]
        : horizontal
          ? [0, 4, 4, 0]
          : [4, 4, 0, 0];

    const valueAxis = {
      tickLine: false,
      axisLine: false,
      tick: AXIS_TICK,
      tickCount: 5,
      allowDecimals: !allIntegers(
        rows,
        series.map((_, i) => `s${i}`),
      ),
      ticks: isDurationFormat(props.format)
        ? durationTicks(
            rows,
            series.map((_, i) => `s${i}`).concat(ghostBars ? series.map((_, i) => `p${i}`) : []),
            references.map((r) => r.value),
          )
        : undefined,
      tickFormatter: (value: number) =>
        percent ? `${Math.round(value * 100)}%` : formatValue(value, props.format, { axis: true }),
      ...(percent
        ? {
            domain: [0, 1] as [number, number],
            ticks: [0, 0.25, 0.5, 0.75, 1],
            allowDecimals: true,
          }
        : {}),
    };

    return (
      <div className="openui-dashboard-chart" ref={chartRef}>
        <SrTable
          caption="Chart data by category"
          head={["Category", ...series.map((s) => s.name)]}
          rows={rows.map((row) => [
            String(row["label"]),
            ...series.map((_, i) => formatValue(row[`s${i}`], props.format)),
          ])}
        />
        <Legend
          entries={
            diverging
              ? [
                  { name: diverging[0]!, color: DIVERGING_POLES.above },
                  { name: diverging[1]!, color: DIVERGING_POLES.below },
                  ...references.map((r) => ({
                    name: r.label,
                    color: "var(--openui-dashboard-ink-muted)",
                    dotted: true,
                  })),
                ]
              : tickPrevious
                ? [
                    ...legendFor(series, false, compare.label, true, references).filter(
                      (entry) => !entry.hidden,
                    ),
                    {
                      name: compare.label,
                      color: "var(--openui-dashboard-ink-secondary)",
                      dashed: true,
                    },
                  ]
                : legendFor(series, ghostBars, compare.label, true, references)
          }
        />
        <div
          className="openui-dashboard-chart-plot"
          style={{ minHeight: height, marginTop: 4, overflowX: plotMin ? "auto" : undefined }}
        >
          {/* Past BAR_MIN the chart takes a fixed width and the plot scrolls sideways (a number, since a
              responsive container keeps its first measurement when only its parent widens). */}
          <ResponsiveContainer width={plotMin || "100%"} height="100%">
            <ComposedChart
              key={ghostBars ? "compare" : "plain"}
              data={chartRows}
              layout={horizontal ? "vertical" : "horizontal"}
              stackOffset={percent ? "expand" : undefined}
              margin={{
                top: horizontal && references.length ? CHIP_ROOM : 12,
                right: valueLabels ? 64 : 12,
                bottom: 0,
                left: 0,
              }}
              barGap={2}
              barCategoryGap="24%"
            >
              <defs>
                <BarTexturePatterns id={texId} count={series.length} />
                {/* Diverging: the poles carry the same textures as series (dots above, hatch below), so sign never rests on hue alone. */}
                {diverging ? (
                  <BarTexturePatterns
                    id={`${texId}-div`}
                    count={2}
                    colors={[DIVERGING_POLES.above, DIVERGING_POLES.below]}
                  />
                ) : null}
              </defs>
              <CartesianGrid
                horizontal={!horizontal}
                vertical={horizontal}
                stroke="var(--openui-dashboard-grid)"
              />
              {horizontal ? (
                <>
                  <XAxis type="number" {...valueAxis} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ ...AXIS_TICK, fill: "var(--openui-dashboard-ink-secondary)" }}
                    width={Math.min(190, Math.max(64, longestLabel * 7.4 + 14))}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={<WrappedTick angled={angled} band={column} />}
                    height={angled ? 56 : 36}
                    interval={0}
                  />
                  <YAxis
                    {...valueAxis}
                    width={
                      percent
                        ? 44
                        : yAxisWidth(
                            rows,
                            series.map((_, i) => `s${i}`),
                            props.format,
                          )
                    }
                  />
                </>
              )}
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
                    colorOf={
                      diverging
                        ? (i: number, row: Row) =>
                            typeof row["s0"] === "number" && row["s0"] < 0
                              ? DIVERGING_POLES.below
                              : DIVERGING_POLES.above
                        : undefined
                    }
                  />
                )}
              />
              {diverging ? (
                <ReferenceLine
                  {...(horizontal ? { x: 0 } : { y: 0 })}
                  stroke="var(--openui-dashboard-border-strong)"
                  strokeWidth={1}
                />
              ) : null}
              {references.map((reference) => (
                <ReferenceLine
                  key={`${reference.label}-${reference.value}`}
                  {...(horizontal ? { x: reference.value } : { y: reference.value })}
                  stroke="var(--openui-dashboard-ink-muted)"
                  strokeWidth={1.5}
                  strokeDasharray="0.1 4"
                  strokeLinecap="round"
                  label={
                    <ReferenceChipLabel
                      text={`${reference.label} · ${formatValue(reference.value, props.format)}`}
                    />
                  }
                  ifOverflow="extendDomain"
                />
              ))}
              {ghostBars
                ? series.map((_, i) => (
                    <Bar
                      key={`p${i}`}
                      dataKey={`p${i}`}
                      fill={previousColor(i, count)}
                      fillOpacity={count === 1 ? 0.6 : 0.3}
                      radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                      maxBarSize={BAR_SIZE / 2}
                      isAnimationActive={false}
                    />
                  ))
                : null}
              {series.map((s, i) => (
                <Bar
                  key={`s${i}`}
                  dataKey={`s${i}`}
                  name={s.name}
                  stackId={stackId}
                  fill={`url(#${texId}-tex-${i})`}
                  shape={
                    tickPrevious
                      ? (shape: unknown) => (
                          <PreviousTickBar
                            {...(shape as Record<string, unknown>)}
                            previousKey={`p${i}`}
                            valueKey={`s${i}`}
                            horizontal={horizontal}
                          />
                        )
                      : undefined
                  }
                  stroke={props.stacked ? "var(--openui-dashboard-surface)" : undefined}
                  strokeWidth={props.stacked ? 2 : 0}
                  radius={radius(i)}
                  maxBarSize={BAR_SIZE}
                  isAnimationActive={false}
                >
                  {valueLabels ? (
                    <LabelList
                      dataKey="t0"
                      position="right"
                      offset={8}
                      fontSize={11}
                      fill="var(--openui-dashboard-ink-secondary)"
                    />
                  ) : null}
                  {diverging && i === 0
                    ? rows.map((row) => (
                        // Polarity, not status: the diverging palette's two poles.
                        <Cell
                          key={String(row["label"])}
                          fill={`url(#${texId}-div-tex-${typeof row["s0"] === "number" && row["s0"] < 0 ? 1 : 0})`}
                        />
                      ))
                    : null}
                </Bar>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {seriesNote(unusableSeries(series))}
      </div>
    );
  },
});
