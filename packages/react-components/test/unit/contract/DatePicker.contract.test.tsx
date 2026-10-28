// #93: DatePicker's closed public root is server-renderable and exposes state attributes.
// Run after build with vitest. Portalled parts are covered by select-calendar.spec.ts.
import { DatePicker } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

it("exposes placeholder and closed state without legacy state classes", () => {
  const html = renderToString(<DatePicker />);
  expect(html).toContain("openui-date-picker-trigger");
  expect(html).toContain('data-state="closed"');
  expect(html).toContain('data-placeholder="true"');
  expect(html).not.toContain("openui-date-picker-renderer-floating");
});

describeContract("DatePicker");
