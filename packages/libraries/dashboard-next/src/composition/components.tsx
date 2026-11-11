"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useId, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Pie,
  PieChart,
  Treemap as RechartsTreemap,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod/v4";
import {
  AXIS_TICK,
  BarTexturePatterns,
  CHIP,
  InkCursor,
  minPlotWidth,
  PLOT_FLOOR,
  seriesColor,
  TextureTile,
  wrappedLabelWidth,
  WrappedTick,
} from "../charts/helpers";
import { formatSchema, formatValue, isRateFormat, type ValueFormat } from "../format";
import { goodWhenSchema } from "../schema";
import {
  columnFormatter,
  Empty,
  foldParts,
  keepLargest,
  Legend,
  nodeList,
  PartNote,
  PartsLegend,
  partsNote,
  ScrollArea,
  SrTable,
  toNumbers,
  TooltipCard,
  toStrings,
  useCompare,
  useIsomorphicLayoutEffect,
  useRowHover,
  useWidth,
  ViewSwitch,
} from "../shared";
import { MUTED_COLOR, textureOf } from "../theme";

// Funnel's segments are Series, which the Trends group owns and registers.
import { Series } from "../trends/charts";
const WATERFALL_BAR = 16;
const donutSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
  centerLabel: z.string().optional(),
});

const MAX_SLICES = 8;

export const Donut = defineComponent({
  name: "Donut",
  props: donutSchema,
  description:
    "Part of a whole with the total as the headline, up to 8 parts; past 8, the smallest fold into Other. For a compact strip, use SegmentedBar.",
  component: function DonutView({ props }: ComponentRenderProps<z.infer<typeof donutSchema>>) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const patternId = useId().replace(/:/g, "");
    const [areaRef, areaWidth] = useWidth<HTMLDivElement>();
    const labels = toStrings(props.labels);
    const values = toNumbers(props.values).map((value) => value ?? 0);
    const parts = labels
      .map((label, i) => ({ label, value: values[i] ?? 0 }))
      .filter((part) => part.value > 0);
    const dropped = labels.filter((_, i) => !((values[i] ?? 0) > 0));
    // Values that are already shares (percent) would print the same number twice.
    const sharesGiven = isRateFormat(props.format);
    if (!parts.length) return <Empty />;
    // Keep the given order for colour stability; past eight parts, the smallest
    // fold into "Other" so the ring never carries more than eight slices.
    const { kept, other } = foldParts(parts, MAX_SLICES);
    const slices = [
      ...kept.map((part, i) => ({ ...part, color: seriesColor(i) })),
      ...(other > 0 ? [{ label: "Other", value: other, color: MUTED_COLOR }] : []),
    ];
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    const k = areaWidth ? Math.min(1.2, areaWidth / 280) : 1;
    // A 4px gap between slices, measured along the thin outer arcs; the band
    // shares the same angle so the two rings stay radially aligned.
    const pad = slices.length > 1 ? (4 / (129.5 * k)) * (180 / Math.PI) : 0;
    const W = 280 * k;
    const H = 150 * k;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          flex: "1 1 auto",
          width: "100%",
        }}
      >
        {/* Semicircle: a thin rounded arc per slice with a soft tint band
            inside it; the hollow is the hover readout, so there is no
            floating tooltip. */}
        <div
          ref={areaRef}
          style={{
            flex: "1 1 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: H,
            paddingBottom: 20,
          }}
        >
          <div
            style={{
              position: "relative",
              width: W,
              height: H,
              flex: "none",
              visibility: areaWidth ? undefined : "hidden",
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <PieChart width={W} height={H}>
              <defs>
                {/* One texture per slice (dots, slash, back-slash and so on) over a
                    light tint, fading out toward the band's inner edge. */}
                {slices.map((slice, i) => (
                  <TextureTile
                    key={i}
                    id={`${patternId}-band-${i}`}
                    index={i}
                    base={slice.color}
                    baseOpacity="var(--openui-dashboard-tex-tint)"
                    ink={slice.color}
                    opacity="var(--openui-dashboard-tex-ink)"
                  />
                ))}
                <radialGradient
                  id={`${patternId}-bandfade`}
                  gradientUnits="userSpaceOnUse"
                  cx={W / 2}
                  cy={H}
                  r={125 * k}
                >
                  <stop offset="76%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </radialGradient>
                <mask id={`${patternId}-bandmask`}>
                  <rect x="0" y="0" width={W} height={H} fill={`url(#${patternId}-bandfade)`} />
                </mask>
              </defs>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={97 * k}
                outerRadius={125 * k}
                paddingAngle={pad}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {slices.map((slice, i) => (
                  <Cell
                    key={slice.label}
                    fill={`url(#${patternId}-band-${i})`}
                    mask={`url(#${patternId}-bandmask)`}
                    fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                  />
                ))}
              </Pie>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={127 * k}
                outerRadius={132 * k}
                paddingAngle={pad}
                cornerRadius={3}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {slices.map((slice, i) => (
                  <Cell
                    key={slice.label}
                    fill={slice.color}
                    fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                  />
                ))}
              </Pie>
              <Tooltip
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 5 }}
                content={({ active, payload }) => {
                  const slice = active
                    ? (payload?.[0]?.payload as (typeof slices)[number] | undefined)
                    : undefined;
                  if (!slice) return null;
                  return (
                    <TooltipCard
                      title={
                        sharesGiven
                          ? slice.label
                          : `${slice.label} · ${formatValue(slice.value, props.format)}`
                      }
                      rows={[
                        {
                          name: "Share",
                          color: slice.color,
                          value: sharesGiven ? slice.value : (slice.value / total) * 100,
                        },
                      ]}
                      format={sharesGiven ? props.format : "percent"}
                    />
                  );
                }}
              />
            </PieChart>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 2,
                display: "grid",
                justifyItems: "center",
                textAlign: "center",
                gap: 2,
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontSize: Math.round(20 * Math.min(k, 1.2)),
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatValue(total, props.format)}
              </span>
              <span style={{ fontSize: 12, color: "var(--openui-dashboard-ink-muted)" }}>
                {props.centerLabel ?? "Total"}
              </span>
            </div>
          </div>
        </div>
        {/* marginTop auto pins the legend to the card's bottom edge; the same legend as SegmentedBar's, and it scrolls only when the card is squeezed. */}
        <ScrollArea
          maxHeight={240}
          label="Scroll the legend"
          watch={slices.length}
          style={{ width: "100%", margin: "auto 0 0" }}
        >
          <PartsLegend
            parts={slices}
            format={props.format}
            sharesGiven={sharesGiven}
            active={activeIndex === null ? null : (slices[activeIndex]?.label ?? null)}
            onHover={(label) =>
              setActiveIndex(
                label === null ? null : slices.findIndex((slice) => slice.label === label),
              )
            }
          />
        </ScrollArea>
        {partsNote(dropped)}
      </div>
    );
  },
});

/* ---------- Waterfall: how a total moved ---------- */

const waterfallSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
  endLabel: z.string().optional(),
  goodWhen: goodWhenSchema.optional(),
  subtotals: z.array(z.string()).optional(),
});

