// Components converted to the flat styling convention, each rendered across every prop
// combination through public exports. Add a component here when it leaves the allowlist.
import {
  Button,
  CodeBlock,
  IconButton,
  MarkDownRenderer,
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
} from "@openuidev/react-components";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import remarkGfm from "remark-gfm";
import { readStableNames, type StableNames } from "../../../scripts/selector-reference.mjs";
import { cartesianChartElements } from "../../fixtures/cartesian-charts";
import { chartFoundationElements } from "../../fixtures/chart-foundations";
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
    folder: "Charts",
    get names() {
      // Unmigrated chart frames and composed controls keep their own contract. Only their
      // rendered names are accounted for here, like markdown's Table/CodeBlock dependencies.
      const dependencies = [
        ...stableClassesIn(
          chartFoundationElements()
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
              component.startsWith("Charts/Mini"),
          )
          .map((entry) => entry.names),
        Object.fromEntries(dependencies.map((name, i) => [`dependency${i}`, name])),
      ];
    },
    elements: chartFoundationElements,
    clientOnly: [
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
