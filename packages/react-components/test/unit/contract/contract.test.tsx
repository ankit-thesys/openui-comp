// Guards the styling contract for every migrated component, at the Node seam: rendered through
// public exports, its CSS stays within the selector budget and its classes follow the grammar and
// match its documented stable names exactly, in default mode and in layer mode.
import { ThemeProvider } from "@openuidev/react-components";
import { describe, expect, it } from "vitest";
import { classViolation, selectorViolation, selectorsOf } from "./checks";
import { blocksIn, namesIn, renderAndCollect, stableClassesIn } from "./collect";
import { migratedComponents } from "./components";

describe.each(migratedComponents)("$folder", ({ names, elements }) => {
  const { html, css } = renderAndCollect(elements());

  it("registers its CSS when it renders", () => {
    expect(selectorsOf(css).length).toBeGreaterThan(0);
  });

  it("keeps every selector within one class plus one state", () => {
    const violations = selectorsOf(css)
      .map((selector) => [selector, selectorViolation(selector)] as const)
      .filter(([, reason]) => reason !== null)
      .map(([selector, reason]) => `${selector}: ${reason}`);
    expect(violations).toEqual([]);
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

  it("keeps the same selectors and classes in layer mode, inside the layer", () => {
    const layered = renderAndCollect(
      elements().map((element, key) => (
        <ThemeProvider key={key} cssLayer="openui">
          {element}
        </ThemeProvider>
      )),
    );
    const generic = (selector: string) => selector.replace(/\bgo\d+\b/g, "go");
    expect(layered.css).toMatch(/^@layer openui\{/);
    expect(selectorsOf(layered.css).map(generic).sort()).toEqual(
      selectorsOf(css).map(generic).sort(),
    );
    expect([...stableClassesIn(layered.html)].sort()).toEqual([...stableClassesIn(html)].sort());
  });
});
