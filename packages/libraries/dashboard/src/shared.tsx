"use client";

import { CardSlotContext } from "./shared/cardSlot";
import { useActiveFilters } from "./shared/filterRegistry";
import { useIsomorphicLayoutEffect } from "./shared/hooks";
import { type PlacedLabel } from "./shared/labels";
import { columnFormatter, deltaDecimals } from "./shared/scales";
import {
  RefreshingContext,
  STATE_COPY,
  useViewState,
  type MessageState,
  type ViewState,
} from "./shared/viewState";

import {
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import { useIsQueryLoading, useIsStreaming, useRendererQuery } from "@openuidev/react-lang";
import { createPortal } from "react-dom";
import { Symbols } from "recharts";
import { computeDelta, deltaTone, formatValue, padDecimals, type ValueFormat } from "./format";

import { MUTED_COLOR } from "./theme";

/* ---------- DOM-drawn scales ---------- */

/** The tick row under a DOM-drawn scale, aligned with the track column. */
export function ScaleAxis({
  ticks,
  x,
  format,
  columns,
}: {
  ticks: number[];
  x: (v: number) => string;
  format?: ValueFormat | null;
  columns: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns, gap: 14 }}>
      <span />
      <div
        style={{
          position: "relative",
          height: 16,
          fontSize: 11,
          color: "var(--openui-dashboard-ink-muted)",
        }}
      >
        {ticks.map((tick) => (
          <span
            key={tick}
            style={{
              position: "absolute",
              left: x(tick),
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            {formatValue(tick, format, { axis: true })}
          </span>
        ))}
      </div>
      <span />
    </div>
  );
}

/* ---------- Delta badge ---------- */

export type GoodWhen = "up" | "down" | "neutral";

export function DeltaBadge({
  current,
  previous,
  format,
  goodWhen,
  inline = false,
  decimals = 0,
}: {
  current: number | null | undefined;
  previous: number | null | undefined;
  format?: ValueFormat | null;
  // null means "not given" too: programs skip optional arguments with null.
  goodWhen?: GoodWhen | null;
  inline?: boolean;
  /** Pad the change to this many decimals, so a column of changes lines up (see deltaDecimals). */
  decimals?: number;
}) {
  if (typeof current !== "number" || typeof previous !== "number") return null;
  const delta = computeDelta(current, previous, format);
  if (!delta) return null;
  delta.text = padDecimals(delta.text, decimals);
  const tone = deltaTone(delta.direction, goodWhen ?? "up");
  return (
    <span
      className={`openui-dashboard-delta openui-dashboard-delta-${tone}${inline ? " openui-dashboard-delta-inline" : ""}`}
    >
      {/* No arrows: the sign carries direction, the colour carries tone. */}
      {delta.text}
    </span>
  );
}

/* ---------- Legend ---------- */

export type MarkShape = "circle" | "square" | "triangle" | "diamond" | "cross" | "star" | "wye";
export type LegendEntry = {
  name: string;
  color: string;
  dashed?: boolean;
  dotted?: boolean;
  line?: boolean;
  hidden?: boolean;
  shape?: MarkShape;
  /** The chart's own mark, drawn in place of the swatch (a dumbbell's ring, a connector's pill). */
  mark?: ReactNode;
};

function LegendMark({ entry }: { entry: LegendEntry }) {
  if (entry.mark !== undefined) return <>{entry.mark}</>;
  if (entry.shape)
    return (
      <svg
        className="openui-dashboard-legend-shape"
        width={10}
        height={10}
        viewBox="0 0 10 10"
        aria-hidden
      >
        <Symbols
          cx={5}
          cy={5}
          type={entry.shape}
          size={entry.shape === "circle" ? 50 : 42}
          fill={entry.color}
        />
      </svg>
    );
  return entry.dashed || entry.dotted || entry.line ? (
    <span
      className={
        entry.dotted
          ? "openui-dashboard-legend-line openui-dashboard-legend-dotted"
          : entry.line
            ? "openui-dashboard-legend-line openui-dashboard-legend-solid"
            : "openui-dashboard-legend-line"
      }
      style={{ borderTopColor: entry.color }}
    />
  ) : (
    <span className="openui-dashboard-legend-swatch" style={{ background: entry.color }} />
  );
}

const LEGEND_GAP = 16;
const MORE_WIDTH = 70;

/**
 * One line, never wrapping: every key is laid out and measured (the ones that
 * don't fit stay in the DOM, invisible and out of flow, so their widths are
 * always known), and whatever doesn't fit folds into a "More" menu. Hidden
 * entries (the previous period while compare is off) are left out entirely.
 */
export function Legend({
  entries,
  onHover,
}: {
  entries: LegendEntry[];
  onHover?: (name: string | null) => void;
}) {
  const shown = entries.filter((entry) => !entry.hidden);
  const row = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(shown.length);
  const [open, setOpen] = useState(false);
  const signature = shown.map((entry) => entry.name).join("|");

  useIsomorphicLayoutEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => {
      const widths = [
        ...el.querySelectorAll<HTMLElement>(":scope > .openui-dashboard-legend-item"),
      ].map((item) => item.offsetWidth);
      const all = widths.reduce((sum, w, i) => sum + w + (i ? LEGEND_GAP : 0), 0);
      let next = widths.length;
      if (all > el.clientWidth) {
        let used = 0;
        next = 0;
        for (let i = 0; i < widths.length; i++) {
          const width = used + (widths[i] ?? 0) + (i ? LEGEND_GAP : 0);
          if (width + LEGEND_GAP + MORE_WIDTH > el.clientWidth) break;
          used = width;
          next = i + 1;
        }
        next = Math.max(1, next);
      }
      setFit((current) => (current === next ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [signature]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (row.current && !row.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  if (!shown.length) return null;
  const rest = shown.slice(fit);
  return (
    <div className="openui-dashboard-legend" role="list" ref={row}>
      {shown.map((entry, i) => (
        <span
          key={`${entry.name}-${entry.dashed ? "prev" : entry.dotted ? "ref" : "cur"}`}
          className={
            i < fit
              ? "openui-dashboard-legend-item"
              : "openui-dashboard-legend-item openui-dashboard-legend-overflow"
          }
          role="listitem"
          aria-hidden={i < fit ? undefined : true}
          onMouseEnter={onHover ? () => onHover(entry.name) : undefined}
          onMouseLeave={onHover ? () => onHover(null) : undefined}
        >
          <LegendMark entry={entry} />
          {entry.name}
        </span>
      ))}
      {rest.length ? (
        <span className="openui-dashboard-legend-more-anchor">
          <button
            type="button"
            className="openui-dashboard-legend-more"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            More
            <span className="openui-dashboard-filter-caret" aria-hidden />
          </button>
          {open ? (
            <span className="openui-dashboard-legend-menu" role="list">
              {rest.map((entry) => (
                <span key={entry.name} className="openui-dashboard-legend-item" role="listitem">
                  <LegendMark entry={entry} />
                  {entry.name}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

/**
 * The colour key for a ramp: its low end, the ramp's five steps, its high end. Sits above a grid, as
 * legends do (openui-dashboard-ramp-key), or under a map (openui-dashboard-geo-legend).
 */
export function RampKey({
  low,
  high,
  ramp,
  className = "openui-dashboard-ramp-key",
}: {
  low: string;
  high: string;
  ramp: "seq" | "div";
  className?: string;
}) {
  return (
    <div className={`openui-dashboard-legend ${className}`}>
      <span>{low}</span>
      <span style={{ display: "inline-flex", gap: 2 }}>
        {[0, 2, 4, 6, 8].map((step) => (
          <span
            key={step}
            style={{
              width: 18,
              height: 8,
              borderRadius: 2,
              background: `var(--openui-dashboard-${ramp}-${step + 1})`,
            }}
          />
        ))}
      </span>
      <span>{high}</span>
    </div>
  );
}

/* ---------- Tooltip ---------- */

export type TooltipRow = {
  name: string;
  color: string;
  value: number | null | undefined;
  previous?: number | null;
  /** A muted share (0–100) ahead of the value, e.g. what part of a step moved on. */
  share?: number | null;
  /** Printed in place of the formatted value (a signed change, a range); null prints no value (a row that names a state). */
  text?: string | null;
  dashed?: boolean;
  /** The mark this row describes, drawn in place of the swatch (a whisker cap, a box shade); null for no mark. */
  mark?: ReactNode;
  /** This row's own format, when it counts something other than the card's measure (a cohort's size). */
  format?: ValueFormat | null;
};

export function TooltipCard({
  title,
  rows,
  format,
  goodWhen,
  previousLabel,
  note,
}: {
  title: string;
  rows: TooltipRow[];
  format?: ValueFormat | null;
  goodWhen?: GoodWhen;
  previousLabel?: string;
  /** A footnote under the rows (a verdict, a share of everyone). */
  note?: string;
}) {
  return (
    <div className="openui-dashboard-tooltip">
      <div className="openui-dashboard-tooltip-title">{title}</div>
      {rows.map((row, i) => (
        <div key={i} className="openui-dashboard-tooltip-row">
          <span>
            {row.mark !== undefined ? (
              row.mark
            ) : row.dashed ? (
              <span
                className="openui-dashboard-legend-line"
                style={{ borderTopColor: row.color }}
              />
            ) : (
              <span className="openui-dashboard-legend-swatch" style={{ background: row.color }} />
            )}
            {row.name}
          </span>
          {/* The change first, the value last, so values line up at the right edge. */}
          {row.text === null ? null : (
            <span className="openui-dashboard-tooltip-value">
              {typeof row.previous === "number" && typeof row.value === "number" ? (
                <DeltaBadge
                  current={row.value}
                  previous={row.previous}
                  format={format}
                  goodWhen={goodWhen}
                  inline
                />
              ) : null}
              {typeof row.share === "number" ? (
                <span className="openui-dashboard-tooltip-share">
                  {formatValue(row.share, "percent")}
                </span>
              ) : null}
              <span>
                {row.text ?? formatValue(row.value, row.format === undefined ? format : row.format)}
              </span>
            </span>
          )}
        </div>
      ))}
      {note ? <div className="openui-dashboard-tooltip-sub">{note}</div> : null}
      {previousLabel ? (
        <div className="openui-dashboard-tooltip-sub">vs {previousLabel.toLowerCase()}</div>
      ) : null}
    </div>
  );
}

/* ---------- Row charts: hover band, pointer tooltip, grid ---------- */

/**
 * Hover for charts drawn as rows of HTML (Dumbbell, Distribution, Intervals,
 * Leaderboard), matching the Recharts charts: the hovered row takes a soft
 * band and the kit tooltip follows the pointer, flipping left near the right
 * edge. Put `ref` on a `.openui-dashboard-rows` wrapper, spread `rowProps` on each row and
 * render `tip` inside the wrapper.
 */
export function useRowHover() {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    key: string;
    x: number;
    y: number;
    flip: boolean;
    content: ReactNode;
  } | null>(null);
  // The pointer is read on every move but applied once per frame: a burst of moves is one render.
  const frame = useRef(0);
  const pending = useRef<{
    key: string;
    clientX: number;
    clientY: number;
    content: () => ReactNode;
  } | null>(null);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const rowProps = (key: string, content: () => ReactNode) => ({
    "data-hover": hover?.key === key ? "" : undefined,
    onMouseMove: (event: ReactMouseEvent) => {
      pending.current = { key, clientX: event.clientX, clientY: event.clientY, content };
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const next = pending.current;
        const box = ref.current?.getBoundingClientRect();
        if (!next || !box) return;
        const x = next.clientX - box.left;
        setHover({
          key: next.key,
          x,
          y: next.clientY - box.top,
          flip: x > box.width - 220,
          content: next.content(),
        });
      });
    },
    onMouseLeave: () => {
      // A move still waiting for its frame mustn't bring the tip back after the pointer left.
      if (pending.current?.key === key) pending.current = null;
      setHover((current) => (current?.key === key ? null : current));
    },
  });
  const tip = hover ? (
    <div
      className="openui-dashboard-rowtip"
      data-flip={hover.flip ? "" : undefined}
      style={{ left: hover.x, top: hover.y }}
      aria-hidden
    >
      {hover.content}
    </div>
  ) : null;
  return { ref, rowProps, tip, active: hover?.key ?? null };
}

/** Vertical grid lines at the axis ticks, drawn inside each row's track so they read as one grid down the rows. */
export function RowGrid({ ticks, x }: { ticks: number[]; x: (value: number) => string }) {
  return (
    <>
      {ticks.map((tick) => (
        <span
          key={tick}
          className="openui-dashboard-row-grid"
          style={{ left: x(tick) }}
          aria-hidden
        />
      ))}
    </>
  );
}

/** A faint horizontal guide across a row's track, so the eye follows the row from label to value. */
export function RowGuide() {
  return <span className="openui-dashboard-row-guide" aria-hidden />;
}

/**
 * Small marks for tooltips, each the shape of what it names: a whisker's end
 * cap (min on the left, max on the right), an interval with its caps, a
 * median tick.
 */
export function CapMark({ side, color }: { side: "min" | "max"; color: string }) {
  return (
    <svg className="openui-dashboard-tip-mark" viewBox="0 0 12 10" aria-hidden>
      <path
        d={side === "min" ? "M2 5H11M2 1.5V8.5" : "M1 5H10M10 1.5V8.5"}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
export function IntervalMark({ color }: { color: string }) {
  return (
    <svg className="openui-dashboard-tip-mark" viewBox="0 0 12 10" aria-hidden>
      <path
        d="M1.5 5H10.5M1.5 2V8M10.5 2V8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
export function TickMark({ color }: { color: string }) {
  return (
    <svg className="openui-dashboard-tip-mark" viewBox="0 0 12 10" aria-hidden>
      <path d="M6 1V9" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Rows a chart had to leave out (a missing value), named, like seriesNote for series. */
export function rowsNote(names: string[]) {
  if (!names.length) return null;
  return (
    <PartNote>
      {names.length === 1
        ? `1 row couldn’t be drawn: ${names[0]}`
        : `${names.length} rows couldn’t be drawn: ${names.join(", ")}`}
    </PartNote>
  );
}

/** For part-to-whole charts: parts at zero or below have no share to draw, so they are named rather than dropped silently. */
export function partsNote(names: string[]) {
  if (!names.length) return null;
  return (
    <PartNote>
      {names.length === 1
        ? `1 part not drawn, zero or below: ${names[0]}`
        : `${names.length} parts not drawn, zero or below: ${names.join(", ")}`}
    </PartNote>
  );
}

/**
 * The legend under part-to-whole charts (Donut, SegmentedBar): columns of at
 * least 240px split by dotted rules, each row a swatch and label, then the
 * muted share and the value at the right edge, one precision per column.
 * Hovering a row reports its label so the chart can fade the other parts.
 */
export function PartsLegend({
  parts,
  format,
  sharesGiven,
  active,
  onHover,
}: {
  parts: { label: string; value: number; color: string }[];
  format?: ValueFormat | null;
  /** Values that are already shares (percent) skip the computed share, which would repeat them. */
  sharesGiven?: boolean;
  active?: string | null;
  onHover?: (label: string | null) => void;
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  const shareText = columnFormatter(
    parts.map((part) => (part.value / total) * 100),
    "percent",
  );
  const valueText = columnFormatter(
    parts.map((part) => part.value),
    format,
  );
  return (
    <div className="openui-dashboard-parts-legend">
      {parts.map((part) => (
        <div
          key={part.label}
          data-hover={active === part.label ? "" : undefined}
          onMouseEnter={() => onHover?.(part.label)}
          onMouseLeave={() => onHover?.(null)}
        >
          <span className="openui-dashboard-parts-label">
            <span className="openui-dashboard-legend-swatch" style={{ background: part.color }} />
            <span className="openui-dashboard-parts-name">{part.label}</span>
          </span>
          <span className="openui-dashboard-parts-nums">
            {sharesGiven ? null : (
              <span className="openui-dashboard-parts-share">
                {shareText((part.value / total) * 100)}
              </span>
            )}
            <span className="openui-dashboard-parts-value">{valueText(part.value)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Single-choice pills behave as a radio group: one Tab stop (the chosen
 * option), arrow keys and Home/End move the choice and focus with it.
 */
export function radioKeys<T extends string>(
  event: ReactKeyboardEvent,
  list: { value: T }[],
  current: T | undefined,
  choose: (value: T) => void,
) {
  const step = (
    { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>
  )[event.key];
  if (!step && event.key !== "Home" && event.key !== "End") return;
  event.preventDefault();
  if (!list.length) return;
  const index = Math.max(
    0,
    list.findIndex((option) => option.value === current),
  );
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? list.length - 1
        : (index + (step ?? 0) + list.length) % list.length;
  choose(list[next]!.value);
  event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
}

/**
 * A small segmented switch inside a chart, for two ways of reading the same numbers
 * (a funnel's step-to-step rates or its rates from the start; a cohort's percent or its people).
 * The kit's segmented control at the small size; arrow keys move the choice.
 */
export function ViewSwitch<T extends string>({
  label,
  prefix,
  options,
  value,
  onChange,
}: {
  label: string;
  /** A short muted word before the switch, e.g. "Show" or "Rates", as filters prefix their label. */
  prefix?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const slot = useContext(CardSlotContext);
  const segmented = (
    <div
      className="openui-dashboard-segmented openui-dashboard-segmented-sm"
      role="radiogroup"
      aria-label={label}
      onKeyDown={(event) => radioKeys(event, options, value, onChange)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
  const control = prefix ? (
    <div className="openui-dashboard-view-switch">
      <span className="openui-dashboard-view-label" aria-hidden>
        {prefix}
      </span>
      {segmented}
    </div>
  ) : (
    segmented
  );
  // In a Card, the switch goes to the header's top right, with any filters the card has;
  // anywhere else it takes the chart's own top row.
  return slot ? (
    createPortal(control, slot)
  ) : (
    <div className="openui-dashboard-chart-top">{control}</div>
  );
}

/* ---------- Sparkline ---------- */

export function Sparkline({
  values,
  previous,
  color = "var(--openui-dashboard-series-1)",
  showPrevious = false,
}: {
  values: (number | null)[];
  previous?: (number | null)[];
  color?: string;
  showPrevious?: boolean;
}) {
  const id = `openui-dashboard-spark-${useId().replace(/:/g, "")}`;
  const points = values.filter((value): value is number => value !== null);
  if (points.length < 2) return null;
  const all =
    showPrevious && previous
      ? [...points, ...previous.filter((v): v is number => v !== null)]
      : points;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const width = 120;
  const height = 44;
  const pad = 3;
  const path = (series: (number | null)[]) => {
    const step = (width - pad * 2) / Math.max(1, series.length - 1);
    return series
      .map((value, i) => {
        if (value === null) return null;
        const x = pad + i * step;
        const y =
          max === min ? height / 2 : pad + (1 - (value - min) / (max - min)) * (height - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .filter(Boolean)
      .join(" ");
  };
  const line = path(values);
  const last = line.split(" ").at(-1)?.split(",") ?? ["0", "0"];
  return (
    <svg className="openui-dashboard-kpi-spark" viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor={color}
            style={{ stopOpacity: "calc(var(--openui-dashboard-area-wash) * 2)" }}
          />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
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
        <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect x="0" y="0" width={width} height={height} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      {showPrevious && previous ? (
        <polyline
          points={path(previous)}
          fill="none"
          stroke={MUTED_COLOR}
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      ) : null}
      <polygon
        points={`${pad},${height} ${line} ${last[0]},${height}`}
        fill={`url(#${id}-dots)`}
        mask={`url(#${id}-mask)`}
      />
      <polygon points={`${pad},${height} ${line} ${last[0]},${height}`} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r="2.75"
        fill={color}
        stroke="var(--openui-dashboard-surface)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ---------- Sort toggle ---------- */

/** The ranked-list sort control: one arrow that flips highest-first / lowest-first. */
export function SortToggle({ desc, onToggle }: { desc: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="openui-dashboard-sort-toggle"
      data-asc={desc ? undefined : ""}
      aria-label={
        desc ? "Highest first. Switch to lowest first" : "Lowest first. Switch to highest first"
      }
      onClick={onToggle}
    >
      {/* A simple arrow: down for highest first, flipped up for lowest first. */}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5v14M7 14l5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* ---------- Scroll area ---------- */

/**
 * The one overflow treatment: content scrolls inside a max height, a fade
 * shows while more sits below, and a compact up/down stepper appears only
 * when the content overflows — each half disabled at its end.
 */
export function ScrollArea({
  maxHeight,
  children,
  label = "Scroll",
  watch,
  style,
  fill,
}: {
  maxHeight: number;
  /**
   * Fill mode: the list takes whatever height its card gives it (a row of taller cards) and scrolls past that.
   * It never sits shorter than it needs, up to maxHeight: pass the list's own height as `fill` so a short list
   * isn't padded out.
   */
  fill?: number;
  children: ReactNode;
  label?: string;
  /** Re-measure when this changes (sort order, filtered rows). */
  watch?: unknown;
  style?: CSSProperties;
}) {
  const body = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ overflow: false, up: false, down: false });
  const sync = () => {
    const el = body.current;
    if (!el) return;
    const next = {
      overflow: el.scrollHeight - el.clientHeight > 8,
      up: el.scrollTop > 8,
      down: el.scrollHeight - el.scrollTop - el.clientHeight > 8,
    };
    setState((s) =>
      s.overflow === next.overflow && s.up === next.up && s.down === next.down ? s : next,
    );
  };
  useEffect(() => {
    sync();
    const el = body.current;
    if (!el) return;
    const resize = new ResizeObserver(sync);
    resize.observe(el);
    for (const child of el.children) resize.observe(child);
    return () => resize.disconnect();
  }, [watch]);
  const step = (dir: 1 | -1) => {
    const el = body.current;
    el?.scrollBy({ top: dir * Math.max(60, el.clientHeight * 0.6), behavior: "smooth" });
  };
  return (
    <div
      className={
        fill === undefined
          ? "openui-dashboard-scroll"
          : "openui-dashboard-scroll openui-dashboard-scroll-fill"
      }
      style={fill === undefined ? style : { ...style, minHeight: Math.min(fill, maxHeight) }}
    >
      <div
        className="openui-dashboard-scroll-body"
        ref={body}
        onScroll={sync}
        style={fill === undefined ? { maxHeight } : undefined}
        data-overflow={state.overflow ? "" : undefined}
      >
        {children}
      </div>
      {state.down ? <div className="openui-dashboard-scroll-fade" aria-hidden /> : null}
      {state.overflow ? (
        <div className="openui-dashboard-scroll-step" role="group" aria-label={label}>
          <button
            type="button"
            aria-label="Scroll up"
            disabled={!state.up}
            onClick={() => step(-1)}
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="m3 7.5 3-3 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Scroll down"
            disabled={!state.down}
            onClick={() => step(1)}
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="m3 4.5 3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Ranked list ---------- */

export type RankedItem = {
  /** The row's key, and the key its hover reports (the item's label). */
  key: string;
  /** What the row prints as its name: a display name, with any marker after it. */
  name: ReactNode;
  value: number;
  previous: number | null;
  /** The bar's colour when rows differ (a place's group); the series hue otherwise. */
  color?: string;
  /** Lit from elsewhere: the same item hovered on a linked map. */
  linked?: boolean;
  tip: () => ReactNode;
};

/**
 * The one ranked list (Leaderboard, and the lists beside GeoMap and PointMap): a header with the sort
 * toggle (and a title, beside a map), then each row's name, change and value over a textured bar, one
 * precision per column, scrolling inside the card once it outgrows it. Items come highest first; desc
 * false reads the same items lowest first. Pass the list's useRowHover, so a map can light its rows.
 */
export function RankedList({
  hover,
  items,
  max,
  format,
  goodWhen,
  desc,
  onSort,
  side,
  title,
  watch,
  children,
}: {
  hover: ReturnType<typeof useRowHover>;
  items: RankedItem[];
  /** The value a full-length bar stands for. */
  max: number;
  format?: ValueFormat | null;
  goodWhen?: GoodWhen | null;
  desc: boolean;
  onSort: () => void;
  /** Beside a map (openui-dashboard-geo-side) rather than filling its card (openui-dashboard-rank-panel). */
  side?: boolean;
  title?: string;
  /** Re-measure the scroll area when this changes too (the map's view). */
  watch?: unknown;
  /** Under the list, e.g. a note naming rows that couldn't be ranked. */
  children?: ReactNode;
}) {
  const valueText = columnFormatter(
    items.map((item) => item.value),
    format,
  );
  const changeDecimals = deltaDecimals(
    items.map((item) => ({ current: item.value, previous: item.previous })),
    format,
  );
  const ranked = desc ? items : [...items].reverse();
  return (
    <div
      ref={hover.ref}
      className={
        side
          ? "openui-dashboard-geo-side openui-dashboard-rows"
          : "openui-dashboard-rank-panel openui-dashboard-rows"
      }
    >
      <div className={side ? "openui-dashboard-geo-side-head" : "openui-dashboard-rank-head"}>
        {title ? (
          <span className="openui-dashboard-card-subtitle" style={{ margin: 0 }}>
            {title}
          </span>
        ) : null}
        <SortToggle desc={desc} onToggle={onSort} />
      </div>
      {/* Fills a taller card before it scrolls; never shorter than its rows (about 44px each), up to 340px. */}
      <ScrollArea
        maxHeight={340}
        fill={ranked.length * 44}
        label="Scroll the list"
        watch={`${ranked.length}-${desc}${watch === undefined ? "" : `-${watch}`}`}
      >
        <ol className="openui-dashboard-rank">
          {ranked.map((item) => (
            // Every value is printed; the tooltip adds the previous one behind the change.
            <li
              key={item.key}
              className="openui-dashboard-rank-row"
              {...hover.rowProps(item.key, item.tip)}
              data-linked={item.linked ? "" : undefined}
            >
              <div className="openui-dashboard-rank-top">
                <span className="openui-dashboard-rank-name">{item.name}</span>
                <span className="openui-dashboard-rank-value">
                  <DeltaBadge
                    current={item.value}
                    previous={item.previous}
                    format={format}
                    goodWhen={goodWhen}
                    inline
                    decimals={changeDecimals}
                  />
                  {valueText(item.value)}
                </span>
              </div>
              <div className="openui-dashboard-rank-track">
                <div
                  className="openui-dashboard-rank-fill openui-dashboard-tex-0"
                  style={{
                    width: `${max ? (item.value / max) * 100 : 0}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      </ScrollArea>
      {hover.tip}
      {children}
    </div>
  );
}

/* ---------- Screen-reader table ---------- */

/**
 * A visually hidden data table rendered beside every SVG chart, so the data
 * is readable without the picture.
 */
export function SrTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <table className="openui-dashboard-sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {head.map((label) => (
            <th key={label} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * A state as a soft tile in the tone's colour with a shape inside (circle
 * good, triangle warning, diamond bad), sized in em to follow its text. Table
 * status chips use the bare icon instead: check, !, ×, i, –.
 */
export function StatusIcon({
  tone,
  bare,
}: {
  tone: "good" | "bad" | "warning" | "info" | "neutral";
  bare?: boolean;
}) {
  // bare: the shape on its own, for a status chip that is already tinted.
  if (bare)
    return (
      <span className={`openui-dashboard-status-shape openui-dashboard-status-${tone}`} aria-hidden>
        <span />
      </span>
    );
  // The tile carries a shape: circle good, triangle warning, diamond bad, square info, bar neutral.
  return (
    <span className={`openui-dashboard-status-icon openui-dashboard-status-${tone}`} aria-hidden>
      <span />
    </span>
  );
}

/** The one shimmer that sweeps across a whole card (or tile) while the model writes it or its data refetches. */
export function Sheen() {
  return <span className="openui-dashboard-sheen" aria-hidden />;
}

/** An empty plot: axes with a flat dashed line where the data would be. */
const EmptyIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M2.5 2.5v11h11" />
    <path d="M5.5 9.5h7.5" strokeDasharray="1.2 2.2" />
  </svg>
);

/** A funnel with a slash: the filters let nothing through. */
const NoResultsIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M2.5 3h11L9.3 8.2v4.3l-2.6 1V8.2Z" />
    {/* A halo in the tile's surface colour cuts the funnel where the slash crosses it. */}
    <path d="M2 14 14 2" stroke="var(--openui-dashboard-surface)" strokeWidth="3.8" />
    <path d="M2 14 14 2" />
  </svg>
);

/** A broken link: the data could not be reached. */
const ErrorIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6.6 4.4 7.7 3.3a3 3 0 0 1 4.2 4.2L10.8 8.6" />
    <path d="M9.4 11.6 8.3 12.7a3 3 0 0 1-4.2-4.2L5.2 7.4" />
    <path d="M2.5 2.5 4 4M13.5 13.5 12 12" />
  </svg>
);

/** A card outline crossed at its corner: the definition is incomplete. */
const InvalidIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
    {/* The cross sits on the card's corner; a halo in the tile's surface colour cuts the outline around it. */}
    <path
      d="M10.8 1.4l3.6 3.6M14.4 1.4l-3.6 3.6"
      stroke="var(--openui-dashboard-surface)"
      strokeWidth="4"
    />
    <path d="M10.8 1.4l3.6 3.6M14.4 1.4l-3.6 3.6" />
  </svg>
);

/** A small alert for notes inside a drawn component. */
const NoteIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3.4" />
    <circle cx="8" cy="10.9" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const STATE_ICON = {
  empty: EmptyIcon,
  "no-results": NoResultsIcon,
  error: ErrorIcon,
  invalid: InvalidIcon,
} as const;

/** The icon, title and hint of a resting state. */
function StateMessage({
  state,
  compact,
  title,
  hint,
}: {
  state: MessageState;
  compact?: boolean;
  title?: string;
  hint?: string;
}) {
  const Icon = STATE_ICON[state];
  const copy = STATE_COPY[state];
  return (
    <>
      <span className="openui-dashboard-state-icon">
        <Icon />
      </span>
      {compact ? (
        <span className="openui-dashboard-state-title">{copy.tile}</span>
      ) : (
        <span className="openui-dashboard-state-text">
          <span className="openui-dashboard-state-title">{title ?? copy.title}</span>
          <span className="openui-dashboard-state-hint">{hint ?? copy.hint}</span>
        </span>
      )}
    </>
  );
}

/**
 * A component with nothing to draw. It says "no matching data" when a filter
 * is narrowing the data and "no data" otherwise; title and hint override the
 * wording, e.g. for a search.
 */
export function Empty({
  title,
  hint,
  height,
  state: forced,
}: {
  title?: string;
  hint?: string;
  height?: number;
  /** A state the component knows for certain, e.g. its own asset failed to load. */ state?: MessageState;
}) {
  const filters = useActiveFilters();
  const streaming = useIsStreaming();
  const fetching = useIsQueryLoading();
  const queryFailed = useRendererQuery().errors.some((error) => error.source === "query");
  // No data *yet*: the model is still writing it, or a query is fetching it.
  if (streaming || fetching) {
    return (
      <div
        className="openui-dashboard-empty"
        data-state="loading"
        role="status"
        aria-busy
        style={height ? { minHeight: height } : undefined}
      >
        <span className="openui-dashboard-sr-only">Loading</span>
        <span className="openui-dashboard-skel openui-dashboard-skel-block" aria-hidden />
      </div>
    );
  }
  // No data while a live query failed: the data most likely didn't load, rather
  // than not exist. A failure can't be traced to one card, but an empty one
  // during a failure is the card it hit.
  const state: MessageState =
    forced ?? (queryFailed ? "error" : filters.active ? "no-results" : "empty");
  return (
    <div
      className="openui-dashboard-empty"
      data-state={state}
      role="status"
      style={height ? { minHeight: height } : undefined}
    >
      <StateMessage state={state} title={title} hint={hint} />
    </div>
  );
}

/** Draws placed labels on a surface halo, with a hairline leader for any that moved off their dot. */
export function PointLabels({
  labels,
  fontSize = 11,
  opacityOf,
}: {
  labels: PlacedLabel[];
  fontSize?: number;
  opacityOf?: (key: string | number) => number;
}) {
  return (
    <g pointerEvents="none">
      {labels.map((label) => {
        const opacity = opacityOf?.(label.key) ?? 1;
        const up = label.ly < label.y;
        return (
          <g key={label.key} opacity={opacity}>
            {label.moved ? (
              <line
                x1={label.x}
                y1={up ? label.y - label.r : label.y + label.r}
                x2={label.lx}
                y2={up ? label.ly + 2 : label.ly - fontSize}
                stroke="var(--openui-dashboard-ink-muted)"
                strokeOpacity={0.5}
                strokeWidth={1}
              />
            ) : null}
            <text
              x={label.lx}
              y={label.ly}
              textAnchor="middle"
              fontSize={fontSize}
              fill="var(--openui-dashboard-ink-secondary)"
              stroke="var(--openui-dashboard-surface)"
              strokeWidth={3}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {label.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** A note under a drawn component when part of it couldn't be drawn, e.g. "1 series couldn't be drawn: Online". */
export function PartNote({ children }: { children: ReactNode }) {
  return (
    <p className="openui-dashboard-part-note" role="note">
      <NoteIcon />
      <span>{children}</span>
    </p>
  );
}

export function seriesNote(names: string[]) {
  if (!names.length) return null;
  return (
    <PartNote>
      {names.length === 1
        ? `1 series couldn’t be drawn: ${names[0]}`
        : `${names.length} series couldn’t be drawn: ${names.join(", ")}`}
    </PartNote>
  );
}

/**
 * The whole dashboard failed: nothing in the program could be drawn. The
 * Dashboard shows it itself when it ends up with no content; hosts can render
 * it when the program doesn't parse at all.
 */
export function DashboardError({
  title = "This dashboard couldn’t be drawn",
  hint = "Its definition has errors. Ask for it again.",
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="openui-dashboard-dashboard-error" role="alert">
      <span className="openui-dashboard-state-icon">
        <InvalidIcon />
      </span>
      <span className="openui-dashboard-state-text">
        <span className="openui-dashboard-state-title">{title}</span>
        <span className="openui-dashboard-state-hint">{hint}</span>
      </span>
    </div>
  );
}

/**
 * Wraps a card's (or tile's) content in its current state. The content stays
 * mounted but invisible underneath, so every state keeps the exact size of the
 * loaded card and nothing reflows when it resolves. compact is for Kpi tiles.
 * auto is the state the card worked out itself (streaming, invalid); a
 * StateOverride above wins over it.
 */
export function StateFrame({
  children,
  compact,
  auto = null,
}: {
  children: ReactNode;
  compact?: boolean;
  auto?: ViewState | null;
}) {
  const override = useViewState();
  const refreshing = useContext(RefreshingContext);
  const state = override ?? auto ?? (refreshing ? "refreshing" : null);
  if (!state) return <>{children}</>;
  // Being streamed: its final height isn't known yet, so it holds a card's height.
  const streamed = !override && auto === "loading";
  if (state === "partial") {
    return (
      <>
        {children}
        {compact ? null : <PartNote>Part of this couldn’t be drawn.</PartNote>}
      </>
    );
  }
  if (state === "refreshing") {
    // The numbers stay; a shimmer sweeps over the card and a small loader sits on its top-right corner.
    return (
      <div
        className="openui-dashboard-state"
        data-state="refreshing"
        data-compact={compact ? "" : undefined}
        aria-busy
      >
        {children}
        <span className="openui-dashboard-sheen" aria-hidden />
        <span className="openui-dashboard-refresh" role="status">
          <span className="openui-dashboard-sr-only">Updating</span>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle
              cx="8"
              cy="8"
              r="5.5"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="1.75"
            />
            <path
              d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    );
  }
  return (
    <div
      className="openui-dashboard-state"
      data-state={state}
      data-compact={compact ? "" : undefined}
      data-streamed={streamed ? "" : undefined}
      aria-busy={state === "loading" || undefined}
    >
      <div className="openui-dashboard-state-content" aria-hidden>
        {children}
      </div>
      <div
        className="openui-dashboard-state-layer"
        role={state === "error" || state === "invalid" ? "alert" : "status"}
      >
        {state === "loading" ? (
          <>
            <span className="openui-dashboard-sr-only">Loading</span>
            {/* Held still: the card (or tile) draws the one shimmer that moves across it. */}
            <span className="openui-dashboard-skel openui-dashboard-skel-line" aria-hidden />
            <span className="openui-dashboard-skel openui-dashboard-skel-block" aria-hidden />
          </>
        ) : (
          <StateMessage state={state} compact={compact} />
        )}
      </div>
    </div>
  );
}

export * from "./shared/hooks";

export * from "./shared/values";

export * from "./shared/scales";

export * from "./shared/parts";

export * from "./shared/labels";

export * from "./shared/compare";

export * from "./shared/cardSlot";

export * from "./shared/filterRegistry";

export * from "./shared/viewState";
