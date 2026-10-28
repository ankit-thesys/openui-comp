import { Slider } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

it("exposes Slider's root, appearance and owned parts without legacy state classes", () => {
  const html = renderToString(
    <Slider variant="discrete" min={0} max={100} step={25} defaultValue={[50]} />,
  );
  expect(html).toMatch(/class="[^"]*\bopenui-slider\b[^"]*openui-slider--variant-discrete/);
  expect(html).toContain('data-state="active"');
  expect(html).not.toContain("openui-slider-dots-dot--active");
});

describeContract("Slider");
