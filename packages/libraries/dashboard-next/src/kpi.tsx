"use client";

import { defineComponent, useIsStreaming, type ComponentRenderProps } from "@openuidev/react-lang";
import { useLayoutEffect, useRef, useState } from "react";
import { z } from "zod/v4";

import { formatSchema, formatValue } from "./format";
import { goodWhenSchema, numbersSchema, toneSchema } from "./schema";
import {
  columnFormatter,
  DeltaBadge,
  foldParts,
  nodeList,
  partsNote,
  Sheen,
  Sparkline,
  StateFrame,
  StatusIcon,
  toNumbers,
  useCompare,
  useViewState,
} from "./shared";
import { MUTED_COLOR, seriesColor, textureOf } from "./theme";

/* ---------- Kpi: the stat tile ---------- */

/**
 * One compact item (strips past six tiles): value on top, label and change
 * below. Takes the same states as a full tile; while one shows, the change is
 * left out so no number leaks past the placeholder.
 */
function CompactKpi({ fact }: { fact: z.infer<typeof kpiSchema> }) {
  const streaming = useIsStreaming();
  const override = useViewState();
  const writing = streaming && fact.value == null;
  const inState = !!override && override !== "partial" && override !== "refreshing";
  return (
    <section
      className="openui-dashboard-kpi-compact"
      aria-label={fact.label}
      title={fact.hint ?? undefined}
    >
      {(override ?? (writing ? "loading" : null)) === "loading" ? <Sheen /> : null}
      <StateFrame compact auto={writing ? "loading" : null}>
        <div className="openui-dashboard-kpi-compact-value">
          <span className="openui-dashboard-kpi-text-value">
            {typeof fact.value === "number"
              ? formatValue(fact.value, fact.format)
              : fact.value || "—"}
          </span>
          {fact.tone ? <StatusIcon tone={fact.tone} /> : null}
        </div>
      </StateFrame>
      <div className="openui-dashboard-kpi-compact-meta">
        <span className="openui-dashboard-kpi-compact-label" title={fact.label}>
          {fact.label}
        </span>
        {!inState &&
        !writing &&
        typeof fact.value === "number" &&
        typeof fact.previous === "number" ? (
          <DeltaBadge
            current={fact.value}
            previous={fact.previous}
            format={fact.format}
            goodWhen={fact.goodWhen}
            inline
          />
        ) : null}
      </div>
    </section>
  );
}

const kpiSchema = z.object({
  label: z.string(),
  // Optional so a missing number (null) still draws its tile, with a dash.
  value: z.union([z.number(), z.string()]).nullable().optional(),
  format: formatSchema.optional(),
  previous: z.number().nullable().optional(),
  goodWhen: goodWhenSchema.optional(),
  hint: z.string().optional(),
  trend: numbersSchema.optional(),
  trendPrevious: numbersSchema.optional(),
  tone: toneSchema.optional(),
  target: z.number().optional(),
  split: z.array(z.object({ label: z.string(), value: z.number() })).optional(),
  // A union, so the signature brackets it: ("good" | "warning" | "bad" | null)[], not "good" | "warning" | "bad"[].
  states: z.array(z.union([z.enum(["good", "warning", "bad"]), z.literal(null)])).optional(),
});

type KpiProps = z.infer<typeof kpiSchema>;

/* ---------- Small charts a tile can carry (one per tile) ---------- */

/** Progress toward a target: a filled track, the share and the target named under it. */
function ProgressMeter({
  value,
  target,
  format,
  goodWhen,
}: {
  value: number;
  target: number;
  format: KpiProps["format"];
  goodWhen: KpiProps["goodWhen"];
}) {
  const share = target > 0 ? value / target : 0;
  // One decimal, as every percent in the kit: 113.3% of limit, not 113%.
  const percent = formatValue(share * 100, "percent");
  // When lower is better the target is a ceiling, so it reads as a limit.
  const noun = goodWhen === "down" ? "limit" : "target";
  return (
    <div
      className="openui-dashboard-kpi-visual"
      role="img"
      aria-label={`${percent} of the ${formatValue(target, format)} ${noun}`}
    >
      <div className="openui-dashboard-kpi-meter-track">
        <div
          className="openui-dashboard-kpi-meter-fill openui-dashboard-tex-0"
          style={{ width: `${Math.min(1, Math.max(0, share)) * 100}%` }}
        />
      </div>
      <div className="openui-dashboard-kpi-caption">
        <span>
          {percent} of {noun}
        </span>
        <span>{formatValue(target, format)}</span>
      </div>
    </div>
  );
}

