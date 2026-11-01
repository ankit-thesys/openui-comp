import { Calendar, LayoutContextProvider, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const params = new URLSearchParams(location.search);
const [layout = "fullscreen", mode = "single", scenarioKind] = (params.get("scenario") || "").split(
  "/",
);
const dropdown = scenarioKind === "months" || scenarioKind === "years";
const parts = JSON.stringify({
  root: __PARITY_BASELINE__ ? ".openui-calendar-container" : ".openui-calendar",
  content: __PARITY_BASELINE__ ? ".openui-calendar-root" : ".openui-calendar-content",
  nav: __PARITY_BASELINE__ ? `.openui-calendar-nav-${layout}` : ".openui-calendar-nav",
  dropdowns: __PARITY_BASELINE__
    ? `.openui-calendar-dropdowns-${layout}`
    : ".openui-calendar-dropdowns",
  caption: ".openui-calendar-month-caption",
  grid: ".openui-calendar-month-grid",
  weekday: ".openui-calendar-weekday",
  weekNumber: __PARITY_BASELINE__ ? ".rdp-week_number" : ".openui-calendar-week-number",
  weekNumberHeader: __PARITY_BASELINE__
    ? ".rdp-week_number_header"
    : ".openui-calendar-week-number-header",
  month: ".openui-calendar-month",
  weekdays: ".openui-calendar-weekdays",
  next: ".openui-calendar-button-next",
  previous: ".openui-calendar-button-previous",
  chevron: ".openui-calendar-chevron",
  footer: ".openui-calendar-footer",
  trigger: ".openui-calendar-select-trigger",
  yearsTrigger: ".openui-calendar-years-dropdown",
});
const selected =
  mode === "range"
    ? {
        mode: "range" as const,
        selected: { from: new Date(2026, 9, 15), to: new Date(2026, 9, 18) },
      }
    : mode === "multiple"
      ? { mode: "multiple" as const, selected: [new Date(2026, 9, 15), new Date(2026, 9, 18)] }
      : { mode: "single" as const, selected: new Date(2026, 9, 15) };
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
    <LayoutContextProvider layout={layout as "mobile"}>
      <section
        data-parity-case="calendar"
        data-parity-parts={parts}
        style={{ width: "fit-content" }}
      >
        <Calendar
          {...selected}
          onSelect={() => {}}
          month={new Date(2026, 9)}
          today={new Date(2026, 9, 10)}
          disabled={new Date(2026, 9, 20)}
          disableNavigation={scenarioKind === "disabled-navigation"}
          showWeekNumber={scenarioKind === "week-numbers"}
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
          footer={<span style={{ font: "inherit" }}>Details</span>}
        />
      </section>
      {!dropdown && (
        <section
          data-parity-case="label-caption"
          data-parity-parts={parts}
          style={{ width: "fit-content" }}
        >
          <Calendar captionLayout="label" month={new Date(2026, 9)} today={new Date(2026, 9, 10)} />
        </section>
      )}
    </LayoutContextProvider>
  </ThemeProvider>,
);
