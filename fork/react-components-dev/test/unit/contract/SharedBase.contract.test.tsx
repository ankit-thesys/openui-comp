// Shared border-box opt-in, through public server rendering of its three users. Run after build:
// pnpm test test/unit/contract/SharedBase.contract.test.tsx
// Buttons and FormControl now own flat rules too (#91); isolate the class shared by all roots.
import { configureStyles, getComponentStyles, ThemeProvider } from "@openuidev/react-components";
import { afterEach, expect, it } from "vitest";
import { classViolation, rulesOf, ruleViolation } from "./checks";
import { blocksIn, namesIn, renderAndCollect, stableClassesIn } from "./collect";
import { sharedBaseConsumers, sharedStyleContracts } from "./components";

afterEach(() => configureStyles({ layer: undefined }));

const importedCss = getComponentStyles();

it("does not register the shared rule at import", () => {
  expect(importedCss).not.toContain(".openui-border-box");
});

it("registers a flat border-box rule on the three opted-in roots when they render", () => {
  const { html, css } = renderAndCollect(sharedBaseConsumers.map(({ element }) => element));
  expect(css).toContain("box-sizing:border-box");
  const rules = sharedRules(html, css);
  expect(rules).toHaveLength(1);
  expect(rules.map((rule) => ruleViolation(rule, ""))).toEqual([null]);
  const rootClasses = [...html.matchAll(/<div class="([^"]+)"/g)].map((match) =>
    match[1]!.split(" "),
  );
  // Each root has the shared stable class and the generated class whose rule we collected.
  expect(rootClasses).toHaveLength(3);
  for (const classes of rootClasses) {
    expect(classes).toContain("openui-border-box");
    expect(classes).toContain(rules[0]!.selector.slice(1));
  }
  const documented = sharedStyleContracts.find(({ folder }) => folder === "SharedBase")!.names;
  const emitted = [...stableClassesIn(html)].filter((name) => name === "openui-border-box");
  expect([...namesIn(documented)]).toEqual(emitted);
  expect(emitted.map((name) => classViolation(name, blocksIn(documented)))).toEqual([null]);
});

it("registers the same root-only rule in the app-wide layer", () => {
  configureStyles({ layer: "openui" });
  const { html, css } = renderAndCollect(
    sharedBaseConsumers.map(({ element }, key) => (
      <ThemeProvider key={key}>{element}</ThemeProvider>
    )),
  );
  expect(css).toContain("box-sizing:border-box");
  const rules = sharedRules(html, css);
  expect(rules).toHaveLength(1);
  expect(rules.map((rule) => ruleViolation(rule, "openui"))).toEqual([null]);
  expect(html.match(/openui-border-box/g)).toHaveLength(3);
});

// #91 and #96 migrate the three consumers' owned layout as well. Collect the rule on the generated class
// shared by all three public roots, keeping this contract focused on the shared helper.
function sharedRules(html: string, css: string) {
  const roots = [...html.matchAll(/<div class="([^"]+)"/g)].map((match) => match[1]!.split(" "));
  const common = roots[0]!.filter(
    (name) => /^go\d+$/.test(name) && roots.every((classes) => classes.includes(name)),
  );
  return rulesOf(css).filter((rule) => common.some((name) => rule.selector === `.${name}`));
}
