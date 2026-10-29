import { EntityList, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { mode, useReady } from "./lists-tables-parity-shared";
declare const __PARITY_BASELINE__: boolean;
const parts = JSON.stringify({
  root: ".openui-entity-list",
  ...Object.fromEntries(
    ["header", "body", "footer"].flatMap((row, i) => [
      [
        row,
        __PARITY_BASELINE__
          ? `.openui-entity-list__row--${row}`
          : `.openui-entity-list-row--row-type-${row}`,
      ],
      ...["left", "right"].map((side) => [
        `${row}-${side}`,
        __PARITY_BASELINE__
          ? `.openui-entity-list__row--${row} .openui-entity-list__cell-${side}`
          : `.openui-entity-list-row--row-type-${row} .openui-entity-list-cell-${side}`,
      ]),
      [
        row + "-inline",
        `${__PARITY_BASELINE__ ? ".openui-entity-list__row" : ".openui-entity-list-row"}:nth-child(${i + 1}) .openui-inline-markdown-renderer`,
      ],
    ]),
  ),
});
function Fixture() {
  useReady();
  return (
    <>
      {(["default", "small"] as const).flatMap((size) =>
        (["text", "number"] as const).map((rightVariant) => (
          <div
            key={`${size}/${rightVariant}`}
            data-case={`${size}/${rightVariant}`}
            data-parity-parts={parts}
          >
            <EntityList
              size={size}
              header={{ left: "Key", right: "Value", rightVariant }}
              rows={[
                { left: "**Name**", right: "42", rightVariant },
                { left: "Next", right: "43", rightVariant },
              ]}
              footer={{ left: "Total", right: "85", rightVariant }}
            />
          </div>
        )),
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={mode}>
    <Fixture />
  </ThemeProvider>,
);
