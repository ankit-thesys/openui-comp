// Public built-package seam: TextArea has its exported-name root and an attribute invalid state.
import { FormControl, TextArea } from "@openuidev/react-components";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

describeContract("TextArea");

it("exposes inherited invalid state on the text-area root", () => {
  const html = renderToStaticMarkup(
    <FormControl hasError>
      <TextArea />
    </FormControl>,
  );
  expect(html).toMatch(/class="[^"]*\bopenui-text-area\b/);
  expect(html).toContain('aria-invalid="true"');
  expect(html).not.toContain("openui-textarea");
});
