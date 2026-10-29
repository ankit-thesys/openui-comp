import { ContextCard } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { migratedComponents } from "./components";
import { describeContract } from "./defineContract";
it("ContextCard names background props and exposes an overridable image default", () => {
  const html = renderToString(
    <ContextCard
      item={{
        title: "Title",
        body: "Body",
        bgColor: "info",
        bgImageSrc: "https://example.com/card.png",
      }}
      clickable
    />,
  );
  expect(html).toContain("openui-context-card--bg-color-info");
  expect(html).toContain("openui-context-card-vertical");
  expect(html).not.toContain('style="background-image:');
});

it("the ContextCardBlock bench renders an image card after URL validation", () => {
  const fixture = migratedComponents.find(({ folder }) => folder === "ContextCardBlock")!;
  const html = fixture
    .elements()
    .map((element) => renderToString(element))
    .join("");
  expect(html).toContain('data-background-image="true"');
  expect(html).toContain("--_openui-context-card-image:url(");
});

describeContract("ContextCardBlock");
