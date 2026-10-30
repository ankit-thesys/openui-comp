// Guards the styling contract for one migrated component, at the Node seam: rendered through
// public exports, its CSS stays within the selector budget and its classes follow the grammar and
// match its documented stable names exactly. With `configureStyles({ layer: "openui" })` every rule
// sits in that layer with the same shapes, and nothing else changes.
//
// Each component runs in its own `<folder>.contract.test.tsx` file. Collection uses the classes in
// its rendered markup, so prior registration by another component cannot hide its rules.
import { configureStyles, getComponentStyles, ThemeProvider } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { classViolation, rulesOf, ruleViolation, selectorsOf } from "./checks";
import {
  blocksIn,
  cssFor,
  generatedClassesOn,
  namesIn,
  renderAndCollect,
  stableClassesIn,
} from "./collect";
import { migratedComponents, type MigratedComponent } from "./components";

export function describeContract(
  folder: string,
  component?: MigratedComponent,
  render = renderToString,
) {
  const entry = component ?? migratedComponents.find((component) => component.folder === folder);
  if (!entry) throw new Error(`${folder} is not in test/unit/contract/components.tsx.`);
  const { elements, clientOnly = [] } = entry;
  describe(folder, () => {
    configureStyles({ layer: "openui" });
    const beforeLayered = getComponentStyles();
    configureStyles({ layer: undefined });
    const { html, css } = renderAndCollect(elements(), render);
    configureStyles({ layer: "openui" });
    let layered: ReturnType<typeof renderAndCollect>;
    try {
      layered = renderAndCollect(
        elements().map((element, key) => <ThemeProvider key={key}>{element}</ThemeProvider>),
        render,
      );
      // Retain the first render's client-only registration delta in both modes. The factory
      // cache is now shared, so the second render does not register those rules again.
      layered.css = cssFor(layered.html, getComponentStyles(), beforeLayered);
    } finally {
      configureStyles({ layer: undefined });
    }
    // MarkDownRenderer's prose rules weigh its root's generated class plus a tag. A family that
    // composes it carries them, so they are credited to it by the generated classes it puts on its
    // own root in each mode, across every look its contract entry renders. Rendered after both
    // collections, so nothing here reaches `css`.
    const markdownLooks = migratedComponents
      .find((component) => component.folder === "MarkDownRenderer")!
      .elements();
    const proseRoots = generatedClassesOn(
      renderToString(<>{markdownLooks}</>),
      "openui-markdown-renderer",
    );
    const violationsIn = (sheet: string, layer: "" | "openui") =>
      rulesOf(sheet)
        .map(
          (rule) => [rule, ruleViolation(rule, layer, { prose: entry.prose, proseRoots })] as const,
        )
        .filter(([, reason]) => reason !== null)
        .map(([rule, reason]) => `${rule.selector}: ${reason}`);

    it("registers its CSS when it renders", () => {
      expect(selectorsOf(css).length).toBeGreaterThan(0);
    });

    it("keeps every selector unlayered and within one class plus one state", () => {
      expect(violationsIn(css, "")).toEqual([]);
    });

    it("renders only stable classes that follow the naming grammar", () => {
      const blocks = blocksIn(entry.names);
      const violations = [...stableClassesIn(html)]
        .map((name) => [name, classViolation(name, blocks)] as const)
        .filter(([, reason]) => reason !== null)
        .map(([name, reason]) => `${name}: ${reason}`);
      expect(violations).toEqual([]);
    });

    it("renders exactly its documented stable classes", () => {
      const serverRendered = [...namesIn(entry.names)].filter((name) => !clientOnly.includes(name));
      expect([...stableClassesIn(html)].sort()).toEqual(serverRendered.sort());
    });

    it("puts every rule in the openui layer in layer mode, within the same budget", () => {
      expect(selectorsOf(layered.css).length).toBeGreaterThan(0);
      expect(violationsIn(layered.css, "openui")).toEqual([]);
    });

    it("keeps the same selector shapes and stable classes in layer mode", () => {
      expect(selectorsOf(layered.css).sort()).toEqual(selectorsOf(css).sort());
      expect([...stableClassesIn(layered.html)].sort()).toEqual([...stableClassesIn(html)].sort());
    });
  });
}
