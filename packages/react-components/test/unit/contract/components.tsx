// Components converted to the flat styling convention, each rendered across every prop
// combination through public exports. Add a component here when it leaves the allowlist.
import {
  Button,
  Buttons,
  CodeBlock,
  FormControl,
  Hint,
  IconButton,
  Input,
  Label,
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
  TagBlock,
  TextArea,
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

// The three shared border-box users. Buttons and FormControl migrate in #91;
// TagBlock's owned styles remain allowlisted until #96.
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
