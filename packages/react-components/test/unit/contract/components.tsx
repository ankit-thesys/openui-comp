// Every component's styling contract, each rendered across every prop combination through public
// exports. A new component gets an entry here; coverage.test.ts fails until it does.
import * as PublicCharts from "@openuidev/react-components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Buttons,
  Calendar,
  Callout,
  Card,
  CardHeader,
  CardSourceProvider,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CheckBoxGroup,
  CheckBoxItem,
  Chips,
  Citation,
  CitationItem,
  CodeBlock,
  CompositeCard,
  CompositeCardBlock,
  ContextCard,
  ContextCardBlock,
  DatePicker,
  DotMatrixLoader,
  EditableTable,
  EditableTableChangesBar,
  EntityList,
  FoldableSectionContent,
  FoldableSectionItem,
  FoldableSectionRoot,
  FoldableSectionTrigger,
  FormControl,
  Hint,
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
  Input,
  Label,
  LayoutContextProvider,
  ListBlock,
  ListItem,
  ListedSourceItem,
  ListedSources,
  MarkDownRenderer,
  MetricIndicatorInline,
  MetricIndicatorWithStrikethrough,
  Modal,
  OptionCards,
  OverviewCardBlock,
  PieChartSkeleton,
  RadioGroup,
  RadioItem,
  ScrollableTable,
  SectionV2,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Slider,
  SliderBlock,
  SnippetCardBlock,
  SourceFaviconImage,
  Sources,
  Steps,
  StepsItem,
  SwitchGroup,
  SwitchItem,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  TagBlock,
  TextArea,
  TextBlockView,
  TextCallout,
  TextContent,
  TextContentWrapper,
  ToggleGroup,
  ToggleItem,
  TooltipWrapper,
  VisualCard,
  VisualCardBlock,
} from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import remarkGfm from "remark-gfm";
import { readStableNames, type StableNames } from "../../../scripts/selector-reference.mjs";
import { cartesianChartElements } from "../../fixtures/cartesian-charts";
import { chartFoundationElements } from "../../fixtures/chart-foundations";
import { markdown } from "../../fixtures/markdown";
import { chartSlug, otherChartCases, otherCharts } from "../../fixtures/other-charts";
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

// The three shared border-box users also own flat rules after the #91 and #96 rollouts.
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

// #100 exercises the internal layout only through the public card blocks.
const cardLabel = <span style={{ font: "14px/21px sans-serif" }}>Card content</span>;
const compositeItem = {
  header: cardLabel,
  body: [cardLabel],
  footer: { price: cardLabel, button: <Button>Choose</Button> },
};
const contextItems = [undefined, "gray", "info", "success", "warning", "danger"].flatMap(
  (bgColor) =>
    ["Title", <Tag text="Tag" />].map((title) => ({
      title,
      body: "Body",
      bgColor: bgColor as "info",
    })),
);
const cardImage = "/card-blocks-image.svg";
const visualItem = {
  tag: <Tag text="Photo" />,
  // A block owns the line box as well as its text font; an inline span still shares
  // its parent's browser/preflight strut and changes the bottom panel's auto margin.
  body: <div style={{ font: "14px/21px sans-serif" }}>Card content</div>,
  bgImageSrc: cardImage,
};
const overviewItem = {
  top: cardLabel,
  bottom: { value: "42", subtext: "Items", trend: { direction: "up" as const, value: 2 } },
};
const snippetItems = [
  {
    lhs: <TextBlockView primary="Label" secondary="Details" />,
    rhs: <TextBlockView primary="42" secondary="Items" />,
  },
  { lhs: cardLabel },
];
const layoutElements = () =>
  (["grid", "carousel"] as const).flatMap((layout) =>
    [true, false].flatMap((responsive) => [
      <CompositeCardBlock items={[compositeItem]} layout={layout} responsive={responsive} />,
      <ContextCardBlock items={[{ title: "Context" }]} layout={layout} responsive={responsive} />,
      <VisualCardBlock items={[visualItem]} layout={layout} responsive={responsive} />,
      <OverviewCardBlock items={[{ top: cardLabel }]} layout={layout} responsive={responsive} />,
      <SnippetCardBlock items={[{ lhs: cardLabel }]} responsive={responsive} />,
    ]),
  );
