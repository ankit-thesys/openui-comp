import { OptionCards } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";
it("OptionCards exposes topContentVariant defaults and attribute selection states", () => {
  const html = renderToString(
    <OptionCards
      items={[{ value: "one", title: "One", topContent: "Icon", disabled: true }]}
      selected={["one"]}
    />,
  );
  expect(html).toContain("openui-option-cards-top--top-content-variant-icon");
  expect(html).toContain('aria-checked="true"');
  expect(html).not.toContain("--selected");
  expect(html).not.toContain("--disabled");
});

describeContract("OptionCards");
