// Cards give the primitives in their slots a look through the primitives' public props (README,
// "Primitive props for cards"). A prop the caller passes wins over the card's; with none, the card's
// applies. Run after build.
import {
  CompositeCardBlock,
  ContextCardBlock,
  IconText,
  InlineMarkdownRenderer,
  SnippetCardBlock,
  Tag,
  TextBlockView,
  VisualCardBlock,
} from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { stableClassesIn } from "./collect";

/** The class lists of the elements whose classes include `className`, in document order. */
const classesOf = (element: ReactElement, className: string) => {
  const found = [...renderToString(element).matchAll(/class="([^"]*)"/g)]
    .map(([, classes]) => classes!.split(/\s+/))
    .filter((classes) => classes.includes(className));
  expect(found.length, `${className} renders`).toBeGreaterThan(0);
  return found;
};
const text = (props: Partial<Parameters<typeof TextBlockView>[0]> = {}) => (
  <TextBlockView primary="Primary" secondary="Secondary" {...props} />
);
const snippet = (slot: "lhs" | "rhs", node: ReactElement) => (
  <SnippetCardBlock
    items={[{ lhs: slot === "lhs" ? node : "Left", rhs: slot === "rhs" ? node : undefined }]}
  />
);

describe("SnippetCardBlock slots", () => {
  it("align the right slot's TextBlock right unless it passes its own align", () => {
    const [slotted] = classesOf(snippet("rhs", text()), "openui-text-block");
    expect(slotted).toContain("openui-text-block--align-right");
    const [own] = classesOf(snippet("rhs", text({ align: "left" })), "openui-text-block");
    expect(own).toContain("openui-text-block--align-left");
    expect(own).not.toContain("openui-text-block--align-right");
  });

  it("truncate the text in a slot unless it passes its own overflow", () => {
    for (const slot of ["lhs", "rhs"] as const) {
      const [slotted] = classesOf(snippet(slot, text()), "openui-text-block");
      expect(slotted).toContain("openui-text-block--overflow-truncate");
      const [own] = classesOf(snippet(slot, text({ overflow: "wrap" })), "openui-text-block");
      expect(own).toContain("openui-text-block--overflow-wrap");
      expect(own).not.toContain("openui-text-block--overflow-truncate");
    }
  });

  it("let an IconText's own overflow reach its inner TextBlock", () => {
    const node = <IconText icon={{ name: "star" }} title="Title" overflow="wrap" />;
    const [iconText] = classesOf(snippet("lhs", node), "openui-icon-text");
    expect(iconText).toContain("openui-icon-text--overflow-wrap");
    expect(iconText).toContain("openui-icon-text--width-fill");
    const [inner] = classesOf(snippet("lhs", node), "openui-text-block");
    expect(inner).toContain("openui-text-block--overflow-wrap");
    expect(inner).not.toContain("openui-text-block--overflow-truncate");
  });

  it("leave text outside a card on the primitives' own defaults", () => {
    const classes = [...stableClassesIn(renderToString(text()))];
    expect(classes.filter((name) => /--(overflow|width)-/.test(name))).toEqual([
      "openui-text-block--overflow-wrap",
    ]);
    expect(classes).toContain("openui-text-block--align-left");
  });
});

describe("photo cards and Tags", () => {
  it("give a Tag in the image slot the image surface, and no other Tag", () => {
    const tag = <Tag text="Label" />;
    expect(
      classesOf(
        <VisualCardBlock items={[{ tag, bgImageSrc: "https://example.com/a.png" }]} />,
        "openui-tag",
      )[0],
    ).toContain("openui-tag--surface-image");
    expect(
      classesOf(
        <ContextCardBlock items={[{ title: tag, bgImageSrc: "https://example.com/a.png" }]} />,
        "openui-tag",
      )[0],
    ).toContain("openui-tag--surface-image");
    for (const element of [<ContextCardBlock items={[{ title: tag }]} />, tag])
      expect(
        classesOf(element, "openui-tag")[0]!.filter((name) => name.includes("--surface-")),
      ).toEqual([]);
  });
});

describe("CompositeCard and inline markdown", () => {
  it("gives inline markdown in the card the inherited typography, and none outside", () => {
    const inline = <InlineMarkdownRenderer content="**Bold** and `code`" />;
    const [inCard] = classesOf(
      <CompositeCardBlock items={[{ header: inline }]} />,
      "openui-inline-markdown-renderer",
    );
    expect(inCard).toContain("openui-inline-markdown-renderer--typography-inherit");
    expect(
      classesOf(
        <CompositeCardBlock items={[{ header: inline }]} />,
        "openui-markdown-renderer-code",
      )[0],
    ).toContain("openui-markdown-renderer-code--typography-inherit");
    const [outside] = classesOf(inline, "openui-inline-markdown-renderer");
    expect(outside!.filter((name) => name.includes("--typography-"))).toEqual([]);
  });
});
