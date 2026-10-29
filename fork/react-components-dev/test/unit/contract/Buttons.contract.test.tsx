// Public built-package seam: button groups emit the default appearance modifier.
import { Buttons } from "@openuidev/react-components";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

describeContract("Buttons");

it("emits the default horizontal variant without the legacy carrier", () => {
  const html = renderToStaticMarkup(
    <Buttons>
      <button>Save</button>
    </Buttons>,
  );
  expect(html).toContain("openui-buttons--variant-horizontal");
  expect(html).not.toContain("openui-buttons-root");
});
