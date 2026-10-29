import { ListBlock, ListItem, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { Icon, image, mode, useReady } from "./lists-tables-parity-shared";
declare const __PARITY_BASELINE__: boolean;
const item = __PARITY_BASELINE__ ? ".openui-list-item-wrapper" : ".openui-list-item";
const parts = JSON.stringify({
  root: ".openui-list-block",
  first: `${item}:first-child`,
  second: `${item}:last-child`,
  ...Object.fromEntries(
    [
      "indicator",
      "indicator-number",
      "indicator-image",
      "content-wrapper",
      "content",
      "title",
      "subtitle",
      "action",
      "action-label",
      "action-icon",
    ].map((part) => [part, `.openui-list-item-${part}`]),
  ),
  compactIndicator: `${item}:last-child .openui-list-item-indicator`,
});
function Fixture() {
  useReady();
  return (
    <>
      {(["default", "small"] as const).flatMap((size) =>
        (["number", "icon", "image"] as const).flatMap((variant) =>
          [false, true].map((subtitle) => (
            <div
              key={`${size}/${variant}/${subtitle}`}
              data-case={`${size}/${variant}/subtitle-${subtitle}`}
              data-parity-parts={parts}
            >
              <ListBlock size={size} variant={variant}>
                <ListItem
                  title="First"
                  subtitle={subtitle ? "Details" : undefined}
                  icon={<Icon />}
                  image={{ src: image, alt: "First" }}
                  onClick={() => {}}
                  actionLabel="View"
                  actionIcon={<Icon />}
                />
                <ListItem
                  title="Second"
                  icon={<Icon />}
                  image={{ src: image, alt: "Second" }}
                  onClick={() => {}}
                  actionLabel="View"
                />
              </ListBlock>
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
