// Public built-package seam: FormControl keeps one root and the shared border-box opt-in.
import { FormControl } from "@openuidev/react-components";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

describeContract("FormControl");

it("renders the form-control root without the legacy carrier", () => {
  const html = renderToStaticMarkup(
    <FormControl>
      <span>Field</span>
    </FormControl>,
  );
  expect(html).toContain("openui-form-control");
  expect(html).toContain("openui-border-box");
  expect(html).not.toContain("openui-form-control-root");
});