export const Waterfall = defineComponent({
  name: "Waterfall",
  props: waterfallSchema,
  description:
    'How a total moved: the first value is the starting total, the rest are signed changes, the end total is computed. Increases and decreases wear the good/bad status colours; pass goodWhen "down" when a decrease is the good outcome (costs). E.g. Waterfall(["Start MRR", "New", "Expansion", "Churn"], [398200, 18400, 9100, -9300], "currency-compact", "End MRR"). subtotals names labels drawn as the running total at that point (their values are ignored; pass 0), for a P&L: Waterfall(["Revenue", "Cost of sales", "Gross profit", "Operating costs"], [820000, -310000, 0, -280000], "currency-compact", "Operating profit", "up", ["Gross profit"]).',
  component: function WaterfallView({
    props,
  }: ComponentRenderProps<z.infer<typeof waterfallSchema>>) {
    const [chartRef, width] = useWidth<HTMLDivElement>();
    const wfTex = `wf${useId().replace(/:/g, "")}`;
    const labels = toStrings(props.labels);
    const values = toNumbers(props.values).map((value) => value ?? 0);
    const subtotals = new Set(props.subtotals ? toStrings(props.subtotals) : []);
    if (!labels.length) return <Empty />;
    let running = 0;
    const rows = labels.map((label, i) => {
      const value = values[i] ?? 0;
      // A subtotal is the running total so far, drawn from the base like the start and end.
      if (i > 0 && subtotals.has(label))
        return { label, base: 0, bar: running, value: running, kind: "total" as const };
      if (i === 0) {
        running = value;
        return { label, base: 0, bar: value, value, kind: "total" as const };
      }
      const start = running;
      running += value;
      return {
        label,
        base: Math.min(start, running),
        bar: Math.abs(value),
        value,
        kind: value >= 0 ? ("up" as const) : ("down" as const),
      };
    });
    rows.push({
      label: props.endLabel ?? "End",
      base: 0,
      bar: running,
      value: running,
      kind: "total",
    });
    const labelled = rows.map((row) => {
      // Non-breaking spaces: Recharts wraps a bar label at a space, which stacked "12.4K units" on two lines.
      const text = formatValue(row.value, props.format, { axis: true }).replace(/ /g, "\u00a0");
      return { ...row, text: row.kind === "up" ? `+${text}` : text };
    });
    // Changes carry status meaning, so they wear the status marks — the same
    // encoding as every delta — and never spend categorical hues.
    const goodWhen = props.goodWhen ?? "up";
    const good = "var(--openui-dashboard-good-mark)";
    const bad = "var(--openui-dashboard-bad-mark)";
    const color = {
      total: "var(--openui-dashboard-series-1)",
      up:
        goodWhen === "neutral"
          ? "var(--openui-dashboard-muted-mark)"
          : goodWhen === "up"
            ? good
            : bad,
      down:
        goodWhen === "neutral"
          ? "var(--openui-dashboard-muted-mark)"
          : goodWhen === "up"
            ? bad
            : good,
    };
    // Zoom to where the total moves: changes are small next to the totals, so a
    // zero-based axis would turn every change bar into a sliver.
    const levels = labelled.flatMap((row) =>
      row.kind === "total" ? [row.value] : [row.base, row.base + row.bar],
    );
    const low = Math.min(...levels);
    const high = Math.max(...levels);
    // Leave the totals a solid base below the lowest level, about 1.5× the movement.
    const pad = (high - low || Math.abs(high) || 1) * 1.5;
    // Floor at zero unless the walk itself goes below it (an operating loss), so negative ends stay visible.
    const domainMin =
      low < 0 ? low - (high - low || Math.abs(low) || 1) * 0.1 : Math.max(0, low - pad);
    // Tilt the labels only when a wrapped label is wider than its column.
    const band = width ? (width - 64) / Math.max(1, labelled.length) : 0;
    const angled =
      band > 0 && Math.max(...labelled.map((row) => wrappedLabelWidth(row.label))) > band - 6;
    const plotMin = minPlotWidth(width, labelled.length, 1, 0.22);
    // Range bars ([from, to]) rather than a stacked base: a stack can't cross zero, a range can.
    // Totals rise from the axis floor, or from zero once the walk dips below it.
    const zoomed = labelled.map((row) => ({
      ...row,
      range:
        row.kind !== "total"
          ? [row.base, row.base + row.bar]
          : low < 0
            ? [Math.min(0, row.value), Math.max(0, row.value)]
            : [domainMin, row.value],
    }));
    // Connectors: each bar hands its end level to the next, a dotted line in the
    // reference style across the gap. Bars render in order, so bar i records its
    // right edge and end level here and bar i + 1 draws the line back to it.
    const ends: { right: number; y: number }[] = [];
    const ConnectedBar = (shape: unknown) => {
      const p = shape as {
        x: number;
        y: number;
        width: number;
        height: number;
        index: number;
        payload: { kind: string };
      };
      const prev = p.index > 0 ? ends[p.index - 1]! : undefined;
      const { kind, value } = p.payload as { kind: string; value: number };
      ends[p.index] = {
        right: p.x + p.width,
        y: kind === "down" || (kind === "total" && value < 0) ? p.y + p.height : p.y,
      };
      return (
        <g>
          {prev ? (
            <line
              x1={prev.right + 2}
              x2={p.x - 2}
              y1={prev.y}
              y2={prev.y}
              stroke="var(--openui-dashboard-ink-muted)"
              strokeWidth={1.25}
              strokeDasharray="0.1 3"
              strokeLinecap="round"
            />
          ) : null}
          <Rectangle {...(shape as object)} />
        </g>
      );
    };

    return (
      <div className="openui-dashboard-chart" ref={chartRef}>
        <SrTable
          caption="How the total moved"
          head={["Step", "Value"]}
          rows={labelled.map((row) => [row.label, row.text])}
        />
        <Legend
          entries={[
            { name: "Total", color: color.total },
            { name: "Increase", color: color.up },
            { name: "Decrease", color: color.down },
          ]}
        />
        <div
          className="openui-dashboard-chart-plot"
          style={{
            minHeight: 260,
            maxHeight: 416,
            marginTop: 10,
            overflowX: plotMin ? "auto" : undefined,
          }}
        >
          {/* Past BAR_MIN the chart takes a fixed width and the plot scrolls sideways (a number, since a
              responsive container keeps its first measurement when only its parent widens). */}
          <ResponsiveContainer width={plotMin || "100%"} height="100%">
            <ComposedChart
              data={zoomed}
              margin={{ top: 18, right: 8, bottom: 0, left: 0 }}
              barCategoryGap="22%"
            >
              <defs>
                <BarTexturePatterns
                  id={wfTex}
                  count={3}
                  colors={[color.total, color.up, color.down]}
                />
              </defs>
              <CartesianGrid vertical={false} stroke="var(--openui-dashboard-grid)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={<WrappedTick angled={angled} band={band} />}
                height={angled ? 56 : 36}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                tickCount={5}
                width={56}
                domain={[domainMin, "auto"]}
                allowDataOverflow
                tickFormatter={(value: number) => formatValue(value, props.format, { axis: true })}
              />
              <Tooltip
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 5 }}
                cursor={<InkCursor />}
                content={({ active, payload }) => {
                  const row = active
                    ? (payload?.[0]?.payload as (typeof rows)[number] | undefined)
                    : undefined;
                  if (!row) return null;
                  const sign = row.kind === "up" ? "+" : "";
                  // No swatch: the bar under the pointer is the mark. Increases carry their sign.
                  return (
                    <TooltipCard
                      title={row.label}
                      rows={[
                        {
                          name: row.kind === "total" ? "Total" : "Change",
                          color: color[row.kind]!,
                          value: row.value,
                          mark: null,
                          text: `${sign}${formatValue(row.value, props.format)}`,
                        },
                      ]}
                    />
                  );
                }}
              />
              <Bar
                dataKey="range"
                radius={[4, 4, 4, 4]}
                maxBarSize={WATERFALL_BAR}
                isAnimationActive={false}
                shape={ConnectedBar}
              >
                {rows.map((row) => (
                  // Textured like every bar: total dots, an increase slash (rising), a decrease back-slash (falling).
                  <Cell
                    key={row.label}
                    fill={`url(#${wfTex}-tex-${row.kind === "total" ? 0 : row.kind === "up" ? 1 : 2})`}
                  />
                ))}
                <LabelList
                  dataKey="text"
                  position="top"
                  fontSize={11}
                  fill="var(--openui-dashboard-ink-secondary)"
                />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
});
const funnelSchema = z.object({
  steps: z.array(z.string()),
  values: z.array(z.number()),
  previous: z.array(z.number()).optional(),
  format: formatSchema.optional(),
  shape: z.enum(["bars", "funnel"]).optional(),
  segments: z.array(Series.ref).optional(),
  basis: z.enum(["step", "start"]).optional(),
});

