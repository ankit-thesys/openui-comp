"use client";

import {
  defineComponent,
  reactive,
  useIsStreaming,
  useStateField,
  type ComponentRenderProps,
} from "@openuidev/react-lang";
import {
  Fragment,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { z } from "zod/v4";

import { radioKeys, ScrollArea, useCompare, useReportFilter } from "../shared";

import { useStyleClasses } from "../shared/styleClasses";
import { ThemeContext } from "../ThemeProvider";

const optionSchema = z.object({ value: z.string(), label: z.string().optional() });
type Option = z.infer<typeof optionSchema>;

function options(list: unknown): Option[] {
  if (!Array.isArray(list)) return [];
  return list.filter((option): option is Option => !!option && typeof option.value === "string");
}

/* ---------- PeriodPicker: the quick date-range filter ---------- */

const periodPickerSchema = z.object({
  name: z.string(),
  options: z.array(optionSchema),
  value: reactive(z.string().optional()),
});

export const PeriodPicker = defineComponent({
  name: "PeriodPicker",
  props: periodPickerSchema,
  description:
    'Segmented control for a few date presets, e.g. [{value: "7d", label: "7D"}, {value: "30d", label: "30D"}]. Pass its $variable into query arguments (live data), or key written-in data by preset.',
  component: function PeriodPickerView({
    props,
  }: ComponentRenderProps<z.infer<typeof periodPickerSchema>>) {
    const streaming = useIsStreaming();
    const field = useStateField(props.name, props.value);
    const list = options(props.options);
    const current = (field.value as string | undefined) ?? list[0]?.value;
    return (
      <div
        className="openui-dashboard-segmented"
        role="radiogroup"
        aria-label="Date range"
        onKeyDown={(event) => !streaming && radioKeys(event, list, current, field.setValue)}
      >
        {list.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === current}
            tabIndex={option.value === current ? 0 : -1}
            disabled={streaming}
            onClick={() => field.setValue(option.value)}
          >
            {option.label ?? option.value}
          </button>
        ))}
      </div>
    );
  },
});

/* ---------- ChipFilter: quick filters as pills ---------- */

const chipFilterSchema = z.object({
  name: z.string(),
  options: z.array(optionSchema),
  value: reactive(z.string().optional()),
  label: z.string().optional(),
});

export const ChipFilter = defineComponent({
  name: "ChipFilter",
  props: chipFilterSchema,
  description:
    "Pills for 2–6 segments; one is always selected. In a FilterBar for a dashboard-wide segment, or in a Card's controls to switch that card's breakdown (leave label out there: the card title names it).",
  component: function ChipFilterView({
    props,
  }: ComponentRenderProps<z.infer<typeof chipFilterSchema>>) {
    const streaming = useIsStreaming();
    const field = useStateField(props.name, props.value);
    const list = options(props.options);
    const current = (field.value as string | undefined) ?? list[0]?.value;
    useReportFilter(props.name, current);
    return (
      <div
        className="openui-dashboard-chips"
        role="radiogroup"
        aria-label={props.label ?? props.name}
        onKeyDown={(event) => !streaming && radioKeys(event, list, current, field.setValue)}
      >
        {/* Labelled like the dropdowns: a muted "Label:" ahead of the value. */}
        {props.label ? (
          <span className="openui-dashboard-select-prefix" aria-hidden>
            {props.label}:
          </span>
        ) : null}
        {list.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            className="openui-dashboard-chip"
            aria-checked={option.value === current}
            tabIndex={option.value === current ? 0 : -1}
            disabled={streaming}
            onClick={() => field.setValue(option.value)}
          >
            {option.label ?? option.value}
          </button>
        ))}
      </div>
    );
  },
});

/* ---------- Menu primitives shared by the dropdown filters ---------- */

const Check = () => (
  <svg className="openui-dashboard-menu-check" viewBox="0 0 12 12" aria-hidden>
    <path
      d="M2.5 6.4 5 8.8l4.5-5.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Arrow keys walk the menu's options, wrapping at the ends. */
function menuNav(event: ReactKeyboardEvent) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const items = [
    ...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="option"]'),
  ];
  if (!items.length) return;
  const index = items.indexOf(document.activeElement as HTMLElement);
  items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
}

/* ---------- SelectFilter: a dropdown for longer lists ---------- */

