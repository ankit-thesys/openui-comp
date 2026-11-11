"use client";

import { defineComponent, type ComponentRenderProps } from "@openuidev/react-lang";
import { useId, useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod/v4";

import { formatSchema, formatValue } from "../format";
import {
  Empty,
  Legend,
  niceStep,
  nodeList,
  SrTable,
  toNumbers,
  TooltipCard,
  toStrings,
  useWidth,
} from "../shared";
import { seriesColor } from "../theme";
import { InkCursor, Series } from "./charts";

/* ---------- SmallMultiples: one small chart per series, one shared scale ---------- */

const smallMultiplesSchema = z.object({
  labels: z.array(z.string()),
  series: z.array(Series.ref),
  type: z.enum(["line", "area"]).optional(),
  format: formatSchema.optional(),
  columns: z.number().optional(),
});

export const SmallMultiples = defineComponent({
  name: "SmallMultiples",
  props: smallMultiplesSchema,
  description:
    'A grid of small charts, one per series, on one shared scale, for more than 8 series, or when lines would tangle. Same unit across panels; never use it to mix units. type "area" (default) or "line"; columns fixes the grid (default fits ~180px panels).',
  component: function SmallMultiplesView({
    props,
  }: ComponentRenderProps<z.infer<typeof smallMultiplesSchema>>) {
    const id = useId().replace(/:/g, "");
    const [gridRef, width] = useWidth();
    const labels = toStrings(props.labels);
    const series = nodeList<{ name: string; values: unknown }>(props.series);
    if (!labels.length || !series.length) return <Empty />;
    const type = props.type ?? "area";
    const values = series
      .flatMap((s) => toNumbers(s.values))
      .filter((v): v is number => v !== null);
    if (!values.length) return <Empty />;
    // One scale for every panel, so heights compare across the grid. Areas
    // start at zero; lines zoom to the data.
    const lo = type === "line" ? Math.min(...values) : Math.min(0, ...values);
    const hi = Math.max(...values);
    const step = niceStep((hi - lo || 1) / 4);
    const domain: [number, number] = [Math.floor(lo / step) * step, Math.ceil(hi / step) * step];
    const color = seriesColor(0)!;
    // Panels sit in measured rows (like the Kpis strip) so dotted rules can run
    // between rows and between the panels in a row.
    // Guard a zero, negative or fractional count: the panel loop below steps by cols.
    const cols = Math.max(1, Math.floor(props.columns ?? (width + 20) / (180 + 20)));
    const panelRows: (typeof series)[] = [];
    for (let i = 0; i < series.length; i += cols) panelRows.push(series.slice(i, i + cols));

    return (
      <div style={{ display: "grid", gap: 12 }}>
        <SrTable
          caption="Small multiples data"
          head={["Period", ...series.map((s) => s.name)]}
          rows={labels.map((label, j) => [
            label,
            ...series.map((s) => formatValue(toNumbers(s.values)[j], props.format)),
          ])}
        />
        <div className="openui-dashboard-sm" ref={gridRef}>
          {panelRows.map((row, r) => (
            <div
              key={r}
              className="openui-dashboard-sm-row"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {row.map((s, k) => {
                const i = r * cols + k;
                const points = toNumbers(s.values);
                const rows = labels.map((label, j) => ({ label, v: points[j] ?? null }));
                const last = [...points].reverse().find((v): v is number => v !== null);
                return (
                  <div key={`${s.name}-${i}`} className="openui-dashboard-sm-cell">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--openui-dashboard-ink-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={s.name}
                      >
                        {s.name}
                      </span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        {formatValue(last ?? null, props.format)}
                      </span>
                    </div>
                    <div style={{ height: 84, marginTop: 6 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={rows}
                          margin={{ top: 4, right: 2, bottom: 0, left: 2 }}
                        >
                          <defs>
                            <linearGradient id={`${id}-wash`} x1="0" x2="0" y1="0" y2="1">
                              <stop
                                offset="0%"
                                stopColor={color}
                                style={{ stopOpacity: "var(--openui-dashboard-area-wash)" }}
                              />
                              <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                            {/* The TimeSeries area texture: dots in the series hue, fading out toward the baseline. */}
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
                                fill={color}
                                style={{ opacity: "var(--openui-dashboard-area-dot)" }}
                              />
                            </pattern>
                            <linearGradient id={`${id}-dotfade`} x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                            <mask id={`${id}-dotmask`}>
                              <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill={`url(#${id}-dotfade)`}
                              />
                            </mask>
                          </defs>
                          <XAxis dataKey="label" hide />
                          <YAxis hide domain={domain} />
                          {/* The shared scale, drawn in every panel and labelled once per row. */}
                          {domain.map((edge, e) => (
                            <ReferenceLine
                              key={e}
                              y={edge}
                              stroke="var(--openui-dashboard-grid)"
                              ifOverflow="extendDomain"
                              label={
                                k === 0
                                  ? {
                                      value: formatValue(edge, props.format, { axis: true }),
                                      position: e ? "insideTopLeft" : "insideBottomLeft",
                                      fontSize: 11,
                                      fill: "var(--openui-dashboard-ink-muted)",
                                      offset: 4,
                                    }
                                  : undefined
                              }
                            />
                          ))}
                          <Tooltip
                            isAnimationActive={false}
                            wrapperStyle={{ zIndex: 5 }}
                            cursor={<InkCursor />}
                            content={({ active, payload, label }) => {
                              const value = active
                                ? (payload?.[0]?.value as number | undefined)
                                : undefined;
                              if (value === undefined) return null;
                              return (
                                <TooltipCard
                                  title={String(label)}
                                  rows={[{ name: s.name, color, value }]}
                                  format={props.format}
                                />
                              );
                            }}
                          />
                          {type === "line" ? (
                            <Line
                              dataKey="v"
                              type="monotone"
                              stroke={color}
                              strokeWidth={2}
                              dot={false}
                              connectNulls={false}
                              isAnimationActive={false}
                            />
                          ) : (
                            <>
                              {/* Dots under the wash, so the stroke stays clean on top, as in TimeSeries. */}
                              <Area
                                dataKey="v"
                                type="monotone"
                                stroke="none"
                                fill={`url(#${id}-dots)`}
                                mask={`url(#${id}-dotmask)`}
                                dot={false}
                                activeDot={false}
                                tooltipType="none"
                                connectNulls={false}
                                isAnimationActive={false}
                              />
                              <Area
                                dataKey="v"
                                type="monotone"
                                stroke={color}
                                strokeWidth={2}
                                fill={`url(#${id}-wash)`}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                              />
                            </>
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 4,
                        fontSize: 11,
                        color: "var(--openui-dashboard-ink-muted)",
                      }}
                    >
                      <span>{labels[0]}</span>
                      <span>{labels[labels.length - 1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
});

/* ---------- StatusTimeline: uptime strips ---------- */

/** The smallest StatusTimeline cell, in px: below it texture and hover stop working, so the strips scroll instead. */
const ST_CELL_MIN = 8;

const statusTimelineSchema = z.object({
  labels: z.array(z.string()),
  states: z.array(z.array(z.string())),
  periods: z.array(z.string()).optional(),
});

const STATUS = {
  up: { label: "Up", color: "var(--openui-dashboard-good-mark)" },
  degraded: { label: "Degraded", color: "var(--openui-dashboard-warning-mark)" },
  down: { label: "Down", color: "var(--openui-dashboard-bad-mark)" },
} as const;
const NO_DATA = "color-mix(in srgb, var(--openui-dashboard-ink) 8%, transparent)";

export const StatusTimeline = defineComponent({
  name: "StatusTimeline",
  props: statusTimelineSchema,
  description:
    'Uptime per service over time: one strip per row, one cell per period. states[r][p] is "up", "degraded", "down", or "" for no data. Status colours, each named in the legend. periods labels the cells (days, hours).',
  component: function StatusTimelineView({
    props,
  }: ComponentRenderProps<z.infer<typeof statusTimelineSchema>>) {
    const labels = toStrings(props.labels);
    const states = (Array.isArray(props.states) ? props.states : []).map((row) => toStrings(row));
    const periods = toStrings(props.periods);
    const [hover, setHover] = useState<{ row: number; period: number } | null>(null);
    const [gridRef, gridWidth] = useWidth();
    if (!labels.length || !states.length) return <Empty />;
    const count = Math.max(...states.map((row) => row.length));
    // Cells never shrink under ST_CELL_MIN: past that, the strips keep a minimum width and
    // scroll sideways together (label | cells | uptime, with the 14px gaps and 3px between cells).
    const need = 110 + 14 + count * (ST_CELL_MIN + 3) - 3 + 14 + 64;
    const scroll = gridWidth > 0 && need > gridWidth;
    // State reads by texture as well as colour: up is dotted, degraded slashed, down back-slashed.
    const texture = {
      up: " openui-dashboard-tex-0",
      degraded: " openui-dashboard-tex-1",
      down: " openui-dashboard-tex-2",
    } as const;

    return (
      <div className="openui-dashboard-st" ref={gridRef} data-scroll={scroll ? "" : undefined}>
        <Legend
          entries={[
            ...Object.values(STATUS).map((s) => ({ name: s.label, color: s.color })),
            { name: "No data", color: NO_DATA },
          ]}
        />
        <div className="openui-dashboard-st-strips" style={scroll ? { minWidth: need } : undefined}>
          {labels.map((label, r) => {
            const row = states[r] ?? [];
            const known = row.filter((state) => state in STATUS);
            const up = known.filter((state) => state === "up").length;
            const tipState = hover?.row === r ? row[hover.period] : undefined;
            const tipStatus =
              tipState !== undefined && tipState in STATUS
                ? STATUS[tipState as keyof typeof STATUS]
                : null;
            return (
              <div key={label} className="openui-dashboard-st-row">
                <span className="openui-dashboard-st-label" title={label}>
                  {label}
                </span>
                {/* One listener per strip, not per cell: the cell under the pointer names its period. */}
                <div
                  className="openui-dashboard-st-cells"
                  onMouseOver={(event) => {
                    const p = (event.target as HTMLElement).dataset["period"];
                    if (p !== undefined)
                      setHover((current) =>
                        current?.row === r && current.period === Number(p)
                          ? current
                          : { row: r, period: Number(p) },
                      );
                  }}
                  onMouseLeave={() => setHover(null)}
                >
                  {Array.from({ length: count }, (_, p) => {
                    const state = row[p] as keyof typeof STATUS | undefined;
                    const status = state && state in STATUS ? STATUS[state] : null;
                    const active = hover?.row === r && hover.period === p;
                    return (
                      <span
                        key={p}
                        data-period={p}
                        className={`openui-dashboard-st-cell${state && state in STATUS ? texture[state] : ""}`}
                        aria-label={`${label} · ${periods[p] ?? `#${p + 1}`}: ${status ? status.label : "No data"}`}
                        style={{
                          backgroundColor: status ? status.color : NO_DATA,
                          opacity: hover && !active ? 0.75 : 1,
                        }}
                      />
                    );
                  })}
                  {hover?.row === r ? (
                    <div
                      className="openui-dashboard-st-tip"
                      style={{ left: `${((hover.period + 0.5) / count) * 100}%` }}
                    >
                      {/* A state, not a number: the row names it and prints no value. */}
                      <TooltipCard
                        title={`${label} · ${periods[hover.period] ?? `#${hover.period + 1}`}`}
                        rows={[
                          {
                            name: tipStatus ? tipStatus.label : "No data",
                            color: tipStatus ? tipStatus.color : NO_DATA,
                            value: null,
                            text: null,
                          },
                        ]}
                      />
                    </div>
                  ) : null}
                </div>
                <span className="openui-dashboard-st-value">
                  {known.length ? `${((up / known.length) * 100).toFixed(1)}%` : "—"}
                </span>
              </div>
            );
          })}
          {/* The axis row names the uptime column, with or without period labels. */}
          <div className="openui-dashboard-st-row openui-dashboard-st-axis">
            <span />
            <span className="openui-dashboard-st-ends">
              <span>{periods[0] ?? ""}</span>
              <span>{periods.length > 1 ? periods[periods.length - 1] : ""}</span>
            </span>
            <span className="openui-dashboard-st-value">Uptime</span>
          </div>
        </div>
      </div>
    );
  },
});