type FunnelBasis = "step" | "start";
const BASIS_OPTIONS: { value: FunnelBasis; label: string }[] = [
  { value: "step", label: "Step to step" },
  { value: "start", label: "From start" },
];

/** The printed rate and change between two steps: from the step before, or from the first step. */
function funnelRate(values: number[], i: number, basis: FunnelBasis) {
  const base = basis === "start" ? values[0]! : values[i - 1]!;
  return { rate: base ? values[i]! / base : null, change: values[i]! - base };
}

type FunnelSegment = { name: string; values: number[]; color: string; texture: number };

/** The step with the worst step-to-step conversion, flagged when there are at least three steps. */
function biggestDrop(values: number[]): number | null {
  if (values.length < 3) return null;
  let worst: number | null = null;
  let rate = Infinity;
  for (let i = 1; i < values.length; i++) {
    if (!values[i - 1]! || values[i]! > values[i - 1]!) continue;
    const r = values[i]! / values[i - 1]!;
    if (r < rate) [rate, worst] = [r, i];
  }
  return worst;
}

/** The funnel's weakest step, in the reference chip (ink fill, surface text, CHIP measures) with a red status dot. */
const DropFlag = () => (
  <span
    className="openui-dashboard-funnel-flag"
    style={{ height: CHIP.height, borderRadius: CHIP.radius, fontSize: CHIP.fontSize }}
  >
    <span aria-hidden />
    Biggest drop
  </span>
);

/** One tooltip for both shapes: the count, its share of the first step, conversion from the step before, then each segment. */
function funnelTip({
  steps,
  values,
  previous,
  showPrevious,
  compareLabel,
  format,
  segments,
  i,
}: {
  steps: string[];
  values: number[];
  previous: (number | null)[];
  showPrevious: boolean;
  compareLabel: string;
  format?: ValueFormat | null;
  segments: FunnelSegment[];
  i: number;
}) {
  const prev = showPrevious && typeof previous[i]! === "number" ? (previous[i]! as number) : null;
  const dot = <span className="openui-dashboard-tip-dot" />;
  return (
    <TooltipCard
      title={steps[i]!}
      format={format ?? "number"}
      rows={[
        {
          name: "Count",
          color: "var(--openui-dashboard-series-1)",
          value: values[i]!,
          previous: prev,
        },
        ...(prev !== null
          ? [
              {
                name: compareLabel,
                color: "var(--openui-dashboard-ink-secondary)",
                value: prev,
                dashed: true,
              },
            ]
          : []),
        {
          name: `Share of ${steps[0]!}`,
          color: "transparent",
          value: (values[i]! / values[0]!) * 100,
          format: "percent" as const,
          mark: dot,
        },
        ...(i > 0 && values[i - 1]!
          ? [
              {
                name: "Converted from the step before",
                color: "transparent",
                value: (values[i]! / values[i - 1]!) * 100,
                format: "percent" as const,
                mark: dot,
              },
            ]
          : []),
        ...segments.map((segment) => ({
          name: segment.name,
          color: segment.color,
          value: segment.values[i] ?? null,
        })),
      ]}
    />
  );
}

const FUNNEL_HEIGHT = 168;
/** Below this width per step the names collide, so the funnel falls back to bars. */
const FUNNEL_MIN_STEP = 104;
/** About seven steps (26px bars, 32px connectors) before the list scrolls inside the card. */
const FUNNEL_LIST_MAX = 408;
/** Room kept at the end of every bar track for the rate printed after the bar. */
const FUNNEL_RATE_ROOM = 56;

/**
 * The funnel drawn as a funnel: each step a block whose height is its share
 * of the first, standing on one baseline, tapering into the next with a curve;
 * the taper is the drop-off. Names and counts sit above, the loss under each taper.
 */
