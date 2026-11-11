import { css } from "@openuidev/react-components";

export const filtersStyles = css`
  /* Popovers and the filter sheet are portalled to body, outside the dashboard root, so their
     wrapper (which carries this class) gets the root's base styles here. On the root itself
     these repeat what the layout styles already set. */
  color: var(--openui-dashboard-ink);
  font-feature-settings: "liga", "calt";
  -webkit-font-smoothing: antialiased;
  & *,
  & *::before,
  & *::after {
    box-sizing: border-box;
  }

  .openui-dashboard-card-controls .openui-dashboard-chips {
    gap: 0;
    padding: 2px;
    border-radius: var(--openui-dashboard-radius-sm);
    background: var(--openui-dashboard-neutral-soft);
  }
  .openui-dashboard-card-controls .openui-dashboard-chip {
    height: 24px;
    padding: 0 9px;
    border: 0;
    border-radius: calc(
      var(--openui-dashboard-radius-sm) - 2px
    ); /* concentric: 8 outside = 6 inside + 2 padding */
    background: transparent;
    font-size: 12px;
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-card-controls .openui-dashboard-chip:hover {
    color: var(--openui-dashboard-ink);
  }
  .openui-dashboard-card-controls .openui-dashboard-chip[aria-checked="true"] {
    background: var(--openui-dashboard-surface);
    color: var(--openui-dashboard-ink);
    box-shadow: 0 0 0 1px var(--openui-dashboard-border-strong);
  }
  .openui-dashboard-card-controls .openui-dashboard-filter-button {
    height: 28px;
    padding: 0 10px;
    border-radius: var(--openui-dashboard-radius-sm);
    font-size: 12px;
  }
  .openui-dashboard-filterbar {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px var(--openui-dashboard-space-md);
    margin: -8px -12px 0;
    padding: 8px 12px;
    border-radius: var(--openui-dashboard-radius);
    background: color-mix(in srgb, var(--openui-dashboard-page) 86%, transparent);
    backdrop-filter: saturate(1.4) blur(8px);
  }
  .openui-dashboard-filterbar-spacer {
    flex: 1;
  }
  /* A small dot between sections of the bar: when · each chip set · dropdowns. */
  .openui-dashboard-filterbar-dot {
    flex: none;
    width: 3px;
    height: 3px;
    margin: 0 -6px;
    border-radius: 50%;
    background: var(--openui-dashboard-ink-muted);
    opacity: 0.5;
  }
  /* Consecutive dropdowns cluster tightly; groups keep the wider bar gap. */
  .openui-dashboard-filter-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--openui-dashboard-space-xs);
  }
  /* Wide: the Filters button hides and the items row dissolves into the bar. */
  .openui-dashboard-filterbar-menu {
    display: none;
  }
  .openui-dashboard-filterbar-items {
    display: contents;
  }

  /* The bottom tray the Filters button opens. It portals to the body, so it
   layers over everything and pins to the real viewport. */
  .openui-dashboard-sheet-scrim {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: rgba(0, 0, 0, 0.4);
  }
  .openui-dashboard-sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 61;
    max-width: 420px;
    margin: 0 auto;
    max-height: 72vh;
    overflow-y: auto;
    padding: 6px var(--openui-dashboard-space-lg) var(--openui-dashboard-space-xl);
    border: 1px solid var(--openui-dashboard-border);
    border-bottom: 0;
    border-radius: var(--openui-dashboard-radius) var(--openui-dashboard-radius) 0 0;
    background: var(--openui-dashboard-surface);
    color: var(--openui-dashboard-ink);
    box-shadow: var(--openui-dashboard-shadow-pop);
    animation: openui-dashboard-sheet-in 360ms cubic-bezier(0.32, 0.72, 0, 1);
  }
  @keyframes openui-dashboard-sheet-in {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }
  .openui-dashboard-sheet-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0 6px;
    font-size: 14px;
    font-weight: 600;
  }
  .openui-dashboard-sheet-head button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--openui-dashboard-border);
    border-radius: var(--openui-dashboard-radius-sm);
    background: var(--openui-dashboard-surface);
    color: var(--openui-dashboard-ink-secondary);
    cursor: pointer;
  }
  .openui-dashboard-sheet-head button svg {
    width: 11px;
    height: 11px;
  }
  .openui-dashboard-sheet-body {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  .openui-dashboard-sheet-body > * {
    padding: 14px 0;
  }
  .openui-dashboard-sheet-body > * + * {
    border-top: 1px solid var(--openui-dashboard-border);
  }
  .openui-dashboard-chips {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .openui-dashboard-chips > .openui-dashboard-select-prefix {
    margin-right: 2px;
    font-size: 13px;
  }
  /* Chips are fully round pills (by choice) with the dropdowns' text; the
   selected chip is outlined in ink, never a solid fill. */
  .openui-dashboard-chip {
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--openui-dashboard-border-strong);
    border-radius: 999px;
    background: var(--openui-dashboard-surface);
    font: inherit;
    font-size: 13px;
    color: var(--openui-dashboard-ink-secondary);
    cursor: pointer;
    transition:
      border-color 150ms,
      color 150ms,
      background 150ms;
  }
  .openui-dashboard-chip:hover {
    border-color: color-mix(in srgb, var(--openui-dashboard-ink) 18%, transparent);
    color: var(--openui-dashboard-ink);
  }
  /* Selected: an ink stroke marks the choice; the fill is the segmented
   track's own grey, so the two controls share one neutral. */
  .openui-dashboard-chip[aria-checked="true"] {
    border-color: var(--openui-dashboard-ink);
    background: var(--openui-dashboard-neutral-soft);
    font-weight: 500;
    color: var(--openui-dashboard-ink);
  }

  /* Keyboard focus: every interactive control announces itself. */
  .openui-dashboard-chip:focus-visible,
  .openui-dashboard-segmented button:focus-visible,
  .openui-dashboard-table th button:focus-visible,
  .openui-dashboard-multi-foot button:focus-visible,
  .openui-dashboard-button-primary:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: 1px;
  }
  /* Inside open menus the active row wears the hover tint, never a ring:
   it reads the same whether the pointer or the arrow keys put it there. */
  .openui-dashboard-menu-item:focus,
  .openui-dashboard-multi-option:focus-within {
    outline: none;
    background: var(--openui-dashboard-surface-subtle);
  }

  .openui-dashboard-select-prefix {
    margin-right: 4px;
    color: var(--openui-dashboard-ink-muted);
  }

  .openui-dashboard-popover-anchor {
    position: relative;
    display: inline-flex;
  }
  .openui-dashboard-filter-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px;
    border: 1px solid var(--openui-dashboard-border-strong);
    border-radius: var(--openui-dashboard-radius-md);
    background: var(--openui-dashboard-surface);
    font: inherit;
    font-size: 13px;
    color: var(--openui-dashboard-ink);
    cursor: pointer;
    white-space: nowrap;
  }
  .openui-dashboard-filter-button:hover {
    border-color: color-mix(in srgb, var(--openui-dashboard-ink) 18%, transparent);
  }
  /* Active (a filter or comparison applied): one quiet step up from rest — the
   hover border plus a whisper of fill — never the full accent. */
  .openui-dashboard-filter-button[data-active="true"] {
    border-color: color-mix(in srgb, var(--openui-dashboard-ink) 18%, transparent);
    background: color-mix(in srgb, var(--openui-dashboard-ink) 3%, var(--openui-dashboard-surface));
  }
  .openui-dashboard-filter-button:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: 1px;
  }
  /* Locked while the dashboard is still streaming in. */
  .openui-dashboard-filter-button:disabled,
  .openui-dashboard-search input:disabled,
  .openui-dashboard-chip:disabled,
  .openui-dashboard-segmented button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .openui-dashboard-calendar {
    flex: none;
    width: 14px;
    height: 14px;
    color: var(--openui-dashboard-ink-muted);
  }
  .openui-dashboard-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 30;
    padding: 8px;
    border: 1px solid var(--openui-dashboard-border);
    border-radius: var(--openui-dashboard-radius);
    background: var(--openui-dashboard-surface);
    box-shadow: var(--openui-dashboard-shadow-pop);
  }
  /* The standard scrollbar properties only where WebKit's pseudos are missing: setting them
     makes Chrome ignore the pseudos. */
  @supports not selector(::-webkit-scrollbar) {
    .openui-dashboard-menu {
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--openui-dashboard-ink) 10%, transparent) transparent;
    }
    .openui-dashboard-sheet {
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--openui-dashboard-ink) 10%, transparent) transparent;
    }
  }
  /* Date range: presets | a one-month calendar with a readout and Apply. */
  .openui-dashboard-range {
    display: grid;
    grid-template-columns: 148px minmax(0, 1fr);
  }
  .openui-dashboard-range-presets {
    padding-right: 8px;
    border-right: 1px solid var(--openui-dashboard-border);
  }

  .openui-dashboard-menu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 280px;
    overflow-y: auto;
  }
  .openui-dashboard-menu-item,
  .openui-dashboard-multi-foot button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 7px 8px;
    border: 0;
    border-radius: var(--openui-dashboard-radius-sm);
    background: transparent;
    font: inherit;
    font-size: 13px;
    text-align: left;
    color: var(--openui-dashboard-ink);
    cursor: pointer;
    transition: border-color 150ms;
  }
  /* The footer's action (Select all) reads a step quieter than the options. */
  .openui-dashboard-multi-foot button {
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-menu-item:hover,
  .openui-dashboard-multi-foot button:hover {
    background: var(--openui-dashboard-surface-subtle);
  }
  .openui-dashboard-menu-item[aria-selected="true"] {
    font-weight: 500;
  }
  .openui-dashboard-menu-check {
    flex: none;
    width: 12px;
    height: 12px;
    color: var(--openui-dashboard-ink-secondary);
  }
  .openui-dashboard-range-custom {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 2px 4px 2px 12px;
  }
  .openui-dashboard-cal-head {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 0 6px 4px;
  }
  .openui-dashboard-cal-title {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: var(--openui-dashboard-ink);
  }
  .openui-dashboard-cal-nav {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 0;
    border-radius: var(--openui-dashboard-radius-sm);
    background: transparent;
    color: var(--openui-dashboard-ink-secondary);
    cursor: pointer;
    transition:
      background 150ms,
      color 150ms;
  }
  .openui-dashboard-cal-nav:hover:not(:disabled) {
    background: var(--openui-dashboard-surface-subtle);
    color: var(--openui-dashboard-ink);
  }
  .openui-dashboard-cal-nav:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .openui-dashboard-cal-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    row-gap: 2px;
  }
  .openui-dashboard-cal-weekday {
    padding-bottom: 4px;
    font-size: 12px;
    text-align: center;
    color: var(--openui-dashboard-ink-muted);
  }
  /* The band between the two ends is painted on the cells so it runs
   unbroken; the ends paint half a cell so it starts and stops at their middle. */
  .openui-dashboard-cal-cell {
    --openui-dashboard-cal-band: color-mix(in srgb, var(--openui-dashboard-ink) 5%, transparent);
    display: grid;
  }
  .openui-dashboard-cal-cell[data-inside] {
    background: var(--openui-dashboard-cal-band);
  }
  /* The band rounds off where a week (or the month) starts and ends. */
  .openui-dashboard-cal-cell[data-inside][data-edge="left"] {
    border-radius: var(--openui-dashboard-radius-sm) 0 0 var(--openui-dashboard-radius-sm);
  }
  .openui-dashboard-cal-cell[data-inside][data-edge="right"] {
    border-radius: 0 var(--openui-dashboard-radius-sm) var(--openui-dashboard-radius-sm) 0;
  }
  .openui-dashboard-cal-cell[data-start] {
    background: linear-gradient(to right, transparent 50%, var(--openui-dashboard-cal-band) 50%);
  }
  .openui-dashboard-cal-cell[data-end] {
    background: linear-gradient(to right, var(--openui-dashboard-cal-band) 50%, transparent 50%);
  }
  .openui-dashboard-cal-day {
    position: relative;
    height: 30px;
    border: 0;
    border-radius: var(--openui-dashboard-radius-sm);
    background: transparent;
    font: inherit;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: var(--openui-dashboard-ink);
    cursor: pointer;
    transition:
      background 150ms,
      color 150ms;
  }
  /* :enabled for his :not(:disabled): goober breaks a selector with anything after a ")". */
  .openui-dashboard-cal-day:enabled:hover:not([aria-pressed="true"]) {
    background: var(--openui-dashboard-surface-subtle);
  }
  .openui-dashboard-cal-day[aria-pressed="true"] {
    background: var(--openui-dashboard-ink);
    color: var(--openui-dashboard-surface);
  }
  .openui-dashboard-cal-day:disabled {
    color: var(--openui-dashboard-ink-muted);
    opacity: 0.45;
    cursor: default;
  }
  .openui-dashboard-cal-day[data-today]::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 4px;
    width: 3px;
    height: 3px;
    margin-left: -1.5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.6;
  }
  .openui-dashboard-cal-day:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: -1px;
  }
  .openui-dashboard-range-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--openui-dashboard-border);
  }
  .openui-dashboard-range-readout {
    font-size: 12px;
    color: var(--openui-dashboard-ink-secondary);
    font-variant-numeric: tabular-nums;
  }
  /* The one filled button: ink, like every other selected state — never the accent. */
  .openui-dashboard-button-primary {
    flex: none;
    height: 28px;
    padding: 0 12px;
    border: 0;
    border-radius: var(--openui-dashboard-radius-sm);
    background: var(--openui-dashboard-ink);
    font: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--openui-dashboard-surface);
    cursor: pointer;
    transition: opacity 150ms;
  }
  .openui-dashboard-button-primary:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .openui-dashboard-multi-list {
    display: flex;
    flex-direction: column;
    max-height: 260px;
    overflow-y: auto;
  }
  .openui-dashboard-multi-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border-radius: var(--openui-dashboard-radius-sm);
    font-size: 13px;
    color: var(--openui-dashboard-ink);
    cursor: pointer;
    transition: border-color 150ms;
  }
  .openui-dashboard-multi-option:hover {
    background: var(--openui-dashboard-surface-subtle);
  }
  /* Neutral checkbox: ticking every option must not turn the menu a colour. */
  .openui-dashboard-multi-option {
    position: relative;
  }
  .openui-dashboard-multi-option input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }
  .openui-dashboard-multi-option input:checked + .openui-dashboard-checkbox,
  .openui-dashboard-view-check input:checked + .openui-dashboard-checkbox {
    border-color: transparent;
    background: var(--openui-dashboard-ink);
    color: var(--openui-dashboard-surface);
  }
  .openui-dashboard-multi-foot button:disabled {
    opacity: 0.4;
    cursor: default;
    background: transparent;
  }
  .openui-dashboard-multi-option[data-locked] {
    cursor: default;
  }
  .openui-dashboard-multi-foot {
    display: flex;
    justify-content: flex-start;
    margin-top: 4px;
    padding-top: 6px;
    border-top: 1px solid var(--openui-dashboard-border);
  }
  .openui-dashboard-search {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  /* Search rests as a 30px icon button (the field, shrunk around its icon) and
   opens to full width while focused or holding a query. */
  .openui-dashboard-search input {
    height: 30px;
    width: 30px;
    padding: 0 0 0 28px;
    border: 1px solid var(--openui-dashboard-border-strong);
    border-radius: var(--openui-dashboard-radius-md);
    background: var(--openui-dashboard-surface);
    font: inherit;
    font-size: 13px;
    color: var(--openui-dashboard-ink);
    color-scheme: inherit;
    cursor: pointer;
    transition:
      width 240ms cubic-bezier(0.32, 0.72, 0, 1),
      border-color 150ms,
      background 150ms;
  }
  .openui-dashboard-search input::placeholder {
    color: transparent;
  }
  .openui-dashboard-search:focus-within input,
  .openui-dashboard-search[data-open] input {
    width: 200px;
    padding-right: 30px;
    cursor: text;
  }
  .openui-dashboard-search:focus-within input::placeholder {
    color: var(--openui-dashboard-ink-muted);
  }
  .openui-dashboard-sheet .openui-dashboard-search input {
    width: 100%;
    padding-right: 30px;
    cursor: text;
  }
  .openui-dashboard-sheet .openui-dashboard-search input::placeholder {
    color: var(--openui-dashboard-ink-muted);
  }
  .openui-dashboard-sheet .openui-dashboard-search {
    display: flex;
  }
  /* Typing in search, or a query applied, is the filters' quiet active state
   (hover border plus a whisper of fill), not an accent focus ring. */
  .openui-dashboard-search input:hover,
  .openui-dashboard-search input:focus,
  .openui-dashboard-search input:not(:placeholder-shown) {
    outline: none;
    border-color: color-mix(in srgb, var(--openui-dashboard-ink) 18%, transparent);
  }
  .openui-dashboard-search input:focus,
  .openui-dashboard-search input:not(:placeholder-shown) {
    background: color-mix(in srgb, var(--openui-dashboard-ink) 3%, var(--openui-dashboard-surface));
  }
  .openui-dashboard-search input::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
    display: none;
  }
  .openui-dashboard-search-clear {
    position: absolute;
    right: 6px;
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border: 0;
    border-radius: var(--openui-dashboard-radius-sm);
    background: transparent;
    color: var(--openui-dashboard-ink-muted);
    cursor: pointer;
    transition:
      background 150ms,
      color 150ms;
  }
  .openui-dashboard-search-clear:hover {
    background: var(--openui-dashboard-surface-subtle);
    color: var(--openui-dashboard-ink);
  }
  .openui-dashboard-search-clear:focus-visible {
    outline: 2px solid var(--openui-dashboard-accent);
    outline-offset: 0;
  }
  .openui-dashboard-search-icon {
    position: absolute;
    left: 9px;
    pointer-events: none;
    width: 10px;
    height: 10px;
    border: 1.5px solid var(--openui-dashboard-ink-muted);
    border-radius: 50%;
  }
  .openui-dashboard-search-icon::after {
    content: "";
    position: absolute;
    right: -4px;
    bottom: -3px;
    width: 5px;
    height: 1.5px;
    background: var(--openui-dashboard-ink-muted);
    transform: rotate(45deg);
  }
  .openui-dashboard-filter-button .openui-dashboard-select-prefix {
    margin-right: 0;
  }
  /* A multi-select narrowed to several values: a soft-square count. */
  .openui-dashboard-filter-count {
    display: inline-grid;
    place-items: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: calc(var(--openui-dashboard-radius-sm) - 2px);
    background: var(--openui-dashboard-surface);
    box-shadow: inset 0 0 0 1px var(--openui-dashboard-border-strong);
    font-size: 12px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--openui-dashboard-ink);
  }
  @container openui-dashboard (max-width: 560px) {
    .openui-dashboard-filterbar-menu {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 30px;
      padding: 0 12px;
      border: 1px solid var(--openui-dashboard-border-strong);
      border-radius: var(--openui-dashboard-radius-md);
      background: var(--openui-dashboard-surface);
      font: inherit;
      font-size: 13px;
      color: var(--openui-dashboard-ink);
      cursor: pointer;
    }
    .openui-dashboard-filterbar-menu svg {
      width: 14px;
      height: 14px;
      color: var(--openui-dashboard-ink-muted);
    }
    .openui-dashboard-filterbar-items {
      display: none;
    }
  }
  @media (max-width: 520px) {
    .openui-dashboard-range {
      grid-template-columns: 1fr;
    }
    .openui-dashboard-range-presets {
      padding: 0 0 8px;
      border-right: 0;
      border-bottom: 1px solid var(--openui-dashboard-border);
    }
    .openui-dashboard-range .openui-dashboard-range-custom {
      padding: 10px 0 0;
    }
  }
`;
