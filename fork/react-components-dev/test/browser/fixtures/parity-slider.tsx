import { Slider, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
const parts = JSON.stringify({
  wrapper: ".openui-slider-wrapper",
  root: __PARITY_BASELINE__ ? ".openui-slider-root" : ".openui-slider",
  container: ".openui-slider-container",
  containerWrapper: ".openui-slider-container-wrapper",
  track: ".openui-slider-track",
  range: ".openui-slider-range",
  thumb: ".openui-slider-thumb",
  handle: ".openui-slider-thumb-handle",
  inner: ".openui-slider-thumb-handle-inner",
  dot: ".openui-slider-thumb-handle-inner-dot",
  value: ".openui-slider-thumb-value",
  mark: ".openui-slider-dots-dot",
  inactiveMark: ".openui-slider-dots-dot:last-child",
  labels: ".openui-slider-labels",
  minLabel: ".openui-slider-labels > :first-child",
  maxLabel: ".openui-slider-labels > :last-child",
  left: ".openui-slider-left-content",
  right: ".openui-slider-right-content",
  icon: ".openui-slider-left-content svg",
});
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {(["continuous", "discrete"] as const).flatMap((variant) =>
      [false, true].flatMap((disabled) =>
        ["min", "middle", "max", "range"].map((value) => (
          <div
            key={`${variant}/${disabled}/${value}`}
            data-parity-case={`${variant}/${disabled}/${value}`}
            data-parity-parts={parts}
            style={{ width: 420, padding: "45px 20px" }}
          >
            <Slider
              variant={variant}
              min={0}
              max={10000}
              step={2500}
              disabled={disabled}
              value={
                value === "range"
                  ? [2500, 7500]
                  : [value === "min" ? 0 : value === "max" ? 10000 : 5000]
              }
              leftContent={<svg width="24" height="24" />}
              rightContent={<svg width="24" height="24" />}
            />
          </div>
        )),
      ),
    )}
  </ThemeProvider>,
);
