"use client";

import {
  defineComponent,
  useIsStreaming,
  useRendererQuery,
  type ComponentRenderProps,
} from "@openuidev/react-lang";
import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { z } from "zod/v4";

import { widthClass, widthSchema, type Width } from "./schema";
import {
  CardControlsContext,
  CardSlotContext,
  DashboardError,
  RefreshingContext,
  Sheen,
  StateFrame,
  useViewState,
  type ViewState,
} from "./shared";

import { DashboardTheme } from "./ThemeProvider";
import { layoutStyles } from "./styles";

/* ---------- Card ---------- */

// Content and controls are empty until their component tickets land.
const cardContent = z.never();

const cardSchema = z.object({
  title: z.string(),
  content: z.array(cardContent),
  width: widthSchema.optional(),
  subtitle: z.string().optional(),
  controls: z.array(z.never()).optional(),
});

export const Card = defineComponent({
  name: "Card",
  props: cardSchema,
  description:
    'content stacks top to bottom, usually [Stat?, one visual]. Default width "half". title says what is plotted; subtitle gives units, period or source ("Weekly · USD"). controls are this card\'s own switches, shown in its header: a ChipFilter or SelectFilter for what the card is broken down by or which metric it plots, e.g. Card("Top sources", [Leaderboard(...)], "half", "Visitors", [ChipFilter("sourceBy", [{value: "channel", label: "Channel"}, {value: "domain", label: "Domain"}], $sourceBy)]).',
  component: function CardView({
    props,
    renderNode,
  }: ComponentRenderProps<z.infer<typeof cardSchema>>) {
    const streaming = useIsStreaming();
    const ref = useRef<HTMLElement>(null);
    const writing = useBeingWritten(ref, streaming);
    const content = Array.isArray(props.content) ? props.content : [];
    // While the model streams, the card it is writing (and any whose content
    // hasn't arrived) loads. Once it's done, a card left with no content had
    // every component dropped as invalid: say so instead of drawing a blank card.
    const auto: ViewState | null = streaming
      ? writing || !content.length
        ? "loading"
        : null
      : !content.length
        ? "invalid"
        : null;
    const override = useViewState();
    const [slot, setSlot] = useState<HTMLElement | null>(null);
    return (
      <section
        ref={ref}
        className={`openui-dashboard-card ${widthClass(props.width, "half")}`}
        aria-label={props.title}
      >
        {/* Loading, however it's triggered: one shimmer across the whole card, over the still skeleton. */}
        {(override ?? auto) === "loading" ? <Sheen /> : null}
        <header className="openui-dashboard-card-head">
          <div>
            <h3 className="openui-dashboard-card-title">{props.title}</h3>
            {props.subtitle ? (
              <p className="openui-dashboard-card-subtitle">{props.subtitle}</p>
            ) : null}
          </div>
          {/* The program's own controls, then the slot a chart fills with its view switch. Hidden while empty. */}
          <div
            className="openui-dashboard-card-controls"
            role="toolbar"
            aria-label={`${props.title} view`}
          >
            {Array.isArray(props.controls) && props.controls.length ? (
              <CardControlsContext.Provider value={true}>
                {renderNode(props.controls)}
              </CardControlsContext.Provider>
            ) : null}
            <div ref={setSlot} className="openui-dashboard-card-slot" />
          </div>
        </header>
        <div className="openui-dashboard-card-body">
          <CardSlotContext.Provider value={slot}>
            <StateFrame auto={auto}>{renderNode(props.content)}</StateFrame>
          </CardSlotContext.Provider>
        </div>
      </section>
    );
  },
});

/**
 * Whether this card is the one the model is writing: while streaming, the last
 * card (or tile) on the dashboard. Earlier cards stop re-rendering once their
 * text is complete, so the card watches for a later one to appear.
 */