function FunnelShape({
  steps,
  values,
  previous,
  showPrevious,
  compareLabel,
  format,
  width,
  segments,
  basis,
}: {
  steps: string[];
  values: number[];
  previous: (number | null)[];
  showPrevious: boolean;
  compareLabel: string;
  format: z.infer<typeof funnelSchema>["format"];
  width: number;
  segments: FunnelSegment[];
  basis: FunnelBasis;
}) {
  const id = useId().replace(/:/g, "");
  const top = values[0]!;
  const prevTop = previous[0] ?? 0;
  const n = steps.length;
  // The plot takes whatever height its card leaves (FUNNEL_HEIGHT at least), so a tall row draws taller blocks.
  const [growEl, setGrowEl] = useState<HTMLDivElement | null>(null);
  const [room, setRoom] = useState(0);
  useIsomorphicLayoutEffect(() => {
    if (!growEl) return;
    const update = () => setRoom(Math.floor(growEl.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(growEl);
    return () => observer.disconnect();
  }, [growEl]);
  const H = Math.max(FUNNEL_HEIGHT, room);
  const col = width / n;
  const flat = col * 0.58;
  // Blocks top out 18px under the plot's top, so the rate above even a full block fits.
  const height = (value: number) => Math.max(6, (value / top) * (H - 18));
  // Bottom-aligned: every block stands on one straight baseline, so only the top edge steps down.
  const edge = (h: number) => [H - h, H] as const;
  const hover = useRowHover();
  // Block height shows each step's share of the first; the printed rate is step-to-step conversion.
  const conversionText = columnFormatter(
    values.slice(1).map((_, i) => (funnelRate(values, i + 1, basis).rate ?? 0) * 100),
    "percent",
  );
  // The weakest step is a step-to-step reading, so it's flagged only there.
  const worst = basis === "step" ? biggestDrop(values) : null;
  return (
    <div
      className="openui-dashboard-funnel-shape"
      style={{ ["--openui-dashboard-funnel-cols" as string]: n }}
    >
      <div className="openui-dashboard-funnel-heads">
        {steps.map((step, i) => (
          <div key={step}>
            <div className="openui-dashboard-funnel-name">{step}</div>
            <div className="openui-dashboard-funnel-count">
              {formatValue(values[i]!, format ?? "number")}
            </div>
          </div>
        ))}
      </div>
      <div className="openui-dashboard-funnel-grow" ref={setGrowEl}>
        <div
          className="openui-dashboard-funnel-plot openui-dashboard-rows"
          ref={hover.ref}
          style={{ height: H }}
        >
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden>
            <defs>
              <pattern
                id={`${id}-dots`}
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <circle
                  cx="1.8"
                  cy="1.8"
                  r="0.8"
                  fill="black"
                  style={{ opacity: "var(--openui-dashboard-bar-ink)" }}
                />
              </pattern>
            </defs>
            {steps.map((step, i) => {
              const h = height(values[i]!);
              const [y0, y1] = edge(h);
              const x0 = i * col;
              const x1 = i === n - 1 ? width : x0 + flat;
              const opacity = 1 - i * (0.5 / Math.max(n - 1, 1));
              const block = `M${x0},${y0} H${x1} V${y1} H${x0} Z`;
              let taper: string | null = null;
              if (i < n - 1) {
                const [n0, n1] = edge(height(values[i + 1]!));
                const x2 = (i + 1) * col;
                const mid = (x1 + x2) / 2;
                taper = `M${x1},${y0} C${mid},${y0} ${mid},${n0} ${x2},${n0} V${n1} C${mid},${n1} ${mid},${y1} ${x1},${y1} Z`;
              }
              const prev =
                showPrevious && typeof previous[i]! === "number" && prevTop
                  ? edge(Math.max(6, ((previous[i]! as number) / prevTop) * (H - 18)))
                  : null;
              return (
                <g key={step}>
                  {segments.length ? (
                    // Split: the block stacks one band per segment, top to bottom in segment order.
                    (() => {
                      const total =
                        segments.reduce((sum, segment) => sum + (segment.values[i] ?? 0), 0) || 1;
                      let at = y0;
                      return segments.map((segment, k) => {
                        const h = ((segment.values[i] ?? 0) / total) * (y1 - y0);
                        const band = (
                          <g key={segment.name}>
                            <rect
                              x={x0}
                              y={at}
                              width={x1 - x0}
                              height={Math.max(h - (k < segments.length - 1 ? 1 : 0), 0)}
                              fill={segment.color}
                            />
                            <rect
                              x={x0}
                              y={at}
                              width={x1 - x0}
                              height={Math.max(h - (k < segments.length - 1 ? 1 : 0), 0)}
                              fill={`url(#${id}-dots)`}
                            />
                          </g>
                        );
                        at += h;
                        return band;
                      });
                    })()
                  ) : (
                    <>
                      <path d={block} fill="var(--openui-dashboard-series-1)" opacity={opacity} />
                      <path d={block} fill={`url(#${id}-dots)`} />
                    </>
                  )}
                  {taper ? (
                    <path
                      d={taper}
                      fill={
                        segments.length
                          ? "var(--openui-dashboard-ink)"
                          : "var(--openui-dashboard-series-1)"
                      }
                      opacity={segments.length ? 0.06 : opacity * 0.32}
                    />
                  ) : null}
                  {i > 0
                    ? (() => {
                        // The step's rate just above its block, on the surface: readable whatever the block's shade.
                        const { rate } = funnelRate(values, i, basis);
                        return (
                          <text
                            x={x0 + 2}
                            y={y0 - 6}
                            fontSize={12}
                            fontWeight={600}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                            fill="var(--openui-dashboard-ink-secondary)"
                          >
                            {conversionText((rate ?? 0) * 100)}
                          </text>
                        );
                      })()
                    : null}
                  {prev ? (
                    <g
                      stroke="var(--openui-dashboard-ink-secondary)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.7"
                    >
                      <line x1={x0 + 2} x2={x1 - 2} y1={prev[0]!} y2={prev[0]!} />
                      <line x1={x0 + 2} x2={x1 - 2} y1={prev[1]!} y2={prev[1]!} />
                    </g>
                  ) : null}
                </g>
              );
            })}
            {/* A surface gap between steps, so each block reads as its own mark. */}
            {steps.slice(1).map((_, i) => (
              <line
                key={i}
                x1={(i + 1) * col}
                x2={(i + 1) * col}
                y1={0}
                y2={H}
                stroke="var(--openui-dashboard-surface)"
                strokeWidth="2"
              />
            ))}
          </svg>
          {/* One hit column per step for the kit tooltip, as on the Bars shape. */}
          {steps.map((step, i) => (
            <span
              key={`hit-${step}`}
              className="openui-dashboard-funnel-hit"
              style={{ left: i * col, width: col }}
              {...hover.rowProps(step, () =>
                funnelTip({
                  steps,
                  values,
                  previous,
                  showPrevious,
                  compareLabel,
                  format,
                  segments,
                  i,
                }),
              )}
            />
          ))}
          {/* The weakest step's chip floats beside its rate above the block, so it takes no line of its own
            and the card keeps one height whichever reading the switch shows. */}
          {worst !== null
            ? (() => {
                const y0 = edge(height(values[worst]!))[0]!;
                const rateWidth =
                  conversionText((funnelRate(values, worst, basis).rate ?? 0) * 100).length * 7.8; // 12px semibold tabular digits
                return (
                  <span
                    className="openui-dashboard-funnel-flag-at"
                    style={{ left: worst * col + 2 + rateWidth + 6, top: y0 - 6 - 13 }}
                  >
                    <DropFlag />
                  </span>
                );
              })()
            : null}
          {hover.tip}
        </div>
      </div>
      <div className="openui-dashboard-funnel-rates">
        {steps.map((step, i) => {
          if (i === 0) return <div key={step} />;
          const { rate, change } = funnelRate(values, i, basis);
          return (
            // Under the taper, where the drop happens; the rate sits above the block.
            <div key={step} className="openui-dashboard-funnel-loss">
              {rate !== null ? (
                <>
                  {change <= 0 ? (
                    <span className="openui-dashboard-funnel-lost">
                      −{formatValue(-change, format ?? "number")}
                    </span>
                  ) : (
                    <span className="openui-dashboard-funnel-more">
                      +{formatValue(change, format ?? "number")}
                    </span>
                  )}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Funnel = defineComponent({
  name: "Funnel",
  props: funnelSchema,
  description:
    'Ordered conversion steps, scaled to the first step, with step-to-step conversion and drop-off; the weakest step is flagged. A switch reads the rates step to step or from the start; basis "start" opens on the second. segments splits each step by plan, channel or cohort: Series("Enterprise", [...]) per segment, one value per step, summing to values (up to 8); like stacked Bars, a split funnel doesn\'t draw previous. shape "bars" (default) lists the steps as rows; "funnel" draws a left-to-right funnel whose height follows each step (it falls back to bars when the card is too narrow, under about 100px per step).',
  component: function FunnelView({ props }: ComponentRenderProps<z.infer<typeof funnelSchema>>) {
    const compare = useCompare();
    // Hooks above the early return: a funnel can render empty mid-stream, then fill.
    const [measure, width] = useWidth();
    const hover = useRowHover();
    // Only the reader's choice is state: props stream in after mount, so the default is read live.
    const [basisChoice, setBasis] = useState<FunnelBasis | null>(null);
    const basis: FunnelBasis = basisChoice ?? props.basis ?? "step";
    const shadeId = `fs${useId().replace(/:/g, "")}`;
    const steps = toStrings(props.steps);
    const values = toNumbers(props.values).map((value) => value ?? 0);
    const previous = toNumbers(props.previous);
    const top = values[0] ?? 0;
    if (!steps.length || !top) return <Empty />;
    const prevTop = previous[0] ?? 0;
    const asFunnel = props.shape === "funnel" && width >= steps.length * FUNNEL_MIN_STEP;
    // Bars scale to the track less FUNNEL_RATE_ROOM, so the rate after even a full bar still fits.
    const scaled = (share: number) => `calc((100% - ${FUNNEL_RATE_ROOM}px) * ${share})`;
    // Segments split each step by plan, channel or cohort: colour and texture per segment, as in stacked bars.
    const segments: FunnelSegment[] = nodeList<{ name: string; values: (number | null)[] }>(
      props.segments,
    )
      .slice(0, 8)
      .map((segment, k) => ({
        name: segment.name,
        values: toNumbers(segment.values).map((value) => value ?? 0),
        color: seriesColor(k),
        texture: textureOf(k),
      }));
    // As with stacked Bars, a split funnel doesn't draw the previous period: its markers would cut across the segments.
    const showPrevious = compare.enabled && prevTop > 0 && !segments.length;
    // One legend row above the funnel, as on every chart: the segments, and the previous period while compare is on.
    // Nothing is held in reserve below, so the card's bottom padding matches every other card.
    const legendEntries = [
      ...segments.map((segment) => ({ name: segment.name, color: segment.color })),
      ...(showPrevious
        ? [{ name: compare.label, color: "var(--openui-dashboard-ink-secondary)", dashed: true }]
        : []),
    ];
    // The top row: the legend on the left and the basis switch on the right, in both shapes.
    const segmentLegend = (
      <>
        {/* The switch goes to the card header's top right (ViewSwitch portals it there). */}
        {steps.length > 2 ? (
          <ViewSwitch label="Rates" options={BASIS_OPTIONS} value={basis} onChange={setBasis} />
        ) : null}
        {legendEntries.length ? (
          <div className="openui-dashboard-chart-top">
            <Legend entries={legendEntries} />
          </div>
        ) : null}
      </>
    );
    // Bar length shows each step's share of the first (the tooltip states it); the printed rate is
    // step-to-step conversion, one precision down the column: 77.0% beside 60.8%.
    const conversionText = columnFormatter(
      values.slice(1).map((_, i) => (funnelRate(values, i + 1, basis).rate ?? 0) * 100),
      "percent",
    );
    const worst = basis === "step" ? biggestDrop(values) : null;
    if (props.shape === "funnel" && (asFunnel || !width)) {
      return (
        <div className="openui-dashboard-funnel" ref={measure}>
          {segmentLegend}
          {width ? (
            <FunnelShape
              steps={steps}
              values={values}
              previous={previous}
              showPrevious={showPrevious}
              compareLabel={compare.label}
              format={props.format}
              width={width}
              segments={segments}
              basis={basis}
            />
          ) : null}
        </div>
      );
    }

    return (
      <div
        className="openui-dashboard-funnel openui-dashboard-rows"
        ref={(el) => {
          measure(el);
          hover.ref.current = el;
        }}
      >
        {segmentLegend}
        {/* Long funnels scroll inside the card, with the fade and stepper used by every list. */}
        <ScrollArea maxHeight={FUNNEL_LIST_MAX} label="Scroll the steps" watch={steps.length}>
          <div className="openui-dashboard-funnel-steps">
            {steps.map((step, i) => {
              const value = values[i] ?? 0;
              const share = value / top;
              const prevShare =
                showPrevious && typeof previous[i]! === "number"
                  ? (previous[i]! as number) / prevTop
                  : null;
              const opacity = segments.length ? 1 : 1 - i * (0.5 / Math.max(steps.length - 1, 1));
              const conversion = i > 0 && values[i - 1]! ? value / values[i - 1]! : null;
              return (
                <div key={step}>
                  {conversion !== null ? (
                    <div className="openui-dashboard-funnel-link">
                      <span />
                      {/* The connector: a tint narrowing from this bar's end to the next, so the drop-off has a shape. */}
                      <div className="openui-dashboard-funnel-gap">
                        <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
                          {/* Grey on the left shading into the colour at the bars' end (the last segment's, when split). */}
                          <defs>
                            <linearGradient id={`${shadeId}-${i}`} x1="0" x2="1" y1="0" y2="0">
                              <stop
                                offset="0"
                                stopColor="var(--openui-dashboard-ink)"
                                stopOpacity="0.05"
                              />
                              <stop
                                offset="1"
                                stopColor={
                                  segments.length
                                    ? segments[segments.length - 1]!.color
                                    : "var(--openui-dashboard-series-1)"
                                }
                                stopOpacity={
                                  segments.length
                                    ? 0.16
                                    : (1 - (i - 1) * (0.5 / Math.max(steps.length - 1, 1))) * 0.18
                                }
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d={(() => {
                              const a = Math.max(((values[i - 1] ?? 0) / top) * 100, 0.6);
                              const b = Math.max(share * 100, 0.6);
                              return `M0,0 H${a} C${a},16 ${b},16 ${b},32 H0 Z`;
                            })()}
                            fill={`url(#${shadeId}-${i})`}
                          />
                        </svg>
                        {(() => {
                          // From the step before, or from the first step: the rate and the count lost (the minus says it).
                          const { change } = funnelRate(values, i, basis);
                          return (
                            <span className="openui-dashboard-funnel-rate">
                              {change <= 0 ? (
                                <span className="openui-dashboard-funnel-lost">
                                  −{formatValue(-change, props.format ?? "number")}
                                </span>
                              ) : (
                                // Re-entry or a step counted independently: more people than the step before.
                                <span className="openui-dashboard-funnel-more">
                                  +{formatValue(change, props.format ?? "number")}
                                </span>
                              )}
                              {i === worst ? <DropFlag /> : null}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  ) : null}
                  <div
                    className="openui-dashboard-funnel-step openui-dashboard-hrow"
                    // The kit tooltip, as on every chart: the count, its share of the first step, and the previous period.
                    {...hover.rowProps(step, () =>
                      funnelTip({
                        steps,
                        values,
                        previous,
                        showPrevious,
                        compareLabel: compare.label,
                        format: props.format,
                        segments,
                        i,
                      }),
                    )}
                  >
                    {/* Name and count on one line, so the row is as tall as its bar and the connectors meet it. */}
                    <div className="openui-dashboard-funnel-label">
                      <span className="openui-dashboard-funnel-name">{step}</span>
                      <span className="openui-dashboard-funnel-count">
                        {formatValue(value, props.format ?? "number")}
                      </span>
                    </div>
                    <div className="openui-dashboard-funnel-bar">
                      {segments.length ? (
                        <div
                          className="openui-dashboard-funnel-split"
                          style={{ width: scaled(Math.max(share, 0.006)) }}
                        >
                          {segments.map((segment) => (
                            <span
                              key={segment.name}
                              className={`openui-dashboard-tex-${segment.texture}`}
                              style={{
                                flexGrow: segment.values[i] ?? 0,
                                backgroundColor: segment.color,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className="openui-dashboard-funnel-fill openui-dashboard-tex-0"
                          style={{ width: scaled(Math.max(share, 0.006)), opacity }}
                        />
                      )}
                      {i > 0 ? (
                        // The step's rate just after its bar, on the track: readable whatever the bar's shade.
                        <span
                          className="openui-dashboard-funnel-in"
                          style={{ left: scaled(share) }}
                        >
                          {conversionText((funnelRate(values, i, basis).rate ?? 0) * 100)}
                        </span>
                      ) : null}
                      {prevShare !== null ? (
                        <span
                          className="openui-dashboard-funnel-prev"
                          style={{ left: scaled(prevShare) }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {hover.tip}
      </div>
    );
  },
});
const segmentedBarSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
  format: formatSchema.optional(),
});

export const SegmentedBar = defineComponent({
  name: "SegmentedBar",
  props: segmentedBarSchema,
  description:
    "Part of a whole as one bar with a legend of values and shares; up to 8 parts. Inside a headline tile, use Kpi split instead.",
  component: function SegmentedBarView({
    props,
  }: ComponentRenderProps<z.infer<typeof segmentedBarSchema>>) {
    const bandId = `seg${useId().replace(/:/g, "")}`;
    // Hovering a part (or its legend row) fades the others, as on the Donut.
    const hover = useRowHover();
    const [legendHover, setLegendHover] = useState<string | null>(null);
    const labels = toStrings(props.labels);
    const values = toNumbers(props.values).map((value) => value ?? 0);
    let parts = labels
      .map((label, i) => ({ label, value: values[i] ?? 0 }))
      .filter((part) => part.value > 0);
    const dropped = labels.filter((_, i) => !((values[i] ?? 0) > 0));
    const sharesGiven = isRateFormat(props.format);
    // Past eight, the smallest fold into Other (given order kept), the same rule as Donut and Treemap.
    const { kept, other } = foldParts(parts);
    parts = other > 0 ? [...kept, { label: "Other", value: other }] : kept;
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    if (!total) return <Empty />;
    const color = (part: { label: string }, i: number) =>
      part.label === "Other" ? MUTED_COLOR : seriesColor(i);
    const valueText = columnFormatter(
      parts.map((part) => part.value),
      props.format,
    );
    return (
      <div
        className="openui-dashboard-fade-parts openui-dashboard-segbar-card"
        data-active={(hover.active ?? legendHover) !== null ? "" : undefined}
      >
        {/* The Donut straightened: a solid bar on top, and under each part its textured tint in its own
            hue, fading downward, as the Donut's band fades inward. Other is a plain grey tint. */}
        {/* The bar's stage takes the card's spare height, the bar centred in it. */}
        <div className="openui-dashboard-segbar-stage">
          <div
            ref={hover.ref}
            className="openui-dashboard-segbar openui-dashboard-rows"
            role="img"
            aria-label={parts
              .map((part) => `${part.label} ${formatValue((part.value / total) * 100, "percent")}`)
              .join(", ")}
          >
            {parts.map((part, i) => (
              <span
                key={part.label}
                className="openui-dashboard-seg"
                style={{ width: `${(part.value / total) * 100}%` }}
                {...hover.rowProps(part.label, () => (
                  <TooltipCard
                    title={sharesGiven ? part.label : `${part.label} · ${valueText(part.value)}`}
                    rows={[
                      {
                        name: "Share",
                        color: color(part, i),
                        value: sharesGiven ? part.value : (part.value / total) * 100,
                      },
                    ]}
                    format={sharesGiven ? props.format : "percent"}
                  />
                ))}
                data-hover={(hover.active ?? legendHover) === part.label ? "" : undefined}
              >
                <span className="openui-dashboard-seg-bar" style={{ background: color(part, i) }} />
                <svg className="openui-dashboard-seg-band" aria-hidden>
                  {part.label === "Other" ? null : (
                    <defs>
                      <TextureTile
                        id={`${bandId}-${i}`}
                        index={i}
                        base={color(part, i)}
                        baseOpacity="var(--openui-dashboard-tex-tint)"
                        ink={color(part, i)}
                        opacity="var(--openui-dashboard-tex-ink)"
                      />
                    </defs>
                  )}
                  <rect
                    width="100%"
                    height="100%"
                    fill={
                      part.label === "Other"
                        ? `color-mix(in srgb, ${color(part, i)} 16%, transparent)`
                        : `url(#${bandId}-${i})`
                    }
                  />
                </svg>
              </span>
            ))}
            {hover.tip}
          </div>
        </div>
        <PartsLegend
          parts={parts.map((part, i) => ({ ...part, color: color(part, i) }))}
          format={props.format}
          sharesGiven={sharesGiven}
          active={hover.active ?? legendHover}
          onHover={setLegendHover}
        />
        {partsNote(dropped)}
      </div>
    );
  },
});
const treemapSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
  groups: z.array(z.string()).optional(),
  format: formatSchema.optional(),
});

type TreeLeaf = { name: string; value: number; color: string; group?: string; texture: number };

function TreemapCell(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  depth?: number;
  name?: string;
  value?: number;
  color?: string;
  texture?: number;
  children?: unknown;
  format?: z.infer<typeof formatSchema> | null;
  patternId?: string;
  group?: string;
  active?: string | null;
  onHover?: (key: string | null) => void;
}) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name,
    value,
    color,
    children,
    texture = 0,
    patternId = "tm",
  } = props;
  const key = `${props.group ?? ""}/${name ?? ""}`;
  const pid = `${patternId}-${Math.round(x)}-${Math.round(y)}`;
  // Only leaves draw; group nodes are the gaps between their leaves.
  if (children || !color || width <= 0 || height <= 0) return null;
  const roomy = width > 64 && height > 34;
  const label =
    name && name.length * 7 > width - 14
      ? `${name.slice(0, Math.max(1, Math.floor((width - 14) / 7) - 1))}…`
      : name;
  const valueText = height > 48 ? formatValue(value ?? null, props.format) : null;
  const tint = `color-mix(in srgb, ${color} 22%, var(--openui-dashboard-surface))`;
  return (
    // Hovering a tile fades the others to 35%, as the Donut's slices do.
    <g
      className="openui-dashboard-treemap-cell"
      opacity={props.active && props.active !== key ? 0.35 : 1}
      onMouseEnter={() => props.onHover?.(key)}
      onMouseLeave={() => props.onHover?.(null)}
    >
      {/* The group's texture in its own hue over the light tint, as on the Donut; the surface stroke on top keeps the gaps. */}
      <defs>
        <TextureTile
          id={pid}
          index={texture}
          ink={color}
          opacity="var(--openui-dashboard-tex-ink)"
        />
        {/* The texture fades out toward the top of the tile, so the label sits on the plain tint. */}
        <linearGradient id={`${pid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${pid}-mask`}>
          <rect x={x} y={y} width={width} height={height} fill={`url(#${pid}-fade)`} />
        </mask>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={tint} />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={`url(#${pid})`}
        mask={`url(#${pid}-mask)`}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill="none"
        stroke="var(--openui-dashboard-surface)"
        strokeWidth={3}
      />
      <rect
        x={x + 6}
        y={y + 6}
        width={Math.max(0, Math.min(18, width - 12))}
        height={3}
        rx={1.5}
        fill={color}
      />
      {roomy ? (
        <>
          <text
            x={x + 8}
            y={y + 24}
            fontSize={12}
            fontWeight={500}
            fill="var(--openui-dashboard-ink)"
          >
            {label}
          </text>
          {valueText ? (
            <text x={x + 8} y={y + 40} fontSize={11} fill="var(--openui-dashboard-ink-secondary)">
              {valueText}
            </text>
          ) : null}
        </>
      ) : null}
    </g>
  );
}

export const Treemap = defineComponent({
  name: "Treemap",
  props: treemapSchema,
  description:
    "Part to whole with many parts, or a hierarchy: area is size. groups (same length as labels) nests items under parents and colours by parent, e.g. category → product. Use Donut or SegmentedBar for ≤8 flat parts.",
  component: function TreemapView({ props }: ComponentRenderProps<z.infer<typeof treemapSchema>>) {
    const treemapId = `tm${useId().replace(/:/g, "")}`;
    const [activeTile, setActiveTile] = useState<string | null>(null);
    const labels = toStrings(props.labels);
    const values = toNumbers(props.values);
    const groups = props.groups ? toStrings(props.groups) : null;
    const dropped = labels.filter((_, i) => !((values[i] ?? 0) > 0));
    let leaves = labels
      .map((name, i) => ({ name, value: values[i] ?? 0, group: groups?.[i] ?? "" }))
      .filter((leaf) => leaf.value > 0);
    if (!leaves.length) return <Empty />;
    const total = leaves.reduce((sum, leaf) => sum + leaf.value, 0);
    // Eight hues at most: past eight groups, the smallest fold into a grey Other, as on the Donut.
    const allGroups = groups ? [...new Set(leaves.map((leaf) => leaf.group))] : [];
    const sizeOf = (group: string) =>
      leaves.filter((leaf) => leaf.group === group).reduce((sum, leaf) => sum + leaf.value, 0);
    const keep = keepLargest(allGroups, (group) => group, sizeOf);
    if (keep)
      leaves = leaves.map((leaf) => (keep.has(leaf.group) ? leaf : { ...leaf, group: "Other" }));
    const groupNames = groups
      ? [...new Set(leaves.map((leaf) => leaf.group))].sort(
          (a, b) => Number(a === "Other") - Number(b === "Other"),
        )
      : [];
    const colorOf = (i: number) => (groupNames[i]! === "Other" ? MUTED_COLOR : seriesColor(i));
    const data = groups
      ? groupNames.map((group, gi) => ({
          name: group,
          children: leaves
            .filter((leaf) => leaf.group === group)
            .map((leaf): TreeLeaf => ({ ...leaf, color: colorOf(gi), texture: gi })),
        }))
      : // Flat: one hue — area and label carry it; colour is reserved for groups.
        leaves.map((leaf): TreeLeaf => ({ ...leaf, color: seriesColor(0), texture: 0 }));

    return (
      <div className="openui-dashboard-chart">
        <SrTable
          caption="Parts of the whole"
          head={groups ? ["Group", "Item", "Value"] : ["Item", "Value"]}
          rows={leaves.map((leaf) =>
            groups
              ? [leaf.group, leaf.name, formatValue(leaf.value, props.format)]
              : [leaf.name, formatValue(leaf.value, props.format)],
          )}
        />
        {groups ? (
          <Legend entries={groupNames.map((group, gi) => ({ name: group, color: colorOf(gi) }))} />
        ) : null}
        {/* At least its height (280px by default), growing to fill a taller card. */}
        <div
          className="openui-dashboard-chart-plot"
          style={{ minHeight: PLOT_FLOOR, marginTop: 4 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RechartsTreemap
              data={data}
              dataKey="value"
              nameKey="name"
              isAnimationActive={false}
              content={
                <TreemapCell
                  format={props.format}
                  patternId={treemapId}
                  active={activeTile}
                  onHover={setActiveTile}
                />
              }
            >
              <Tooltip
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 5 }}
                content={({ active, payload }) => {
                  const leaf = active ? (payload?.[0]?.payload as TreeLeaf | undefined) : undefined;
                  if (!leaf || !leaf.color) return null;
                  return (
                    <TooltipCard
                      title={leaf.group ? `${leaf.group} · ${leaf.name}` : leaf.name}
                      rows={[
                        { name: "Value", color: leaf.color, value: leaf.value },
                        {
                          name: "Share",
                          color: "transparent",
                          value: (leaf.value / total) * 100,
                          format: "percent",
                          mark: <span className="openui-dashboard-tip-dot" />,
                        },
                      ]}
                      format={props.format}
                    />
                  );
                }}
              />
            </RechartsTreemap>
          </ResponsiveContainer>
        </div>
        {/* A legend row, as in the Donut and SegmentedBar legends: what area means on the left, the total at the right edge. */}
        <div className="openui-dashboard-treemap-foot">
          <span className="openui-dashboard-treemap-key">
            <span className="openui-dashboard-treemap-glyph" aria-hidden />
            Area is each part's share of the total
          </span>
          <span className="openui-dashboard-treemap-total">
            <span>Total</span>
            <strong>{formatValue(total, props.format)}</strong>
          </span>
        </div>
        {partsNote(dropped)}
      </div>
    );
  },
});
const linkSchema = z.object({ from: z.string(), to: z.string(), value: z.number() });

const flowSchema = z.object({
  links: z.array(linkSchema),
  format: formatSchema.optional(),
});

/** Nodes whose names say "this is where people left" are drawn muted. */
const LOSS = /\b(drop|dropped|exit|exited|lost|churn|churned|bounce|bounced|abandon)/i;

/** A node label: name, then count and share of everyone who entered, on one line, the two parts 6px apart. */
const FLOW_LABEL_GAP = 6;

export const Flow = defineComponent({
  name: "Flow",
  props: flowSchema,
  description:
    'Sankey of a quantity between stages: links like {from: "Paid search", to: "Signed up", value: 1210}. Name loss nodes "Dropped", "Exited" or "Churned" (drawn grey). Links only move forward: one that loops back to an earlier node isn\'t drawn. Keep to ~4 columns and ~15 nodes.',
  component: function FlowView({ props }: ComponentRenderProps<z.infer<typeof flowSchema>>) {
    const [hoveredLink, setHoveredLink] = useState<number | null>(null);
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const flowId = `fl${useId().replace(/:/g, "")}`;
    const data = useMemo(() => {
      const given = (Array.isArray(props.links) ? props.links : []).filter(Boolean);
      const unusable: string[] = [];
      const loops: string[] = [];
      // Links only move forward. A link whose target already reaches its source would close a loop,
      // which a Sankey can't draw, so it's skipped and named instead.
      const next = new Map<string, Set<string>>();
      const reaches = (from: string, to: string, seen = new Set<string>()): boolean => {
        if (from === to) return true;
        if (seen.has(from)) return false;
        seen.add(from);
        return [...(next.get(from) ?? [])].some((step) => reaches(step, to, seen));
      };
      const kept: { from: string; to: string; value: number }[] = [];
      for (const link of given) {
        const tag = `${link.from || "?"} → ${link.to || "?"}`;
        if (!link.from || !link.to || typeof link.value !== "number" || !(link.value > 0)) {
          unusable.push(tag);
          continue;
        }
        if (reaches(link.to, link.from)) {
          loops.push(tag);
          continue;
        }
        if (!next.has(link.from)) next.set(link.from, new Set());
        next.get(link.from)!.add(link.to);
        kept.push(link);
      }
      const names: string[] = [];
      const indexOf = (name: string) => {
        let index = names.indexOf(name);
        if (index === -1) index = names.push(name) - 1;
        return index;
      };
      const links = kept.map((link) => ({
        source: indexOf(link.from),
        target: indexOf(link.to),
        value: link.value,
      }));
      const inbound = names.map((_, n) =>
        links.filter((link) => link.target === n).reduce((sum, link) => sum + link.value, 0),
      );
      const outbound = names.map((_, n) =>
        links.filter((link) => link.source === n).reduce((sum, link) => sum + link.value, 0),
      );
      // Columns by longest path from an entry, so the height can follow the busiest column.
      const depth = names.map(() => 0);
      for (let pass = 0; pass < names.length; pass++)
        for (const link of links)
          depth[link.target] = Math.max(depth[link.target]!, depth[link.source]! + 1);
      const perColumn = new Map<number, number>();
      depth.forEach((d) => perColumn.set(d, (perColumn.get(d) ?? 0) + 1));
      const last = Math.max(0, ...depth);
      return {
        nodes: names.map((name) => ({ name })),
        links,
        inbound,
        outbound,
        depth,
        last,
        busiest: Math.max(1, ...perColumn.values()),
        unusable,
        loops,
      };
    }, [props.links]);

    const notes = (
      <>
        {data.unusable.length ? (
          <PartNote>
            {data.unusable.length === 1
              ? "1 link not drawn, zero or below or unnamed: "
              : `${data.unusable.length} links not drawn, zero or below or unnamed: `}
            {data.unusable.join(", ")}
          </PartNote>
        ) : null}
        {data.loops.length ? (
          <PartNote>
            {data.loops.length === 1
              ? "1 link not drawn, it loops back to an earlier step: "
              : `${data.loops.length} links not drawn, they loop back to an earlier step: `}
            {data.loops.join(", ")}
          </PartNote>
        ) : null}
      </>
    );
    if (!data.links.length)
      return data.unusable.length || data.loops.length ? (
        <div className="openui-dashboard-chart">{notes}</div>
      ) : (
        <Empty />
      );
    const format = props.format ?? "number";
    const isEntry = (index: number) => data.inbound[index]! === 0;
    const valueOf = (index: number) => Math.max(data.inbound[index]!, data.outbound[index]!);
    // Shares are of everyone who entered: the sum of the entry nodes.
    const entered =
      data.nodes.reduce((sum, _, index) => sum + (isEntry(index) ? data.outbound[index]! : 0), 0) ||
      1;
    const shareText = columnFormatter(
      data.nodes.map((_, index) => (valueOf(index) / entered) * 100),
      "percent",
    );
    const numbers = (index: number) =>
      `${formatValue(valueOf(index), format)} · ${shareText((valueOf(index) / entered) * 100)}`;
    // Entry nodes take categorical colours in first-seen order; every later step is the primary hue
    // and losses are grey, so colour says "where people came from".
    const entries = data.nodes.map((_, index) => index).filter(isEntry);
    const nodeColor = (index: number, name: string) => {
      if (LOSS.test(name)) return MUTED_COLOR;
      const entry = entries.indexOf(index);
      return entry === -1 ? seriesColor(0) : seriesColor(entry + 1);
    };
    // Each colour keeps its own texture, as series do everywhere: the primary hue dots, each source its own,
    // losses vertical lines.
    const nodeTexture = (index: number, name: string) => {
      if (LOSS.test(name)) return 5;
      const entry = entries.indexOf(index);
      return entry === -1 ? 0 : textureOf(entry + 1);
    };
    const lostFrom = (index: number) =>
      data.links
        .filter((link) => link.source === index && LOSS.test(data.nodes[link.target]!.name))
        .reduce((sum, link) => sum + link.value, 0);
    // Hovering a node lights every link into and out of it; hovering a link lights that link and its two ends.
    const linkLit = (index: number) => {
      const link = data.links[index]!;
      if (hoveredNode !== null) return link.source === hoveredNode || link.target === hoveredNode;
      return hoveredLink === null || hoveredLink === index;
    };
    const nodeLit = (index: number) => {
      if (hoveredNode !== null)
        return (
          hoveredNode === index ||
          data.links.some(
            (link) =>
              (link.source === hoveredNode && link.target === index) ||
              (link.target === hoveredNode && link.source === index),
          )
        );
      if (hoveredLink !== null)
        return (
          data.links[hoveredLink]!.source === index || data.links[hoveredLink]!.target === index
        );
      return true;
    };
    const anyHover = hoveredNode !== null || hoveredLink !== null;
    // Room for the busiest column's labels; past that, the flow fills its card.
    const height = Math.max(280, data.busiest * 56);

    return (
      <div className="openui-dashboard-chart">
        <SrTable
          caption="Flow between stages"
          head={["From", "To", "Volume"]}
          rows={data.links.map((link) => [
            data.nodes[link.source]!.name,
            data.nodes[link.target]!.name,
            formatValue(link.value, format),
          ])}
        />
        <div
          style={{ flex: "1 1 auto", minHeight: height }}
          onMouseLeave={() => [setHoveredNode(null), setHoveredLink(null)]}
        >
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={{ nodes: data.nodes, links: data.links }}
              nodePadding={24}
              nodeWidth={6}
              linkCurvature={0.5}
              iterations={64}
              margin={{ top: 12, right: 8, bottom: 12, left: 8 }}
              node={(nodeProps: {
                x: number;
                y: number;
                width: number;
                height: number;
                index: number;
                payload: { name: string };
              }) => {
                const { x, y, width, height: h, index, payload } = nodeProps;
                const color = nodeColor(index, payload.name);
                const text = numbers(index);
                const cy = y + h / 2;
                return (
                  <g
                    opacity={anyHover && !nodeLit(index) ? 0.35 : 1}
                    style={{ transition: "opacity 150ms" }}
                    onMouseEnter={() => setHoveredNode(index)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect x={x} y={y} width={width} height={Math.max(h, 2)} rx={3} fill={color} />
                    {/* The label beside its node with a halo in the surface colour, so it reads over the links. The last
                        column's labels sit inside, to the left of their nodes, so the chart runs the card's full width. */}
                    <text
                      // End steps (no outgoing links) sit in the rightmost column, whatever their depth.
                      x={data.outbound[index]! === 0 ? x - 8 : x + width + 8}
                      y={cy}
                      dy={4}
                      fontSize={12}
                      textAnchor={data.outbound[index]! === 0 ? "end" : "start"}
                      stroke="var(--openui-dashboard-surface)"
                      strokeWidth={4}
                      strokeLinejoin="round"
                      paintOrder="stroke"
                    >
                      <tspan fill="var(--openui-dashboard-ink)" fontWeight={500}>
                        {payload.name}
                      </tspan>
                      <tspan
                        dx={FLOW_LABEL_GAP}
                        fill="var(--openui-dashboard-ink-muted)"
                        fontSize={11}
                      >
                        {text}
                      </tspan>
                    </text>
                  </g>
                );
              }}
              link={(linkProps: {
                sourceX: number;
                targetX: number;
                sourceY: number;
                targetY: number;
                sourceControlX: number;
                targetControlX: number;
                linkWidth: number;
                index: number;
                payload: { source: { name: string }; target: { name: string } };
              }) => {
                const {
                  sourceX,
                  targetX,
                  sourceY,
                  targetY,
                  sourceControlX,
                  targetControlX,
                  linkWidth,
                  index,
                  payload,
                } = linkProps;
                const lossy = LOSS.test(payload.target.name);
                const sourceIndex = data.nodes.findIndex(
                  (node) => node.name === payload.source.name,
                );
                const color = lossy ? MUTED_COLOR : nodeColor(sourceIndex, payload.source.name);
                const texture = lossy ? 5 : nodeTexture(sourceIndex, payload.source.name);
                const lit = linkLit(index);
                const d = `M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
                const w = Math.max(linkWidth, 1);
                const top = Math.min(sourceY, targetY) - w;
                return (
                  <g
                    onMouseEnter={() => setHoveredLink(index)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {/* The link's own texture, visible only near its source node and gone within the first third of the link. */}
                    <defs>
                      <TextureTile
                        id={`${flowId}-t-${index}`}
                        index={texture}
                        ink={color}
                        opacity="var(--openui-dashboard-tex-ink)"
                      />
                      <linearGradient
                        id={`${flowId}-g-${index}`}
                        gradientUnits="userSpaceOnUse"
                        x1={sourceX}
                        x2={targetX}
                        y1={0}
                        y2={0}
                      >
                        <stop offset="0" stopColor="#fff" stopOpacity="1" />
                        <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
                      </linearGradient>
                      <mask
                        id={`${flowId}-m-${index}`}
                        maskUnits="userSpaceOnUse"
                        x={sourceX}
                        y={top}
                        width={targetX - sourceX}
                        height={Math.abs(targetY - sourceY) + w * 2}
                      >
                        <rect
                          x={sourceX}
                          y={top}
                          width={targetX - sourceX}
                          height={Math.abs(targetY - sourceY) + w * 2}
                          fill={`url(#${flowId}-g-${index})`}
                        />
                      </mask>
                    </defs>
                    <path
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={w}
                      // Rest 0.28; the lit links 0.5; the rest fade to a third, the 35% fade used across the kit.
                      strokeOpacity={!anyHover ? 0.28 : lit ? 0.5 : 0.1}
                      style={{ transition: "stroke-opacity 150ms" }}
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke={`url(#${flowId}-t-${index})`}
                      strokeWidth={w}
                      mask={`url(#${flowId}-m-${index})`}
                      opacity={!anyHover || lit ? 1 : 0.35}
                      style={{ transition: "opacity 150ms", pointerEvents: "none" }}
                    />
                  </g>
                );
              }}
            >
              <Tooltip
                isAnimationActive={false}
                wrapperStyle={{ zIndex: 5 }}
                content={({ active, payload }) => {
                  const item = active
                    ? (payload?.[0]?.payload as
                        | {
                            payload?: {
                              source?: { name: string };
                              target?: { name: string };
                              value?: number;
                              name?: string;
                            };
                          }
                        | undefined)
                    : undefined;
                  const inner = item?.payload;
                  if (!inner) return null;
                  const pct = (part: number, whole: number) =>
                    whole ? (part / whole) * 100 : null;
                  if (inner.source && inner.target) {
                    // A link reads as a small sum: the source's total, then what went to the target and its share of it,
                    // each row in its own step's colour.
                    const from = data.nodes.findIndex((node) => node.name === inner.source!.name);
                    const to = data.nodes.findIndex((node) => node.name === inner.target!.name);
                    const moved = inner.value ?? 0;
                    return (
                      <TooltipCard
                        title={`${inner.source.name} → ${inner.target.name}`}
                        format={format}
                        rows={[
                          {
                            name: inner.source.name,
                            color: nodeColor(from, inner.source.name),
                            value: valueOf(from),
                          },
                          {
                            name: `To ${inner.target.name}`,
                            color: nodeColor(to, inner.target.name),
                            share: pct(moved, valueOf(from)),
                            value: moved,
                          },
                        ]}
                      />
                    );
                  }
                  // A step: what came in, what moved on and what was lost (each with its share of what came in),
                  // and the step's share of everyone who entered as a footnote.
                  const index = data.nodes.findIndex((node) => node.name === inner.name);
                  if (index < 0) return null;
                  const name = inner.name ?? "";
                  const lost = lostFrom(index);
                  const base = valueOf(index);
                  const onward = data.outbound[index]! - lost;
                  return (
                    <TooltipCard
                      title={name}
                      format={format}
                      rows={[
                        {
                          name: isEntry(index) ? "Entered" : "In",
                          color: nodeColor(index, name),
                          value: base,
                        },
                        ...(onward > 0
                          ? [
                              {
                                name: "Moved on",
                                color: seriesColor(0),
                                share: pct(onward, base),
                                value: onward,
                              },
                            ]
                          : []),
                        ...(lost > 0
                          ? [
                              {
                                name: "Lost",
                                color: MUTED_COLOR,
                                share: pct(lost, base),
                                value: lost,
                              },
                            ]
                          : []),
                      ]}
                      note={`${formatValue((base / entered) * 100, "percent")} of everyone who entered`}
                    />
                  );
                }}
              />
            </Sankey>
          </ResponsiveContainer>
        </div>
        {notes}
      </div>
    );
  },
});

export {
  AXIS_TICK,
  bandFor,
  BAR_MIN,
  InkCursor,
  minPlotWidth,
  TextureTile,
} from "../charts/helpers";
