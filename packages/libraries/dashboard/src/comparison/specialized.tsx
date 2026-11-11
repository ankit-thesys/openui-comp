"use client";
import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { formatSchema, formatValue } from "../format";
import { goodWhenSchema } from "../schema";
import {
  CapMark,
  columnFormatter,
  DeltaBadge,
  deltaDecimals,
  Empty,
  Legend,
  niceScale,
  RowGuide,
  rowsNote,
  ScaleAxis,
  SrTable,
  TickMark,
  toNumbers,
  TooltipCard,
  toStrings,
  useRowHover,
} from "../shared";
import { MUTED_COLOR, seriesColor } from "../theme";
/* ---------- Distribution: box plots ---------- */

const distributionSchema = z.object({
  labels: z.array(z.string()),
  mins: z.array(z.number()),
  q1s: z.array(z.number()),
  medians: z.array(z.number()),
  q3s: z.array(z.number()),
  maxes: z.array(z.number()),
  format: formatSchema.optional(),
});

// The value column holds one number (the median); the range is drawn, and named in the tooltip.
const DIST_COLUMNS = "minmax(110px, 0.8fr) 3fr 72px";

export const Distribution = defineComponent({
  name: "Distribution",
  props: distributionSchema,
  description:
    "Spread, not just the average: one box plot per category: whiskers min to max, box the middle 50% (q1 to q3), line the median. For latency, order value, session length, deal size.",
  component: function DistributionView({
    props,
  }: ComponentRenderProps<z.infer<typeof distributionSchema>>) {
    const hover = useRowHover();
    const labels = toStrings(props.labels);
    const cols = [props.mins, props.q1s, props.medians, props.q3s, props.maxes].map(toNumbers);
    if (!labels.length) return <Empty />;
    const all = cols.flat().filter((v): v is number => v !== null);
    if (!all.length) return <Empty />;
    const { x, ticks } = niceScale(all);
    const color = seriesColor(0)!;
    // The box in two shades of the series colour: the lower half (Q1 to median) deeper, the upper lighter.
    const lower = `color-mix(in srgb, ${color} 42%, var(--openui-dashboard-surface))`;
    const upper = `color-mix(in srgb, ${color} 20%, var(--openui-dashboard-surface))`;
    const whisker = "var(--openui-dashboard-ink-muted)";
    const dropped = labels.filter((_, i) => cols.some((c) => c[i] === null));
    const medianText = columnFormatter(cols[2]!, props.format);

    return (
      <div className="openui-dashboard-rowchart">
        <SrTable
          caption="Distribution by category"
          head={["Category", "Min", "Q1", "Median", "Q3", "Max"]}
          rows={labels.map((label, i) => [
            label,
            ...cols.map((c) => formatValue(c[i], props.format)),
          ])}
        />
        <div ref={hover.ref} className="openui-dashboard-rows openui-dashboard-rowchart-rows">
          {labels.map((label, i) => {
            const [min, q1, median, q3, max] = cols.map((c) => c[i]);
            if ([min, q1, median, q3, max].some((v) => v === null)) return null;
            const [lo, a, m, b, hi] = [min, q1, median, q3, max] as [
              number,
              number,
              number,
              number,
              number,
            ];
            // The encoding is named in the tooltip, so the chart needs no key line.
            const tip = () => (
              <TooltipCard
                title={label}
                format={props.format}
                // Each row wears the mark it names: whisker caps, the two box shades, the median tick.
                rows={[
                  {
                    name: "Max",
                    color: whisker,
                    value: hi,
                    mark: <CapMark side="max" color={whisker} />,
                  },
                  { name: "Upper quartile", color: upper, value: b },
                  { name: "Median", color, value: m, mark: <TickMark color={color} /> },
                  { name: "Lower quartile", color: lower, value: a },
                  {
                    name: "Min",
                    color: whisker,
                    value: lo,
                    mark: <CapMark side="min" color={whisker} />,
                  },
                ]}
              />
            );
            return (
              <div
                key={label}
                className="openui-dashboard-hrow"
                {...hover.rowProps(label, tip)}
                style={{
                  display: "grid",
                  gridTemplateColumns: DIST_COLUMNS,
                  alignItems: "center",
                  gap: 14,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                    color: "var(--openui-dashboard-ink-secondary)",
                  }}
                >
                  {label}
                </span>
                <div style={{ position: "relative", height: 28 }}>
                  <RowGuide />
                  {/* Whiskers: solid at their caps, fading toward the box. */}
                  <span
                    style={{
                      position: "absolute",
                      top: 13,
                      height: 1.5,
                      left: x(lo),
                      width: `calc(${x(a)} - ${x(lo)})`,
                      background: `linear-gradient(to right, ${whisker}, transparent)`,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 13,
                      height: 1.5,
                      left: x(b),
                      width: `calc(${x(hi)} - ${x(b)})`,
                      background: `linear-gradient(to right, transparent, ${whisker})`,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 9,
                      height: 10,
                      left: x(lo),
                      borderLeft: `1.5px solid ${whisker}`,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 9,
                      height: 10,
                      left: x(hi),
                      borderLeft: `1.5px solid ${whisker}`,
                      transform: "translateX(-1.5px)",
                    }}
                  />
                  {/* The middle 50%, filled: the lower half deeper, the upper lighter, the median a solid line between. */}
                  <span
                    style={{
                      position: "absolute",
                      top: 5,
                      height: 18,
                      left: x(a),
                      width: `calc(${x(m)} - ${x(a)})`,
                      borderRadius: "4px 0 0 4px",
                      background: lower,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 5,
                      height: 18,
                      left: x(m),
                      width: `calc(${x(b)} - ${x(m)})`,
                      borderRadius: "0 4px 4px 0",
                      background: upper,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 5,
                      height: 18,
                      left: x(m),
                      borderLeft: `2px solid ${color}`,
                      transform: "translateX(-1px)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  <strong style={{ fontWeight: 600 }}>{medianText(m)}</strong>
                </span>
              </div>
            );
          })}
          {hover.tip}
        </div>
        <ScaleAxis ticks={ticks} x={x} format={props.format} columns={DIST_COLUMNS} />
        {rowsNote(dropped)}
      </div>
    );
  },
});

/* ---------- Dumbbell: before → after per category ---------- */

const dumbbellSchema = z.object({
  labels: z.array(z.string()),
  before: z.array(z.number()),
  after: z.array(z.number()),
  format: formatSchema.optional(),
  beforeLabel: z.string().optional(),
  afterLabel: z.string().optional(),
  goodWhen: goodWhenSchema.optional(),
});

const DUMB_COLUMNS = "minmax(110px, 0.8fr) 3fr 130px";

export const Dumbbell = defineComponent({
  name: "Dumbbell",
  props: dumbbellSchema,
  description:
    "Two values per category joined by a line (before and after, this year and last, two segments) so you see who moved and how far. Reads better than paired bars past a handful of categories.",
  component: function DumbbellView({
    props,
  }: ComponentRenderProps<z.infer<typeof dumbbellSchema>>) {
    const hover = useRowHover();
    const labels = toStrings(props.labels);
    const before = toNumbers(props.before);
    const after = toNumbers(props.after);
    if (!labels.length) return <Empty />;
    const all = [...before, ...after].filter((v): v is number => v !== null);
    if (!all.length) return <Empty />;
    const { x, ticks } = niceScale(all);
    // Colour is the signal here, not the series: the after dot is ink, and the connector says whether
    // the move was good (green) or bad (red) by goodWhen; grey when unchanged.
    const color = "var(--openui-dashboard-ink)";
    const goodWhen = props.goodWhen ?? "up";
    // goodWhen "neutral" compares two groups, neither direction good news: the connector takes the series colour.
    const SIGNAL = {
      better: "var(--openui-dashboard-good-mark)",
      worse: "var(--openui-dashboard-bad-mark)",
      unchanged: MUTED_COLOR,
      compared: seriesColor(0),
    } as const;
    const moveOf = (from: number, to: number): keyof typeof SIGNAL =>
      goodWhen === "neutral"
        ? "compared"
        : to === from
          ? "unchanged"
          : to > from === (goodWhen === "up")
            ? "better"
            : "worse";
    const moves = new Set(
      labels.map((_, i) =>
        before[i] !== null && after[i] !== null
          ? moveOf(before[i] as number, after[i] as number)
          : null,
      ),
    );
    const beforeLabel = props.beforeLabel ?? "Before";
    const afterLabel = props.afterLabel ?? "After";
    const dropped = labels.filter((_, i) => before[i] === null || after[i] === null);
    // One number of decimals down each column: 35.0% beside 27.4%, +3.8 pts beside +6.3 pts.
    const valueText = columnFormatter(after, props.format);
    const changeDecimals = deltaDecimals(
      labels.map((_, i) => ({ current: after[i], previous: before[i] })),
      props.format,
    );

    return (
      <div className="openui-dashboard-rowchart">
        <SrTable
          caption="Before and after by category"
          head={["Category", beforeLabel, afterLabel]}
          rows={labels.map((label, i) => [
            label,
            formatValue(before[i], props.format),
            formatValue(after[i], props.format),
          ])}
        />
        {/* The chart's own marks: a ring for before, a dot for after, then the connector's colours,
            named as Intervals names them; only those drawn. */}
        <Legend
          entries={[
            {
              name: beforeLabel,
              color,
              mark: (
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    boxShadow: `inset 0 0 0 1.5px ${color}`,
                  }}
                />
              ),
            },
            {
              name: afterLabel,
              color,
              mark: (
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
              ),
            },
            ...(["better", "worse"] as const)
              .filter((move) => moves.has(move))
              .map((move) => ({
                name: move === "better" ? "Better" : "Worse",
                color: SIGNAL[move],
                mark: (
                  <span
                    style={{ width: 14, height: 6, borderRadius: 3, background: SIGNAL[move] }}
                  />
                ),
              })),
          ]}
        />
        <div ref={hover.ref} className="openui-dashboard-rows openui-dashboard-rowchart-rows">
          {labels.map((label, i) => {
            const a = before[i] as number | null;
            const b = after[i] as number | null;
            if (a === null || b === null) return null;
            const lo = Math.min(a, b);
            const hi = Math.max(a, b);
            // The row prints the after value and the change; the tooltip adds the before value.
            const tip = () => (
              <TooltipCard
                title={label}
                format={props.format}
                goodWhen={props.goodWhen}
                // The same marks as the chart: a filled dot for after, a ring for before.
                rows={[
                  {
                    name: afterLabel,
                    color,
                    value: b,
                    previous: a,
                    mark: (
                      <span className="openui-dashboard-tip-dot" style={{ background: color }} />
                    ),
                  },
                  {
                    name: beforeLabel,
                    color,
                    value: a,
                    mark: (
                      <span
                        className="openui-dashboard-tip-dot"
                        style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }}
                      />
                    ),
                  },
                ]}
              />
            );
            return (
              <div
                key={label}
                className="openui-dashboard-hrow"
                {...hover.rowProps(label, tip)}
                style={{
                  display: "grid",
                  gridTemplateColumns: DUMB_COLUMNS,
                  alignItems: "center",
                  gap: 14,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                    color: "var(--openui-dashboard-ink-secondary)",
                  }}
                >
                  {label}
                </span>
                <div style={{ position: "relative", height: 24 }}>
                  <RowGuide />
                  {/* The connector, as thick as the dots, carries the signal: green or red by goodWhen, strongest at the after end so the direction reads too. */}
                  <span
                    style={{
                      position: "absolute",
                      top: 7,
                      height: 10,
                      borderRadius: 5,
                      left: x(lo),
                      width: `calc(${x(hi)} - ${x(lo)})`,
                      background: `linear-gradient(to ${b >= a ? "right" : "left"}, color-mix(in srgb, ${SIGNAL[moveOf(a, b)]} 25%, transparent), color-mix(in srgb, ${SIGNAL[moveOf(a, b)]} 70%, transparent))`,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 7,
                      left: x(a),
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "var(--openui-dashboard-surface)",
                      boxShadow: `inset 0 0 0 1.5px ${color}`,
                      transform: "translateX(-5px)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 7,
                      left: x(b),
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: color,
                      boxShadow: "0 0 0 2px var(--openui-dashboard-surface)",
                      transform: "translateX(-5px)",
                    }}
                  />
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    justifyContent: "flex-end",
                    gap: 8,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  <DeltaBadge
                    current={b}
                    previous={a}
                    format={props.format}
                    goodWhen={props.goodWhen}
                    inline
                    decimals={changeDecimals}
                  />
                  <strong style={{ fontWeight: 600 }}>{valueText(b)}</strong>
                </span>
              </div>
            );
          })}
          {hover.tip}
        </div>
        <ScaleAxis ticks={ticks} x={x} format={props.format} columns={DUMB_COLUMNS} />
        {rowsNote(dropped)}
      </div>
    );
  },
});
