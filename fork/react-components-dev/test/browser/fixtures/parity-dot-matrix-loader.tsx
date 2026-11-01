// Freeze the RAF trail for a deterministic resting snapshot in both builds. The focused
// browser test separately verifies motion; the style snapshot covers every dot and both grids.
import { DotMatrixLoader, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";

declare const __PARITY_BASELINE__: boolean;
window.requestAnimationFrame = () => 0;
const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    {(["default", "compact"] as const).flatMap((variant) =>
      [undefined, 48].map((size) => (
        <div
          key={`${variant}/${size}`}
          data-parity-case={`${variant}/${size ?? "default-size"}`}
          data-parity-parts={JSON.stringify({
            root: ".openui-dot-matrix-loader",
            ...Object.fromEntries(
              Array.from({ length: variant === "compact" ? 16 : 25 }, (_, index) => [
                `dot${index}`,
                `.${__PARITY_BASELINE__ ? "openui-dot-matrix-loader__dot" : "openui-dot-matrix-loader-dot"}:nth-child(${index + 1})`,
              ]),
            ),
          })}
        >
          <DotMatrixLoader variant={variant} size={size} />
        </div>
      )),
    )}
  </ThemeProvider>,
);
