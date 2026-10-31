// Public built-package contract: SSR classes, selector budget and opt-in layer.
// Layered source cards must not also carry a CarouselItem rule: the card owns its padding, radius
// and border, so only the source card's own rules may style it.
import { configureStyles, ListedSources, ThemeProvider } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it } from "vitest";
import { describeContract } from "./defineContract";

afterEach(() => configureStyles({ layer: undefined }));

describeContract("Sources");

it("owns the source card without attaching unlayered CarouselItem styles", () => {
  configureStyles({ layer: "openui" });
  const html = renderToString(
    <ThemeProvider>
      <ListedSources sources={[{ title: "Title", sourceName: "Source", faviconUrl: "" }]} />
    </ThemeProvider>,
  );
  expect(html).toContain("openui-sources-item-container");
  expect(html).not.toContain("openui-carousel-item-styled");
});
