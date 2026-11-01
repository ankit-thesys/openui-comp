// Public built-package seam: Input exposes its size and invalid state to consumer CSS.
import { FormControl, Input } from "@openuidev/react-components";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

describeContract("Input");

it("exposes default size and inherited invalid state without state classes", () => {
  const html = renderToStaticMarkup(
    <FormControl hasError>
      <Input />
    </FormControl>,
  );
  expect(html).toContain("openui-input--size-medium");
  expect(html).toContain('aria-invalid="true"');
  expect(html).not.toContain("openui-input-error");
});
