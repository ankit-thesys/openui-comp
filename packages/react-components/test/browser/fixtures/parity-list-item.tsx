import { ListItem, ThemeProvider } from "openui-under-test";
import { createRoot } from "react-dom/client";
import { Icon, image, mode, useReady } from "./lists-tables-parity-shared";
declare const __PARITY_BASELINE__: boolean;
const parts = JSON.stringify({
  item: __PARITY_BASELINE__ ? ".openui-list-item" : ".openui-list-item-item",
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
  image: ".openui-list-item-indicator-image img",
});
function Fixture() {
  useReady();
  return (
    <>
      {(["default", "small"] as const).flatMap((size) =>
        (["number", "icon", "image"] as const).flatMap((variant) =>
          [false, true].flatMap((subtitle) =>
            [false, true].map((action) => (
              <ListItem
                key={`${size}/${variant}/${subtitle}/${action}`}
                data-case={`${size}/${variant}/subtitle-${subtitle}/action-${action}`}
                data-parity-parts={parts}
                data-parity-target={
                  __PARITY_BASELINE__ ? ".openui-list-item" : ".openui-list-item-item"
                }
                size={size}
                variant={variant}
                listHasSubtitle={subtitle}
                title="First item"
                subtitle={subtitle ? "Details" : undefined}
                icon={<Icon />}
                image={{ src: image, alt: "Item" }}
                onClick={action ? () => {} : undefined}
                actionLabel="View"
                actionIcon={<Icon />}
              />
            )),
          ),
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