function useBeingWritten(ref: RefObject<HTMLElement | null>, streaming: boolean) {
  const [last, setLast] = useState(true);
  useLayoutEffect(() => {
    const card = ref.current;
    if (!streaming || !card) return;
    const root = card.closest(".openui-dashboard-dashboard") ?? card.parentElement;
    if (!root) return;
    const check = () => {
      const cards = root.querySelectorAll(".openui-dashboard-card");
      setLast(cards[cards.length - 1] === card);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ref, streaming]);
  return streaming && last;
}

/* ---------- Row ---------- */

/** Card heights a row can take, 80px apart. Cards fill the row; their plots stretch to it. */
export const ROW_HEIGHTS = [240, 320, 400, 480, 560, 640] as const;
type RowHeight = (typeof ROW_HEIGHTS)[number];

const rowSchema = z.object({
  items: z.array(Card.ref),
  height: z
    .union([
      z.literal(240),
      z.literal(320),
      z.literal(400),
      z.literal(480),
      z.literal(560),
      z.literal(640),
    ])
    .optional(),
});

/** What a card needs when the row doesn't say: tables, GeoMap and Flow 560, PointMap and Cohorts 480,
    summaries (Stat, KeyValues, SegmentedBar) 320, every other chart 400. */
const TALL: Record<string, RowHeight> = {
  Table: 560,
  GeoMap: 560,
  Flow: 560,
  PointMap: 480,
  Cohorts: 480,
};
const COMPACT = new Set(["Stat", "KeyValues", "SegmentedBar"]);
function cardHeight(card: unknown): RowHeight {
  const content = (card as { props?: { content?: unknown } } | null)?.props?.content;
  const kinds = (Array.isArray(content) ? content : []).map(
    (node) => (node as { typeName?: string } | null)?.typeName ?? "",
  );
  if (!kinds.length) return 400;
  if (kinds.every((kind) => COMPACT.has(kind))) return 320;
  return kinds.reduce<RowHeight>(
    (tallest, kind) => Math.max(tallest, TALL[kind] ?? 400) as RowHeight,
    400,
  );
}

export const Row = defineComponent({
  name: "Row",
  props: rowSchema,
  description:
    "Cards side by side on a 12-column grid; their widths add up to a full row. Every card in a row is the same height, one of 240, 320, 400, 480, 560 or 640 px, and its chart stretches to fill it. Leave height out and the row picks one from its content: 400 for charts, 560 for tables, GeoMap and Flow, 480 for PointMap and Cohorts, 320 for summaries (Stat, KeyValues, SegmentedBar).",
  component: function RowView({
    props,
    renderNode,
  }: ComponentRenderProps<z.infer<typeof rowSchema>>) {
    const items = Array.isArray(props.items) ? props.items : [];
    const widths = items.map((item) => {
      const node = item as { typeName?: string; props?: { width?: Width | null } } | null;
      return node?.props?.width ?? "half";
    });
    const mediumFill = orphans(widths, ["quarter", "third", "half"]);
    const smallFill = orphans(widths, ["quarter"]);
    const wideSpans = fillLines(widths);
    const height =
      props.height && ROW_HEIGHTS.includes(props.height)
        ? props.height
        : Math.max(...items.map(cardHeight), 240);
    return (
      <div
        className="openui-dashboard-row"
        style={{ "--openui-dashboard-row-h": `${height}px` } as CSSProperties}
      >
        {items.map((item, i) => {
          const grown = wideSpans[i] !== SPAN[widths[i] ?? "half"];
          return (
            <div
              key={i}
              className={`openui-dashboard-cell ${widthClass(widths[i], "half")}${mediumFill.has(i) ? " openui-dashboard-md-full" : ""}${smallFill.has(i) ? " openui-dashboard-sm-full" : ""}`}
              data-wide-span={grown ? "" : undefined}
              style={
                grown
                  ? ({ "--openui-dashboard-wide-span": wideSpans[i] } as CSSProperties)
                  : undefined
              }
            >
              {renderNode(item)}
            </div>
          );
        })}
      </div>
    );
  },
});

const SPAN: Record<Width, number> = {
  quarter: 3,
  third: 4,
  half: 6,
  "two-thirds": 8,
  "three-quarters": 9,
  full: 12,
};

/**
 * At full width, cards flow onto lines of 12 columns. A line that falls
 * short (two-thirds + half wraps the half onto a line of its own) would leave
 * a hole, so its cards share out the spare columns as evenly as they can,
 * the remainder going to the last cards. Rows that add up are untouched.
 */
function fillLines(widths: Width[]): number[] {
  const spans = widths.map((width) => SPAN[width] ?? 6);
  const result = [...spans];
  let start = 0;
  let used = 0;
  const close = (end: number) => {
    const count = end - start;
    const spare = 12 - used;
    if (count <= 0 || spare <= 0) return;
    for (let i = 0; i < count; i++) {
      result[start + i] =
        (result[start + i] ?? 0) +
        Math.floor(spare / count) +
        (i >= count - (spare % count) ? 1 : 0);
    }
  };
  spans.forEach((span, i) => {
    if (used + span > 12) {
      close(i);
      start = i;
      used = 0;
    }
    used += span;
  });
  close(spans.length);
  return result;
}

/**
 * At narrower sizes some widths become halves and the rest full lines
 * (below 1100px: quarter, third and half; below 720px: quarter only). Find the
 * halves that would then sit alone beside an empty half, so they can take the
 * whole line instead.
 */
function orphans(widths: Width[], halves: Width[]): Set<number> {
  const fill = new Set<number>();
  let open: number | null = null; // a half waiting for a partner
  widths.forEach((width, i) => {
    if (!halves.includes(width)) {
      if (open !== null) fill.add(open);
      open = null;
    } else if (open === null) {
      open = i;
    } else {
      open = null;
    }
  });
  if (open !== null) fill.add(open);
  return fill;
}

/* ---------- Section ---------- */

const sectionSchema = z.object({
  title: z.string(),
  rows: z.array(Row.ref),
  description: z.string().optional(),
});

export const Section = defineComponent({
  name: "Section",
  props: sectionSchema,
  description:
    'A titled group of Kpis strips and Rows of Cards. Pass "" as title for the lead KPI section.',
  component: ({ props, renderNode }: ComponentRenderProps<z.infer<typeof sectionSchema>>) => (
    <section className="openui-dashboard-section">
      {props.title ? (
        <div className="openui-dashboard-section-head">
          <h2 className="openui-dashboard-section-title">{props.title}</h2>
          {props.description ? (
            <p className="openui-dashboard-section-description">{props.description}</p>
          ) : null}
        </div>
      ) : null}
      {renderNode(props.rows)}
    </section>
  ),
});

/* ---------- Dashboard (root) ---------- */

const dashboardSchema = z.object({
  children: z.array(Section.ref),
});

export const Dashboard = defineComponent({
  name: "Dashboard",
  props: dashboardSchema,
  description: "The root.",
  component: function DashboardView({
    props,
    renderNode,
  }: ComponentRenderProps<z.infer<typeof dashboardSchema>>) {
    const streaming = useIsStreaming();
    const query = useRendererQuery();
    const children = Array.isArray(props.children) ? props.children : [];
    // Live data refetching (a filter changed): every card keeps its numbers and shows the refresh loader.
    // Only after a fetch has started and finished once: the first fetch is loading, not
    // refreshing. (Before its queries start, the renderer briefly reports not loading.)
    const fetched = useRef<"none" | "first" | "done">("none");
    if (query.isLoading && fetched.current === "none") fetched.current = "first";
    else if (!query.isLoading && fetched.current === "first") fetched.current = "done";
    const refreshing =
      query.isLoading && !streaming && fetched.current === "done" && children.length > 0;
    return (
      <DashboardTheme>
        <div className={`${layoutStyles} openui-dashboard-root openui-dashboard-container`}>
          <div className="openui-dashboard-dashboard" aria-busy={refreshing || undefined}>
            {query.errors.length && !streaming ? (
              <p className="openui-dashboard-dashboard-notice" role="alert">
                <span className="openui-dashboard-state-title">Some live data didn’t load</span>
                <span className="openui-dashboard-state-hint">
                  Cards that use it may be out of date.
                </span>
              </p>
            ) : null}
            {/* Finished with nothing to draw: every section was invalid. */}
            <RefreshingContext.Provider value={refreshing}>
              {!streaming && !children.length ? <DashboardError /> : renderNode(props.children)}
            </RefreshingContext.Provider>
          </div>
        </div>
      </DashboardTheme>
    );
  },
});
