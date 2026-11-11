"use client";
import { createContext, useContext, type ReactNode } from "react";
export const CardControlsContext = createContext(false);
export const CardSlotContext = createContext<HTMLElement | null>(null);
export type ViewState =
  "loading" | "refreshing" | "empty" | "no-results" | "error" | "invalid" | "partial";

const ViewStateContext = createContext<ViewState | null>(null);

/**
 * Forces every card and tile below it into one state, for previews and for
 * hosts that know a dashboard is loading or has failed. null renders normally.
 */
export function StateOverride({
  value,
  children,
}: {
  value: ViewState | null;
  children: ReactNode;
}) {
  return <ViewStateContext.Provider value={value}>{children}</ViewStateContext.Provider>;
}

export function useViewState(): ViewState | null {
  return useContext(ViewStateContext);
}

/** The one shimmer that sweeps across a whole card (or tile) while the model writes it or its data refetches. */
export function Sheen() {
  return <span className="openui-dashboard-sheen" aria-hidden />;
}

/** True while the dashboard's live data refetches: every card shows the refresh loader. */
export const RefreshingContext = createContext(false);

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

/** What each resting state says: a card gets a title and the next step; a tile gets the title alone. */
export const STATE_COPY = {
  empty: { title: "No data for this period", tile: "No data", hint: "Try a longer date range." },
  "no-results": {
    title: "No matching data",
    tile: "No results",
    hint: "Try changing or clearing a filter.",
  },
  error: {
    title: "This data didn’t load",
    tile: "Didn’t load",
    hint: "Try fetching the data again.",
  },
  invalid: {
    title: "This card couldn’t be drawn",
    tile: "Couldn’t show",
    hint: "Part of its definition is missing. Ask for it again.",
  },
} as const;

const STATE_ICON = {
  empty: EmptyIcon,
  "no-results": NoResultsIcon,
  error: ErrorIcon,
  invalid: InvalidIcon,
} as const;

export type MessageState = keyof typeof STATE_COPY;

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
        {compact ? null : (
          <p className="openui-dashboard-part-note" role="note">
            <NoteIcon />
            Part of this couldn’t be drawn.
          </p>
        )}
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
