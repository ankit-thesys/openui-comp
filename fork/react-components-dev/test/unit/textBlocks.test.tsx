import { Tag } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

it("Tag emits default size and variant modifiers", () => {
  const html = renderToString(<Tag text="Label" />);
  expect(html).toContain("openui-tag--size-md");
  expect(html).toContain("openui-tag--variant-neutral");
});

it("IconTag emits its default appearance and size", async () => {
  const { IconTag } = await import("@openuidev/react-components");
  const html = renderToString(<IconTag icon={{ name: "star" }} />);
  expect(html).toContain("openui-icon-tag--variant-neutral");
  expect(html).toContain("openui-icon-tag--size-m");
});

it("Callout exposes flat stable classes", async () => {
  const { Callout } = await import("@openuidev/react-components");
  const html = renderToString(<Callout title="Title" description="Details" />);
  expect(html).toContain("openui-callout--variant-neutral");
});

it("TextCallout exposes flat stable classes", async () => {
  const { TextCallout } = await import("@openuidev/react-components");
  const html = renderToString(<TextCallout title="Title" description="Details" />);
  expect(html).toContain("openui-text-callout--variant-neutral");
});

it("TextContent exposes flat stable classes", async () => {
  const { TextContent } = await import("@openuidev/react-components");
  const html = renderToString(<TextContent>Text</TextContent>);
  expect(html).toContain("openui-text-content--variant-sunk");
});

it("InlineHeader exposes flat stable classes", async () => {
  const { InlineHeader } = await import("@openuidev/react-components");
  const html = renderToString(<InlineHeader heading="Title" description="Details" />);
  expect(html).not.toContain("openui-inline-header-root");
});

it("TagBlock exposes flat stable classes", async () => {
  const { TagBlock } = await import("@openuidev/react-components");
  const html = renderToString(
    <TagBlock>
      <Tag text="Label" />
    </TagBlock>,
  );
  expect(html).not.toContain("openui-tag-block-root");
});

it("Separator exposes flat stable classes", async () => {
  const { Separator } = await import("@openuidev/react-components");
  const html = renderToString(<Separator />);
  expect(html).not.toContain("openui-separator-root");
});

it("TextBlockView exposes flat stable classes", async () => {
  const { TextBlockView } = await import("@openuidev/react-components");
  const html = renderToString(<TextBlockView primary="Title" secondary="Details" />);
  expect(html).toContain("openui-text-block--variant-title-text");
});

it("IconText exposes flat stable classes", async () => {
  const { IconText } = await import("@openuidev/react-components");
  const html = renderToString(<IconText icon={{ name: "star" }} title="Title" />);
  expect(html).toContain("openui-icon-text--layout-horizontal");
});

it("TextContentWrapper exposes flat stable classes", async () => {
  const { TextContentWrapper } = await import("@openuidev/react-components");
  const html = renderToString(<TextContentWrapper textMarkdown="Text" />);
  expect(html).toContain("openui-text-content-wrapper--variant-clear");
});
