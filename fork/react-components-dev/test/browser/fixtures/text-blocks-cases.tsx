// Public consumer fixtures shared by the focused browser checks and #72 parity bundles.
import {
  Callout,
  IconTag,
  IconText,
  InlineHeader,
  Separator,
  Tag,
  TagBlock,
  TextBlockView,
  TextCallout,
  TextContent,
  TextContentWrapper,
} from "openui-under-test";
import { useEffect, type ReactNode } from "react";

export const textFamilies = [
  "text-block",
  "text-callout",
  "callout",
  "text-content",
  "text-content-wrapper",
  "inline-header",
  "icon-text",
  "icon-tag",
  "tag",
  "tag-block",
  "separator",
] as const;
export type TextFamily = (typeof textFamilies)[number];
const tones = ["neutral", "info", "warning", "success", "danger"] as const;
const icon = { name: "star" };
const title = "Primary text";
const subtitle = "Secondary text";
const variants = [
  "title-text",
  "number-title-text",
  "text-subtext",
  "highlight-text-number-subtext",
  "text",
  "highlight-text",
  "number",
  "highlight-number",
] as const;
const prose =
  "# Heading\n\nParagraph before a list\n\n- First\n- Second\n\n[Link](https://example.com) and `code`\n\n$$x^2$$\n\n> Quoted paragraph\n\nEnd";

export function TextCases({ family }: { family: TextFamily }) {
  const cases: [string, ReactNode][] = [];
  const add = (id: string, element: ReactNode) => cases.push([id, element]);
  switch (family) {
    case "text-block":
      add("default", <TextBlockView primary={title} secondary={subtitle} tertiary="Tertiary" />);
      variants.forEach((variant) =>
        (["xs", "sm", "md", "lg"] as const).forEach((size) =>
          (["text", "number", "textOnly"] as const).forEach((type) =>
            add(
              `${variant}/${size}/${type}`,
              <TextBlockView
                primary={title}
                secondary={subtitle}
                tertiary="Tertiary"
                variant={variant}
                size={size}
                type={type}
              />,
            ),
          ),
        ),
      );
      (["left", "center", "right"] as const).forEach((align) =>
        ([undefined, "positive", "negative"] as const).forEach((secondaryTone) =>
          add(
            `${align}/${secondaryTone ?? "default"}/clamped`,
            <TextBlockView
              primary="**Primary** with `code`"
              secondary="A long secondary line that wraps across multiple lines to exercise truncation and typography."
              tertiary="Hidden tertiary"
              align={align}
              secondaryTone={secondaryTone}
              secondaryMaxLines={2}
            />,
          ),
        ),
      );
      break;
    case "callout":
      add("default", <Callout title={title} description={subtitle} />);
      tones.forEach((variant) =>
        add(variant, <Callout variant={variant} title={title} description={subtitle} />),
      );
      add("duration", <Callout duration={60_000} title={title} description={subtitle} />);
      break;
    case "text-callout":
      add("default", <TextCallout title={title} description={subtitle} />);
      tones.forEach((variant) =>
        add(variant, <TextCallout variant={variant} title={title} description={subtitle} />),
      );
      break;
    case "text-content":
      add("default", <TextContent>Body text</TextContent>);
      (["clear", "card", "sunk"] as const).forEach((variant) =>
        add(variant, <TextContent variant={variant}>Body text</TextContent>),
      );
      break;
    case "text-content-wrapper":
      add("default", <TextContentWrapper textMarkdown={prose} />);
      (["clear", "card", "sunk"] as const).forEach((variant) =>
        add(
          variant,
          <TextContentWrapper
            variant={variant}
            header={{ heading: "Heading", description: "Description" }}
            textMarkdown={prose}
          />,
        ),
      );
      break;
    case "inline-header":
      add("both", <InlineHeader heading="Heading **bold**" description="Description *italic*" />);
      add("heading", <InlineHeader heading="Heading" />);
      add("description", <InlineHeader description="Description" />);
      break;
    case "icon-text":
      add("default", <IconText icon={icon} title={title} subtitle={subtitle} />);
      (["horizontal", "vertical"] as const).forEach((layout) =>
        [...tones, "inverted" as const, "filled" as const, "soft" as const].forEach((iconVariant) =>
          [false, true].forEach((bold) =>
            add(
              `${layout}/${iconVariant}/${bold}`,
              <IconText
                icon={icon}
                title={title}
                subtitle={subtitle}
                layout={layout}
                iconVariant={iconVariant}
                bold={bold}
              />,
            ),
          ),
        ),
      );
      break;
    case "icon-tag":
      add("default", <IconTag icon={icon} />);
      (["xs", "s", "m", "l", "xl"] as const).forEach((size) =>
        [...tones, "inverted" as const].forEach((variant) =>
          add(`${size}/${variant}`, <IconTag icon={icon} size={size} variant={variant} />),
        ),
      );
      break;
    case "tag":
      add("default", <Tag text="Label" />);
      (["sm", "md", "lg"] as const).forEach((size) =>
        tones.forEach((variant) =>
          add(
            `${size}/${variant}`,
            <Tag
              text="Label"
              icon={
                <svg viewBox="0 0 24 24">
                  <path d="M4 12h16" />
                </svg>
              }
              size={size}
              variant={variant}
            />,
          ),
        ),
      );
      break;
    case "tag-block":
      add(
        "default",
        <TagBlock>
          {tones.map((variant) => (
            <Tag key={variant} variant={variant} text={variant} />
          ))}
        </TagBlock>,
      );
      break;
    case "separator":
      add("default", <Separator />);
      add("horizontal", <Separator orientation="horizontal" decorative={false} />);
      add(
        "vertical",
        <div style={{ height: 80 }}>
          <Separator orientation="vertical" decorative={false} />
        </div>,
      );
      break;
  }
  useEffect(() => {
    let frame = 0;
    const ready = () => {
      if (
        (family === "icon-tag" || family === "icon-text") &&
        document.querySelectorAll("svg.lucide-star").length < cases.length
      ) {
        frame = requestAnimationFrame(ready);
        return;
      }
      if (
        family === "text-content-wrapper" &&
        document.querySelectorAll(".katex").length < cases.length
      ) {
        frame = requestAnimationFrame(ready);
        return;
      }
      document.querySelectorAll("[data-case]").forEach((root) => {
        root
          .querySelectorAll("*")
          .forEach((part, index) =>
            part.setAttribute("data-parity-part", `${part.tagName.toLowerCase()}-${index}`),
          );
        root.setAttribute("data-parity-case", root.getAttribute("data-case")!);
      });
    };
    frame = requestAnimationFrame(ready);
    return () => cancelAnimationFrame(frame);
  }, [family, cases.length]);
  return (
    <>
      {cases.map(([id, element]) => (
        <section
          key={id}
          data-case={id}
          style={{
            width: 480,
            marginBottom: 16,
            minHeight: family === "callout" && id === "duration" ? 60 : undefined,
          }}
        >
          {element}
        </section>
      ))}
    </>
  );
}
