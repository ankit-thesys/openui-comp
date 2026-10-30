// The snapshot keeps an order pair only where both classes set an overlapping property. A pair
// whose rules can reset each other must stay, or a real cascade change would compare equal.
import { describe, expect, it } from "vitest";
import { comparable, type DeclarationRule, type Snapshot } from "../css-snapshot/snapshot";

const rule = (...declarations: string[]): DeclarationRule => ({
  selector: ".x",
  conditions: [],
  declarations,
});

// The order line kept for classes `a < b` of one module, or none.
const kept = (a: string[], b: string[]) =>
  comparable<Snapshot>({
    markup: [],
    rules: { a: [rule(...a)], b: [rule(...b)] },
    order: ["module: a < b"],
  }).order;

describe("snapshot order pairs", () => {
  it.each([
    ["padding-top: 1px", "padding: 2px"],
    ["border-color: red", "border: 1px solid"],
    ["background-color: red", "background: none"],
    ["font-size: 12px", "font: 14px serif"],
    ["line-height: 1", "font: 14px/2 serif"],
    ["margin-left: 1px", "margin-inline: 2px"],
    ["top: 0", "inset: 1px"],
    ["left: 0", "inset-inline-start: 1px"],
    ["align-items: center", "place-items: start"],
    ["justify-content: center", "place-content: start"],
    ["row-gap: 1px", "gap: 2px"],
    ["column-gap: 1px", "grid-gap: 2px"],
    ["column-count: 2", "columns: 3"],
    ["width: 1px", "inline-size: 2px"],
    ["height: 1px", "block-size: 2px"],
    ["overflow-wrap: anywhere", "word-wrap: normal"],
    ["text-wrap-mode: wrap", "white-space: nowrap"],
    ["-webkit-mask: none", "mask-image: none"],
    ["color: red", "all: unset"],
    ["--x: 1", "--x: 2"],
  ])("keeps %s against %s", (a, b) => {
    expect(kept([a], [b])).toEqual(["module: a < b"]);
    expect(kept([b], [a])).toEqual(["module: a < b"]);
  });

  it.each([
    ["color: red", "padding: 1px"],
    ["--x: 1", "all: unset"],
    ["--x: 1", "--y: 2"],
  ])("drops %s against %s, which cannot reset each other", (a, b) => {
    expect(kept([a], [b])).toEqual([]);
  });
});
