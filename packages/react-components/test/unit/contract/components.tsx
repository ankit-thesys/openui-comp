// Components converted to the flat styling convention, each rendered across every prop
// combination through public exports. Add a component here when it leaves the allowlist.
import {
  Button,
  Buttons,
  CheckBoxGroup,
  CheckBoxItem,
  Chips,
  CodeBlock,
  FormControl,
  IconButton,
  MarkDownRenderer,
  RadioGroup,
  RadioItem,
  SwitchGroup,
  SwitchItem,
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
  TagBlock,
  ToggleGroup,
  ToggleItem,
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

export const migratedComponents: MigratedComponent[] = [
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
