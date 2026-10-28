// Guards the styling contract for every migrated component, at the Node seam: rendered through
// public exports, its CSS stays within the selector budget and its classes follow the grammar and
// match its documented stable names exactly.
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
});
