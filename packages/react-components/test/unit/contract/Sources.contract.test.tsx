// Public built-package contract: SSR classes, selector budget and opt-in layer.
// Layered source cards must not also carry an unmigrated CarouselItem rule, whose unlayered
// padding, radius and border would outrank the source card's own layer.
import { ListedSources, ThemeProvider } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { describeContract } from "./defineContract";

describeContract("Sources");

it("owns the source card without attaching unlayered CarouselItem styles", () => {
  const html = renderToString(
    <ThemeProvider cssLayer="openui">
      <ListedSources sources={[{ title: "Title", sourceName: "Source", faviconUrl: "" }]} />
    </ThemeProvider>,
  );
  expect(html).toContain("openui-sources-item-container");
  expect(html).not.toContain("openui-carousel-item-styled");
});
