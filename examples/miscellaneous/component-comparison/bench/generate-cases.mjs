import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { createParser, jsonToOpenUI } from "@openuidev/lang-core";
import { openuiChatLibrary as library } from "@openuidev/kits/react/chat/libs";
import { getThemePreset } from "../src/theme-presets.mjs";
import { demoSource, directExamples } from "../src/offline-fixture.mjs";
const legacy = JSON.parse(await fs.readFile(".generated/legacy.json", "utf8"));
const spec = JSON.parse(await fs.readFile(".generated/migrated.json", "utf8"));
if (
  !isDeepStrictEqual(legacy.components, spec.components) ||
  !isDeepStrictEqual(legacy.schema, spec.schema)
)
  throw Error("Registry mismatch");
const parser = createParser(spec.schema, spec.root);
const atlas = parser.parse(demoSource).root;
const direct = new Map(
  directExamples.map((c) => [c.name, parser.parse(c.source).root]),
);
const allowed = new Set(
  [...spec.components.Card.signature.matchAll(/\b[A-Z]\w*/g)].map((m) => m[0]),
);
allowed.delete("Card");
const names = Object.keys(spec.components);
const slug = (s) => s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
function nodes(value, ancestors = [], out = []) {
  if (!value || typeof value !== "object") return out;
  if (value.type === "element") {
    out.push({ node: value, ancestors });
    for (const v of Object.values(value.props))
      nodes(v, [...ancestors, value], out);
  } else if (Array.isArray(value))
    for (const v of value) nodes(v, ancestors, out);
  else for (const v of Object.values(value)) nodes(v, ancestors, out);
  return out;
}
const all = nodes(atlas);
function node(name) {
  return structuredClone(
    all.find((n) => n.node.typeName === name)?.node ?? direct.get(name),
  );
}
function card(children) {
  return {
    type: "element",
    typeName: "Card",
    statementId: "root",
    props: { children },
    partial: false,
  };
}
const parse = (source) => parser.parse(source).root;
const formNames = new Set([
  "Form",
  "FormControl",
  "Input",
  "TextArea",
  "Select",
  "SelectItem",
  "DatePicker",
  "Slider",
  "CheckBoxGroup",
  "CheckBoxItem",
  "RadioGroup",
  "RadioItem",
  "Chips",
  "ChipItem",
  "OptionCards",
  "OptionCard",
]);
function base(name) {
  if (direct.has(name)) {
    const n = structuredClone(direct.get(name));
    n.statementId = "root";
    return n;
  }
  if (name === "Card") return card([node("CardHeader"), node("TextContent")]);
  if (["Button", "Buttons"].includes(name))
    return parse(
      'root = Card([Buttons([Button("Bench action", @ToAssistant("Bench action"), "primary")])])',
    );
  if (name === "Icon") return card([node("IconButton")]);
  if (formNames.has(name)) {
    const form = node("Form");
    if (name !== "Form")
      form.props.fields = form.props.fields
        .filter((field) => nodes(field).some((n) => n.node.typeName === name))
        .slice(0, 1);
    return card([form]);
  }
  if (["SectionBlock", "SectionItem"].includes(name))
    return parse(
      'root = Card([SectionBlock([SectionItem("section", "Section example", [TextContent("Section content")])], false)])',
    );
  const found = all.find((n) => n.node.typeName === name);
  const ancestor = allowed.has(name)
    ? found.node
    : [...found.ancestors].reverse().find((n) => allowed.has(n.typeName));
  if (!ancestor) throw Error("No valid parent for " + name);
  return card([structuredClone(ancestor)]);
}
const defaults = {
  Card: "Offline component atlas",
  CardHeader: "Offline component atlas",
  TextContent: "Explore both panes.",
  MarkDownRenderer: "Markdown",
  Callout: "Callout",
  TextCallout: "TextCallout",
  CodeBlock: "const mode",
  Image: null,
  ImageBlock: null,
  ImageGallery: null,
  Separator: null,
  Table: "Chat",
  Col: "Chat",
  BarChart: null,
  LineChart: null,
  AreaChart: null,
  RadarChart: null,
  HorizontalBarChart: null,
  PieChart: null,
  RadialChart: null,
  SingleStackedBarChart: null,
  ScatterChart: null,
  Series: null,
  Point: null,
  ScatterSeries: null,
  Form: "Your name",
  FormControl: "Your name",
  Input: "Your name",
  TextArea: "Notes",
  Select: "Project",
  SelectItem: "Project",
  DatePicker: "Date",
  Slider: "Budget",
  CheckBoxGroup: "Checks",
  CheckBoxItem: "Checks",
  RadioGroup: "Priority",
  RadioItem: "Priority",
  Chips: "Tags",
  ChipItem: "Tags",
  OptionCards: "Kit",
  OptionCard: "Kit",
  Button: "Bench action",
  Buttons: "Bench action",
  ListBlock: "First item",
  ListItem: "First item",
  FollowUpBlock: "Log an offline follow-up",
  FollowUpItem: "Log an offline follow-up",
  SectionBlock: "Section content",
  SectionItem: "Section content",
  Tabs: "Overview tab",
  TabItem: "Overview tab",
  Accordion: "Overview tab",
  AccordionItem: "Overview tab",
  Steps: "Inspect",
  StepsItem: "Inspect",
  Carousel: "Carousel slide one",
  TagBlock: "Local",
  Tag: "Context tag",
  EntityList: "Mode",
  InlineHeader: "Lists and editing",
  Icon: null,
  IconButton: null,
  EditableTable: "Local item",
  Text: "IconText title",
  BoldText: "ImageText title",
  IconText: "IconText title",
  ImageText: "ImageText title",
  ImageTextLarge: "ImageTextLarge",
  MetricIndicatorInline: "Overview one",
  MetricIndicatorWithStrikethrough: "Composite body",
  SnippetCardBlock: "IconText title",
  SnippetCardItem: "IconText title",
  OverviewCardBlock: "Overview one",
  OverviewCardItem: "Overview one",
  ContextCardBlock: "Context tag",
  ContextCardItem: "Context tag",
  CompositeCardBlock: "Composite body",
  CompositeCardItem: "Composite body",
  VisualCardBlock: "Visual one",
  VisualCardItem: "Visual one",
  Label: "Direct Label example",
  Slice: null,
  SwitchGroup: "Notifications",
  SwitchItem: null,
};
const chartLabels = {
  BarChart: "Bar chart",
  LineChart: "Line chart",
  AreaChart: "Area chart",
  RadarChart: "Radar chart",
  HorizontalBarChart: "Horizontal bar chart",
  PieChart: "Pie chart",
  RadialChart: "Radial chart",
  ScatterChart: "Scatter chart",
};
function basicAssertions(name) {
  const a = [{ id: `${name}.no-notices`, kind: "noNotices", expected: 0 }];
  if (defaults[name])
    a.push({
      id: `${name}.content`,
      kind: "text",
      value: defaults[name],
      expected: true,
    });
  else if (chartLabels[name])
    a.push({
      id: `${name}.chart`,
      kind: "count",
      role: "img",
      name: chartLabels[name],
      expected: 1,
    });
  else if (["Slice", "SwitchItem"].includes(name))
    a.push({ id: `${name}.data-only`, kind: "empty", expected: true });
  else if (["Image", "ImageBlock", "ImageGallery"].includes(name))
    a.push({ id: `${name}.media`, kind: "count", selector: "img", minimum: 1 });
  else if (name === "Separator")
    a.push({
      id: `${name}.divider`,
      kind: "count",
      selector: ".openui-separator",
      minimum: 1,
    });
  else if (name === "Icon" || name === "IconButton")
    a.push({
      id: `${name}.button`,
      kind: "count",
      role: "button",
      name: "Log icon action",
      expected: 1,
    });
  else if (["Series"].includes(name))
    a.push({
      id: `${name}.parent-chart`,
      kind: "count",
      role: "img",
      name: "Bar chart",
      expected: 1,
    });
  else if (["Point", "ScatterSeries"].includes(name))
    a.push({
      id: `${name}.parent-chart`,
      kind: "count",
      role: "img",
      name: "Scatter chart",
      expected: 1,
    });
  else if (name === "SingleStackedBarChart")
    a.push({
      id: `${name}.bar`,
      kind: "count",
      selector: "[class*=single-stacked], [class*=segmented-bar]",
      minimum: 1,
    });
  return a;
}
const cases = [];
const ledger = [];
function add(c) {
  c.themePreset = { ...getThemePreset("default"), mode: "matrix" };
  c.steps ??= [];
  c.knownIssues ??= [];
  c.setup ??= {};
  c.environments = [
    "plain",
    "tailwind3-before",
    "tailwind3-after",
    "tailwind4-before",
    "tailwind4-after",
  ];
  c.chunkSchedule = {
    seed: 0,
    characters: 180,
    checkpoints: [0.5, 1],
    delayMs: 10,
  };
  c.version = createHash("sha256").update(JSON.stringify(c)).digest("hex");
  cases.push(c);
  return c;
}
function serialize(root) {
  return jsonToOpenUI(root, library);
}
const bySource = new Map();
for (const name of names) {
  const root = base(name);
  const source = serialize(root);
  const key = createHash("sha256").update(source).digest("hex");
  let c = bySource.get(key);
  if (!c) {
    c = add({
      id: slug(name) + "-default",
      name: `${name} · default composition`,
      source,
      coverage: [],
      assertions: [],
      deliveries: direct.has(name) ? ["instant"] : ["instant", "stream"],
    });
    bySource.set(key, c);
  }
  c.coverage.push(name);
  c.assertions.push(...basicAssertions(name));
  const checks = [
    {
      id: `${name}.default`,
      kind: "default",
      applicable: true,
      cases: [c.id],
      assertions: basicAssertions(name).map((a) => a.id),
    },
  ];
  const variants = [];
  for (const [prop, def] of Object.entries(
    spec.schema.$defs[name].properties,
  )) {
    if (def.enum) for (const value of def.enum) variants.push({ prop, value });
    else if (def.type === "boolean")
      for (const value of [false, true]) variants.push({ prop, value });
  }
  if (variants.length) {
    const roots = variants.map(({ prop, value }, i) => {
      const r = base(name);
      for (const { node: n } of nodes(r)) {
        if (n.typeName === name) n.props[prop] = value;
        if (typeof n.props.name === "string") n.props.name += `-v${i}`;
        delete n.statementId;
      }
      r.statementId = "root";
      return r;
    });
    if (direct.has(name)) {
      variants.forEach((variant, i) => {
        const v = add({
          id:
            slug(name) +
            `-${slug(variant.prop)}-${String(variant.value).toLowerCase()}`,
          name: `${name} · ${variant.prop}=${variant.value}`,
          source: serialize(roots[i]),
          coverage: [name],
          assertions: basicAssertions(name),
          deliveries: ["instant"],
          variant,
        });
        checks.push({
          id: `${name}.${variant.prop}.${variant.value}`,
          kind: "variant",
          applicable: true,
          cases: [v.id],
          assertions: v.assertions.map((a) => a.id),
        });
      });
    } else {
      const combined = card(
        roots.flatMap((r, i) => [
          {
            type: "element",
            typeName: "TextContent",
            props: {
              text: `Variant ${i + 1}: ${variants[i].prop}=${variants[i].value}`,
            },
            partial: false,
          },
          ...r.props.children,
        ]),
      );
      const v = add({
        id: slug(name) + "-variants",
        name: `${name} · public variants`,
        source: serialize(combined),
        coverage: [name],
        assertions: [
          { id: `${name}.variants-no-notices`, kind: "noNotices", expected: 0 },
          ...variants.map((x, i) => ({
            id: `${name}.${x.prop}.${x.value}`,
            kind: "text",
            value: `Variant ${i + 1}: ${x.prop}=${x.value}`,
            expected: true,
          })),
        ],
        deliveries: ["instant", "stream"],
        variants,
      });
      // Each variant is actually composed through the original public parent. At least one real parent/control must remain visible, separately from its label.
      const basic = basicAssertions(name).filter(
        (a) => !["noNotices", "count"].includes(a.kind),
      );
      v.assertions.push(...basic);
      for (const variant of variants)
        checks.push({
          id: `${name}.${variant.prop}.${variant.value}`,
          kind: "variant",
          applicable: true,
          cases: [v.id],
          assertions: [
            `${name}.${variant.prop}.${variant.value}`,
            `${name}.variants-no-notices`,
            ...basic.map((a) => a.id),
          ],
        });
    }
  }
  const arrays = Object.entries(spec.schema.$defs[name].properties)
    .filter(([, d]) => d.type === "array")
    .map(([p]) => p);
  const emptyEligible =
    allowed.has(name) && arrays.length && name !== "EditableTable";
  if (emptyEligible || name === "Card") {
    const r = base(name);
    for (const { node: n } of nodes(r))
      if (n.typeName === name)
        for (const prop of name === "Card" ? ["children"] : arrays)
          n.props[prop] = [];
    const e = add({
      id: slug(name) + "-empty",
      name: `${name} · empty`,
      source: serialize(r),
      coverage: [name],
      assertions: [
        { id: `${name}.empty-no-notices`, kind: "noNotices", expected: 0 },
        {
          id: `${name}.empty-output`,
          kind: name === "Form" ? "count" : "empty",
          ...(name === "Form"
            ? { selector: "input,textarea,[role=slider]", expected: 0 }
            : { expected: true }),
        },
      ],
      deliveries: ["instant", "stream"],
    });
    if (name === "FollowUpBlock")
      e.assertions = e.assertions
        .filter((a) => a.kind !== "empty")
        .concat([
          {
            id: "FollowUpBlock.no-items",
            kind: "count",
            selector: ".openui-follow-up-item",
            expected: 0,
          },
          {
            id: "FollowUpBlock.heading",
            kind: "text",
            value: "Related Queries",
            expected: true,
          },
        ]);
    if (name === "EntityList")
      e.assertions = e.assertions
        .filter((a) => a.kind !== "empty")
        .concat([
          {
            id: "EntityList.no-rows",
            kind: "text",
            value: "Mode",
            exact: true,
            expected: false,
          },
          {
            id: "EntityList.header-kept",
            kind: "text",
            value: "Measure",
            expected: true,
          },
        ]);
    if (name === "Form")
      e.assertions.push({
        id: "Form.empty-actions",
        kind: "text",
        value: "Log form values",
        expected: true,
      });
    checks.push({
      id: `${name}.empty`,
      kind: "empty",
      applicable: true,
      cases: [e.id],
      assertions: e.assertions.map((a) => a.id),
    });
  } else
    checks.push({
      id: `${name}.empty`,
      kind: "empty",
      applicable: !["Label", "Slice", "SwitchItem", "Point"].includes(name),
      reason: ["Label", "Slice", "SwitchItem", "Point"].includes(name)
        ? "No independent empty visual state in this registry entry; data helpers are observed through their parent."
        : "Parent-specific empty-state oracle not implemented yet.",
      cases: [],
      assertions: [],
    });
  for (const kind of ["loading", "error", "disabled", "keyboard", "actions"]) {
    const applicable = {
      loading: [
        "Table",
        "Image",
        "ImageBlock",
        "ImageGallery",
        "ImageText",
        "ImageTextLarge",
      ].includes(name),
      error: formNames.has(name) || ["Image", "ImageBlock"].includes(name),
      disabled:
        formNames.has(name) ||
        [
          "Button",
          "Buttons",
          "IconButton",
          "ChipItem",
          "OptionCard",
          "SwitchGroup",
          "SwitchItem",
        ].includes(name),
      keyboard:
        formNames.has(name) ||
        [
          "Button",
          "Buttons",
          "IconButton",
          "Tabs",
          "TabItem",
          "Accordion",
          "AccordionItem",
          "Carousel",
          "SwitchGroup",
          "SwitchItem",
          "FollowUpBlock",
          "FollowUpItem",
        ].includes(name),
      actions: [
        "Form",
        "Button",
        "Buttons",
        "IconButton",
        "FollowUpBlock",
        "FollowUpItem",
        "ListBlock",
        "ListItem",
        "CompositeCardBlock",
        "CompositeCardItem",
        "VisualCardBlock",
        "ContextCardBlock",
        "SnippetCardBlock",
      ].includes(name),
    }[kind];
    checks.push({
      id: `${name}.${kind}`,
      kind,
      applicable,
      reason: applicable
        ? "Requested behavior requires executed assertions; no static-presence credit."
        : "This registry entry exposes no independent " +
          kind +
          " state; parent interactions are listed separately.",
      cases: [],
      assertions: [],
    });
  }
  ledger.push({
    component: name,
    signature: spec.components[name].signature,
    direct: direct.has(name),
    checks,
  });
}
function behavior(c, requirements) {
  const added = add(c);
  for (const [components, kinds] of requirements)
    for (const component of components)
      for (const kind of kinds) {
        const check = ledger
          .find((l) => l.component === component)
          ?.checks.find((c) => c.kind === kind);
        if (check) {
          check.applicable = true;
          check.reason = "Explicit independent assertions in " + added.id;
          check.cases.push(added.id);
          check.assertions.push(...added.assertions.map((a) => a.id));
        }
      }
  return added;
}
const action = {
  type: "continue_conversation",
  params: {},
  humanFriendlyMessage: "Bench action",
  formState: {},
};
behavior(
  {
    id: "button-keyboard-action",
    name: "Button · keyboard, hover and exact action",
    source:
      'root = Card([Buttons([Button("Bench action", @ToAssistant("Bench action"), "primary")])])',
    coverage: ["Button", "Buttons"],
    deliveries: ["instant", "stream"],
    steps: [
      { op: "hover", role: "button", name: "Bench action" },
      { op: "key", role: "button", name: "Bench action", key: "Enter" },
    ],
    assertions: [
      { id: "button-action", kind: "actions", expected: [action] },
      {
        id: "button-focus",
        kind: "focused",
        role: "button",
        name: "Bench action",
        expected: true,
      },
    ],
  },
  [
    [
      ["Button", "Buttons"],
      ["keyboard", "actions"],
    ],
  ],
);
behavior(
  {
    id: "form-validation-submit",
    name: "Form · required error, keyboard and exact values",
    source:
      'root = Card([Form("bench-form", Buttons([Button("Submit", @ToAssistant("Submitted"), "primary")]), [FormControl("Name", Input("name", "Bench name", "text", {required:true}))])])',
    coverage: ["Form", "FormControl", "Input", "Button", "Buttons"],
    deliveries: ["instant", "stream"],
    steps: [
      { op: "click", role: "button", name: "Submit" },
      {
        op: "checkpoint",
        id: "required",
        assertions: [
          {
            id: "required-error",
            kind: "text",
            value: "This field is required",
            expected: true,
          },
          { id: "no-invalid-submit", kind: "actions", expected: [] },
        ],
      },
      { op: "fill", placeholder: "Bench name", value: "Ada 🧭" },
      { op: "key", role: "button", name: "Submit", key: "Enter" },
    ],
    assertions: [
      {
        id: "form-action",
        kind: "actions",
        expected: [
          {
            type: "continue_conversation",
            params: {},
            humanFriendlyMessage: "Submitted",
            formName: "bench-form",
            formState: { "bench-form": { name: { value: "Ada 🧭" } } },
          },
        ],
      },
      {
        id: "name-value",
        kind: "value",
        placeholder: "Bench name",
        expected: "Ada 🧭",
      },
    ],
  },
  [
    [
      ["Form", "FormControl", "Input"],
      ["error", "keyboard", "actions"],
    ],
  ],
);
behavior(
  {
    id: "checkbox-keyboard",
    name: "Checkbox · Space toggles checked state",
    source:
      'root = Card([Form("check", Buttons([Button("Submit", @ToAssistant("check"))]), [FormControl("Options", CheckBoxGroup("options", [CheckBoxItem("Updates", "Local", "updates", false)]))])])',
    coverage: ["CheckBoxGroup", "CheckBoxItem"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", role: "checkbox", key: "Space" }],
    assertions: [
      {
        id: "checkbox-checked",
        kind: "checked",
        role: "checkbox",
        expected: true,
      },
    ],
  },
  [[["CheckBoxGroup", "CheckBoxItem"], ["keyboard"]]],
);
behavior(
  {
    id: "switch-keyboard",
    name: "Switch · Space changes state",
    source:
      'root = SwitchGroup("switch", [SwitchItem("Updates", "Local", "updates", false)])',
    coverage: ["SwitchGroup", "SwitchItem"],
    deliveries: ["instant"],
    steps: [{ op: "key", role: "switch", name: "Updates", key: "Space" }],
    assertions: [
      {
        id: "switch-checked",
        kind: "checked",
        role: "switch",
        name: "Updates",
        expected: true,
      },
    ],
  },
  [[["SwitchGroup", "SwitchItem"], ["keyboard"]]],
);
behavior(
  {
    id: "textarea-keyboard",
    name: "TextArea · independent editable value",
    source:
      'root = Card([Form("notes", Buttons([Button("Submit", @ToAssistant("notes"))]), [FormControl("Notes", TextArea("notes", "Bench notes", 3))])])',
    coverage: ["TextArea"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "fill", placeholder: "Bench notes", value: "A local note" }],
    assertions: [
      {
        id: "textarea-value",
        kind: "value",
        placeholder: "Bench notes",
        expected: "A local note",
      },
    ],
  },
  [[["TextArea"], ["keyboard"]]],
);
behavior(
  {
    id: "select-keyboard",
    name: "Select · keyboard option selection",
    source:
      'root = Card([Form("select", Buttons([Button("Submit", @ToAssistant("select"))]), [FormControl("Project", Select("project", [SelectItem("chat", "Chat"),SelectItem("dashboard", "Dashboard")], "Choose project"))])])',
    coverage: ["Select", "SelectItem"],
    deliveries: ["instant", "stream"],
    steps: [
      { op: "key", role: "combobox", key: "Enter" },
      { op: "key", role: "option", name: "Dashboard", key: "Enter" },
    ],
    assertions: [
      { id: "select-value", kind: "text", value: "Dashboard", expected: true },
    ],
  },
  [[["Select", "SelectItem"], ["keyboard"]]],
);
behavior(
  {
    id: "slider-keyboard",
    name: "Slider · ArrowRight increases value",
    source:
      'root = Card([Form("slider", Buttons([Button("Submit", @ToAssistant("slider"))]), [FormControl("Budget", Slider("budget", "discrete", 0, 100, 10, [30], "Budget"))])])',
    coverage: ["Slider"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", role: "slider", key: "ArrowRight" }],
    assertions: [
      {
        id: "slider-value",
        kind: "attribute",
        role: "slider",
        attribute: "aria-valuenow",
        expected: "40",
      },
    ],
  },
  [[["Slider"], ["keyboard"]]],
);
behavior(
  {
    id: "tabs-accordion-keyboard",
    name: "Tabs + Accordion · hidden content and keyboard",
    source: serialize(base("Tabs")),
    coverage: ["Tabs", "TabItem", "Accordion", "AccordionItem"],
    deliveries: ["instant", "stream"],
    steps: [
      { op: "key", role: "tab", name: "Details tab", key: "Enter" },
      {
        op: "key",
        role: "button",
        name: "How does offline work?",
        key: "Enter",
      },
    ],
    assertions: [
      {
        id: "tab-content",
        kind: "text",
        value: "Details tab content",
        expected: true,
      },
      {
        id: "accordion-content",
        kind: "text",
        value: "Accordion answer: local playback, no API calls.",
        expected: true,
      },
    ],
  },
  [[["Tabs", "TabItem", "Accordion", "AccordionItem"], ["keyboard"]]],
);
behavior(
  {
    id: "carousel-scroll",
    name: "Carousel · reveal second slide",
    source: serialize(base("Carousel")),
    coverage: ["Carousel"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "scroll", text: "Carousel slide two" }],
    assertions: [
      {
        id: "carousel-second",
        kind: "text",
        value: "Carousel slide two",
        expected: true,
      },
    ],
  },
  [[["Carousel"], ["keyboard"]]],
);
behavior(
  {
    id: "followup-keyboard-action",
    name: "Follow-up · keyboard exact action",
    source: 'root = Card([FollowUpBlock([FollowUpItem("Bench action")])])',
    coverage: ["FollowUpBlock", "FollowUpItem"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", role: "button", name: "Bench action", key: "Enter" }],
    assertions: [
      { id: "followup-action", kind: "actions", expected: [action] },
    ],
  },
  [
    [
      ["FollowUpBlock", "FollowUpItem"],
      ["keyboard", "actions"],
    ],
  ],
);
behavior(
  {
    id: "image-error",
    name: "Image + ImageBlock · failed local asset",
    source:
      'root = Card([Image("Broken local image", "/assets/not-present.svg"), ImageBlock("/assets/not-present.svg", "Broken local block")])',
    coverage: ["Image", "ImageBlock"],
    deliveries: ["instant", "stream"],
    assertions: [
      { id: "images-broken", kind: "imageError", expected: 2 },
      {
        id: "error-state",
        kind: "count",
        selector: ".openui-image--error,.openui-image-block-wrapper--error",
        expected: 2,
      },
    ],
  },
  [[["Image", "ImageBlock"], ["error"]]],
);
behavior(
  {
    id: "image-block-loading",
    name: "ImageBlock · held local asset loading state",
    source:
      'root = Card([ImageBlock("/assets/landscape.svg?bench-loading=1", "Loading local block")])',
    coverage: ["ImageBlock"],
    deliveries: ["instant"],
    setup: { holdAssets: true },
    assertions: [
      { id: "image-pending", kind: "imagePending", expected: 1 },
      {
        id: "image-loader",
        kind: "count",
        selector: ".openui-image-block-loader",
        expected: 1,
      },
    ],
  },
  [[["ImageBlock"], ["loading"]]],
);
behavior(
  {
    id: "table-loading",
    name: "Table · pending local query skeleton",
    source:
      'rows = Query("benchRows", {})\nroot = Card([Table([Col("Name", rows.names)])])',
    coverage: ["Table", "Col"],
    deliveries: ["instant"],
    setup: { pendingQuery: true },
    assertions: [
      {
        id: "query-skeleton",
        kind: "count",
        selector: ".openui-skeleton-table",
        minimum: 1,
      },
    ],
  },
  [[["Table"], ["loading"]]],
);
// Explicit state/interaction recipes; no assertions learned from the migrated output.
const defaultCase = (name) =>
  cases.find((c) => c.coverage.includes(name) && c.id.endsWith("-default"));
function bind(component, kind, c) {
  const check = ledger
    .find((l) => l.component === component)
    .checks.find((c) => c.kind === kind);
  Object.assign(check, {
    applicable: true,
    reason: "Independent assertions in " + c.id,
    cases: [c.id],
    assertions: c.assertions.map((a) => a.id),
  });
}
function na(component, kind, reason) {
  const check = ledger
    .find((l) => l.component === component)
    .checks.find((c) => c.kind === kind);
  if (!check.cases.length) Object.assign(check, { applicable: false, reason });
}
for (const l of ledger) {
  const properties = spec.schema.$defs[l.component].properties;
  if (
    !properties.rules &&
    !["Form", "FormControl", "Image", "ImageBlock"].includes(l.component)
  )
    na(
      l.component,
      "error",
      "No error/validation prop on this data-only entry; the owning form or media parent owns error presentation.",
    );
  if (l.component === "Slider")
    na(
      l.component,
      "empty",
      "Slider always has a numeric min/max and thumb; no empty-value UI is exposed by this registry.",
    );
  if (l.component === "Separator")
    na(
      l.component,
      "empty",
      "Separator is a decorative geometry primitive; its orientation/decorative variants are covered, with no content to empty.",
    );
  if (l.component === "Icon")
    na(
      l.component,
      "empty",
      "Icon resolves a named icon or category fallback; no empty visual state is exposed.",
    );
  if (
    [
      "Col",
      "Series",
      "ScatterSeries",
      "Point",
      "SelectItem",
      "CheckBoxItem",
      "RadioItem",
      "ChipItem",
      "OptionCard",
      "SwitchItem",
      "SnippetCardItem",
      "OverviewCardItem",
      "CompositeCardItem",
      "VisualCardItem",
    ].includes(l.component)
  )
    na(
      l.component,
      "empty",
      "Data-only helper returns null alone; empty collection/selection is exercised through its valid owning parent, not fabricated as standalone UI.",
    );
}
const stringProps = {
  Label: ["text"],
  CardHeader: ["title", "subtitle"],
  TextContent: ["text"],
  MarkDownRenderer: ["textMarkdown"],
  Callout: ["title", "description"],
  TextCallout: ["title", "description"],
  CodeBlock: ["codeString"],
  Button: ["label"],
  FollowUpItem: ["text"],
  SectionItem: ["trigger"],
  TabItem: ["trigger"],
  AccordionItem: ["trigger"],
  StepsItem: ["title", "details"],
  Tag: ["text"],
  InlineHeader: ["heading", "description"],
  Text: ["value", "subtext"],
  BoldText: ["value", "subtext"],
  IconText: ["title", "subtitle"],
  ImageText: ["title", "subtitle"],
  ImageTextLarge: ["title", "subtitle"],
  MetricIndicatorInline: ["value", "subtext"],
  MetricIndicatorWithStrikethrough: ["value", "subtext", "previousValue"],
  ListItem: ["title", "subtitle"],
};
for (const [component, props] of Object.entries(stringProps)) {
  const r = base(component),
    removed = [];
  for (const { node: n } of nodes(r))
    if (n.typeName === component)
      for (const prop of props)
        if (typeof n.props[prop] === "string" && n.props[prop]) {
          removed.push(n.props[prop]);
          n.props[prop] = "";
        }
  if (!removed.length) continue;
  const c = add({
    id: slug(component) + "-empty-content",
    name: component + " · empty content (negative semantics remain visible)",
    source: serialize(r),
    coverage: [component],
    deliveries: direct.has(component) ? ["instant"] : ["instant", "stream"],
    assertions: [
      { id: component + ".empty-notices", kind: "noNotices", expected: 0 },
      ...removed.map((value, i) => ({
        id: component + ".empty-text-" + i,
        kind: "text",
        value,
        exact: true,
        ...(component === "IconText"
          ? { selector: ".openui-icon-text" }
          : component === "ImageText"
            ? { selector: ".openui-image-text" }
            : {}),
        expected: false,
      })),
    ],
  });
  bind(component, "empty", c);
}
const fields = {
  Input: {
    selector: "input[type=text]",
    assertion: { kind: "value", placeholder: "Offline name", expected: "" },
  },
  TextArea: {
    selector: "textarea",
    assertion: { kind: "value", placeholder: "Offline notes", expected: "" },
  },
  Select: {
    selector: "[role=combobox]",
    assertion: {
      kind: "attribute",
      role: "combobox",
      attribute: "data-placeholder",
      expected: "",
    },
  },
  DatePicker: {
    selector: "button",
    assertion: { kind: "text", value: "Select a date", expected: true },
  },
  CheckBoxGroup: {
    selector: "[role=checkbox]",
    assertion: {
      kind: "count",
      selector: "[role=checkbox][aria-checked=true]",
      expected: 0,
    },
  },
  RadioGroup: {
    selector: "[role=radio]",
    assertion: {
      kind: "count",
      selector: "[role=radio][aria-checked=true]",
      expected: 0,
    },
  },
  Chips: {
    selector: "[role=option]",
    assertion: {
      kind: "count",
      selector: "[role=option][aria-selected=true]",
      expected: 0,
    },
  },
  OptionCards: {
    selector: "[role=radio],[role=checkbox]",
    assertion: {
      kind: "count",
      selector:
        "[role=radio][aria-checked=true],[role=checkbox][aria-checked=true]",
      expected: 0,
    },
  },
};
for (const [component, recipe] of Object.entries(fields)) {
  const r = base(component);
  for (const { node: n } of nodes(r)) {
    if (n.typeName === component) {
      delete n.props.value;
      delete n.props.defaultValue;
    }
    if (n.typeName === "RadioGroup") n.props.defaultValue = "";
    if (n.typeName === "CheckBoxItem") n.props.defaultChecked = false;
    if (n.typeName === "Chips") n.props.defaultValue = [];
    if (n.typeName === "OptionCards") n.props.defaultValue = "";
  }
  const c = add({
    id: slug(component) + "-empty-value",
    name: component + " · empty value/selection",
    source: serialize(r),
    coverage: [component],
    deliveries: ["instant", "stream"],
    assertions: [
      { id: component + ".empty-value", ...recipe.assertion },
      {
        id: component + ".empty-control-present",
        kind: "count",
        selector: recipe.selector,
        minimum: 1,
      },
    ],
  });
  bind(component, "empty", c);
  if (component === "Input") bind("FormControl", "empty", c);
}
for (const component of [
  "Chips",
  "OptionCards",
  "CheckBoxGroup",
  "RadioGroup",
]) {
  const r = base(component);
  for (const { node: n } of nodes(r))
    if (n.typeName === component) for (const p of ["items"]) n.props[p] = [];
  const c = add({
    id: slug(component) + "-empty-options",
    name: component + " · empty options",
    source: serialize(r),
    coverage: [component],
    deliveries: ["instant", "stream"],
    assertions: [
      {
        id: component + ".empty-options",
        kind: "count",
        selector:
          component === "Chips"
            ? "[role=option]"
            : component === "CheckBoxGroup"
              ? "[role=checkbox]"
              : "[role=radio],[role=checkbox]",
        expected: 0,
      },
      {
        id: component + ".empty-options-form",
        kind: "count",
        role: "form",
        expected: 1,
      },
    ],
  });
}
const switchEmpty = add({
  id: "switch-group-empty",
  name: "SwitchGroup · empty items",
  source: 'root = SwitchGroup("empty", [])',
  coverage: ["SwitchGroup"],
  deliveries: ["instant"],
  assertions: [{ id: "SwitchGroup.empty", kind: "empty", expected: true }],
});
bind("SwitchGroup", "empty", switchEmpty);
const switchDisabled = add({
  id: "switch-group-disabled-context",
  name: "SwitchGroup · disabled Renderer context (non-streamed)",
  source: serialize(base("SwitchGroup")),
  coverage: ["SwitchGroup", "SwitchItem"],
  deliveries: ["instant"],
  setup: { isStreaming: true },
  assertions: [
    {
      id: "SwitchGroup.disabled",
      kind: "allDisabled",
      selector: "[role=switch]",
      expected: true,
    },
  ],
});
bind("SwitchGroup", "disabled", switchDisabled);
bind("SwitchItem", "disabled", switchDisabled);
const editableEmpty = add({
  id: "editable-table-empty-data",
  name: "EditableTable · empty rows retain column headers",
  source:
    'root = Card([EditableTable("empty", [{type:"text",key:"name",header:"Name"}], [])])',
  coverage: ["EditableTable"],
  deliveries: ["instant", "stream"],
  assertions: [
    {
      id: "EditableTable.empty-table",
      kind: "count",
      selector: "table",
      expected: 1,
    },
    {
      id: "EditableTable.empty-header",
      kind: "text",
      value: "Name",
      expected: true,
    },
    {
      id: "EditableTable.no-old-row",
      kind: "text",
      value: "Local item",
      expected: false,
    },
  ],
});
bind("EditableTable", "empty", editableEmpty);
for (const component of ["Image", "ImageBlock"]) {
  const source =
    component === "Image"
      ? 'root = Card([Image("Empty image")])'
      : 'root = Card([ImageBlock("", "Empty block")])';
  const c = add({
    id: slug(component) + "-empty-src",
    name: component + " · empty source",
    source,
    coverage: [component],
    deliveries: ["instant", "stream"],
    assertions: [
      {
        id: component + ".empty-src",
        kind: component === "Image" ? "count" : "empty",
        ...(component === "Image"
          ? { selector: "img", expected: 1 }
          : { expected: true }),
      },
    ],
  });
  bind(component, "empty", c);
}
const accordionEmpty = add({
  id: "accordion-empty-items",
  name: "Accordion · empty items in a valid Tab",
  source: 'root = Card([Tabs([TabItem("details","Details",[Accordion([])])])])',
  coverage: ["Accordion", "AccordionItem"],
  deliveries: ["instant", "stream"],
  assertions: [
    {
      id: "Accordion.no-triggers",
      kind: "count",
      selector: "[data-radix-collection-item][aria-expanded]",
      expected: 0,
    },
    {
      id: "Accordion.parent-tab",
      kind: "count",
      role: "tab",
      name: "Details",
      expected: 1,
    },
  ],
});
bind("Accordion", "empty", accordionEmpty);
na(
  "AccordionItem",
  "empty",
  "Data-only item requires trigger/content; empty collection is owned and tested by Accordion.",
);
const contextEmpty = add({
  id: "context-card-item-empty-content",
  name: "ContextCardItem · empty title/body",
  source:
    'root = Card([ContextCardBlock([ContextCardItem("empty", "", "", "gray"), ContextCardItem("other","Another card","Other body","gray")])])',
  coverage: ["ContextCardItem"],
  deliveries: ["instant", "stream"],
  assertions: [
    {
      id: "ContextCardItem.other-preserved",
      kind: "text",
      value: "Another card",
      expected: true,
    },
    {
      id: "ContextCardItem.no-default-title",
      kind: "text",
      value: "Context tag",
      expected: false,
    },
  ],
});
bind("ContextCardItem", "empty", contextEmpty);
const iconEmpty = add({
  id: "icon-button-empty-label",
  name: "IconButton · empty accessible label (negative)",
  source:
    'root = Card([IconButton("", Icon("plus","general"), @ToAssistant("Bench action"))])',
  coverage: ["IconButton"],
  deliveries: ["instant", "stream"],
  assertions: [
    {
      id: "IconButton.present-empty-label",
      kind: "count",
      role: "button",
      name: "",
      expected: 1,
    },
  ],
});
bind("IconButton", "empty", iconEmpty);
for (const component of [
  "TextArea",
  "Select",
  "DatePicker",
  "Slider",
  "CheckBoxGroup",
  "RadioGroup",
  "Chips",
  "OptionCards",
]) {
  const r = base(component);
  for (const { node: n } of nodes(r)) {
    if (n.typeName === component) {
      n.props.rules = component === "Slider" ? { min: 40 } : { required: true };
      delete n.props.value;
      delete n.props.defaultValue;
    }
    if (["CheckBoxItem"].includes(n.typeName)) n.props.defaultChecked = false;
    if (n.typeName === "RadioGroup") n.props.defaultValue = "";
    if (n.typeName === "Chips") n.props.defaultValue = [];
    if (n.typeName === "OptionCards") n.props.defaultValue = "";
  }
  const c = behavior(
    {
      id: slug(component) + "-validation-error",
      name: component + " · explicit invalid/required submission",
      source: serialize(r),
      coverage: [component, "FormControl"],
      deliveries: ["instant", "stream"],
      steps: [
        ...(component === "Slider"
          ? [{ op: "key", role: "slider", key: "ArrowRight" }]
          : []),
        { op: "click", role: "button", name: "Log form values" },
      ],
      assertions: [
        {
          id: component + ".validation-error",
          kind: "text",
          value: component === "Slider" ? "40" : "required",
          expected: true,
        },
        { id: component + ".invalid-no-action", kind: "actions", expected: [] },
      ],
    },
    [[[component], ["error"]]],
  );
}
behavior(
  {
    id: "radio-keyboard",
    name: "RadioGroup · ArrowRight changes checked item",
    source: serialize(base("RadioGroup")),
    coverage: ["RadioGroup", "RadioItem"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", role: "radio", index: 0, key: "ArrowRight" }],
    assertions: [
      {
        id: "RadioGroup.checked",
        kind: "checked",
        role: "radio",
        index: 1,
        expected: true,
      },
    ],
  },
  [[["RadioGroup", "RadioItem"], ["keyboard"]]],
);
behavior(
  {
    id: "chips-keyboard",
    name: "Chips · keyboard toggles selection",
    source: serialize(base("Chips")),
    coverage: ["Chips", "ChipItem"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", role: "option", name: "Dashboard", key: "Enter" }],
    assertions: [
      {
        id: "Chips.selected",
        kind: "attribute",
        role: "option",
        name: "Dashboard",
        attribute: "aria-selected",
        expected: "true",
      },
    ],
  },
  [[["Chips", "ChipItem"], ["keyboard"]]],
);
behavior(
  {
    id: "option-cards-keyboard",
    name: "OptionCards · keyboard updates checked state",
    source: serialize(base("OptionCards")),
    coverage: ["OptionCards", "OptionCard"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", role: "radio", index: 1, key: "Enter" }],
    assertions: [
      {
        id: "OptionCards.checked",
        kind: "checked",
        role: "radio",
        index: 1,
        expected: true,
      },
    ],
  },
  [[["OptionCards", "OptionCard"], ["keyboard"]]],
);
behavior(
  {
    id: "date-picker-keyboard",
    name: "DatePicker · keyboard opens calendar and Escape closes",
    source: serialize(base("DatePicker")),
    coverage: ["DatePicker"],
    deliveries: ["instant", "stream"],
    steps: [
      {
        op: "key",
        selector: ".openui-date-picker-renderer-floating-input-container",
        key: "Enter",
      },
      {
        op: "checkpoint",
        assertions: [
          { id: "DatePicker.open", kind: "count", role: "grid", minimum: 1 },
        ],
      },
      {
        op: "key",
        selector: ".openui-date-picker-renderer-floating-input-container",
        key: "Escape",
      },
    ],
    assertions: [
      { id: "DatePicker.closed", kind: "count", role: "grid", expected: 0 },
    ],
  },
  [[["DatePicker"], ["keyboard"]]],
);
behavior(
  {
    id: "icon-button-keyboard-action",
    name: "IconButton · keyboard exact action",
    source:
      'root = Card([IconButton("Bench icon",Icon("plus","general"),@ToAssistant("Bench action"))])',
    coverage: ["IconButton", "Icon"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", role: "button", name: "Bench icon", key: "Enter" }],
    assertions: [
      { id: "IconButton.action", kind: "actions", expected: [action] },
    ],
  },
  [[["IconButton"], ["keyboard", "actions"]]],
);
behavior(
  {
    id: "list-item-action",
    name: "ListItem · keyboard exact action",
    source:
      'root = Card([ListBlock([ListItem("Bench list", "Local item", null, "Log", @ToAssistant("Bench action"))])])',
    coverage: ["ListBlock", "ListItem"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", selector: "[role=button]", key: "Enter" }],
    assertions: [
      { id: "ListItem.action", kind: "actions", expected: [action] },
    ],
  },
  [[["ListBlock", "ListItem"], ["actions"]]],
);
const cardRecipes = [
  {
    name: "SnippetCardBlock",
    source:
      'root = Card([SnippetCardBlock([SnippetCardItem("one",IconText(Icon("check","general"),"neutral","m","Card one","Subtitle"),Text("number","24")),SnippetCardItem("two",IconText(Icon("check","general"),"neutral","m","Card two"),Text("number","18"))],"grid",true,@ToAssistant("Bench action"))])',
    context: {
      itemIndex: 0,
      itemId: "one",
      itemTitle: "Card one",
      itemSubtitle: "Subtitle",
      itemValue: "24",
    },
  },
  {
    name: "OverviewCardBlock",
    source:
      'root = Card([OverviewCardBlock([OverviewCardItem("one",Text("text","Card one"),MetricIndicatorInline("24")),OverviewCardItem("two",Text("text","Card two"),MetricIndicatorInline("18"))],"grid",true,@ToAssistant("Bench action"))])',
    context: {
      itemIndex: 0,
      itemId: "one",
      itemTitle: "Card one",
      itemMetricValue: "24",
    },
  },
  {
    name: "ContextCardBlock",
    source:
      'root = Card([ContextCardBlock([ContextCardItem("one","Card one","Body","gray"),ContextCardItem("two","Card two","Body two","gray")],"grid",true,@ToAssistant("Bench action"))])',
    context: {
      itemIndex: 0,
      itemId: "one",
      itemTitle: "Card one",
      itemBody: "Body",
      itemBgColor: "gray",
    },
  },
  {
    name: "CompositeCardBlock",
    source:
      'root = Card([CompositeCardBlock([CompositeCardItem("one",Text("text","Card one"),[Text("text","Body")]),CompositeCardItem("two",Text("text","Card two"),[Text("text","Other body")])],"grid",true,@ToAssistant("Bench action"))])',
    context: {
      itemIndex: 0,
      itemId: "one",
      itemHeaderTitle: "Card one",
      itemBodyCount: 1,
    },
  },
  {
    name: "VisualCardBlock",
    source:
      'root = Card([VisualCardBlock([VisualCardItem(BoldText("text","Card one","Subtitle"),"one","/assets/landscape.svg",Tag("Local"),"Landscape"),VisualCardItem(BoldText("text","Card two"),"two","/assets/landscape.svg",Tag("Other"),"Landscape")],"grid",true,@ToAssistant("Bench action"))])',
    context: {
      itemIndex: 0,
      itemId: "one",
      itemTag: "Local",
      itemBody: "Card one",
      itemBodySubtext: "Subtitle",
      itemBgImageSrc: "/assets/landscape.svg",
      itemBgImageAlt: "Landscape",
    },
  },
];
for (const recipe of cardRecipes) {
  const item = recipe.name.replace("Block", "Item");
  behavior(
    {
      id: slug(recipe.name) + "-action",
      name: recipe.name + " · exact item context and keyboard action",
      source: recipe.source,
      coverage: [recipe.name, item],
      deliveries: ["instant", "stream"],
      steps: [{ op: "key", selector: "[role=button]", key: "Enter" }],
      assertions: [
        {
          id: recipe.name + ".action",
          kind: "actions",
          expected: [
            {
              ...action,
              params: {
                context: "Selected item: " + JSON.stringify(recipe.context),
              },
            },
          ],
        },
      ],
    },
    [[[recipe.name, item], ["actions"]]],
  );
}
// Hold only local media requests. Loading itself is observed before release.
for (const component of [
  "Image",
  "ImageGallery",
  "ImageText",
  "ImageTextLarge",
]) {
  const r = base(component);
  function change(v) {
    if (!v || typeof v !== "object") return;
    for (const [k, value] of Object.entries(v)) {
      if (k === "src" && typeof value === "string")
        v[k] = value + "?bench-loading=1";
      else change(value);
    }
  }
  change(r);
  behavior(
    {
      id: slug(component) + "-loading",
      name: component + " · pending local media",
      source: serialize(r),
      coverage: [component],
      deliveries: ["instant"],
      setup: { holdAssets: true },
      assertions: [
        { id: component + ".pending", kind: "imagePending", minimum: 1 },
      ],
    },
    [[[component], ["loading"]]],
  );
}

behavior(
  {
    id: "code-copy-keyboard",
    name: "CodeBlock · keyboard copies exact text",
    source: 'root = Card([CodeBlock("javascript", "const exact = 42;")])',
    coverage: ["CodeBlock"],
    deliveries: ["instant", "stream"],
    setup: { clipboard: true },
    steps: [{ op: "key", role: "button", name: "Copy code", key: "Enter" }],
    assertions: [
      {
        id: "CodeBlock.copy",
        kind: "clipboardText",
        expected: "const exact = 42;",
      },
    ],
  },
  [[["CodeBlock"], ["keyboard", "actions"]]],
);
behavior(
  {
    id: "editable-table-keyboard-edit",
    name: "EditableTable · edit and commit with Enter",
    source:
      'root = Card([EditableTable("edit",[{type:"text",key:"name",header:"Name"}],[{id:"row",values:["Before"]}])])',
    coverage: ["EditableTable"],
    deliveries: ["instant", "stream"],
    steps: [
      { op: "dblclick", text: "Before" },
      { op: "fill", selector: "input", value: "After" },
      { op: "key", selector: "input", key: "Enter" },
    ],
    assertions: [
      {
        id: "EditableTable.edited",
        kind: "text",
        value: "After",
        expected: true,
      },
      {
        id: "EditableTable.old-value-gone",
        kind: "text",
        value: "Before",
        expected: false,
      },
    ],
  },
  [[["EditableTable"], ["keyboard"]]],
);
behavior(
  {
    id: "image-gallery-click",
    name: "ImageGallery · open and close real modal",
    source: serialize(base("ImageGallery")),
    coverage: ["ImageGallery"],
    deliveries: ["instant", "stream"],
    steps: [
      { op: "click", selector: ".openui-gallery__image" },
      {
        op: "checkpoint",
        assertions: [
          {
            id: "ImageGallery.open",
            kind: "count",
            role: "dialog",
            expected: 1,
          },
        ],
      },
      { op: "click", role: "button", name: "Close gallery" },
    ],
    assertions: [
      { id: "ImageGallery.closed", kind: "count", role: "dialog", expected: 0 },
    ],
  },
  [[["ImageGallery"], ["actions"]]],
);
behavior(
  {
    id: "image-gallery-keyboard",
    name: "ImageGallery · keyboard opener contract",
    source: serialize(base("ImageGallery")),
    coverage: ["ImageGallery"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "key", selector: ".openui-gallery__image", key: "Enter" }],
    assertions: [
      {
        id: "ImageGallery.keyboard-open",
        kind: "count",
        role: "dialog",
        expected: 1,
      },
    ],
  },
  [[["ImageGallery"], ["keyboard"]]],
);
behavior(
  {
    id: "list-item-click-action",
    name: "ListItem · click exact action",
    source:
      'root = Card([ListBlock([ListItem("Bench list", "Local item", null, "Log", @ToAssistant("Bench action"))])])',
    coverage: ["ListBlock", "ListItem"],
    deliveries: ["instant", "stream"],
    steps: [{ op: "click", selector: "[role=button]" }],
    assertions: [
      { id: "ListItem.click-action", kind: "actions", expected: [action] },
    ],
  },
  [[["ListBlock", "ListItem"], ["actions"]]],
);
for (const name of ["ListBlock", "ListItem"])
  bind(
    name,
    "keyboard",
    cases.find((c) => c.id === "list-item-action"),
  );
// Nested public enum values need explicit ledger rows too.
const nestedRecipes = [
  {
    component: "EditableTable",
    property: "columns[].type",
    values: ["text", "number", "date-single", "select", "url"],
    source:
      'root = Card([EditableTable("types",[{type:"text",key:"text",header:"Text"},{type:"number",key:"number",header:"Number"},{type:"date-single",key:"date",header:"Date"},{type:"select",key:"select",header:"Select",options:[{value:"chat",label:"Chat"}]},{type:"url",key:"url",header:"URL"}],[{id:"row",values:["Example",42,"2026-01-15","chat","https://example.test"]}])])',
    assertions: [
      {
        id: "EditableTable.columns",
        kind: "count",
        selector: "th",
        minimum: 5,
      },
      {
        id: "EditableTable.content",
        kind: "text",
        value: "Example",
        expected: true,
      },
    ],
  },
  {
    component: "EntityList",
    property: "rows/header/footer.rightVariant",
    values: ["text", "number"],
    source:
      'root = Card([EntityList([{left:"Text",right:"100",rightVariant:"text"},{left:"Number",right:"200",rightVariant:"number"}],"default",{left:"Header",right:"300",rightVariant:"number"},{left:"Footer",right:"400",rightVariant:"text"})])',
    assertions: [
      {
        id: "EntityList.variant-text",
        kind: "text",
        value: "100",
        expected: true,
      },
      {
        id: "EntityList.variant-number",
        kind: "text",
        value: "200",
        expected: true,
      },
    ],
  },
];
for (const recipe of nestedRecipes) {
  const c = add({
    id: slug(recipe.component) + "-nested-variants",
    name: recipe.component + " · nested " + recipe.property + " variants",
    source: recipe.source,
    coverage: [recipe.component],
    deliveries: ["instant", "stream"],
    assertions: recipe.assertions,
  });
  for (const value of recipe.values)
    ledger
      .find((l) => l.component === recipe.component)
      .checks.push({
        id: recipe.component + "." + recipe.property + "." + value,
        kind: "variant",
        applicable: true,
        cases: [c.id],
        assertions: c.assertions.map((a) => a.id),
      });
}
for (const component of [
  "MetricIndicatorInline",
  "MetricIndicatorWithStrikethrough",
]) {
  const r = base(component);
  const roots = ["up", "down"].map((direction) => {
    const copy = structuredClone(r);
    for (const { node: n } of nodes(copy)) {
      delete n.statementId;
      if (n.typeName === component) n.props.trend = { direction, value: 5 };
    }
    return copy;
  });
  const c = add({
    id: slug(component) + "-trend-directions",
    name: component + " · trend up/down",
    source: serialize(card(roots.flatMap((r) => r.props.children))),
    coverage: [component],
    deliveries: ["instant", "stream"],
    assertions: [
      {
        id: component + ".trend-visible",
        kind: "text",
        value: "5%",
        expected: true,
      },
    ],
  });
  for (const value of ["up", "down"])
    ledger
      .find((l) => l.component === component)
      .checks.push({
        id: component + ".trend.direction." + value,
        kind: "variant",
        applicable: true,
        cases: [c.id],
        assertions: c.assertions.map((a) => a.id),
      });
}

add({
  id: "horizontal-callback-known",
  name: "HorizontalBarChart · inherited unwired onClick",
  source:
    'Public React fixture: HorizontalBarChart({data:[{category:"A",value:4},{category:"B",value:7}],categoryKey:"category",dataKeys:["value"],height:260,fitLegendInHeight:false,onClick:recordDatum})',
  coverage: ["HorizontalBarChart"],
  deliveries: ["instant"],
  setup: {
    directHorizontal: {
      height: 260,
      fitLegendInHeight: false,
      parentHeight: 300,
    },
  },
  steps: [{ op: "click", selector: ".openui-horizontal-bar-chart-bar" }],
  assertions: [
    { id: "HorizontalBarChart.callback", kind: "actionCount", expected: 1 },
  ],
  knownIssues: [
    {
      id: "inherited-horizontal-click-unwired",
      assertionIds: ["HorizontalBarChart.callback"],
      actual: [0, 0],
      sourceProof:
        "Both HorizontalBar implementations accept onClick in props but do not forward it to the bar painter.",
      environments: [
        "plain",
        "tailwind3-before",
        "tailwind3-after",
        "tailwind4-before",
        "tailwind4-after",
      ],
      reproduction:
        "Click an actual .openui-horizontal-bar-chart-bar path; expected callback count1, actual0 in both.",
    },
  ],
});
add({
  id: "horizontal-string-height-known",
  name: "HorizontalBarChart · inherited string-height / fitting-legend feedback",
  source:
    'Public React fixture: HorizontalBarChart({height:"100%",fitLegendInHeight:true,data:[{category:"A",value:4},{category:"B",value:7}],categoryKey:"category",dataKeys:["value"]}) inside a300px app container',
  coverage: ["HorizontalBarChart"],
  deliveries: ["instant"],
  setup: {
    directHorizontal: {
      height: "100%",
      fitLegendInHeight: true,
      parentHeight: 300,
    },
  },
  assertions: [
    {
      id: "HorizontalBarChart.height-stable",
      kind: "stableHeight",
      selector: ".openui-horizontal-bar-chart-container",
      expected: true,
    },
  ],
  knownIssues: [
    {
      id: "inherited-horizontal-string-height-feedback",
      assertionIds: ["HorizontalBarChart.height-stable"],
      actual: [false, false],
      sourceProof:
        "Existing string-height + fitLegendInHeight measurement feedback is explicitly retained. Heights must remain positive and exactly stable across12 animation frames.",
      environments: [
        "plain",
        "tailwind3-before",
        "tailwind3-after",
        "tailwind4-before",
        "tailwind4-after",
      ],
      reproduction:
        "Use the recorded public string-height/legend props, inspect raw12-frame height samples. No production workaround applied.",
    },
  ],
});
add({
  id: "shared-session-controls",
  name: "Shared session · Stop, Replay, modes, drafts, actions and stale fencing",
  source: demoSource,
  coverage: [],
  deliveries: ["instant", "stream"],
  setup: {
    sharedSession: true,
    journeySteps: [
      "Render atlas with selected delivery",
      "Keep drafts independent",
      "Submit exact values from each pane",
      "Stop partial stream",
      "Replay immutable source without generation",
      "Reject wrong window source",
      "Switch away during active playback",
      "Reject prior view action after reset",
    ],
  },
  assertions: [
    "identical-source",
    "independent-draft",
    "exact-payloads",
    "local-log-panes",
    "stop-retains-partial",
    "immutable-replay",
    "wrong-source-rejected",
    "mode-cancels-source",
    "stale-action-rejected",
  ].map((id) => ({ id: "session." + id, kind: "session", expected: true })),
});
// Streaming-disabled assertions are independent of visual parity and run while a complete valid source is still streaming.
for (const l of ledger)
  if (
    l.checks.find((c) => c.kind === "disabled")?.applicable &&
    !direct.has(l.component)
  ) {
    const c =
      cases.find((c) => c.id === slug(l.component) + "-default") ??
      cases.find((c) => c.coverage.includes(l.component));
    if (c?.deliveries.includes("stream")) {
      c.streamingAssertions ??= [];
      c.streamingAssertions.push({
        id: l.component + ".stream-disabled",
        kind: "allDisabled",
        selector:
          {
            Input: "input:not([type=hidden])",
            TextArea: "textarea",
            Select: "[role=combobox]",
            DatePicker: ".openui-date-picker-renderer-floating-input-container",
            Slider: "[role=slider]",
            CheckBoxGroup: "[role=checkbox]",
            CheckBoxItem: "[role=checkbox]",
            RadioGroup: "[role=radio]",
            RadioItem: "[role=radio]",
            Chips: "[role=option]",
            ChipItem: "[role=option]",
            OptionCards: "[role=radio],[role=checkbox]",
            OptionCard: "[role=radio],[role=checkbox]",
          }[l.component] ?? "button",
        expected: true,
      });
      const check = l.checks.find((x) => x.kind === "disabled");
      check.cases = [c.id];
      check.assertions = [l.component + ".stream-disabled"];
      check.reason =
        "Actual disabled controls asserted before stream completion.";
    }
  }

for (const c of cases) {
  const root = parser.parse(c.source).root;
  const missing = nodes(root)
    .filter(
      ({ node: n }) =>
        n.typeName === "FormControl" &&
        [
          "TextArea",
          "Select",
          "DatePicker",
          "Slider",
          "CheckBoxGroup",
          "RadioGroup",
          "Chips",
          "OptionCards",
        ].includes(n.props.input?.typeName),
    )
    .map(({ node: n }) => ({
      tag: "LABEL",
      attribute: "for",
      target: n.props.input.props.name,
    }));
  if (missing.length)
    c.knownIssues.push({
      id: "inherited-form-control-label-target",
      assertionIds: ["aria-references-resolve"],
      actual: [missing, missing],
      sourceProof:
        "Both FormControl implementations set htmlFor=input.name; these registry adapters do not pass that id to their rendered control/group.",
      affectedCases: [c.id],
      environments: c.environments,
      reproduction:
        "Run " +
        c.id +
        "; inspect label[for] and document.getElementById(for). No production fix applied.",
    });
  if (c.id === "list-item-action")
    c.knownIssues.push({
      id: "inherited-list-item-enter-unwired",
      assertionIds: ["ListItem.action"],
      actual: [[], []],
      sourceProof:
        "Both ListItem implementations expose role=button/tabIndex=0 and onClick but no keyboard handler.",
      affectedCases: [c.id],
      environments: c.environments,
      reproduction:
        "Focus the actionable list item and press Enter; click remains a separate check.",
    });
  if (c.id === "date-picker-keyboard")
    c.knownIssues.push({
      id: "inherited-datepicker-non-keyboard-trigger",
      assertionIds: ["DatePicker.open"],
      actual: [0, 0],
      sourceProof:
        "Both FloatingDateInput render a click-only div without role/tabIndex/onKeyDown; Enter cannot open the calendar.",
      affectedCases: [c.id],
      environments: c.environments,
      reproduction:
        "Focus/press Enter on .openui-date-picker-renderer-floating-input-container.",
    });
  if (c.streamingAssertions?.some((a) => a.id === "DatePicker.stream-disabled"))
    c.knownIssues.push({
      id: "inherited-datepicker-not-disabled-by-renderer",
      assertionIds: ["DatePicker.stream-disabled"],
      actual: [false, false],
      sourceProof:
        "The DatePicker adapter does not forward a disabled prop; its click-only trigger is not disabled during Renderer streaming.",
      affectedCases: [c.id],
      environments: c.environments,
      reproduction:
        "Run the full-source streaming checkpoint and inspect the date picker trigger.",
    });
  if (c.id === "image-gallery-keyboard")
    c.knownIssues.push({
      id: "inherited-gallery-opener-not-keyboard",
      assertionIds: ["ImageGallery.keyboard-open"],
      actual: [0, 0],
      sourceProof:
        "Both gallery grid image wrappers are click-only divs without role/tabIndex/onKeyDown.",
      affectedCases: [c.id],
      environments: c.environments,
      reproduction:
        "Press Enter on the grid image wrapper; click is covered separately.",
    });
}
// Confirmed inherited missing-name signatures. Other accessibility failures stay Fail.
const inheritedUnnamed = {
  "slider-variants": {
    actual: ["INPUT:"],
    proof:
      "Both SliderBlock ValueInput implementations render a text Input without id, associated label or aria-label.",
  },
  "carousel-default": {
    actual: ["BUTTON:"],
    proof:
      "Both CarouselNext implementations render IconButton without children or aria-label; the chat adapter supplies neither.",
  },
  "carousel-variants": {
    actual: ["BUTTON:", "BUTTON:"],
    proof:
      "Both CarouselNext implementations render IconButton without children or aria-label; the two variant parents supply neither.",
  },
  "carousel-scroll": {
    actual: ["BUTTON:"],
    proof:
      "Both Carousel next/previous buttons receive no accessible name from the default chat composition.",
  },
  "button-empty-content": {
    actual: ["BUTTON:"],
    proof:
      "Both Button implementations preserve the explicitly empty public label without inventing an accessible fallback.",
  },
  "follow-up-item-empty-content": {
    actual: ["BUTTON:", "BUTTON:"],
    proof:
      "Both FollowUpItem implementations render each explicitly empty text value as an unnamed button.",
  },
  "accordion-item-empty-content": {
    actual: ["BUTTON:", "BUTTON:", "BUTTON:"],
    proof:
      "Both AccordionItem implementations pass the explicitly empty trigger strings to the Radix button.",
  },
  "icon-button-empty-label": {
    actual: ["BUTTON:"],
    proof:
      "Both IconButton adapters preserve the explicitly empty ariaLabel; the icon has no textual accessible name.",
  },
};
for (const c of cases) {
  const issue = inheritedUnnamed[c.id];
  if (issue)
    c.knownIssues.push({
      id: "inherited-unnamed-control-" + c.id,
      assertionIds: ["interactive-accessible-names"],
      actual: [issue.actual, issue.actual],
      sourceProof: issue.proof,
      affectedCases: [c.id],
      environments: c.environments,
      reproduction:
        "Run " +
        c.id +
        " and inspect the recorded exact unnamed-control list in each installed artifact. Extra or changed failures remain Fail.",
    });
}
for (const c of cases) {
  const result = parser.parse(c.source);
  if (
    !c.setup.directHorizontal &&
    (result.meta.errors.length ||
      result.meta.unresolved.length ||
      result.meta.orphaned.length)
  )
    throw Error(c.id + ": " + JSON.stringify(result.meta));
  c.version = createHash("sha256")
    .update(JSON.stringify({ ...c, version: undefined }))
    .digest("hex");
}
await fs.writeFile("bench/cases.json", JSON.stringify(cases, null, 2) + "\n");
await fs.writeFile(
  "bench/checklist.json",
  JSON.stringify(ledger, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      cases: cases.length,
      components: ledger.length,
      checks: ledger.reduce((n, l) => n + l.checks.length, 0),
      notImplemented: ledger.flatMap((l) =>
        l.checks
          .filter((c) => c.applicable && !c.cases.length)
          .map((c) => c.id),
      ),
    },
    null,
    2,
  ),
);
