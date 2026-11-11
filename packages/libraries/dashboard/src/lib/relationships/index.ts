import { Cohorts, Heatmap } from "../../relationships/grids";
import { Scatter } from "../../relationships/scatter";
import { relationshipsStyles } from "../../relationships/styles";
import type { Group } from "../group";

/** Relationships (#224). Scatter's references use the Reference Trends registers. */
export const relationships: Group = {
  components: [Scatter, Heatmap, Cohorts],
  styles: { relationships: relationshipsStyles },
};
