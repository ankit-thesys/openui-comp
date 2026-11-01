import { DatePicker, LayoutContextProvider, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const params = new URLSearchParams(location.search);
const [mode = "single", selection = "empty", open = "closed", layout = "fullscreen"] = (
  params.get("scenario") || ""
).split("/");
const prefix = "openui-date-picker-renderer-floating-";
const parts = JSON.stringify({
  root: __PARITY_BASELINE__ ? `.${prefix}container` : ".openui-date-picker",
  trigger: __PARITY_BASELINE__ ? `.${prefix}input-container` : ".openui-date-picker-trigger",
  text: __PARITY_BASELINE__ ? `.${prefix}input-container-text` : ".openui-date-picker-text",
  icon: __PARITY_BASELINE__ ? "svg" : ".openui-date-picker-icon",
});
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
    <LayoutContextProvider layout={layout as "mobile"}>
      <section data-parity-case="field" data-parity-parts={parts} style={{ width: "320px" }}>
        <DatePicker
          mode={mode as "single"}
          isOpen={open === "open"}
          setIsOpen={() => {}}
          selectedSingleDate={selection === "selected" ? new Date(2026, 9, 15) : undefined}
          selectedRangeDates={
            selection === "selected"
              ? { from: new Date(2026, 9, 15), to: new Date(2026, 9, 18) }
              : selection === "partial"
                ? { from: new Date(2026, 9, 15) }
                : undefined
          }
          setSelectedSingleDate={() => {}}
          setSelectedRangeDates={() => {}}
        />
      </section>
    </LayoutContextProvider>
  </ThemeProvider>,
);
