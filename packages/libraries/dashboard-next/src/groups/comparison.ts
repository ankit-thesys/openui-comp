import { Bars, Reference, Series } from "../comparison/bars";
import { comparisonStyles } from "../comparison/comparisonStyles";
import { Intervals } from "../comparison/intervals";
import { Leaderboard } from "../comparison/leaderboard";
import { Distribution, Dumbbell } from "../comparison/specialized";
import type { Group } from "./group";
import { trends } from "./trends";

// Bars takes Series and Reference, which the Trends group owns (#221). Until Trends registers
// them, this group registers its copies (the same definitions as his charts.tsx); once it does,
// the copies drop out, so each name is registered once.
export function comparisonGroup(registeredByTrends: ReadonlySet<string>): Group {
  const borrowed = [Series, Reference].filter(
    (component) => !registeredByTrends.has(component.name),
  );
  return {
    components: [Bars, Leaderboard, Dumbbell, Distribution, Intervals, ...borrowed],
    styles: [comparisonStyles],
  };
}

export const comparison = comparisonGroup(
  new Set(trends.components.map((component) => component.name)),
);
