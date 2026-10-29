// Components converted to the flat styling convention, each rendered across every prop
// combination through public exports. Add a component here when it leaves the allowlist.
import {
  Button,
  Buttons,
  Callout,
  CardSourceProvider,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Citation,
  CitationItem,
  CodeBlock,
  FormControl,
  IconButton,
  IconTag,
  IconText,
  Image,
  ImageBlock,
  ImageGallery,
  ImageText,
  ImageTextLarge,
  InlineHeader,
  InlineMarkdownRenderer,
  ListedSourceItem,
  ListedSources,
  MarkDownRenderer,
  Separator,
  SourceFaviconImage,
  Sources,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  TagBlock,
  TextBlockView,
  TextCallout,
  TextContent,
  TextContentWrapper,
} from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import remarkGfm from "remark-gfm";
import { readStableNames, type StableNames } from "../../../scripts/selector-reference.mjs";
import { markdown } from "../../fixtures/markdown";
import { stableClassesIn } from "./collect";

export interface MigratedComponent {
  /** The component's folder under src/components. */
  folder: string;
  /** Its style modules' stable-class constants, the single source of the reference. */
  names: StableNames[];
  /** Elements covering every value of every prop that changes its classes. */
  elements: () => ReactElement[];
  /** Stable classes that only render in the browser, such as parts shown after measuring. */
  clientOnly?: string[];
  /**
   * Allows prose rules (`.goN p`, the root's generated class then tags only) for content the
   * component generates without classes. MarkDownRenderer and the inline renderer composing it opt in.
   */
  prose?: boolean;
}

// Stable names as the reference generator reads them: every style module in the folder or below.
const stableNames = await readStableNames();
const namesOf = (folder: string) => {
  const names = stableNames
    .filter(({ component }) => component === folder || component.startsWith(`${folder}/`))
    .map((entry) => entry.names);
  if (names.length === 0) throw new Error(`No built style module of ${folder} exports names.`);
  return names;
};

// Shared factories migrate independently of the component families that use them. Their
// focused contracts inspect only the CSS registered by rendering those public components.
export const sharedStyleContracts = [
  { folder: "SharedBase", module: "src/styles/base.ts", names: namesOf("SharedBase") },
  {
    folder: "SkeletonPulse",
    module: "src/components/Skeleton/skeletonPulse.ts",
    names: namesOf("SkeletonPulse"),
  },
];

const product = <T,>(...lists: T[][]): T[][] =>
  lists.reduce<T[][]>(
    (rows, list) => rows.flatMap((row) => list.map((item) => [...row, item])),
    [[]],
  );

// Composed components keep their own names plus their dependencies' public rendered classes.
// Read only after CSS collection, so this never registers a dependency before the contract render.
const composedNames = (element: ReactElement): StableNames =>
  Object.fromEntries(
    [...stableClassesIn(renderToString(element))].map((name, index) => [
      `dependency${index}`,
      name,
    ]),
  );

const source = {
  title: "A source",
  sourceName: "Example",
  // A real local image keeps the browser benches deterministic, including inside portals.
  faviconUrl:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%236286ab"/%3E%3C/svg%3E',
  url: "https://example.com",
};
const inlineContent = "**Inline** [link](https://example.com) and `code` [1]";

// Only their shared border-box rule is migrated in #90. Their owned styles stay on the
// allowlist until #91/#96; do not add these families to migratedComponents yet.
export const sharedBaseConsumers = [
  {
    name: "Buttons",
    element: (
      <Buttons>
        <button>Action</button>
      </Buttons>
    ),
  },
  {
    name: "FormControl",
    element: (
      <FormControl>
        <span>Field</span>
      </FormControl>
    ),
  },
  {
    name: "TagBlock",
    element: (
      <TagBlock>
        <span>Tag</span>
      </TagBlock>
    ),
  },
];

