// Hint is a FormControl family member; its invalid state follows the field context.
import { FormControl, Hint } from "@openuidev/react-components";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

it("exposes the hint part and inherited invalid state without an error class", () => {
  const html = renderToStaticMarkup(
    <FormControl hasError>
      <Hint>Check the field</Hint>
    </FormControl>,
  );
  expect(html).toContain("openui-form-control-hint");
  expect(html).toContain('data-invalid="true"');
  expect(html).not.toContain("openui-hint-error");
});
