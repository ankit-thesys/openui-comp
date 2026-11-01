import { SliderBlock, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const params = new URLSearchParams(location.search);
const scenario = params.get("scenario") || "closed";
const part = (old: string, next = old) =>
  __PARITY_BASELINE__ ? `.openui-slider-block__${old}` : `.openui-slider-block-${next}`;
const parts = JSON.stringify({
  block: ".openui-slider-block",
  header: part("header"),
  label: part("label"),
  controls: part("controls"),
  content: part("content"),
  inputContainer: part("validated-input-container"),
  selectContainer: part("validated-select-container"),
  validatedInput: part("validated-input"),
  input: part("input"),
  secondInput: `${part("validated-input-container")} > :last-child input`,
  separator: part("separator"),
  error: part("error-message"),
  errorIcon: `${part("error-message")} svg`,
  trigger: ".openui-select-trigger",
  triggerIcon: ".openui-select-trigger-icon",
  slider: __PARITY_BASELINE__ ? ".openui-slider-root" : ".openui-slider",
  wrapper: ".openui-slider-wrapper",
  track: ".openui-slider-track",
  range: ".openui-slider-range",
  thumb: ".openui-slider-thumb",
  handle: ".openui-slider-thumb-handle",
  labels: ".openui-slider-labels",
});
const cases =
  scenario === "closed"
    ? (["continuous", "discrete"] as const).flatMap((variant) =>
        [false, true].flatMap((disabled) =>
          ["single", "range", ...(variant === "continuous" ? ["invalid", "reversed"] : [])].map(
            (value) => ({ variant, disabled, value }),
          ),
        ),
      )
    : [
        {
          variant: "discrete" as const,
          disabled: false,
          value: scenario.includes("range") ? "range" : "single",
        },
      ];
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
    {cases.map(({ variant, disabled, value }) => (
      <div
        key={`${variant}/${disabled}/${value}`}
        data-parity-case={`${variant}/${disabled}/${value}`}
        data-parity-parts={parts}
        style={{ width: 480, padding: "45px 20px" }}
      >
        <SliderBlock
          label="Budget"
          variant={variant}
          min={0}
          max={100}
          step={25}
          disabled={disabled}
          defaultValue={
            value === "range"
              ? [25, 75]
              : value === "invalid"
                ? [-1, 75]
                : value === "reversed"
                  ? [75, 25]
                  : [50]
          }
        />
      </div>
    ))}
  </ThemeProvider>,
);