// #96: text and tag primitives. All typography combinations are exercised through public exports.
const textVariants = [
  "title-text",
  "number-title-text",
  "text-subtext",
  "highlight-text-number-subtext",
  "text",
  "highlight-text",
  "number",
  "highlight-number",
] as const;
const tones = ["neutral", "info", "warning", "success", "danger"] as const;
const wrapperText =
  "# Heading\n\nParagraph before a list\n\n- First\n- Second\n\n[Link](https://example.com) and `code`";
const inlineNames = () => composedNames(<InlineMarkdownRenderer content="Text" />);
const tagElements = () =>
  (["sm", "md", "lg"] as const).flatMap((size) =>
    tones.map((variant) => (
      <Tag key={`${size}-${variant}`} text="Label" size={size} variant={variant} icon={<svg />} />
    )),
  );
const iconTagElements = () =>
  (["xs", "s", "m", "l", "xl"] as const).flatMap((size) =>
    [...tones, "inverted" as const].map((variant) => (
      <IconTag key={`${size}-${variant}`} icon={{ name: "star" }} size={size} variant={variant} />
    )),
  );
const textBlockElements = () =>
  textVariants.flatMap((variant) =>
    (["xs", "sm", "md", "lg"] as const).flatMap((size) =>
      (["text", "number", "textOnly"] as const).flatMap((type) =>
        (["left", "center", "right"] as const).map((align, index) => (
          <TextBlockView
            key={`${variant}-${size}-${type}-${align}`}
            primary="Primary"
            secondary="Secondary"
            tertiary="Tertiary"
            variant={variant}
            size={size}
            type={type}
            align={align}
            secondaryTone={index === 0 ? undefined : index === 1 ? "positive" : "negative"}
            secondaryMaxLines={index === 0 ? undefined : 2}
          />
        )),
      ),
    ),
  );

const imageTextElements = () => [
  <ImageText key="default" src={source.faviconUrl} title="Title" subtitle="Subtitle" />,
  ...(["horizontal", "vertical"] as const).flatMap((layout) =>
    [false, true].map((bold) => (
      <ImageText
        key={`${layout}-${bold}`}
        src={source.faviconUrl}
        title="Title"
        subtitle="Subtitle"
        layout={layout}
        bold={bold}
        imageSize={64}
      />
    )),
  ),
];

