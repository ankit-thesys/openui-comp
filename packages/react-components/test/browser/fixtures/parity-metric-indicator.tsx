import {
  MetricIndicatorInline,
  MetricIndicatorWithStrikethrough,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";
import { mode, useReady } from "./lists-tables-parity-shared";
declare const __PARITY_BASELINE__: boolean;
const parts = JSON.stringify({
  root: ".openui-metric-indicator",
  ...Object.fromEntries(
    ["row", "main-value", "previous-value", "subtext", "trend"].map((part) => [
      part,
      `.openui-metric-indicator${__PARITY_BASELINE__ ? "__" : "-"}${part}`,
    ]),
  ),
});
function Fixture() {
  useReady();
  return (
    <>
      {[MetricIndicatorInline, MetricIndicatorWithStrikethrough].flatMap((Component, i) =>
        (["up", "down", undefined] as const).flatMap((direction) =>
          [false, true].map((subtext) => (
            <div
              key={`${i}/${direction}/${subtext}`}
              data-case={`${i === 0 ? "inline" : "with-strikethrough"}/${direction ?? "no-trend"}/subtext-${subtext}`}
              data-parity-parts={parts}
            >
              <Component
                value="42"
                previousValue="45"
                subtext={subtext ? "Sales" : undefined}
                trend={direction ? { direction, value: 5 } : undefined}
              />
            </div>
          )),
        ),
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
