import {
  Button,
  CardHeader,
  CompositeCard,
  CompositeCardBlock,
  ContextCard,
  ContextCardBlock,
  IconText,
  ImageText,
  InlineMarkdownRenderer,
  MarkDownRenderer,
  OptionCards,
  OverviewCardBlock,
  SnippetCardBlock,
  Tag,
  TextBlockView,
  VisualCard,
  VisualCardBlock,
} from "openui-under-test";
import type { ReactNode } from "react";
declare const __PARITY_BASELINE__: boolean;

export type CardFamily =
  | "composite-card-block"
  | "context-card-block"
  | "visual-card-block"
  | "overview-card-block"
  | "snippet-card-block"
  | "option-cards"
  | "card-block-layout";
// Both #72 and the current build validate CSS image URLs; serve a real local image.
const image = "/card-blocks-image.svg";
const label = (text: string) => <span style={{ font: "14px/21px sans-serif" }}>{text}</span>;
const text = <TextBlockView primary="**Card** *title*" secondary="Details with `code`" />;
const composite = {
  header: <CardHeader title="Header" />,
  body: [
    <MarkDownRenderer
      key="block"
      className="parity-block-markdown"
      textMarkdown="**Block strong** and `code`"
    />,
    text,
    <InlineMarkdownRenderer key="emphasis" content="**Strong** *emphasis* ***both*** and `code`" />,
  ],
  footer: { price: label("$42"), button: <Button>Choose</Button> },
};
const visual = {
  tag: <Tag text="Photo" />,
  body: text,
  bgImageSrc: image,
  bgImageAlt: "Photo card",
};
const context = { title: "Title", body: "**Bold** body with *emphasis* and `code`" };
const overview = {
  top: text,
  bottom: { value: "42", subtext: "Items", trend: { direction: "up" as const, value: 2 } },
};
const snippet = [
  {
    lhs: (
      <TextBlockView
        primary="A very long primary label that must truncate inside a narrow snippet card"
        secondary="A long secondary description that also truncates"
      />
    ),
    rhs: <TextBlockView primary="123456" secondary="Total" />,
    lhsTooltip: { heading: "Full label", content: "Full description" },
    rhsTooltip: { heading: "Full value", content: "Full total" },
  },
  {
    lhs: (
      <IconText
        icon={{ name: "star" }}
        title="Icon title that also truncates"
        subtitle="Icon details"
      />
    ),
  },
  {
    lhs: <ImageText src={image} title="Image title that also truncates" subtitle="Image details" />,
    rhs: label("42"),
  },
];
const root = (family: string) =>
  __PARITY_BASELINE__
    ? ({
        "composite-card": "openui-composite-card",
        "context-card": "openui-context-card",
        "visual-card": "openui-visual-first-card",
        "overview-card-block-card": "openui-overview-card",
        "snippet-card-block-card": "openui-value-card",
        "option-cards-card": "openui-option-card",
      }[family] ?? `openui-${family}`)
    : `openui-${family}`;
