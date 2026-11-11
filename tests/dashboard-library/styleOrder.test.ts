import { expect, test } from "vitest";
import "../../packages/libraries/dashboard/src/index";
import { STYLE_ORDER, styleClasses } from "../../packages/libraries/dashboard/src/lib/styles";

/*
 * Pins the dashboard's CSS: which blocks exist, the bytes of each, and the order they reach the
 * page. goober names a block's class from a hash of its text, so an unchanged class means
 * unchanged CSS. Rules of equal specificity rely on the order, and it used to follow the order
 * modules happened to be imported in. These values are the ones the port shipped with (PR #228).
 * A restructure must not change them; a deliberate CSS change updates the block's class here.
 */
const SHIPPED = [
  ["comparison", "go2677475604"],
  ["composition", "go290533077"],
  ["shared", "go1947732956"],
  ["filters", "go2198865133"],
  ["maps", "go1610056580"],
  ["kpi", "go528443158"],
  ["stat", "go546751485"],
  ["relationships", "go3765444775"],
  ["goal", "go80456338"],
  ["keyValues", "go4128638916"],
  ["table", "go3389997748"],
  ["trends", "go443410021"],
  ["structure", "go3927328040"],
] as const;

test("every style block has the bytes it shipped with", () => {
  expect(STYLE_ORDER.map((name) => [name, styleClasses[name]])).toEqual(SHIPPED);
});

test("style blocks reach the page in the shipped order", () => {
  const store = (globalThis as unknown as Record<symbol, { rules: string }>)[
    Symbol.for("@openuidev/react-components/styles")
  ]!;
  const positions = SHIPPED.map(([, className]) => store.rules.indexOf(`.${className}`));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
});