/** What a total is made of: three parts in their given order; past three, the smallest fold into Other, as on the Donut. */
function SplitBar({ parts }: { parts: { label: string; value: number }[] }) {
  const positive = parts.filter((part) => part.value > 0);
  const dropped = parts.filter((part) => !(part.value > 0)).map((part) => part.label);
  // Three kept, not two plus Other: a fourth part is the first that folds.
  const folded = foldParts(positive, 3, 3);
  const kept = folded.kept.map((part, i) => ({ ...part, color: seriesColor(i) }));
  const all =
    folded.other > 0
      ? [...kept, { label: "Other", value: folded.other, color: MUTED_COLOR }]
      : kept;
  const total = all.reduce((sum, part) => sum + part.value, 0);
  if (!total) return null;
  // One decimal, padded down the legend, as in every other part-to-whole chart.
  const shareText = columnFormatter(
    all.map((part) => (part.value / total) * 100),
    "percent",
  );
  const share = (value: number) => shareText((value / total) * 100);
  return (
    <div
      className="openui-dashboard-kpi-visual"
      role="img"
      aria-label={all.map((part) => `${part.label} ${share(part.value)}`).join(", ")}
    >
      <div className="openui-dashboard-kpi-split-bar">
        {all.map((part, i) => (
          <span
            key={part.label}
            className={`openui-dashboard-tex-${textureOf(i)}`}
            style={{ flexGrow: part.value, backgroundColor: part.color }}
          />
        ))}
      </div>
      <div className="openui-dashboard-kpi-split-legend">
        {all.map((part) => (
          <span key={part.label}>
            <i style={{ background: part.color }} />
            {part.label} {share(part.value)}
          </span>
        ))}
      </div>
      {partsNote(dropped)}
    </div>
  );
}

/** One small dot per period, good / warning / bad, in a line with its count. */
function StatusStrip({ states }: { states: ("good" | "warning" | "bad" | null)[] }) {
  const good = states.filter((state) => state === "good").length;
  return (
    <div
      className="openui-dashboard-kpi-status"
      role="img"
      aria-label={`${good} of ${states.length} periods good`}
    >
      <span className="openui-dashboard-kpi-status-dots">
        {states.map((state, i) => (
          <span key={i} data-state={state ?? undefined} />
        ))}
      </span>
      <span className="openui-dashboard-kpi-caption">
        {good} of {states.length} good
      </span>
    </div>
  );
}