function parts(family: string, names: string[]) {
  const oldFamily =
    (
      {
        "visual-card": "visual-first-card",
        "overview-card-block": "overview-card",
        "snippet-card-block": "value-card",
        "option-cards": "option-card",
      } as Record<string, string>
    )[family] ?? family;
  const oldPart: Record<string, string> =
    family === "context-card"
      ? { top: "slot--top", bottom: "slot--bottom" }
      : family === "overview-card-block"
        ? { top: "slot--top", bottom: "slot--bottom" }
        : {};
  return Object.fromEntries(
    names.map((name) => [
      name,
      `.${__PARITY_BASELINE__ ? `openui-${oldFamily}__${oldPart[name] ?? name}` : `openui-${family}-${name}`}`,
    ]),
  );
}
function layoutParts(size: "small" | "medium") {
  return Object.fromEntries(
    ["grid", "row", "item", "carousel", "carousel-track", "carousel-item"].map((part) => [
      part,
      `.${__PARITY_BASELINE__ ? `openui-${size}-card-block__${part}` : `openui-card-block-layout-${part}`}`,
    ]),
  );
}
function Case({
  id,
  children,
  width = 640,
  named = {},
  target,
}: {
  id: string;
  children: ReactNode;
  width?: number;
  named?: Record<string, string>;
  target?: string;
}) {
  return (
    <div
      data-parity-case={id}
      data-parity-parts={JSON.stringify(named)}
      data-parity-target={target}
      style={{ width, marginBottom: 16 }}
    >
      {children}
    </div>
  );
}
export function CardCases({ family }: { family: CardFamily }) {
  if (family === "composite-card-block")
    return (
      <>
        {[false, true].map((clickable) => (
          <Case
            key={String(clickable)}
            id={`clickable-${clickable}`}
            target={`.${root("composite-card")}`}
            named={{
              card: `.${root("composite-card")}`,
              ...parts("composite-card", ["wrapper", "header", "body", "footer", "footer-content"]),
              blockStrong: ".parity-block-markdown strong",
              blockCode: ".parity-block-markdown code",
              strong: ".openui-inline-markdown-renderer strong",
              em: ".openui-inline-markdown-renderer em",
              nested: ".openui-inline-markdown-renderer strong em",
              code: ".openui-inline-markdown-renderer code",
            }}
          >
            <CompositeCard item={composite} clickable={clickable} />
          </Case>
        ))}
      </>
    );
  if (family === "context-card-block")
    return (
      <>
        {[undefined, "gray", "info", "success", "warning", "danger", "image"].flatMap((bgColor) =>
          [false, true].flatMap((clickable) =>
            [false, true].map((tag) => (
              <Case
                key={`${bgColor}-${clickable}-${tag}`}
                id={`${bgColor ?? "default"}/${clickable}/${tag}`}
                width={280}
                target={`.${root("context-card")}`}
                named={{
                  card: `.${root("context-card")}`,
                  ...parts("context-card", [
                    "vertical",
                    "top",
                    "bottom",
                    "title-text",
                    "body-text",
                    "tag-wrapper",
                    "tag",
                    "chevron",
                  ]),
                  tagContent: ".openui-tag",
                  strong: "strong",
                  code: "code",
                }}
              >
                <ContextCard
                  item={{
                    ...context,
                    title: tag ? <Tag text="Tag" /> : "Title",
                    bgColor: bgColor === "image" ? undefined : (bgColor as "info"),
                    bgImageSrc: bgColor === "image" ? image : undefined,
                  }}
                  clickable={clickable}
                />
              </Case>
            )),
          ),
        )}
      </>
    );
  if (family === "visual-card-block")
    return (
      <>
        {[false, true].flatMap((clickable) =>
          [false, true].map((photo) => (
            <Case
              key={`${clickable}-${photo}`}
              id={`${clickable}/${photo}`}
              width={320}
              target={`.${root("visual-card")}`}
              named={{
                card: `.${root("visual-card")}`,
                ...parts("visual-card", ["top", "tag", "action", "bottom"]),
                tagContent: ".openui-tag",
              }}
            >
              <VisualCard
                item={{ ...visual, bgImageSrc: photo ? image : undefined }}
                clickable={clickable}
              />
            </Case>
          )),
        )}
      </>
    );
  if (family === "overview-card-block")
    return (
      <>
        {["grid", "carousel"].flatMap((layout) =>
          [false, true].map((clickable) => (
            <Case
              key={`${layout}-${clickable}`}
              id={`${layout}/${clickable}`}
              named={{
                ...layoutParts("small"),
                card: `.${root("overview-card-block-card")}`,
                ...parts("overview-card-block", [
                  "vertical",
                  "top-row",
                  "top",
                  "bottom",
                  "chevron",
                ]),
              }}
              target={`:nth-match(.${root("overview-card-block-card")}, 1)`}
            >
              <OverviewCardBlock
                items={[overview, overview, overview]}
                layout={layout as "grid"}
                clickable={clickable}
                onItemClick={() => {}}
              />
            </Case>
          )),
        )}
      </>
    );
  if (family === "snippet-card-block")
    return (
      <>
        {[false, true].flatMap((responsive) =>
          [false, true].map((clickable) => (
            <Case
              key={`${responsive}-${clickable}`}
              id={`${responsive}/${clickable}`}
              width={420}
              target={`:nth-match(.${root("snippet-card-block-card")}, 1)`}
              named={{
                ...layoutParts("small"),
                card: `.${root("snippet-card-block-card")}`,
                ...parts("snippet-card-block", ["lhs", "rhs", "rhs-content", "chevron"]),
                primary: __PARITY_BASELINE__
                  ? ".openui-text-block__primary"
                  : ".openui-text-block-primary",
                secondary: __PARITY_BASELINE__
                  ? ".openui-text-block__secondary"
                  : ".openui-text-block-secondary",
                text: ".openui-text-block",
                iconText: ".openui-icon-text",
                imageText: ".openui-image-text",
              }}
            >
              <SnippetCardBlock
                items={snippet.map((item) => ({
                  ...item,
                  lhsTooltip: undefined,
                  rhsTooltip: undefined,
                }))}
                responsive={responsive}
                clickable={clickable}
                onItemClick={() => {}}
              />
            </Case>
          )),
        )}
      </>
    );
  if (family === "option-cards")
    return (
      <>
        {["single", "multiple"].flatMap((type) =>
          [1000, 640, 360].map((width) => (
            <Case
              key={`${type}-${width}`}
              id={`${type}/${width}`}
              width={width}
              target={`:nth-match(.${root("option-cards-card")}, 1)`}
              named={{
                grid: __PARITY_BASELINE__
                  ? ".openui-option-cards__grid"
                  : ".openui-option-cards-grid",
                row: __PARITY_BASELINE__ ? ".openui-option-cards__row" : ".openui-option-cards-row",
                card: `.${root("option-cards-card")}`,
                ...parts("option-cards", ["content", "top", "text", "title", "subtitle"]),
                selected: '[aria-checked="true"]',
                disabled: "button:disabled",
                image: "img",
              }}
            >
              <OptionCards
                type={type as "single"}
                selected={["selected", "both"]}
                items={[
                  {
                    value: "default",
                    title: "Default **title**",
                    subtitle: "Subtitle with `code`",
                    topContent: label("Icon"),
                  },
                  {
                    value: "image",
                    title: "Image",
                    topContentVariant: "image",
                    topContent: <img src={image} alt="Tile" />,
                  },
                  { value: "selected", title: "Selected", subtitle: "Details" },
                  { value: "disabled", title: "Disabled", subtitle: "Details", disabled: true },
                  {
                    value: "both",
                    title: "Selected disabled",
                    subtitle: "Details",
                    disabled: true,
                  },
                ]}
              />
            </Case>
          )),
        )}
      </>
    );
  return (
    <>
      {["context", "composite", "visual", "overview"].flatMap((kind) =>
        ["grid", "carousel"].flatMap((layout) =>
          [false, true].flatMap((responsive) =>
            [1000, 640, 360].flatMap((width) =>
              (width === 1000 && responsive ? [1, 2, 3, 4, 5, 7] : [5]).map((count) => {
                const shared = { layout: layout as "grid", responsive };
                const items = Array.from({ length: count });
                return (
                  <Case
                    key={`${kind}/${layout}/${responsive}/${width}/${count}`}
                    id={`${kind}/${layout}/${responsive}/${width}/${count}`}
                    width={width}
                    named={layoutParts(
                      kind === "composite" || kind === "visual" ? "medium" : "small",
                    )}
                  >
                    {kind === "context" ? (
                      <ContextCardBlock {...shared} items={items.map(() => context)} />
                    ) : kind === "composite" ? (
                      <CompositeCardBlock {...shared} items={items.map(() => composite)} />
                    ) : kind === "visual" ? (
                      <VisualCardBlock {...shared} items={items.map(() => visual)} />
                    ) : (
                      <OverviewCardBlock {...shared} items={items.map(() => overview)} />
                    )}
                  </Case>
                );
              }),
            ),
          ),
        ),
      )}
      {[0, 8, "20px"].flatMap((gap) =>
        (["grid", "carousel"] as const).map((layout) => (
          <Case
            key={`gap/${gap}/${layout}`}
            id={`gap/${gap}/${layout}`}
            width={640}
            named={layoutParts("small")}
          >
            <ContextCardBlock items={[context, context, context]} layout={layout} gap={gap} />
          </Case>
        )),
      )}
    </>
  );
}
