// #134's sole intentional snapshot change must not exempt a component or rule from comparison.
import { expect, it } from "vitest";
import { expectedWithIntentionalChanges } from "../css-snapshot/intentional-changes";
import type { Snapshot } from "../css-snapshot/snapshot";

const baseline: Snapshot = {
  markup: ['<span class="openui-text-block-secondary">Details</span>'],
  rules: {
    "openui-text-block-secondary#0": [
      {
        selector: ".openui-text-block-secondary#0",
        conditions: [],
        declarations: ["color:var(--openui-text-success-primary, oklch(0.448 0.108 151.328 / 1))"],
      },
    ],
  },
  order: [
    "TextBlock/textBlock.styles.mjs: openui-text-block-secondary#0 < openui-inline-markdown-renderer+openui-text-block-secondary#0",
    "TextBlock/textBlock.styles.mjs: openui-text-block-secondary#1 < openui-inline-markdown-renderer+openui-text-block-secondary#0",
    "TextBlock/textBlock.styles.mjs: openui-text-block#0 < openui-text-block#3",
  ],
};

it("expects only the approved TextBlock tone reversals, retaining declarations, markup and other order", () => {
  const expected = expectedWithIntentionalChanges("TextBlock", baseline);
  expect(expected.order).toEqual([
    "TextBlock/textBlock.styles.mjs: openui-inline-markdown-renderer+openui-text-block-secondary#0 < openui-text-block-secondary#0",
    "TextBlock/textBlock.styles.mjs: openui-inline-markdown-renderer+openui-text-block-secondary#0 < openui-text-block-secondary#1",
    "TextBlock/textBlock.styles.mjs: openui-text-block#0 < openui-text-block#3",
  ]);
  expect(expected.rules).toBe(baseline.rules);
  expect(expected.markup).toBe(baseline.markup);
  expect(baseline.order[0]).toBe(
    "TextBlock/textBlock.styles.mjs: openui-text-block-secondary#0 < openui-inline-markdown-renderer+openui-text-block-secondary#0",
  );
});

it("does not authorize the same aliases in another component", () => {
  expect(expectedWithIntentionalChanges("IconText", baseline)).toBe(baseline);
});

it("fails when a listed reversal matches no baseline entry, so a stale excuse cannot linger", () => {
  expect(() =>
    expectedWithIntentionalChanges("TextBlock", { ...baseline, order: [baseline.order[2]!] }),
  ).toThrow(/match no baseline order entry/);
});
