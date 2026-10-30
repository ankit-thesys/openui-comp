import type { LayerSnapshot, Snapshot } from "./snapshot";

// #134: Goober reused these tone bodies from Tag, IconTag, CodeBlock, TextCallout and
// MetricIndicator. Their first registrant could put the tone before TextBlock's secondary base.
// The tone prop must win deterministically. Only these exact order reversals are authorized;
// declarations, markup and every other order pair still compare against the recorded baseline.
export const intentionalChanges = {
  TextBlock: {
    "openui-text-block-secondary#0": {
      reason: "#134: the positive secondary tone must follow the base secondary colour",
      module: "TextBlock/textBlock.styles.mjs",
      base: "openui-inline-markdown-renderer+openui-text-block-secondary#0",
    },
    "openui-text-block-secondary#1": {
      reason: "#134: the negative secondary tone must follow the base secondary colour",
      module: "TextBlock/textBlock.styles.mjs",
      base: "openui-inline-markdown-renderer+openui-text-block-secondary#0",
    },
  },
} as const;

/** Apply the documented changes to expected data, never to the current capture or baseline file. */
export function expectedWithIntentionalChanges<T extends Snapshot | LayerSnapshot>(
  component: string,
  expected: T,
): T {
  if (component !== "TextBlock") return expected;
  const order = expected.order.map((entry) => {
    for (const [alias, { module, base }] of Object.entries(intentionalChanges.TextBlock)) {
      if (entry === `${module}: ${alias} < ${base}`) return `${module}: ${base} < ${alias}`;
    }
    return entry;
  });
  return { ...expected, order: order.sort() };
}
