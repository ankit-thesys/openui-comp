import { css } from "@openuidev/react-components";
import { sharedStyles } from "../components/shared/styles";
import { structureStyles } from "../components/structure/styles";
import { groups } from "./registeredGroups";

/*
 * The one place the dashboard's CSS is compiled. Rules reach the page in the order css() is
 * called, and equal-specificity rules rely on that order, so it is written out here instead of
 * being left to the order modules happen to be imported in. This is the order the port shipped
 * with; tests/dashboard-library/styleOrder.test.ts pins it and the bytes of every block.
 */
export const STYLE_ORDER = [
  "comparison",
  "composition",
  "shared",
  "filters",
  "maps",
  "kpi",
  "stat",
  "relationships",
  "goal",
  "keyValues",
  "table",
  "trends",
  "structure",
] as const;

const blocks: Record<string, string> = Object.assign(
  { structure: structureStyles, shared: sharedStyles },
  ...groups.map((group) => group.styles),
);

const unknown = Object.keys(blocks).filter((name) => !STYLE_ORDER.includes(name as never));
const missing = STYLE_ORDER.filter((name) => blocks[name] === undefined);
if (unknown.length || missing.length) {
  throw new Error(
    `Dashboard style blocks do not match STYLE_ORDER (unknown: ${unknown.join(", ") || "none"}; missing: ${missing.join(", ") || "none"}).`,
  );
}

/** Each block's class, by block name. */
export const styleClasses: Record<string, string> = Object.fromEntries(
  STYLE_ORDER.map((name) => [name, css(blocks[name]!)]),
);
