// #93: one family per page, including portal nodes outside #root and lazy render registration.
import {
  Calendar,
  DatePicker,
  LayoutContextProvider,
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
import { useState } from "react";
import { createRoot } from "react-dom/client";
const params = new URLSearchParams(location.search);
function Fixture() {
  const [value, setValue] = useState(params.has("placeholder") ? "" : "one");
  const [open, setOpen] = useState(params.has("open"));
  const family = params.get("family") || "select";
  return (
    <ThemeProvider
      cssLayer={params.get("layer") || undefined}
      mode={params.get("mode") === "dark" ? "dark" : "light"}
    >
      <LayoutContextProvider layout={(params.get("layout") || "fullscreen") as "mobile"}>
        {family === "select" ? (
          <Select
            size={(params.get("size") || "md") as "sm"}
            value={value}
            onValueChange={setValue}
            open={open}
            onOpenChange={setOpen}
            disabled={params.has("disabled")}
          >
            <SelectTrigger data-testid="trigger" hideDropdownIcon={params.has("hide-icon")}>
              <SelectValue
                ref={(node) => {
                  node?.setAttribute("data-value-root-ref", "true");
                }}
                placeholder="Choose"
              >
                {params.has("placeholder") ? undefined : value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position={(params.get("position") || "popper") as "popper"}>
              <SelectGroup>
                <SelectLabel>Group</SelectLabel>
                <SelectItem value="one" textValue="Detail">
                  One
                </SelectItem>
                <SelectItem value="two" showTick={false}>
                  Two
                </SelectItem>
                <SelectItem value="three" disabled>
                  Three
                </SelectItem>
                <SelectSeparator />
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : family === "calendar" ? (
          <Calendar
            mode="range"
            disableNavigation={params.has("disabled")}
            defaultMonth={new Date(2026, 9)}
            today={new Date(2026, 9, 10)}
            selected={{ from: new Date(2026, 9, 15), to: new Date(2026, 9, 18) }}
            disabled={new Date(2026, 9, 20)}
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2030, 11)}
            captionLayout={params.has("label") ? "label" : "dropdown"}
            showWeekNumber
            footer={<span style={{ font: "inherit" }}>Details</span>}
          />
        ) : (
          <DatePicker
            mode={(params.get("selection-mode") || "single") as "single"}
            isOpen={open}
            setIsOpen={setOpen}
            selectedSingleDate={new Date(2026, 9, 15)}
            selectedRangeDates={{ from: new Date(2026, 9, 15), to: new Date(2026, 9, 18) }}
          />
        )}
      </LayoutContextProvider>
    </ThemeProvider>
  );
}
const mount = () => createRoot(document.getElementById("root")!).render(<Fixture />);
if (params.has("lazy")) window.mountFixture = mount;
else mount();
