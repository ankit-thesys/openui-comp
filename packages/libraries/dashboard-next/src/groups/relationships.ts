import { Reference } from "../relationships/chartHelpers";
import { Cohorts, Heatmap } from "../relationships/grids";
import { Scatter } from "../relationships/scatter";
import { relationshipsStyles } from "../relationships/styles";
import type { Group } from "./group";
import { trends } from "./trends";

/** Relationships (#224). Reference is shared with trends; keep Scatter usable on its own. */
export const relationships: Group = {
  components: [
    Scatter,
    Heatmap,
    Cohorts,
    ...(trends.components.some((component) => component.name === "Reference") ? [] : [Reference]),
  ],
  styles: [relationshipsStyles],
};