const cardDependencyNames = (elements: ReactElement[]) => elements.map(composedNames);

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
    folder: "Charts",
    get names() {
      // Composed charts and controls keep their own contract entries. Only their rendered names
      // are accounted for here, like markdown's Table/CodeBlock dependencies.
      const dependencies = [
        ...stableClassesIn(
          [
            ...chartFoundationElements(),
            ...otherCharts.flatMap((chart) =>
              otherChartCases(PublicCharts, chart).map(({ element }) => element),
            ),
          ]
            .map((element) => renderToString(element))
            .join(""),
        ),
      ].filter((name) =>
        /^openui-(line-chart|bar-chart|horizontal-bar-chart|pie-chart|button|icon-button|separator)(-|$)/.test(
          name,
        ),
      );
      return [
        ...stableNames
          .filter(
            ({ component }) =>
              component === "Charts/shared" ||
              component.startsWith("Charts/shared/") ||
              component.startsWith("Charts/Mini") ||
              otherCharts.some(
                (chart) =>
                  component === `Charts/${chart}` || component.startsWith(`Charts/${chart}/`),
              ),
          )
          .map((entry) => entry.names),
        Object.fromEntries(dependencies.map((name, i) => [`dependency${i}`, name])),
      ];
    },
    elements: () => [
      ...chartFoundationElements(),
      ...otherCharts.flatMap((chart) =>
        otherChartCases(PublicCharts, chart).map(({ element }) => element),
      ),
    ],
    clientOnly: [
      "openui-radar-chart-hitbox",
      "openui-heatmap-chart-cell-label",
      "openui-heatmap-chart-cell-label--is-animation-active",
      "openui-chart-tooltip",
      "openui-chart-tooltip-portal",
      "openui-chart-tooltip-label",
      "openui-chart-tooltip-content",
      "openui-chart-tooltip-content-item",
      "openui-chart-tooltip-content-indicator",
      "openui-chart-tooltip-content-value-wrapper",
      "openui-chart-tooltip-content-label",
      "openui-chart-tooltip-content-value",
      "openui-chart-tooltip-content-item-separator",
      "openui-chart-tooltip-content-view-more",
      "openui-chart-tooltip-label-text",
      "openui-stacked-legend-header",
      "openui-stacked-legend-header-buttons",
      "openui-stacked-legend-header-title",
      "openui-stacked-legend-scroll-button",
    ],
  },
  {
    folder: "Skeleton",
    names: [...namesOf("Skeleton"), ...namesOf("SkeletonPulse")],
    elements: () => [
      <Skeleton key="default" />,
      <Skeleton key="custom" count={3} height="20px" width="80px" borderRadius="12px" />,
      <TableSkeleton key="table-default" />,
      <TableSkeleton key="table-custom" rows={2} columns={2} />,
      <PieChartSkeleton key="pie-default" />,
      ...(["pie", "donut"] as const).flatMap((variant) =>
        (["circular", "semiCircular"] as const).map((appearance) => (
          <PieChartSkeleton
            key={`${variant}-${appearance}`}
            variant={variant}
            appearance={appearance}
            size={120}
            legendItems={2}
          />
        )),
      ),
    ],
  },
  {
    folder: "DotMatrixLoader",
    names: namesOf("DotMatrixLoader"),
    elements: () => [
      <DotMatrixLoader key="default" />,
      <DotMatrixLoader key="compact" variant="compact" size={40} />,
    ],
  },
  {
    folder: "CodeBlock",
    get names() {
      return [
        ...namesOf("CodeBlock"),
        // Composed IconButton classes, observed through the public package after CSS collection.
        Object.fromEntries(
          [...stableClassesIn(renderToString(<CodeBlock language="text" codeString="x" />))]
            .filter((name) => name.startsWith("openui-icon-button"))
            .map((name, index) => [`dependency${index}`, name]),
        ),
      ];
    },
    elements: () => [
      <CodeBlock key="default" language="javascript" codeString="const x = 1;" />,
      <CodeBlock
        key="custom"
        language="text"
        codeString="x"
        className="app-code"
        syntaxHighlighterClassName="app-highlighter"
      />,
      <CodeBlock key="empty" language="text" codeString="x" syntaxHighlighterClassName="" />,
    ],
  },
  {
    folder: "Slider",
    // SliderBlock composes public Input/Select roots. Read only the classes those renders
    // expose, after collecting CSS, rather than claiming their portal parts as our own.
    get names() {
      return [
        ...namesOf("Slider"),
        Object.fromEntries(
          [
            ...stableClassesIn(
              renderToString(
                <>
                  <Input />
                  <Select>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </Select>
                </>,
              ),
            ),
          ].map((name, index) => [`dependency${index}`, name]),
        ),
      ];
    },
    elements: () => [
      ...(["continuous", "discrete"] as const).flatMap((variant) =>
        [false, true].flatMap((disabled) =>
          [false, true].map((range) => (
            <Slider
              key={`${variant}/${disabled}/${range}`}
              variant={variant}
              min={0}
              max={100}
              step={25}
              disabled={disabled}
              defaultValue={range ? [25, 75] : [0]}
              leftContent={<svg />}
              rightContent={<svg />}
            />
          )),
        ),
      ),
      ...(["continuous", "discrete"] as const).flatMap((variant) =>
        [false, true].flatMap((disabled) =>
          [false, true].map((range) => (
            <SliderBlock
              key={`block/${variant}/${disabled}/${range}`}
              label="Budget"
              variant={variant}
              min={0}
              max={100}
              step={25}
              disabled={disabled}
              defaultValue={range ? [25, 75] : [50]}
            />
          )),
        ),
      ),
      <SliderBlock
        key="error"
        label="Budget"
        variant="continuous"
        min={0}
        max={100}
        defaultValue={[-1, 75]}
      />,
      <SliderBlock
        key="streaming"
        label="Budget"
        variant="discrete"
        min={0}
        max={100}
        step={25}
        isStreaming
      />,
    ],
  },
  {
    folder: "DatePicker",
    names: namesOf("DatePicker"),
    clientOnly: [
      "openui-date-picker-calendar-content",
      "openui-date-picker-content",
      "openui-date-picker-menu",
      "openui-date-picker-calendar",
      "openui-date-picker-reference",
    ],
    elements: () => [
      <DatePicker key="default" />,
      <DatePicker key="single" mode="single" selectedSingleDate={new Date(2026, 9, 15)} />,
      <DatePicker
        key="range"
        mode="range"
        selectedRangeDates={{ from: new Date(2026, 9, 15), to: new Date(2026, 9, 18) }}
      />,
    ],
  },
  {
    folder: "Calendar",
    get names() {
      return [
        ...namesOf("Calendar"),
        Object.fromEntries(
          [
            ...stableClassesIn(
              renderToString(
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                </Select>,
              ),
            ),
          ].map((name, index) => [`dependency${index}`, name]),
        ),
      ];
    },
    clientOnly: [
      "openui-calendar-select-content-months",
      "openui-calendar-select-content-years",
      "openui-calendar-select-viewport",
      "openui-calendar-select-item",
    ],
    elements: () =>
      ["mobile", "fullscreen", "tray", "copilot"].flatMap((layout) =>
        ["single", "multiple", "range"].map((mode) => (
          <LayoutContextProvider key={`${layout}/${mode}`} layout={layout as "mobile"}>
            <Calendar
              mode={mode as "single"}
              month={new Date(2026, 9)}
              today={new Date(2026, 9, 10)}
              showWeekNumber
              footer={<span style={{ font: "inherit" }}>Details</span>}
            />
            <Calendar captionLayout="label" month={new Date(2026, 9)} />
          </LayoutContextProvider>
        )),
      ),
  },
  {
    folder: "Select",
    names: namesOf("Select"),
    clientOnly: [
      "openui-select-content",
      "openui-select-viewport",
      "openui-select-group",
      "openui-select-label",
      "openui-select-item",
      "openui-select-item--show-tick",
      "openui-select-item-check-wrapper",
      "openui-select-item-indicator",
      "openui-select-item-check-icon",
      "openui-select-item-text",
      "openui-select-item-text-value",
      "openui-select-separator",
      "openui-select-content--position-popper",
      "openui-select-content--position-item-aligned",
      ...["sm", "md", "lg"].map((size) => `openui-select-content--size-${size}`),
    ],
    elements: () =>
      [undefined, "sm", "md", "lg"].flatMap((size) =>
        ["popper", "item-aligned"].flatMap((position) =>
          [false, true].map((hideDropdownIcon) => (
            <Select
              key={`${size}/${position}/${hideDropdownIcon}`}
              size={size as "sm"}
              defaultValue="one"
            >
              <SelectTrigger
                type={undefined}
                hideDropdownIcon={hideDropdownIcon}
                data-bench-position={position}
              >
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent position={position as "popper"}>
                <SelectGroup>
                  <SelectLabel>Group</SelectLabel>
                  <SelectItem value="one" textValue="Detail">
                    One
                  </SelectItem>
                  <SelectItem value="two" showTick={false}>
                    Two
                  </SelectItem>
                  <SelectSeparator />
                </SelectGroup>
              </SelectContent>
            </Select>
          )),
        ),
      ),
  },
  {
    folder: "Chips",
    names: namesOf("Chips"),
    elements: () =>
      (["single", "multiple"] as const).flatMap((type) =>
        [false, true].map((disabled) => (
          <Chips
            key={`${type}-${disabled}`}
            type={type}
            disabled={disabled}
            selected={["a"]}
            items={[
              { value: "a", label: "Selected", icon: <svg /> },
              { value: "b", label: "Other", icon: <svg /> },
              { value: "c", label: "Disabled", disabled: true },
            ]}
          />
        )),
      ),
  },

  ...["ToggleGroup", "ToggleItem"].map((folder) => ({
    folder,
    names: [...namesOf("ToggleGroup"), ...namesOf("ToggleItem")],
    elements: () =>
      [false, true].map((disabled) => (
        <ToggleGroup
          key={String(disabled)}
          type="multiple"
          defaultValue={["a"]}
          disabled={disabled}
        >
          <ToggleItem value="a">Selected</ToggleItem>
          <ToggleItem value="b">Other</ToggleItem>
        </ToggleGroup>
      )),
  })),

  {
    folder: "SwitchItem",
    names: namesOf("SwitchItem"),
    elements: () =>
      [false, true].flatMap((checked) =>
        [false, true].map((disabled) => (
          <SwitchItem
            key={`${checked}-${disabled}`}
            checked={checked}
            disabled={disabled}
            label="Choice"
            description="Details"
          />
        )),
      ),
  },
  {
    folder: "SwitchGroup",
    names: [...namesOf("SwitchGroup"), ...namesOf("SwitchItem")],
    elements: () =>
      (["clear", "card", "sunk"] as const).map((variant) => (
        <SwitchGroup key={variant} variant={variant}>
          <SwitchItem checked label="Choice" description="Details" />
        </SwitchGroup>
      )),
  },

  ...["RadioGroup", "RadioItem"].map((folder) => ({
    folder,
    names: [...namesOf("RadioGroup"), ...namesOf("RadioItem")],
    elements: () =>
      (["clear", "card", "sunk"] as const).map((variant) => (
        <RadioGroup key={variant} variant={variant} defaultValue="a">
          <RadioItem value="a" label="Selected" description="Details" />
          <RadioItem value="b" disabled label="Disabled" description="Details" />
          <RadioItem value="c" label="Other" />
        </RadioGroup>
      )),
  })),

  {
    folder: "CheckBoxItem",
    names: namesOf("CheckBoxItem"),
    elements: () =>
      [false, true].flatMap((checked) =>
        [false, true].map((disabled) => (
          <CheckBoxItem
            key={`${checked}-${disabled}`}
            checked={checked}
            disabled={disabled}
            label="Choice"
            description="Details"
          />
        )),
      ),
  },
  {
    folder: "CheckBoxGroup",
    names: [...namesOf("CheckBoxGroup"), ...namesOf("CheckBoxItem")],
    elements: () =>
      (["clear", "card", "sunk"] as const).map((variant) => (
        <CheckBoxGroup key={variant} variant={variant}>
          <CheckBoxItem checked label="Choice" description="Details" />
        </CheckBoxGroup>
      )),
  },

  {
    folder: "Buttons",
    // Read composed Button classes after CSS collection, so this getter does not register
    // their styles before the contract renders. The browser benches use these elements too:
    // a bare <button> has only a UA background, which Tailwind is allowed to reset.
    get names() {
      return [
        ...namesOf("Buttons"),
        ...namesOf("SharedBase"),
        Object.fromEntries(
          [...stableClassesIn(renderToString(<Button>Action</Button>))].map((name, index) => [
            `dependency${index}`,
            name,
          ]),
        ),
      ];
    },
    elements: () => [
      <Buttons key="default">
        <Button>Action</Button>
      </Buttons>,
      ...(["horizontal", "vertical"] as const).map((variant) => (
        <Buttons key={variant} variant={variant}>
          <Button>Action</Button>
        </Buttons>
      )),
    ],
  },
  {
    folder: "FormControl",
    names: [...namesOf("FormControl"), ...namesOf("SharedBase")],
    elements: () => [
      <FormControl key="default">
        <Hint>Details</Hint>
      </FormControl>,
      ...[false, true].map((hasError) => (
        <FormControl key={String(hasError)} hasError={hasError}>
          <Hint>Details</Hint>
        </FormControl>
      )),
    ],
  },
  {
    folder: "Label",
    names: namesOf("Label"),
    elements: () => [
      <Label key="default">Name</Label>,
      ...[false, true].flatMap((disabled) =>
        [false, true].map((required) => (
          <Label key={`${disabled}/${required}`} disabled={disabled} required={required}>
            Name
          </Label>
        )),
      ),
    ],
  },
  {
    folder: "TextArea",
    names: namesOf("TextArea"),
    elements: () => [
      <TextArea key="default" />,
      ...[false, true].flatMap((hasError) =>
        [false, true].map((disabled) => (
          <TextArea key={`${hasError}/${disabled}`} hasError={hasError} disabled={disabled} />
        )),
      ),
    ],
  },
  {
    folder: "Input",
    names: namesOf("Input"),
    elements: () => [
      <Input key="default" />,
      ...(["small", "medium", "large"] as const).flatMap((size) =>
        [false, true].flatMap((hasError) =>
          [false, true].map((disabled) => (
            <Input
              key={`${size}/${hasError}/${disabled}`}
              size={size}
              hasError={hasError}
              disabled={disabled}
            />
          )),
        ),
      ),
    ],
  },
  {
    folder: "_shared",
    get names() {
      return [...namesOf("_shared"), ...cardDependencyNames(layoutElements())];
    },
    elements: layoutElements,
  },
  {
    folder: "CompositeCardBlock",
    get names() {
      return [
        ...namesOf("CompositeCardBlock"),
        ...cardDependencyNames([
          <CompositeCardBlock items={[compositeItem]} />,
          <CompositeCard item={compositeItem} clickable />,
        ]),
      ];
    },
    elements: () => [
      <CompositeCardBlock items={[compositeItem]} />,
      <CompositeCard item={compositeItem} clickable />,
    ],
  },
  {
    folder: "ContextCardBlock",
    prose: true,
    get names() {
      return [
        ...namesOf("ContextCardBlock"),
        ...cardDependencyNames([
          <ContextCardBlock items={contextItems} />,
          <ContextCard item={contextItems[0]!} clickable />,
        ]),
      ];
    },
    elements: () => [
      <ContextCardBlock items={contextItems} />,
      <ContextCard item={{ title: "Image", body: "Body", bgImageSrc: cardImage }} clickable />,
    ],
  },
  {
    folder: "VisualCardBlock",
    get names() {
      return [
        ...namesOf("VisualCardBlock"),
        ...cardDependencyNames([
          <VisualCardBlock items={[visualItem]} />,
          <VisualCard item={visualItem} clickable />,
        ]),
      ];
    },
    elements: () => [
      <VisualCardBlock items={[visualItem]} />,
      <VisualCard item={visualItem} clickable />,
    ],
  },
  {
    folder: "OverviewCardBlock",
    get names() {
      return [
        ...namesOf("OverviewCardBlock"),
        composedNames(<OverviewCardBlock items={[overviewItem]} />),
      ];
    },
    elements: () =>
      [false, true].map((clickable) => (
        <OverviewCardBlock items={[overviewItem]} clickable={clickable} onItemClick={() => {}} />
      )),
  },
  {
    folder: "SnippetCardBlock",
    prose: true,
    get names() {
      return [
        ...namesOf("SnippetCardBlock"),
        composedNames(<SnippetCardBlock items={snippetItems} />),
      ];
    },
    elements: () =>
      [false, true].map((clickable) => (
        <SnippetCardBlock items={snippetItems} clickable={clickable} onItemClick={() => {}} />
      )),
  },
  {
    folder: "OptionCards",
    prose: true,
    get names() {
      return [...namesOf("OptionCards"), inlineNames()];
    },
    elements: () =>
      ["single", "multiple"].map((type) => (
        <OptionCards
          type={type as "single"}
          selected={["selected", "selected-disabled"]}
          items={[
            { value: "default", title: "Default", subtitle: "Subtitle", topContent: cardLabel },
            {
              value: "image",
              title: "Image",
              topContentVariant: "image",
              topContent: <img src={source.faviconUrl} alt="Tile" />,
            },
            { value: "selected", title: "Selected" },
            { value: "disabled", title: "Disabled", disabled: true },
            { value: "selected-disabled", title: "Both", disabled: true },
          ]}
        />
      )),
  },

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
    folder: "TooltipWrapper",
    get names() {
      return [
        ...namesOf("TooltipWrapper"),
        // The caller supplies the trigger. Use a styled Button so the Tailwind bench
        // exercises a library background, rather than the browser's native button face.
        Object.fromEntries(
          [...stableClassesIn(renderToString(<Button>Show tooltip</Button>))].map((name, index) => [
            `dependency${index}`,
            name,
          ]),
        ),
      ];
    },
    clientOnly: [
      "openui-tooltip-wrapper",
      "openui-tooltip-wrapper-body",
      "openui-tooltip-wrapper-heading",
      "openui-tooltip-wrapper-text",
    ],
    elements: () => [
      <TooltipWrapper
        key="tooltip"
        tooltipHeading="Heading"
        tooltipContent="Content"
        delayDuration={0}
      >
        <Button data-tooltip-trigger>Show tooltip</Button>
      </TooltipWrapper>,
    ],
  },
  {
    folder: "Modal",
    names: namesOf("Modal"),
    clientOnly: [
      "openui-modal",
      "openui-modal-overlay",
      "openui-modal-content",
      "openui-modal-header",
      "openui-modal-title",
      "openui-modal-close",
      "openui-modal-close-icon",
      "openui-modal-body",
      "openui-modal--size-sm",
      "openui-modal--size-md",
      "openui-modal--size-lg",
    ],
    elements: () =>
      (["sm", "md", "lg"] as const).map((size) => (
        <Modal
          key={size}
          size={size}
          title="Title"
          open={typeof document !== "undefined"}
          onOpenChange={() => {}}
        >
          {/* The caller owns body typography. Keep the dialog's percentage translation
              independent of preflight's inherited font and line height. */}
          <div style={{ font: "16px/normal serif" }}>Body</div>
        </Modal>
      )),
  },
  {
    folder: "SectionBlock",
    get names() {
      return [
        ...namesOf("SectionBlock"),
        Object.fromEntries(
          [
            ...stableClassesIn(
              renderToString(
                <>
                  <Separator />
                  <IconButton size="3-extra-small" variant="secondary" icon={<svg />} />
                </>,
              ),
            ),
          ].map((name, index) => [`dependency${index}`, name]),
        ),
      ];
    },
    elements: () => [
      <SectionV2 key="section" trigger="Title">
        Body
      </SectionV2>,
      <FoldableSectionRoot key="foldable" type="multiple" defaultValue={["one"]}>
        {["one", "two"].map((value) => (
          <FoldableSectionItem key={value} value={value}>
            <FoldableSectionTrigger text="Title" />
            <FoldableSectionContent forceMount>
              {/* The caller owns body typography. Pin it so fit-content measures the same
                  content under preflight while all section declarations remain tested. */}
              <div style={{ font: "16px/normal serif" }}>Body</div>
            </FoldableSectionContent>
          </FoldableSectionItem>
        ))}
      </FoldableSectionRoot>,
    ],
  },
  {
    folder: "Accordion",
    names: namesOf("Accordion"),
    elements: () =>
      (["clear", "card", "sunk"] as const).map((variant) => (
        <Accordion key={variant} variant={variant} type="multiple" defaultValue={["one"]}>
          {["one", "two", "three"].map((value) => (
            <AccordionItem key={value} value={value}>
              <AccordionTrigger text="Title" icon={<svg />} />
              <AccordionContent forceMount>Body</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )),
  },
  {
    folder: "Steps",
    names: namesOf("Steps"),
    elements: () => [
      <Steps key="steps">
        <StepsItem title="First" details="Details" />
        <StepsItem title="Last" details="Details" number={7} />
      </Steps>,
    ],
  },
  {
    folder: "CardHeader",
    names: namesOf("CardHeader"),
    elements: () => [<CardHeader key="header" title="Title" subtitle="Subtitle" icon={<svg />} />],
  },
  {
    folder: "Card",
    names: namesOf("Card"),
    elements: () =>
      (["clear", "card", "sunk"] as const).flatMap((variant) =>
        (["standard", "full"] as const).map((width) => (
          <Card key={`${variant}-${width}`} variant={variant} width={width}>
            Body
          </Card>
        )),
      ),
  },
  ...["AreaChart", "BarChart", "HorizontalBarChart", "LineChart", "ScatterChart"].map(
    (family): MigratedComponent => ({
      folder: `Charts/${family}`,
      get names() {
        const module = family[0]!.toLowerCase() + family.slice(1);
        const own = stableNames
          .filter((entry) => entry.module === module)
          .map((entry) => entry.names);
        const prefix = `openui-${family.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).slice(1)}`;
        const dependencies = [
          ...stableClassesIn(
            cartesianChartElements(family)
              .map((element) => renderToString(element))
              .join(""),
          ),
        ].filter((name) => !name.startsWith(prefix));
        return [
          ...own,
          Object.fromEntries(dependencies.map((name, i) => [`dependency${i}`, name])),
        ];
      },
      elements: () => cartesianChartElements(family),
      clientOnly: ["AreaChart", "BarChart", "LineChart"].includes(family)
        ? [
            `openui-${family.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).slice(1)}-x-tick-angled`,
          ]
        : [],
    }),
  ),

  {
    folder: "MarkDownRenderer",
    prose: true,
    // A getter, read only after the contract test has collected MarkDownRenderer's CSS: rendering
    // CodeBlock here at import would register IconButton's CSS (the copy button) too early.
    get names() {
      return [
        ...namesOf("MarkDownRenderer"),
        // Account for composed Table/CodeBlock parts separately from markdown names. Read their
        // classes through public exports, so their own contracts stay the source of their names.
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
];

// Ticket #104: each chart also has a focused contract, including its public compositions.
// Dependencies are observed through public exports after CSS collection, as for markdown above.
export const otherChartContracts: MigratedComponent[] = otherCharts.map((chart) => ({
  folder: chart,
  elements: () => otherChartCases(PublicCharts, chart).map(({ element }) => element),
  get names() {
    const prefix = `openui-${chartSlug(chart)}`;
    const dependencies = [
      ...stableClassesIn(
        otherChartCases(PublicCharts, chart)
          .map(({ element }) => renderToString(element))
          .join(""),
      ),
    ].filter((name) => name !== prefix && !name.startsWith(`${prefix}-`));
    return [
      ...namesOf(`Charts/${chart}`),
      Object.fromEntries(dependencies.map((name, i) => [`dependency${i}`, name])),
    ];
  },
  clientOnly:
    chart === "RadarChart"
      ? ["openui-radar-chart-hitbox"]
      : chart === "HeatmapChart"
        ? [
            "openui-heatmap-chart-cell-label",
            "openui-heatmap-chart-cell-label--is-animation-active",
          ]
        : [],
}));
