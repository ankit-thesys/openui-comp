// Components converted to the flat styling convention, each rendered across every prop
// combination through public exports. Add a component here when it leaves the allowlist.
import {
  Button,
  CardSourceProvider,
  Carousel,
  CarouselContent,
  Citation,
  CitationItem,
  CodeBlock,
  EditableTable,
  EditableTableChangesBar,
  EntityList,
  IconButton,
  InlineMarkdownRenderer,
  ListBlock,
  ListedSourceItem,
  ListedSources,
  ListItem,
  MarkDownRenderer,
  MetricIndicatorInline,
  MetricIndicatorWithStrikethrough,
  ScrollableTable,
  SourceFaviconImage,
  Sources,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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

export const migratedComponents: MigratedComponent[] = [
  {
    folder: "ListItem",
    names: namesOf("ListItem"),
    elements: () =>
      (["number", "icon", "image"] as const).flatMap((variant) =>
        (["default", "small"] as const).flatMap((size) =>
          [false, true].flatMap((listHasSubtitle) =>
            [false, true].map((action) => (
              <ListItem
                key={`${variant}/${size}/${listHasSubtitle}/${action}`}
                variant={variant}
                size={size}
                listHasSubtitle={listHasSubtitle}
                title="First"
                subtitle={listHasSubtitle ? "Details" : undefined}
                icon={<svg width="16" height="16" />}
                image={{ src: source.faviconUrl, alt: "Item" }}
                onClick={action ? () => {} : undefined}
                actionLabel="View"
                actionIcon={<svg width="16" height="16" />}
              />
            )),
          ),
        ),
      ),
  },
  {
    folder: "ListBlock",
    names: [...namesOf("ListBlock"), ...namesOf("ListItem")],
    elements: () =>
      (["number", "icon", "image"] as const).flatMap((variant) =>
        (["default", "small"] as const).map((size) => (
          <ListBlock key={`${variant}/${size}`} variant={variant} size={size}>
            <ListItem
              title="First"
              subtitle="Details"
              icon={<svg />}
              image={{ src: source.faviconUrl, alt: "Item" }}
              onClick={() => {}}
              actionLabel="View"
              actionIcon={<svg />}
            />
            <ListItem
              title="Second"
              icon={<svg />}
              image={{ src: source.faviconUrl, alt: "Item" }}
            />
          </ListBlock>
        )),
      ),
  },
  {
    folder: "EntityList",
    prose: true,
    get names() {
      return [
        ...namesOf("EntityList"),
        composedNames(<InlineMarkdownRenderer content="**Name**" />),
      ];
    },
    elements: () =>
      (["default", "small"] as const).flatMap((size) =>
        (["text", "number"] as const).map((rightVariant) => (
          <EntityList
            key={`${size}/${rightVariant}`}
            size={size}
            header={{ left: "Key", right: "Value", rightVariant }}
            rows={[
              { left: "**Name**", right: "42", rightVariant },
              { left: "Next", right: "43", rightVariant },
            ]}
            footer={{ left: "Total", right: "85", rightVariant }}
          />
        )),
      ),
  },
  {
    folder: "MetricIndicator",
    names: namesOf("MetricIndicator"),
    elements: () =>
      [MetricIndicatorInline, MetricIndicatorWithStrikethrough].flatMap((Component) =>
        (["up", "down"] as const).flatMap((direction) =>
          [false, true].map((subtext) => (
            <Component
              key={`${Component.displayName}/${direction}/${subtext}`}
              value="42"
              previousValue="45"
              subtext={subtext ? "Sales" : undefined}
              trend={{ direction, value: 5 }}
            />
          )),
        ),
      ),
  },
  {
    folder: "Table",
    get names() {
      return [
        ...namesOf("Table"),
        composedNames(<IconButton icon={<svg />} size="small" variant="secondary" />),
      ];
    },
    clientOnly: ["openui-scrollable-table-control", "openui-scrollable-table-icon"],
    elements: () => [
      ...(["left", "center", "right"] as const).map((align) => (
        <Table key={align}>
          <TableHeader>
            <TableRow>
              <TableHead align={align} icon={<svg width="16" height="16" />}>
                Head
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell align={align}>Cell</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align={align}>Next</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell align={align}>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )),
      <ScrollableTable key="overflow" containerStyle={{ maxWidth: 240 }}>
        <TableHeader>
          <TableRow>
            {Array.from({ length: 8 }, (_, i) => (
              <TableHead key={i}>Column {i + 1}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {Array.from({ length: 8 }, (_, i) => (
              <TableCell key={i}>Cell {i + 1}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </ScrollableTable>,
      // SSR renders no measured controls; render the public dependency for name coverage too.
      <IconButton key="control" icon={<svg />} size="small" variant="secondary" />,
    ],
  },
  {
    folder: "EditableTable",
    get names() {
      return [
        ...namesOf("EditableTable"),
        composedNames(<EditableTableChangesBar changedCellCount={2} />),
      ];
    },
    clientOnly: [
      "openui-editable-table-scroll-control",
      "openui-editable-table-cell-input",
      "openui-editable-table-select-content",
      "openui-editable-table-select-viewport",
      "openui-editable-table-select-item",
      "openui-editable-table-select-check-wrapper",
      "openui-editable-table-select-check-icon",
      "openui-editable-table-select-item-text",
      "openui-editable-table-select-indicator",
    ],
    elements: () => [
      <div key="table" style={{ width: 240 }}>
        <EditableTable
          columns={[
            { key: "name", header: "Name", type: "text" },
            { key: "amount", header: "Amount", type: "number" },
            { key: "url", header: "URL", type: "url" },
            {
              key: "status",
              header: "Status",
              type: "select",
              options: [
                { value: "ready", label: "Ready" },
                { value: "pending", label: "Pending" },
              ],
            },
          ]}
          data={[
            { id: "1", name: "Ada", amount: 42, url: "https://example.com", status: "ready" },
            { id: "2", name: "Grace", amount: 43, url: "not a url", status: "pending" },
          ]}
        />
      </div>,
      <EditableTableChangesBar key="changes" changedCellCount={2} />,
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
          <Carousel variant="sunk">
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