const selectFilterSchema = z.object({
  name: z.string(),
  label: z.string(),
  options: z.array(optionSchema),
  value: reactive(z.string().optional()),
});

export const SelectFilter = defineComponent({
  name: "SelectFilter",
  props: selectFilterSchema,
  description:
    "Dropdown for one value out of a longer list. In a FilterBar for a dashboard-wide segment, or in a Card's controls to switch that card's breakdown.",
  component: function SelectFilterView({
    props,
  }: ComponentRenderProps<z.infer<typeof selectFilterSchema>>) {
    const streaming = useIsStreaming();
    const field = useStateField(props.name, props.value);
    const list = options(props.options);
    const current = (field.value as string | undefined) ?? list[0]?.value ?? "";
    const currentLabel = list.find((option) => option.value === current)?.label ?? current;
    useReportFilter(props.name, current);
    return (
      <Popover
        width={200}
        active={list.length > 1 && current !== list[0]?.value}
        disabled={streaming}
        label={
          <>
            <span className="openui-dashboard-select-prefix">{props.label}:</span>
            {currentLabel}
          </>
        }
      >
        {(close) => (
          <ScrollArea maxHeight={280} label="Scroll the options" watch={list.length}>
            <div
              className="openui-dashboard-menu"
              role="listbox"
              aria-label={props.label}
              onKeyDown={menuNav}
            >
              {list.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  className="openui-dashboard-menu-item"
                  aria-selected={option.value === current}
                  disabled={streaming}
                  onClick={() => {
                    field.setValue(option.value);
                    close();
                  }}
                >
                  {option.label ?? option.value}
                  {option.value === current ? <Check /> : null}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </Popover>
    );
  },
});

/* ---------- Shared popover for richer filters ---------- */

const FOCUSABLE =
  'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

function Popover({
  label,
  active,
  disabled,
  children,
  width = 280,
}: {
  label: ReactNode;
  active?: boolean;
  disabled?: boolean;
  children: (close: () => void) => ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const theme = useContext(ThemeContext);
  const portalStyles = useStyleClasses("filters", "shared");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  // Measured before opening so the first paint is already placed: a panel that
  // would run past the dashboard's (or window's) right edge anchors to the
  // trigger's right side instead.
  const toggle = () => {
    if (!open && ref.current) {
      const box = ref.current.getBoundingClientRect();
      const edge = Math.min(
        ref.current.closest(".openui-dashboard-root")?.getBoundingClientRect().right ??
          window.innerWidth,
        window.innerWidth,
      );
      setPosition({
        top: box.bottom + 6,
        left: Math.max(8, box.left + width > edge - 8 ? box.right - width : box.left),
      });
    }
    setOpen((value) => !value);
  };
  useEffect(() => {
    if (!open) return;
    // Focus moves into the dialog on open — onto the selected option when
    // there is one — and returns to the trigger on close.
    (
      panel.current?.querySelector<HTMLElement>(
        '[aria-selected="true"], .openui-dashboard-cal-day[aria-pressed="true"]',
      ) ??
      panel.current?.querySelector<HTMLElement>(FOCUSABLE) ??
      panel.current
    )?.focus();
    const onDown = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        !panel.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const reposition = () => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const edge = Math.min(
        ref.current?.closest(".openui-dashboard-root")?.getBoundingClientRect().right ??
          window.innerWidth,
        window.innerWidth,
      );
      setPosition({
        top: box.bottom + 6,
        left: Math.max(8, box.left + width > edge - 8 ? box.right - width : box.left),
      });
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    // Capture phase: hosts often stop keyboard events from bubbling to the document.
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, width]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  // Tab cycles inside the open dialog instead of walking out into the page.
  const trapTab = (event: ReactKeyboardEvent) => {
    if (event.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };
  return (
    <div className="openui-dashboard-popover-anchor" ref={ref}>
      <button
        ref={trigger}
        type="button"
        className="openui-dashboard-filter-button"
        data-active={active ? "true" : undefined}
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={toggle}
      >
        {label}
        <span className="openui-dashboard-filter-caret" aria-hidden />
      </button>
      {open && !disabled
        ? createPortal(
            <div className={`${theme?.portalThemeClassName ?? ""} ${portalStyles}`}>
              <div
                className="openui-dashboard-popover"
                id={id}
                role="dialog"
                aria-modal="true"
                style={{
                  position: "fixed",
                  width,
                  maxWidth: "calc(100vw - 16px)",
                  ...position,
                  zIndex: 70,
                }}
                ref={panel}
                tabIndex={-1}
                onKeyDown={trapTab}
              >
                {children(close)}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/* ---------- DateRangeFilter: presets plus a custom range ---------- */

const DEFAULT_PRESETS: Option[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "ytd", label: "Year to date" },
];

const dateRangeSchema = z.object({
  name: z.string(),
  value: reactive(z.string().optional()),
  presets: z.array(optionSchema).optional(),
  label: z.string().optional(),
});

const RANGE = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/;

/* Days are local "YYYY-MM-DD" strings: they sort and compare as text. */
const pad2 = (n: number) => String(n).padStart(2, "0");
const isoDay = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const parseDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
};
const shiftDay = (day: string, days: number) => {
  const date = parseDay(day);
  date.setDate(date.getDate() + days);
  return isoDay(date);
};
const dayLabel = (day: string, withYear: boolean) =>
  parseDay(day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
  });

function formatRange(value: string): string | null {
  const match = RANGE.exec(value);
  if (!match) return null;
  const sameYear = match[1]!.slice(0, 4) === match[2]!.slice(0, 4);
  return `${dayLabel(match[1]!, !sameYear)} – ${dayLabel(match[2]!, true)}`;
}

/** The days a relative preset covers, ending today: 7d, 30d, 90d, 12m, ytd. */
function presetRange(value: string, today: string): [string, string] | null {
  const days = /^(\d+)d$/.exec(value);
  if (days) return [shiftDay(today, 1 - Number(days[1])), today];
  const months = /^(\d+)m$/.exec(value);
  if (months) {
    const start = parseDay(today);
    start.setMonth(start.getMonth() - Number(months[1]));
    return [shiftDay(isoDay(start), 1), today];
  }
  if (value === "ytd") return [`${today.slice(0, 4)}-01-01`, today];
  return null;
}

const CalendarIcon = () => (
  <svg className="openui-dashboard-calendar" viewBox="0 0 14 14" aria-hidden>
    <rect
      x="1.75"
      y="2.75"
      width="10.5"
      height="9.5"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M1.75 5.75h10.5M4.75 1.5v2.5M9.25 1.5v2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const Chevron = ({ back }: { back?: boolean }) => (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
    <path
      d={back ? "M7.5 3 4.5 6l3 3" : "M4.5 3l3 3-3 3"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * One month of days. Click a start, then an end; the band between them is a
 * quiet tint and the two ends are solid. Future days are disabled: a
 * dashboard has no data there. Arrow keys walk the days.
 */
function RangeCalendar({
  from,
  to,
  today,
  onPick,
}: {
  from: string | null;
  to: string | null;
  today: string;
  onPick: (day: string) => void;
}) {
  const [month, setMonth] = useState(() => (to ?? from ?? today).slice(0, 7));
  const [hover, setHover] = useState<string | null>(null);
  const [focusDay, setFocusDay] = useState(() => to ?? from ?? today);
  const grid = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-day="${focusDay}"]`)?.focus();
  }, [focusDay, month]);

  const first = parseDay(`${month}-01`);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: count }, (_, i) => `${month}-${pad2(i + 1)}`);
  const shiftMonth = (by: number) => {
    const date = new Date(first.getFullYear(), first.getMonth() + by, 1);
    return isoDay(date).slice(0, 7);
  };
  // While only a start is picked, the hovered day previews the band.
  const end = to ?? (from && hover && hover >= from ? hover : null);
  const title = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const onKey = (event: ReactKeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = shiftDay(focusDay, step);
    if (next > today) return;
    moveFocus.current = true;
    setFocusDay(next);
    setMonth(next.slice(0, 7));
  };
  return (
    <div className="openui-dashboard-cal">
      <div className="openui-dashboard-cal-head">
        <span className="openui-dashboard-cal-title">{title}</span>
        <button
          type="button"
          className="openui-dashboard-cal-nav"
          aria-label="Previous month"
          onClick={() => setMonth(shiftMonth(-1))}
        >
          <Chevron back />
        </button>
        <button
          type="button"
          className="openui-dashboard-cal-nav"
          aria-label="Next month"
          disabled={shiftMonth(1) > today.slice(0, 7)}
          onClick={() => setMonth(shiftMonth(1))}
        >
          <Chevron />
        </button>
      </div>
      <div
        className="openui-dashboard-cal-grid"
        role="grid"
        aria-label={title}
        ref={grid}
        onKeyDown={onKey}
        onMouseLeave={() => setHover(null)}
      >
        {WEEKDAYS.map((name) => (
          <span key={name} className="openui-dashboard-cal-weekday" aria-hidden>
            {name}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`lead-${i}`} />
        ))}
        {days.map((day, index) => {
          const column = (lead + index) % 7;
          const isStart = day === from;
          const isEnd = !!end && day === end;
          const inside = !!from && !!end && day > from && day < end;
          return (
            <span
              key={day}
              className="openui-dashboard-cal-cell"
              data-start={isStart && end && end !== from ? "" : undefined}
              data-end={isEnd && end !== from ? "" : undefined}
              data-inside={inside ? "" : undefined}
              data-edge={
                column === 0
                  ? "left"
                  : column === 6
                    ? "right"
                    : index === 0
                      ? "left"
                      : index === days.length - 1
                        ? "right"
                        : undefined
              }
            >
              <button
                type="button"
                className="openui-dashboard-cal-day"
                data-day={day}
                data-today={day === today ? "" : undefined}
                aria-pressed={isStart || isEnd}
                aria-label={dayLabel(day, true)}
                tabIndex={day === focusDay ? 0 : -1}
                disabled={day > today}
                onMouseEnter={() => setHover(day)}
                onFocus={() => setFocusDay(day)}
                onClick={() => onPick(day)}
              >
                {Number(day.slice(8))}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export const DateRangeFilter = defineComponent({
  name: "DateRangeFilter",
  props: dateRangeSchema,
  description:
    'Dropdown with presets (default 7d, 30d, 90d, 12m, ytd) and a calendar for a custom range; the value is a preset key or "2026-10-01..2026-10-31". For live data, pass its $variable into query arguments; with data written into the program, use PeriodPicker.',
  component: function DateRangeFilterView({
    props,
  }: ComponentRenderProps<z.infer<typeof dateRangeSchema>>) {
    const streaming = useIsStreaming();
    const field = useStateField(props.name, props.value);
    const presets = options(props.presets).length ? options(props.presets) : DEFAULT_PRESETS;
    const current =
      (field.value as string | undefined) ?? presets[1]?.value ?? presets[0]?.value ?? "";
    const today = isoDay(new Date());
    const text =
      presets.find((preset) => preset.value === current)?.label ?? formatRange(current) ?? current;
    return (
      <Popover
        width={432}
        disabled={streaming}
        label={
          <>
            <CalendarIcon />
            {props.label ? (
              <span className="openui-dashboard-select-prefix">{props.label}:</span>
            ) : null}
            {text}
          </>
        }
      >
        {(close) => (
          <RangePanel
            current={current}
            presets={presets}
            today={today}
            onApply={(value) => {
              field.setValue(value);
              close();
            }}
          />
        )}
      </Popover>
    );
  },
});

/** Presets on the left; the calendar shows the current range and takes a custom one. */
function RangePanel({
  current,
  presets,
  today,
  onApply,
}: {
  current: string;
  presets: Option[];
  today: string;
  onApply: (value: string) => void;
}) {
  const custom = RANGE.exec(current);
  const initial = custom
    ? ([custom[1], custom[2]] as [string, string])
    : presetRange(current, today);
  const [from, setFrom] = useState<string | null>(initial?.[0] ?? null);
  const [to, setTo] = useState<string | null>(initial?.[1] ?? null);
  const pick = (day: string) => {
    if (!from || to || day < from) {
      setFrom(day);
      setTo(null);
    } else {
      setTo(day);
    }
  };
  const draft = from && to ? `${from}..${to}` : null;
  const readout =
    from && to
      ? formatRange(`${from}..${to}`)
      : from
        ? `${dayLabel(from, true)} – pick an end date`
        : "Pick a start date";
  const unchanged =
    draft === current || (!!initial && !custom && from === initial[0] && to === initial[1]);
  return (
    <div className="openui-dashboard-range">
      <div
        className="openui-dashboard-range-presets openui-dashboard-menu"
        role="listbox"
        aria-label="Presets"
        onKeyDown={menuNav}
      >
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            role="option"
            className="openui-dashboard-menu-item"
            aria-selected={preset.value === current}
            onClick={() => onApply(preset.value)}
          >
            {preset.label ?? preset.value}
            {preset.value === current ? <Check /> : null}
          </button>
        ))}
      </div>
      <div className="openui-dashboard-range-custom">
        <RangeCalendar from={from} to={to} today={today} onPick={pick} />
        <div className="openui-dashboard-range-foot">
          <span className="openui-dashboard-range-readout">{readout}</span>
          <button
            type="button"
            className="openui-dashboard-button-primary"
            disabled={!draft || unchanged}
            onClick={() => draft && onApply(draft)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- MultiSelectFilter: pick several values ---------- */

const multiSelectSchema = z.object({
  name: z.string(),
  label: z.string(),
  options: z.array(optionSchema),
  value: reactive(z.array(z.string()).optional()),
});

export const MultiSelectFilter = defineComponent({
  name: "MultiSelectFilter",
  props: multiSelectSchema,
  description:
    "Dropdown with checkboxes; the value is an array of selected values ([] means all). For live data, pass its $variable into query arguments; with data written into the program, use ChipFilter or SelectFilter.",
  component: function MultiSelectFilterView({
    props,
  }: ComponentRenderProps<z.infer<typeof multiSelectSchema>>) {
    const streaming = useIsStreaming();
    const field = useStateField(props.name, props.value);
    const list = options(props.options);
    const stored = Array.isArray(field.value) ? (field.value as string[]) : [];
    const chosen = list.filter((option) => stored.includes(option.value));
    // One encoding of "All": the empty array. Every box shows ticked then, and
    // ticking the last remaining box writes [] again rather than the full list.
    const all = chosen.length === 0 || chosen.length === list.length;
    useReportFilter(props.name, all ? [] : chosen.map((option) => option.value));
    const isChecked = (value: string) => all || chosen.some((option) => option.value === value);
    const names = chosen.map((option) => option.label ?? option.value);
    // All, the one value by name, or a count once there are several.
    const summary = all ? (
      "All"
    ) : names.length === 1 ? (
      names[0]
    ) : (
      <span
        className="openui-dashboard-filter-count"
        aria-label={`${names.length} selected: ${names.join(", ")}`}
      >
        {names.length}
      </span>
    );
    const toggle = (value: string) => {
      const base = all ? list.map((option) => option.value) : chosen.map((option) => option.value);
      const next = base.includes(value) ? base.filter((item) => item !== value) : [...base, value];
      if (!next.length) return;
      field.setValue(next.length === list.length ? [] : next);
    };
    return (
      <Popover
        active={!all}
        disabled={streaming}
        label={
          <>
            <span className="openui-dashboard-select-prefix">{props.label}:</span>
            {summary}
          </>
        }
      >
        {() => (
          <div className="openui-dashboard-multi">
            <ScrollArea maxHeight={260} label="Scroll the options" watch={list.length}>
              <div className="openui-dashboard-multi-list">
                {list.map((option) => {
                  const checked = isChecked(option.value);
                  // At least one value stays chosen: the last ticked box can't be cleared.
                  const last = !all && checked && chosen.length === 1;
                  return (
                    <label
                      key={option.value}
                      className="openui-dashboard-multi-option"
                      data-locked={last ? "" : undefined}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={last}
                        onChange={() => toggle(option.value)}
                      />
                      <span className="openui-dashboard-checkbox" aria-hidden>
                        <svg viewBox="0 0 10 10" width="8" height="8">
                          <path
                            d="M2 5.2 4.1 7.2 8 3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {option.label ?? option.value}
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="openui-dashboard-multi-foot">
              <button type="button" disabled={all} onClick={() => field.setValue([])}>
                Select all
              </button>
            </div>
          </div>
        )}
      </Popover>
    );
  },
});

/* ---------- SearchFilter: free-text search ---------- */

const searchFilterSchema = z.object({
  name: z.string(),
  placeholder: z.string().optional(),
  value: reactive(z.string().optional()),
});

export const SearchFilter = defineComponent({
  name: "SearchFilter",
  props: searchFilterSchema,
  description: "Search box. Pass its $variable to Table(..., search) to filter rows.",
  component: function SearchFilterView({
    props,
  }: ComponentRenderProps<z.infer<typeof searchFilterSchema>>) {
    const streaming = useIsStreaming();
    const field = useStateField(props.name, props.value);
    const value = (field.value as string | undefined) ?? "";
    useReportFilter(props.name, value);
    const input = useRef<HTMLInputElement>(null);
    // At rest search is an icon button; focusing it (click or Tab) opens the
    // field, and it stays open while a query is applied. Escape on an empty
    // field closes it again.
    return (
      <div className="openui-dashboard-search" data-open={value ? "" : undefined}>
        <span className="openui-dashboard-search-icon" aria-hidden />
        <input
          ref={input}
          type="search"
          value={value}
          placeholder={props.placeholder ?? "Search"}
          aria-label={props.placeholder ?? "Search"}
          disabled={streaming}
          onChange={(event) => field.setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !value) event.currentTarget.blur();
          }}
        />
        {/* The kit's own clear, the same in every browser; the native one is hidden. */}
        {value && !streaming ? (
          <button
            type="button"
            className="openui-dashboard-search-clear"
            aria-label="Clear search"
            onClick={() => {
              field.setValue("");
              input.current?.focus();
            }}
          >
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
              <path
                d="M2.5 2.5l5 5M7.5 2.5l-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>
    );
  },
});

/* ---------- CompareToggle: previous-period overlays ---------- */

const compareToggleSchema = z.object({
  label: z.string().optional(),
  defaultOn: z.boolean().optional(),
  options: z.array(optionSchema).optional(),
  name: z.string().optional(),
  value: reactive(z.string().optional()),
});

const COMPARE_OFF = "off";

export const CompareToggle = defineComponent({
  name: "CompareToggle",
  props: compareToggleSchema,
  description:
    'Compare dropdown: None, or one of options (e.g. [{value: "prev", label: "Previous 30 days"}, {value: "yoy", label: "Same 30 days last year"}]). The choice overlays the previous data on every chart that has it (dashed lines, ghost bars, funnel markers) and names it in legends and deltas. With options, pass name and its $variable and key each chart\'s previous data by it (prev[$compare]), so each choice shows its own data; the value is "off" when None is chosen. Starts at None; defaultOn starts on the first choice. Without options, one choice named by label (default "Previous period").',
  component: function CompareToggleView({
    props,
  }: ComponentRenderProps<z.infer<typeof compareToggleSchema>>) {
    const streaming = useIsStreaming();
    const compare = useCompare();
    const field = useStateField(props.name ?? "compare", props.value);
    const given = options(props.options);
    const list = given.length
      ? given
      : [{ value: "previous", label: props.label || "Previous period" }];
    const stored = field.value as string | undefined;
    // Off (None) by default; defaultOn starts on the first choice. A choice
    // that no longer exists falls back to the first one.
    const current =
      stored === COMPARE_OFF || (stored === undefined && !props.defaultOn)
        ? COMPARE_OFF
        : (list.find((option) => option.value === stored) ?? list[0]!).value;
    const chosen = list.find((option) => option.value === current);
    const chosenLabel = chosen ? (chosen.label ?? chosen.value) : null;
    // While off, deltas still read against the "off" data, which is the first
    // comparison's — so they are named after it, never after a stale choice.
    const deltaLabel = chosenLabel ?? list[0]!.label ?? list[0]!.value;
    const { setLabel, setEnabled } = compare;
    useEffect(() => {
      setEnabled(current !== COMPARE_OFF);
      setLabel(deltaLabel);
    }, [current, deltaLabel, setEnabled, setLabel]);
    const choices = [{ value: COMPARE_OFF, label: "None" }, ...list];
    return (
      <Popover
        width={220}
        active={current !== COMPARE_OFF}
        disabled={streaming}
        label={
          // Nothing chosen: the button just names itself.
          chosenLabel ? (
            <>
              <span className="openui-dashboard-select-prefix">Compare:</span>
              {chosenLabel}
            </>
          ) : (
            "Compare"
          )
        }
      >
        {(close) => (
          <div
            className="openui-dashboard-menu"
            role="listbox"
            aria-label="Compare to"
            onKeyDown={menuNav}
          >
            {choices.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                className="openui-dashboard-menu-item"
                aria-selected={option.value === current}
                onClick={() => {
                  field.setValue(option.value);
                  close();
                }}
              >
                {option.label ?? option.value}
                {option.value === current ? <Check /> : null}
              </button>
            ))}
          </div>
        )}
      </Popover>
    );
  },
});

/* ---------- FilterBar ---------- */

const typeOf = (node: unknown) => (node as { typeName?: string } | null)?.typeName ?? "";

/** Filters of one kind form a section; consecutive dropdowns cluster as one. */
const SECTION: Record<string, string> = {
  PeriodPicker: "time",
  DateRangeFilter: "time",
  SelectFilter: "dropdowns",
  MultiSelectFilter: "dropdowns",
};

/**
 * The left side of the bar in sections: when (the date control), then each
 * chip set, then the dropdowns as one tight cluster. Sections are split by a
 * small dot; filters inside a section sit close together.
 */
function sections(nodes: unknown[]): unknown[][] {
  const out: unknown[][] = [];
  let previous: string | null = null;
  for (const node of nodes) {
    const key = SECTION[typeOf(node)] ?? null;
    if (key && key === previous) out[out.length - 1]!.push(node);
    else out.push([node]);
    previous = key;
  }
  return out;
}

const filterBarSchema = z.object({
  filters: z.array(
    z.union([
      PeriodPicker.ref,
      DateRangeFilter.ref,
      ChipFilter.ref,
      SelectFilter.ref,
      MultiSelectFilter.ref,
      SearchFilter.ref,
      CompareToggle.ref,
    ]),
  ),
});

export const FilterBar = defineComponent({
  name: "FilterBar",
  props: filterBarSchema,
  description: "Sticky row of dashboard-wide filters, right after the header.",
  component: function FilterBarView({
    props,
    renderNode,
  }: ComponentRenderProps<z.infer<typeof filterBarSchema>>) {
    const theme = useContext(ThemeContext);
    const portalStyles = useStyleClasses("filters", "shared");
    const filters = Array.isArray(props.filters) ? props.filters : [];
    // Compare and Search are actions on the bar's right: Compare, then Search
    // last. Everything else filters, on the left, in the order written.
    const toggles = filters.filter((node) => typeOf(node) === "CompareToggle");
    const searches = filters.filter((node) => typeOf(node) === "SearchFilter");
    const others = filters.filter(
      (node) => typeOf(node) !== "CompareToggle" && typeOf(node) !== "SearchFilter",
    );
    // On narrow containers the bar is a single Filters button that opens a
    // bottom tray (CSS hides the button when there is room for the full row).
    const [open, setOpen] = useState(false);
    useEffect(() => {
      if (!open) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKey, true);
      return () => document.removeEventListener("keydown", onKey, true);
    }, [open]);
    return (
      <>
        <div className="openui-dashboard-filterbar" role="toolbar" aria-label="Filters">
          <button
            type="button"
            className="openui-dashboard-filterbar-menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2.5 3.5h11l-4.3 5.1v3.2l-2.4 1.3V8.6L2.5 3.5Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
            Filters
          </button>
          <div className="openui-dashboard-filterbar-items">
            {sections(others).map((group, i) => (
              <Fragment key={i}>
                {i > 0 ? <span className="openui-dashboard-filterbar-dot" aria-hidden /> : null}
                {group.length > 1 ? (
                  <div className="openui-dashboard-filter-group">{renderNode(group)}</div>
                ) : (
                  <span style={{ display: "contents" }}>{renderNode(group)}</span>
                )}
              </Fragment>
            ))}
            <span className="openui-dashboard-filterbar-spacer" />
            {/* Compare and Search are one cluster of actions on the right. */}
            {toggles.length || searches.length ? (
              <div className="openui-dashboard-filter-group">
                {renderNode(toggles)}
                {renderNode(searches)}
              </div>
            ) : null}
          </div>
        </div>
        {open
          ? createPortal(
              <div
                className={`openui-dashboard-root ${theme?.portalThemeClassName ?? ""} ${portalStyles}`}
              >
                <div className="openui-dashboard-sheet-scrim" onClick={() => setOpen(false)} />
                <div
                  className="openui-dashboard-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Filters"
                >
                  <div className="openui-dashboard-sheet-head">
                    Filters
                    <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
                      <svg viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path
                          d="m2.5 2.5 7 7m0-7-7 7"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="openui-dashboard-sheet-body">
                    {renderNode(others)}
                    {renderNode(toggles)}
                    {renderNode(searches)}
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}
      </>
    );
  },
});
