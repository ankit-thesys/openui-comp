// Public built-package seam: Label exposes disabled state and its owned required asterisk.
import { Label } from "@openuidev/react-components";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

describeContract("Label");

it("exposes disabled state as an attribute and keeps its asterisk independently addressable", () => {
  const html = renderToStaticMarkup(
    <Label disabled required>
      Name
    </Label>,
  );
  expect(html).toContain('aria-disabled="true"');
  expect(html).not.toContain("openui-label-disabled");
  expect(html).toContain("openui-label-required-asterisk");
  expect(html).not.toContain("openui-label-root");
});