export const Kpi = defineComponent({
  name: "Kpi",
  props: kpiSchema,
  description:
    'Stat tile, only inside Kpis. value is a number (with format and change vs previous) or a short text such as a top plan, status or version (no format or previous; tone colours a status dot). hint is a short subtitle such as "Last 12 weeks". A number tile can carry one small chart: trend (8–13 points) draws a sparkline (trendPrevious dashed under compare); target draws progress toward a goal; split [{label, value}] shows what a total is made of (≤3 parts, for totals only, never rates or averages); states ("good" | "warning" | "bad" per period) draws a status strip. Give at most one; if several are given, states wins, then split, then target, then trend. target is for one headline number; several targets in a card are Goals. split shows the parts of this tile\'s total; a card about composition is a SegmentedBar.',
  component: function KpiView({ props }: ComponentRenderProps<z.infer<typeof kpiSchema>>) {
    const compare = useCompare();
    const streaming = useIsStreaming();
    const override = useViewState();
    const writing = streaming && props.value == null;
    const trend = toNumbers(props.trend);
    const trendPrevious = toNumbers(props.trendPrevious);
    const text = typeof props.value === "string" ? props.value : null;
    const states = Array.isArray(props.states) ? props.states : [];
    const split = Array.isArray(props.split)
      ? props.split.filter((part) => part && typeof part.value === "number")
      : [];
    // One small chart per tile, most specific first.
    const chart =
      text !== null
        ? null
        : states.length
          ? "states"
          : split.length
            ? "split"
            : typeof props.target === "number" && typeof props.value === "number"
              ? "target"
              : trend.length > 1
                ? "line"
                : null;
    return (
      <section className="openui-dashboard-card openui-dashboard-kpi" aria-label={props.label}>
        {(override ?? (writing ? "loading" : null)) === "loading" ? <Sheen /> : null}
        <div className="openui-dashboard-kpi-label">
          <span>{props.label}</span>
        </div>
        {/* While the model writes it, a tile with its label but no value yet shows the value bar. */}
        <StateFrame compact auto={writing ? "loading" : null}>
          <div className="openui-dashboard-kpi-main">
            {text !== null ? (
              <div className="openui-dashboard-kpi-value openui-dashboard-kpi-text" title={text}>
                <span className="openui-dashboard-kpi-text-value">{text}</span>
                {props.tone ? <StatusIcon tone={props.tone} /> : null}
              </div>
            ) : (
              <div className="openui-dashboard-kpi-value">
                {formatValue(props.value, props.format)}
              </div>
            )}
            {chart === "line" ? (
              <div className="openui-dashboard-kpi-spark-wrap">
                <Sparkline
                  values={trend}
                  previous={trendPrevious.length ? trendPrevious : undefined}
                  showPrevious={compare.enabled}
                />
              </div>
            ) : null}
          </div>
          {chart === "target" ? (
            <ProgressMeter
              value={props.value as number}
              target={props.target as number}
              format={props.format}
              goodWhen={props.goodWhen}
            />
          ) : null}
          {chart === "split" ? <SplitBar parts={split} /> : null}
          {chart === "states" ? <StatusStrip states={states} /> : null}
          {text === null &&
          typeof props.previous === "number" &&
          typeof props.value === "number" ? (
            <div className="openui-dashboard-kpi-foot">
              <DeltaBadge
                current={props.value}
                previous={props.previous}
                format={props.format}
                goodWhen={props.goodWhen}
              />
              <span>vs {formatValue(props.previous, props.format)}</span>
            </div>
          ) : null}
          {props.hint ? <div className="openui-dashboard-kpi-hint">{props.hint}</div> : null}
        </StateFrame>
      </section>
    );
  },
});

/* ---------- Kpis: the strip of stat tiles ---------- */

/** Tiles never render narrower than this; the strip wraps instead. Sized so
 *  a text value like "Operational" with its status dot fits untruncated. */
const MIN_TILE = 210;
/** Most tiles per row, however wide the strip gets. */
const MAX_PER_ROW = 6;
/** Past six KPIs the strip turns compact: narrower items, up to eight a row. */
const MIN_COMPACT = 150;
const MAX_COMPACT = 8;

/** The fewest rows that fit, then columns spread evenly across them: 5 → 3 + 2, never 4 + 1. */
function columns(count: number, max: number): number {
  if (count <= 0) return 1;
  const rows = Math.ceil(count / max);
  return Math.ceil(count / rows);
}

const kpisSchema = z.object({
  items: z.array(Kpi.ref),
});

