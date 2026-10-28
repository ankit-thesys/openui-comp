// #93: Calendar's public root and selection states are independent override targets.
// Run after build with vitest; browser-only dropdown parts are exercised in select-calendar.spec.ts.
import { Calendar } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

it("renders selected days as attributes on a stable day part", () => {
  const html = renderToString(
    <Calendar mode="single" month={new Date(2026, 9)} selected={new Date(2026, 9, 15)} />,
  );
  expect(html).toContain("openui-calendar-day");
  expect(html).toContain('data-selection="single"');
  expect(html).not.toContain("openui-calendar-single-day-selected");
  expect(html).not.toContain("openui-calendar-container-root");
});

describeContract("Calendar");

it("keeps an incomplete range unfilled until both endpoints exist", () => {
  const html = renderToString(
    <Calendar mode="range" month={new Date(2026, 9)} selected={{ from: new Date(2026, 9, 15) }} />,
  );
  expect(html).not.toContain('data-selection="single"');
  expect(html).not.toContain('data-range-start="true"');
});

it("preserves selection state for a consumer Day component that forwards its cell props", () => {
  const html = renderToString(
    <Calendar
      mode="range"
      month={new Date(2026, 9)}
      selected={{ from: new Date(2026, 9, 15), to: new Date(2026, 9, 18) }}
      components={{ Day: ({ day: _day, modifiers: _modifiers, ...props }) => <td {...props} /> }}
    />,
  );
  expect(html).toContain('data-range-start="true"');
  expect(html).toContain('data-range-middle="true"');
  expect(html).toContain('data-range-end="true"');
  expect(html).not.toContain("openui-calendar-select-trigger");
});
