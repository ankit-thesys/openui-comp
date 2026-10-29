// Components converted to the flat styling convention, each rendered across every prop
// combination through public exports. Add a component here when it leaves the allowlist.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardHeader,
  CodeBlock,
  FoldableSectionContent,
  FoldableSectionItem,
  FoldableSectionRoot,
  FoldableSectionTrigger,
  IconButton,
  MarkDownRenderer,
  Modal,
  SectionV2,
  Separator,
  Steps,
  StepsItem,
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
  TooltipWrapper,
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
   * component generates without classes. Only MarkDownRenderer opts in.
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

export const migratedComponents: MigratedComponent[] = [
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