export const Kpis = defineComponent({
  name: "Kpis",
  props: kpisSchema,
  description:
    "A strip of Kpi tiles that lays itself out: up to 6 per row, wrapping into balanced rows when narrow. More than 6 render as compact items (value, then label and change) that wrap the same way; sparklines and hints are left out there. Tiles are equal width; just list them.",
  component: function KpisView({
    props,
    renderNode,
  }: ComponentRenderProps<z.infer<typeof kpisSchema>>) {
    const items = Array.isArray(props.items) ? props.items : [];
    // Column count follows the measured width: as many ≥MIN_TILE columns as
    // fit, then tiles wrap into balanced rows (6 → 3 + 3, never 5 + 1).
    const strip = useRef<HTMLDivElement>(null);
    const compact = items.length > MAX_PER_ROW;
    const [cols, setCols] = useState(() => Math.max(1, Math.min(items.length || 1, 4)));
    // Measured before paint, so the strip never shows its first guess of columns and then jumps.
    useLayoutEffect(() => {
      const el = strip.current;
      if (!el) return;
      const update = () => {
        const perRow = compact
          ? Math.max(1, Math.min(MAX_COMPACT, Math.floor(el.clientWidth / MIN_COMPACT)))
          : Math.max(1, Math.min(MAX_PER_ROW, Math.floor(el.clientWidth / MIN_TILE)));
        const next = columns(items.length, perRow);
        setCols((current) => (current === next ? current : next));
      };
      update();
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => observer.disconnect();
    }, [items.length, compact]);
    // Past six headline numbers the tiles turn compact: the value on top,
    // then the label with its change on the right, wrapping in balanced rows
    // with the strip's own dividers.
    if (compact) {
      const facts = nodeList<z.infer<typeof kpiSchema>>(items);
      const rows: (typeof facts)[] = [];
      for (let i = 0; i < facts.length; i += cols) rows.push(facts.slice(i, i + cols));
      return (
        <div className="openui-dashboard-kpis openui-dashboard-kpis-compact" ref={strip}>
          {rows.map((row, r) => (
            <div key={r} className="openui-dashboard-kpis-row">
              {row.map((fact) => (
                <div key={fact.label} className="openui-dashboard-kpi-cell">
                  <CompactKpi fact={fact} />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    // Real rows: a short last row splits the full width evenly instead of
    // leaving an empty corner, and each wrapped row draws one continuous
    // separator.
    const rows: (typeof items)[] = [];
    for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
    return (
      <div className="openui-dashboard-kpis" ref={strip}>
        {rows.map((row, r) => (
          <div key={r} className="openui-dashboard-kpis-row">
            {row.map((item, i) => (
              <div key={i} className="openui-dashboard-kpi-cell">
                {renderNode(item)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
});

/* ---------- Stat: a headline number inside a Card ---------- */

const statSchema = z.object({
  value: z.number().nullable(),
  format: formatSchema.optional(),
  previous: z.number().nullable().optional(),
  goodWhen: goodWhenSchema.optional(),
  label: z.string().optional(),
});

export const Stat = defineComponent({
  name: "Stat",
  props: statSchema,
  description: "Headline number at the top of a Card, with change vs previous.",
  component: function StatView({ props }: ComponentRenderProps<z.infer<typeof statSchema>>) {
    const compare = useCompare();
    // "This week" reads as "$104,200 this week" inline; acronyms keep their case.
    const label =
      props.label && /^[A-Z][a-z]/.test(props.label)
        ? props.label.charAt(0).toLowerCase() + props.label.slice(1)
        : props.label;
    return (
      <div className="openui-dashboard-stat">
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="openui-dashboard-card-headline" style={{ margin: 0 }}>
            {formatValue(props.value, props.format)}
          </span>
          {label ? (
            <span className="openui-dashboard-card-subtitle" style={{ margin: 0 }}>
              {label}
            </span>
          ) : null}
        </div>
        {typeof props.previous === "number" ? (
          <p
            className="openui-dashboard-card-subtitle"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <DeltaBadge
              current={props.value}
              previous={props.previous}
              format={props.format}
              goodWhen={props.goodWhen}
              inline
            />
            {/* Periods read "in previous 30 days"; a target reads "vs $285K plan". */}
            vs {formatValue(props.previous, props.format)}{" "}
            {/^(previous|same)\b/i.test(compare.label)
              ? `in ${compare.label.toLowerCase()}`
              : compare.label.toLowerCase()}
          </p>
        ) : null}
      </div>
    );
  },
});
