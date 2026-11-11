import { Bars } from "../comparison/bars";
import { comparisonStyles } from "../comparison/comparisonStyles";
import { Intervals } from "../comparison/intervals";
import { Leaderboard } from "../comparison/leaderboard";
import { Distribution, Dumbbell } from "../comparison/specialized";
import type { Group } from "./group";

// Bars takes Series and Reference, which the Trends group registers.
export const comparison: Group = {
  components: [Bars, Leaderboard, Dumbbell, Distribution, Intervals],
  styles: [comparisonStyles],
};
