// Each portal scenario is isolated: only its controlled-open Select is modal on the page.
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  ThemeProvider,
} from "openui-under-test";
import { createRoot } from "react-dom/client";
declare const __PARITY_BASELINE__: boolean;
const params = new URLSearchParams(location.search);
const scenario = params.get("scenario") || "closed";
const [size = "md", position = "popper"] = scenario.split("/");
const triggerParts = JSON.stringify({ icon: ".openui-select-trigger-icon" });
const itemParts = JSON.stringify({
  check: ".openui-select-item-check-wrapper",
  icon: ".openui-select-item-check-icon",
  text: __PARITY_BASELINE__ ? "[id]" : ".openui-select-item-text",
  value: ".openui-select-item-text-value",
});
createRoot(document.getElementById("root")!).render(
  <ThemeProvider mode={params.get("mode") === "dark" ? "dark" : "light"}>
    {/* #72 renders a falsy child through Icon asChild when hiding the icon. The installed
        Radix Slot rejects that child. Hide the regular icon to capture the same appearance. */}
    {__PARITY_BASELINE__ && (
      <style>{`.parity-hide-dropdown-icon .openui-select-trigger-icon { display: none; }`}</style>
    )}
    {scenario === "closed" ? (
      [undefined, "sm", "md", "lg"].flatMap((size) =>
        [false, true].flatMap((disabled) =>
          [false, true].flatMap((selected) =>
            [false, true].map((hideDropdownIcon) => (
              <Select
                key={`${size}/${disabled}/${selected}/${hideDropdownIcon}`}
                size={size as "sm"}
                disabled={disabled}
                value={selected ? "one" : ""}
              >
                <SelectTrigger
                  data-parity-case={`${size ?? "default"}/${disabled}/${selected}/${hideDropdownIcon}`}
                  data-parity-parts={hideDropdownIcon ? "{}" : triggerParts}
                  className={
                    __PARITY_BASELINE__ && hideDropdownIcon
                      ? "parity-hide-dropdown-icon"
                      : undefined
                  }
                  hideDropdownIcon={__PARITY_BASELINE__ ? false : hideDropdownIcon}
                >
                  <SelectValue placeholder="Choose">{selected ? "One" : undefined}</SelectValue>
                </SelectTrigger>
              </Select>
            )),
          ),
        ),
      )
    ) : (
      <Select size={size as "sm"} value="one" open onOpenChange={() => {}}>
        <SelectTrigger>
          <SelectValue>One</SelectValue>
        </SelectTrigger>
        <SelectContent
          position={position as "popper"}
          data-parity-case="content"
          data-parity-parts={JSON.stringify({ viewport: ".openui-select-viewport" })}
        >
          <SelectGroup data-parity-part="group">
            <SelectLabel data-parity-part="label">Group</SelectLabel>
            <SelectItem
              value="one"
              textValue="Detail"
              data-parity-case="selected"
              data-parity-parts={itemParts}
            >
              One
            </SelectItem>
            <SelectItem
              value="two"
              showTick={false}
              data-parity-case="without-tick"
              data-parity-parts={itemParts}
            >
              Two
            </SelectItem>
            <SelectItem
              value="three"
              disabled
              data-parity-part="disabled"
              data-parity-parts={itemParts}
            >
              Three
            </SelectItem>
            <SelectSeparator data-parity-part="separator" />
          </SelectGroup>
        </SelectContent>
      </Select>
    )}
    {scenario === "closed" && (
      <Select value="one">
        <SelectTrigger data-parity-case="consumer-icon" data-parity-parts={triggerParts}>
          <svg data-parity-part="consumer-icon" width={16} height={16} viewBox="0 0 16 16">
            <path d="M2 2h12v12H2z" />
          </svg>
          <SelectValue>One</SelectValue>
        </SelectTrigger>
      </Select>
    )}
  </ThemeProvider>,
);
