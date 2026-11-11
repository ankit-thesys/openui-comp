import { Bars, Reference, Series } from "../comparison/bars";
import { comparisonStyles } from "../comparison/comparisonStyles";
import { Intervals } from "../comparison/intervals";
import { Leaderboard } from "../comparison/leaderboard";
import { Distribution, Dumbbell } from "../comparison/specialized";
import type { Group } from "./group";

// Bars needs these data nodes even when the trends group has not landed.
// The copied Series and Reference definitions match the source API exactly.
export const comparison: Group = {
  components: [Bars, Leaderboard, Dumbbell, Distribution, Intervals, Series, Reference],
  styles: [comparisonStyles],
};
