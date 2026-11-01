import { VisualCard } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { migratedComponents } from "./components";
import { describeContract } from "./defineContract";
it("VisualCard exposes its public name and private image input", () => {
  const html = renderToString(
    <VisualCard item={{ body: "Body", bgImageSrc: "https://example.com/card.png" }} clickable />,
  );
  expect(html).toContain("openui-visual-card-bottom");
  expect(html).toContain("--_openui-visual-card-image");
  expect(html).not.toContain("openui-visual-first-card");
});

it("the VisualCardBlock bench renders an image after URL validation", () => {
  const fixture = migratedComponents.find(({ folder }) => folder === "VisualCardBlock")!;
  const html = fixture
    .elements()
    .map((element) => renderToString(element))
    .join("");
  expect(html).toContain("--_openui-visual-card-image:url(");
});

describeContract("VisualCardBlock");