export const migratedComponents: MigratedComponent[] = [
  {
    folder: "Image",
    names: namesOf("Image"),
    elements: () => [
      <Image key="default" src={source.faviconUrl} />,
      ...(["1:1", "3:2", "3:4", "4:3", "16:9"] as const).flatMap((aspectRatio) =>
        (["fit", "fill"] as const).map((scale) => (
          <Image
            key={`${aspectRatio}-${scale}`}
            src={source.faviconUrl}
            aspectRatio={aspectRatio}
            scale={scale}
          />
        )),
      ),
    ],
  },
  {
    folder: "ImageBlock",
    names: namesOf("ImageBlock"),
    elements: () => [
      <ImageBlock key="default" src="/media-pending.svg" />,
      <ImageBlock key="loaded" src={source.faviconUrl} imageLoading={false} />,
    ],
  },
  {
    folder: "ImageText",
    prose: true,
    get names() {
      return [...namesOf("ImageText"), ...imageTextElements().map(composedNames)];
    },
    elements: imageTextElements,
  },
  {
    folder: "ImageTextLarge",
    prose: true,
    get names() {
      return [
        ...namesOf("ImageTextLarge"),
        composedNames(<ImageTextLarge src={source.faviconUrl} title="Title" subtitle="Subtitle" />),
      ];
    },
    elements: () => [
      <ImageTextLarge key="banner" src={source.faviconUrl} title="Title" subtitle="Subtitle" />,
    ],
  },
  {
    folder: "ImageGallery",
    get names() {
      return [
        ...namesOf("ImageGallery"),
        composedNames(
          <Button variant="primary" size="small">
            Show All
          </Button>,
        ),
      ];
    },
    clientOnly: [
      "openui-image-gallery-modal",
      "openui-image-gallery-modal-content",
      "openui-image-gallery-modal-header",
      "openui-image-gallery-modal-heading",
      "openui-image-gallery-modal-main",
      "openui-image-gallery-modal-main-image",
      "openui-image-gallery-modal-carousel-container",
      "openui-image-gallery-modal-carousel",
      "openui-image-gallery-modal-button-container",
      "openui-image-gallery-modal-left-button",
      "openui-image-gallery-modal-right-button",
      "openui-image-gallery-modal-thumbnail",
      "openui-image-gallery-modal-thumbnail-image",
      "openui-image-gallery-modal-close",
      "openui-image-gallery-modal-scroll-left",
      "openui-image-gallery-modal-scroll-right",
      "openui-image-gallery-modal-icon",
    ],
    elements: () =>
      [1, 2, 3, 4, 5, 6].map((count) => (
        <ImageGallery
          key={count}
          images={Array.from({ length: count }, (_, i) => ({
            src: source.faviconUrl,
            alt: `Photo ${i + 1}`,
          }))}
        />
      )),
  },
  {
    folder: "Carousel",
    names: namesOf("Carousel"),
    clientOnly: [
      "openui-carousel-button",
      "openui-carousel-button-left",
      "openui-carousel-button-right",
      "openui-carousel-previous",
      "openui-carousel-next",
    ],
    elements: () => [
      <Carousel key="default">
        <CarouselContent>
          <CarouselItem>Card</CarouselItem>
        </CarouselContent>
      </Carousel>,
      ...(["card", "sunk"] as const).flatMap((variant) =>
        [false, true].flatMap((noSnap) =>
          [false, true].map((showButtons) => (
            <Carousel
              key={`${variant}-${noSnap}-${showButtons}`}
              variant={variant}
              noSnap={noSnap}
              showButtons={showButtons}
              style={{ width: 320 }}
            >
              <CarouselContent>
                {[1, 2, 3].map((i) => (
                  <CarouselItem key={i}>Card {i}</CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious aria-label="Previous card" icon={<svg />} />
              <CarouselNext aria-label="Next card" icon={<svg />} />
            </Carousel>
          )),
        ),
      ),
    ],
  },

  {
    folder: "Tag",
    names: namesOf("Tag"),
    elements: () => [<Tag key="default" text="Label" />, ...tagElements()],
  },
  {
    folder: "IconTag",
    names: namesOf("IconTag"),
    clientOnly: ["openui-icon-tag-icon"],
    elements: () => [<IconTag key="default" icon={{ name: "star" }} />, ...iconTagElements()],
  },
  {
    folder: "Callout",
    names: namesOf("Callout"),
    elements: () => [
      <Callout key="default" title="Title" description="Description" />,
      ...tones.flatMap((variant) =>
        [undefined, 5000].map((duration) => (
          <Callout
            key={`${variant}-${duration}`}
            variant={variant}
            duration={duration}
            title="Title"
            description="Description"
          />
        )),
      ),
    ],
  },
  {
    folder: "TextCallout",
    names: namesOf("TextCallout"),
    elements: () => [
      <TextCallout key="default" title="Title" description="Description" />,
      ...tones.map((variant) => (
        <TextCallout key={variant} variant={variant} title="Title" description="Description" />
      )),
    ],
  },
  {
    folder: "TextContent",
    names: namesOf("TextContent"),
    elements: () => [
      <TextContent key="default">Content</TextContent>,
      ...(["clear", "card", "sunk"] as const).map((variant) => (
        <TextContent key={variant} variant={variant}>
          Content
        </TextContent>
      )),
    ],
  },
  {
    folder: "TextBlock",
    prose: true,
    get names() {
      return [...namesOf("TextBlock"), inlineNames()];
    },
    elements: () => [<TextBlockView key="default" primary="Primary" />, ...textBlockElements()],
  },
  {
    folder: "InlineHeader",
    prose: true,
    get names() {
      return [...namesOf("InlineHeader"), inlineNames()];
    },
    elements: () => [
      <InlineHeader key="both" heading="Heading" description="Description" />,
      <InlineHeader key="heading" heading="Heading" />,
      <InlineHeader key="description" description="Description" />,
      <InlineHeader key="empty" />,
    ],
  },
  {
    folder: "IconText",
    prose: true,
    get names() {
      return [
        ...namesOf("IconText"),
        { icon: "openui-icon-tag-icon" },
        ...[...tones, "inverted" as const].map((variant) =>
          composedNames(<IconTag icon={{ name: "star" }} variant={variant} size="l" />),
        ),
        ...(["xs", "sm"] as const).flatMap((size) =>
          (["text-subtext", "highlight-text-number-subtext"] as const).map((variant) =>
            composedNames(
              <TextBlockView primary="Title" secondary="Subtitle" variant={variant} size={size} />,
            ),
          ),
        ),
        inlineNames(),
      ];
    },
    clientOnly: ["openui-icon-tag-icon"],
    elements: () => [
      <IconText key="default" icon={{ name: "star" }} title="Title" />,
      ...(["horizontal", "vertical"] as const).flatMap((layout) =>
        [...tones, "inverted" as const, "filled" as const, "soft" as const].flatMap((iconVariant) =>
          [false, true].map((bold) => (
            <IconText
              key={`${layout}-${iconVariant}-${bold}`}
              icon={{ name: "star" }}
              title="Title"
              subtitle="Subtitle"
              layout={layout}
              iconVariant={iconVariant}
              bold={bold}
            />
          )),
        ),
      ),
    ],
  },
  {
    folder: "TagBlock",
    get names() {
      return [...namesOf("TagBlock"), ...namesOf("Tag"), ...namesOf("SharedBase")];
    },
    elements: () => [<TagBlock key="tags">{tagElements()}</TagBlock>],
  },
  {
    folder: "Separator",
    names: namesOf("Separator"),
    elements: () => [
      <Separator key="default" />,
      <Separator key="horizontal" orientation="horizontal" />,
      <Separator key="vertical" orientation="vertical" decorative={false} />,
    ],
  },
  {
    folder: "TextContentWrapper",
    prose: true,
    get names() {
      return [
        ...namesOf("TextContentWrapper"),
        ...namesOf("InlineHeader"),
        inlineNames(),
        ...(["clear", "card", "sunk"] as const).map((variant) =>
          composedNames(
            <MarkDownRenderer
              variant={variant}
              textMarkdown={wrapperText}
              options={{ remarkPlugins: [remarkGfm] }}
            />,
          ),
        ),
      ];
    },
    clientOnly: ["openui-text-content-wrapper-math"],
    elements: () => [
      <TextContentWrapper key="default" textMarkdown={wrapperText} />,
      ...(["clear", "card", "sunk"] as const).map((variant) => (
        <TextContentWrapper
          key={variant}
          variant={variant}
          textMarkdown={wrapperText}
          header={{ heading: "Heading", description: "Description" }}
        />
      )),
    ],
  },

  {
    folder: "SourceFaviconImage",
    names: namesOf("SourceFaviconImage"),
    elements: () => [
      <SourceFaviconImage
        key="image"
        {...source}
        url={source.faviconUrl}
        alt="Example"
        width={24}
        height={24}
      />,
      <SourceFaviconImage key="fallback" url="" alt="Example" width={20} height={20} />,
    ],
  },
  {
    folder: "Citation",
    get names() {
      return [...namesOf("Citation"), ...namesOf("SourceFaviconImage")];
    },
    clientOnly: [
      "openui-citation-icon",
      "openui-citation-tooltip",
      "openui-citation-tooltip-content",
    ],
    elements: () => [
      <Citation key="citation" sources={[source]} />,
      ...[source.url, undefined, "", " "].map((url, index) => (
        <CitationItem key={index} {...source} url={url} />
      )),
    ],
  },
  {
    folder: "Sources",
    get names() {
      return [
        ...namesOf("Sources"),
        ...namesOf("SourceFaviconImage"),
        composedNames(
          <Carousel variant="sunk" showButtons={false}>
            <CarouselContent />
          </Carousel>,
        ),
      ];
    },
    clientOnly: ["openui-sources-buttons"],
    elements: () => [
      <ListedSources key="list" sources={[source, { ...source, url: undefined }]} />,
      <CardSourceProvider key="context" sources={[source]}>
        <Sources />
      </CardSourceProvider>,
      ...[source.url, undefined, "", " "].map((url, index) => (
        <ListedSourceItem key={index} {...source} url={url} sourceId={index} />
      )),
    ],
  },
  {
    folder: "InlineMarkdownRenderer",
    // The composed MarkDownRenderer emits the pilot's accepted prose rules.
    prose: true,
    get names() {
      return [
        ...namesOf("InlineMarkdownRenderer"),
        composedNames(<MarkDownRenderer textMarkdown={inlineContent} />),
      ];
    },
    elements: () => [<InlineMarkdownRenderer key="inline" content={inlineContent} />],
  },
  {
    folder: "MarkDownRenderer",
    prose: true,
    // A getter, read only after the contract test has collected MarkDownRenderer's CSS: rendering
    // CodeBlock here at import would register IconButton's CSS (the copy button) too early.
    get names() {
      return [
        ...namesOf("MarkDownRenderer"),
        // Account for composed, still-allowlisted Table/CodeBlock parts separately from markdown
        // names. Read their classes through public exports so their own migrations can rename them.
        Object.fromEntries(
          [
            ...stableClassesIn(
              renderToString(
                <>
                  <CodeBlock language="text" codeString="Code" syntaxHighlighterClassName="" />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Head</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Cell</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </>,
              ),
            ),
          ].map((name, index) => [`dependency${index}`, name]),
        ),
      ];
    },
    elements: () =>
      ["clear", "card", "sunk"].map((variant) => (
        <MarkDownRenderer
          key={variant}
          variant={variant as "clear"}
          textMarkdown={markdown}
          options={{ remarkPlugins: [remarkGfm], urlTransform: (url) => url }}
        />
      )),
  },

  {
    folder: "Button",
    names: namesOf("Button"),
    elements: () =>
      product<string>(
        ["primary", "secondary", "tertiary"],
        ["extra-small", "small", "medium", "large"],
        ["default", "destructive"],
      ).map(([variant, size, tone]) => (
        <Button
          key={`${variant}-${size}-${tone}`}
          variant={variant as "primary"}
          size={size as "small"}
          tone={tone as "default"}
          iconLeft={<svg />}
          iconRight={<svg />}
        >
          Label
        </Button>
      )),
  },
  {
    folder: "IconButton",
    names: namesOf("IconButton"),
    elements: () =>
      product<string>(
        ["primary", "secondary", "tertiary"],
        ["3-extra-small", "2-extra-small", "extra-small", "small", "medium", "large"],
        ["square", "circle"],
        ["default", "destructive"],
      ).map(([variant, size, shape, tone]) => (
        <IconButton
          key={`${variant}-${size}-${shape}-${tone}`}
          variant={variant as "primary"}
          size={size as "small"}
          shape={shape as "square"}
          tone={tone as "default"}
          icon={<svg />}
          aria-label="Action"
        />
      )),
  },
  {
    folder: "Tabs",
    names: namesOf("Tabs"),
    // Scroll buttons appear only once the browser measures an overflowing list.
    clientOnly: [
      "openui-tabs-scroll-button-container-left",
      "openui-tabs-scroll-button-container-right",
      "openui-tabs-scroll-button",
      "openui-tabs-scroll-left",
      "openui-tabs-scroll-right",
    ],
    elements: () =>
      (["title", "iconTitle", "iconTitleSubtext", "imageTitle", "imageTitleSubtext"] as const).map(
        (variant) => (
          <Tabs key={variant} defaultValue="first">
            <TabsList variant={variant}>
              <TabsTrigger
                value="first"
                text="Overview"
                subtext="Details"
                icon={<svg />}
                image="image.png"
              />
              <TabsTrigger value="second" text="Activity" />
            </TabsList>
            <TabsContent value="first">Panel</TabsContent>
          </Tabs>
        ),
      ),
  },
];
