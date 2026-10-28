// Guards the styling contract for every migrated component, at the Node seam: rendered through
// public exports, its CSS stays within the selector budget and its classes follow the grammar and
// match its documented stable names exactly. Under `<ThemeProvider cssLayer="openui">` every rule
// sits in that layer with the same shapes, and nothing else changes.
import { ThemeProvider } from "@openuidev/react-components";
import { describe, expect, it } from "vitest";
import { classViolation, ruleViolation, rulesOf, selectorsOf } from "./checks";
import { blocksIn, namesIn, renderAndCollect, stableClassesIn } from "./collect";
import { migratedComponents } from "./components";

describe.each(migratedComponents)("$folder", ({ names, elements }) => {
  const { html, css } = renderAndCollect(elements());
  const layered = renderAndCollect(
    elements().map((element, key) => (
      <ThemeProvider key={key} cssLayer="openui">
        {element}
      </ThemeProvider>
    )),
  );
  const violationsIn = (sheet: string, layer: string) =>
    rulesOf(sheet)
      .map((rule) => [rule, ruleViolation(rule, layer)] as const)
      .filter(([, reason]) => reason !== null)
      .map(([rule, reason]) => `${rule.selector}: ${reason}`);

  it("registers its CSS when it renders", () => {
    expect(selectorsOf(css).length).toBeGreaterThan(0);
  });

  it("keeps every selector unlayered and within one class plus one state", () => {
    expect(violationsIn(css, "")).toEqual([]);
  });

  it("renders only stable classes that follow the naming grammar", () => {
    const blocks = blocksIn(names);
    const violations = [...stableClassesIn(html)]
      .map((name) => [name, classViolation(name, blocks)] as const)
      .filter(([, reason]) => reason !== null)
      .map(([name, reason]) => `${name}: ${reason}`);
    expect(violations).toEqual([]);
  });

  it("renders exactly its documented stable classes", () => {
    expect([...stableClassesIn(html)].sort()).toEqual([...namesIn(names)].sort());
  });

  it("puts every rule in the openui layer in layer mode, within the same budget", () => {
    expect(selectorsOf(layered.css).length).toBeGreaterThan(0);
    expect(violationsIn(layered.css, "openui")).toEqual([]);
  });

  it("keeps the same selector shapes and stable classes in layer mode", () => {
    const generic = (selector: string) => selector.replace(/\bgo\d+\b/g, "go");
    expect(selectorsOf(layered.css).map(generic).sort()).toEqual(
      selectorsOf(css).map(generic).sort(),
    );
    expect([...stableClassesIn(layered.html)].sort()).toEqual([...stableClassesIn(html)].sort());
  });
});
